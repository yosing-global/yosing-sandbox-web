// サービスの定義
//   CI が環境変数で渡す値
//     CLOUD_MAP_SERVICE_ARN … Cloud Map のサービス（<アプリの環境>-web。CI が AWS CLI で作る）
local must_env = std.native('must_env');
local ssm = std.native('ssm');
local ssm_list = std.native('ssm_list');

{
  // 中断されることがあるが、nonprod なので Fargate Spot で動かす
  capacityProviderStrategy: [
    {
      capacityProvider: 'FARGATE_SPOT',
      weight: 1,
    },
  ],
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
  // コンテナに入って調べるため（タスクロールに ssmmessages の権限がある）
  enableExecuteCommand: true,
}
