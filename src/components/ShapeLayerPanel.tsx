"use client";

import type {
  ImageLayer,
  ShapeLayerData,
  ShapeType,
} from "@/lib/layerTypes";

import {
  DEFAULT_SHAPE_LAYER,
} from "@/lib/shapeLayer";

type ShapeLayerPanelProps = {
  layer:
    ImageLayer | null;

  onAdd: () => void;

  onChange: (
    id: string,
    changes:
      Partial<ShapeLayerData>
  ) => void;

  onChangeStart: () => void;
};

const SHAPE_OPTIONS: {
  value: ShapeType;
  label: string;
}[] = [
  {
    value:
      "rectangle",
    label:
      "Rectangle",
  },
  {
    value:
      "rounded-rectangle",
    label:
      "Rounded",
  },
  {
    value:
      "ellipse",
    label:
      "Ellipse",
  },
  {
    value:
      "triangle",
    label:
      "Triangle",
  },
  {
    value:
      "diamond",
    label:
      "Diamond",
  },
  {
    value:
      "hexagon",
    label:
      "Hexagon",
  },
  {
    value:
      "star",
    label:
      "Star",
  },
];

const GEOMETRY_PRESETS = [
  {
    label:
      "Square",
    width:
      400,
    height:
      400,
  },
  {
    label:
      "Wide",
    width:
      640,
    height:
      360,
  },
  {
    label:
      "Portrait",
    width:
      400,
    height:
      600,
  },
] as const;

const STYLE_PRESETS: {
  label: string;
  changes:
    Partial<ShapeLayerData>;
}[] = [
  {
    label:
      "Clean",
    changes: {
      fillEnabled:
        true,
      fillMode:
        "solid",
      fillColor:
        "#6366f1",
      fillOpacity:
        100,
      strokeEnabled:
        false,
      shadowEnabled:
        false,
    },
  },
  {
    label:
      "Outline",
    changes: {
      fillEnabled:
        false,
      strokeEnabled:
        true,
      strokeColor:
        "#ffffff",
      strokeWidth:
        6,
      strokeOpacity:
        100,
      strokeStyle:
        "solid",
      shadowEnabled:
        false,
    },
  },
  {
    label:
      "Gradient",
    changes: {
      fillEnabled:
        true,
      fillMode:
        "linear-gradient",
      fillOpacity:
        100,
      gradientColor1:
        "#6366f1",
      gradientColor2:
        "#ec4899",
      gradientAngle:
        45,
      strokeEnabled:
        false,
      shadowEnabled:
        false,
    },
  },
  {
    label:
      "Soft Shadow",
    changes: {
      fillEnabled:
        true,
      fillMode:
        "solid",
      fillColor:
        "#6366f1",
      fillOpacity:
        100,
      strokeEnabled:
        false,
      shadowEnabled:
        true,
      shadowColor:
        "#000000",
      shadowOpacity:
        35,
      shadowBlur:
        30,
      shadowX:
        10,
      shadowY:
        14,
    },
  },
];

