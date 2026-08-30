"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ImageLayer,
  TextAlign,
  TextFontWeight,
  TextLayerData,
  TextTransform,
  TextVerticalAlign,
} from "@/lib/layerTypes";

const FONT_OPTIONS = [
  "Arial",
  "Arial Black",
  "Helvetica",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Segoe UI",
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Palatino Linotype",
  "Courier New",
  "Lucida Console",
  "Impact",
  "Comic Sans MS",
  "Brush Script MT",
  "Inter",
  "Roboto",
  "Open Sans",
  "Noto Sans",
  "Noto Serif",
  "Montserrat",
  "Poppins",
  "Lato",
  "Oswald",
  "Raleway",
  "Merriweather",
  "Playfair Display",
] as const;

const FONT_WEIGHTS: {
  value: TextFontWeight;
  label: string;
}[] = [
  { value: "100", label: "100 Thin" },
  { value: "200", label: "200 Extra Light" },
  { value: "300", label: "300 Light" },
  { value: "400", label: "400 Regular" },
  { value: "500", label: "500 Medium" },
  { value: "600", label: "600 Semi Bold" },
  { value: "700", label: "700 Bold" },
  { value: "800", label: "800 Extra Bold" },
  { value: "900", label: "900 Black" },
];

type TextLayerPanelProps = {
  layer: ImageLayer | null;
  onAdd: () => void;
  onChange: (
    id: string,
    changes: Partial<TextLayerData>
  ) => void;
  onChangeStart: () => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLayerChange?: (
    id: string,
    changes: Partial<ImageLayer>
  ) => void;
  onLayerChangeStart?: () => void;
  autoFocusText?: boolean;
};

