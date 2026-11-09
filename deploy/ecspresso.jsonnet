// ecspresso の設定（web の ECS のサービス）
//   CI が環境変数で渡す値
//     APP_ENV     … アプリの環境（dev / test / pr<番号>）。サービス・タスク定義・ログの名前に使う
//     API_ENV     … 呼ぶ API の環境（dev / test。PR 環境は dev）
//     ECS_CLUSTER … クラスター（SSM の /products/sandbox/ecs/cluster-name）
//     IMAGE       … イメージ（<レジストリ>/sandbox/web:<コミットのハッシュ>）
local must_env = std.native('must_env');

{
  required_version: '>= 2.8.0, < 3',
  region: 'ap-northeast-1',
  cluster: must_env('ECS_CLUSTER'),
  service: must_env('APP_ENV') + '-web',
  service_definition: 'service-def.jsonnet',
  task_definition: 'task-def.jsonnet',
  timeout: '15m',
}
