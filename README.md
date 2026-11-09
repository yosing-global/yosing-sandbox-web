# yosing-sandbox-web

sandbox アプリの画面と BFF（Next.js）のリポジトリです。

## 手元での動かし方

Node.js 24 が必要です。API（`yosing-sandbox-api`）は手元で起動したもの（http://localhost:8080）を使います（`.env.development`）。

```bash
npm ci
npm run dev     # http://localhost:3000
npm run check   # 整形の確認・ESLint・型チェック・単体テスト
npm run storybook  # 画面モック（http://localhost:6006）
```

本番と同じコンテナ（linux/arm64）は、次のコマンドで作れます。

```bash
docker buildx build --platform linux/arm64 -t sandbox-web:local --load .
docker run --rm --platform linux/arm64 -p 8080:8080 sandbox-web:local
# http://localhost:8080/api/health が {"status":"UP"} を返す
```

## CI・デプロイ

GitHub Actions と ecspresso で、nonprod の ECS（Fargate）にデプロイします。

| 契機 | デプロイ先 | 呼ぶ API |
| :--- | :--- | :--- |
| PR（作成・更新） | PR 環境 `pr<番号>`（PR を閉じたら削除） | `dev-api` |
| develop へのマージ | `dev` と `test` | それぞれ `dev-api`・`test-api` |

- 画面の URL は `https://<env>.local.sandbox.yosing.net:8090/` です。開くには SSM のポートフォワーディングが要ります（手順は `aws-infra-env` の README の「開発環境へのアクセス」）。
- GitHub の Repository variables に `AWS_ROLE_ARN`（NonProd の CI ロールの ARN）と `ECR_REGISTRY`（Shared-Infra の ECR のレジストリ）を置きます。
