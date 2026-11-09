# CLAUDE.md

sandbox の web（画面と BFF）のリポジトリ。Next.js（TypeScript）。sandbox は個人の学習とポートフォリオを兼ねたプロダクトで、最初の範囲は TOTP 認証（登録・ログイン）と、認証後のダッシュボード・ログアウトだけ。バックエンドの API は `yosing-sandbox-api`（Spring Boot）。

## 状況（2026-11-07 時点）

- Next.js の土台ができた（2026-11-07。ヘルスチェック・静的チェック・単体テスト・Dockerfile）。CI・デプロイ（`.github/workflows`・`deploy/`）を作った（2026-11-09。最初の PR で動作を確かめる）。画面・BFF はまだ無い。
- E2E の設計は Notion の「6. テスト仕様」の「yosing-sandbox-e2e E2Eテスト」。
- API は全部のエンドポイントができている（`yosing-sandbox-api`。仕様はその GitHub Wiki と Notion の「4.3 API設計」）。
- 画面の URL と BFF の操作は、Notion の「4.2 画面のURLとBFF」で決めた（2026-11-09）。要点は下の「画面の URL と BFF」。
- 画面の UI/UX は、Claude Code がキャンバス（claude.ai の Artifact「ログイン画面レイアウト案」 https://claude.ai/artifact/QHTRJ4g4wXWgbEoMo3GGEn ）に描いて決めた（2026-11-07）。要点は下の「画面（UI/UX）」。結果は Notion の「4.1 UI/UX設計」にも残す。
- nonprod のインフラ（ECR の `sandbox/web`、CI ロール、タスクロール、SG、ロググループ）は準備済み。stg / prod のインフラはまだ無い（最後にまとめて作る）。
- 作業の順番：web → E2E（`yosing-sandbox-e2e`、Playwright）→ stg / prod のインフラと各アプリの CI の仕上げ。リポジトリ・Wiki の一般公開は、全部を確かめた後の最後。

## 技術

| 項目 | 内容 |
| :--- | :--- |
| 言語・フレームワーク | TypeScript 5、Next.js 16（App Router、Cache Components を有効）、React 19。Node.js 24 |
| 画面の見た目 | Tailwind CSS 4（色・文字は `src/app/globals.css` の `@theme` に名前を付けて置き、画面では名前で使う）。部品は shadcn/ui を、画面を作るときに入れる |
| 単体テスト | Vitest ＋ Testing Library（jsdom）。テストのファイルは対象の隣に `*.test.ts(x)` |
| 静的チェック | ESLint（`eslint-config-next`）・Prettier・型チェック（`tsc`） |
| 画面モック | Storybook（`mocks/` に置く）。画面を作るときに入れる |
| 役割 | 画面と BFF。ブラウザーは web とだけ通信し（同じオリジン）、web のサーバー側が VPC の中で API を呼ぶ |
| 実行環境 | Amazon ECS on AWS Fargate（ARM64、nonprod は Fargate Spot）。コンテナは 8080 で待ち受ける |
| イメージ | Shared-Infra の ECR `sandbox/web`。linux/arm64。タグはコミットのハッシュ |
| デプロイ | GitHub Actions ＋ ecspresso（api と同じ作り。下の「CI」） |
| E2E | 別のリポジトリ `yosing-sandbox-e2e`（Playwright）。web・api の CI から呼ぶ |

- この Next.js は、Claude の知識より新しい版。コードを書く前に `AGENTS.md`（Next.js が作るファイル。`next dev` が書き直すので消さない）の指示どおり、`node_modules/next/dist/docs/` の該当の文書を読む。

@AGENTS.md

### 手元での開発

| コマンド | 内容 |
| :--- | :--- |
| `npm ci` | 依存を入れる |
| `npm run dev` | 開発サーバー（http://localhost:3000） |
| `npm run check` | 整形の確認・ESLint・型チェック・単体テストをまとめて動かす（CI の `check` と同じ） |
| `npm run format` | 整形する |
| `npm run build` | 本番のビルド（`.next/standalone` に出力） |
| `docker buildx build --platform linux/arm64 -t sandbox-web:local --load .` | 本番と同じ arm64 のイメージを作る（手元では `docker run --platform linux/arm64 -p 8080:8080 sandbox-web:local`） |

