"use client";

import type { ImageLayer } from "@/lib/layerTypes";

type CloneStampPanelProps = {
  layer: ImageLayer | null;
  brushSize: number;
  brushHardness: number;
  brushOpacity: number;
  hasSample: boolean;
  onBrushSizeChange: (value: number) => void;
  onBrushHardnessChange: (value: number) => void;
  onBrushOpacityChange: (value: number) => void;
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
    layer.layerKind === "image" &&
    !layer.locked;

  function resetDefaults() {
    onBrushSizeChange(50);
    onBrushHardnessChange(70);
    onBrushOpacityChange(100);
  }

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-100">Clone Stamp</h3>
            <span className="rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-sky-300/80">
              ALIGNED
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">
            Pixel-accurate source cloning with persistent alignment
          </p>
        </div>

        <span
          className={
            hasSample
              ? "shrink-0 rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-sky-300"
              : "shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-amber-300"
          }
        >
          {hasSample ? "SOURCE SET" : "SET SOURCE"}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-sky-500/20 bg-sky-500/[0.055] p-3 text-[10px] leading-5 text-gray-300">
        Hold <span className="font-semibold text-sky-200">Alt</span> and click a clean source area, then paint. The source stays aligned across consecutive strokes until you set a new source.
      </div>

      {!layer && <Notice>Select an image layer first.</Notice>}
      {layer && layer.layerKind !== "image" && (
        <Notice>Clone Stamp works on raster Image layers.</Notice>
      )}
      {layer?.locked && <Notice>Unlock this layer before cloning.</Notice>}

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/10 p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">Brush</span>
          <button
            type="button"
            disabled={!canClone}
            onClick={resetDefaults}
            className="rounded px-2 py-1 text-[9px] text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <ProfessionalSlider label="Size" value={brushSize} min={1} max={2000} suffix=" px" disabled={!canClone} onChange={onBrushSizeChange} />
          <ProfessionalSlider label="Hardness" value={brushHardness} min={0} max={100} suffix="%" disabled={!canClone} onChange={onBrushHardnessChange} />
          <ProfessionalSlider label="Opacity" value={brushOpacity} min={1} max={100} suffix="%" disabled={!canClone} onChange={onBrushOpacityChange} />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {[15, 35, 75, 150].map((value) => (
            <button
              key={value}
              type="button"
              disabled={!canClone}
              onClick={() => onBrushSizeChange(value)}
              className={
                Math.round(brushSize) === value
                  ? "rounded-md border border-sky-500/35 bg-sky-500/10 px-1 py-1.5 text-[9px] font-medium text-sky-200"
                  : "rounded-md border border-white/[0.07] bg-white/[0.025] px-1 py-1.5 text-[9px] text-gray-500 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!hasSample}
        onClick={onClearSample}
        className="mt-3 w-full rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-[9px] font-medium text-gray-400 transition hover:bg-white/[0.075] hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Clear Clone Source
      </button>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-600">
        <span>S Clone Stamp</span>
        <span>Alt+click source</span>
        <span>Shift+click straight clone</span>
        <span>Esc cancel stroke</span>
      </div>
    </section>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
      {children}
    </div>
  );
}

function ProfessionalSlider({ label, value, min, max, suffix, disabled, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const safeValue = Math.max(min, Math.min(max, value));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[10px] text-gray-400">{label}</span>
        <label className="flex items-center rounded-md border border-white/[0.07] bg-black/15 px-1.5 py-0.5">
          <input
            type="number"
            min={min}
            max={max}
            step={1}
            value={Math.round(safeValue)}
            disabled={disabled}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)));
            }}
            className="w-12 bg-transparent text-right text-[10px] tabular-nums text-gray-300 outline-none disabled:text-gray-600"
          />
          <span className="ml-0.5 text-[9px] text-gray-600">{suffix.trim()}</span>
        </label>
      </div>
      <input type="range" min={min} max={max} step={1} value={safeValue} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="w-full cursor-pointer accent-sky-500 disabled:cursor-not-allowed disabled:opacity-30" />
    </div>
  );
}
