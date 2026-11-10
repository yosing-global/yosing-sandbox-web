import { House, Square, UserRound } from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { FEATURES, type MenuItem, SETTINGS } from "@/features/dashboard/menu";
import { cn } from "@/lib/utils";

// ダッシュボードのメニュー（PC は左の列、スマホはメニューのボタンで開く）。今の画面に aria-current="page"

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const itemClass =
  "flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-slate-700 no-underline max-md:min-h-12 max-md:text-[15px]";

function Item({ item, icon: Icon, current }: { item: MenuItem; icon: Icon; current?: boolean }) {
  const content = (
    <>
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
      {item.name}
    </>
  );
  if (item.href === undefined) {
    // 画面がまだ無い（仮置き）。押せる見た目にしない
    return <span className={cn(itemClass, "text-subtle")}>{content}</span>;
  }
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      className={cn(itemClass, current ? "bg-info-soft font-bold text-link" : "hover:bg-secondary")}
    >
      {content}
    </Link>
  );
}

function Group({ label }: { label: string }) {
  return <li className="mx-3 mt-4 mb-1 text-xs font-bold text-subtle max-md:mt-3">{label}</li>;
}

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="メニュー" onClick={onNavigate}>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        <li>
          <Item item={{ name: "ホーム", href: "/dashboard" }} icon={House} current />
        </li>
        <Group label="機能" />
        {FEATURES.map((item) => (
          <li key={item.name}>
            <Item item={item} icon={Square} />
          </li>
        ))}
        <Group label="設定" />
        {SETTINGS.map((item) => (
          <li key={item.name}>
            <Item item={item} icon={UserRound} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
