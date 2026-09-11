"use client";

import type { ImageLayer } from "@/lib/layerTypes";

export type PaintBrushMode = "paint" | "erase";
export type PaintBrushBlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay";

type PaintBrushPanelProps = {
  layer: ImageLayer | null;
  color: string;
  brushSize: number;
  brushHardness: number;
  brushOpacity: number;
  brushFlow: number;
  brushSpacing: number;
  brushSmoothing: number;
  mode: PaintBrushMode;
  blendMode: PaintBrushBlendMode;
  pressureSize: boolean;
  pressureOpacity: boolean;
  compact?: boolean;
  onColorChange: (value: string) => void;
  onBrushSizeChange: (value: number) => void;
  onBrushHardnessChange: (value: number) => void;
  onBrushOpacityChange: (value: number) => void;
  onBrushFlowChange: (value: number) => void;
  onBrushSpacingChange: (value: number) => void;
  onBrushSmoothingChange: (value: number) => void;
  onModeChange: (value: PaintBrushMode) => void;
  onBlendModeChange: (value: PaintBrushBlendMode) => void;
  onPressureSizeChange: (value: boolean) => void;
  onPressureOpacityChange: (value: boolean) => void;
};

type Preset = {
  name: string;
  size: number;
  hardness: number;
  opacity: number;
  flow: number;
  spacing: number;
  smoothing: number;
};

const PRESETS: Preset[] = [
  { name: "Hard Round", size: 40, hardness: 100, opacity: 100, flow: 100, spacing: 10, smoothing: 10 },
  { name: "Soft Round", size: 90, hardness: 0, opacity: 100, flow: 65, spacing: 8, smoothing: 25 },
  { name: "Pencil", size: 7, hardness: 100, opacity: 100, flow: 100, spacing: 6, smoothing: 12 },
  { name: "Marker", size: 58, hardness: 90, opacity: 72, flow: 55, spacing: 8, smoothing: 35 },
  { name: "Airbrush", size: 140, hardness: 0, opacity: 42, flow: 10, spacing: 4, smoothing: 48 },
  { name: "Highlighter", size: 96, hardness: 75, opacity: 30, flow: 100, spacing: 8, smoothing: 50 },
];

const DEFAULT_BRUSH: Preset = {
  name: "Default",
  size: 40,
  hardness: 80,
  opacity: 100,
  flow: 100,
  spacing: 16,
  smoothing: 0,
};

