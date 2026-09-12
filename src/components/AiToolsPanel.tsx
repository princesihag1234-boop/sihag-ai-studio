"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AI_TOOL_KEYS,
  getAiBackendDisplayTarget,
  getAiBackendSnapshot,
  type AiBackendHealth,
  type AiCapabilities,
  type AiToolKey,
} from "@/lib/aiClient";

type BackendState = "checking" | "online" | "offline";

type AiToolDefinition = {
  key: AiToolKey;
  name: string;
  description: string;
  group: "Cutout" | "Generative" | "Enhance" | "Restore";
};

const AI_REFRESH_INTERVAL_MS = 30000;

const AI_TOOLS: readonly AiToolDefinition[] = [
  {
    key: "remove_background",
    name: "Remove Background",
    description: "Create a transparent subject cutout.",
    group: "Cutout",
  },
  {
    key: "generative_fill",
    name: "Generative Fill",
    description: "Generate content inside a selection.",
    group: "Generative",
  },
  {
    key: "generative_replace",
    name: "Generative Replace",
    description: "Replace selected content using a prompt.",
    group: "Generative",
  },
  {
    key: "enhance",
    name: "AI Enhance",
    description: "Improve clarity, detail and image quality.",
    group: "Enhance",
  },
  {
    key: "upscale",
    name: "AI Upscale",
    description: "Increase image resolution with AI.",
    group: "Enhance",
  },
  {
    key: "restore_photo",
    name: "Photo Restore",
    description: "Repair old or damaged photographs.",
    group: "Restore",
  },
] as const;

