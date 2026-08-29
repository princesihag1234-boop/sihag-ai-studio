"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

export type BlurSharpenMode =
  | "blur"
  | "sharpen"
  | "smudge";

type BlurSharpenPanelProps = {
  layer:
    ImageLayer | null;

  mode:
    BlurSharpenMode;

  brushSize: number;

  brushHardness: number;

  strength: number;

  onModeChange: (
    mode:
      BlurSharpenMode
  ) => void;

  onBrushSizeChange: (
    value: number
  ) => void;

  onBrushHardnessChange: (
    value: number
  ) => void;

  onStrengthChange: (
    value: number
  ) => void;
};

export default function BlurSharpenPanel({
  layer,
  mode,
  brushSize,
  brushHardness,
  strength,
  onModeChange,
  onBrushSizeChange,
  onBrushHardnessChange,
  onStrengthChange,
}: BlurSharpenPanelProps) {
  const canPaint =
    !!layer &&
    layer.layerKind ===
      "image" &&
    !layer.locked;

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-sm font-semibold text-gray-200">
            Blur / Sharpen / Smudge
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Local detail and pixel shaping
          </p>

        </div>

        <span
          className={
            mode ===
            "blur"
              ? "rounded bg-cyan-500/10 px-2 py-1 text-[9px] text-cyan-300"
              : mode ===
                "sharpen"
                ? "rounded bg-orange-500/10 px-2 py-1 text-[9px] text-orange-300"
                : "rounded bg-fuchsia-500/10 px-2 py-1 text-[9px] text-fuchsia-300"
          }
        >
          {mode ===
          "blur"
            ? "BLUR"
            : mode ===
              "sharpen"
              ? "SHARPEN"
              : "SMUDGE"}
        </span>

      </div>

      {!canPaint && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an unlocked raster Image layer to use this brush.
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">

        <button
          disabled={
            !canPaint
          }
          onClick={() =>
            onModeChange(
              "blur"
            )
          }
          className={
            mode ===
            "blur"
              ? "rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 py-2 text-[10px] text-cyan-200"
              : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-30"
          }
        >
          ◌ Blur
        </button>

        <button
          disabled={
            !canPaint
          }
          onClick={() =>
            onModeChange(
              "sharpen"
            )
          }
          className={
            mode ===
            "sharpen"
              ? "rounded-lg border border-orange-500/40 bg-orange-500/10 px-2 py-2 text-[10px] text-orange-200"
              : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-30"
          }
        >
          ✦ Sharpen
        </button>

        <button
          disabled={
            !canPaint
          }
          onClick={() =>
            onModeChange(
              "smudge"
            )
          }
          className={
            mode ===
            "smudge"
              ? "rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-2 text-[10px] text-fuchsia-200"
              : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-30"
          }
        >
          ≋ Smudge
        </button>

      </div>

      <div className="mt-4 space-y-4">

        <BrushSlider
          label="Size"
          value={
            brushSize
          }
          min={5}
          max={300}
          suffix=" px"
          disabled={
            !canPaint
          }
          onChange={
            onBrushSizeChange
          }
        />

        <BrushSlider
          label="Hardness"
          value={
            brushHardness
          }
          min={0}
          max={100}
          suffix="%"
          disabled={
            !canPaint
          }
          onChange={
            onBrushHardnessChange
          }
        />

        <BrushSlider
          label="Strength"
          value={
            strength
          }
          min={1}
          max={100}
          suffix="%"
          disabled={
            !canPaint
          }
          onChange={
            onStrengthChange
          }
        />

      </div>

      <div className="mt-4 grid grid-cols-3 gap-1">

        {[20, 50, 100].map(
          (value) => (
            <button
              key={
                value
              }
              disabled={
                !canPaint
              }
              onClick={() =>
                onBrushSizeChange(
                  value
                )
              }
              className={
                Math.round(
                  brushSize
                ) === value
                  ? "rounded border border-cyan-500/40 bg-cyan-500/10 px-1 py-1.5 text-[9px] text-cyan-200"
                  : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          )
        )}

      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Blur softens local texture. Sharpen increases local edge contrast. Smudge pushes existing pixels along your brush stroke. Use lower Strength for subtle retouching.
      </div>

      <div className="mt-2 text-[9px] text-gray-600">
        R = Blur / Sharpen / Smudge • Shift+R cycles modes • Ctrl+Z undoes stroke
      </div>

    </section>
  );
}

function BrushSlider({
  label,
  value,
  min,
  max,
  suffix,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  disabled: boolean;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div>

      <div className="mb-1.5 flex items-center justify-between">

        <span className="text-[10px] text-gray-400">
          {label}
        </span>

        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-400">
          {Math.round(
            value
          )}
          {suffix}
        </span>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={
          value
        }
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

    </div>
  );
}
