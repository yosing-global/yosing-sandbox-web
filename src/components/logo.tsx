// ロゴ（ヘッダーの左。アイコン＋「sandbox」）
export function Logo() {
  return (
    <div className="flex items-center gap-2 md:gap-2.5">
      <LogoMark className="size-[26px] rounded-[6px] md:size-7 md:rounded-[7px]" />
      <span className="text-[17px] font-bold tracking-wide md:text-lg">sandbox</span>
    </div>
  );
}

// アイコンの絵（src/app/icon.svg と同じ絵。直すときは両方を直す）。
// 角の丸めは CSS で付ける（SVG の clipPath は id が要り、隠れて残る画面のロゴと id がぶつかるため）
function LogoMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={`shrink-0 overflow-hidden ${className}`}>
      <rect width="64" height="64" fill="#2563EB" />
      <path d="M0 50 Q16 42 32 46 Q48 42 64 49 V64 H0Z" fill="#D9A441" />
      <path
        d="M19 12 L32 29 L45 12 M32 29 V50"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M0 55 Q18 47 33 51 Q49 47 64 54 V64 H0Z" fill="#F2C46D" />
      <circle cx="12" cy="38" r="2.2" fill="#F2C46D" />
      <circle cx="8" cy="31" r="1.6" fill="#F2C46D" />
      <circle cx="53" cy="36" r="2" fill="#F2C46D" />
    </svg>
  );
}
