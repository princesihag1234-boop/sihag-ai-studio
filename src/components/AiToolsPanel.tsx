"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAiBackendHealth,
  getAiCapabilities,
  type AiBackendHealth,
  type AiCapabilities,
} from "@/lib/aiClient";

type BackendState =
  | "checking"
  | "online"
  | "offline";

export default function AiToolsPanel() {
  const [
    backendState,
    setBackendState,
  ] =
    useState<BackendState>(
      "checking"
    );

  const [
    health,
    setHealth,
  ] =
    useState<AiBackendHealth | null>(
      null
    );

  const [
    capabilities,
    setCapabilities,
  ] =
    useState<AiCapabilities | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  const checkBackend =
    useCallback(
      async () => {
        setBackendState(
          "checking"
        );

        setErrorMessage(
          null
        );

        try {
          const [
            nextHealth,
            nextCapabilities,
          ] =
            await Promise.all([
              getAiBackendHealth(),
              getAiCapabilities(),
            ]);

          setHealth(
            nextHealth
          );

          setCapabilities(
            nextCapabilities
          );

          setBackendState(
            "online"
          );
        } catch (
          error
        ) {
          setHealth(
            null
          );

          setCapabilities(
            null
          );

          setBackendState(
            "offline"
          );

          setErrorMessage(
            error instanceof
              Error
              ? error.message
              : "Could not connect to AI backend."
          );
        }
      },
      []
    );

  useEffect(
    () => {
      void checkBackend();

      const timer =
        window.setInterval(
          () => {
            void checkBackend();
          },
          10000
        );

      return () =>
        window.clearInterval(
          timer
        );
    },
    [
      checkBackend,
    ]
  );

  const tools = [
    {
      key:
        "remove_background" as const,

      name:
        "Remove Background",

      description:
        "Create a transparent subject cutout.",
    },

    {
      key:
        "generative_fill" as const,

      name:
        "Generative Fill",

      description:
        "Generate content inside a selection.",
    },

    {
      key:
        "generative_replace" as const,

      name:
        "Generative Replace",

      description:
        "Replace selected content using a prompt.",
    },

    {
      key:
        "enhance" as const,

      name:
        "AI Enhance",

      description:
        "Improve clarity, detail and image quality.",
    },

    {
      key:
        "upscale" as const,

      name:
        "AI Upscale",

      description:
        "Increase image resolution with AI.",
    },

    {
      key:
        "restore_photo" as const,

      name:
        "Photo Restore",

      description:
        "Repair old or damaged photographs.",
    },
  ];

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>

          <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
            AI TOOLS
          </div>

          <div className="mt-1 text-[9px] text-gray-600">
            Local SIHAG AI backend
          </div>

        </div>

        <button
          onClick={() =>
            void checkBackend()
          }
          className={
            backendState ===
            "online"
              ? "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] text-emerald-300"
              : backendState ===
                  "checking"
                ? "rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] text-amber-300"
                : "rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[9px] text-red-300"
          }
          title="Click to check the AI backend again"
        >
          {backendState ===
          "online"
            ? "● ONLINE"
            : backendState ===
                "checking"
              ? "● CHECKING"
              : "● OFFLINE"}
        </button>

      </div>

      {backendState ===
        "online" &&
      health && (
        <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">

          <div className="flex items-center justify-between text-[9px]">

            <span className="text-gray-500">
              Service
            </span>

            <span className="text-emerald-200">
              {health.service}
            </span>

          </div>

          <div className="mt-1 flex items-center justify-between text-[9px]">

            <span className="text-gray-500">
              Backend version
            </span>

            <span className="text-gray-300">
              {health.version}
            </span>

          </div>

        </div>
      )}

      {backendState ===
        "offline" && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3">

          <div className="text-[10px] font-medium text-red-300">
            AI backend is offline
          </div>

          <div className="mt-1 text-[9px] leading-4 text-gray-600">
            Start backend\run_backend.bat and keep its Command Prompt window open.
          </div>

          {errorMessage && (
            <div className="mt-2 break-all text-[8px] leading-4 text-red-300/60">
              {errorMessage}
            </div>
          )}

        </div>
      )}

      <div className="mt-3 space-y-2">

        {tools.map(
          (tool) => {
            const enabled =
              backendState ===
                "online" &&
              capabilities?.tools[
                tool.key
              ] ===
                true;

            return (
              <button
                key={
                  tool.key
                }
                disabled={
                  !enabled
                }
                className={
                  enabled
                    ? "w-full rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] p-3 text-left hover:border-indigo-500/45 hover:bg-indigo-500/10"
                    : "w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.025] p-3 text-left opacity-55"
                }
              >

                <div className="flex items-center justify-between gap-3">

                  <span className={
                    enabled
                      ? "text-[10px] font-medium text-indigo-200"
                      : "text-[10px] font-medium text-gray-400"
                  }>
                    {tool.name}
                  </span>

                  <span className={
                    enabled
                      ? "rounded bg-indigo-500/15 px-2 py-0.5 text-[8px] text-indigo-200"
                      : "rounded bg-white/5 px-2 py-0.5 text-[8px] text-gray-600"
                  }>
                    {enabled
                      ? "READY"
                      : "COMING NEXT"}
                  </span>

                </div>

                <div className="mt-1 text-[9px] leading-4 text-gray-600">
                  {tool.description}
                </div>

              </button>
            );
          }
        )}

      </div>

      <div className="mt-3 text-[9px] leading-4 text-gray-600">
        This panel is already connected to the FastAPI backend. AI buttons will activate as each model endpoint is added.
      </div>

    </section>
  );
}
