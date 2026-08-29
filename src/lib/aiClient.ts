const DEFAULT_AI_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : "http://127.0.0.1:8000";

export const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? DEFAULT_AI_BACKEND_URL;

export type AiBackendHealth = {
  status: string;
  service: string;
  version: string;
  utc_time: string;
};

export type AiCapabilities = {
  backend_ready: boolean;
  tools: {
    remove_background: boolean;
    generative_fill: boolean;
    generative_replace: boolean;
    enhance: boolean;
    upscale: boolean;
    restore_photo: boolean;
  };
};

export async function getAiBackendHealth() {
  const response =
    await fetch(
      `${AI_BACKEND_URL}/health`,
      {
        cache:
          "no-store",
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `AI backend returned ${response.status}`
    );
  }

  return (
    await response.json()
  ) as AiBackendHealth;
}

export async function getAiCapabilities() {
  const response =
    await fetch(
      `${AI_BACKEND_URL}/api/ai/capabilities`,
      {
        cache:
          "no-store",
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `AI capabilities returned ${response.status}`
    );
  }

  return (
    await response.json()
  ) as AiCapabilities;
}