| 場所 | 内容 |
| :--- | :--- |
| `src/app/` | ルーティング（画面・Route Handler・Server Action）。`src/app/api/health/route.ts` がヘルスチェック |
| `src/app/globals.css` | 色・文字の決まり（`@theme`） |
| `Dockerfile` | ビルドの段は `$BUILDPLATFORM`（x86 のまま）、実行の段は arm64。実行の段では `RUN` を使わない（エミュレーションが要らないように） |

- 画像の最適化（sharp）は使わない（`images.unoptimized`）。ビルド（x86）と実行（arm64）で CPU が違うため。
- `public/robots.txt` で、検索エンジンに載せない（公開しない前提のため）。

### 画面の作りの決まり（E2E が画面の文言で部品を探すため）

- 入力欄には必ず `<label>` を付ける。アイコンだけのボタンには `aria-label` を付ける（例：「パスワードを表示」）。
- お知らせの枠には `role="alert"`（赤）・`role="status"`（青）を付ける。入力欄の下の誤りは `aria-describedby` で入力欄に結びつける。
- ステップ表示の今のステップに `aria-current="step"` を付ける。
- 毎回変わる値（セットアップキー・QR コード）は、ラベル・代替テキストで名前を付ける。`data-testid` は、どれでも探せないときだけ使う。
- 文言は UI/UX 設計（Notion の「4.1 UI/UX設計」）が正。変えるときは、UI/UX 設計 → E2E → web の順に直す。

## 関連リポジトリ（`../` に clone 済み）

| リポジトリ | 内容 |
| :--- | :--- |
| `yosing-sandbox-api` | API（Spring Boot）。CI・デプロイの作りの手本（`.github/workflows`・`deploy/`）。API の仕様は GitHub Wiki |
| `aws-infra-env` | 環境のインフラと sandbox のインフラ（`products/sandbox/nonprod`）。web の CI ロールの権限もここ |
| `aws-infra-global` | ECR（`sandbox/web`）、アプリの CI ロールの信頼ポリシー、DNS のホストゾーン |

- インフラの詳細（名前・権限・SSM パラメータの一覧・リバースプロキシ）は `../aws-infra-env/README.md` の「sandbox（nonprod）」が正。
- 本リポジトリでは AWS のリソースを Terraform で作らない（ECS のサービス・タスク定義・Cloud Map のサービス・稼働時間のスケジュールは、本リポジトリの CI が作る）。

## 設計

Notion の「2. 方式設計」「4. 外部設計（共通方針）」「4.1 UI/UX設計」「4.2 画面のURLとBFF」「4.3 API設計」「4.4 DB設計」（Notion MCP で検索できる）。API の外部から見た振る舞いは、`yosing-sandbox-api` の GitHub Wiki（`../yosing-sandbox-api.wiki`）にもまとめてある。

### 構成

```text
ブラウザー ─(HTTPS、同じオリジン、Cookie)─▶ web（画面＋BFF、8080）─(VPC 内、HTTP)─▶ api（<env>-api.sandbox.internal:8080）
```

- API は公開していない。ブラウザーから API を直接呼ばない（API の URL・セッション ID・仮認証 JWT をブラウザーの JavaScript に渡さない）。
- API の呼び出しは、すべてサーバー側（Route Handler・Server Action・Server Component）で行う。API の URL は環境変数で渡す（名前は実装のときに決める。例：`API_BASE_URL`）。
- web から API への通信は、Cloud Map の名前（`<env>-api.sandbox.internal:8080`）で直接つなぐ（内部 ALB は無い）。

### 画面の URL と BFF（詳細は Notion の「4.2 画面のURLとBFF」が正）