export default function TextLayerPanel({
  layer,
  onAdd,
  onChange,
  onChangeStart,
  onDuplicate,
  onDelete,
  onLayerChange,
  onLayerChangeStart,
  autoFocusText = false,
}: TextLayerPanelProps) {
  const [fontSearch, setFontSearch] =
    useState("");

  const isTextLayer =
    layer?.layerKind === "text" &&
    !!layer.text;

  const text =
    isTextLayer && layer
      ? layer.text
      : null;

  const filteredFonts = useMemo(() => {
    const query = fontSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return [...FONT_OPTIONS];
    }

    return FONT_OPTIONS.filter(
      (font) =>
        font
          .toLowerCase()
          .includes(query)
    );
  }, [fontSearch]);

  if (!isTextLayer || !text || !layer) {
    return (
      <section className="border-b border-white/10 p-4">
        <Header />

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] leading-5 text-gray-400">
            Select an existing text layer or add one intentionally. The canvas will not create repeated text layers just because you tap it.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-3 min-h-11 w-full touch-manipulation rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-indigo-500 active:bg-indigo-500"
          >
            + Add Text Layer
          </button>
        </div>
      </section>
    );
  }

  const locked = layer.locked;

  return (
    <section className="border-b border-white/10 p-4">
      <Header />

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="min-h-10 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-2 text-[10px] text-indigo-200 hover:bg-indigo-500/20"
          >
            + New
          </button>

          <button
            type="button"
            disabled={!onDuplicate}
            onClick={() =>
              onDuplicate?.(layer.id)
            }
            className="min-h-10 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-300 hover:bg-white/10 disabled:opacity-30"
          >
            Duplicate
          </button>

          <button
            type="button"
            disabled={!onDelete}
            onClick={() =>
              onDelete?.(layer.id)
            }
            className="min-h-10 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-2 py-2 text-[10px] text-rose-200 hover:bg-rose-500/10 disabled:opacity-30"
          >
            Delete
          </button>
        </div>

        <PanelSection
          title="CONTENT"
          subtitle="Live editable text"
        >
          <textarea
            autoFocus={autoFocusText}
            value={text.text}
            disabled={locked}
            onFocus={onChangeStart}
            onChange={(event) =>
              onChange(layer.id, {
                text: event.target.value,
              })
            }
            rows={4}
            className="min-h-24 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-40"
            placeholder="Type text..."
          />

          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {(
              [
                ["none", "Aa"],
                ["uppercase", "AA"],
                ["lowercase", "aa"],
                ["capitalize", "Title"],
              ] as const
            ).map(([value, label]) => (
              <ToggleButton
                key={value}
                active={
                  text.textTransform ===
                  value
                }
                disabled={locked}
                onStart={onChangeStart}
                onClick={() =>
                  onChange(layer.id, {
                    textTransform:
                      value as TextTransform,
                  })
                }
              >
                {label}
              </ToggleButton>
            ))}
          </div>
        </PanelSection>

        <PanelSection
          title="FONT"
          subtitle="Search system/browser fonts"
        >
          <input
            type="search"
            value={fontSearch}
            onChange={(event) =>
              setFontSearch(
                event.target.value
              )
            }
            placeholder="Search fonts..."
            className="mb-2 min-h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500/60"
          />

          <select
            value={text.fontFamily}
            disabled={locked}
            onFocus={onChangeStart}
            onChange={(event) =>
              onChange(layer.id, {
                fontFamily:
                  event.target.value,
              })
            }
            className="min-h-11 w-full rounded-lg border border-white/10 bg-[#151823] px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500/60 disabled:opacity-40"
          >
            {!FONT_OPTIONS.includes(
              text.fontFamily as (typeof FONT_OPTIONS)[number]
            ) && (
              <option value={text.fontFamily}>
                {text.fontFamily}
              </option>
            )}
            {filteredFonts.map((font) => (
              <option
                key={font}
                value={font}
              >
                {font}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={text.fontFamily}
            disabled={locked}
            onFocus={onChangeStart}
            onChange={(event) =>
              onChange(layer.id, {
                fontFamily:
                  event.target.value,
              })
            }
            placeholder="Or type an installed font name"
            className="mt-2 min-h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500/60 disabled:opacity-40"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label>
              <FieldLabel>Weight</FieldLabel>
              <select
                value={text.fontWeight}
                disabled={locked}
                onFocus={onChangeStart}
                onChange={(event) =>
                  onChange(layer.id, {
                    fontWeight:
                      event.target
                        .value as TextFontWeight,
                  })
                }
                className="min-h-10 w-full rounded-lg border border-white/10 bg-[#151823] px-2 text-[10px] text-gray-200 disabled:opacity-40"
              >
                {FONT_WEIGHTS.map(
                  (weight) => (
                    <option
                      key={weight.value}
                      value={weight.value}
                    >
                      {weight.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <RangeField
              label="Size"
              value={text.fontSize}
              min={6}
              max={600}
              step={1}
              suffix="px"
              disabled={locked}
              onStart={onChangeStart}
              onChange={(value) =>
                onChange(layer.id, {
                  fontSize: value,
                })
              }
              compact
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            <ToggleButton
              active={
                Number(text.fontWeight) >=
                700
              }
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  fontWeight:
                    Number(
                      text.fontWeight
                    ) >= 700
                      ? "400"
                      : "700",
                })
              }
            >
              <b>B</b>
            </ToggleButton>

            <ToggleButton
              active={text.italic}
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  italic: !text.italic,
                })
              }
            >
              <i>I</i>
            </ToggleButton>

            <ToggleButton
              active={text.underline}
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  underline:
                    !text.underline,
                })
              }
            >
              <u>U</u>
            </ToggleButton>

            <ToggleButton
              active={text.strikethrough}
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  strikethrough:
                    !text.strikethrough,
                })
              }
            >
              <s>S</s>
            </ToggleButton>
          </div>
        </PanelSection>

        <PanelSection
          title="ALIGNMENT"
          subtitle="Paragraph and box alignment"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                ["left", "Left"],
                ["center", "Center"],
                ["right", "Right"],
                ["justify", "Justify"],
              ] as const
            ).map(([value, label]) => (
              <ToggleButton
                key={value}
                active={text.align === value}
                disabled={locked}
                onStart={onChangeStart}
                onClick={() =>
                  onChange(layer.id, {
                    align:
                      value as TextAlign,
                  })
                }
              >
                {label}
              </ToggleButton>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(
              [
                ["top", "Top"],
                ["middle", "Middle"],
                ["bottom", "Bottom"],
              ] as const
            ).map(([value, label]) => (
              <ToggleButton
                key={value}
                active={
                  text.verticalAlign ===
                  value
                }
                disabled={
                  locked ||
                  !text.fixedHeightEnabled
                }
                onStart={onChangeStart}
                onClick={() =>
                  onChange(layer.id, {
                    verticalAlign:
                      value as TextVerticalAlign,
                  })
                }
              >
                {label}
              </ToggleButton>
            ))}
          </div>
        </PanelSection>

        <PanelSection
          title="COLOR & OPACITY"
          subtitle="Text fill"
        >
          <ColorField
            label="Text color"
            value={text.color}
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                color: value,
              })
            }
          />

          <RangeField
            label="Text opacity"
            value={text.textOpacity}
            min={0}
            max={100}
            step={1}
            suffix="%"
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                textOpacity: value,
              })
            }
          />
        </PanelSection>

        <PanelSection
          title="SPACING"
          subtitle="Fine typography control"
        >
          <RangeField
            label="Line height"
            value={text.lineHeight}
            min={0.5}
            max={4}
            step={0.05}
            suffix="×"
            digits={2}
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                lineHeight: value,
              })
            }
          />
          <RangeField
            label="Letter spacing"
            value={text.letterSpacing}
            min={-20}
            max={80}
            step={0.5}
            suffix="px"
            digits={1}
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                letterSpacing: value,
              })
            }
          />
          <RangeField
            label="Word spacing"
            value={text.wordSpacing}
            min={-20}
            max={120}
            step={1}
            suffix="px"
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                wordSpacing: value,
              })
            }
          />
          <RangeField
            label="Paragraph spacing"
            value={text.paragraphSpacing}
            min={0}
            max={200}
            step={1}
            suffix="px"
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                paragraphSpacing: value,
              })
            }
          />
        </PanelSection>

        <PanelSection
          title="TEXT STROKE"
          subtitle="Outline"
        >
          <ColorField
            label="Stroke color"
            value={text.strokeColor}
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                strokeColor: value,
              })
            }
          />
          <RangeField
            label="Stroke width"
            value={text.strokeWidth}
            min={0}
            max={20}
            step={0.5}
            suffix="px"
            digits={1}
            disabled={locked}
            onStart={onChangeStart}
            onChange={(value) =>
              onChange(layer.id, {
                strokeWidth: value,
              })
            }
          />
        </PanelSection>

        <PanelSection
          title="SHADOW"
          subtitle="Drop shadow"
          action={
            <ToggleButton
              active={text.shadowEnabled}
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  shadowEnabled:
                    !text.shadowEnabled,
                })
              }
            >
              {text.shadowEnabled
                ? "On"
                : "Off"}
            </ToggleButton>
          }
        >
          {text.shadowEnabled && (
            <div className="space-y-3">
              <ColorField
                label="Shadow color"
                value={text.shadowColor}
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    shadowColor: value,
                  })
                }
              />
              <RangeField
                label="Opacity"
                value={text.shadowOpacity}
                min={0}
                max={100}
                step={1}
                suffix="%"
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    shadowOpacity: value,
                  })
                }
              />
              <RangeField
                label="Blur"
                value={text.shadowBlur}
                min={0}
                max={100}
                step={1}
                suffix="px"
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    shadowBlur: value,
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <RangeField
                  label="X"
                  value={text.shadowX}
                  min={-100}
                  max={100}
                  step={1}
                  suffix="px"
                  disabled={locked}
                  onStart={onChangeStart}
                  onChange={(value) =>
                    onChange(layer.id, {
                      shadowX: value,
                    })
                  }
                  compact
                />
                <RangeField
                  label="Y"
                  value={text.shadowY}
                  min={-100}
                  max={100}
                  step={1}
                  suffix="px"
                  disabled={locked}
                  onStart={onChangeStart}
                  onChange={(value) =>
                    onChange(layer.id, {
                      shadowY: value,
                    })
                  }
                  compact
                />
              </div>
            </div>
          )}
        </PanelSection>

        <PanelSection
          title="TEXT BOX"
          subtitle="Wrap, fixed height and background"
        >
          <div className="grid grid-cols-2 gap-2">
            <ToggleButton
              active={text.wrapEnabled}
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  wrapEnabled:
                    !text.wrapEnabled,
                })
              }
            >
              Wrap text
            </ToggleButton>

            <ToggleButton
              active={
                text.fixedHeightEnabled
              }
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  fixedHeightEnabled:
                    !text.fixedHeightEnabled,
                })
              }
            >
              Fixed height
            </ToggleButton>
          </div>

          {text.wrapEnabled && (
            <RangeField
              label="Box width"
              value={text.boxWidth}
              min={80}
              max={2000}
              step={10}
              suffix="px"
              disabled={locked}
              onStart={onChangeStart}
              onChange={(value) =>
                onChange(layer.id, {
                  boxWidth: value,
                })
              }
            />
          )}

          {text.fixedHeightEnabled && (
            <RangeField
              label="Box height"
              value={text.boxHeight}
              min={80}
              max={2000}
              step={10}
              suffix="px"
              disabled={locked}
              onStart={onChangeStart}
              onChange={(value) =>
                onChange(layer.id, {
                  boxHeight: value,
                })
              }
            />
          )}

          <div className="mt-3 border-t border-white/10 pt-3">
            <ToggleButton
              active={
                text.backgroundEnabled
              }
              disabled={locked}
              onStart={onChangeStart}
              onClick={() =>
                onChange(layer.id, {
                  backgroundEnabled:
                    !text.backgroundEnabled,
                })
              }
            >
              Background
            </ToggleButton>
          </div>

          {text.backgroundEnabled && (
            <div className="mt-3 space-y-3">
              <ColorField
                label="Background color"
                value={text.backgroundColor}
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    backgroundColor: value,
                  })
                }
              />
              <RangeField
                label="Background opacity"
                value={text.backgroundOpacity}
                min={0}
                max={100}
                step={1}
                suffix="%"
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    backgroundOpacity: value,
                  })
                }
              />
              <RangeField
                label="Horizontal padding"
                value={text.backgroundPaddingX}
                min={0}
                max={150}
                step={1}
                suffix="px"
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    backgroundPaddingX:
                      value,
                  })
                }
              />
              <RangeField
                label="Vertical padding"
                value={text.backgroundPaddingY}
                min={0}
                max={150}
                step={1}
                suffix="px"
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    backgroundPaddingY:
                      value,
                  })
                }
              />
              <RangeField
                label="Corner radius"
                value={text.backgroundRadius}
                min={0}
                max={150}
                step={1}
                suffix="px"
                disabled={locked}
                onStart={onChangeStart}
                onChange={(value) =>
                  onChange(layer.id, {
                    backgroundRadius:
                      value,
                  })
                }
              />
            </div>
          )}
        </PanelSection>

        {onLayerChange && (
          <PanelSection
            title="TRANSFORM"
            subtitle="Position, scale and rotation"
          >
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="X"
                value={layer.x}
                suffix="px"
                disabled={locked}
                onStart={
                  onLayerChangeStart ??
                  onChangeStart
                }
                onChange={(value) =>
                  onLayerChange(layer.id, {
                    x: value,
                  })
                }
              />
              <NumberField
                label="Y"
                value={layer.y}
                suffix="px"
                disabled={locked}
                onStart={
                  onLayerChangeStart ??
                  onChangeStart
                }
                onChange={(value) =>
                  onLayerChange(layer.id, {
                    y: value,
                  })
                }
              />
            </div>

            <RangeField
              label="Scale"
              value={layer.scale * 100}
              min={5}
              max={500}
              step={1}
              suffix="%"
              disabled={locked}
              onStart={
                onLayerChangeStart ??
                onChangeStart
              }
              onChange={(value) =>
                onLayerChange(layer.id, {
                  scale: value / 100,
                })
              }
            />

            <RangeField
              label="Rotation"
              value={layer.rotation}
              min={-180}
              max={180}
              step={1}
              suffix="°"
              disabled={locked}
              onStart={
                onLayerChangeStart ??
                onChangeStart
              }
              onChange={(value) =>
                onLayerChange(layer.id, {
                  rotation: value,
                })
              }
            />

            <RangeField
              label="Layer opacity"
              value={layer.opacity}
              min={0}
              max={100}
              step={1}
              suffix="%"
              disabled={locked}
              onStart={
                onLayerChangeStart ??
                onChangeStart
              }
              onChange={(value) =>
                onLayerChange(layer.id, {
                  opacity: value,
                })
              }
            />

            <div className="grid grid-cols-2 gap-2">
              <ToggleButton
                active={layer.flipHorizontal}
                disabled={locked}
                onStart={
                  onLayerChangeStart ??
                  onChangeStart
                }
                onClick={() =>
                  onLayerChange(layer.id, {
                    flipHorizontal:
                      !layer.flipHorizontal,
                  })
                }
              >
                Flip H
              </ToggleButton>
              <ToggleButton
                active={layer.flipVertical}
                disabled={locked}
                onStart={
                  onLayerChangeStart ??
                  onChangeStart
                }
                onClick={() =>
                  onLayerChange(layer.id, {
                    flipVertical:
                      !layer.flipVertical,
                  })
                }
              >
                Flip V
              </ToggleButton>
            </div>
          </PanelSection>
        )}

        <div className="rounded-lg border border-indigo-500/15 bg-indigo-500/[0.05] px-3 py-2 text-[10px] leading-5 text-indigo-100/70">
          Text stays editable. Use Move to drag/resize it on the canvas. On mobile, tapping Text opens this editor instead of placing repeated “Your Text” layers.
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Text Pro
        </h3>
        <p className="mt-1 text-[10px] text-gray-500">
          Professional editable typography
        </p>
      </div>
      <span className="rounded bg-indigo-500/10 px-2 py-1 text-[10px] font-medium text-indigo-300">
        TEXT
      </span>
    </div>
  );
}

