import "server-only";
import { apiBaseUrl } from "@/server/config";
import { logger } from "@/server/logger";

// API（yosing-sandbox-api）の呼び出しの共通部分
//   想定した失敗（4xx で code の付いた Problem Details）は、例外にせず結果として返す（code から結果の型への変換は呼ぶ側）
//   想定外の失敗（つながらない・時間切れ・5xx・形の違う応答）は、ApiUnexpectedError を投げる（画面のエラー 500 に任せる）
//   ログには、操作の名前・HTTP の状態・code・かかった時間だけを出す（URL のパス・本文・ヘッダーは出さない）

/** API の誤りの応答（Problem Details）のうち、BFF が使う項目 */
export type ApiProblem = {
  status: number;
  code: string;
  /** VALIDATION_FAILED のとき、項目ごとの誤り */
  errors?: { field: string; message: string }[];
};

export type ApiResult<T> =
  { ok: true; status: number; data: T } | { ok: false; problem: ApiProblem };

export type ApiRequest = {
  /** 操作の名前（ログに出す。例：startLogin） */
  operation: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
  body?: unknown;
  /** セッション ID（Authorization: Bearer で渡す） */
  sessionId?: string;
};

/** 想定外の失敗。message には秘密の値を入れない */
export class ApiUnexpectedError extends Error {
  constructor(
    readonly operation: string,
    readonly status?: number,
    readonly code?: string,
    options?: ErrorOptions,
  ) {
    super(
      `API の呼び出しに失敗した（${operation}、status=${status ?? "-"}、code=${code ?? "-"}）`,
      options,
    );
    this.name = "ApiUnexpectedError";
  }
}

const TIMEOUT_MS = 10_000;

export async function callApi<T>(request: ApiRequest): Promise<ApiResult<T>> {
  const { operation, method, path, body, sessionId } = request;
  const headers: Record<string, string> = {
    Accept: "application/json, application/problem+json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (sessionId !== undefined) {
    headers.Authorization = `Bearer ${sessionId}`;
  }

  // 設定の誤り（API_BASE_URL が無い）は、API の失敗と分けてそのまま投げる
  const url = `${apiBaseUrl()}${path}`;
  const started = performance.now();
  const log = (level: "info" | "error", status?: number, code?: string, err?: unknown) =>
    logger[level](
      {
        api: { operation, status, code },
        // ECS の event.duration はナノ秒
        event: { duration: Math.round((performance.now() - started) * 1_000_000) },
        ...(err instanceof Error ? { error: { type: err.name, message: err.message } } : {}),
      },
      `API ${operation}`,
    );

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    log("error", undefined, undefined, err);
    throw new ApiUnexpectedError(operation, undefined, undefined, { cause: err });
  }

  const status = response.status;
  const json = await readJson(response);

  if (response.ok) {
    if (status !== 204 && json === undefined) {
      log("error", status);
      throw new ApiUnexpectedError(operation, status);
    }
    log("info", status);
    return { ok: true, status, data: json as T };
  }

  const problem = toProblem(status, json);
  if (status >= 500 || problem === undefined) {
    log("error", status, problem?.code);
    throw new ApiUnexpectedError(operation, status, problem?.code);
  }
  log("info", status, problem.code);
  return { ok: false, problem };
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toProblem(status: number, json: unknown): ApiProblem | undefined {
  if (typeof json !== "object" || json === null) {
    return undefined;
  }
  const { code, errors } = json as { code?: unknown; errors?: unknown };
  if (typeof code !== "string") {
    return undefined;
  }
  const problem: ApiProblem = { status, code };
  if (Array.isArray(errors)) {
    problem.errors = errors.filter(
      (e): e is { field: string; message: string } =>
        typeof e?.field === "string" && typeof e?.message === "string",
    );
  }
  return problem;
}
