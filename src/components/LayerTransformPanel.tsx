"use client";

import type {
  ImageLayer,
} from "@/lib/layerTypes";

type LayerTransformPanelProps = {
  layer: ImageLayer | null;

  onChange: (
    id: string,
    changes: Partial<ImageLayer>
  ) => void;

  onReset: (
    id: string
  ) => void;
};

export default function LayerTransformPanel({
  layer,
  onChange,
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

  return (
    <section className="border-b border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-4">

      {/* HEADER */}

      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2.5">

        <div>
          <h3 className="text-sm font-semibold">
            Layer Transform
          </h3>

          <p className="mt-1 max-w-[180px] truncate text-[10px] text-gray-500">
            {layer.name}
          </p>
        </div>

        <button
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

      <NumberControl
        title="X"
        value={layer.x}
        disabled={disabled}
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
        disabled={disabled}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              y: value,
            }
          )
        }
      />

      {/* SCALE */}

      <PanelTitle title="SIZE" />

      <Slider
        title="Scale"
        value={layer.scale}
        min={0.05}
        max={3}
        step={0.01}
        suffix="x"
        disabled={disabled}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              scale: value,
            }
          )
        }
      />

      <div className="grid grid-cols-3 gap-2">

        <PresetButton
          title="50%"
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                scale: 0.5,
              }
            )
          }
        />

        <PresetButton
          title="100%"
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                scale: 1,
              }
            )
          }
        />

        <PresetButton
          title="200%"
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                scale: 2,
              }
            )
          }
        />

      </div>

      {/* ROTATION */}

      <PanelTitle title="ROTATION" />

      <Slider
        title="Angle"
        value={layer.rotation}
        min={-180}
        max={180}
        step={1}
        suffix="°"
        disabled={disabled}
        onChange={(value) =>
          onChange(
            layer.id,
            {
              rotation: value,
            }
          )
        }
      />

      <div className="grid grid-cols-2 gap-2">

        <PresetButton
          title="↺ 90°"
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                rotation:
                  layer.rotation -
                  90,
              }
            )
          }
        />

        <PresetButton
          title="↻ 90°"
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                rotation:
                  layer.rotation +
                  90,
              }
            )
          }
        />

      </div>

      {/* FLIP */}

      <PanelTitle title="FLIP" />

      <div className="grid grid-cols-2 gap-2">

        <button
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                flipHorizontal:
                  !layer.flipHorizontal,
              }
            )
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
          disabled={disabled}
          onClick={() =>
            onChange(
              layer.id,
              {
                flipVertical:
                  !layer.flipVertical,
              }
            )
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
        onChange={(value) =>
          onChange(
            layer.id,
            {
              opacity: value,
            }
          )
        }
      />

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
  onChange,
}: SliderProps) {
  return (
    <div className="mb-4">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs text-gray-400">
          {title}
        </span>

        <span className="min-w-[60px] rounded bg-white/5 px-2 py-1 text-center text-[10px] text-gray-300">
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
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
      />

    </div>
  );
}

type NumberControlProps = {
  title: string;
  value: number;

  disabled?: boolean;

  onChange: (
    value: number
  ) => void;
};

function NumberControl({
  title,
  value,
  disabled = false,
  onChange,
}: NumberControlProps) {
  return (
    <div className="mb-3 flex items-center gap-3">

      <span className="w-6 text-xs text-gray-400">
        {title}
      </span>

      <input
        type="number"
        value={Math.round(value)}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full rounded-xl border border-white/[0.08] bg-[#0d1016] px-3 py-2 text-xs text-gray-100 outline-none transition focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/[0.06] disabled:opacity-30"
      />

      <span className="text-[10px] text-gray-500">
        px
      </span>

    </div>
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
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-2 text-[10px] text-gray-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.055] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {title}
    </button>
  );
}