"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

export type AdjustmentPresetId =
  | "cinematic"
  | "warm"
  | "cool"
  | "matte"
  | "black-white"
  | "vintage";

type AdjustmentLayerPanelProps = {
  layer:
    ImageLayer | null;

  onApplyPreset: (
    preset:
      AdjustmentPresetId
  ) => void;

  onReset: () => void;

  onStrengthStart: () => void;

  onStrengthChange: (
    value: number
  ) => void;

  onToggleBypass: () => void;

  onToggleClip: () => void;

  onDuplicate: () => void;

  onRename: () => void;
};

const PRESETS: {
  id: AdjustmentPresetId;
  name: string;
  description: string;
}[] = [
  {
    id:
      "cinematic",
    name:
      "Cinematic",
    description:
      "Contrast + cool shadows",
  },

  {
    id:
      "warm",
    name:
      "Warm",
    description:
      "Warm vibrant color",
  },

  {
    id:
      "cool",
    name:
      "Cool",
    description:
      "Clean cooler tone",
  },

  {
    id:
      "matte",
    name:
      "Matte",
    description:
      "Soft faded blacks",
  },

  {
    id:
      "black-white",
    name:
      "B&W",
    description:
      "Monochrome contrast",
  },

  {
    id:
      "vintage",
    name:
      "Vintage",
    description:
      "Warm faded film",
  },
];

export default function AdjustmentLayerPanel({
  layer,
  onApplyPreset,
  onReset,
  onStrengthStart,
  onStrengthChange,
  onToggleBypass,
  onToggleClip,
  onDuplicate,
  onRename,
}: AdjustmentLayerPanelProps) {
  if (
    !layer ||
    layer.layerKind !==
      "adjustment"
  ) {
    return null;
  }

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-lg text-violet-300">
          ◐
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="text-sm font-semibold text-gray-200">
            Adjustment Layer
          </h3>

          <p className="mt-0.5 text-[10px] text-gray-500">
            Non-destructive color and tone
          </p>

        </div>

        <button
          onClick={
            onToggleBypass
          }
          title="A/B compare this adjustment"
          className={
            layer.visible
              ? "rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-[9px] text-violet-200 hover:bg-violet-500/20"
              : "rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[9px] text-amber-200 hover:bg-amber-500/20"
          }
        >
          {layer.visible
            ? "Enabled"
            : "Bypass"}
        </button>

      </div>

      <div className="mt-3 rounded-lg border border-violet-500/15 bg-violet-500/[0.05] px-3 py-2 text-[10px] leading-5 text-gray-400">
        {layer.clipToBelow
          ? "Clipped mode: this adjustment affects only the visual layer directly beneath it."
          : "Global mode: this adjustment affects the composited layers beneath it. Reorder it to change what is affected."}
      </div>

      <button
        disabled={
          layer.locked
        }
        onClick={
          onToggleClip
        }
        className={
          layer.clipToBelow
            ? "mt-3 flex w-full items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2.5 text-left text-indigo-200"
            : "mt-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-gray-300 hover:bg-white/[0.06]"
        }
      >
        <div>
          <div className="text-[10px] font-medium">
            Clip to Layer Below
          </div>

          <div className="mt-1 text-[9px] text-gray-500">
            {layer.clipToBelow
              ? "Only the immediately underlying visual layer is affected"
              : "Currently affects the merged stack beneath"}
          </div>
        </div>

        <span
          className={
            layer.clipToBelow
              ? "rounded bg-indigo-500/20 px-2 py-1 text-[9px] text-indigo-200"
              : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-500"
          }
        >
          {layer.clipToBelow
            ? "CLIPPED"
            : "GLOBAL"}
        </span>
      </button>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">

        <div className="mb-2 flex items-center justify-between">

          <div>

            <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
              EFFECT STRENGTH
            </div>

            <div className="mt-1 text-[9px] text-gray-600">
              Blend original and adjusted result
            </div>

          </div>

          <span className="rounded bg-violet-500/10 px-2 py-1 text-[10px] tabular-nums text-violet-300">
            {Math.round(
              layer.opacity
            )}
            %
          </span>

        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={
            layer.opacity
          }
          disabled={
            layer.locked
          }
          onPointerDown={
            onStrengthStart
          }
          onChange={(
            event
          ) =>
            onStrengthChange(
              Number(
                event.target.value
              )
            )
          }
          className="w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
        />

        <div className="mt-2 grid grid-cols-5 gap-1">

          {[
            0,
            25,
            50,
            75,
            100,
          ].map(
            (value) => (
              <button
                key={
                  value
                }
                disabled={
                  layer.locked
                }
                onPointerDown={
                  onStrengthStart
                }
                onClick={() =>
                  onStrengthChange(
                    value
                  )
                }
                className={
                  Math.round(
                    layer.opacity
                  ) === value
                    ? "rounded border border-violet-500/50 bg-violet-500/20 px-1 py-1.5 text-[9px] text-violet-200"
                    : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:opacity-30"
                }
              >
                {value}%
              </button>
            )
          )}

        </div>

      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">

        <button
          onClick={
            onToggleBypass
          }
          className={
            layer.visible
              ? "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-300 hover:bg-white/10"
              : "rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-[9px] text-amber-200 hover:bg-amber-500/20"
          }
        >
          {layer.visible
            ? "A/B Bypass"
            : "Enable"}
        </button>

        <button
          onClick={
            onDuplicate
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-300 hover:bg-white/10"
        >
          Duplicate
        </button>

        <button
          onClick={
            onRename
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-300 hover:bg-white/10"
        >
          Rename
        </button>

      </div>

      <div className="mt-4 flex items-center justify-between">

        <div>

          <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
            QUICK PRESETS
          </div>

          <div className="mt-1 text-[9px] text-gray-600">
            Starting points — sliders stay editable
          </div>

        </div>

        <button
          disabled={
            layer.locked
          }
          onClick={
            onReset
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset
        </button>

      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">

        {PRESETS.map(
          (preset) => (
            <button
              key={
                preset.id
              }
              disabled={
                layer.locked
              }
              onClick={() =>
                onApplyPreset(
                  preset.id
                )
              }
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-violet-500/35 hover:bg-violet-500/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
            >

              <div className="text-[10px] font-medium text-gray-200">
                {preset.name}
              </div>

              <div className="mt-1 text-[8px] leading-3 text-gray-600">
                {preset.description}
              </div>

            </button>
          )
        )}

      </div>

      <div className="mt-3 text-[9px] leading-4 text-gray-600">
        Applying a preset replaces the adjustment values with a clean preset baseline. You can then fine-tune every slider below.
      </div>

    </section>
  );
}
