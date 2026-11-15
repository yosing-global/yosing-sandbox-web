# yosing-sandbox-web

sandbox アプリの画面と BFF（Backend for Frontend）のリポジトリです。バックエンドの API は [yosing-sandbox-api](https://github.com/yosing-global/yosing-sandbox-api) にあります。

sandbox は、個人の学習とポートフォリオを兼ねたアプリです。最初の範囲は TOTP（認証アプリのワンタイムパスワード）による認証（登録・ログイン）と、ログインした後のダッシュボード・ログアウトです。

## 技術

| 項目 | 内容 |
| :--- | :--- |
| 言語・フレームワーク | TypeScript、Next.js 16（App Router、Cache Components）、React 19 |
| 画面の見た目 | Tailwind CSS 4、shadcn/ui |
| 入力の規則 | Zod（画面とサーバーで同じ規則を使う） |
| 画面モック | Storybook |
| テスト | Vitest、Testing Library |
| 実行環境 | Amazon ECS on AWS Fargate（ARM64） |
| デプロイ | GitHub Actions、ecspresso |

## 構成

```text
ブラウザー ──(HTTPS・Cookie)──▶ web（画面＋BFF）──(VPC の中)──▶ API
```

- ブラウザーは web とだけ通信します。API は公開せず、web のサーバー側だけが呼びます。
- セッション ID などの認証の値は、`HttpOnly` の Cookie に入れます。ブラウザーの JavaScript からは読めません。
- 状態を変える操作（登録・ログイン・ログアウト）は Server Action にしています。Next.js が `Origin` を確かめるため、CSRF の対策になります。
- 画面を開く前の振り分け（ログインしているかどうか）と、セッションの期限の延長は、proxy（`src/proxy.ts`）で行います。

### 画面

| URL | 画面 |
| :--- | :--- |
| `/login` → `/login/verify` | ログイン（ログイン ID・パスワード → 認証アプリのコード） |
| `/register` → `/register/setup` | 新規登録（ログイン ID・パスワード → 認証アプリの設定。QR コード） |
| `/dashboard` | ダッシュボード（ログインした後） |
| `/` | ログインしていれば `/dashboard`、していなければ `/login` に移す |
| （存在しない URL・想定外のエラー） | ページが見つからない（404）・エラー（500） |

PC とスマホは、同じ HTML を CSS（Tailwind のブレークポイント）で組み替えます。

## アーキテクチャ

BFF の部分（`src/server/`）は、api と同じく、層に分けて依存の向きをそろえています。

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

- 矢印は依存の向きです。domain は Next.js・React に依存しません。
- application は、外の技術に求めるもの（API の呼び出し等）をインターフェース（`port/`）で持ち、infrastructure がそれを実装します。組み立ては `src/server/container.ts` の1か所で行います。
- 依存の決まりは、ESLint の `no-restricted-imports` で守らせています（`eslint.config.mjs`）。
- API の想定した失敗（入力の誤り・コードの誤り等）は、例外にせず結果の型で返します。文言は画面の側で決めます。

### ディレクトリ構成

```text
.
├── src/
│   ├── app/               ルーティング（画面・エラーの画面・ヘルスチェック）
│   ├── features/          機能ごとの画面の部品と Server Action（register・login・dashboard）
│   ├── components/        機能をまたぐ画面の部品（ui/ は shadcn/ui）
│   ├── server/            サーバー側だけで動くもの（BFF）
│   │   ├── presentation/  Cookie・ログイン中のユーザーの受け渡し
│   │   ├── application/   ユースケースと、外の技術のインターフェース（port/）
│   │   ├── domain/        値オブジェクト・結果の型
│   │   └── infrastructure/ API の呼び出し・QR コードの作成
│   ├── shared/            画面とサーバーの両方で使うもの（入力の規則・文言・日時の表示）
│   └── proxy.ts           画面を開く前の振り分けと、セッションの期限の延長
├── mocks/                 Storybook のストーリー（画面の状態ごと）
├── deploy/                ECS のタスク定義・サービスの定義（ecspresso）
├── .github/               GitHub Actions のワークフロー（PR・develop・PR 環境の削除）と PR のテンプレート
└── Dockerfile             イメージ（linux/arm64）
```

テストのファイルは、対象のファイルの隣に `*.test.ts(x)` で置いています。

## ブランチと環境

| 契機 | デプロイ先 | E2E |
| :--- | :--- | :--- |
| Pull Request | PR ごとの環境（PR を閉じると削除。API は dev を使う） | PR ごとの環境 |
| `develop` へのマージ | dev、test | test |
| `main` へのマージ | stg（`https://stg.sandbox.yosing.net`。Basic 認証あり） | stg |
| 手動（`prod.yml`。stg で成功したコミットだけ） | prod（`https://sandbox.yosing.net`） | なし |

- E2E は、デプロイとヘルスチェックの後に、[yosing-sandbox-e2e](https://github.com/yosing-global/yosing-sandbox-e2e) の再利用できるワークフローを呼んで流します（Playwright。ブラウザーから web・API・DB をつなげて、登録・ログイン・ログアウトの流れと、画面の文言を確かめる）。シナリオと作りは、e2e の README にあります。
- test は api の CI も E2E を流します。web と api の間で排他しないため、相手のデプロイの最中に流れて落ちることがあります。そのときは流し直します（自動のやり直し1回、それでも落ちたら手で Re-run）。
- E2E が作ったテストのユーザー（ログイン ID が `e2e_dummy_` で始まる）は dev・test・stg に溜まり、api の CI が登録から24時間後に消します。
- stg と prod は同じイメージ（main へのマージでビルドしたもの）を使います。stg・prod では、静的ファイル（`/_next/static/*`）を CloudFront → S3 から返し、それ以外を ALB → web に送ります。
- 環境のタスクは、ふだんは止めておき、使うときに起動します（毎日 3:00 に止まります）。stg・prod を止めている間は、メンテナンス中のページが出ます。

## ローカルでの開発

Node.js 24 が要ります。画面を動かすには、API（[yosing-sandbox-api](https://github.com/yosing-global/yosing-sandbox-api)）を手元で起動しておきます（http://localhost:8080。起動の手順は API の README）。接続先は `.env.development` の `API_BASE_URL` です。

```powershell
# 依存を入れる
npm ci

# 開発サーバー（http://localhost:3000）
npm run dev

# 整形の確認・ESLint・型チェック・単体テスト（CI と同じ）
npm run check

# 整形する
npm run format

# 画面モック（http://localhost:6006。API なしで、画面の状態ごとに見られる）
npm run storybook
```

接続先の API を変えるときは、起動の前に環境変数で指定します（例：`$env:API_BASE_URL = "http://localhost:18080"; npm run dev`）。

### イメージ

```powershell
docker buildx build --platform linux/arm64 -t sandbox-web:local --load .
docker run --rm --platform linux/arm64 -p 8080:8080 -e API_BASE_URL=http://host.docker.internal:8080 sandbox-web:local
# http://localhost:8080/api/health が {"status":"UP"} を返す
```

- 本番は linux/arm64 で動かします。ビルドの段は PC の CPU のまま動かし、実行の段だけを arm64 にしているため、エミュレーションなしでビルドできます（動かすときは、x86 の PC ではエミュレーションになります）。
- イメージは環境ごとに作り分けません。環境の違い（API の接続先等）は、起動のときの環境変数で渡します。
