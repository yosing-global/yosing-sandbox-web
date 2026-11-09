import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetWhenHidden } from "@/components/reset-when-hidden";
import { parseLoginNotice } from "@/features/login/form-state";
import { LoginForm } from "@/features/login/LoginForm";

export const metadata: Metadata = { title: "ログイン" };

// /login：ログイン（ステップ1）
//   ?notice=expired・retry-later：別の画面から戻したときのお知らせ（決まった値だけを受け付ける）
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    // URL の値（searchParams）は要求ごとに変わるため、Suspense の中で読む（Cache Components の決まり）
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { notice } = await searchParams;
  return (
    // 離れたら作り直す（隠れた画面にパスワード・古いお知らせを残さない）
    <ResetWhenHidden>
      <LoginForm initialNotice={parseLoginNotice(notice)} />
    </ResetWhenHidden>
  );
}
