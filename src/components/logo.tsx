import { Lock } from "lucide-react";

// ロゴ（ヘッダーの左。鍵のアイコン＋「sandbox」）
export function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-2.5">
      <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-primary md:size-7">
        <Lock aria-hidden="true" className="size-[15px] text-primary-foreground md:size-4" />
      </span>
      <span className="text-[17px] font-bold tracking-wide md:text-lg">sandbox</span>
    </div>
  );
}
