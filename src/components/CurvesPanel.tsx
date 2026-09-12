"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ToneCurvePoint,
} from "@/lib/layerTypes";

import {
  buildToneCurveLut,
  normalizeToneCurve,
} from "@/lib/toneCurve";

export type CurvesChannel =
  | "rgb"
  | "red"
  | "green"
  | "blue";

type CurvesPanelProps = {
  masterPoints: ToneCurvePoint[];
  redPoints: ToneCurvePoint[];
  greenPoints: ToneCurvePoint[];
  bluePoints: ToneCurvePoint[];
  disabled: boolean;
  onChangeStart: () => void;
  onChange: (
    channel: CurvesChannel,
    points: ToneCurvePoint[]
  ) => void;
};

type CurvePreset = {
  name: string;
  description: string;
  points: ToneCurvePoint[];
};

const PRESETS: CurvePreset[] = [
  {
    name: "Linear",
    description: "Neutral response",
    points: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
  },
  {
    name: "S-Curve",
    description: "Classic contrast",
    points: [
      { x: 0, y: 0 },
      { x: 64, y: 48 },
      { x: 128, y: 128 },
      { x: 192, y: 210 },
      { x: 255, y: 255 },
    ],
  },
  {
    name: "Soft Contrast",
    description: "Gentle separation",
    points: [
      { x: 0, y: 6 },
      { x: 64, y: 56 },
      { x: 128, y: 128 },
      { x: 192, y: 200 },
      { x: 255, y: 250 },
    ],
  },
  {
    name: "Fade",
    description: "Lifted matte blacks",
    points: [
      { x: 0, y: 28 },
      { x: 72, y: 82 },
      { x: 180, y: 188 },
      { x: 255, y: 242 },
    ],
  },
  {
    name: "Lift Shadows",
    description: "Open darker tones",
    points: [
      { x: 0, y: 18 },
      { x: 55, y: 78 },
      { x: 128, y: 138 },
      { x: 255, y: 255 },
    ],
  },
  {
    name: "Crush Blacks",
    description: "Deeper shadow floor",
    points: [
      { x: 0, y: 0 },
      { x: 42, y: 18 },
      { x: 110, y: 108 },
      { x: 255, y: 255 },
    ],
  },
];

const GRAPH_WIDTH = 256;
const GRAPH_HEIGHT = 180;

const CHANNELS: [CurvesChannel, string][] = [
  ["rgb", "RGB"],
  ["red", "Red"],
  ["green", "Green"],
  ["blue", "Blue"],
];

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function channelLabel(
  channel: CurvesChannel
) {
  if (channel === "red") return "Red Channel";
  if (channel === "green") return "Green Channel";
  if (channel === "blue") return "Blue Channel";
  return "Master RGB";
}

