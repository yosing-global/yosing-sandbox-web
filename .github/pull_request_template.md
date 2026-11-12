## 概要

<!-- 何のための変更か -->

## 変更内容

-

## 影響する範囲

<!-- 該当するものにチェック。他リポジトリの変更が要る場合は「他リポジトリ・手作業」に書く -->

- [ ] 画面の見た目・文言（Notion の「4.1 UI/UX設計」と揃えた。文言・部品の名前を変えたら、E2E の `yosing-sandbox-e2e` の develop を先に直す）
- [ ] BFF（API の呼び出し・Cookie・CSRF）
- [ ] API の入出力に関わる（API の変更が要るなら `yosing-sandbox-api` で直す）
- [ ] タスク定義・サービスの定義（ecspresso）
- [ ] CI のワークフロー
- [ ] インフラ（`aws-infra-env` の変更が要る。IAM の権限等）

## 動作確認

- [ ] `npm run check`（整形・ESLint・型チェック・単体テスト）が通る
- [ ] `npm run build` が通る
- [ ] PR 環境（`pr<番号>`）へのデプロイ・ヘルスチェック・E2E が成功した
- [ ] 手元（`npm run dev`）で画面を確認した（該当しない場合もチェック）

## 確認事項

- [ ] パスワード・コード・TOTP の秘密情報・設定 URI・セッション ID・仮認証 JWT・Cookie をログや画面のエラーに出していない
- [ ] API の URL・セッション ID・仮認証 JWT をブラウザーの JavaScript に渡していない（API はサーバー側からだけ呼ぶ）
- [ ] `NEXT_PUBLIC_*` に環境ごとの値を入れていない
- [ ] アカウント ID・ロールの ARN・ECR の URL をファイルに書いていない（GitHub の Variables・SSM パラメータを使う）
- [ ] 入力欄にラベル、アイコンだけのボタンに `aria-label`、お知らせの枠に `role` を付けた（画面を変えていない場合もチェック）
- [ ] 必要に応じて README.md / CLAUDE.md / Notion の設計を更新した

## 他リポジトリ・手作業

<!-- aws-infra-env の修正、GitHub の Variables の追加、E2E の文言の修正など -->

なし
