"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

export type MaskBrushMode =
  | "hide"
  | "reveal";

type MaskBrushPanelProps = {
  layer: ImageLayer | null;

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
};

export default function MaskBrushPanel({
  layer,
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
}: MaskBrushPanelProps) {
  return (
    <section className="border-b border-white/10 p-4">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-sm font-semibold">
            Mask Brush
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Non-destructive hide / restore
          </p>
        </div>

        <div className="rounded bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300">
          BRUSH
        </div>

      </div>

      {!layer ? (
        <InfoBox>
          Select a layer first.
        </InfoBox>
      ) : layer.locked ? (
        <InfoBox>
          Unlock this layer before painting its mask.
        </InfoBox>
      ) : !layer.maskSrc ? (
        <InfoBox>
          Add a Layer Mask from the Layers panel first.
        </InfoBox>
      ) : !(layer.maskEnabled ?? true) ? (
        <InfoBox>
          The layer mask is disabled. Enable it in the Layers panel before painting.
        </InfoBox>
      ) : (
        <>
          <div className="mt-5">

            <div className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-gray-500">
              PAINT MODE
            </div>

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={() =>
                  onModeChange(
                    "hide"
                  )
                }
                className={
                  mode === "hide"
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
                }
              >
                Hide
                <div className="mt-1 text-[9px] text-gray-500">
                  Black mask
                </div>
              </button>

              <button
                onClick={() =>
                  onModeChange(
                    "reveal"
                  )
                }
                className={
                  mode === "reveal"
                    ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300"
                    : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
                }
              >
                Restore
                <div className="mt-1 text-[9px] text-gray-500">
                  White mask
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
            onChange={onBrushSizeChange}
          />

          <BrushSlider
            title="HARDNESS"
            value={brushHardness}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={onBrushHardnessChange}
          />

          <BrushSlider
            title="OPACITY"
            value={brushOpacity}
            min={1}
            max={100}
            step={1}
            suffix="%"
            onChange={onBrushOpacityChange}
          />

          <div className="mt-5">
            <div className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-gray-500">
              MASK VIEW
            </div>

            <button
              onClick={onOverlayToggle}
              className={
                overlayEnabled
                  ? "w-full rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-200"
                  : "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
              }
            >
              {overlayEnabled
                ? "Red Overlay: ON"
                : "Red Overlay: OFF"}
            </button>

            <div className="mt-2 text-[9px] leading-4 text-gray-600">
              Press \ to toggle the red mask preview.
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[10px] leading-5 text-gray-400">
            Paint over the selected image. Hide removes parts without erasing pixels. Restore brings them back. Use [ and ] to change brush size, and X to switch Hide / Restore.
          </div>
        </>
      )}

    </section>
  );
}

function BrushSlider({
  title,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div className="mt-5">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-[10px] font-semibold tracking-[0.16em] text-gray-500">
          {title}
        </span>

        <span className="rounded bg-white/5 px-2 py-1 text-[10px] tabular-nums text-gray-300">
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
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-indigo-500"
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