| URL | 画面 | BFF の操作（種類） | 呼ぶ API | 成功したら |
| :--- | :--- | :--- | :--- | :--- |
| `/register` | 新規登録（ステップ1） | `startRegistration`（Server Action） | `POST /v1/registrations` | 登録 ID・QR コード（SVG）・キーをブラウザーの store に入れ、`/register/setup` へ（画面の中だけの移動） |
| `/register/setup` | 新規登録（ステップ2） | `verifyRegistration`（Server Action） | `POST /v1/registrations/{registrationId}/verify` | セッションの Cookie を設定して、`/dashboard` へ |
| `/login` | ログイン（ステップ1） | `startLogin`（Server Action） | `POST /v1/logins` | 仮認証の Cookie を設定して、`/login/verify` へ |
| `/login/verify` | ログイン（ステップ2） | `verifyLogin`（Server Action） | `POST /v1/logins/verify` | 仮認証の Cookie を消し、セッションの Cookie を設定して、`/dashboard` へ |
| `/dashboard` | ダッシュボード | proxy（開く前） | `GET /v1/me` | セッションの Cookie を延ばし、ログイン ID・登録した日時を画面に渡す |
| `/dashboard` | ダッシュボード | `logout`（Server Action） | `DELETE /v1/sessions/current` | セッションの Cookie を消して、`/login` へ |
| `/` | （画面なし） | ― | ― | ログイン中なら `/dashboard`、そうでなければ `/login` |
| `/api/health` | （ヘルスチェック） | Route Handler | ― | `{"status":"UP"}` |

- BFF の入口：フォームの操作は Server Action（決まった URL は無く、画面の URL への POST）。画面を開く前の振り分けと Cookie の延長は proxy（旧 middleware）。画面から呼ばない入口だけ Route Handler。
- Server Component（画面の表示）の中では Cookie を書き換えられない（Next.js の決まり）。そのため、`GET /v1/me` のたびの Cookie の延長と、無効なセッションの Cookie の削除は、`/dashboard` を開く前の proxy で行う。
- **新規登録の設定の値はブラウザーのメモリに持つ**：API には設定 URI（`otpauthUri`）を取り直すエンドポイントが無い（登録 ID だけで取り直せると秘密情報が漏れるため）。そのため、`startRegistration` が返す登録 ID・QR コード・キーを React の store（メモリ）に入れ、`/register/setup` は store から表示する。`sessionStorage` 等には入れない（秘密情報を残さないため）。リロード・URL の直打ちで store が空なら `/register` に戻す（登録をやり直す）。設定 URI そのものはブラウザーに渡さない（BFF で QR コードの SVG にする）。
- 未ログインの人向けの画面（`/login`・`/register` 等）は、セッションの Cookie があるかだけで「ログイン中」を判断して `/dashboard` に移す（API には問い合わせない）。
- 別の画面に移したうえでお知らせを出すときは、URL に理由を付ける（`/login?notice=expired`・`retry-later`、`/register?notice=restart`・`taken`）。決まった値だけを受け付ける。リロードしても同じお知らせが出続けるが、許容する。
- 失敗は「種類」を返し、文言は画面の側で決める（文言は 4.1 が正）。登録の確定で `LOGIN_ID_TAKEN` が出て `/register` に戻ったときは、ログイン ID を入力欄に残さない。

### 画面（UI/UX）

キャンバス（上の「状況」の URL）が正。要点：

- 見た目：白の背景、ポイントの色は青（`#2563EB`）。文字は Noto Sans JP。シンプルにする。
- ログイン・登録：上にヘッダー（ロゴだけ）、その下にステップ表示（ログインは「1 パスワード → 2 認証コード」、登録は「1 ID・パスワード → 2 認証アプリの設定」）。ステップ1のボタンは「次へ」。ログイン・登録を行き来するリンクは、ボタンの下に区切りの線を引いて置く。
- 6桁のコード：1つの入力欄（`inputmode="numeric"`・`autocomplete="one-time-code"`）。下に「コードは30秒ごとに変わります」。
- 登録のパスワード：確認の欄（2回入力）は付けない（表示を切り替えるボタンで確かめる）。
- 秘密情報（キー）の文字の表示：「QR コードを読み取れない場合」を開くと、キーとコピーのボタンが出る。PC では閉じておき、スマホでは最初から開く（同じ端末の認証アプリでは QR コードを読めないため）。
- ダッシュボード：ヘッダー（ログイン ID・ログアウト）＋左のメニュー（ホーム／機能／設定）＋中身。機能はあとから足せるように、メニューとホームのカードに1つずつ並べる。スマホではメニューのボタンで開き、ログアウトはメニューの一番下。ログアウトの確認はしない。
- 日時は日本時間で表示する（例：2026年11月3日 10:25）。
- お知らせの色：利用者の操作に原因があるものは赤、利用者のせいではないもの（期限切れ）は青。
- エラーの画面（500・404）：ヘッダーのロゴだけ（ログイン中かどうかに関係なく出せるように）。「ホームに戻る」は、ログイン中ならダッシュボード、そうでなければログイン画面へ。

