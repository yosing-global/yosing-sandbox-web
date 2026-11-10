import { redirect } from "next/navigation";

// /：画面は無い。ふだんは開く前に proxy が、ログイン中なら /dashboard、そうでなければ /login へ移す（src/proxy.ts）
//   proxy を通らなかったときの備えとして、ログイン画面へ移す
export default function Home() {
  redirect("/login");
}
