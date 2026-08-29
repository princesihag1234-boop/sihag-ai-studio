"use client";

import {
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
  mixer:
    HslColorMixer;

  disabled: boolean;

  onChangeStart: () => void;

  onChange: (
    mixer:
      HslColorMixer
  ) => void;

  onResetAll: () => void;
};

const BAND_LABELS:
  Record<
    HslColorBand,
    string
  > = {
    red:
      "Red",

    orange:
      "Orange",

    yellow:
      "Yellow",

    green:
      "Green",

    aqua:
      "Aqua",

    blue:
      "Blue",

    purple:
      "Purple",

    magenta:
      "Magenta",
  };

const BAND_DOTS:
  Record<
    HslColorBand,
    string
  > = {
    red:
      "bg-red-500",

    orange:
      "bg-orange-500",

    yellow:
      "bg-yellow-400",

    green:
      "bg-green-500",

    aqua:
      "bg-cyan-400",

    blue:
      "bg-blue-500",

    purple:
      "bg-purple-500",

    magenta:
      "bg-pink-500",
  };

function cloneMixer(
  mixer:
    HslColorMixer
):
  HslColorMixer {
  return {
    red: {
      ...mixer.red,
    },

    orange: {
      ...mixer.orange,
    },

    yellow: {
      ...mixer.yellow,
    },

    green: {
      ...mixer.green,
    },

    aqua: {
      ...mixer.aqua,
    },

    blue: {
      ...mixer.blue,
    },

    purple: {
      ...mixer.purple,
    },

    magenta: {
      ...mixer.magenta,
    },
  };
}

export default function HslColorMixerPanel({
  mixer,
  disabled,
  onChangeStart,
  onChange,
  onResetAll,
}: HslColorMixerPanelProps) {
  const [
    selectedBand,
    setSelectedBand,
  ] =
    useState<HslColorBand>(
      "red"
    );

  const active =
    mixer[
      selectedBand
    ];

  function updateBand(
    changes:
      Partial<HslBandAdjustment>
  ) {
    const next =
      cloneMixer(
        mixer
      );

    next[
      selectedBand
    ] = {
      ...next[
        selectedBand
      ],
      ...changes,
    };

    onChange(
      next
    );
  }

  function resetBand() {
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
            Target individual color ranges
          </p>

        </div>

        <button
          disabled={
            disabled
          }
          onClick={
            onResetAll
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset All
        </button>

      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5">

        {HSL_BANDS.map(
          (band) => {
            const values =
              mixer[band];

            const changed =
              values.hue !==
                0 ||
              values.saturation !==
                0 ||
              values.luminance !==
                0;

            return (
              <button
                key={
                  band
                }
                onClick={() =>
                  setSelectedBand(
                    band
                  )
                }
                className={
                  selectedBand ===
                  band
                    ? "relative rounded-lg border border-violet-500/45 bg-violet-500/10 px-1.5 py-2 text-[9px] text-gray-100"
                    : "relative rounded-lg border border-white/10 bg-white/[0.03] px-1.5 py-2 text-[9px] text-gray-500 hover:bg-white/[0.06]"
                }
              >

                <span
                  className={
                    `mx-auto mb-1 block h-2.5 w-2.5 rounded-full ${BAND_DOTS[band]}`
                  }
                />

                {BAND_LABELS[
                  band
                ]}

                {changed && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}

              </button>
            );
          }
        )}

      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">

        <div className="mb-3 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className={
                `h-3 w-3 rounded-full ${BAND_DOTS[selectedBand]}`
              }
            />

            <span className="text-[10px] font-medium text-gray-300">
              {BAND_LABELS[
                selectedBand
              ]}
            </span>

          </div>

          <button
            disabled={
              disabled
            }
            onClick={
              resetBand
            }
            className="rounded bg-white/5 px-2 py-1 text-[9px] text-gray-500 hover:bg-white/10 hover:text-gray-300 disabled:opacity-30"
          >
            Reset Color
          </button>

        </div>

        <div className="space-y-4">

          <MixerSlider
            label="Hue"
            value={
              active.hue
            }
            disabled={
              disabled
            }
            onStart={
              onChangeStart
            }
            onChange={(
              value
            ) =>
              updateBand({
                hue:
                  value,
              })
            }
          />

          <MixerSlider
            label="Saturation"
            value={
              active.saturation
            }
            disabled={
              disabled
            }
            onStart={
              onChangeStart
            }
            onChange={(
              value
            ) =>
              updateBand({
                saturation:
                  value,
              })
            }
          />

          <MixerSlider
            label="Luminance"
            value={
              active.luminance
            }
            disabled={
              disabled
            }
            onStart={
              onChangeStart
            }
            onChange={(
              value
            ) =>
              updateBand({
                luminance:
                  value,
              })
            }
          />

        </div>

      </div>

      <div className="mt-3 text-[9px] leading-4 text-gray-600">
        Hue shifts the selected color, Saturation changes its intensity, and Luminance brightens or darkens only that color range.
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

        <span
          className={
            value ===
            0
              ? "rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-500"
              : "rounded bg-violet-500/10 px-2 py-0.5 text-[10px] tabular-nums text-violet-300"
          }
        >
          {value >
          0
            ? "+"
            : ""}
          {Math.round(
            value
          )}
        </span>

      </div>

      <input
        type="range"
        min={-100}
        max={100}
        step={1}
        value={
          value
        }
        disabled={
          disabled
        }
        onPointerDown={
          onStart
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
        className="w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
      />

      <div className="mt-1 flex justify-between text-[8px] text-gray-700">
        <span>
          -100
        </span>

        <span>
          0
        </span>

        <span>
          +100
        </span>
      </div>

    </div>
  );
}
