// サービスの定義
//   CI が環境変数で渡す値
//     CLOUD_MAP_SERVICE_ARN … Cloud Map のサービス（<アプリの環境>-web。CI が AWS CLI で作る）
//     TARGET_GROUP_ARN      … ALB のターゲットグループ（SSM の /products/sandbox/web/target-group-arn。stg / prod だけ。無ければ空）
local must_env = std.native('must_env');
local ssm = std.native('ssm');
local ssm_list = std.native('ssm_list');
local env = std.native('env');

local targetGroupArn = env('TARGET_GROUP_ARN', '');

{
  // 起動のしかた（容量プロバイダー）は指定せず、クラスターの既定（Fargate Spot）に従う（aws-infra-env が決める）
  platformVersion: 'LATEST',
  schedulingStrategy: 'REPLICA',
  desiredCount: 1,
  deploymentConfiguration: {
    // 起動に失敗し続けたら、前の版に戻して止める（直らないデプロイを繰り返さない）
    deploymentCircuitBreaker: {
      enable: true,
      rollback: true,
    },
    maximumPercent: 200,
    minimumHealthyPercent: 100,
  },
  networkConfiguration: {
    awsvpcConfiguration: {
      // シングル AZ のため、プライベートサブネットは1つ
      subnets: [ssm_list('/infra-env/network/private-subnet-ids', 0)],
      securityGroups: [ssm('/products/sandbox/web/security-group-id')],
      assignPublicIp: 'DISABLED',
    },
  },
  // リバースプロキシが <アプリの環境>-web.sandbox.internal で解決する
  serviceRegistries: [
    {
      registryArn: must_env('CLOUD_MAP_SERVICE_ARN'),
    },
  ],
  // コンテナに入って調べるため（ECS Exec）。使えるのはタスクロールに ssmmessages の権限がある環境だけ（nonprod）
  //   権限が無い環境（stg / prod）でも、タスクは起動する（コンテナに入れないだけ）
  enableExecuteCommand: true,
} + (
  // ALB（stg / prod）：ターゲットグループに登録する。起動の直後に ALB のヘルスチェックで落とされないよう、猶予を置く
  if targetGroupArn != '' then {
    loadBalancers: [
      {
        targetGroupArn: targetGroupArn,
        containerName: 'web',
        containerPort: 8080,
      },
    ],
    healthCheckGracePeriodSeconds: 60,
  } else {}
)
