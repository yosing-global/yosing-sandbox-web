// タスク定義（値は SSM パラメータから読む。アカウント ID 等をファイルに書かない）
//   イメージは全環境で同じ。環境の違いは、ここで渡す環境変数だけにする
local must_env = std.native('must_env');
local ssm = std.native('ssm');

local appEnv = must_env('APP_ENV');
local apiEnv = must_env('API_ENV');

local web = {
  name: 'web',
  image: must_env('IMAGE'),
  essential: true,
  portMappings: [
    {
      containerPort: 8080,
      protocol: 'tcp',
    },
  ],
  environment: [
    // アプリの環境（dev / test / pr<番号>）
    { name: 'APP_ENV', value: appEnv },
    // API の URL（VPC の中。Cloud Map の名前で直接つなぐ）。サーバー側だけで使い、ブラウザーには渡さない
    { name: 'API_BASE_URL', value: 'http://' + apiEnv + '-api.sandbox.internal:8080' },
  ],
  logConfiguration: {
    logDriver: 'awslogs',
    options: {
      'awslogs-group': ssm('/products/sandbox/web/log-group-name'),
      'awslogs-region': 'ap-northeast-1',
      // ログストリームは <アプリの環境>/<コンテナ>/<タスク ID>
      'awslogs-stream-prefix': appEnv,
    },
  },
};

{
  family: 'sandbox-' + appEnv + '-web',
  networkMode: 'awsvpc',
  requiresCompatibilities: ['FARGATE'],
  runtimePlatform: {
    cpuArchitecture: 'ARM64',
    operatingSystemFamily: 'LINUX',
  },
  // Fargate の最小（0.25 vCPU / 0.5GB）。足りなければ上げる
  cpu: '256',
  memory: '512',
  executionRoleArn: ssm('/products/sandbox/ecs/task-execution-role-arn'),
  // web は AWS のデータに触れないため、タスクロールはアプリの環境で共有する（ECS Exec の権限だけ）
  taskRoleArn: ssm('/products/sandbox/web/task-role-arn'),
  containerDefinitions: [web],
}
