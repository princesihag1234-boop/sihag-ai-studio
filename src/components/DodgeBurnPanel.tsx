"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

export type DodgeBurnMode =
  | "dodge"
  | "burn";

export type DodgeBurnRange =
  | "shadows"
  | "midtones"
  | "highlights";

type DodgeBurnPanelProps = {
  layer:
    ImageLayer | null;

  mode:
    DodgeBurnMode;

  range:
    DodgeBurnRange;

  brushSize: number;

  brushHardness: number;

  exposure: number;

  onModeChange: (
    mode:
      DodgeBurnMode
  ) => void;

  onRangeChange: (
    range:
      DodgeBurnRange
  ) => void;

  onBrushSizeChange: (
    value: number
  ) => void;

  onBrushHardnessChange: (
    value: number
  ) => void;

  onExposureChange: (
    value: number
  ) => void;
};

export default function DodgeBurnPanel({
  layer,
  mode,
  range,
  brushSize,
  brushHardness,
  exposure,
  onModeChange,
  onRangeChange,
  onBrushSizeChange,
  onBrushHardnessChange,
  onExposureChange,
}: DodgeBurnPanelProps) {
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
            Dodge & Burn
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Local light and shadow sculpting
          </p>

        </div>

        <span
          className={
            mode ===
            "dodge"
              ? "rounded bg-amber-500/10 px-2 py-1 text-[9px] text-amber-300"
              : "rounded bg-violet-500/10 px-2 py-1 text-[9px] text-violet-300"
          }
        >
          {mode ===
          "dodge"
            ? "DODGE"
            : "BURN"}
        </span>

      </div>

      {!canPaint && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an unlocked raster Image layer to use Dodge & Burn.
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">

        <button
          disabled={
            !canPaint
          }
          onClick={() =>
            onModeChange(
              "dodge"
            )
          }
          className={
            mode ===
            "dodge"
              ? "rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-2 text-[10px] text-amber-200"
              : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-30"
          }
        >
          ☀ Dodge
        </button>

        <button
          disabled={
            !canPaint
          }
          onClick={() =>
            onModeChange(
              "burn"
            )
          }
          className={
            mode ===
            "burn"
              ? "rounded-lg border border-violet-500/40 bg-violet-500/10 px-2 py-2 text-[10px] text-violet-200"
              : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-30"
          }
        >
          ◐ Burn
        </button>

      </div>

      <div className="mt-4">

        <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
          TONAL RANGE
        </div>

        <div className="grid grid-cols-3 gap-1">

          {(
            [
              "shadows",
              "midtones",
              "highlights",
            ] as
              DodgeBurnRange[]
          ).map(
            (value) => (
              <button
                key={
                  value
                }
                disabled={
                  !canPaint
                }
                onClick={() =>
                  onRangeChange(
                    value
                  )
                }
                className={
                  range ===
                  value
                    ? "rounded-lg border border-sky-500/35 bg-sky-500/10 px-1 py-2 text-[9px] capitalize text-sky-200"
                    : "rounded-lg border border-white/10 bg-white/[0.03] px-1 py-2 text-[9px] capitalize text-gray-500 hover:bg-white/[0.07] disabled:opacity-30"
                }
              >
                {value}
              </button>
            )
          )}

        </div>

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
          label="Exposure"
          value={
            exposure
          }
          min={1}
          max={100}
          suffix="%"
          disabled={
            !canPaint
          }
          onChange={
            onExposureChange
          }
        />

      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Dodge brightens the targeted tonal range. Burn darkens it. Lower Exposure gives smoother, more natural retouching over repeated strokes.
      </div>

      <div className="mt-2 text-[9px] text-gray-600">
        O = Dodge & Burn • Shift+O toggles mode • Ctrl+Z undoes stroke
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
        className="w-full cursor-pointer accent-sky-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

    </div>
  );
}
