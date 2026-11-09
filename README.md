# yosing-sandbox-web

sandbox アプリの画面と BFF（Next.js）のリポジトリです。

## 手元での動かし方

Node.js 24 が必要です。

```bash
npm ci
npm run dev     # http://localhost:3000
npm run check   # 整形の確認・ESLint・型チェック・単体テスト
```

本番と同じコンテナ（linux/arm64）は、次のコマンドで作れます。

```bash
docker buildx build --platform linux/arm64 -t sandbox-web:local --load .
docker run --rm --platform linux/arm64 -p 8080:8080 sandbox-web:local
# http://localhost:8080/api/health が {"status":"UP"} を返す
```
