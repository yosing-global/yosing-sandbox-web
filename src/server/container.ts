import "server-only";
import { startRegistration } from "@/server/application/registration/start-registration";
import { verifyRegistration } from "@/server/application/registration/verify-registration";
import { registrationApiClient } from "@/server/infrastructure/api/registration-api-client";
import { otpSetupRenderer } from "@/server/infrastructure/qrcode/otp-setup-renderer";

// 実装の組み立て（presentation と infrastructure をつなぐ唯一の場所。DI のライブラリは使わない）
//   コントローラーはここからユースケースを受け取る。テストでは vi.mock で差し替える

export const usecases = {
  startRegistration: startRegistration({
    registrationApi: registrationApiClient,
    otpSetupRenderer,
  }),
  verifyRegistration: verifyRegistration({ registrationApi: registrationApiClient }),
};
