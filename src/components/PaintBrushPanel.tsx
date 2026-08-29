"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

type PaintBrushPanelProps = {
  layer:
    ImageLayer | null;

  color: string;

  brushSize: number;

  brushHardness: number;

  brushOpacity: number;

  onColorChange: (
    value: string
  ) => void;

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

export default function PaintBrushPanel({
  layer,
  color,
  brushSize,
  brushHardness,
  brushOpacity,
  onColorChange,
  onBrushSizeChange,
  onBrushHardnessChange,
  onBrushOpacityChange,
}: PaintBrushPanelProps) {
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
            Paint Brush
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Paint directly on raster pixels
          </p>

        </div>

        <span
          className={
            canPaint
              ? "rounded bg-pink-500/10 px-2 py-1 text-[9px] text-pink-300"
              : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
          }
        >
          {canPaint
            ? "READY"
            : "IMAGE ONLY"}
        </span>

      </div>

      {!canPaint && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an unlocked raster Image layer before painting.
        </div>
      )}

      <div className="mt-4">

        <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
          COLOR
        </div>

        <div className="flex items-center gap-3">

          <label
            className="relative h-10 w-12 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-white/5"
            title="Choose brush color"
          >
            <input
              type="color"
              value={
                color
              }
              disabled={
                !canPaint
              }
              onChange={(
                event
              ) =>
                onColorChange(
                  event.target.value
                )
              }
              className="absolute -inset-2 h-14 w-16 cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
            />
          </label>

          <input
            type="text"
            value={
              color
            }
            disabled={
              !canPaint
            }
            onChange={(
              event
            ) => {
              const value =
                event.target.value;

              if (
                /^#[0-9a-fA-F]{0,6}$/.test(
                  value
                )
              ) {
                onColorChange(
                  value
                );
              }
            }}
            onBlur={() => {
              if (
                !/^#[0-9a-fA-F]{6}$/.test(
                  color
                )
              ) {
                onColorChange(
                  "#ffffff"
                );
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase text-gray-300 outline-none focus:border-pink-500/40 disabled:opacity-30"
          />

        </div>

        <div className="mt-2 grid grid-cols-6 gap-1">

          {[
            "#ffffff",
            "#000000",
            "#ef4444",
            "#f59e0b",
            "#22c55e",
            "#3b82f6",
          ].map(
            (preset) => (
              <button
                key={
                  preset
                }
                disabled={
                  !canPaint
                }
                onClick={() =>
                  onColorChange(
                    preset
                  )
                }
                className={
                  color.toLowerCase() ===
                  preset
                    ? "h-7 rounded border-2 border-white"
                    : "h-7 rounded border border-white/20"
                }
                style={{
                  background:
                    preset,
                }}
                title={
                  preset
                }
              />
            )
          )}

        </div>

      </div>

      <div className="mt-4 space-y-4">

        <PaintSlider
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

        <PaintSlider
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

        <PaintSlider
          label="Opacity"
          value={
            brushOpacity
          }
          min={1}
          max={100}
          suffix="%"
          disabled={
            !canPaint
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
                  ? "rounded border border-pink-500/40 bg-pink-500/10 px-1 py-1.5 text-[9px] text-pink-200"
                  : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          )
        )}

      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Painting changes the selected raster layer directly. Active selections restrict the paint area. Use Ctrl+Z to undo the last complete stroke.
      </div>

      <div className="mt-2 text-[9px] text-gray-600">
        Shortcut: K
      </div>

    </section>
  );
}

function PaintSlider({
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
        className="w-full cursor-pointer accent-pink-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

    </div>
  );
}
