"use client";

import type { ImageLayer } from "@/lib/layerTypes";

export type BlurSharpenMode = "blur" | "sharpen" | "smudge";

type BlurSharpenPanelProps = {
  layer: ImageLayer | null;
  mode: BlurSharpenMode;
  brushSize: number;
  brushHardness: number;
  strength: number;
  onModeChange: (mode: BlurSharpenMode) => void;
  onBrushSizeChange: (value: number) => void;
  onBrushHardnessChange: (value: number) => void;
  onStrengthChange: (value: number) => void;
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
  const canPaint = !!layer && layer.layerKind === "image" && !layer.locked;

  function resetDefaults() {
    onModeChange("blur");
    onBrushSizeChange(60);
    onBrushHardnessChange(50);
    onStrengthChange(35);
  }

  const accent = mode === "blur" ? "accent-cyan-500" : mode === "sharpen" ? "accent-orange-500" : "accent-fuchsia-500";

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-100">Blur / Sharpen / Smudge</h3>
            <span className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-cyan-300/80">DETAIL</span>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-gray-500">Local detail shaping with selection-safe strokes</p>
        </div>
        <span className={mode === "blur" ? "shrink-0 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-cyan-300" : mode === "sharpen" ? "shrink-0 rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-orange-300" : "shrink-0 rounded-md border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-fuchsia-300"}>
          {mode === "blur" ? "BLUR" : mode === "sharpen" ? "SHARPEN" : "SMUDGE"}
        </span>
      </div>

      {!canPaint && <Notice>Select an unlocked raster Image layer to use this brush.</Notice>}

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {([[
          "blur", "◌ Blur"
        ], ["sharpen", "✦ Sharpen"], ["smudge", "≋ Smudge"]] as [BlurSharpenMode, string][]).map(([value, label]) => (
          <button key={value} type="button" disabled={!canPaint} onClick={() => onModeChange(value)} className={mode === value ? value === "blur" ? "rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 py-2 text-[10px] font-medium text-cyan-200" : value === "sharpen" ? "rounded-lg border border-orange-500/40 bg-orange-500/10 px-2 py-2 text-[10px] font-medium text-orange-200" : "rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-2 text-[10px] font-medium text-fuchsia-200" : "rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-2 text-[10px] text-gray-400 transition hover:bg-white/[0.07] disabled:opacity-30"}>{label}</button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/10 p-3">
        <div className="space-y-4">
          <ProfessionalSlider label="Size" value={brushSize} min={1} max={2000} suffix=" px" disabled={!canPaint} onChange={onBrushSizeChange} accent={accent} />
          <ProfessionalSlider label="Hardness" value={brushHardness} min={0} max={100} suffix="%" disabled={!canPaint} onChange={onBrushHardnessChange} accent={accent} />
          <ProfessionalSlider label="Strength" value={strength} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onStrengthChange} accent={accent} />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {[15, 35, 75, 150].map((value) => <button key={value} type="button" disabled={!canPaint} onClick={() => onBrushSizeChange(value)} className={Math.round(brushSize) === value ? "rounded-md border border-cyan-500/35 bg-cyan-500/10 px-1 py-1.5 text-[9px] font-medium text-cyan-200" : "rounded-md border border-white/[0.07] bg-white/[0.025] px-1 py-1.5 text-[9px] text-gray-500 transition hover:bg-white/[0.06] disabled:opacity-30"}>{value}px</button>)}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3"><div className="text-[9px] text-gray-600">Use lower strength for controlled build-up.</div><button type="button" disabled={!canPaint} onClick={resetDefaults} className="rounded px-2 py-1 text-[9px] text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-300 disabled:opacity-30">Reset</button></div>
      </div>

      <div className="mt-3 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.03] p-3 text-[9px] leading-4 text-gray-500">
        Blur uses a weighted local average, Sharpen uses controlled unsharp contrast, and Smudge pushes existing pixels along the stroke. All modes respect active selections.
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-600"><span>R Detail brush</span><span>Shift+R cycles</span><span>Shift+click straight stroke</span><span>Esc cancel</span></div>
    </section>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">{children}</div>;
}

function ProfessionalSlider({ label, value, min, max, suffix, disabled, onChange, accent }: { label: string; value: number; min: number; max: number; suffix: string; disabled: boolean; onChange: (value: number) => void; accent: string; }) {
  const safeValue = Math.max(min, Math.min(max, value));
  return <div><div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-[10px] text-gray-400">{label}</span><label className="flex items-center rounded-md border border-white/[0.07] bg-black/15 px-1.5 py-0.5"><input type="number" min={min} max={max} step={1} value={Math.round(safeValue)} disabled={disabled} onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next))); }} className="w-12 bg-transparent text-right text-[10px] tabular-nums text-gray-300 outline-none disabled:text-gray-600"/><span className="ml-0.5 text-[9px] text-gray-600">{suffix.trim()}</span></label></div><input type="range" min={min} max={max} step={1} value={safeValue} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className={`w-full cursor-pointer ${accent} disabled:cursor-not-allowed disabled:opacity-30`} /></div>;
}
