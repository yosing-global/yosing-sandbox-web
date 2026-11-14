import { TriangleAlert } from "lucide-react";
import { AuthHeader } from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// エラーの画面（500）・ページが見つからない（404）の見た目
//   ヘッダーはロゴだけ（ログイン中かどうかに関係なく出せるように）
//   「ホームに戻る」は / へ（開く前に proxy が、ログイン中なら /dashboard、そうでなければ /login へ移す）
//   画面の中だけの移動ではなく、全体を読み込み直す（エラーで崩れた画面の状態を引き継がない）

const HOME_HREF = "/";

const buttonBase =
  "inline-flex h-12 items-center justify-center rounded-lg px-6 text-base no-underline max-md:w-full";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHeader />
      <main className="flex flex-1 justify-center px-4 pt-24 pb-8 md:items-center md:pt-12 md:pb-24">
        <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
          {children}
        </div>
      </main>
    </>
  );
}

/** エラーの画面（想定外のエラー。API の detail などの中身は出さない） */
export function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <Frame>
      <span
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger"
      >
        <TriangleAlert className="size-[30px]" />
      </span>
      <div className="flex flex-col gap-2.5">
        <h1 className="m-0 text-[22px] font-bold md:text-[26px]">エラーが発生しました</h1>
        <p className="m-0 text-[15px] leading-[1.7] text-muted-foreground">
          しばらく時間をおいてから、
          <br className="md:hidden" />
          もう一度お試しください。
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 max-md:mt-2 md:w-auto md:flex-row md:flex-wrap md:justify-center">
        <Button type="button" onClick={onRetry} className={cn(buttonBase, "font-bold")}>
          もう一度試す
        </Button>
        <a
          href={HOME_HREF}
          className={cn(
            buttonBase,
            "border border-slate-300 font-medium text-slate-700 hover:bg-secondary",
          )}
        >
          ホームに戻る
        </a>
      </div>
    </Frame>
  );
}

/** ページが見つからない（存在しない URL） */
export function NotFoundView() {
  return (
    <Frame>
      <span className="text-5xl leading-none font-bold tracking-wider text-link md:text-[56px]">
        404
      </span>
      <div className="flex flex-col gap-2.5">
        <h1 className="m-0 text-[22px] font-bold md:text-[26px]">ページが見つかりません</h1>
        <p className="m-0 text-[15px] leading-[1.7] text-muted-foreground">
          URL が正しいか確かめてください。
        </p>
      </div>
      <a
        href={HOME_HREF}
        className={cn(
          buttonBase,
          "bg-primary font-bold text-primary-foreground hover:bg-primary/90 max-md:mt-2",
        )}
      >
        ホームに戻る
      </a>
    </Frame>
  );
}
