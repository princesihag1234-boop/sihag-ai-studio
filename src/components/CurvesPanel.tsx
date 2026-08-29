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
  normalizeToneCurve,
} from "@/lib/toneCurve";

export type CurvesChannel =
  | "rgb"
  | "red"
  | "green"
  | "blue";

type CurvesPanelProps = {
  masterPoints:
    ToneCurvePoint[];

  redPoints:
    ToneCurvePoint[];

  greenPoints:
    ToneCurvePoint[];

  bluePoints:
    ToneCurvePoint[];

  disabled: boolean;

  onChangeStart: () => void;

  onChange: (
    channel:
      CurvesChannel,
    points:
      ToneCurvePoint[]
  ) => void;
};

const PRESETS: {
  name: string;
  points:
    ToneCurvePoint[];
}[] = [
  {
    name:
      "Linear",

    points: [
      {
        x: 0,
        y: 0,
      },
      {
        x: 255,
        y: 255,
      },
    ],
  },

  {
    name:
      "S-Curve",

    points: [
      {
        x: 0,
        y: 0,
      },
      {
        x: 64,
        y: 48,
      },
      {
        x: 128,
        y: 128,
      },
      {
        x: 192,
        y: 210,
      },
      {
        x: 255,
        y: 255,
      },
    ],
  },

  {
    name:
      "Fade",

    points: [
      {
        x: 0,
        y: 28,
      },
      {
        x: 72,
        y: 82,
      },
      {
        x: 180,
        y: 188,
      },
      {
        x: 255,
        y: 242,
      },
    ],
  },

  {
    name:
      "Lift Shadows",

    points: [
      {
        x: 0,
        y: 18,
      },
      {
        x: 55,
        y: 78,
      },
      {
        x: 128,
        y: 138,
      },
      {
        x: 255,
        y: 255,
      },
    ],
  },

  {
    name:
      "Crush Blacks",

    points: [
      {
        x: 0,
        y: 0,
      },
      {
        x: 42,
        y: 18,
      },
      {
        x: 110,
        y: 108,
      },
      {
        x: 255,
        y: 255,
      },
    ],
  },
];

const GRAPH_WIDTH =
  256;