### API の要点（詳細は API の Wiki）

- 要求・応答は JSON、項目名は lowerCamelCase、日時は ISO 8601 の UTC。
- セッション ID は `Authorization: Bearer <sessionId>` で渡す。仮認証 JWT は本文の `loginToken` で渡す（中身は見ない。そのまま渡す）。
- 期限：仮登録10分、仮認証 JWT 5分、セッションは最終操作から12時間（`GET /v1/me` のたびに延びる）・発行から7日の早い方。
- 入力の規則：`loginId` は3〜32文字の英字・数字・`_`・`-`（大文字は API が小文字にそろえる）、`password` は12〜64文字の表示できる ASCII、`code` は数字6桁。画面でも同じ規則で先に確かめる（最終的な判定は API）。
- エラーは Problem Details に `code` が付く。処理は `code` で分け、`detail` の文言には頼らない。

| code | status | 画面での扱い（UI/UX 設計で決めたもの） |
| :--- | :--- | :--- |
| `VALIDATION_FAILED` | 400 | `errors`（`field`・`message`）を項目ごとに、入力欄の下に表示 |
| `LOGIN_ID_TAKEN` | 409 | フォームの上に「このログイン ID は使われています。別の ID にしてください。」。登録の確定で出たら、ステップ1に戻して同じ表示 |
| `OTP_INVALID` | 401 | 「コードが違います。もう一度入力してください。」と出して再入力。残りの回数（`remainingAttempts`）とロックには触れない |
| `OTP_ATTEMPTS_EXCEEDED` | 429 | 登録は `REGISTRATION_NOT_FOUND` と同じ表示で最初から。ログインは仮認証の Cookie を消してログイン画面へ戻し、「しばらく時間をおいてから、もう一度ログインしてください。」と出す（「ロック」「15分」とは書かない） |
| `REGISTRATION_NOT_FOUND` | 404 | 登録のステップ1に戻して「登録を完了できませんでした。最初からやり直してください。」 |
| `INVALID_CREDENTIALS` | 401 | 「ログイン ID かパスワードが違います。」。ログイン ID は残し、パスワードは空にする。ロック中も同じ応答なので、ロックを示す文言にしない |
| `LOGIN_TOKEN_INVALID` | 401 | 仮認証の Cookie を消して、ログイン画面へ。青のお知らせ「ログインの有効期限が切れました。もう一度ログインしてください。」（`SESSION_INVALID` と同じ文言） |
| `SESSION_INVALID` | 401 | セッションの Cookie を消して、ログイン画面へ。青のお知らせ（`LOGIN_TOKEN_INVALID` と同じ文言） |
| `INTERNAL_ERROR` | 500 | 共通のエラーの画面「エラーが発生しました」（「もう一度試す」「ホームに戻る」）。`detail` などの中身は出さない |

- エラーを出す場所：入力の形式の誤り（画面での事前の確認と `VALIDATION_FAILED`）は、その入力欄の下。それ以外の、送信した結果のエラー（`LOGIN_ID_TAKEN`・`INVALID_CREDENTIALS`・`OTP_INVALID` 等）は、フォームの上のお知らせの枠。
- ロック：ログインのパスワード・OTP を、それぞれ5回続けて間違えると15分ロック。OTP の回数は、ログインを始め直しても数え続ける。
  - BFF がロックを知れるのは、OTP の5回目の失敗で返る 429 `OTP_ATTEMPTS_EXCEEDED` だけ。パスワードでのロック・ロック中のログインの開始は 401 `INVALID_CREDENTIALS` で、ふつうの失敗と区別できない（API がわざと区別させていない）。
