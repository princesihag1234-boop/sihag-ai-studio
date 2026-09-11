"use client";

import type { ImageLayer } from "@/lib/layerTypes";

export type DodgeBurnMode = "dodge" | "burn";
export type DodgeBurnRange = "shadows" | "midtones" | "highlights";

type DodgeBurnPanelProps = {
  layer: ImageLayer | null;
  mode: DodgeBurnMode;
  range: DodgeBurnRange;
  brushSize: number;
  brushHardness: number;
  exposure: number;
  onModeChange: (mode: DodgeBurnMode) => void;
  onRangeChange: (range: DodgeBurnRange) => void;
  onBrushSizeChange: (value: number) => void;
  onBrushHardnessChange: (value: number) => void;
  onExposureChange: (value: number) => void;
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
    layer.layerKind === "image" &&
    !layer.locked;

  function resetDefaults() {
    onModeChange("dodge");
    onRangeChange("midtones");
    onBrushSizeChange(70);
    onBrushHardnessChange(40);
    onExposureChange(20);
  }

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-100">Dodge & Burn</h3>
            <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-amber-300/80">TONE SAFE</span>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">Hue-preserving local light and shadow sculpting</p>
        </div>
        <span className={mode === "dodge" ? "shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-amber-300" : "shrink-0 rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-violet-300"}>
          {mode === "dodge" ? "DODGE" : "BURN"}
        </span>
      </div>

      {!canPaint && <Notice>Select an unlocked raster Image layer to use Dodge & Burn.</Notice>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" disabled={!canPaint} onClick={() => onModeChange("dodge")} className={mode === "dodge" ? "rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-2 text-[10px] font-medium text-amber-200" : "rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-2 text-[10px] text-gray-400 transition hover:bg-white/[0.07] disabled:opacity-30"}>☀ Dodge</button>
        <button type="button" disabled={!canPaint} onClick={() => onModeChange("burn")} className={mode === "burn" ? "rounded-lg border border-violet-500/40 bg-violet-500/10 px-2 py-2 text-[10px] font-medium text-violet-200" : "rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-2 text-[10px] text-gray-400 transition hover:bg-white/[0.07] disabled:opacity-30"}>◐ Burn</button>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/10 p-3">
        <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">Tonal Range</div>
        <div className="grid grid-cols-3 gap-1.5">
          {(["shadows", "midtones", "highlights"] as DodgeBurnRange[]).map((value) => (
            <button key={value} type="button" disabled={!canPaint} onClick={() => onRangeChange(value)} className={range === value ? "rounded-md border border-sky-500/35 bg-sky-500/10 px-1 py-2 text-[9px] font-medium capitalize text-sky-200" : "rounded-md border border-white/[0.07] bg-white/[0.025] px-1 py-2 text-[9px] capitalize text-gray-500 transition hover:bg-white/[0.06] disabled:opacity-30"}>{value}</button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          <ProfessionalSlider label="Size" value={brushSize} min={1} max={2000} suffix=" px" disabled={!canPaint} onChange={onBrushSizeChange} accent="accent-amber-500" />
          <ProfessionalSlider label="Hardness" value={brushHardness} min={0} max={100} suffix="%" disabled={!canPaint} onChange={onBrushHardnessChange} accent="accent-amber-500" />
          <ProfessionalSlider label="Exposure" value={exposure} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onExposureChange} accent="accent-amber-500" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <div className="text-[9px] text-gray-600">Low exposure builds tone gradually.</div>
          <button type="button" disabled={!canPaint} onClick={resetDefaults} className="rounded px-2 py-1 text-[9px] text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-300 disabled:opacity-30">Reset</button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3 text-[9px] leading-4 text-gray-500">
        SIHAG weights edits by the selected tonal range and changes luminance while preserving color relationships. Use repeated low-exposure strokes for natural retouching.
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-600"><span>O Dodge/Burn</span><span>Shift+O mode</span><span>Shift+click straight stroke</span><span>Esc cancel</span></div>
    </section>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">{children}</div>;
}

function ProfessionalSlider({ label, value, min, max, suffix, disabled, onChange, accent }: { label: string; value: number; min: number; max: number; suffix: string; disabled: boolean; onChange: (value: number) => void; accent: string; }) {
  const safeValue = Math.max(min, Math.min(max, value));
  return <div>
    <div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-[10px] text-gray-400">{label}</span><label className="flex items-center rounded-md border border-white/[0.07] bg-black/15 px-1.5 py-0.5"><input type="number" min={min} max={max} step={1} value={Math.round(safeValue)} disabled={disabled} onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next))); }} className="w-12 bg-transparent text-right text-[10px] tabular-nums text-gray-300 outline-none disabled:text-gray-600"/><span className="ml-0.5 text-[9px] text-gray-600">{suffix.trim()}</span></label></div>
    <input type="range" min={min} max={max} step={1} value={safeValue} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className={`w-full cursor-pointer ${accent} disabled:cursor-not-allowed disabled:opacity-30`} />
  </div>;
}
