"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

type CloneStampPanelProps = {
  layer:
    ImageLayer | null;

  brushSize: number;

  brushHardness: number;

  brushOpacity: number;

  hasSample: boolean;

  onBrushSizeChange: (
    value: number
  ) => void;

  onBrushHardnessChange: (
    value: number
  ) => void;

  onBrushOpacityChange: (
    value: number
  ) => void;

  onClearSample: () => void;
};

export default function CloneStampPanel({
  layer,
  brushSize,
  brushHardness,
  brushOpacity,
  hasSample,
  onBrushSizeChange,
  onBrushHardnessChange,
  onBrushOpacityChange,
  onClearSample,
}: CloneStampPanelProps) {
  const canClone =
    !!layer &&
    layer.layerKind ===
      "image" &&
    !layer.locked;

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="text-sm font-semibold text-gray-200">
            Clone Stamp
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Copy pixels from one area to another
          </p>

        </div>

        <span
          className={
            hasSample
              ? "rounded bg-sky-500/10 px-2 py-1 text-[9px] text-sky-300"
              : "rounded bg-amber-500/10 px-2 py-1 text-[9px] text-amber-300"
          }
        >
          {hasSample
            ? "SOURCE SET"
            : "SET SOURCE"}
        </span>

      </div>

      <div className="mt-3 rounded-lg border border-sky-500/20 bg-sky-500/[0.06] p-3 text-[10px] leading-5 text-gray-300">
        Hold <span className="font-semibold text-sky-200">Alt</span> and click a clean source area. Then paint over the area you want to replace.
      </div>

      {!layer && (
        <div className="mt-3 text-[10px] text-amber-300/80">
          Select an image layer first.
        </div>
      )}

      {layer &&
        layer.layerKind !==
          "image" && (
        <div className="mt-3 text-[10px] text-amber-300/80">
          Clone Stamp works on raster Image layers.
        </div>
      )}

      {layer?.locked && (
        <div className="mt-3 text-[10px] text-amber-300/80">
          Unlock this layer before cloning.
        </div>
      )}

      <div className="mt-4 space-y-4">

        <CloneSlider
          label="Size"
          value={
            brushSize
          }
          min={5}
          max={300}
          suffix=" px"
          disabled={
            !canClone
          }
          onChange={
            onBrushSizeChange
          }
        />

        <CloneSlider
          label="Hardness"
          value={
            brushHardness
          }
          min={0}
          max={100}
          suffix="%"
          disabled={
            !canClone
          }
          onChange={
            onBrushHardnessChange
          }
        />

        <CloneSlider
          label="Opacity"
          value={
            brushOpacity
          }
          min={1}
          max={100}
          suffix="%"
          disabled={
            !canClone
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
                !canClone
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
                  ? "rounded border border-sky-500/40 bg-sky-500/10 px-1 py-1.5 text-[9px] text-sky-200"
                  : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          )
        )}

      </div>

      <button
        disabled={
          !hasSample
        }
        onClick={
          onClearSample
        }
        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Clear Clone Source
      </button>

      <div className="mt-3 text-[9px] leading-4 text-gray-600">
        Shortcut: S • Alt+Click sets source • Ctrl+Z undoes the last clone stroke
      </div>

    </section>
  );
}

function CloneSlider({
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