- 一度使ったコード（登録や前のログインで使ったもの）は使えない。同じ30秒の間にもう一度ログインすると `OTP_INVALID` になる。エラーの文言では区別せず、入力欄の下の「コードは30秒ごとに変わります」で案内する。
- 仮認証はユーザーごとに1つ。別のタブ・端末でログインを始めると、前の仮認証 JWT は `LOGIN_TOKEN_INVALID` になる。

### Cookie（Notion の「4. 外部設計」の共通方針）

| Cookie | 中身 | 属性 | 有効期間 |
| :--- | :--- | :--- | :--- |
| セッション | API の `sessionId` | `HttpOnly`・`Secure`・`SameSite=Lax`・`Path=/`・`Domain` なし | API が返す `sessionExpiresAt`（発行時と、`GET /v1/me` のたびに延ばす） |
| 仮認証 | API の `loginToken` | `HttpOnly`・`Secure`・`SameSite=Lax`・`Domain` なし | 5分（API の `expiresAt`） |

- セッションの Cookie の期限は、サーバー側のセッションの期限と同じにする（`Expires` に API の `sessionExpiresAt` をそのまま入れる）。登録の確定・ログインの確定で設定し、`GET /v1/me` に成功するたびに、応答の `sessionExpiresAt` で設定し直す。期限の計算（12時間・7日）は BFF でしない（API が正）。
- 名前：セッションは `__Host-session`（`Path=/`）、仮認証は `__Secure-login`（`Path=/login`）。先頭の `__Host-` / `__Secure-` は、ブラウザーに属性を守らせるための印（`__Host-` は `Secure`・`Path=/`・`Domain` なしでないと保存されない。仮認証は `Path=/login` に絞るため `__Secure-`）。名前にプロダクト名は入れない（Cookie はホスト名ごとに分かれ、環境ごとにホスト名が違うため）。
- Cookie はポート番号では分かれないため、手元の `localhost` では、別のアプリが同じ名前を使うとぶつかることがある（手元だけの話。困ったらブラウザーの Cookie を消す）。
- ログアウトは、API でセッションを消してから Cookie を消す（API が失敗しても、Cookie は消す）。
- 認証の前の値を引き継がない：ログインの確定・登録の確定に成功したら、仮認証の Cookie を消して、新しいセッションの Cookie を設定する。
- 手元（`http://localhost`）では、主なブラウザーは `localhost` を安全な接続として扱うため、`Secure` の Cookie も使える。

### CSRF

- 状態を変える要求（登録・ログイン・ログアウト）には CSRF の対策をする（`SameSite=Lax` に加えて）。
- 状態を変える操作は、すべて Server Action にする（Next.js が `Origin` を確かめる）。Route Handler で状態を変える操作を作る場合は、`Origin` ヘッダーが自分のオリジンかを確かめる。
- 状態を変える処理を `GET` にしない。

### 機密情報の扱い

- ログ・エラーの表示・分析ツール等に、パスワード・コード・TOTP の秘密情報・設定 URI（`otpauthUri`）・セッション ID・仮認証 JWT・Cookie を出さない。
- 設定 URI は秘密情報を含む。QR コードは自分のコード（ライブラリ）で作り、外部の QR コードの生成サービス（URL に値を載せるもの）を使わない。
- 秘密情報（キー）は、QR コードを読めない人のために文字でも見せる（見せ方は「画面（UI/UX）」）。画面に出すのは、登録の確定の画面だけ。
- API の応答の本文を、そのままブラウザーに返さない（必要な項目だけを返す）。

### API との境目で決めたこと

- **`GET /v1/me` の応答に `sessionExpiresAt` を足す**（2026-11-07 に決定。api のブランチ `feat/me-session-expires-at` で対応。マージされるまでは、api の develop には無い）：セッションは `GET /v1/me` のたびに延びるため、BFF が新しい期限を受け取って Cookie を延ばせるようにする。
- **セッションの期限を、最終操作から12時間・発行から7日にする**（2026-11-07 に決定。同じ api のブランチで対応）：二要素認証で確かめ直す機会を減らしすぎないため。
- **web の PR 環境は `dev-api` を呼ぶ**（`dev-api.sandbox.internal:8080`）。web の PR 環境で登録したユーザーは、dev のテーブルに残る。

