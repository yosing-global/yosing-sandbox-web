# yosing-sandbox-web

sandbox アプリの画面と BFF（Backend for Frontend）のリポジトリです。バックエンドの API は [yosing-sandbox-api](https://github.com/yosing-global/yosing-sandbox-api) で管理しています。

sandbox は、個人の学習とポートフォリオを兼ねたアプリです。最初のリリースの範囲は、TOTP（認証アプリのワンタイムパスワード）による認証（登録・ログイン）と、ログイン後のダッシュボード・ログアウトです。

画面の仕様と動作確認の手順は、[Wiki](https://github.com/yosing-global/yosing-sandbox-web/wiki) にまとめています。

## 技術

| 項目 | 内容 |
| :--- | :--- |
| 言語・フレームワーク | TypeScript、Next.js 16（App Router、Cache Components）、React 19 |
| UI | Tailwind CSS 4、shadcn/ui |
| 入力チェック | Zod（画面とサーバーで同じルールを使用） |
| 画面モック | Storybook |
| テスト | Vitest、Testing Library |
| 実行環境 | Amazon ECS on AWS Fargate（ARM64） |
| デプロイ | GitHub Actions、ecspresso |

## 構成

```text
ブラウザー ──(HTTPS・Cookie)──▶ web（画面＋BFF）──(VPC 内)──▶ API
```

- ブラウザーは web とだけ通信します。API は公開せず、web のサーバー側だけが呼び出します。
- セッション ID などの認証情報は、`HttpOnly` の Cookie に格納します。ブラウザーの JavaScript からは参照できません。
- 状態を変更する操作（登録・ログイン・ログアウト）は Server Action で実装しています。Next.js が `Origin` を検証するため、CSRF 対策になります。
- 画面表示前の振り分け（ログイン状態の判定）とセッション期限の延長は、proxy（`src/proxy.ts`）で行います。

### 画面

| URL | 画面 |
| :--- | :--- |
| `/login` → `/login/verify` | ログイン（ログイン ID・パスワード → 認証アプリのコード） |
| `/register` → `/register/setup` | 新規登録（ログイン ID・パスワード → 認証アプリの設定。QR コード） |
| `/dashboard` | ダッシュボード（ログイン後） |
| `/` | ログイン中は `/dashboard`、未ログインは `/login` に遷移 |
| （存在しない URL・想定外のエラー） | ページが見つからない（404）・エラー（500） |

PC とスマホは、同じ HTML を CSS（Tailwind のブレークポイント）で組み替えて表示します。画面ごとの振る舞いは、Wiki の「画面仕様」を参照してください。

## アーキテクチャ

BFF の部分（`src/server/`）は、api と同様に層を分け、依存の向きをそろえています。

```text
     presentation              infrastructure
（Server Action・Cookie）    （API の呼び出し・QR コード）
              \                 /
               ▼               ▼
                  application
               （ユースケース）
                      │
                      ▼
                    domain
          （値オブジェクト・結果の型）
```

- 矢印は依存の向きを表します。domain は Next.js・React に依存しません。
- application は、外部の技術に求める機能（API の呼び出し等）をインターフェース（`port/`）として定義し、infrastructure がそれを実装します。依存関係の組み立ては `src/server/container.ts` の1か所で行います。
- 依存のルールは、ESLint の `no-restricted-imports` で強制しています（`eslint.config.mjs`）。
- API の想定内の失敗（入力エラー・コードの不一致等）は、例外ではなく結果の型で返します。表示する文言は画面側で決めます。

### ディレクトリ構成

```text
.
├── src/
│   ├── app/               ルーティング（画面・エラー画面・ヘルスチェック）
│   ├── features/          機能ごとの画面部品と Server Action（register・login・dashboard）
│   ├── components/        機能をまたぐ画面部品（ui/ は shadcn/ui）
│   ├── server/            サーバー側でのみ動作するもの（BFF）
│   │   ├── presentation/  Cookie・ログイン中のユーザーの受け渡し
│   │   ├── application/   ユースケースと、外部の技術のインターフェース（port/）
│   │   ├── domain/        値オブジェクト・結果の型
│   │   └── infrastructure/ API の呼び出し・QR コードの生成
│   ├── shared/            画面とサーバーの両方で使うもの（入力ルール・文言・日時の表示）
│   └── proxy.ts           画面表示前の振り分けと、セッション期限の延長
├── mocks/                 Storybook のストーリー（画面の状態ごと）
├── deploy/                ECS のタスク定義・サービス定義（ecspresso）
├── .github/               GitHub Actions のワークフロー（PR・develop・main・prod・PR 環境の削除・develop への同期）と PR のテンプレート
└── Dockerfile             コンテナイメージ（linux/arm64）
```

テストファイルは、対象ファイルと同じ場所に `*.test.ts(x)` として配置しています。

## ブランチと環境

| トリガー | デプロイ先 | E2E |
| :--- | :--- | :--- |
| Pull Request | PR ごとの環境（PR のクローズで削除。API は dev を使用） | PR ごとの環境 |
| `develop` へのマージ | dev、test | test |
| `main` へのマージ | stg（`https://stg.sandbox.yosing.net`。Basic 認証あり） | stg |
| 手動（`prod.yml`。stg で成功したコミットのみ） | prod（`https://sandbox.yosing.net`） | なし |

- E2E は、デプロイとヘルスチェックの後に、[yosing-sandbox-e2e](https://github.com/yosing-global/yosing-sandbox-e2e) の再利用可能なワークフローを呼び出して実行します（Playwright。ブラウザーから web・API・DB までを通して、登録・ログイン・ログアウトの流れと画面の文言を検証）。シナリオと実装方針は、e2e の README を参照してください。
- test では api の CI も E2E を実行します。web と api の間で排他制御をしていないため、相手のデプロイ中に実行されると失敗することがあります。その場合は再実行します（自動で1回再試行し、それでも失敗した場合は手動で Re-run）。
- E2E が作成したテストユーザー（ログイン ID が `e2e_dummy_` で始まるもの）は dev・test・stg に蓄積され、登録から24時間を過ぎたものを api の CI が削除します。
- stg と prod は同じコンテナイメージ（main へのマージでビルドしたもの）を使います。stg・prod では、静的ファイル（`/_next/static/*`）を CloudFront → S3 から配信し、それ以外を ALB → web に転送します。
- 各環境のタスクは通常は停止しており、使用するときに起動します（毎日 3:00 JST に停止）。stg・prod の停止中は、メンテナンス中のページを表示します。

## ローカルでの開発

Node.js 24 が必要です。画面を動かすには、API（[yosing-sandbox-api](https://github.com/yosing-global/yosing-sandbox-api)）をローカルで起動しておきます（`http://localhost:8080`。起動手順は API の README を参照）。接続先は `.env.development` の `API_BASE_URL` で指定しています。

```powershell
# 依存パッケージのインストール
npm ci

# 開発サーバー（http://localhost:3000）
npm run dev

# フォーマットの確認・ESLint・型チェック・単体テスト（CI と同じ内容）
npm run check

# フォーマットの適用
npm run format

# 画面モック（http://localhost:6006。API なしで、画面の状態ごとに表示できる）
npm run storybook
```

接続先の API を変更する場合は、起動前に環境変数で指定します（例：`$env:API_BASE_URL = "http://localhost:18080"; npm run dev`）。

### コンテナイメージ

```powershell
docker buildx build --platform linux/arm64 -t sandbox-web:local --load .
docker run --rm --platform linux/arm64 -p 8080:8080 -e API_BASE_URL=http://host.docker.internal:8080 sandbox-web:local
# http://localhost:8080/api/health が {"status":"UP"} を返せば起動完了
```

- 本番環境は linux/arm64 で動作します。ビルドのステージは PC の CPU のまま実行し、実行のステージだけを arm64 にしているため、エミュレーションなしでビルドできます（x86 の PC で起動する場合は、エミュレーションで動作します）。
- イメージは環境ごとに作り分けません。環境ごとの違い（API の接続先等）は、起動時の環境変数で渡します。
