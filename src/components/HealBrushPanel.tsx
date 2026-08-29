"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

type HealBrushPanelProps = {
  layer:
    ImageLayer | null;

  brushSize: number;

  brushHardness: number;

  brushOpacity: number;

  onBrushSizeChange: (
    value: number
  ) => void;

  onBrushHardnessChange: (
    value: number
  ) => void;

  onBrushOpacityChange: (
    value: number
  ) => void;
};

export default function HealBrushPanel({
  layer,
  brushSize,
  brushHardness,
  brushOpacity,
  onBrushSizeChange,
  onBrushHardnessChange,
  onBrushOpacityChange,
}: HealBrushPanelProps) {
  const canHeal =
    !!layer &&
    layer.layerKind ===
      "image" &&
    !layer.locked;

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-sm font-semibold text-gray-200">
            Spot Heal
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Automatic nearby texture repair
          </p>

        </div>

        <span
          className={
            canHeal
              ? "rounded bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300"
              : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
          }
        >
          {canHeal
            ? "READY"
            : "IMAGE ONLY"}
        </span>

      </div>

      {!layer && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an image layer before using Spot Heal.
        </div>
      )}

      {layer &&
        layer.layerKind !==
          "image" && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Spot Heal edits raster image pixels. Select an Image layer rather than Text, Shape, or Adjustment.
        </div>
      )}

      {layer?.locked && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Unlock this layer before healing.
        </div>
      )}

      <div className="mt-4 space-y-4">

        <HealSlider
          label="Size"
          value={
            brushSize
          }
          min={5}
          max={300}
          suffix=" px"
          disabled={
            !canHeal
          }
          onChange={
            onBrushSizeChange
          }
        />

        <HealSlider
          label="Hardness"
          value={
            brushHardness
          }
          min={0}
          max={100}
          suffix="%"
          disabled={
            !canHeal
          }
          onChange={
            onBrushHardnessChange
          }
        />

        <HealSlider
          label="Opacity"
          value={
            brushOpacity
          }
          min={1}
          max={100}
          suffix="%"
          disabled={
            !canHeal
          }
          onChange={
            onBrushOpacityChange
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
                !canHeal
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
                  ? "rounded border border-emerald-500/40 bg-emerald-500/10 px-1 py-1.5 text-[9px] text-emerald-200"
                  : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          )
        )}

      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Paint over a small blemish or unwanted detail. The brush automatically samples nearby pixels and blends them into the painted area. Each stroke is undoable with Ctrl+Z.
      </div>

      <div className="mt-2 text-[9px] text-gray-600">
        Shortcut: J
      </div>

    </section>
  );
}

function HealSlider({
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
        className="w-full cursor-pointer accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

    </div>
  );
}
