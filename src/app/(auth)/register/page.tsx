import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetWhenHidden } from "@/components/reset-when-hidden";
import { parseRegisterNotice } from "@/features/register/form-state";
import { RegisterForm } from "@/features/register/RegisterForm";

export const metadata: Metadata = { title: "新規登録" };

// /register：新規登録（ステップ1）
//   ?notice=restart・taken：ステップ2から戻したときのお知らせ（決まった値だけを受け付ける）
export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    // URL の値（searchParams）は要求ごとに変わるため、Suspense の中で読む（Cache Components の決まり）
    <Suspense>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const { notice } = await searchParams;
  return (
    <ResetWhenHidden>
      <RegisterForm initialNotice={parseRegisterNotice(notice)} />
    </ResetWhenHidden>
  );
}
