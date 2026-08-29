"use client";

import {
  useEffect,
} from "react";

type EditorErrorProps = {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
};

export default function EditorError({
  error,
  reset,
}: EditorErrorProps) {
  useEffect(() => {
    console.error(
      "SIHAG AI STUDIO runtime error:",
      error
    );
  }, [
    error,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090b10] p-6 text-white">

      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#12151d] p-6 shadow-2xl">

        <div className="text-[10px] font-semibold tracking-[0.16em] text-red-300/80">
          EDITOR RECOVERY
        </div>

        <h1 className="mt-3 text-xl font-semibold">
          SIHAG AI STUDIO hit an unexpected error
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          Your automatic recovery project may still be available. Try reopening the editor first. If the problem repeats, copy the error shown below before refreshing.
        </p>

        <div className="mt-5 rounded-xl border border-red-500/15 bg-red-500/[0.05] p-4">

          <div className="text-[10px] font-semibold tracking-[0.12em] text-red-300">
            ERROR DETAILS
          </div>

          <div className="mt-2 max-h-40 overflow-auto break-words font-mono text-[10px] leading-5 text-red-200/70">
            {error.message ||
              "Unknown runtime error"}
          </div>

          {error.digest && (
            <div className="mt-2 text-[9px] text-gray-600">
              Digest: {error.digest}
            </div>
          )}

        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">

          <button
            onClick={
              reset
            }
            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Reopen Editor
          </button>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
          >
            Full Refresh
          </button>

        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[10px] leading-5 text-gray-500">
          If a recovery banner appears after reopening, choose Restore to return to the most recently autosaved project state.
        </div>

      </div>

    </main>
  );
}
