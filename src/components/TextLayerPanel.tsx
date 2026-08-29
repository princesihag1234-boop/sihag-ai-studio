"use client";

import type {
  ImageLayer,
  TextAlign,
  TextLayerData,
} from "@/lib/layerTypes";

type TextLayerPanelProps = {
  layer:
    ImageLayer | null;

  onAdd: () => void;

  onChange: (
    id: string,
    changes:
      Partial<TextLayerData>
  ) => void;

  onChangeStart: () => void;
};

export default function TextLayerPanel({
  layer,
  onAdd,
  onChange,
  onChangeStart,
}: TextLayerPanelProps) {
  const isTextLayer =
    layer?.layerKind ===
      "text" &&
    !!layer.text;

  const text =
    isTextLayer
      ? layer.text
      : null;

  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-sm font-semibold">
            Text
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Editable text layer
          </p>
        </div>

        {isTextLayer && (
          <span className="rounded bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300">
            TEXT
          </span>
        )}

      </div>

      {!isTextLayer ||
      !text ||
      !layer ? (
        <div className="mt-4">

          <p className="text-[10px] leading-5 text-gray-500">
            Add a text layer, then use this panel to edit its words, font, size, color and alignment.
          </p>

          <button
            onClick={onAdd}
            className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            + Add Text Layer
          </button>

        </div>
      ) : (
        <div className="mt-4 space-y-4">

          <label className="block">

            <div className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              TEXT
            </div>

            <textarea
              value={
                text.text
              }
              disabled={
                layer.locked
              }
              onFocus={
                onChangeStart
              }
              onChange={(
                event
              ) =>
                onChange(
                  layer.id,
                  {
                    text:
                      event.target
                        .value,
                  }
                )
              }
              rows={4}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-40"
              placeholder="Type text..."
            />

          </label>

          <label className="block">

            <div className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              FONT
            </div>

            <select
              value={
                text.fontFamily
              }
              disabled={
                layer.locked
              }
              onFocus={
                onChangeStart
              }
              onChange={(
                event
              ) =>
                onChange(
                  layer.id,
                  {
                    fontFamily:
                      event.target
                        .value,
                  }
                )
              }
              className="w-full rounded-lg border border-white/10 bg-[#151823] px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500/60 disabled:opacity-40"
            >
              <option value="Arial">
                Arial
              </option>
              <option value="Georgia">
                Georgia
              </option>
              <option value="Times New Roman">
                Times New Roman
              </option>
              <option value="Verdana">
                Verdana
              </option>
              <option value="Trebuchet MS">
                Trebuchet MS
              </option>
              <option value="Courier New">
                Courier New
              </option>
            </select>

          </label>

          <div>

            <div className="mb-1.5 flex items-center justify-between">

              <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                SIZE
              </span>

              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                {Math.round(
                  text.fontSize
                )}
                px
              </span>

            </div>

            <input
              type="range"
              min={8}
              max={300}
              step={1}
              value={
                text.fontSize
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
                    fontSize:
                      Number(
                        event.target
                          .value
                      ),
                  }
                )
              }
              className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            />

          </div>

          <div>

            <div className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              COLOR
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">

              <input
                type="color"
                value={
                  text.color
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
                      color:
                        event.target
                          .value,
                    }
                  )
                }
                className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
              />

              <span className="text-xs uppercase text-gray-300">
                {text.color}
              </span>

            </div>

          </div>

          <div>

            <div className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-gray-500">
              STYLE
            </div>

            <div className="grid grid-cols-4 gap-2">

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
                      fontWeight:
                        text.fontWeight ===
                        "700"
                          ? "400"
                          : "700",
                    }
                  )
                }
                className={
                  text.fontWeight ===
                  "700"
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-xs font-bold text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs font-bold text-gray-400 hover:bg-white/10"
                }
              >
                B
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
                      italic:
                        !text.italic,
                    }
                  )
                }
                className={
                  text.italic
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-xs italic text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs italic text-gray-400 hover:bg-white/10"
                }
              >
                I
              </button>

              {(
                [
                  "left",
                  "center",
                ] as TextAlign[]
              ).map(
                (align) => (
                  <button
                    key={
                      align
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
                          align,
                        }
                      )
                    }
                    className={
                      text.align ===
                      align
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                    }
                  >
                    {align ===
                    "left"
                      ? "L"
                      : "C"}
                  </button>
                )
              )}

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
                    align:
                      "right",
                  }
                )
              }
              className={
                text.align ===
                "right"
                  ? "mt-2 w-full rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                  : "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
              }
            >
              Right Align
            </button>

          </div>

          <div>

            <div className="mb-1.5 flex items-center justify-between">

              <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                LINE HEIGHT
              </span>

              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                {text.lineHeight.toFixed(
                  2
                )}
              </span>

            </div>

            <input
              type="range"
              min={0.8}
              max={2}
              step={0.05}
              value={
                text.lineHeight
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
                    lineHeight:
                      Number(
                        event.target
                          .value
                      ),
                  }
                )
              }
              className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            />

          </div>

          <div>

            <div className="mb-1.5 flex items-center justify-between">

              <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                LETTER SPACING
              </span>

              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                {text.letterSpacing.toFixed(
                  1
                )}
                px
              </span>

            </div>

            <input
              type="range"
              min={-10}
              max={40}
              step={0.5}
              value={
                text.letterSpacing
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
                    letterSpacing:
                      Number(
                        event.target
                          .value
                      ),
                  }
                )
              }
              className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            />

          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                TEXT STROKE
              </span>

              <span className="text-[9px] text-gray-600">
                Outline
              </span>

            </div>

            <div className="flex items-center gap-3">

              <input
                type="color"
                value={
                  text.strokeColor
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

              <div className="min-w-0 flex-1">

                <div className="mb-1 flex items-center justify-between">

                  <span className="text-[9px] text-gray-500">
                    Width
                  </span>

                  <span className="text-[9px] tabular-nums text-gray-300">
                    {text.strokeWidth.toFixed(
                      1
                    )}
                    px
                  </span>

                </div>

                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={
                    text.strokeWidth
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
                        strokeWidth:
                          Number(
                            event.target
                              .value
                          ),
                      }
                    )
                  }
                  className="w-full cursor-pointer accent-indigo-500 disabled:opacity-40"
                />

              </div>

            </div>

          </div>

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
                        !text.shadowEnabled,
                    }
                  )
                }
                className={
                  text.shadowEnabled
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                {text.shadowEnabled
                  ? "On"
                  : "Off"}
              </button>

            </div>

            {text.shadowEnabled && (
              <div className="mt-4 space-y-3">

                <div className="flex items-center gap-3">

                  <input
                    type="color"
                    value={
                      text.shadowColor
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

                  <span className="text-[10px] uppercase text-gray-400">
                    {text.shadowColor}
                  </span>

                </div>

                <TextEffectSlider
                  label="Blur"
                  value={
                    text.shadowBlur
                  }
                  min={0}
                  max={60}
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

                <TextEffectSlider
                  label="X Offset"
                  value={
                    text.shadowX
                  }
                  min={-40}
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
                        shadowX:
                          value,
                      }
                    )
                  }
                />

                <TextEffectSlider
                  label="Y Offset"
                  value={
                    text.shadowY
                  }
                  min={-40}
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
                        shadowY:
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
                  TEXT BOX / WRAP
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Paragraph-style text
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
                      wrapEnabled:
                        !text.wrapEnabled,
                    }
                  )
                }
                className={
                  text.wrapEnabled
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                {text.wrapEnabled
                  ? "Wrap On"
                  : "Wrap Off"}
              </button>

            </div>

            {text.wrapEnabled && (
              <div className="mt-4">

                <div className="mb-1.5 flex items-center justify-between">

                  <span className="text-[9px] text-gray-500">
                    Text Box Width
                  </span>

                  <span className="text-[9px] tabular-nums text-gray-300">
                    {Math.round(
                      text.boxWidth
                    )}
                    px
                  </span>

                </div>

                <input
                  type="range"
                  min={120}
                  max={1600}
                  step={10}
                  value={
                    text.boxWidth
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
                        boxWidth:
                          Number(
                            event.target
                              .value
                          ),
                      }
                    )
                  }
                  className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                />

                <div className="mt-2 grid grid-cols-4 gap-1">

                  {[300, 500, 800, 1200].map(
                    (width) => (
                      <button
                        key={
                          width
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
                              boxWidth:
                                width,
                            }
                          )
                        }
                        className={
                          Math.round(
                            text.boxWidth
                          ) === width
                            ? "rounded border border-indigo-500/50 bg-indigo-500/20 px-1 py-1.5 text-[9px] text-indigo-200"
                            : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[9px] text-gray-400 hover:bg-white/10"
                        }
                      >
                        {width}
                      </button>
                    )
                  )}

                </div>

                <div className="mt-2 text-[9px] leading-4 text-gray-600">
                  Words automatically move to the next line when they reach the text-box width.
                </div>

              </div>
            )}

          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-semibold tracking-[0.12em] text-gray-500">
                  BACKGROUND BOX
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Label / title background
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
                      backgroundEnabled:
                        !text.backgroundEnabled,
                    }
                  )
                }
                className={
                  text.backgroundEnabled
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-1.5 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                {text.backgroundEnabled
                  ? "On"
                  : "Off"}
              </button>

            </div>

            {text.backgroundEnabled && (
              <div className="mt-4 space-y-3">

                <div className="flex items-center gap-3">

                  <input
                    type="color"
                    value={
                      text.backgroundColor
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
                          backgroundColor:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
                  />

                  <div className="min-w-0 flex-1">

                    <div className="text-[9px] text-gray-500">
                      Background color
                    </div>

                    <div className="mt-0.5 text-[10px] uppercase text-gray-300">
                      {text.backgroundColor}
                    </div>

                  </div>

                </div>

                <TextEffectSlider
                  label="Opacity"
                  value={
                    text.backgroundOpacity
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
                        backgroundOpacity:
                          value,
                      }
                    )
                  }
                />

                <TextEffectSlider
                  label="Horizontal Padding"
                  value={
                    text.backgroundPaddingX
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
                        backgroundPaddingX:
                          value,
                      }
                    )
                  }
                />

                <TextEffectSlider
                  label="Vertical Padding"
                  value={
                    text.backgroundPaddingY
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
                        backgroundPaddingY:
                          value,
                      }
                    )
                  }
                />

                <TextEffectSlider
                  label="Corner Radius"
                  value={
                    text.backgroundRadius
                  }
                  min={0}
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
                        backgroundRadius:
                          value,
                      }
                    )
                  }
                />

              </div>
            )}

          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] leading-5 text-gray-500">
            Use the Move tool to position, resize and rotate the text layer. Text remains editable here.
          </div>

        </div>
      )}

    </section>
  );
}

function TextEffectSlider({
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

      <div className="mb-1 flex items-center justify-between">

        <span className="text-[9px] text-gray-500">
          {label}
        </span>

        <span className="text-[9px] tabular-nums text-gray-300">
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

