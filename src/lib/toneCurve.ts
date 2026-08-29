import type {
  ToneCurvePoint,
} from "./layerTypes";

export const DEFAULT_TONE_CURVE:
  ToneCurvePoint[] = [
    {
      x: 0,
      y: 0,
    },
    {
      x: 255,
      y: 255,
    },
  ];

function clamp255(
  value: number
) {
  return Math.max(
    0,
    Math.min(
      255,
      value
    )
  );
}

export function normalizeToneCurve(
  value: unknown
): ToneCurvePoint[] {
  if (!Array.isArray(value)) {
    return DEFAULT_TONE_CURVE.map(
      (point) => ({
        ...point,
      })
    );
  }

  const normalized =
    value
      .filter(
        (item) =>
          !!item &&
          typeof item ===
            "object"
      )
      .map((item) => {
        const point =
          item as
            Partial<ToneCurvePoint>;

        return {
          x:
            clamp255(
              typeof point.x ===
                "number"
                ? point.x
                : 0
            ),

          y:
            clamp255(
              typeof point.y ===
                "number"
                ? point.y
                : 0
            ),
        };
      })
      .sort(
        (a, b) =>
          a.x -
          b.x
      );

  /*
    Keep only one point for each x value.
  */

  const unique:
    ToneCurvePoint[] =
      [];

  for (
    const point of
      normalized
  ) {
    const previous =
      unique[
        unique.length -
        1
      ];

    if (
      previous &&
      Math.abs(
        previous.x -
        point.x
      ) <
        0.5
    ) {
      previous.y =
        point.y;
    } else {
      unique.push({
        ...point,
      });
    }
  }

  /*
    Curves always have black and white endpoints.
  */

  if (
    unique.length === 0 ||
    unique[0].x >
      0.5
  ) {
    unique.unshift({
      x: 0,
      y: 0,
    });
  } else {
    unique[0].x =
      0;
  }

  const last =
    unique[
      unique.length -
      1
    ];

  if (
    !last ||
    last.x <
      254.5
  ) {
    unique.push({
      x: 255,
      y: 255,
    });
  } else {
    last.x =
      255;
  }

  return unique.slice(
    0,
    16
  );
}

export function buildToneCurveLut(
  points:
    ToneCurvePoint[]
) {
  const normalized =
    normalizeToneCurve(
      points
    );

  const lut =
    new Uint8ClampedArray(
      256
    );

  let segmentIndex =
    0;

  for (
    let input = 0;
    input <= 255;
    input += 1
  ) {
    while (
      segmentIndex <
        normalized.length -
          2 &&
      input >
        normalized[
          segmentIndex +
            1
        ].x
    ) {
      segmentIndex +=
        1;
    }

    const a =
      normalized[
        segmentIndex
      ];

    const b =
      normalized[
        Math.min(
          normalized.length -
            1,
          segmentIndex +
            1
        )
      ];

    const span =
      Math.max(
        0.0001,
        b.x -
          a.x
      );

    const t =
      Math.max(
        0,
        Math.min(
          1,
          (
            input -
            a.x
          ) /
            span
        )
      );

    /*
      Smoothstep produces a visually smoother
      curve than hard linear segments while
      still passing exactly through control points.
    */

    const smoothT =
      t *
      t *
      (
        3 -
        2 *
        t
      );

    const output =
      a.y +
      (
        b.y -
        a.y
      ) *
      smoothT;

    lut[input] =
      Math.round(
        clamp255(
          output
        )
      );
  }

  return lut;
}

export function applyToneCurveToCanvas(
  canvas:
    HTMLCanvasElement,
  points:
    ToneCurvePoint[]
) {
  applyToneCurvesToCanvas(
    canvas,
    points,
    DEFAULT_TONE_CURVE,
    DEFAULT_TONE_CURVE,
    DEFAULT_TONE_CURVE
  );
}

export function applyToneCurvesToCanvas(
  canvas:
    HTMLCanvasElement,
  masterPoints:
    ToneCurvePoint[],
  redPoints:
    ToneCurvePoint[],
  greenPoints:
    ToneCurvePoint[],
  bluePoints:
    ToneCurvePoint[]
) {
  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  if (
    !context ||
    canvas.width <= 0 ||
    canvas.height <= 0
  ) {
    return;
  }

  const masterLut =
    buildToneCurveLut(
      masterPoints
    );

  const redLut =
    buildToneCurveLut(
      redPoints
    );

  const greenLut =
    buildToneCurveLut(
      greenPoints
    );

  const blueLut =
    buildToneCurveLut(
      bluePoints
    );

  const imageData =
    context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const data =
    imageData.data;

  for (
    let index = 0;
    index <
      data.length;
    index += 4
  ) {
    /*
      Channel curve first, then the master RGB curve.

      Example:
      Red curve lifts red shadows.
      Master curve then applies the overall tonal shape.
    */

    const red =
      redLut[
        data[index]
      ];

    const green =
      greenLut[
        data[
          index + 1
        ]
      ];

    const blue =
      blueLut[
        data[
          index + 2
        ]
      ];

    data[index] =
      masterLut[
        red
      ];

    data[
      index + 1
    ] =
      masterLut[
        green
      ];

    data[
      index + 2
    ] =
      masterLut[
        blue
      ];
  }

  context.putImageData(
    imageData,
    0,
    0
  );
}