export default function ShapeLayerPanel({
  layer,
  onAdd,
  onChange,
  onChangeStart,
}: ShapeLayerPanelProps) {
  const isShapeLayer =
    layer?.layerKind ===
      "shape" &&
    !!layer.shape;

  const shape =
    isShapeLayer
      ? layer.shape
      : null;

  if (
    !isShapeLayer ||
    !shape ||
    !layer
  ) {
    return (
      <section className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">
              Shape
            </h3>

            <p className="mt-1 text-[10px] text-gray-500">
              Editable vector-style shapes
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] leading-5 text-gray-500">
            Add a shape layer, then edit its geometry, fill, stroke and shadow without flattening it.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            + Add Shape Layer
          </button>
        </div>
      </section>
    );
  }

  const shapeLayer =
    layer;

  const disabled =
    shapeLayer.locked;

  function applyChanges(
    changes:
      Partial<ShapeLayerData>
  ) {
    onChange(
      shapeLayer.id,
      changes
    );
  }

  function applyButtonChanges(
    changes:
      Partial<ShapeLayerData>
  ) {
    if (disabled) {
      return;
    }

    onChangeStart();
    applyChanges(
      changes
    );
  }

  const gradientPreview =
    shape.fillMode ===
    "radial-gradient"
      ? `radial-gradient(circle, ${shape.gradientColor1}, ${shape.gradientColor2})`
      : `linear-gradient(${shape.gradientAngle}deg, ${shape.gradientColor1}, ${shape.gradientColor2})`;

  const aspectRatio =
    shape.height > 0
      ? shape.width /
        shape.height
      : 1;

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Shape
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Editable vector-style geometry
          </p>
        </div>

        <span className="rounded bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300">
          SHAPE
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
            SHAPE TYPE
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SHAPE_OPTIONS.map(
              ({
                value,
                label,
              }) => (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    applyButtonChanges({
                      shapeType:
                        value,
                    })
                  }
                  className={
                    shape.shapeType ===
                    value
                      ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[9px] text-indigo-200"
                      : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  }
                >
                  {label}
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
                shape.width
              )}
              {" × "}
              {Math.round(
                shape.height
              )}
              {" · "}
              {aspectRatio.toFixed(
                2
              )}
              :1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ShapeNumberInput
              label="Width"
              value={
                shape.width
              }
              disabled={disabled}
              onStart={
                onChangeStart
              }
              onChange={(
                value
              ) =>
                applyChanges({
                  width:
                    value,
                })
              }
            />

            <ShapeNumberInput
              label="Height"
              value={
                shape.height
              }
              disabled={disabled}
              onStart={
                onChangeStart
              }
              onChange={(
                value
              ) =>
                applyChanges({
                  height:
                    value,
                })
              }
            />
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {GEOMETRY_PRESETS.map(
              (preset) => (
                <button
                  key={
                    preset.label
                  }
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    applyButtonChanges({
                      width:
                        preset.width,
                      height:
                        preset.height,
                    })
                  }
                  className="rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[8px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {preset.label}
                </button>
              )
            )}

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                applyButtonChanges({
                  width:
                    shape.height,
                  height:
                    shape.width,
                })
              }
              className="rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[8px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Swap
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              STYLE PRESETS
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                applyButtonChanges({
                  fillEnabled:
                    DEFAULT_SHAPE_LAYER.fillEnabled,
                  fillMode:
                    DEFAULT_SHAPE_LAYER.fillMode,
                  fillColor:
                    DEFAULT_SHAPE_LAYER.fillColor,
                  fillOpacity:
                    DEFAULT_SHAPE_LAYER.fillOpacity,
                  gradientColor1:
                    DEFAULT_SHAPE_LAYER.gradientColor1,
                  gradientColor2:
                    DEFAULT_SHAPE_LAYER.gradientColor2,
                  gradientAngle:
                    DEFAULT_SHAPE_LAYER.gradientAngle,
                  strokeEnabled:
                    DEFAULT_SHAPE_LAYER.strokeEnabled,
                  strokeColor:
                    DEFAULT_SHAPE_LAYER.strokeColor,
                  strokeWidth:
                    DEFAULT_SHAPE_LAYER.strokeWidth,
                  strokeOpacity:
                    DEFAULT_SHAPE_LAYER.strokeOpacity,
                  strokeStyle:
                    DEFAULT_SHAPE_LAYER.strokeStyle,
                  cornerRadius:
                    DEFAULT_SHAPE_LAYER.cornerRadius,
                  shadowEnabled:
                    DEFAULT_SHAPE_LAYER.shadowEnabled,
                  shadowColor:
                    DEFAULT_SHAPE_LAYER.shadowColor,
                  shadowOpacity:
                    DEFAULT_SHAPE_LAYER.shadowOpacity,
                  shadowBlur:
                    DEFAULT_SHAPE_LAYER.shadowBlur,
                  shadowX:
                    DEFAULT_SHAPE_LAYER.shadowX,
                  shadowY:
                    DEFAULT_SHAPE_LAYER.shadowY,
                })
              }
              className="text-[9px] text-indigo-400 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset Style
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map(
              (preset) => (
                <button
                  key={
                    preset.label
                  }
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    applyButtonChanges(
                      preset.changes
                    )
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {preset.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                FILL
              </div>

              <div className="mt-1 text-[9px] text-gray-600">
                Interior color or gradient
              </div>
            </div>

            <ToggleButton
              enabled={
                shape.fillEnabled
              }
              disabled={disabled}
              onClick={() =>
                applyButtonChanges({
                  fillEnabled:
                    !shape.fillEnabled,
                })
              }
            />
          </div>

          {shape.fillEnabled && (
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-2 text-[9px] text-gray-500">
                  Fill Type
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      [
                        "solid",
                        "Solid",
                      ],
                      [
                        "linear-gradient",
                        "Linear",
                      ],
                      [
                        "radial-gradient",
                        "Radial",
                      ],
                    ] as const
                  ).map(
                    ([
                      value,
                      label,
                    ]) => (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          applyButtonChanges({
                            fillMode:
                              value,
                          })
                        }
                        className={
                          shape.fillMode ===
                          value
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[9px] text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        }
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {shape.fillMode ===
              "solid" ? (
                <ShapeColorControl
                  label="Fill Color"
                  value={
                    shape.fillColor
                  }
                  disabled={disabled}
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    applyChanges({
                      fillColor:
                        value,
                    })
                  }
                />
              ) : (
                <div className="space-y-3">
                  <div
                    className="h-10 rounded-lg border border-white/10"
                    style={{
                      background:
                        gradientPreview,
                    }}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <ShapeColorControl
                      label="Color 1"
                      value={
                        shape.gradientColor1
                      }
                      disabled={disabled}
                      onStart={
                        onChangeStart
                      }
                      onChange={(
                        value
                      ) =>
                        applyChanges({
                          gradientColor1:
                            value,
                        })
                      }
                      compact
                    />

                    <ShapeColorControl
                      label="Color 2"
                      value={
                        shape.gradientColor2
                      }
                      disabled={disabled}
                      onStart={
                        onChangeStart
                      }
                      onChange={(
                        value
                      ) =>
                        applyChanges({
                          gradientColor2:
                            value,
                        })
                      }
                      compact
                    />
                  </div>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      applyButtonChanges({
                        gradientColor1:
                          shape.gradientColor2,
                        gradientColor2:
                          shape.gradientColor1,
                      })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reverse Gradient
                  </button>

                  {shape.fillMode ===
                    "linear-gradient" && (
                    <>
                      <ShapeSlider
                        label="Gradient Angle"
                        value={
                          shape.gradientAngle
                        }
                        min={0}
                        max={359}
                        step={1}
                        suffix="°"
                        disabled={disabled}
                        onStart={
                          onChangeStart
                        }
                        onChange={(
                          value
                        ) =>
                          applyChanges({
                            gradientAngle:
                              value,
                          })
                        }
                      />

                      <div className="grid grid-cols-4 gap-1">
                        {[
                          0,
                          45,
                          90,
                          135,
                          180,
                          225,
                          270,
                          315,
                        ].map(
                          (angle) => (
                            <button
                              key={angle}
                              type="button"
                              disabled={disabled}
                              onClick={() =>
                                applyButtonChanges({
                                  gradientAngle:
                                    angle,
                                })
                              }
                              className={
                                Math.round(
                                  shape.gradientAngle
                                ) ===
                                angle
                                  ? "rounded border border-indigo-500/50 bg-indigo-500/20 px-1 py-1.5 text-[8px] text-indigo-200"
                                  : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[8px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                              }
                            >
                              {angle}°
                            </button>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              <ShapeSlider
                label="Fill Opacity"
                value={
                  shape.fillOpacity
                }
                min={0}
                max={100}
                step={1}
                suffix="%"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    fillOpacity:
                      value,
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                STROKE
              </div>

              <div className="mt-1 text-[9px] text-gray-600">
                Shape outline
              </div>
            </div>

            <ToggleButton
              enabled={
                shape.strokeEnabled
              }
              disabled={disabled}
              onClick={() =>
                applyButtonChanges({
                  strokeEnabled:
                    !shape.strokeEnabled,
                })
              }
            />
          </div>

          {shape.strokeEnabled && (
            <div className="mt-3 space-y-3">
              <ShapeColorControl
                label="Stroke Color"
                value={
                  shape.strokeColor
                }
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    strokeColor:
                      value,
                  })
                }
              />

              <ShapeSlider
                label="Stroke Width"
                value={
                  shape.strokeWidth
                }
                min={1}
                max={40}
                step={1}
                suffix="px"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    strokeWidth:
                      value,
                  })
                }
              />

              <ShapeSlider
                label="Stroke Opacity"
                value={
                  shape.strokeOpacity
                }
                min={0}
                max={100}
                step={1}
                suffix="%"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    strokeOpacity:
                      value,
                  })
                }
              />

              <div>
                <div className="mb-2 text-[9px] text-gray-500">
                  Stroke Style
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "solid",
                      "dashed",
                      "dotted",
                    ] as const
                  ).map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          applyButtonChanges({
                            strokeStyle:
                              style,
                          })
                        }
                        className={
                          shape.strokeStyle ===
                          style
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[9px] capitalize text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] capitalize text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        }
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {shape.shapeType ===
          "rounded-rectangle" && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <ShapeSlider
              label="Corner Radius"
              value={
                shape.cornerRadius
              }
              min={0}
              max={Math.max(
                1,
                Math.round(
                  Math.min(
                    shape.width,
                    shape.height
                  ) /
                    2
                )
              )}
              step={1}
              suffix="px"
              disabled={disabled}
              onStart={
                onChangeStart
              }
              onChange={(
                value
              ) =>
                applyChanges({
                  cornerRadius:
                    value,
                })
              }
            />
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                SHADOW
              </div>

              <div className="mt-1 text-[9px] text-gray-600">
                Non-destructive drop shadow
              </div>
            </div>

            <ToggleButton
              enabled={
                shape.shadowEnabled
              }
              disabled={disabled}
              onClick={() =>
                applyButtonChanges({
                  shadowEnabled:
                    !shape.shadowEnabled,
                })
              }
            />
          </div>

          {shape.shadowEnabled && (
            <div className="mt-4 space-y-3">
              <ShapeColorControl
                label="Shadow Color"
                value={
                  shape.shadowColor
                }
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    shadowColor:
                      value,
                  })
                }
              />

              <ShapeSlider
                label="Shadow Opacity"
                value={
                  shape.shadowOpacity
                }
                min={0}
                max={100}
                step={1}
                suffix="%"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    shadowOpacity:
                      value,
                  })
                }
              />

              <ShapeSlider
                label="Shadow Blur"
                value={
                  shape.shadowBlur
                }
                min={0}
                max={100}
                step={1}
                suffix="px"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    shadowBlur:
                      value,
                  })
                }
              />

              <ShapeSlider
                label="X Offset"
                value={
                  shape.shadowX
                }
                min={-80}
                max={80}
                step={1}
                suffix="px"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    shadowX:
                      value,
                  })
                }
              />

              <ShapeSlider
                label="Y Offset"
                value={
                  shape.shadowY
                }
                min={-80}
                max={80}
                step={1}
                suffix="px"
                disabled={disabled}
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  applyChanges({
                    shadowY:
                      value,
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] leading-5 text-gray-500">
          Use Move to position, resize and rotate the layer. Shape geometry and styling remain editable here.
        </div>
      </div>
    </section>
  );
}

