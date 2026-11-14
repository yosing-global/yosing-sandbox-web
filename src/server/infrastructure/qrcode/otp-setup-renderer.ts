import "server-only";
import QRCode from "qrcode";
import type { OtpSetupRenderer } from "@/server/application/port/otp-setup-renderer";

// 設定 URI（otpauthUri）→ QR コードの SVG・セットアップキー
//   QR コードは自分のサーバーで作る（外部の生成サービスに設定 URI を渡さない）
//   設定 URI・キーは秘密情報。ログ・例外のメッセージに入れない

export const otpSetupRenderer: OtpSetupRenderer = {
  async render(otpauthUri) {
    const secret = readSecret(otpauthUri);
    const qrCodeSvg = await QRCode.toString(otpauthUri, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 0,
      color: { dark: "#0f172aff", light: "#ffffffff" },
    });
    return { qrCodeSvg, setupKey: formatSetupKey(secret) };
  },
};

function readSecret(otpauthUri: string): string {
  let secret: string | null = null;
  try {
    const url = new URL(otpauthUri);
    secret = url.protocol === "otpauth:" ? url.searchParams.get("secret") : null;
  } catch {
    // 下で投げる
  }
  if (!secret) {
    throw new Error("設定 URI からキーを取り出せない");
  }
  return secret;
}

/** 読み写ししやすいように、4文字ずつ空白で区切る（認証アプリは空白を無視する） */
export function formatSetupKey(secret: string): string {
  return (
    secret
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
}