## 環境

| 契機 | デプロイ先 |
| :--- | :--- |
| PR | PR 環境 `pr<番号>`（PR を閉じたら削除） |
| develop へのマージ | `dev` と `test` |
| main へのマージ | `stg`（インフラ未作成） |
| 手動 | `prod`（インフラ未作成。stg に出したものだけ） |

- nonprod（dev / test / PR 環境）は1つの AWS アカウント（NonProd）を、api と共有する。
- nonprod の URL は `https://<env>.local.sandbox.yosing.net:8090`（api は `https://<env>.api.local.sandbox.yosing.net:8090`）。SSM のポートフォワーディング（手元の 8090 → リバースプロキシの 443）でつなぐ。手順は `../aws-infra-env/README.md`（API の Wiki の「環境別接続手順」にも同じ手順）。
- `/healthz` はリバースプロキシ（NGINX）が先に応答するため、web のヘルスチェックは `/api/health`（`{"status":"UP"}`。API には問い合わせない）。
- nonprod の稼働時間は毎日 9:00〜翌 1:00（JST）。それ以外はタスクが 0 になる。
- stg / prod の公開の入口は CloudFront ＋ 外部 ALB ＋ WAF（送信元ごとのレート制限は WAF で行う）。作るのは最後。
- **prod は、ふだんは消しておく**（公開しない前提）。そのあいだは、メンテナンスのページを出す（2026-11-07 に決めた方針。作るのは stg / prod のインフラのとき）。
  - ずっと残すもの：Route 53 のレコード・CloudFront・S3（メンテナンスの HTML）・ACM の証明書（us-east-1）。prod の本体（外部 ALB・ECS・WAF 等）とは別の state に置く（例：`aws-infra-env` の `products/sandbox/prod-edge`）。
  - 切り替え：Terraform の変数（例：`prod_enabled`）で CloudFront の行き先を変える。`false` は、すべてのパスを S3 の `maintenance.html` に向け、503（`Retry-After` 付き）で返す。`true` は ALB に向け、ALB の 502・503・504 のときだけ同じメンテナンスのページを出す。CloudFront のオリジンフェイルオーバーは使わない（POST に効かず、消した ALB を参照し続けるため）。
  - prod を作るときの順番：本体を作る → 確かめる → 行き先を ALB にする（CloudFront の反映に数分かかる）。メンテナンス中は WAF を外してよい。
  - メンテナンスのページは Next.js ではなく、1枚の静的な HTML（見た目はキャンバスの「メンテナンス中」）。Terraform で S3 に置く（本リポジトリでは Terraform を使わないため、`aws-infra-env` に置く）。

## CI・デプロイ（api と同じ作り）

`../yosing-sandbox-api` の `.github/workflows`・`deploy/`・CLAUDE.md の「nonprod へのデプロイ」を手本にした。手順を直すときは、api とそろえるかも考える。

- ワークフロー：契機ごとのファイルが、共通の手順（ファイル名の先頭が `_`）を呼ぶ。手順を直すときは `_build.yml` / `_deploy.yml` の1か所だけを直す。E2E ができたら、`e2e` のジョブを後ろに足す。

| ファイル | 契機 | 内容 |
| :--- | :--- | :--- |
| `pr.yml` | PR（作成・更新） | `_build` → `_deploy`（`pr<番号>`、`dev-api` を呼ぶ）→ PR へのコメント |
| `develop.yml` | develop へのマージ | `_build` → `_deploy`（`dev`）と `_deploy`（`test`）を並べて動かす |
| `pr-cleanup.yml` | PR を閉じたとき | PR 環境の削除（ECS のサービス・Cloud Map のサービス・稼働時間のスケジュール） |
| `_build.yml` | 呼ばれる側 | `check`（`npm run check`・`npm run build`）→ `image`（Dockerfile で arm64 のイメージを作って push。タグを返す） |
| `_deploy.yml` | 呼ばれる側 | 1つの環境（入力：`app_env`・`api_env`・`image_tag`）への `deploy` → `verify`（`https://<env>.local.sandbox.yosing.net:8090/api/health` が `UP` になるまで待つ） |

  - `concurrency`：`pr.yml` と `pr-cleanup.yml` は `pr-<番号>` のグループ（新しい実行が古い実行を止める）。`develop.yml` は止めずに順番に流す。
  - PR の Conversation に、PR 環境の URL をコメントで出す（`.github/scripts/pr-env-comment.sh`。api と同じもの）。