function ToggleButton({
  enabled,
  disabled,
  onClick,
}: {
  enabled: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        enabled
          ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
          : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      {enabled
        ? "On"
        : "Off"}
    </button>
  );
}

function ShapeColorControl({
  label,
  value,
  disabled,
  onStart,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onStart: () => void;
  onChange: (
    value: string
  ) => void;
  compact?: boolean;
}) {
  return (
    <label
      className={
        compact
          ? "rounded-lg border border-white/10 bg-white/[0.03] p-2"
          : "block"
      }
    >
      <div className="mb-1.5 text-[9px] text-gray-500">
        {label}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onPointerDown={
            onStart
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        />

        <span className="min-w-0 truncate text-[9px] uppercase text-gray-300">
          {value}
        </span>
      </div>
    </label>
  );
}

function ShapeSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  disabled,
  onStart,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
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
        <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
          {label}
        </span>

        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
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
        step={step}
        value={value}
        disabled={disabled}
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
        className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

function ShapeNumberInput({
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
    <label className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[9px] text-gray-500">
        {label}
      </div>

      <div className="mt-1 flex items-center gap-1">
        <input
          type="number"
          min={20}
          max={3000}
          step={10}
          value={
            Math.round(
              value
            )
          }
          disabled={disabled}
          onFocus={
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
          className="min-w-0 flex-1 bg-transparent text-xs tabular-nums text-gray-200 outline-none disabled:cursor-not-allowed disabled:opacity-40"
        />

        <span className="text-[9px] text-gray-500">
          px
        </span>
      </div>
    </label>
  );
}
