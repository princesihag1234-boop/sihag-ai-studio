"use client";

import type {
  GradientLayerData,
  GradientStop,
  GradientType,
  ImageLayer,
} from "@/lib/layerTypes";

import {
  DEFAULT_GRADIENT_LAYER,
} from "@/lib/gradientLayer";

type GradientLayerPanelProps = {
  layer:
    ImageLayer | null;

  onAdd: () => void;

  onChange: (
    id: string,
    changes:
      Partial<GradientLayerData>
  ) => void;

  onChangeStart: () => void;
};

type GradientPreset = {
  label: string;
  type?: GradientType;
  angle?: number;
  stops: GradientStop[];
};

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    label: "Indigo",
    angle: 45,
    stops: [
      {
        position: 0,
        color: "#4338ca",
        opacity: 100,
      },
      {
        position: 50,
        color: "#7c3aed",
        opacity: 100,
      },
      {
        position: 100,
        color: "#ec4899",
        opacity: 100,
      },
    ],
  },
  {
    label: "Ocean",
    angle: 20,
    stops: [
      {
        position: 0,
        color: "#0f172a",
        opacity: 100,
      },
      {
        position: 48,
        color: "#0369a1",
        opacity: 100,
      },
      {
        position: 100,
        color: "#22d3ee",
        opacity: 100,
      },
    ],
  },
  {
    label: "Sunset",
    angle: 12,
    stops: [
      {
        position: 0,
        color: "#7c2d12",
        opacity: 100,
      },
      {
        position: 45,
        color: "#f97316",
        opacity: 100,
      },
      {
        position: 100,
        color: "#fde68a",
        opacity: 100,
      },
    ],
  },
  {
    label: "Spotlight",
    type: "radial",
    stops: [
      {
        position: 0,
        color: "#ffffff",
        opacity: 100,
      },
      {
        position: 55,
        color: "#94a3b8",
        opacity: 80,
      },
      {
        position: 100,
        color: "#020617",
        opacity: 100,
      },
    ],
  },
];

const ANGLE_PRESETS = [
  0,
  45,
  90,
  135,
  180,
  225,
  270,
  315,
] as const;

function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

function rgbaFromHex(
  color: string,
  opacity: number
) {
  const safe =
    /^#[0-9a-fA-F]{6}$/.test(
      color
    )
      ? color
      : "#000000";

  const red =
    Number.parseInt(
      safe.slice(1, 3),
      16
    );

  const green =
    Number.parseInt(
      safe.slice(3, 5),
      16
    );

  const blue =
    Number.parseInt(
      safe.slice(5, 7),
      16
    );

  return `rgba(${red}, ${green}, ${blue}, ${clamp(opacity, 0, 100) / 100})`;
}

function gradientPreviewCss(
  data: GradientLayerData
) {
  const stops =
    data.stops
      .map(
        (stop) =>
          `${rgbaFromHex(stop.color, stop.opacity)} ${stop.position}%`
      )
      .join(", ");

  if (
    data.gradientType ===
    "radial"
  ) {
    return `radial-gradient(circle at ${data.centerX}% ${data.centerY}%, ${stops})`;
  }

  if (
    data.gradientType ===
    "conic"
  ) {
    return `conic-gradient(from ${data.angle}deg at ${data.centerX}% ${data.centerY}%, ${stops})`;
  }

  return `linear-gradient(${data.angle}deg, ${stops})`;
}

