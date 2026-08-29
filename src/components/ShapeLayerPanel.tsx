"use client";

import type {
  ImageLayer,
  ShapeLayerData,
  ShapeType,
} from "@/lib/layerTypes";

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

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-sm font-semibold">
            Shape
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Editable vector-style shape
          </p>
        </div>

        {isShapeLayer && (
          <span className="rounded bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300">
            SHAPE
          </span>
        )}

      </div>

      {!isShapeLayer ||
      !shape ||
      !layer ? (
        <div className="mt-4">

          <p className="text-[10px] leading-5 text-gray-500">
            Add a shape layer, then edit its type, size, fill, stroke and corner radius.
          </p>

          <button
            onClick={onAdd}
            className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            + Add Shape Layer
          </button>

        </div>
      ) : (
        <div className="mt-4 space-y-4">

          <div>

            <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              SHAPE TYPE
            </div>

            <div className="grid grid-cols-3 gap-2">

              {(
                [
                  [
                    "rectangle",
                    "Rectangle",
                  ],

                  [
                    "rounded-rectangle",
                    "Rounded",
                  ],

                  [
                    "ellipse",
                    "Ellipse",
                  ],
                ] as [
                  ShapeType,
                  string
                ][]
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <button
                    key={value}
                    disabled={
                      layer.locked
                    }
                    onPointerDown={
                      onChangeStart
                    }
                    onClick={() =>
                      onChange(
                        layer.id,
                        {
                          shapeType:
                            value,
                        }
                      )
                    }
                    className={
                      shape.shapeType ===
                      value
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[9px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:opacity-40"
                    }
                  >
                    {label}
                  </button>
                )
              )}

            </div>

          </div>

          <div>

            <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              SIZE
            </div>

            <div className="grid grid-cols-2 gap-2">

              <ShapeNumberInput
                label="Width"
                value={
                  shape.width
                }
                disabled={
                  layer.locked
                }
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    layer.id,
                    {
                      width:
                        value,
                    }
                  )
                }
              />

              <ShapeNumberInput
                label="Height"
                value={
                  shape.height
                }
                disabled={
                  layer.locked
                }
                onStart={
                  onChangeStart
                }
                onChange={(
                  value
                ) =>
                  onChange(
                    layer.id,
                    {
                      height:
                        value,
                    }
                  )
                }
              />

            </div>

          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

            <div className="flex items-center justify-between">

              <div>
                <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                  FILL
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Interior color
                </div>
              </div>

              <button
                disabled={
                  layer.locked
                }
                onPointerDown={
                  onChangeStart
                }
                onClick={() =>
                  onChange(
                    layer.id,
                    {
                      fillEnabled:
                        !shape.fillEnabled,
                    }
                  )
                }
                className={
                  shape.fillEnabled
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                {shape.fillEnabled
                  ? "On"
                  : "Off"}
              </button>

            </div>

            {shape.fillEnabled && (
              <div className="mt-3 space-y-3">

                <div>

                  <div className="mb-2 text-[9px] text-gray-500">
                    Fill Type
                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <button
                      disabled={
                        layer.locked
                      }
                      onPointerDown={
                        onChangeStart
                      }
                      onClick={() =>
                        onChange(
                          layer.id,
                          {
                            fillMode:
                              "solid",
                          }
                        )
                      }
                      className={
                        shape.fillMode ===
                        "solid"
                          ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-[10px] text-indigo-200"
                          : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-40"
                      }
                    >
                      Solid
                    </button>

                    <button
                      disabled={
                        layer.locked
                      }
                      onPointerDown={
                        onChangeStart
                      }
                      onClick={() =>
                        onChange(
                          layer.id,
                          {
                            fillMode:
                              "linear-gradient",
                          }
                        )
                      }
                      className={
                        shape.fillMode ===
                        "linear-gradient"
                          ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-[10px] text-indigo-200"
                          : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-40"
                      }
                    >
                      Gradient
                    </button>

                  </div>

                </div>

                {shape.fillMode ===
                "solid" ? (
                  <div className="flex items-center gap-3">

                    <input
                      type="color"
                      value={
                        shape.fillColor
                      }
                      disabled={
                        layer.locked
                      }
                      onPointerDown={
                        onChangeStart
                      }
                      onChange={(
                        event
                      ) =>
                        onChange(
                          layer.id,
                          {
                            fillColor:
                              event.target
                                .value,
                          }
                        )
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
                    />

                    <span className="text-[10px] uppercase text-gray-300">
                      {shape.fillColor}
                    </span>

                  </div>
                ) : (
                  <div className="space-y-3">

                    <div
                      className="h-10 rounded-lg border border-white/10"
                      style={{
                        background:
                          `linear-gradient(${shape.gradientAngle}deg, ${shape.gradientColor1}, ${shape.gradientColor2})`,
                      }}
                    />

                    <div className="grid grid-cols-2 gap-2">

                      <label className="rounded-lg border border-white/10 bg-white/[0.03] p-2">

                        <div className="mb-1.5 text-[9px] text-gray-500">
                          Color 1
                        </div>

                        <div className="flex items-center gap-2">

                          <input
                            type="color"
                            value={
                              shape.gradientColor1
                            }
                            disabled={
                              layer.locked
                            }
                            onPointerDown={
                              onChangeStart
                            }
                            onChange={(
                              event
                            ) =>
                              onChange(
                                layer.id,
                                {
                                  gradientColor1:
                                    event.target
                                      .value,
                                }
                              )
                            }
                            className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
                          />

                          <span className="min-w-0 truncate text-[9px] uppercase text-gray-300">
                            {shape.gradientColor1}
                          </span>

                        </div>

                      </label>

                      <label className="rounded-lg border border-white/10 bg-white/[0.03] p-2">

                        <div className="mb-1.5 text-[9px] text-gray-500">
                          Color 2
                        </div>

                        <div className="flex items-center gap-2">

                          <input
                            type="color"
                            value={
                              shape.gradientColor2
                            }
                            disabled={
                              layer.locked
                            }
                            onPointerDown={
                              onChangeStart
                            }
                            onChange={(
                              event
                            ) =>
                              onChange(
                                layer.id,
                                {
                                  gradientColor2:
                                    event.target
                                      .value,
                                }
                              )
                            }
                            className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
                          />

                          <span className="min-w-0 truncate text-[9px] uppercase text-gray-300">
                            {shape.gradientColor2}
                          </span>

                        </div>

                      </label>

                    </div>

                    <ShapeSlider
                      label="Gradient Angle"
                      value={
                        shape.gradientAngle
                      }
                      min={0}
                      max={359}
                      step={1}
                      suffix="°"
                      disabled={
                        layer.locked
                      }
                      onStart={
                        onChangeStart
                      }
                      onChange={(
                        value
                      ) =>
                        onChange(
                          layer.id,
                          {
                            gradientAngle:
                              value,
                          }
                        )
                      }
                    />

                    <div className="grid grid-cols-4 gap-1">

                      {[
                        0,
                        45,
                        90,
                        135,
                      ].map(
                        (angle) => (
                          <button
                            key={
                              angle
                            }
                            disabled={
                              layer.locked
                            }
                            onPointerDown={
                              onChangeStart
                            }
                            onClick={() =>
                              onChange(
                                layer.id,
                                {
                                  gradientAngle:
                                    angle,
                                }
                              )
                            }
                            className={
                              Math.round(
                                shape.gradientAngle
                              ) ===
                              angle
                                ? "rounded border border-indigo-500/50 bg-indigo-500/20 px-1 py-1.5 text-[9px] text-indigo-200"
                                : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:opacity-40"
                            }
                          >
                            {angle}°
                          </button>
                        )
                      )}

                    </div>

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
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        fillOpacity:
                          value,
                      }
                    )
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

              <button
                disabled={
                  layer.locked
                }
                onPointerDown={
                  onChangeStart
                }
                onClick={() =>
                  onChange(
                    layer.id,
                    {
                      strokeEnabled:
                        !shape.strokeEnabled,
                    }
                  )
                }
                className={
                  shape.strokeEnabled
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                {shape.strokeEnabled
                  ? "On"
                  : "Off"}
              </button>

            </div>

            {shape.strokeEnabled && (
              <div className="mt-3 space-y-3">

                <div className="flex items-center gap-3">

                  <input
                    type="color"
                    value={
                      shape.strokeColor
                    }
                    disabled={
                      layer.locked
                    }
                    onPointerDown={
                      onChangeStart
                    }
                    onChange={(
                      event
                    ) =>
                      onChange(
                        layer.id,
                        {
                          strokeColor:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
                  />

                  <span className="text-[10px] uppercase text-gray-300">
                    {shape.strokeColor}
                  </span>

                </div>

                <ShapeSlider
                  label="Stroke Width"
                  value={
                    shape.strokeWidth
                  }
                  min={1}
                  max={40}
                  step={1}
                  suffix="px"
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        strokeWidth:
                          value,
                      }
                    )
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
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        strokeOpacity:
                          value,
                      }
                    )
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
                          disabled={
                            layer.locked
                          }
                          onPointerDown={
                            onChangeStart
                          }
                          onClick={() =>
                            onChange(
                              layer.id,
                              {
                                strokeStyle:
                                  style,
                              }
                            )
                          }
                          className={
                            shape.strokeStyle ===
                            style
                              ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[9px] capitalize text-indigo-200"
                              : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] capitalize text-gray-400 hover:bg-white/10 disabled:opacity-40"
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
            <ShapeSlider
              label="Corner Radius"
              value={
                shape.cornerRadius
              }
              min={0}
              max={200}
              step={1}
              suffix="px"
              disabled={
                layer.locked
              }
              onStart={
                onChangeStart
              }
              onChange={(
                value
              ) =>
                onChange(
                  layer.id,
                  {
                    cornerRadius:
                      value,
                  }
                )
              }
            />
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                  SHADOW
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Drop shadow
                </div>

              </div>

              <button
                disabled={
                  layer.locked
                }
                onPointerDown={
                  onChangeStart
                }
                onClick={() =>
                  onChange(
                    layer.id,
                    {
                      shadowEnabled:
                        !shape.shadowEnabled,
                    }
                  )
                }
                className={
                  shape.shadowEnabled
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10 disabled:opacity-40"
                }
              >
                {shape.shadowEnabled
                  ? "On"
                  : "Off"}
              </button>

            </div>

            {shape.shadowEnabled && (
              <div className="mt-4 space-y-3">

                <div className="flex items-center gap-3">

                  <input
                    type="color"
                    value={
                      shape.shadowColor
                    }
                    disabled={
                      layer.locked
                    }
                    onPointerDown={
                      onChangeStart
                    }
                    onChange={(
                      event
                    ) =>
                      onChange(
                        layer.id,
                        {
                          shadowColor:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
                  />

                  <span className="text-[10px] uppercase text-gray-300">
                    {shape.shadowColor}
                  </span>

                </div>

                <ShapeSlider
                  label="Shadow Opacity"
                  value={
                    shape.shadowOpacity
                  }
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        shadowOpacity:
                          value,
                      }
                    )
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
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        shadowBlur:
                          value,
                      }
                    )
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
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        shadowX:
                          value,
                      }
                    )
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
                  disabled={
                    layer.locked
                  }
                  onStart={
                    onChangeStart
                  }
                  onChange={(
                    value
                  ) =>
                    onChange(
                      layer.id,
                      {
                        shadowY:
                          value,
                      }
                    )
                  }
                />

              </div>
            )}

          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] leading-5 text-gray-500">
            Use Move to drag, resize and rotate the shape. Shape settings remain editable here.
          </div>

        </div>
      )}

    </section>
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
          disabled={
            disabled
          }
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
          className="min-w-0 flex-1 bg-transparent text-xs tabular-nums text-gray-200 outline-none disabled:opacity-40"
        />

        <span className="text-[9px] text-gray-500">
          px
        </span>

      </div>

    </label>
  );
}
