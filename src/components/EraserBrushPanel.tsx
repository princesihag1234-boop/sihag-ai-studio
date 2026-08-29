"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

type EraserBrushPanelProps = {
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

export default function EraserBrushPanel({
  layer,
  brushSize,
  brushHardness,
  brushOpacity,
  onBrushSizeChange,
  onBrushHardnessChange,
  onBrushOpacityChange,
}: EraserBrushPanelProps) {
  const canErase =
    !!layer &&
    layer.layerKind ===
      "image" &&
    !layer.locked;

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-sm font-semibold text-gray-200">
            Eraser
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Remove raster pixels to transparency
          </p>

        </div>

        <span
          className={
            canErase
              ? "rounded bg-rose-500/10 px-2 py-1 text-[9px] text-rose-300"
              : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
          }
        >
          {canErase
            ? "READY"
            : "IMAGE ONLY"}
        </span>

      </div>

      {!layer && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an image layer before erasing.
        </div>
      )}

      {layer &&
        layer.layerKind !==
          "image" && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Eraser works on raster Image layers. Text, Shape and Adjustment layers remain editable.
        </div>
      )}

      {layer?.locked && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Unlock this layer before erasing.
        </div>
      )}

      <div className="mt-4 space-y-4">

        <EraserSlider
          label="Size"
          value={
            brushSize
          }
          min={5}
          max={300}
          suffix=" px"
          disabled={
            !canErase
          }
          onChange={
            onBrushSizeChange
          }
        />

        <EraserSlider
          label="Hardness"
          value={
            brushHardness
          }
          min={0}
          max={100}
          suffix="%"
          disabled={
            !canErase
          }
          onChange={
            onBrushHardnessChange
          }
        />

        <EraserSlider
          label="Opacity"
          value={
            brushOpacity
          }
          min={1}
          max={100}
          suffix="%"
          disabled={
            !canErase
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
                !canErase
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
                  ? "rounded border border-rose-500/40 bg-rose-500/10 px-1 py-1.5 text-[9px] text-rose-200"
                  : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          )
        )}

      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Erasing creates transparent pixels. The checkerboard shows through erased areas. Active selections restrict where erasing can occur.
      </div>

      <div className="mt-2 text-[9px] text-gray-600">
        Shortcut: E • Ctrl+Z undoes the last stroke
      </div>

    </section>
  );
}

function EraserSlider({
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
        className="w-full cursor-pointer accent-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

    </div>
  );
}