function mixHexColors(
  colorA: string,
  colorB: string
) {
  function channel(
    value: string,
    start: number
  ) {
    return Number.parseInt(
      value.slice(
        start,
        start + 2
      ),
      16
    );
  }

  const a =
    /^#[0-9a-fA-F]{6}$/.test(
      colorA
    )
      ? colorA
      : "#000000";

  const b =
    /^#[0-9a-fA-F]{6}$/.test(
      colorB
    )
      ? colorB
      : "#ffffff";

  const values = [
    Math.round(
      (channel(a, 1) +
        channel(b, 1)) /
        2
    ),
    Math.round(
      (channel(a, 3) +
        channel(b, 3)) /
        2
    ),
    Math.round(
      (channel(a, 5) +
        channel(b, 5)) /
        2
    ),
  ];

  return `#${values
    .map((value) =>
      value
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

export default function GradientLayerPanel({
  layer,
  onAdd,
  onChange,
  onChangeStart,
}: GradientLayerPanelProps) {
  const isGradientLayer =
    layer?.layerKind ===
      "gradient" &&
    !!layer.gradient;

  const gradient =
    isGradientLayer
      ? layer.gradient
      : null;

  if (
    !isGradientLayer ||
    !gradient ||
    !layer
  ) {
    return (
      <section className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">
              Gradient
            </h3>

            <p className="mt-1 text-[10px] text-gray-500">
              Non-destructive gradient fill layers
            </p>
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-5 text-gray-500">
          Drag across the canvas to create a directional gradient, or add a default gradient layer and refine its stops here.
        </p>

        <button
          type="button"
          onClick={onAdd}
          className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-indigo-500"
        >
          + Add Gradient Layer
        </button>
      </section>
    );
  }

  const gradientLayer =
    layer;

  const currentGradient:
    GradientLayerData =
      gradient;

  const disabled =
    gradientLayer.locked;

  function applyChanges(
    changes:
      Partial<GradientLayerData>
  ) {
    onChange(
      gradientLayer.id,
      changes
    );
  }

  function applyButtonChanges(
    changes:
      Partial<GradientLayerData>
  ) {
    if (disabled) {
      return;
    }

    onChangeStart();
    applyChanges(changes);
  }

  function updateStop(
    index: number,
    changes:
      Partial<GradientStop>
  ) {
    const stops =
      currentGradient.stops.map(
        (stop, stopIndex) =>
          stopIndex === index
            ? {
                ...stop,
                ...changes,
              }
            : {
                ...stop,
              }
      );

    applyChanges({
      stops,
    });
  }

  function addStop() {
    if (
      disabled ||
      currentGradient.stops.length >= 8
    ) {
      return;
    }

    let insertAfter =
      0;

    let largestGap =
      -1;

    for (
      let index = 0;
      index <
      currentGradient.stops.length - 1;
      index += 1
    ) {
      const gap =
        currentGradient.stops[index + 1].position -
        currentGradient.stops[index].position;

      if (gap > largestGap) {
        largestGap = gap;
        insertAfter = index;
      }
    }

    const left =
      currentGradient.stops[
        insertAfter
      ];

    const right =
      currentGradient.stops[
        Math.min(
          insertAfter + 1,
          currentGradient.stops.length - 1
        )
      ];

    const nextStop: GradientStop = {
      position:
        Math.round(
          (
            left.position +
            right.position
          ) /
            2
        ),

      color:
        mixHexColors(
          left.color,
          right.color
        ),

      opacity:
        Math.round(
          (
            left.opacity +
            right.opacity
          ) /
            2
        ),
    };

    onChangeStart();

    applyChanges({
      stops: [
        ...currentGradient.stops,
        nextStop,
      ].sort(
        (a, b) =>
          a.position -
          b.position
      ),
    });
  }

  function removeStop(
    index: number
  ) {
    if (
      disabled ||
      currentGradient.stops.length <= 2
    ) {
      return;
    }

    onChangeStart();

    applyChanges({
      stops:
        currentGradient.stops.filter(
          (_, stopIndex) =>
            stopIndex !== index
        ),
    });
  }

  function reverseStops() {
    applyButtonChanges({
      stops:
        currentGradient.stops
          .map((stop) => ({
            ...stop,
            position:
              100 -
              stop.position,
          }))
          .sort(
            (a, b) =>
              a.position -
              b.position
          ),
    });
  }

  function resetGradient() {
    applyButtonChanges({
      ...DEFAULT_GRADIENT_LAYER,
      width:
        currentGradient.width,
      height:
        currentGradient.height,
      stops:
        DEFAULT_GRADIENT_LAYER.stops.map(
          (stop) => ({ ...stop })
        ),
    });
  }

  const preview =
    gradientPreviewCss(
      currentGradient
    );

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            Gradient
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Editable multi-stop fill
          </p>
        </div>

        <span className="rounded bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300">
          GRADIENT
        </span>
      </div>

      <div
        className="mt-4 h-20 overflow-hidden rounded-xl border border-white/10 shadow-inner"
        style={{
          background:
            preview,
        }}
      />

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
            TYPE
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["linear", "Linear"],
                ["radial", "Radial"],
                ["conic", "Angle"],
              ] as const
            ).map(([
              value,
              label,
            ]) => (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  applyButtonChanges({
                    gradientType:
                      value,
                  })
                }
                className={
                  currentGradient.gradientType ===
                  value
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[9px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              PRESETS
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={resetGradient}
              className="text-[9px] text-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map(
              (preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    applyButtonChanges({
                      gradientType:
                        preset.type ??
                        "linear",
                      angle:
                        preset.angle ??
                        currentGradient.angle,
                      stops:
                        preset.stops.map(
                          (stop) => ({
                            ...stop,
                          })
                        ),
                    })
                  }
                  className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] text-left hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    className="block h-7"
                    style={{
                      background:
                        gradientPreviewCss({
                          ...currentGradient,
                          gradientType:
                            preset.type ??
                            "linear",
                          angle:
                            preset.angle ??
                            currentGradient.angle,
                          stops:
                            preset.stops,
                        }),
                    }}
                  />
                  <span className="block px-2 py-1.5 text-[9px] text-gray-400">
                    {preset.label}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              GEOMETRY
            </div>

            <span className="text-[9px] tabular-nums text-gray-600">
              {Math.round(
                currentGradient.width
              )}
              {" × "}
              {Math.round(
                currentGradient.height
              )}
              px
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <GradientNumberInput
              label="Width"
              value={
                currentGradient.width
              }
              min={20}
              max={6000}
              disabled={disabled}
              onStart={onChangeStart}
              onChange={(value) =>
                applyChanges({
                  width:
                    value,
                })
              }
            />

            <GradientNumberInput
              label="Height"
              value={
                currentGradient.height
              }
              min={20}
              max={6000}
              disabled={disabled}
              onStart={onChangeStart}
              onChange={(value) =>
                applyChanges({
                  height:
                    value,
                })
              }
            />
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              applyButtonChanges({
                width:
                  currentGradient.height,
                height:
                  currentGradient.width,
              })
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Swap Width / Height
          </button>
        </div>

        {currentGradient.gradientType !==
          "radial" && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                ANGLE
              </div>

              <span className="text-[9px] tabular-nums text-gray-500">
                {Math.round(
                  currentGradient.angle
                )}°
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={
                currentGradient.angle
              }
              disabled={disabled}
              onPointerDown={
                onChangeStart
              }
              onChange={(event) =>
                applyChanges({
                  angle:
                    Number(
                      event.target.value
                    ),
                })
              }
              className="w-full"
            />

            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {ANGLE_PRESETS.map(
                (angle) => (
                  <button
                    key={angle}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      applyButtonChanges({
                        angle,
                      })
                    }
                    className={
                      Math.round(
                        currentGradient.angle
                      ) === angle
                        ? "rounded-md border border-indigo-500/50 bg-indigo-500/20 px-1 py-1.5 text-[8px] text-indigo-200"
                        : "rounded-md border border-white/10 bg-white/5 px-1 py-1.5 text-[8px] text-gray-500 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    }
                  >
                    {angle}°
                  </button>
                )
              )}
            </div>
          </div>
        )}

        <GradientSlider
          label="Center X"
          value={
            currentGradient.centerX
          }
          min={0}
          max={100}
          suffix="%"
          disabled={disabled}
          onStart={onChangeStart}
          onChange={(value) =>
            applyChanges({
              centerX:
                value,
            })
          }
        />

        <GradientSlider
          label="Center Y"
          value={
            currentGradient.centerY
          }
          min={0}
          max={100}
          suffix="%"
          disabled={disabled}
          onStart={onChangeStart}
          onChange={(value) =>
            applyChanges({
              centerY:
                value,
            })
          }
        />

        {currentGradient.gradientType !==
          "conic" && (
          <GradientSlider
            label="Spread"
            value={
              currentGradient.scale
            }
            min={10}
            max={300}
            suffix="%"
            disabled={disabled}
            onStart={onChangeStart}
            onChange={(value) =>
              applyChanges({
                scale:
                  value,
              })
            }
          />
        )}

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                COLOR STOPS
              </div>
              <div className="mt-1 text-[9px] text-gray-600">
                {currentGradient.stops.length} stops · maximum 8
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={disabled}
                onClick={reverseStops}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[8px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reverse
              </button>

              <button
                type="button"
                disabled={
                  disabled ||
                  currentGradient.stops.length >= 8
                }
                onClick={addStop}
                className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-1.5 text-[8px] text-indigo-200 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Stop
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {currentGradient.stops.map(
              (stop, index) => (
                <div
                  key={`${index}-${stop.position}-${stop.color}`}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        stop.color
                      }
                      disabled={disabled}
                      onFocus={onChangeStart}
                      onChange={(event) =>
                        updateStop(
                          index,
                          {
                            color:
                              event.target.value,
                          }
                        )
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent disabled:cursor-not-allowed"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[8px] text-gray-500">
                        <span>
                          Stop {index + 1}
                        </span>
                        <span className="tabular-nums">
                          {Math.round(
                            stop.position
                          )}% · {Math.round(
                            stop.opacity
                          )}% opacity
                        </span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={
                          stop.position
                        }
                        disabled={disabled}
                        onPointerDown={
                          onChangeStart
                        }
                        onChange={(event) =>
                          updateStop(
                            index,
                            {
                              position:
                                Number(
                                  event.target.value
                                ),
                            }
                          )
                        }
                        className="mt-1 w-full"
                      />
                    </div>

                    <button
                      type="button"
                      title="Remove color stop"
                      disabled={
                        disabled ||
                        currentGradient.stops.length <= 2
                      }
                      onClick={() =>
                        removeStop(
                          index
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[12px] text-gray-500 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <GradientNumberInput
                      label="Position"
                      value={
                        stop.position
                      }
                      min={0}
                      max={100}
                      suffix="%"
                      disabled={disabled}
                      onStart={onChangeStart}
                      onChange={(value) =>
                        updateStop(
                          index,
                          {
                            position:
                              value,
                          }
                        )
                      }
                    />

                    <GradientNumberInput
                      label="Opacity"
                      value={
                        stop.opacity
                      }
                      min={0}
                      max={100}
                      suffix="%"
                      disabled={disabled}
                      onStart={onChangeStart}
                      onChange={(value) =>
                        updateStop(
                          index,
                          {
                            opacity:
                              value,
                          }
                        )
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {disabled && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[9px] leading-4 text-amber-200/80">
            Unlock this layer to edit the currentGradient.
          </div>
        )}
      </div>
    </section>
  );
}

function GradientSlider({
  label,
  value,
  min,
  max,
  suffix = "",
  disabled,
  onStart,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  disabled: boolean;
  onStart: () => void;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[9px] text-gray-500">
        <span>
          {label}
        </span>
        <span className="tabular-nums text-gray-400">
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
        value={value}
        disabled={disabled}
        onPointerDown={onStart}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full"
      />
    </div>
  );
}

function GradientNumberInput({
  label,
  value,
  min,
  max,
  suffix = "",
  disabled,
  onStart,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  disabled: boolean;
  onStart: () => void;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <label className="block rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-2">
      <span className="block text-[8px] uppercase tracking-[0.08em] text-gray-600">
        {label}
      </span>

      <span className="mt-1 flex items-center gap-1">
        <input
          type="number"
          value={
            Math.round(
              value *
              100
            ) /
            100
          }
          min={min}
          max={max}
          disabled={disabled}
          onFocus={onStart}
          onChange={(event) => {
            const parsed =
              Number(
                event.target.value
              );

            if (
              Number.isFinite(
                parsed
              )
            ) {
              onChange(
                clamp(
                  parsed,
                  min,
                  max
                )
              );
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[10px] tabular-nums text-gray-200 outline-none disabled:cursor-not-allowed disabled:opacity-40"
        />

        {suffix && (
          <span className="text-[8px] text-gray-600">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}
