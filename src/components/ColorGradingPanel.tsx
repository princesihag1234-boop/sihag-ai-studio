"use client";

import {
  useState,
} from "react";

import type {
  ColorGradingData,
  ColorGradeRange,
} from "@/lib/layerTypes";

type RangeName =
  | "shadows"
  | "midtones"
  | "highlights";

type ColorGradingPanelProps = {
  grading:
    ColorGradingData;

  disabled: boolean;

  onChangeStart: () => void;

  onChange: (
    grading:
      ColorGradingData
  ) => void;

  onReset: () => void;
};

const RANGE_LABELS:
  Record<
    RangeName,
    string
  > = {
    shadows:
      "Shadows",

    midtones:
      "Midtones",

    highlights:
      "Highlights",
  };

function cloneGrading(
  grading:
    ColorGradingData
):
  ColorGradingData {
  return {
    shadows: {
      ...grading.shadows,
    },

    midtones: {
      ...grading.midtones,
    },

    highlights: {
      ...grading.highlights,
    },

    balance:
      grading.balance,

    blending:
      grading.blending,
  };
}

export default function ColorGradingPanel({
  grading,
  disabled,
  onChangeStart,
  onChange,
  onReset,
}: ColorGradingPanelProps) {
  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<RangeName>(
      "shadows"
    );

  const active =
    grading[
      selectedRange
    ];

  function updateRange(
    changes:
      Partial<ColorGradeRange>
  ) {
    const next =
      cloneGrading(
        grading
      );

    next[
      selectedRange
    ] = {
      ...next[
        selectedRange
      ],
      ...changes,
    };

    onChange(
      next
    );
  }

  function updateRoot(
    changes:
      Partial<
        Pick<
          ColorGradingData,
          "balance" |
          "blending"
        >
      >
  ) {
    onChange({
      ...cloneGrading(
        grading
      ),
      ...changes,
    });
  }

  function resetRange() {
    onChangeStart();

    updateRange({
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
            Color Grading
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Shadows • Midtones • Highlights
          </p>

        </div>

        <button
          disabled={
            disabled
          }
          onClick={
            onReset
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset All
        </button>

      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">

        {(
          [
            "shadows",
            "midtones",
            "highlights",
          ] as
            RangeName[]
        ).map(
          (range) => {
            const values =
              grading[
                range
              ];

            const changed =
              values.saturation !==
                0 ||
              values.luminance !==
                0;

            return (
              <button
                key={
                  range
                }
                onClick={() =>
                  setSelectedRange(
                    range
                  )
                }
                className={
                  selectedRange ===
                  range
                    ? "relative rounded-lg border border-violet-500/45 bg-violet-500/10 px-2 py-2 text-[9px] text-violet-100"
                    : "relative rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[9px] text-gray-500 hover:bg-white/[0.06]"
                }
              >
                {RANGE_LABELS[
                  range
                ]}

                {changed && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </button>
            );
          }
        )}

      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">

        <div className="mb-3 flex items-center justify-between">

          <div className="text-[10px] font-medium text-gray-300">
            {RANGE_LABELS[
              selectedRange
            ]}
          </div>

          <button
            disabled={
              disabled
            }
            onClick={
              resetRange
            }
            className="rounded bg-white/5 px-2 py-1 text-[9px] text-gray-500 hover:bg-white/10 hover:text-gray-300 disabled:opacity-30"
          >
            Reset Range
          </button>

        </div>

        <div className="space-y-4">

          <div>

            <div className="mb-1.5 flex items-center justify-between">

              <span className="text-[10px] text-gray-400">
                Hue
              </span>

              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                {Math.round(
                  active.hue
                )}
                °
              </span>

            </div>

            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={
                active.hue
              }
              disabled={
                disabled
              }
              onPointerDown={
                onChangeStart
              }
              onChange={(
                event
              ) =>
                updateRange({
                  hue:
                    Number(
                      event.target
                        .value
                    ),
                })
              }
              style={{
                background:
                  "linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)",
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-30"
            />

          </div>

          <GradingSlider
            label="Saturation"
            value={
              active.saturation
            }
            min={0}
            max={100}
            suffix="%"
            disabled={
              disabled
            }
            onStart={
              onChangeStart
            }
            onChange={(
              value
            ) =>
              updateRange({
                saturation:
                  value,
              })
            }
          />

          <GradingSlider
            label="Luminance"
            value={
              active.luminance
            }
            min={-100}
            max={100}
            suffix=""
            disabled={
              disabled
            }
            onStart={
              onChangeStart
            }
            onChange={(
              value
            ) =>
              updateRange({
                luminance:
                  value,
              })
            }
          />

        </div>

      </div>

      <div className="mt-4 space-y-4">

        <GradingSlider
          label="Balance"
          value={
            grading.balance
          }
          min={-100}
          max={100}
          suffix=""
          disabled={
            disabled
          }
          onStart={
            onChangeStart
          }
          onChange={(
            value
          ) =>
            updateRoot({
              balance:
                value,
            })
          }
        />

        <GradingSlider
          label="Blending"
          value={
            grading.blending
          }
          min={0}
          max={100}
          suffix="%"
          disabled={
            disabled
          }
          onStart={
            onChangeStart
          }
          onChange={(
            value
          ) =>
            updateRoot({
              blending:
                value,
            })
          }
        />

      </div>

      <div className="mt-3 text-[9px] leading-4 text-gray-600">
        Balance shifts emphasis between shadows and highlights. Blending controls how smoothly the three tonal ranges overlap.
      </div>

    </section>
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
            0 &&
          min <
            0
            ? "+"
            : ""}
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

    </div>
  );
}
