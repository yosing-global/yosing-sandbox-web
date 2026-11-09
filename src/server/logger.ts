import "server-only";
import { ecsFormat } from "@elastic/ecs-pino-format";
import pino, { type DestinationStream, type Logger } from "pino";

// ログ（ECS 形式の JSON を標準出力に出す。api と同じ項目名にそろえ、CloudWatch Logs で同じ探し方ができるようにする）
//   出さないもの：入力値（ログイン ID を含む）、パスワード・コード・TOTP の秘密情報・設定 URI・セッション ID・仮認証 JWT・Cookie
//   redact は出さないことの念のための備え（ここに頼って出してよいわけではない）
const REDACT_KEYS = [
  "password",
  "loginToken",
  "sessionId",
  "otpauthUri",
  "secret",
  "secretKey",
  "cookie",
  "authorization",
];

export function createLogger(destination?: DestinationStream): Logger {
  const options = {
    ...ecsFormat({ serviceName: "sandbox-web", apmIntegration: false }),
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "test" ? "silent" : "info"),
    redact: {
      paths: REDACT_KEYS.flatMap((key) => [key, `*.${key}`]),
      censor: "[REDACTED]",
    },
  };
  return destination ? pino(options, destination) : pino(options);
}

export const logger: Logger = createLogger();
