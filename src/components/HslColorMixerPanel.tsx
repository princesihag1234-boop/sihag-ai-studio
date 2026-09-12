"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  HslBandAdjustment,
  HslColorBand,
  HslColorMixer,
} from "@/lib/layerTypes";

import {
  HSL_BANDS,
} from "@/lib/hslColorMixer";

type HslColorMixerPanelProps = {
  mixer: HslColorMixer;
  disabled: boolean;
  onChangeStart: () => void;
  onChange: (mixer: HslColorMixer) => void;
  onResetAll: () => void;
};

const BAND_LABELS: Record<HslColorBand, string> = {
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  aqua: "Aqua",
  blue: "Blue",
  purple: "Purple",
  magenta: "Magenta",
};

const BAND_DOTS: Record<HslColorBand, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  aqua: "bg-cyan-400",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  magenta: "bg-pink-500",
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function cloneMixer(
  mixer: HslColorMixer
): HslColorMixer {
  return {
    red: { ...mixer.red },
    orange: { ...mixer.orange },
    yellow: { ...mixer.yellow },
    green: { ...mixer.green },
    aqua: { ...mixer.aqua },
    blue: { ...mixer.blue },
    purple: { ...mixer.purple },
    magenta: { ...mixer.magenta },
  };
}

function bandChanged(
  value: HslBandAdjustment
) {
  return (
    value.hue !== 0 ||
    value.saturation !== 0 ||
    value.luminance !== 0
  );
}

export default function HslColorMixerPanel({
  mixer,
  disabled,
  onChangeStart,
  onChange,
  onResetAll,
}: HslColorMixerPanelProps) {
  const [selectedBand, setSelectedBand] =
    useState<HslColorBand>("red");

  const active = mixer[selectedBand];

  const changedBandCount = useMemo(
    () =>
      HSL_BANDS.filter((band) =>
        bandChanged(mixer[band])
      ).length,
    [mixer]
  );

  function updateBand(
    changes: Partial<HslBandAdjustment>
  ) {
    const next = cloneMixer(mixer);

    next[selectedBand] = {
      ...next[selectedBand],
      ...changes,
    };

    onChange(next);
  }

  function resetBand() {
    if (disabled) return;

    onChangeStart();
    updateBand({
      hue: 0,
      saturation: 0,
      luminance: 0,
    });
  }

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            HSL / Color Mixer
          </h3>
          <p className="mt-1 text-[10px] text-gray-500">
            Precision control for eight overlapping color ranges
          </p>
        </div>

        <button
          disabled={disabled}
          onClick={onResetAll}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset All
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px]">
        <span className="text-gray-500">
          Active color ranges
        </span>
        <span
          className={
            changedBandCount > 0
              ? "rounded bg-violet-500/10 px-2 py-1 tabular-nums text-violet-300"
              : "rounded bg-white/5 px-2 py-1 tabular-nums text-gray-600"
          }
        >
          {changedBandCount} / {HSL_BANDS.length}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {HSL_BANDS.map((band) => {
          const values = mixer[band];
          const changed = bandChanged(values);

          return (
            <button
              key={band}
              type="button"
              onClick={() => setSelectedBand(band)}
              title={`${BAND_LABELS[band]} · H ${Math.round(values.hue)} · S ${Math.round(values.saturation)} · L ${Math.round(values.luminance)}`}
              className={
                selectedBand === band
                  ? "relative rounded-lg border border-violet-500/45 bg-violet-500/10 px-1.5 py-2 text-[9px] text-gray-100"
                  : "relative rounded-lg border border-white/10 bg-white/[0.03] px-1.5 py-2 text-[9px] text-gray-500 hover:bg-white/[0.06]"
              }
            >
              <span
                className={`mx-auto mb-1 block h-2.5 w-2.5 rounded-full ${BAND_DOTS[band]}`}
              />
              {BAND_LABELS[band]}

              {changed && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${BAND_DOTS[selectedBand]}`}
            />
            <div>
              <div className="text-[10px] font-medium text-gray-300">
                {BAND_LABELS[selectedBand]}
              </div>
              <div className="mt-0.5 text-[8px] text-gray-600">
                Hue · Saturation · Luminance
              </div>
            </div>
          </div>

          <button
            disabled={disabled || !bandChanged(active)}
            onClick={resetBand}
            className="rounded bg-white/5 px-2 py-1 text-[9px] text-gray-500 hover:bg-white/10 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Reset Color
          </button>
        </div>

        <div className="space-y-4">
          <MixerSlider
            label="Hue"
            value={active.hue}
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              updateBand({ hue: value })
            }
          />

          <MixerSlider
            label="Saturation"
            value={active.saturation}
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              updateBand({ saturation: value })
            }
          />

          <MixerSlider
            label="Luminance"
            value={active.luminance}
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              updateBand({ luminance: value })
            }
          />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px] leading-4 text-gray-600">
        Hue shifts only the selected range. Saturation changes its intensity, while Luminance adjusts brightness. Neighboring ranges blend softly to avoid hard color seams.
      </div>
    </section>
  );
}

function MixerSlider({
  label,
  value,
  disabled,
  onStart,
  onChange,
}: {
  label: string;
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
          {label}
        </span>

        <input
          type="number"
          min={-100}
          max={100}
          step={1}
          value={displayValue}
          disabled={disabled}
          onFocus={onStart}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) {
              onChange(clamp(next, -100, 100));
            }
          }}
          className={
            displayValue === 0
              ? "w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-right text-[10px] tabular-nums text-gray-500 outline-none focus:border-violet-500/40 disabled:opacity-30"
              : "w-16 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-right text-[10px] tabular-nums text-violet-300 outline-none focus:border-violet-500/50 disabled:opacity-30"
          }
          aria-label={`${label} value`}
        />
      </div>

      <input
        type="range"
        min={-100}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onPointerDown={onStart}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

      <div className="mt-1 flex justify-between text-[8px] text-gray-700">
        <span>-100</span>
        <button
          type="button"
          disabled={disabled || displayValue === 0}
          onPointerDown={onStart}
          onClick={() => onChange(0)}
          className="rounded px-1 hover:bg-white/5 hover:text-gray-500 disabled:cursor-default disabled:hover:bg-transparent"
        >
          0
        </button>
        <span>+100</span>
      </div>
    </div>
  );
}
