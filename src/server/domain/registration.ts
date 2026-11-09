import type { RegistrationId } from "@/server/domain/values";

// 新規登録の結果の型（想定した失敗は例外にせず、kind で分ける。文言は画面の側で決める）

/** API の VALIDATION_FAILED の項目ごとの誤り（項目の名前は API のもの） */
export type ApiFieldError = { field: string };

export type Session = {
  sessionId: string;
  /** セッションの期限（API の sessionExpiresAt。Cookie の Expires にそのまま使う） */
  expiresAt: Date;
};

/** API の登録の開始の結果 */
export type RegistrationStartResult =
  | { kind: "ok"; registrationId: RegistrationId; otpauthUri: string }
  | { kind: "login-id-taken" }
  | { kind: "validation"; errors: ApiFieldError[] };

/** 認証アプリの設定に使う値（設定 URI から作る。画面に出すのは登録の確定の画面だけ） */
export type OtpSetup = {
  /** QR コードの SVG */
  qrCodeSvg: string;
  /** セットアップキー（秘密情報。4文字ずつ空白で区切る） */
  setupKey: string;
};

/** ユースケース「登録の開始」の結果（設定 URI は含めない。BFF の中で QR コードとキーにする） */
export type StartRegistrationResult =
  | ({ kind: "ok"; registrationId: RegistrationId } & OtpSetup)
  | { kind: "login-id-taken" }
  | { kind: "validation"; errors: ApiFieldError[] };

/** 登録の確定の結果 */
export type VerifyRegistrationResult =
  | { kind: "ok"; session: Session }
  | { kind: "otp-invalid" }
  /** 期限切れ・存在しない・確定済み（REGISTRATION_NOT_FOUND）、またはコードの誤りが続いた（OTP_ATTEMPTS_EXCEEDED） */
  | { kind: "restart" }
  | { kind: "login-id-taken" }
  | { kind: "validation"; errors: ApiFieldError[] };
