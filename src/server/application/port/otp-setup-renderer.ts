import type { OtpSetup } from "@/server/domain/registration";

/** 設定 URI（otpauthUri）から、認証アプリの設定に使う値（QR コード・キー）を作る */
export interface OtpSetupRenderer {
  render(otpauthUri: string): Promise<OtpSetup>;
}