- タスク定義の環境変数：`APP_ENV`（`dev` / `test` / `pr<番号>`）、`API_BASE_URL`（`http://<API_ENV>-api.sandbox.internal:8080`。`API_ENV` は dev / test、PR 環境は dev）。web のタスクロールはアプリの環境で共有するため、api の `ROLE_ENV` に当たるものは無い。
- タスクのサイズ：0.25 vCPU / 0.5GB（Fargate の最小。足りなければ上げる）。
- AWS への認証は GitHub の OIDC。CI ロールは NonProd の `github-actions-sandbox-web-role`（引き受けられるのは `pull_request` と develop ブランチ）。ジョブに `environment:` を付けない（OIDC の `sub` が変わり、信頼ポリシーに合わなくなる）。
- アカウント ID・ロールの ARN・ECR の URL はファイルに書かず、GitHub の Variables（`AWS_ROLE_ARN`・`ECR_REGISTRY`）に置き、ワークフローの最初に `::add-mask::` で伏せる。
- デプロイは ecspresso。値は SSM パラメータから読む（`/products/sandbox/ecs/*`、`/products/sandbox/cloud-map/namespace-id`、`/products/sandbox/web/task-role-arn`、`/products/sandbox/web/security-group-id`、`/products/sandbox/web/log-group-name`、`/infra-env/network/private-subnet-ids`）。
- 名前：ECS のサービス・Cloud Map のサービスは `<env>-web`、タスク定義のファミリーは `sandbox-<env>-web`、ロググループは `/sandbox/nonprod/web`（ログストリームの先頭を `<env>/`）。
- イメージは1コミットにつき1つ。環境の違いはタスク定義の環境変数だけ（ビルドの時に環境ごとの値を埋め込まない。Next.js の `NEXT_PUBLIC_*` に環境ごとの値を入れない）。
- イメージは linux/arm64。Dockerfile のビルドの段を `$BUILDPLATFORM`（x86 のランナー）で動かし、実行の段だけ arm64 にする（エミュレーションしない）。CI の `image` のジョブも、この Dockerfile でビルドする（手元と同じ作り方）。
- CI で AccessDenied が出たら、CI ロールの権限（`aws-infra-env` の `products/sandbox/nonprod/iam.tf`）を直す。

## git

- **このリポジトリは develop ブランチを使う**（全リポジトリ共通のルール「main と作業ブランチだけ」の例外）。理由：api と CI の契機・デプロイの流れ（PR → PR 環境、develop → dev / test、main → stg）をそろえるため。CI ロールの信頼ポリシーも `pull_request` と develop ブランチで作ってある。
- 作業ごとに `origin/develop` から新しいブランチを作り、作った後に `git branch --unset-upstream` を実行する。
- コミットはユーザーの承認を得てから。メッセージは日本語で `feat:` / `fix:` / `docs:` 等で始め、最後に `Co-Authored-By` の行を付ける。
- push・マージはユーザーが行う（Claude は push しない）。

## 作業の進め方

- やり取り・コードのコメント・ドキュメントは日本語。
- AWS のリソースを変える操作（作成・削除）は、CI 経由かユーザーの確認のうえで行う。
- Norton の TLS 検査で、Claude のシェルからの通信（npm のパッケージのダウンロード等）が証明書のエラーで失敗することがある。その場合は、ユーザーに PowerShell で実行してもらうコマンドを示す。
- API の仕様を変える必要が出たら、web で回避せず、api のリポジトリで直す（API の Wiki と Notion の 4.3 も一緒に直す）。
