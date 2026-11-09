import { Check } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

// ステップ表示（今のステップに aria-current="step"。済んだステップはチェックの印と「（完了）」の読み上げ）
type Props = {
  /** 例：登録の手順 */
  label: string;
  steps: readonly string[];
  /** 今のステップ（0 から） */
  current: number;
};

export function Steps({ label, steps, current }: Props) {
  return (
    <ol aria-label={label} className="m-0 flex list-none items-center gap-2.5 p-0 md:gap-3">
      {steps.map((name, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={name}>
            {i > 0 && (
              <li
                aria-hidden="true"
                className={cn(
                  "h-0.5 min-w-4 flex-1 md:min-w-6",
                  i <= current ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <li
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 text-sm",
                active
                  ? "font-bold text-link"
                  : done
                    ? "font-medium text-link"
                    : "font-medium text-subtle",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[13px]",
                  done || active
                    ? "bg-primary text-primary-foreground"
                    : "border-[1.5px] border-slate-400 text-subtle",
                )}
              >
                {done ? <Check aria-hidden="true" className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {name}
              {done && <span className="sr-only">（完了）</span>}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