function formatCheckedTime(value: string | null) {
  if (!value) {
    return "Not checked yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently checked";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AiToolsPanel() {
  const [backendState, setBackendState] =
    useState<BackendState>("checking");

  const [health, setHealth] =
    useState<AiBackendHealth | null>(null);

  const [capabilities, setCapabilities] =
    useState<AiCapabilities | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [lastCheckedAt, setLastCheckedAt] =
    useState<string | null>(null);

  const [latencyMs, setLatencyMs] =
    useState<number | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const requestVersionRef = useRef(0);
  const hasSuccessfulHealthRef = useRef(false);

  const checkBackend = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current;

    setRefreshing(true);
    setErrorMessage(null);

    if (!hasSuccessfulHealthRef.current) {
      setBackendState("checking");
    }

    try {
      const snapshot = await getAiBackendSnapshot();

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      hasSuccessfulHealthRef.current = true;
      setHealth(snapshot.health);
      setCapabilities(snapshot.capabilities);
      setLastCheckedAt(snapshot.checkedAt);
      setLatencyMs(snapshot.latencyMs);
      setBackendState("online");
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      hasSuccessfulHealthRef.current = false;
      setHealth(null);
      setCapabilities(null);
      setLatencyMs(null);
      setLastCheckedAt(new Date().toISOString());
      setBackendState("offline");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to AI backend."
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void checkBackend();

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        void checkBackend();
      }
    }, AI_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void checkBackend();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      requestVersionRef.current += 1;
      window.clearInterval(timer);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [checkBackend]);

  const availableToolCount = useMemo(() => {
    if (!capabilities) {
      return 0;
    }

    return AI_TOOL_KEYS.reduce(
      (count, key) => count + (capabilities.tools[key] ? 1 : 0),
      0
    );
  }, [capabilities]);

  const backendReady = capabilities?.backend_ready === true;
  const backendTarget = getAiBackendDisplayTarget();

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
            AI WORKFLOW
          </div>

          <div className="mt-1 truncate text-[9px] text-gray-600">
            SIHAG AI backend control plane
          </div>
        </div>

        <button
          type="button"
          onClick={() => void checkBackend()}
          disabled={refreshing}
          aria-live="polite"
          className={
            backendState === "online"
              ? "shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] text-emerald-300 disabled:opacity-70"
              : backendState === "checking"
                ? "shrink-0 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] text-amber-300 disabled:opacity-70"
                : "shrink-0 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[9px] text-red-300 disabled:opacity-70"
          }
          title="Check the AI backend again"
        >
          {refreshing && backendState !== "checking"
            ? "● REFRESHING"
            : backendState === "online"
              ? "● ONLINE"
              : backendState === "checking"
                ? "● CHECKING"
                : "● OFFLINE"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard
          label="Backend"
          value={
            backendState === "online"
              ? backendReady
                ? "Ready"
                : "Connected"
              : backendState === "checking"
                ? "Checking"
                : "Offline"
          }
        />

        <MetricCard
          label="AI tools"
          value={`${availableToolCount}/${AI_TOOL_KEYS.length}`}
        />

        <MetricCard
          label="Latency"
          value={latencyMs === null ? "—" : `${latencyMs} ms`}
        />

        <MetricCard
          label="Last check"
          value={formatCheckedTime(lastCheckedAt)}
        />
      </div>

      {backendState === "online" && health && (
        <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
          <InfoRow label="Service" value={health.service} />
          <InfoRow label="Backend version" value={health.version} />
          <InfoRow label="Target" value={backendTarget} breakValue />
          <InfoRow
            label="Capability state"
            value={backendReady ? "Backend ready" : "Connected, warming up"}
          />
        </div>
      )}

      {backendState === "offline" && (
        <div
          className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3"
          role="status"
        >
          <div className="text-[10px] font-medium text-red-300">
            AI backend is offline
          </div>

          <div className="mt-1 text-[9px] leading-4 text-gray-600">
            Start backend\run_backend.bat and keep its Command Prompt window open.
          </div>

          <div className="mt-2 text-[8px] leading-4 text-gray-600">
            Target: {backendTarget}
          </div>

          {errorMessage && (
            <div className="mt-2 break-words text-[8px] leading-4 text-red-300/70">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {AI_TOOLS.map((tool) => {
          const advertised = capabilities?.tools[tool.key] === true;
          const ready = backendState === "online" && backendReady && advertised;

          return (
            <div
              key={tool.key}
              className={
                ready
                  ? "w-full rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] p-3"
                  : "w-full rounded-xl border border-white/10 bg-white/[0.025] p-3 opacity-65"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className={
                      ready
                        ? "text-[10px] font-medium text-indigo-200"
                        : "text-[10px] font-medium text-gray-400"
                    }
                  >
                    {tool.name}
                  </div>

                  <div className="mt-1 text-[9px] text-gray-600">
                    {tool.group}
                  </div>
                </div>

                <span
                  className={
                    ready
                      ? "shrink-0 rounded bg-indigo-500/15 px-2 py-0.5 text-[8px] text-indigo-200"
                      : advertised
                        ? "shrink-0 rounded bg-amber-500/10 px-2 py-0.5 text-[8px] text-amber-300"
                        : "shrink-0 rounded bg-white/5 px-2 py-0.5 text-[8px] text-gray-600"
                  }
                >
                  {ready
                    ? "ENDPOINT READY"
                    : advertised
                      ? "BACKEND STARTING"
                      : "NOT AVAILABLE"}
                </span>
              </div>

              <div className="mt-1.5 text-[9px] leading-4 text-gray-600">
                {tool.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2.5 text-[9px] leading-4 text-gray-600">
        Capability cards report what the backend advertises. They stay non-interactive until the corresponding edit workflow is wired into the document pipeline, preventing a READY-looking button from silently doing nothing.
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
      <div className="text-[8px] uppercase tracking-[0.12em] text-gray-600">
        {label}
      </div>
      <div className="mt-1 truncate text-[9px] font-medium text-gray-300" title={value}>
        {value}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  breakValue = false,
}: {
  label: string;
  value: string;
  breakValue?: boolean;
}) {
  return (
    <div className="mt-1 first:mt-0 flex items-start justify-between gap-3 text-[9px]">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span
        className={
          breakValue
            ? "min-w-0 break-all text-right text-gray-300"
            : "min-w-0 truncate text-right text-gray-300"
        }
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
