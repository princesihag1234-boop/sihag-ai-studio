const DEFAULT_AI_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : "http://127.0.0.1:8000";

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export const AI_BACKEND_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? DEFAULT_AI_BACKEND_URL
);

export const AI_REQUEST_TIMEOUT_MS = 8000;

export const AI_TOOL_KEYS = [
  "remove_background",
  "generative_fill",
  "generative_replace",
  "enhance",
  "upscale",
  "restore_photo",
] as const;

export type AiToolKey = (typeof AI_TOOL_KEYS)[number];

export type AiBackendHealth = {
  status: string;
  service: string;
  version: string;
  utc_time: string;
};

export type AiCapabilities = {
  backend_ready: boolean;
  tools: Record<AiToolKey, boolean>;
};

export type AiBackendSnapshot = {
  health: AiBackendHealth;
  capabilities: AiCapabilities;
  checkedAt: string;
  latencyMs: number;
};

export type AiClientErrorCode =
  | "timeout"
  | "network"
  | "http"
  | "invalid-response";

export class AiClientError extends Error {
  readonly code: AiClientErrorCode;
  readonly status: number | null;

  constructor(
    message: string,
    code: AiClientErrorCode,
    status: number | null = null
  ) {
    super(message);
    this.name = "AiClientError";
    this.code = code;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildAiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${AI_BACKEND_URL}${normalizedPath}`;
}

async function requestJson(path: string, label: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildAiUrl(path), {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new AiClientError(
        `${label} returned HTTP ${response.status}.`,
        "http",
        response.status
      );
    }

    try {
      return await response.json();
    } catch {
      throw new AiClientError(
        `${label} returned an invalid JSON response.`,
        "invalid-response",
        response.status
      );
    }
  } catch (error) {
    if (error instanceof AiClientError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AiClientError(
        `${label} timed out after ${AI_REQUEST_TIMEOUT_MS / 1000} seconds.`,
        "timeout"
      );
    }

    throw new AiClientError(
      error instanceof Error
        ? `${label} could not connect: ${error.message}`
        : `${label} could not connect to the AI backend.`,
      "network"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseHealth(value: unknown): AiBackendHealth {
  if (!isRecord(value)) {
    throw new AiClientError(
      "AI health response has an invalid shape.",
      "invalid-response"
    );
  }

  const status = value.status;
  const service = value.service;
  const version = value.version;
  const utcTime = value.utc_time;

  if (
    typeof status !== "string" ||
    typeof service !== "string" ||
    typeof version !== "string" ||
    typeof utcTime !== "string"
  ) {
    throw new AiClientError(
      "AI health response is missing required fields.",
      "invalid-response"
    );
  }

  return {
    status,
    service,
    version,
    utc_time: utcTime,
  };
}

function parseCapabilities(value: unknown): AiCapabilities {
  if (!isRecord(value)) {
    throw new AiClientError(
      "AI capabilities response has an invalid shape.",
      "invalid-response"
    );
  }

  const rawTools = isRecord(value.tools) ? value.tools : {};

  const tools = Object.fromEntries(
    AI_TOOL_KEYS.map((key) => [key, rawTools[key] === true])
  ) as Record<AiToolKey, boolean>;

  return {
    backend_ready: value.backend_ready === true,
    tools,
  };
}

export async function getAiBackendHealth(): Promise<AiBackendHealth> {
  return parseHealth(await requestJson("/health", "AI backend"));
}

export async function getAiCapabilities(): Promise<AiCapabilities> {
  return parseCapabilities(
    await requestJson("/api/ai/capabilities", "AI capabilities")
  );
}

export async function getAiBackendSnapshot(): Promise<AiBackendSnapshot> {
  const startedAt = performance.now();

  const [health, capabilities] = await Promise.all([
    getAiBackendHealth(),
    getAiCapabilities(),
  ]);

  return {
    health,
    capabilities,
    checkedAt: new Date().toISOString(),
    latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
  };
}

export function getAiBackendDisplayTarget() {
  return AI_BACKEND_URL || "Same-origin API";
}
