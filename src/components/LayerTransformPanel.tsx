"use client";

import {
  useRef,
} from "react";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

type LayerTransformPanelProps = {
  layer: ImageLayer | null;

  onChange: (
    id: string,
    changes: Partial<ImageLayer>
  ) => void;

  /*
    Starts one Undo/Redo transaction before an
    inspector-driven transform begins. On-canvas
    transforms already do this through LayerCanvas.
  */
  onChangeStart: () => void;

  onReset: (
    id: string
  ) => void;
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function normalizeDegrees(
  value: number
) {
  let normalized =
    ((value + 180) % 360 + 360) % 360 - 180;

  if (
    Math.abs(normalized) <
    0.000001
  ) {
    normalized = 0;
  }

  return normalized;
}

export default function LayerTransformPanel({
  layer,
  onChange,
  onChangeStart,
  onReset,
}: LayerTransformPanelProps) {
  if (!layer) {
    return (
      <section className="border-b border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-4">

        <h3 className="text-sm font-semibold">
          Layer Transform
        </h3>

        <p className="mt-3 text-xs text-gray-500">
          Select a layer to transform it.
        </p>

      </section>
    );
  }

  const disabled =
    layer.locked;

  const layerId =
    layer.id;

  function beginAndChange(
    changes: Partial<ImageLayer>
  ) {
    if (disabled) {
      return;
    }

    onChangeStart();
    onChange(
      layerId,
      changes
    );
  }

  return (
    <section className="border-b border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-4">

      {/* HEADER */}

      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2.5">

        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            Layer Transform
          </h3>

          <p className="mt-1 max-w-[180px] truncate text-[10px] text-gray-500">
            {layer.name}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onReset(layer.id)
          }
          className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.055] px-2.5 py-1.5 text-[10px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.10] disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset
        </button>

      </div>

      {layer.locked && (
        <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-300">
          This layer is locked.
        </div>
      )}

      {/* POSITION */}

      <PanelTitle title="POSITION" />

      <div className="grid grid-cols-2 gap-2.5">
        <NumberControl
          title="X"
          value={layer.x}
          step={1}
          suffix="px"
          disabled={disabled}
          onChangeStart={onChangeStart}
          onChange={(value) =>
            onChange(
              layer.id,
              {
                x: value,
              }
            )
          }
        />

        <NumberControl
          title="Y"
          value={layer.y}
          step={1}
          suffix="px"
          disabled={disabled}
          onChangeStart={onChangeStart}
          onChange={(value) =>
            onChange(
              layer.id,
              {
                y: value,
              }
            )
          }
        />
      </div>

      <p className="mt-1 text-[9px] leading-4 text-gray-600">
        Position is measured from the document center.
      </p>

      {/* SCALE */}

      <PanelTitle title="SIZE" />

      <NumberControl
        title="Scale"
        value={layer.scale * 100}
        min={5}
        max={500}
        step={1}
        suffix="%"
        disabled={disabled}
        onChangeStart={onChangeStart}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              scale:
                clamp(
                  value / 100,
                  0.05,
                  5
                ),
            }
          )
        }
      />

      <Slider
        title="Scale"
        value={layer.scale}
        min={0.05}
        max={5}
        step={0.01}
        suffix="x"
        disabled={disabled}
        onChangeStart={onChangeStart}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              scale:
                clamp(
                  value,
                  0.05,
                  5
                ),
            }
          )
        }
      />

      <div className="grid grid-cols-3 gap-2">

        <PresetButton
          title="50%"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              scale: 0.5,
            })
          }
        />

        <PresetButton
          title="100%"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              scale: 1,
            })
          }
        />

        <PresetButton
          title="200%"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              scale: 2,
            })
          }
        />

      </div>

      {/* ROTATION */}

      <PanelTitle title="ROTATION" />

      <NumberControl
        title="Angle"
        value={layer.rotation}
        min={-180}
        max={180}
        step={0.1}
        precision={1}
        suffix="°"
        disabled={disabled}
        onChangeStart={onChangeStart}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              rotation:
                normalizeDegrees(
                  value
                ),
            }
          )
        }
      />

      <Slider
        title="Angle"
        value={
          normalizeDegrees(
            layer.rotation
          )
        }
        min={-180}
        max={180}
        step={0.1}
        suffix="°"
        disabled={disabled}
        onChangeStart={onChangeStart}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              rotation:
                normalizeDegrees(
                  value
                ),
            }
          )
        }
      />

      <div className="grid grid-cols-3 gap-2">

        <PresetButton
          title="↺ 90°"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              rotation:
                normalizeDegrees(
                  layer.rotation -
                  90
                ),
            })
          }
        />

        <PresetButton
          title="0°"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              rotation: 0,
            })
          }
        />

        <PresetButton
          title="↻ 90°"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              rotation:
                normalizeDegrees(
                  layer.rotation +
                  90
                ),
            })
          }
        />

      </div>

      {/* FLIP */}

      <PanelTitle title="FLIP" />

      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              flipHorizontal:
                !layer.flipHorizontal,
            })
          }
          className={
            layer.flipHorizontal
              ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300 disabled:opacity-30"
              : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
          }
        >
          Horizontal
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            beginAndChange({
              flipVertical:
                !layer.flipVertical,
            })
          }
          className={
            layer.flipVertical
              ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300 disabled:opacity-30"
              : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-30"
          }
        >
          Vertical
        </button>

      </div>

      {/* OPACITY */}

      <PanelTitle title="LAYER" />

      <Slider
        title="Opacity"
        value={layer.opacity}
        min={0}
        max={100}
        step={1}
        suffix="%"
        disabled={disabled}
        onChangeStart={onChangeStart}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              opacity:
                clamp(
                  value,
                  0,
                  100
                ),
            }
          )
        }
      />

      <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-[9px] leading-4 text-gray-600">
        Inspector transforms now participate in Undo/Redo as complete editing transactions.
      </div>

    </section>
  );
}

function PanelTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-3 mt-5 flex items-center gap-2 border-b border-white/[0.06] pb-2.5 text-[9px] font-semibold tracking-[0.18em] text-gray-500 before:h-px before:w-3 before:bg-cyan-400/30">
      {title}
    </div>
  );
}

type SliderProps = {
  title: string;
  value: number;

  min: number;
  max: number;
  step: number;

  suffix?: string;

  disabled?: boolean;

  onChangeStart: () => void;

  onChange: (
    value: number
  ) => void;
};

function Slider({
  title,
  value,
  min,
  max,
  step,
  suffix = "",
  disabled = false,
  onChangeStart,
  onChange,
}: SliderProps) {
  const editingRef =
    useRef(false);

  function changeValue(
    value: number
  ) {
    if (
      disabled ||
      !Number.isFinite(value)
    ) {
      return;
    }

    if (!editingRef.current) {
      onChangeStart();
      editingRef.current = true;
    }

    onChange(value);
  }

  function finishEditing() {
    editingRef.current = false;
  }

  return (
    <div className="mb-4">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs text-gray-400">
          {title}
        </span>

        <span className="min-w-[60px] rounded bg-white/5 px-2 py-1 text-center text-[10px] tabular-nums text-gray-300">
          {step < 1
            ? value.toFixed(2)
            : Math.round(value)}
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
        onChange={(event) =>
          changeValue(
            event.currentTarget
              .valueAsNumber
          )
        }
        onPointerUp={
          finishEditing
        }
        onPointerCancel={
          finishEditing
        }
        onBlur={finishEditing}
        className="w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={title}
      />

    </div>
  );
}

type NumberControlProps = {
  title: string;
  value: number;

  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  suffix?: string;

  disabled?: boolean;

  onChangeStart: () => void;

  onChange: (
    value: number
  ) => void;
};

function NumberControl({
  title,
  value,
  min,
  max,
  step = 1,
  precision = 0,
  suffix = "",
  disabled = false,
  onChangeStart,
  onChange,
}: NumberControlProps) {
  const editingRef =
    useRef(false);

  function changeValue(
    nextValue: number
  ) {
    if (
      disabled ||
      !Number.isFinite(
        nextValue
      )
    ) {
      return;
    }

    if (!editingRef.current) {
      onChangeStart();
      editingRef.current = true;
    }

    let normalized =
      nextValue;

    if (
      min !== undefined
    ) {
      normalized =
        Math.max(
          min,
          normalized
        );
    }

    if (
      max !== undefined
    ) {
      normalized =
        Math.min(
          max,
          normalized
        );
    }

    onChange(normalized);
  }

  function finishEditing() {
    editingRef.current = false;
  }

  const displayValue =
    precision > 0
      ? Number(
          value.toFixed(
            precision
          )
        )
      : Math.round(value);

  return (
    <label className="mb-3 block min-w-0">

      <span className="mb-1.5 block text-[10px] font-medium text-gray-500">
        {title}
      </span>

      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d1016] px-3 transition focus-within:border-cyan-400/35 focus-within:ring-2 focus-within:ring-cyan-400/[0.06]">
        <input
          type="number"
          value={displayValue}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) =>
            changeValue(
              event.currentTarget
                .valueAsNumber
            )
          }
          onBlur={finishEditing}
          className="min-w-0 flex-1 bg-transparent py-2 text-xs tabular-nums text-gray-100 outline-none disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={title}
        />

        {suffix && (
          <span className="select-none text-[10px] text-gray-500">
            {suffix}
          </span>
        )}
      </div>

    </label>
  );
}

function PresetButton({
  title,
  disabled,
  onClick,
}: {
  title: string;
  disabled: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-2 text-[10px] text-gray-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.055] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {title}
    </button>
  );
}