const GRAPH_HEIGHT =
  180;

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
    useRef<SVGSVGElement>(
      null
    );

  const [
    channel,
    setChannel,
  ] =
    useState<CurvesChannel>(
      "rgb"
    );

  const [
    draggingIndex,
    setDraggingIndex,
  ] =
    useState<number | null>(
      null
    );

  const activePoints =
    channel ===
    "red"
      ? redPoints
      : channel ===
          "green"
        ? greenPoints
        : channel ===
            "blue"
          ? bluePoints
          : masterPoints;

  const normalized =
    useMemo(
      () =>
        normalizeToneCurve(
          activePoints
        ),
      [activePoints]
    );

  function clientToCurve(
    clientX: number,
    clientY: number
  ) {
    const rect =
      svgRef.current
        ?.getBoundingClientRect();

    if (!rect) {
      return {
        x: 0,
        y: 0,
      };
    }

    const x =
      Math.max(
        0,
        Math.min(
          255,
          (
            (
              clientX -
              rect.left
            ) /
            Math.max(
              1,
              rect.width
            )
          ) *
            255
        )
      );

    const y =
      Math.max(
        0,
        Math.min(
          255,
          255 -
          (
            (
              clientY -
              rect.top
            ) /
            Math.max(
              1,
              rect.height
            )
          ) *
            255
        )
      );

    return {
      x,
      y,
    };
  }

  function startGraphPointer(
    event:
      React.PointerEvent<SVGSVGElement>
  ) {
    if (disabled) {
      return;
    }

    const point =
      clientToCurve(
        event.clientX,
        event.clientY
      );

    let closestIndex =
      -1;

    let closestDistance =
      Infinity;

    normalized.forEach(
      (
        existing,
        index
      ) => {
        const dx =
          existing.x -
          point.x;

        const dy =
          existing.y -
          point.y;

        const distance =
          Math.sqrt(
            dx *
              dx +
            dy *
              dy
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closestIndex =
            index;
        }
      }
    );

    onChangeStart();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    if (
      closestIndex >=
        0 &&
      closestDistance <=
        14
    ) {
      setDraggingIndex(
        closestIndex
      );

      return;
    }

    if (
      normalized.length >=
      16
    ) {
      return;
    }

    const next = [
      ...normalized,
      point,
    ].sort(
      (a, b) =>
        a.x -
        b.x
    );

    const newIndex =
      next.findIndex(
        (item) =>
          item === point
      );

    onChange(
      channel,
      normalizeToneCurve(
        next
      )
    );

    setDraggingIndex(
      Math.max(
        0,
        newIndex
      )
    );
  }

  function moveGraphPointer(
    event:
      React.PointerEvent<SVGSVGElement>
  ) {
    if (
      disabled ||
      draggingIndex ===
        null
    ) {
      return;
    }

    const point =
      clientToCurve(
        event.clientX,
        event.clientY
      );

    const next =
      normalized.map(
        (
          existing,
          index
        ) => {
          if (
            index !==
            draggingIndex
          ) {
            return existing;
          }

          /*
            Endpoints keep x fixed at 0/255.
            Interior points cannot cross neighbors.
          */

          if (
            index === 0
          ) {
            return {
              x: 0,
              y:
                point.y,
            };
          }

          if (
            index ===
            normalized.length -
              1
          ) {
            return {
              x: 255,
              y:
                point.y,
            };
          }

          const previous =
            normalized[
              index - 1
            ];

          const nextPoint =
            normalized[
              index + 1
            ];

          return {
            x:
              Math.max(
                previous.x +
                  1,
                Math.min(
                  nextPoint.x -
                    1,
                  point.x
                )
              ),

            y:
              point.y,
          };
        }
      );

    onChange(
      channel,
      next
    );
  }

  function endGraphPointer() {
    setDraggingIndex(
      null
    );
  }

  function removePoint(
    index: number
  ) {
    if (
      disabled ||
      index === 0 ||
      index ===
        normalized.length -
          1
    ) {
      return;
    }

    onChangeStart();

    onChange(
      channel,
      normalized.filter(
        (
          _,
          itemIndex
        ) =>
          itemIndex !==
          index
      )
    );
  }

  const path =
    normalized
      .map(
        (
          point,
          index
        ) => {
          const x =
            (
              point.x /
              255
            ) *
            GRAPH_WIDTH;

          const y =
            (
              1 -
              point.y /
                255
            ) *
            GRAPH_HEIGHT;

          return `${
            index === 0
              ? "M"
              : "L"
          } ${x.toFixed(
            2
          )} ${y.toFixed(
            2
          )}`;
        }
      )
      .join(
        " "
      );

  return (
    <section className="border-b border-white/10 p-4">

      <div>

        <h3 className="text-sm font-semibold text-gray-200">
          Tone Curve
        </h3>

        <p className="mt-1 text-[10px] text-gray-500">
          Input brightness → output brightness
        </p>

      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1">

        {(
          [
            [
              "rgb",
              "RGB",
            ],
            [
              "red",
              "Red",
            ],
            [
              "green",
              "Green",
            ],
            [
              "blue",
              "Blue",
            ],
          ] as [
            CurvesChannel,
            string
          ][]
        ).map(
          ([
            value,
            label,
          ]) => (
            <button
              key={
                value
              }
              onClick={() => {
                setDraggingIndex(
                  null
                );

                setChannel(
                  value
                );
              }}
              className={
                channel ===
                value
                  ? value ===
                    "red"
                    ? "rounded-md border border-red-500/40 bg-red-500/15 px-2 py-1.5 text-[9px] text-red-200"
                    : value ===
                      "green"
                      ? "rounded-md border border-green-500/40 bg-green-500/15 px-2 py-1.5 text-[9px] text-green-200"
                      : value ===
                        "blue"
                        ? "rounded-md border border-blue-500/40 bg-blue-500/15 px-2 py-1.5 text-[9px] text-blue-200"
                        : "rounded-md border border-violet-500/40 bg-violet-500/15 px-2 py-1.5 text-[9px] text-violet-200"
                  : "rounded-md border border-transparent px-2 py-1.5 text-[9px] text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }
            >
              {label}
            </button>
          )
        )}

      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[9px]">

        <span className="text-gray-600">
          Editing
        </span>

        <span
          className={
            channel ===
            "red"
              ? "text-red-300"
              : channel ===
                "green"
                ? "text-green-300"
                : channel ===
                  "blue"
                  ? "text-blue-300"
                  : "text-violet-300"
          }
        >
          {channel ===
          "rgb"
            ? "Master RGB"
            : channel ===
                "red"
              ? "Red Channel"
              : channel ===
                  "green"
                ? "Green Channel"
                : "Blue Channel"}
        </span>

      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#10131c]">

        <svg
          ref={
            svgRef
          }
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          className={
            disabled
              ? "block aspect-[256/180] w-full cursor-not-allowed opacity-50"
              : "block aspect-[256/180] w-full cursor-crosshair touch-none"
          }
          onPointerDown={
            startGraphPointer
          }
          onPointerMove={
            moveGraphPointer
          }
          onPointerUp={
            endGraphPointer
          }
          onPointerCancel={
            endGraphPointer
          }
        >

          <rect
            x="0"
            y="0"
            width={
              GRAPH_WIDTH
            }
            height={
              GRAPH_HEIGHT
            }
            fill="transparent"
          />

          {[0.25, 0.5, 0.75].map(
            (value) => (
              <g
                key={
                  value
                }
                opacity="0.16"
              >
                <line
                  x1={
                    GRAPH_WIDTH *
                    value
                  }
                  x2={
                    GRAPH_WIDTH *
                    value
                  }
                  y1="0"
                  y2={
                    GRAPH_HEIGHT
                  }
                  stroke="currentColor"
                  strokeWidth="1"
                />

                <line
                  x1="0"
                  x2={
                    GRAPH_WIDTH
                  }
                  y1={
                    GRAPH_HEIGHT *
                    value
                  }
                  y2={
                    GRAPH_HEIGHT *
                    value
                  }
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </g>
            )
          )}

          <line
            x1="0"
            y1={
              GRAPH_HEIGHT
            }
            x2={
              GRAPH_WIDTH
            }
            y2="0"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeDasharray="4 4"
          />

          <path
            d={
              path
            }
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

          {normalized.map(
            (
              point,
              index
            ) => {
              const cx =
                (
                  point.x /
                  255
                ) *
                GRAPH_WIDTH;

              const cy =
                (
                  1 -
                  point.y /
                    255
                ) *
                GRAPH_HEIGHT;

              return (
                <circle
                  key={`${index}-${point.x}-${point.y}`}
                  cx={
                    cx
                  }
                  cy={
                    cy
                  }
                  r={
                    draggingIndex ===
                    index
                      ? 5
                      : 4
                  }
                  fill={
                    draggingIndex ===
                    index
                      ? "rgb(243 244 246)"
                      : channel ===
                          "red"
                        ? "rgb(239 68 68)"
                        : channel ===
                            "green"
                          ? "rgb(34 197 94)"
                          : channel ===
                              "blue"
                            ? "rgb(59 130 246)"
                            : "rgb(139 92 246)"
                  }
                  stroke="rgb(17 24 39)"
                  strokeWidth="1.5"
                  onDoubleClick={(
                    event
                  ) => {
                    event.stopPropagation();

                    removePoint(
                      index
                    );
                  }}
                />
              );
            }
          )}

        </svg>

      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-gray-600">

        <span>
          Shadows
        </span>

        <span>
          Midtones
        </span>

        <span>
          Highlights
        </span>

      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px] leading-4 text-gray-500">
        Choose RGB for overall tone, or Red/Green/Blue for color-channel control. Click to add points, drag to reshape, and double-click an interior point to remove it.
      </div>

      <div className="mt-4">

        <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
          CURVE PRESETS
        </div>

        <div className="grid grid-cols-2 gap-2">

          {PRESETS.map(
            (preset) => (
              <button
                key={
                  preset.name
                }
                disabled={
                  disabled
                }
                onClick={() => {
                  onChangeStart();

                  onChange(
                    channel,
                    preset.points.map(
                      (point) => ({
                        ...point,
                      })
                    )
                  );
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-300 hover:border-violet-500/35 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {preset.name}
              </button>
            )
          )}

        </div>

      </div>

    </section>
  );
}