const COLOR_PRESETS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export default function PaintBrushPanel({
  layer,
  color,
  brushSize,
  brushHardness,
  brushOpacity,
  brushFlow,
  brushSpacing,
  brushSmoothing,
  mode,
  blendMode,
  pressureSize,
  pressureOpacity,
  compact = false,
  onColorChange,
  onBrushSizeChange,
  onBrushHardnessChange,
  onBrushOpacityChange,
  onBrushFlowChange,
  onBrushSpacingChange,
  onBrushSmoothingChange,
  onModeChange,
  onBlendModeChange,
  onPressureSizeChange,
  onPressureOpacityChange,
}: PaintBrushPanelProps) {
  const canPaint =
    !!layer &&
    layer.layerKind === "image" &&
    !layer.locked;

  const validColor = /^#[0-9a-fA-F]{6}$/.test(color)
    ? color
    : "#ffffff";

  function applyPreset(preset: Preset) {
    onBrushSizeChange(preset.size);
    onBrushHardnessChange(preset.hardness);
    onBrushOpacityChange(preset.opacity);
    onBrushFlowChange(preset.flow);
    onBrushSpacingChange(preset.spacing);
    onBrushSmoothingChange(preset.smoothing);
  }

  function presetIsActive(preset: Preset) {
    return (
      Math.round(brushSize) === preset.size &&
      Math.round(brushHardness) === preset.hardness &&
      Math.round(brushOpacity) === preset.opacity &&
      Math.round(brushFlow) === preset.flow &&
      Math.round(brushSpacing) === preset.spacing &&
      Math.round(brushSmoothing) === preset.smoothing
    );
  }

  return (
    <section
      className={
        compact
          ? "p-3"
          : "border-b border-white/[0.07] bg-[linear-gradient(180deg,rgba(236,72,153,0.035),rgba(255,255,255,0))] p-4"
      }
    >
      <div className="rounded-2xl border border-white/[0.07] bg-[#11141a]/90 p-3 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-100">Brush Pro</h3>
            <p className="mt-1 text-[10px] leading-4 text-gray-500">
              Precision raster painting with stabilized strokes and pressure dynamics
            </p>
          </div>
          <span
            className={
              canPaint
                ? "rounded-full border border-pink-400/20 bg-pink-500/10 px-2 py-1 text-[8px] font-semibold tracking-[0.12em] text-pink-200"
                : "rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[8px] font-semibold tracking-[0.12em] text-gray-600"
            }
          >
            {canPaint ? "READY" : "IMAGE ONLY"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#090b0f]">
            <div
              className="relative rounded-full border border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.8)]"
              style={{
                width: 40,
                height: 40,
                background:
                  mode === "erase"
                    ? "radial-gradient(circle, rgba(255,255,255,0.08), rgba(255,255,255,0.01))"
                    : brushHardness >= 99
                      ? validColor
                      : `radial-gradient(circle, ${validColor} 0%, ${validColor} ${Math.max(0, Math.min(96, brushHardness))}%, transparent 100%)`,
              }}
            >
              {mode === "erase" && (
                <span className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-rose-200/90" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-[10px] text-gray-300">
              <span className="font-medium">{mode === "erase" ? "Erase" : "Paint"}</span>
              <span className="tabular-nums text-gray-500">{Math.round(brushSize)} px</span>
            </div>
            <div className="mt-1 text-[9px] leading-4 text-gray-600">
              {Math.round(brushHardness)}% hardness · {Math.round(brushOpacity)}% opacity · {Math.round(brushFlow)}% flow
            </div>
          </div>
        </div>
      </div>

      {!canPaint && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an unlocked raster Image layer before painting.
        </div>
      )}

      <SectionTitle>MODE</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <ModeButton active={mode === "paint"} disabled={!canPaint} onClick={() => onModeChange("paint")}>Paint</ModeButton>
        <ModeButton active={mode === "erase"} disabled={!canPaint} onClick={() => onModeChange("erase")}>Erase</ModeButton>
      </div>

      <SectionTitle>PRESETS</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            disabled={!canPaint}
            onClick={() => applyPreset(preset)}
            className={
              presetIsActive(preset)
                ? "min-h-10 rounded-xl border border-pink-400/40 bg-pink-500/10 px-2 py-2 text-[9px] font-medium text-pink-100 shadow-[inset_0_0_0_1px_rgba(244,114,182,0.06)]"
                : "min-h-10 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2 py-2 text-[9px] text-gray-400 transition hover:bg-white/[0.05] active:bg-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30"
            }
          >
            {preset.name}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!canPaint}
        onClick={() => applyPreset(DEFAULT_BRUSH)}
        className="mt-2 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[9px] text-gray-500 transition hover:text-gray-300 disabled:opacity-30"
      >
        Reset brush dynamics
      </button>

      <SectionTitle>COLOR</SectionTitle>
      <div className="flex items-center gap-3">
        <label className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-inner" title="Choose brush color">
          <input
            type="color"
            value={validColor}
            disabled={!canPaint || mode === "erase"}
            onChange={(event) => onColorChange(event.target.value)}
            className="absolute -inset-2 h-14 w-16 cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
          />
        </label>
        <input
          type="text"
          value={color}
          disabled={!canPaint || mode === "erase"}
          aria-label="Brush color hex value"
          spellCheck={false}
          onChange={(event) => {
            const value = event.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(value)) onColorChange(value);
          }}
          onBlur={() => {
            if (!/^#[0-9a-fA-F]{6}$/.test(color)) onColorChange("#ffffff");
          }}
          className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0d1016] px-3 py-2 text-[10px] uppercase text-gray-200 outline-none transition focus:border-pink-400/35 focus:ring-2 focus:ring-pink-400/[0.06] disabled:opacity-30"
        />
      </div>

      <div className="mt-2 grid grid-cols-8 gap-1">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={!canPaint || mode === "erase"}
            onClick={() => onColorChange(preset)}
            className={
              color.toLowerCase() === preset
                ? "h-7 rounded-md border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.65)]"
                : "h-7 rounded-md border border-white/20"
            }
            style={{ background: preset }}
            title={preset}
          />
        ))}
      </div>

      <SectionTitle>BRUSH DYNAMICS</SectionTitle>
      <div className="space-y-4">
        <PaintControl label="Size" value={brushSize} min={1} max={2000} suffix="px" disabled={!canPaint} onChange={onBrushSizeChange} />
        <PaintControl label="Hardness" value={brushHardness} min={0} max={100} suffix="%" disabled={!canPaint} onChange={onBrushHardnessChange} />
        <PaintControl label="Opacity" value={brushOpacity} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onBrushOpacityChange} />
        <PaintControl label="Flow" value={brushFlow} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onBrushFlowChange} />
        <PaintControl label="Spacing" value={brushSpacing} min={1} max={200} suffix="%" disabled={!canPaint} onChange={onBrushSpacingChange} />
        <PaintControl label="Smoothing" value={brushSmoothing} min={0} max={100} suffix="%" disabled={!canPaint} onChange={onBrushSmoothingChange} />
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1">
        {[5, 10, 25, 50, 100].map((value) => (
          <button
            key={value}
            type="button"
            disabled={!canPaint}
            onClick={() => onBrushSizeChange(value)}
            className={
              Math.round(brushSize) === value
                ? "rounded-lg border border-pink-500/40 bg-pink-500/10 px-1 py-1.5 text-[9px] text-pink-200"
                : "rounded-lg border border-white/[0.08] bg-white/[0.025] px-1 py-1.5 text-[9px] text-gray-500 active:bg-white/[0.07] disabled:opacity-30"
            }
          >
            {value}
          </button>
        ))}
      </div>

      <SectionTitle>BLENDING</SectionTitle>
      <select
        value={blendMode}
        disabled={!canPaint || mode === "erase"}
        onChange={(event) => onBlendModeChange(event.target.value as PaintBrushBlendMode)}
        className="w-full rounded-xl border border-white/[0.08] bg-[#0d1016] px-3 py-2.5 text-[10px] text-gray-200 outline-none transition focus:border-pink-400/35 focus:ring-2 focus:ring-pink-400/[0.06] disabled:opacity-30"
      >
        <option value="normal">Normal</option>
        <option value="multiply">Multiply</option>
        <option value="screen">Screen</option>
        <option value="overlay">Overlay</option>
      </select>

      <SectionTitle>PEN PRESSURE</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <ToggleButton active={pressureSize} disabled={!canPaint} onClick={() => onPressureSizeChange(!pressureSize)}>Pressure → Size</ToggleButton>
        <ToggleButton active={pressureOpacity} disabled={!canPaint} onClick={() => onPressureOpacityChange(!pressureOpacity)}>Pressure → Opacity</ToggleButton>
      </div>

      <SectionTitle>PRO WORKFLOW</SectionTitle>
      <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500">
        <Hint keyName="B">Paint tool</Hint>
        <Hint keyName="[ / ]">Brush size</Hint>
        <Hint keyName="Shift+[ / ]">Hardness</Hint>
        <Hint keyName="1–9">Opacity</Hint>
        <Hint keyName="Shift+1–9">Flow</Hint>
        <Hint keyName="`">Temp erase</Hint>
        <Hint keyName="Shift+click">Straight line</Hint>
        <Hint keyName="Esc">Cancel stroke</Hint>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Each completed stroke is one Undo step. Active selections restrict painting. Stylus pressure can control size and opacity, while mouse and touch remain deterministic.
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-2 mt-5 flex items-center gap-2 text-[9px] font-semibold tracking-[0.16em] text-gray-500 before:h-px before:w-3 before:bg-pink-400/30">
      {children}
    </div>
  );
}

