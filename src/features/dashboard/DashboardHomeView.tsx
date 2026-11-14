import { ChevronRight, Square } from "lucide-react";
import Link from "next/link";
import { FEATURES, type MenuItem } from "@/features/dashboard/menu";
import { cn } from "@/lib/utils";

// ダッシュボードのホーム：機能のカードと、アカウント（ログイン ID・登録した日時）

type Props = {
  loginId: string;
  /** 登録した日時（日本時間の表示。例：2026年11月3日 10:25） */
  createdAt: string;
};

export function DashboardHomeView({ loginId, createdAt }: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5 md:gap-2">
        <h1 className="m-0 text-2xl font-bold md:text-[28px]">ホーム</h1>
        <p className="m-0 text-[15px] break-all text-muted-foreground">
          ようこそ、{loginId} さん。
        </p>
      </div>

      <section aria-labelledby="home-features" className="flex flex-col gap-3 md:gap-4">
        <h2 id="home-features" className="m-0 text-[17px] font-bold md:text-lg">
          機能
        </h2>
        <div className="grid gap-3 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] md:gap-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.name} feature={feature} />
          ))}
        </div>
      </section>

      <section aria-labelledby="home-account" className="flex flex-col gap-3 md:gap-4">
        <h2 id="home-account" className="m-0 text-[17px] font-bold md:text-lg">
          アカウント
        </h2>
        <dl className="m-0 grid max-w-[640px] rounded-xl border border-border md:grid-cols-[minmax(120px,200px)_minmax(0,1fr)]">
          <Row term="ログイン ID" value={loginId} />
          <Row term="登録した日時" value={createdAt} last />
        </dl>
      </section>
    </>
  );
}

function Row({ term, value, last }: { term: string; value: string; last?: boolean }) {
  // PC では行の枠（div）が md:contents で消えるため、区切りの線は dt・dd に引く
  const line = !last && "md:border-b md:border-border";
  return (
    // スマホは見出しと値を縦に重ね、PC は2列の表にする（同じ HTML を CSS だけで切り替える）
    <div
      className={cn(
        "flex flex-col gap-0.5 px-4 py-3.5 md:contents",
        !last && "border-b border-border",
      )}
    >
      <dt className={cn("text-[13px] text-muted-foreground md:px-5 md:py-4 md:text-sm", line)}>
        {term}
      </dt>
      <dd className={cn("m-0 text-[15px] font-medium break-all md:px-5 md:py-4", line)}>{value}</dd>
    </div>
  );
}

function FeatureCard({ feature }: { feature: MenuItem }) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-info-soft text-link"
      >
        <Square className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-3">
        <span className="text-base font-bold">{feature.name}</span>
        <span className="text-[13px] leading-relaxed text-muted-foreground md:text-sm">
          {feature.description}
        </span>
      </span>
    </>
  );
  const className =
    "flex items-center gap-3.5 rounded-xl border border-border p-4 text-foreground no-underline md:flex-col md:items-start md:gap-3 md:p-5";
  if (feature.href === undefined) {
    // 画面がまだ無い（仮置き）。リンクにしない
    return <div className={className}>{content}</div>;
  }
  return (
    <Link href={feature.href} className={cn(className, "hover:border-primary")}>
      {content}
      <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-subtle md:hidden" />
    </Link>
  );
}
