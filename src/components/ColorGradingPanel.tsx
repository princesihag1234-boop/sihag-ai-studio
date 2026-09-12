"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ColorGradingData,
  ColorGradeRange,
} from "@/lib/layerTypes";

import {
  cloneColorGrading,
  DEFAULT_COLOR_GRADING,
} from "@/lib/colorGrading";

type RangeName =
  | "shadows"
  | "midtones"
  | "highlights";

type ColorGradingPanelProps = {
  grading: ColorGradingData;
  disabled: boolean;
  onChangeStart: () => void;
  onChange: (grading: ColorGradingData) => void;
  onReset: () => void;
};

type GradingPreset = {
  name: string;
  description: string;
  value: ColorGradingData;
};

const RANGE_LABELS: Record<RangeName, string> = {
  shadows: "Shadows",
  midtones: "Midtones",
  highlights: "Highlights",
};

const RANGES: RangeName[] = [
  "shadows",
  "midtones",
  "highlights",
];

const GRADING_PRESETS: GradingPreset[] = [
  {
    name: "Neutral",
    description: "Clear color grade",
    value: DEFAULT_COLOR_GRADING,
  },
  {
    name: "Teal / Orange",
    description: "Cool shadows, warm highs",
    value: {
      shadows: { hue: 195, saturation: 18, luminance: -3 },
      midtones: { hue: 28, saturation: 6, luminance: 0 },
      highlights: { hue: 38, saturation: 18, luminance: 4 },
      balance: 8,
      blending: 62,
    },
  },
  {
    name: "Warm Film",
    description: "Soft warm highlight bias",
    value: {
      shadows: { hue: 218, saturation: 7, luminance: 1 },
      midtones: { hue: 30, saturation: 11, luminance: 1 },
      highlights: { hue: 46, saturation: 20, luminance: 4 },
      balance: 18,
      blending: 68,
    },
  },
  {
    name: "Cool Clean",
    description: "Subtle blue-cyan polish",
    value: {
      shadows: { hue: 214, saturation: 15, luminance: -1 },
      midtones: { hue: 198, saturation: 6, luminance: 0 },
      highlights: { hue: 220, saturation: 8, luminance: 2 },
      balance: -8,
      blending: 58,
    },
  },
];

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function rangeChanged(
  range: ColorGradeRange
) {
  return (
    range.saturation !== 0 ||
    range.luminance !== 0
  );
}

function hueSwatchStyle(
  range: ColorGradeRange
) {
  const saturation = Math.max(
    28,
    Math.min(100, range.saturation)
  );

  return {
    background: `hsl(${range.hue} ${saturation}% 52%)`,
  };
}

