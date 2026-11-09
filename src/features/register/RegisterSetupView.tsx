import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { FormEventHandler } from "react";
import { FormField } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { Steps } from "@/components/steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REGISTER_STEPS } from "@/features/register/RegisterView";
import { cn } from "@/lib/utils";
import { fieldErrorMessage, NOTICE_MESSAGES } from "@/shared/messages";
import type { FieldErrorKind } from "@/shared/validation";

// 新規登録（ステップ2：認証アプリの設定）の見た目

type Props = {
  qrCodeSvg: string;
  setupKey: string;
  /** 「QR コードを読み取れない場合」を開いておくか（スマホでは開く） */
  keyOpen: boolean;
  /** キーをコピーした直後か */
  copied: boolean;
  onCopy: () => void;
  notice?: "otp-invalid";
  fieldErrors: { code?: FieldErrorKind };
  pending: boolean;
  action: (formData: FormData) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const NOTICE_ID = "register-setup-notice";

export function RegisterSetupView({
  qrCodeSvg,
  setupKey,
  keyOpen,
  copied,
  onCopy,
  notice,
  fieldErrors,
  pending,
  action,
  onSubmit,
}: Props) {
  // SVG は HTML に直接埋め込まず、画像として出す（代替テキストで名前を付ける）
  const qrCodeSrc = `data:image/svg+xml;base64,${toBase64(qrCodeSvg)}`;
  return (
    <div className="flex flex-col gap-7 md:gap-8">
      <Steps label="登録の手順" steps={REGISTER_STEPS} current={1} />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-2xl font-bold md:text-[28px]">認証アプリの設定</h1>
        <p className="m-0 text-[15px] leading-[1.7] text-muted-foreground">
          Google Authenticator
          などの認証アプリに、このアカウントを追加します。10分以内に設定を終えてください。
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-base font-bold">1. 認証アプリで QR コードを読み取る</h2>
        <div className="self-center rounded-xl border border-border bg-background p-3 md:p-4">
          {/* data: URI の SVG のため、next/image（画像の最適化）は使わない */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeSrc}
            alt="認証アプリの設定用の QR コード"
            className="size-40 md:size-46"
            draggable={false}
          />
        </div>
        <details open={keyOpen} className="rounded-lg border border-border px-3.5">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-link">
            QR コードを読み取れない場合
          </summary>
          <div className="flex flex-col gap-2.5 pt-1 pb-3.5">
            <p className="m-0 text-sm leading-[1.7] text-muted-foreground">
              <span className="md:hidden">この端末で認証アプリを使うときは、</span>
              認証アプリで「セットアップキーを入力」を選び、次のキーを入力してください。
            </p>
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
              <code
                aria-label="セットアップキー"
                className="rounded-md bg-secondary px-3 py-2.5 font-mono text-[15px] tracking-wider wrap-break-word md:flex-[1_1_220px]"
              >
                {setupKey}
              </code>
              {/* 名前は「キーをコピー」（PC では見た目を「コピー」に縮める。見た目の文字は名前に含まれる） */}
              <Button
                type="button"
                variant="outline"
                aria-label="キーをコピー"
                onClick={onCopy}
                className="h-11 border-info-border px-3.5 text-sm text-link"
              >
                <span className="md:hidden">キーをコピー</span>
                <span className="hidden md:inline">コピー</span>
              </Button>
            </div>
            <p role="status" className={cn("m-0 text-[13px] text-subtle", !copied && "sr-only")}>
              {copied ? "コピーしました" : ""}
            </p>
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-base font-bold">2. 認証アプリに表示された6桁のコードを入力</h2>
        {notice && (
          <div id={NOTICE_ID}>
            <Notice variant="danger">{NOTICE_MESSAGES.otpInvalid}</Notice>
          </div>
        )}
        <form action={action} onSubmit={onSubmit} noValidate className="m-0 flex flex-col gap-5">
          <FormField
            id="code"
            label="6桁のコード"
            hint="コードは30秒ごとに変わります"
            error={fieldErrorMessage("code", fieldErrors.code)}
            describedBy={notice ? NOTICE_ID : undefined}
          >
            {(control) => (
              <Input
                {...control}
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="h-15 rounded-lg border-input bg-background pl-[0.5em] text-center font-mono text-[28px] tracking-[0.5em] md:text-[28px] aria-invalid:border-2 aria-invalid:border-danger aria-invalid:ring-0"
              />
            )}
          </FormField>
          <Button type="submit" disabled={pending} className="h-12 text-base font-bold">
            登録する
          </Button>
        </form>
      </section>

      <div className="border-t border-border pt-3 text-sm">
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center gap-1.5 text-link underline hover:text-blue-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          ID・パスワードの入力に戻る
        </Link>
      </div>
    </div>
  );
}

/** SVG を base64 にする（サーバー・ブラウザーの両方で動く。SVG は ASCII だが、念のため UTF-8 にしてから） */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
