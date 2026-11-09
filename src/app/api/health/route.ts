import { connection } from "next/server";

/**
 * ヘルスチェック（ECS・CI の verify から呼ぶ）。
 * `/healthz` はリバースプロキシ（NGINX）が先に応答するため、このパスを使う。
 * API など外部への通信はしない（web 自身が応答できるかだけを確かめる）。
 */
export async function GET(): Promise<Response> {
  // ビルドの時に静的な応答として固めず、要求のたびに応答する
  await connection();
  return Response.json({ status: "UP" }, { headers: { "Cache-Control": "no-store" } });
}