export default function CurvesPanel({
  masterPoints,
  redPoints,
  greenPoints,
  bluePoints,
  disabled,
  onChangeStart,
  onChange,
}: CurvesPanelProps) {
  const svgRef =
    useRef<SVGSVGElement>(null);

  const [channel, setChannel] =
    useState<CurvesChannel>("rgb");

  const [draggingIndex, setDraggingIndex] =
    useState<number | null>(null);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const activePoints =
    channel === "red"
      ? redPoints
      : channel === "green"
        ? greenPoints
        : channel === "blue"
          ? bluePoints
          : masterPoints;

  const normalized = useMemo(
    () => normalizeToneCurve(activePoints),
    [activePoints]
  );

  const curvePath = useMemo(() => {
    const lut = buildToneCurveLut(normalized);
    const commands: string[] = [];

    for (let input = 0; input <= 255; input += 4) {
      const x =
        (input / 255) * GRAPH_WIDTH;
      const y =
        (1 - lut[input] / 255) * GRAPH_HEIGHT;

      commands.push(
        `${commands.length === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
      );
    }

    const endY =
      (1 - lut[255] / 255) * GRAPH_HEIGHT;

    commands.push(
      `L ${GRAPH_WIDTH.toFixed(2)} ${endY.toFixed(2)}`
    );

    return commands.join(" ");
  }, [normalized]);

  const selectedPoint =
    selectedIndex !== null &&
    selectedIndex >= 0 &&
    selectedIndex < normalized.length
      ? normalized[selectedIndex]
      : null;

  function clientToCurve(
    clientX: number,
    clientY: number
  ) {
    const rect =
      svgRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: clamp(
        ((clientX - rect.left) /
          Math.max(1, rect.width)) * 255,
        0,
        255
      ),
      y: clamp(
        255 -
          ((clientY - rect.top) /
            Math.max(1, rect.height)) * 255,
        0,
        255
      ),
    };
  }

  function startGraphPointer(
    event: React.PointerEvent<SVGSVGElement>
  ) {
    if (disabled) return;

    const point = clientToCurve(
      event.clientX,
      event.clientY
    );

    let closestIndex = -1;
    let closestDistance = Infinity;

    normalized.forEach((existing, index) => {
      const dx = existing.x - point.x;
      const dy = existing.y - point.y;
      const distance = Math.hypot(dx, dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    onChangeStart();
    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    if (
      closestIndex >= 0 &&
      closestDistance <= 14
    ) {
      setDraggingIndex(closestIndex);
      setSelectedIndex(closestIndex);
      return;
    }

    if (normalized.length >= 16) return;

    const next = [
      ...normalized.map((item) => ({ ...item })),
      point,
    ].sort((a, b) => a.x - b.x);

    const rawIndex = next.indexOf(point);
    const normalizedNext = normalizeToneCurve(next);

    onChange(channel, normalizedNext);

    const newIndex = clamp(
      rawIndex,
      0,
      normalizedNext.length - 1
    );

    setDraggingIndex(newIndex);
    setSelectedIndex(newIndex);
  }

  function moveGraphPointer(
    event: React.PointerEvent<SVGSVGElement>
  ) {
    if (
      disabled ||
      draggingIndex === null ||
      draggingIndex < 0 ||
      draggingIndex >= normalized.length
    ) {
      return;
    }

    const point = clientToCurve(
      event.clientX,
      event.clientY
    );

    const next = normalized.map(
      (existing, index) => {
        if (index !== draggingIndex) {
          return existing;
        }

        if (index === 0) {
          return { x: 0, y: point.y };
        }

        if (index === normalized.length - 1) {
          return { x: 255, y: point.y };
        }

        const previous = normalized[index - 1];
        const following = normalized[index + 1];

        return {
          x: clamp(
            point.x,
            previous.x + 1,
            following.x - 1
          ),
          y: point.y,
        };
      }
    );

    onChange(channel, next);
  }

  function endGraphPointer() {
    setDraggingIndex(null);
  }

  function removePoint(index: number) {
    if (
      disabled ||
      index <= 0 ||
      index >= normalized.length - 1
    ) {
      return;
    }

    onChangeStart();
    onChange(
      channel,
      normalized.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
    setSelectedIndex(null);
    setDraggingIndex(null);
  }

  function updateSelectedPoint(
    axis: "x" | "y",
    rawValue: number
  ) {
    if (
      disabled ||
      selectedIndex === null ||
      !selectedPoint ||
      !Number.isFinite(rawValue)
    ) {
      return;
    }

    const next = normalized.map(
      (point, index) => {
        if (index !== selectedIndex) {
          return point;
        }

        if (axis === "y") {
          return {
            ...point,
            y: clamp(rawValue, 0, 255),
          };
        }

        if (index === 0) {
          return { ...point, x: 0 };
        }

        if (index === normalized.length - 1) {
          return { ...point, x: 255 };
        }

        return {
          ...point,
          x: clamp(
            rawValue,
            normalized[index - 1].x + 1,
            normalized[index + 1].x - 1
          ),
        };
      }
    );

    onChange(channel, next);
  }

  function resetCurrentChannel() {
    if (disabled) return;

    onChangeStart();
    onChange(channel, [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ]);
    setSelectedIndex(null);
    setDraggingIndex(null);
  }

  return (
    <section className="border-b border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            Tone Curve
          </h3>
          <p className="mt-1 text-[10px] text-gray-500">
            Precise luminance and channel mapping
          </p>
        </div>

        <button
          disabled={disabled}
          onClick={resetCurrentChannel}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Reset Channel
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1">
        {CHANNELS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              setDraggingIndex(null);
              setSelectedIndex(null);
              setChannel(value);
            }}
            className={
              channel === value
                ? value === "red"
                  ? "rounded-md border border-red-500/40 bg-red-500/15 px-2 py-1.5 text-[9px] text-red-200"
                  : value === "green"
                    ? "rounded-md border border-green-500/40 bg-green-500/15 px-2 py-1.5 text-[9px] text-green-200"
                    : value === "blue"
                      ? "rounded-md border border-blue-500/40 bg-blue-500/15 px-2 py-1.5 text-[9px] text-blue-200"
                      : "rounded-md border border-violet-500/40 bg-violet-500/15 px-2 py-1.5 text-[9px] text-violet-200"
                : "rounded-md border border-transparent px-2 py-1.5 text-[9px] text-gray-500 hover:bg-white/5 hover:text-gray-300"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[9px]">
        <span className="text-gray-600">
          Editing
        </span>
        <span
          className={
            channel === "red"
              ? "text-red-300"
              : channel === "green"
                ? "text-green-300"
                : channel === "blue"
                  ? "text-blue-300"
                  : "text-violet-300"
          }
        >
          {channelLabel(channel)}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#10131c]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          className={
            disabled
              ? "block aspect-[256/180] w-full cursor-not-allowed opacity-50"
              : "block aspect-[256/180] w-full cursor-crosshair touch-none"
          }
          onPointerDown={startGraphPointer}
          onPointerMove={moveGraphPointer}
          onPointerUp={endGraphPointer}
          onPointerCancel={endGraphPointer}
        >
          <rect
            x="0"
            y="0"
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            fill="transparent"
          />

          {[0.25, 0.5, 0.75].map((value) => (
            <g key={value} opacity="0.16">
              <line
                x1={GRAPH_WIDTH * value}
                x2={GRAPH_WIDTH * value}
                y1="0"
                y2={GRAPH_HEIGHT}
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="0"
                x2={GRAPH_WIDTH}
                y1={GRAPH_HEIGHT * value}
                y2={GRAPH_HEIGHT * value}
                stroke="currentColor"
                strokeWidth="1"
              />
            </g>
          ))}

          <line
            x1="0"
            y1={GRAPH_HEIGHT}
            x2={GRAPH_WIDTH}
            y2="0"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeDasharray="4 4"
          />

          <path
            d={curvePath}
            fill="none"
            stroke={
              channel === "red"
                ? "rgb(248 113 113)"
                : channel === "green"
                  ? "rgb(74 222 128)"
                  : channel === "blue"
                    ? "rgb(96 165 250)"
                    : "rgb(167 139 250)"
            }
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {normalized.map((point, index) => {
            const cx =
              (point.x / 255) * GRAPH_WIDTH;
            const cy =
              (1 - point.y / 255) * GRAPH_HEIGHT;
            const selected =
              selectedIndex === index;

            return (
              <circle
                key={`${index}-${point.x}-${point.y}`}
                cx={cx}
                cy={cy}
                r={
                  draggingIndex === index
                    ? 5.5
                    : selected
                      ? 5
                      : 4
                }
                fill={
                  selected
                    ? "rgb(243 244 246)"
                    : channel === "red"
                      ? "rgb(239 68 68)"
                      : channel === "green"
                        ? "rgb(34 197 94)"
                        : channel === "blue"
                          ? "rgb(59 130 246)"
                          : "rgb(139 92 246)"
                }
                stroke="rgb(17 24 39)"
                strokeWidth="1.5"
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  removePoint(index);
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-gray-600">
        <span>Shadows</span>
        <span>Midtones</span>
        <span>Highlights</span>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
              SELECTED POINT
            </div>
            <div className="mt-1 text-[9px] text-gray-600">
              Input and output values, 0–255
            </div>
          </div>

          <button
            disabled={
              disabled ||
              selectedIndex === null ||
              selectedIndex <= 0 ||
              selectedIndex >= normalized.length - 1
            }
            onClick={() => {
              if (selectedIndex !== null) {
                removePoint(selectedIndex);
              }
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-25"
          >
            Delete Point
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <CurveNumberInput
            label="Input (X)"
            value={selectedPoint?.x ?? 0}
            disabled={disabled || !selectedPoint}
            onFocus={onChangeStart}
            onChange={(value) =>
              updateSelectedPoint("x", value)
            }
          />
          <CurveNumberInput
            label="Output (Y)"
            value={selectedPoint?.y ?? 0}
            disabled={disabled || !selectedPoint}
            onFocus={onChangeStart}
            onChange={(value) =>
              updateSelectedPoint("y", value)
            }
          />
        </div>

        <div className="mt-2 text-[9px] leading-4 text-gray-600">
          {selectedPoint
            ? selectedIndex === 0 || selectedIndex === normalized.length - 1
              ? "Endpoint X is fixed; adjust Y to set the black or white output point."
              : "Interior points can be positioned precisely without crossing neighboring points."
            : "Select a curve point to edit exact coordinates."}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px] leading-4 text-gray-500">
        Click to add points, drag to reshape, and double-click an interior point to remove it. The displayed line now follows the same LUT used by the renderer.
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
          CURVE PRESETS
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              disabled={disabled}
              onClick={() => {
                onChangeStart();
                onChange(
                  channel,
                  preset.points.map((point) => ({
                    ...point,
                  }))
                );
                setSelectedIndex(null);
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left hover:border-violet-500/35 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <div className="text-[9px] font-medium text-gray-300">
                {preset.name}
              </div>
              <div className="mt-0.5 text-[8px] text-gray-600">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurveNumberInput({
  label,
  value,
  disabled,
  onFocus,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onFocus: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[9px] text-gray-500">
        {label}
      </span>
      <input
        type="number"
        min={0}
        max={255}
        step={1}
        value={Math.round(value)}
        disabled={disabled}
        onFocus={onFocus}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-[10px] tabular-nums text-gray-200 outline-none focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-30"
      />
    </label>
  );
}
