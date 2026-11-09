#!/usr/bin/env bash
# PR 環境のコメント（先頭に目印 <!-- pr-env --> の付いた、github-actions のコメント）を作る・書き換える
#   使い方：bash pr-env-comment.sh <PR の番号> <upsert|update>   （本文は標準入力から渡す）
#     upsert … あれば書き換え、無ければ作る（デプロイのとき）
#     update … あるときだけ書き換える（PR 環境の削除のとき。デプロイしていない PR にはコメントしない）
#   環境変数：GH_TOKEN（pull-requests: write）、GITHUB_REPOSITORY
set -euo pipefail

pr="$1"
mode="$2"
marker='<!-- pr-env -->'
body="${marker}
$(cat)"

id=$(gh api --paginate "repos/${GITHUB_REPOSITORY}/issues/${pr}/comments" \
  --jq ".[] | select(.user.login == \"github-actions[bot]\" and (.body | startswith(\"${marker}\"))) | .id" \
  | sed -n '1p')

if [ -n "${id}" ]; then
  gh api --method PATCH "repos/${GITHUB_REPOSITORY}/issues/comments/${id}" -f body="${body}" > /dev/null
  echo "コメントを書き換えた"
elif [ "${mode}" = "upsert" ]; then
  gh api --method POST "repos/${GITHUB_REPOSITORY}/issues/${pr}/comments" -f body="${body}" > /dev/null
  echo "コメントを作った"
else
  echo "コメントが無い"
fi