export default function ColorGradingPanel({
  grading,
  disabled,
  onChangeStart,
  onChange,
  onReset,
}: ColorGradingPanelProps) {
  const [selectedRange, setSelectedRange] =
    useState<RangeName>("shadows");

  const active = grading[selectedRange];

  const activeRangeCount = useMemo(
    () =>
      RANGES.filter((range) =>
        rangeChanged(grading[range])
      ).length,
    [grading]
  );

  function updateRange(
    changes: Partial<ColorGradeRange>
  ) {
    const next = cloneColorGrading(grading);

    next[selectedRange] = {
      ...next[selectedRange],
      ...changes,
    };

    onChange(next);
  }

  function updateRoot(
    changes: Partial<
      Pick<ColorGradingData, "balance" | "blending">
    >
  ) {
    onChange({
      ...cloneColorGrading(grading),
      ...changes,
    });
  }

  function resetRange() {
    if (disabled) return;

    onChangeStart();
    updateRange({
      hue: 0,
      saturation: 0,
      luminance: 0,
    });
  }

  function applyPreset(
    preset: GradingPreset
  ) {
    if (disabled) return;

    onChangeStart();
    onChange(
      cloneColorGrading(preset.value)
    );
  }

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            Color Grading
          </h3>
          <p className="mt-1 text-[10px] text-gray-500">
            Three-way tonal color separation
          </p>
        </div>

        <button
          disabled={disabled}
          onClick={onReset}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset All
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px]">
        <span className="text-gray-500">
          Active tonal ranges
        </span>
        <span
          className={
            activeRangeCount > 0
              ? "rounded bg-violet-500/10 px-2 py-1 tabular-nums text-violet-300"
              : "rounded bg-white/5 px-2 py-1 tabular-nums text-gray-600"
          }
        >
          {activeRangeCount} / 3
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {RANGES.map((range) => {
          const values = grading[range];
          const changed = rangeChanged(values);

          return (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={
                selectedRange === range
                  ? "relative rounded-lg border border-violet-500/45 bg-violet-500/10 px-2 py-2 text-[9px] text-violet-100"
                  : "relative rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[9px] text-gray-500 hover:bg-white/[0.06]"
              }
            >
              <span
                className="mx-auto mb-1.5 block h-2.5 w-8 rounded-full border border-white/10"
                style={hueSwatchStyle(values)}
              />
              {RANGE_LABELS[range]}

              {changed && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-white/15"
              style={hueSwatchStyle(active)}
            />
            <div>
              <div className="text-[10px] font-medium text-gray-300">
                {RANGE_LABELS[selectedRange]}
              </div>
              <div className="mt-0.5 text-[8px] text-gray-600">
                Hue · Saturation · Luminance
              </div>
            </div>
          </div>

          <button
            disabled={disabled || !rangeChanged(active)}
            onClick={resetRange}
            className="rounded bg-white/5 px-2 py-1 text-[9px] text-gray-500 hover:bg-white/10 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Reset Range
          </button>
        </div>

        <div className="space-y-4">
          <HueSlider
            value={active.hue}
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              updateRange({ hue: value })
            }
          />

          <GradingSlider
            label="Saturation"
            value={active.saturation}
            min={0}
            max={100}
            suffix="%"
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              updateRange({ saturation: value })
            }
          />

          <GradingSlider
            label="Luminance"
            value={active.luminance}
            min={-100}
            max={100}
            suffix=""
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              updateRange({ luminance: value })
            }
          />
        </div>
      </div>

      <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
          TONAL TRANSITION
        </div>

        <GradingSlider
          label="Balance"
          value={grading.balance}
          min={-100}
          max={100}
          suffix=""
          disabled={disabled}
          onStart={onChangeStart}
          onChange={(value) =>
            updateRoot({ balance: value })
          }
        />

        <GradingSlider
          label="Blending"
          value={grading.blending}
          min={0}
          max={100}
          suffix="%"
          disabled={disabled}
          onStart={onChangeStart}
          onChange={(value) =>
            updateRoot({ blending: value })
          }
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
          COLOR GRADE STARTING POINTS
        </div>

        <div className="grid grid-cols-2 gap-2">
          {GRADING_PRESETS.map((preset) => (
            <button
              key={preset.name}
              disabled={disabled}
              onClick={() => applyPreset(preset)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-left hover:border-violet-500/35 hover:bg-violet-500/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <div className="text-[9px] font-medium text-gray-300">
                {preset.name}
              </div>
              <div className="mt-0.5 text-[8px] leading-3 text-gray-600">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px] leading-4 text-gray-600">
        Balance shifts the tonal split toward shadows or highlights. Blending controls overlap between ranges. Presets remain fully editable after application.
      </div>
    </section>
  );
}

function HueSlider({
  value,
  disabled,
  onStart,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onStart: () => void;
  onChange: (value: number) => void;
}) {
  const displayValue = Math.round(value);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[10px] text-gray-400">
          Hue
        </span>

        <input
          type="number"
          min={0}
          max={359}
          step={1}
          value={displayValue}
          disabled={disabled}
          onFocus={onStart}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) {
              onChange(
                ((Math.round(next) % 360) + 360) % 360
              );
            }
          }}
          className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-[10px] tabular-nums text-gray-300 outline-none focus:border-violet-500/50 disabled:opacity-30"
          aria-label="Hue value"
        />
      </div>

      <input
        type="range"
        min={0}
        max={359}
        step={1}
        value={value}
        disabled={disabled}
        onPointerDown={onStart}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        style={{
          background:
            "linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)",
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}

function GradingSlider({
  label,
  value,
  min,
  max,
  suffix,
  disabled,
  onStart,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  disabled: boolean;
  onStart: () => void;
  onChange: (value: number) => void;
}) {
  const displayValue = Math.round(value);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[10px] text-gray-400">
          {label}
        </span>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={1}
            value={displayValue}
            disabled={disabled}
            onFocus={onStart}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) {
                onChange(clamp(next, min, max));
              }
            }}
            className={
              displayValue === 0
                ? "w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-[10px] tabular-nums text-gray-500 outline-none focus:border-violet-500/40 disabled:opacity-30"
                : "w-16 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-right text-[10px] tabular-nums text-violet-300 outline-none focus:border-violet-500/50 disabled:opacity-30"
            }
            aria-label={`${label} value`}
          />
          {suffix && (
            <span className="text-[9px] text-gray-600">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onPointerDown={onStart}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}
