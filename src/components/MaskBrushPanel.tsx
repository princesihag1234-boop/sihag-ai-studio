"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

export type MaskBrushMode =
  | "hide"
  | "reveal";

type MaskBrushPanelProps = {
  layer: ImageLayer | null;

  hasSelection: boolean;

  brushSize: number;

  brushHardness: number;

  brushOpacity: number;

  overlayEnabled: boolean;

  mode: MaskBrushMode;

  onBrushSizeChange: (
    value: number
  ) => void;

  onBrushHardnessChange: (
    value: number
  ) => void;

  onBrushOpacityChange: (
    value: number
  ) => void;

  onOverlayToggle: () => void;

  onModeChange: (
    mode: MaskBrushMode
  ) => void;

  onAddMask: () => void;

  onCreateMaskFromSelection: () => void;

  onToggleMask: () => void;

  onInvertMask: () => void;

  onRemoveMask: () => void;

  onRevealAllMask: () => void;

  onHideAllMask: () => void;

  onMaskDensityChange: (
    value: number
  ) => void;

  onMaskDensityStart: () => void;

  onMaskFeatherChange: (
    value: number
  ) => void;

  onMaskFeatherStart: () => void;
};

export default function MaskBrushPanel({
  layer,
  hasSelection,
  brushSize,
  brushHardness,
  brushOpacity,
  overlayEnabled,
  mode,
  onBrushSizeChange,
  onBrushHardnessChange,
  onBrushOpacityChange,
  onOverlayToggle,
  onModeChange,
  onAddMask,
  onCreateMaskFromSelection,
  onToggleMask,
  onInvertMask,
  onRemoveMask,
  onRevealAllMask,
  onHideAllMask,
  onMaskDensityChange,
  onMaskDensityStart,
  onMaskFeatherChange,
  onMaskFeatherStart,
}: MaskBrushPanelProps) {
  const hasMask =
    !!layer?.maskSrc;

  const maskEnabled =
    layer?.maskEnabled ?? true;

  const effectivelyLocked =
    layer?.locked ?? false;

  const density =
    layer?.maskDensity ?? 100;

  const feather =
    layer?.maskFeather ?? 0;

  const inverted =
    layer?.maskInverted ?? false;

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Layer Mask
          </h3>

          <p className="mt-1 text-[10px] leading-4 text-gray-500">
            Non-destructive visibility control
          </p>
        </div>

        <div className="rounded-md border border-indigo-400/20 bg-indigo-500/10 px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-indigo-200">
          MASK BRUSH
        </div>
      </div>

      {!layer ? (
        <InfoBox>
          Select a layer to create or edit a layer mask.
        </InfoBox>
      ) : effectivelyLocked ? (
        <InfoBox>
          This layer or its group is locked. Unlock it before editing the mask.
        </InfoBox>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <div className="flex items-center gap-3">
              <div
                className={
                  hasMask
                    ? "h-14 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-indigo-300/80 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                    : "flex h-14 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-lg text-gray-600"
                }
              >
                {hasMask ? (
                  <img
                    src={layer.maskSrc ?? ""}
                    alt="Layer mask thumbnail"
                    draggable={false}
                    className={
                      maskEnabled
                        ? "h-full w-full object-cover"
                        : "h-full w-full object-cover opacity-35"
                    }
                  />
                ) : (
                  "◐"
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-200">
                    {hasMask
                      ? "Mask attached"
                      : "No mask attached"}
                  </span>

                  {hasMask && (
                    <StatusPill
                      active={maskEnabled}
                      text={
                        maskEnabled
                          ? "Enabled"
                          : "Disabled"
                      }
                    />
                  )}

                  {hasMask && inverted && (
                    <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[9px] text-amber-200">
                      Inverted
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[9px] leading-4 text-gray-500">
                  White reveals • Black hides • Gray gives partial visibility
                </p>
              </div>
            </div>

            {!hasMask ? (
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={onAddMask}
                  className="rounded-lg border border-indigo-400/25 bg-indigo-500/12 px-3 py-2 text-[10px] font-medium text-indigo-100 transition hover:bg-indigo-500/20"
                >
                  Add Reveal-All Mask
                </button>

                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={onCreateMaskFromSelection}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Create Mask from Selection
                </button>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={onToggleMask}
                    className="rounded-lg border border-white/[0.08] bg-white/5 px-2 py-1.5 text-[10px] text-gray-200 hover:bg-white/10"
                  >
                    {maskEnabled
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    type="button"
                    onClick={onInvertMask}
                    className="rounded-lg border border-white/[0.08] bg-white/5 px-2 py-1.5 text-[10px] text-gray-200 hover:bg-white/10"
                  >
                    Invert
                  </button>

                  <button
                    type="button"
                    onClick={onRemoveMask}
                    className="rounded-lg border border-red-400/15 bg-red-500/10 px-2 py-1.5 text-[10px] text-red-200 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={onRevealAllMask}
                    className="rounded-lg border border-white/[0.08] bg-white/5 px-2 py-1.5 text-[10px] text-gray-200 hover:bg-white/10"
                  >
                    Reveal All
                  </button>

                  <button
                    type="button"
                    onClick={onHideAllMask}
                    className="rounded-lg border border-white/[0.08] bg-white/5 px-2 py-1.5 text-[10px] text-gray-200 hover:bg-white/10"
                  >
                    Hide All
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!hasSelection}
                  onClick={onCreateMaskFromSelection}
                  className="mt-2 w-full rounded-lg border border-cyan-400/15 bg-cyan-400/[0.055] px-3 py-1.5 text-[10px] text-cyan-100 transition hover:bg-cyan-400/[0.10] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Replace Mask from Selection
                </button>
              </>
            )}
          </div>

          {hasMask && (
            <>
              <div className="mt-5">
                <SectionTitle>
                  MASK PROPERTIES
                </SectionTitle>

                <PrecisionSlider
                  title="DENSITY"
                  value={density}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  disabled={!maskEnabled}
                  onStart={onMaskDensityStart}
                  onChange={onMaskDensityChange}
                />

                <PrecisionSlider
                  title="FEATHER"
                  value={feather}
                  min={0}
                  max={100}
                  step={1}
                  suffix=" px"
                  disabled={!maskEnabled}
                  onStart={onMaskFeatherStart}
                  onChange={onMaskFeatherChange}
                />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <SectionTitle>
                    PAINT MODE
                  </SectionTitle>

                  <span className="text-[9px] text-gray-600">
                    X switches mode
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!maskEnabled}
                    onClick={() =>
                      onModeChange(
                        "hide"
                      )
                    }
                    className={
                      mode === "hide"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-200 disabled:opacity-30"
                        : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
                    }
                  >
                    Hide
                    <div className="mt-1 text-[9px] text-gray-500">
                      Paint black
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!maskEnabled}
                    onClick={() =>
                      onModeChange(
                        "reveal"
                      )
                    }
                    className={
                      mode === "reveal"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-200 disabled:opacity-30"
                        : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
                    }
                  >
                    Restore
                    <div className="mt-1 text-[9px] text-gray-500">
                      Paint white
                    </div>
                  </button>
                </div>
              </div>

              <BrushSlider
                title="BRUSH SIZE"
                value={brushSize}
                min={5}
                max={300}
                step={1}
                suffix=" px"
                disabled={!maskEnabled}
                onChange={onBrushSizeChange}
              />

              <BrushSlider
                title="HARDNESS"
                value={brushHardness}
                min={0}
                max={100}
                step={1}
                suffix="%"
                disabled={!maskEnabled}
                onChange={onBrushHardnessChange}
              />

              <BrushSlider
                title="OPACITY"
                value={brushOpacity}
                min={1}
                max={100}
                step={1}
                suffix="%"
                disabled={!maskEnabled}
                onChange={onBrushOpacityChange}
              />

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <SectionTitle>
                    MASK VIEW
                  </SectionTitle>

                  <span className="text-[9px] text-gray-600">
                    \ toggles overlay
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!maskEnabled}
                  onClick={onOverlayToggle}
                  className={
                    overlayEnabled
                      ? "w-full rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-200 disabled:opacity-30"
                      : "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
                  }
                >
                  {overlayEnabled
                    ? "Red Overlay: ON"
                    : "Red Overlay: OFF"}
                </button>
              </div>

              {!maskEnabled && (
                <InfoBox>
                  The mask is disabled. Enable it above before painting or adjusting Density and Feather.
                </InfoBox>
              )}

              <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[10px] leading-5 text-gray-400">
                Paint directly on the selected layer mask. [ and ] change brush size. X switches Hide / Restore. Shift-click draws a straight mask segment from the previous stroke. Esc cancels the active stroke. A selection limits mask painting to the selected area.
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-[10px] font-semibold tracking-[0.16em] text-gray-500">
      {children}
    </div>
  );
}

function StatusPill({
  active,
  text,
}: {
  active: boolean;
  text: string;
}) {
  return (
    <span
      className={
        active
          ? "rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-200"
          : "rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-gray-400"
      }
    >
      {text}
    </span>
  );
}

function PrecisionSlider({
  title,
  value,
  min,
  max,
  step,
  suffix,
  disabled = false,
  onStart,
  onChange,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  disabled?: boolean;
  onStart: () => void;
  onChange: (
    value: number
  ) => void;
}) {
  const clampedValue =
    Math.max(
      min,
      Math.min(
        max,
        value
      )
    );

  return (
    <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[9px] font-semibold tracking-[0.12em] text-gray-500">
          {title}
        </span>

        <div className="flex items-center rounded-md border border-white/[0.08] bg-black/25 px-1.5">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={Math.round(clampedValue)}
            disabled={disabled}
            onFocus={onStart}
            onChange={(event) =>
              onChange(
                Math.max(
                  min,
                  Math.min(
                    max,
                    Number(
                      event.target.value
                    )
                  )
                )
              )
            }
            className="w-12 bg-transparent py-1 text-right text-[10px] tabular-nums text-gray-200 outline-none disabled:opacity-30"
          />

          <span className="text-[9px] text-gray-500">
            {suffix}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampedValue}
        disabled={disabled}
        onPointerDown={onStart}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}

function BrushSlider({
  title,
  value,
  min,
  max,
  step,
  suffix,
  disabled = false,
  onChange,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  disabled?: boolean;
  onChange: (
    value: number
  ) => void;
}) {
  const clampedValue =
    Math.max(
      min,
      Math.min(
        max,
        value
      )
    );

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-gray-500">
          {title}
        </span>

        <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.035] px-1.5">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={Math.round(clampedValue)}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                Math.max(
                  min,
                  Math.min(
                    max,
                    Number(
                      event.target.value
                    )
                  )
                )
              )
            }
            className="w-12 bg-transparent py-1 text-right text-[10px] tabular-nums text-gray-200 outline-none disabled:opacity-30"
          />

          <span className="text-[9px] text-gray-500">
            {suffix}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampedValue}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </div>
  );
}

function InfoBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-200">
      {children}
    </div>
  );
}
