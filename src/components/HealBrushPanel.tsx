"use client";

import type { ImageLayer } from "@/lib/layerTypes";

type HealBrushPanelProps = {
  layer: ImageLayer | null;
  brushSize: number;
  brushHardness: number;
  brushOpacity: number;
  onBrushSizeChange: (value: number) => void;
  onBrushHardnessChange: (value: number) => void;
  onBrushOpacityChange: (value: number) => void;
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
            <h3 className="text-sm font-semibold text-gray-100">
              Spot Heal
            </h3>
            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-emerald-300/80">
              PRO
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">
            Texture-aware repair with local tone matching
          </p>
        </div>

        <span
          className={
            canHeal
              ? "shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-emerald-300"
              : "shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-gray-600"
          }
        >
          {canHeal ? "READY" : "IMAGE ONLY"}
        </span>
      </div>

      {!layer && (
        <Notice>Select an image layer before using Spot Heal.</Notice>
      )}

      {layer && layer.layerKind !== "image" && (
        <Notice>
          Spot Heal edits raster pixels. Select an Image layer rather than Text, Shape, or Adjustment.
        </Notice>
      )}

      {layer?.locked && (
        <Notice>Unlock this layer before healing.</Notice>
      )}

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/10 p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">
            Brush
          </span>
          <button
            type="button"
            disabled={!canHeal}
            onClick={resetDefaults}
            className="rounded px-2 py-1 text-[9px] text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <ProfessionalSlider
            label="Size"
            value={brushSize}
            min={1}
            max={2000}
            suffix=" px"
            disabled={!canHeal}
            onChange={onBrushSizeChange}
          />
          <ProfessionalSlider
            label="Hardness"
            value={brushHardness}
            min={0}
            max={100}
            suffix="%"
            disabled={!canHeal}
            onChange={onBrushHardnessChange}
          />
          <ProfessionalSlider
            label="Opacity"
            value={brushOpacity}
            min={1}
            max={100}
            suffix="%"
            disabled={!canHeal}
            onChange={onBrushOpacityChange}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {[15, 35, 75, 150].map((value) => (
            <button
              key={value}
              type="button"
              disabled={!canHeal}
              onClick={() => onBrushSizeChange(value)}
              className={
                Math.round(brushSize) === value
                  ? "rounded-md border border-emerald-500/35 bg-emerald-500/10 px-1 py-1.5 text-[9px] font-medium text-emerald-200"
                  : "rounded-md border border-white/[0.07] bg-white/[0.025] px-1 py-1.5 text-[9px] text-gray-500 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
              }
            >
              {value}px
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.035] p-3 text-[9px] leading-4 text-gray-500">
        Paint over a blemish or small unwanted detail. SIHAG samples nearby texture and matches it toward the destination tone. Active selections limit the repair area.
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-600">
        <span>J Spot Heal</span>
        <span>Shift+click straight repair</span>
        <span>Esc cancel stroke</span>
        <span>Ctrl+Z undo</span>
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

function ProfessionalSlider({
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
              if (Number.isFinite(next)) {
                onChange(Math.max(min, Math.min(max, next)));
              }
            }}
            className="w-12 bg-transparent text-right text-[10px] tabular-nums text-gray-300 outline-none disabled:text-gray-600"
          />
          <span className="ml-0.5 text-[9px] text-gray-600">{suffix.trim()}</span>
        </label>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={safeValue}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}
