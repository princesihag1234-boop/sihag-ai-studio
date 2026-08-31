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
  { name: "Hard Round", size: 40, hardness: 100, opacity: 100, flow: 100, spacing: 12, smoothing: 10 },
  { name: "Soft Round", size: 80, hardness: 0, opacity: 100, flow: 70, spacing: 10, smoothing: 25 },
  { name: "Pencil", size: 8, hardness: 100, opacity: 100, flow: 100, spacing: 8, smoothing: 15 },
  { name: "Marker", size: 55, hardness: 85, opacity: 70, flow: 55, spacing: 10, smoothing: 40 },
  { name: "Airbrush", size: 120, hardness: 0, opacity: 45, flow: 12, spacing: 5, smoothing: 50 },
  { name: "Highlighter", size: 90, hardness: 75, opacity: 28, flow: 100, spacing: 9, smoothing: 55 },
];

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

  function applyPreset(preset: Preset) {
    onBrushSizeChange(preset.size);
    onBrushHardnessChange(preset.hardness);
    onBrushOpacityChange(preset.opacity);
    onBrushFlowChange(preset.flow);
    onBrushSpacingChange(preset.spacing);
    onBrushSmoothingChange(preset.smoothing);
  }

  return (
    <section
      className={
        compact
          ? "p-3"
          : "border-b border-white/[0.07] bg-[linear-gradient(180deg,rgba(236,72,153,0.025),rgba(255,255,255,0))] p-4"
      }
    >
      <div className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2.5">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            Brush Pro
          </h3>
          <p className="mt-1 text-[10px] text-gray-500">
            Raster painting with flow, spacing and smoothing
          </p>
        </div>

        <span
          className={
            canPaint
              ? "rounded bg-pink-500/10 px-2 py-1 text-[9px] text-pink-300"
              : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
          }
        >
          {canPaint ? "READY" : "IMAGE ONLY"}
        </span>
      </div>

      {!canPaint && (
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[10px] leading-5 text-amber-200/80">
          Select an unlocked raster Image layer before painting.
        </div>
      )}

      <SectionTitle>MODE</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <ModeButton
          active={mode === "paint"}
          disabled={!canPaint}
          onClick={() => onModeChange("paint")}
        >
          Paint
        </ModeButton>
        <ModeButton
          active={mode === "erase"}
          disabled={!canPaint}
          onClick={() => onModeChange("erase")}
        >
          Erase
        </ModeButton>
      </div>

      <SectionTitle>PRESETS</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            disabled={!canPaint}
            onClick={() => applyPreset(preset)}
            className="min-h-10 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[9px] text-gray-300 active:bg-pink-500/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <SectionTitle>COLOR</SectionTitle>
      <div className="flex items-center gap-3">
        <label
          className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.04] shadow-inner"
          title="Choose brush color"
        >
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#ffffff"}
            disabled={!canPaint || mode === "erase"}
            onChange={(event) => onColorChange(event.target.value)}
            className="absolute -inset-2 h-14 w-16 cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
          />
        </label>

        <input
          type="text"
          value={color}
          disabled={!canPaint || mode === "erase"}
          onChange={(event) => {
            const value = event.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
              onColorChange(value);
            }
          }}
          onBlur={() => {
            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
              onColorChange("#ffffff");
            }
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
                ? "h-7 rounded border-2 border-white"
                : "h-7 rounded border border-white/20"
            }
            style={{ background: preset }}
            title={preset}
          />
        ))}
      </div>

      <SectionTitle>BRUSH DYNAMICS</SectionTitle>
      <div className="space-y-4">
        <PaintSlider label="Size" value={brushSize} min={2} max={500} suffix=" px" disabled={!canPaint} onChange={onBrushSizeChange} />
        <PaintSlider label="Hardness" value={brushHardness} min={0} max={100} suffix="%" disabled={!canPaint} onChange={onBrushHardnessChange} />
        <PaintSlider label="Opacity" value={brushOpacity} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onBrushOpacityChange} />
        <PaintSlider label="Flow" value={brushFlow} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onBrushFlowChange} />
        <PaintSlider label="Spacing" value={brushSpacing} min={1} max={100} suffix="%" disabled={!canPaint} onChange={onBrushSpacingChange} />
        <PaintSlider label="Smoothing" value={brushSmoothing} min={0} max={100} suffix="%" disabled={!canPaint} onChange={onBrushSmoothingChange} />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1">
        {[10, 25, 50, 100].map((value) => (
          <button
            key={value}
            type="button"
            disabled={!canPaint}
            onClick={() => onBrushSizeChange(value)}
            className={
              Math.round(brushSize) === value
                ? "rounded border border-pink-500/40 bg-pink-500/10 px-1 py-1.5 text-[9px] text-pink-200"
                : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 active:bg-white/[0.07] disabled:opacity-30"
            }
          >
            {value}px
          </button>
        ))}
      </div>

      <SectionTitle>BLENDING</SectionTitle>
      <select
        value={blendMode}
        disabled={!canPaint || mode === "erase"}
        onChange={(event) =>
          onBlendModeChange(event.target.value as PaintBrushBlendMode)
        }
        className="w-full rounded-xl border border-white/[0.08] bg-[#0d1016] px-3 py-2.5 text-[10px] text-gray-200 outline-none transition focus:border-pink-400/35 focus:ring-2 focus:ring-pink-400/[0.06] disabled:opacity-30"
      >
        <option value="normal">Normal</option>
        <option value="multiply">Multiply</option>
        <option value="screen">Screen</option>
        <option value="overlay">Overlay</option>
      </select>

      <SectionTitle>PEN PRESSURE</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <ToggleButton
          active={pressureSize}
          disabled={!canPaint}
          onClick={() => onPressureSizeChange(!pressureSize)}
        >
          Pressure → Size
        </ToggleButton>
        <ToggleButton
          active={pressureOpacity}
          disabled={!canPaint}
          onClick={() => onPressureOpacityChange(!pressureOpacity)}
        >
          Pressure → Opacity
        </ToggleButton>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-500">
        Each completed stroke is undoable. Active selections restrict painting. On mobile, the visible canvas remains touchable while Brush Pro is open. Pen pressure is used only for stylus pointers, so ordinary finger painting stays predictable.
      </div>

      <div className="mt-2 text-[9px] text-gray-600">
        Shortcut: K
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

function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        active
          ? "min-h-10 rounded-lg border border-pink-500/40 bg-pink-500/10 px-3 py-2 text-[10px] font-medium text-pink-200"
          : "min-h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-gray-400 active:bg-white/[0.07] disabled:opacity-30"
      }
    >
      {children}
    </button>
  );
}

function ToggleButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        active
          ? "min-h-11 rounded-lg border border-pink-500/40 bg-pink-500/10 px-2 py-2 text-[9px] text-pink-200"
          : "min-h-11 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[9px] text-gray-400 active:bg-white/[0.07] disabled:opacity-30"
      }
    >
      {children}
    </button>
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
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-400">
          {Math.round(value)}{suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-pink-400 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}
