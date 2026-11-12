import { act, render, screen } from "@testing-library/react";
import { Activity, Suspense, use } from "react";
import { describe, expect, it } from "vitest";
import { UnmountWhenHidden } from "./unmount-when-hidden";

// Next.js（Cache Components）は、離れた画面を <Activity> で隠して残す。ダッシュボードの layout と同じく、
// Activity の中の <Suspense> の中に UnmountWhenHidden を置いて確かめる

// 中身：suspend すると決めたら、届かないデータを待つ（出直したときに、まだデータが届いていない場面）
const neverResolves = new Promise<never>(() => {});
const state = { suspend: false };
function Content() {
  if (state.suspend) {
    use(neverResolves);
  }
  return <p>ログイン ID</p>;
}

function Page({ mode }: { mode: "visible" | "hidden" }) {
  return (
    <Activity mode={mode}>
      <Suspense fallback={<p>読み込み中</p>}>
        <UnmountWhenHidden>
          <Content />
        </UnmountWhenHidden>
      </Suspense>
    </Activity>
  );
}

describe("UnmountWhenHidden", () => {
  it("隠れたら中身を DOM から外し、出直したら中身を出す", async () => {
    state.suspend = false;
    const { rerender } = render(<Page mode="visible" />);
    expect(screen.getByText("ログイン ID")).toBeInTheDocument();

    await act(async () => rerender(<Page mode="hidden" />));
    expect(screen.queryByText("ログイン ID")).not.toBeInTheDocument();

    await act(async () => rerender(<Page mode="visible" />));
    expect(screen.getByText("ログイン ID")).toBeVisible();
  });

  // 出直したときに中身が suspend しても、外側の Suspense を待ちの表示にしない
  //   外側が待ちの表示になると UnmountWhenHidden も隠れ、後片付けで中身が外れ、また出直す…を繰り返す
  //   （React の誤り #185。Maximum update depth exceeded）
  it("出直したときに中身が suspend しても、出直しを繰り返さない", async () => {
    state.suspend = false;
    const { rerender } = render(<Page mode="visible" />);
    await act(async () => rerender(<Page mode="hidden" />));

    state.suspend = true;
    await act(async () => rerender(<Page mode="visible" />));

    expect(screen.queryByText("ログイン ID")).not.toBeInTheDocument();
    expect(screen.queryByText("読み込み中")).not.toBeInTheDocument();
  });
});
