#!/usr/bin/env bash
# デプロイの後の確認（verify）：確認用のタスクを ECS で一度だけ動かし、VPC の中からアプリのヘルスチェックを呼ぶ
#   使い方：verify-task.sh <app> <アプリの環境> <ヘルスチェックのパス>   例：verify-task.sh api dev /actuator/health
#   AWS の認証情報（アプリの CI ロール）を設定した後に実行する。web と api で同じファイル（直すときは両方を直す）
#
#   確認用のタスク定義（sandbox-<アプリの環境>-<app>-verify）を登録し、RunTask で起動する
#     イメージ：ECR Public の amazonlinux:2023（curl が入っている。digest で固定）。NAT 経由で取る
#     タスクロールは付けない（AWS のデータに触れない）。SG は確認用（SSM の /products/sandbox/verify/security-group-id）
#     ログ：アプリのロググループの <アプリの環境>-verify/verify/<タスク ID>
#   タスクは http://<アプリの環境>-<app>.sandbox.internal:8080<パス> が "status":"UP" を返すまで、やり直しながら待つ
#   （デプロイの直後は、Cloud Map の名前が新しいタスクを指すまで DNS の TTL の分かかる）
#   タスクが時間内に終わらなければ止めて失敗にする。終了コードが 0 でなければ失敗にする
set -euo pipefail

app="${1:?app（web / api）を指定してください}"
app_env="${2:?アプリの環境を指定してください}"
health_path="${3:?ヘルスチェックのパスを指定してください}"

# 確認用のイメージ（amazonlinux:2023 の multi-arch の digest。ARM64 で動かす）
image="public.ecr.aws/amazonlinux/amazonlinux@sha256:5c6ed3b38335b2aa424a045f1e564c8c508409ead0ff3f8bf5e62c31b94082cb"
# タスクが終わるまで待つ上限（秒）
wait_seconds=600

family="sandbox-${app_env}-${app}-verify"
url="http://${app_env}-${app}.sandbox.internal:8080${health_path}"

get() { aws ssm get-parameter --name "$1" --query Parameter.Value --output text; }
cluster=$(get /products/sandbox/ecs/cluster-name)
execution_role_arn=$(get /products/sandbox/ecs/task-execution-role-arn)
log_group=$(get "/products/sandbox/${app}/log-group-name")
# タスクを置くサブネット（サービスと同じく最初の1つ）
subnet_id=$(get /infra-env/network/private-subnet-ids | cut -d, -f1)
security_group_id=$(get /products/sandbox/verify/security-group-id)

# 6 秒おきに最大 60 回（約6分）。"status":"UP" が返ったら 0 で終える
# shellcheck disable=SC2016 # タスクの中で展開する
script='for i in $(seq 1 60); do
  body=$(curl --silent --show-error --max-time 5 "${URL}" 2>&1 || true)
  if echo "${body}" | grep --quiet "\"status\":\"UP\""; then
    echo "OK ${URL} -> ${body}"
    exit 0
  fi
  echo "待機中（${i}）：${body}"
  sleep 6
done
echo "NG ${URL}"
exit 1'

task_definition=$(jq -n \
  --arg family "${family}" \
  --arg image "${image}" \
  --arg role "${execution_role_arn}" \
  --arg log_group "${log_group}" \
  --arg prefix "${app_env}-verify" \
  --arg url "${url}" \
  --arg script "${script}" \
  '{
    family: $family,
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    runtimePlatform: {cpuArchitecture: "ARM64", operatingSystemFamily: "LINUX"},
    cpu: "256",
    memory: "512",
    executionRoleArn: $role,
    containerDefinitions: [{
      name: "verify",
      image: $image,
      essential: true,
      command: ["sh", "-c", $script],
      environment: [{name: "URL", value: $url}],
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-group": $log_group,
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": $prefix
        }
      }
    }]
  }')

task_definition_arn=$(aws ecs register-task-definition --cli-input-json "${task_definition}" \
  --query 'taskDefinition.taskDefinitionArn' --output text)
echo "確認用のタスク定義：${task_definition_arn##*/}"

# 起動のしかたはクラスターの既定（Fargate Spot）
result=$(aws ecs run-task --cluster "${cluster}" \
  --task-definition "${task_definition_arn}" \
  --network-configuration "awsvpcConfiguration={subnets=[${subnet_id}],securityGroups=[${security_group_id}],assignPublicIp=DISABLED}" \
  --started-by github-actions-verify \
  --output json)
task_arn=$(jq -r '.tasks[0].taskArn // empty' <<<"${result}")
if [ -z "${task_arn}" ]; then
  echo "::error::確認用のタスクを起動できなかった"
  jq '.failures' <<<"${result}"
  exit 1
fi
task_id="${task_arn##*/}"
echo "起動した：${task_id}（${url}）"

# 終わるまで待つ。上限を過ぎたら止める
stopped=false
for _ in $(seq 1 $((wait_seconds / 10))); do
  status=$(aws ecs describe-tasks --cluster "${cluster}" --tasks "${task_arn}" \
    --query 'tasks[0].lastStatus' --output text)
  if [ "${status}" = "STOPPED" ]; then
    stopped=true
    break
  fi
  sleep 10
done
if [ "${stopped}" != "true" ]; then
  echo "::error::${wait_seconds}秒たっても終わらなかったため、止める"
  aws ecs stop-task --cluster "${cluster}" --task "${task_arn}" \
    --reason "github-actions-verify のタイムアウト" --query 'task.lastStatus' --output text
fi

# タスクのログと終了コード
aws logs get-log-events --log-group-name "${log_group}" \
  --log-stream-name "${app_env}-verify/verify/${task_id}" --start-from-head \
  --query 'events[].message' --output text || echo "ログを読めなかった"
task=$(aws ecs describe-tasks --cluster "${cluster}" --tasks "${task_arn}" --output json)
exit_code=$(jq -r '.tasks[0].containers[] | select(.name == "verify") | .exitCode // empty' <<<"${task}")
echo "終了コード：${exit_code:-無し}（$(jq -r '.tasks[0].stoppedReason // ""' <<<"${task}")）"
if [ "${exit_code}" != "0" ]; then
  echo "::error::ヘルスチェックに失敗した：${url}"
  exit 1
fi
echo "ヘルスチェックが通った：${url}"