function ModeButton({ active, disabled, onClick, children }: { active: boolean; disabled: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        active
          ? "min-h-10 rounded-xl border border-pink-500/40 bg-pink-500/10 px-3 py-2 text-[10px] font-medium text-pink-200"
          : "min-h-10 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] text-gray-400 active:bg-white/[0.07] disabled:opacity-30"
      }
    >
      {children}
    </button>
  );
}

function ToggleButton({ active, disabled, onClick, children }: { active: boolean; disabled: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "min-h-11 rounded-xl border border-pink-500/40 bg-pink-500/10 px-2 py-2 text-[9px] text-pink-200"
          : "min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2 py-2 text-[9px] text-gray-400 active:bg-white/[0.07] disabled:opacity-30"
      }
    >
      {children}
    </button>
  );
}

function PaintControl({ label, value, min, max, suffix, disabled, onChange }: { label: string; value: number; min: number; max: number; suffix: string; disabled: boolean; onChange: (value: number) => void }) {
  const safeValue = clamp(value, min, max);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-[10px] text-gray-400">{label}</label>
        <div className="flex items-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d1016] focus-within:border-pink-400/30">
          <input
            type="number"
            min={min}
            max={max}
            step={1}
            value={Math.round(safeValue)}
            disabled={disabled}
            onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
            className="w-14 bg-transparent px-2 py-1 text-right text-[9px] tabular-nums text-gray-300 outline-none disabled:opacity-30"
          />
          <span className="pr-2 text-[8px] text-gray-600">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={safeValue}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-pink-400 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}

function Hint({ keyName, children }: { keyName: string; children: string }) {
  return (
    <div className="flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2">
      <kbd className="shrink-0 rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[8px] text-gray-300">{keyName}</kbd>
      <span className="leading-3">{children}</span>
    </div>
  );
}