function PanelSection({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-400">
            {title}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-[9px] text-gray-600">
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1 text-[9px] font-medium text-gray-500">
      {children}
    </div>
  );
}

function ToggleButton({
  active,
  disabled,
  onStart,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onStart: () => void;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={onStart}
      onClick={onClick}
      className={
        active
          ? "min-h-10 touch-manipulation rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] font-medium text-indigo-100"
          : "min-h-10 touch-manipulation rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
      }
    >
      {children}
    </button>
  );
}

function ColorField({
  label,
  value,
  disabled,
  onStart,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onStart: () => void;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] =
    useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit(next: string) {
    const normalized = next.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      onChange(normalized);
      setDraft(normalized);
    } else {
      setDraft(value);
    }
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onPointerDown={onStart}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 disabled:opacity-40"
        />
        <input
          type="text"
          value={draft}
          disabled={disabled}
          onFocus={onStart}
          onChange={(event) =>
            setDraft(event.target.value)
          }
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit(draft);
              event.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-xs uppercase text-gray-300 outline-none disabled:opacity-40"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  digits = 0,
  disabled,
  onStart,
  onChange,
  compact = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  digits?: number;
  disabled: boolean;
  onStart: () => void;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  const safeValue = Number.isFinite(value)
    ? value
    : min;

  return (
    <div className={compact ? "" : "mt-3"}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[9px] text-gray-500">
          {label}
        </span>
        <div className="flex items-center rounded bg-white/5 px-1.5 py-0.5">
          <input
            type="number"
            value={
              digits
                ? safeValue.toFixed(digits)
                : Math.round(safeValue)
            }
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onFocus={onStart}
            onChange={(event) => {
              const next = Number(
                event.target.value
              );
              if (Number.isFinite(next)) {
                onChange(
                  Math.max(
                    min,
                    Math.min(max, next)
                  )
                );
              }
            }}
            className="w-14 bg-transparent text-right text-[9px] tabular-nums text-gray-300 outline-none disabled:opacity-40"
          />
          <span className="ml-0.5 text-[8px] text-gray-500">
            {suffix}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        disabled={disabled}
        onPointerDown={onStart}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  suffix,
  disabled,
  onStart,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  disabled: boolean;
  onStart: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex min-h-10 items-center rounded-lg border border-white/10 bg-white/[0.03] px-2">
        <input
          type="number"
          value={Math.round(value)}
          disabled={disabled}
          onFocus={onStart}
          onChange={(event) => {
            const next = Number(
              event.target.value
            );
            if (Number.isFinite(next)) {
              onChange(next);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-gray-200 outline-none disabled:opacity-40"
        />
        <span className="text-[9px] text-gray-500">
          {suffix}
        </span>
      </div>
    </label>
  );
}
