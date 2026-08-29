import type {
  ColorGradeRange,
  ColorGradingData,
} from "./layerTypes";

function emptyRange():
  ColorGradeRange {
  return {
    hue: 0,
    saturation: 0,
    luminance: 0,
  };
}

export const DEFAULT_COLOR_GRADING:
  ColorGradingData = {
    shadows:
      emptyRange(),

    midtones:
      emptyRange(),

    highlights:
      emptyRange(),

    balance:
      0,

    blending:
      50,
  };

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function normalizeRange(
  value: unknown
):
  ColorGradeRange {
  const range =
    value &&
    typeof value ===
      "object"
      ? value as
          Partial<ColorGradeRange>
      : {};

  return {
    hue:
      (
        (
          typeof range.hue ===
            "number"
            ? range.hue
            : 0
        ) %
        360 +
        360
      ) %
      360,

    saturation:
      clamp(
        typeof range.saturation ===
          "number"
          ? range.saturation
          : 0,
        0,
        100
      ),

    luminance:
      clamp(
        typeof range.luminance ===
          "number"
          ? range.luminance
          : 0,
        -100,
        100
      ),
  };
}

export function normalizeColorGrading(
  value: unknown
):
  ColorGradingData {
  const grading =
    value &&
    typeof value ===
      "object"
      ? value as
          Partial<ColorGradingData>
      : {};

  return {
    shadows:
      normalizeRange(
        grading.shadows
      ),

    midtones:
      normalizeRange(
        grading.midtones
      ),

    highlights:
      normalizeRange(
        grading.highlights
      ),

    balance:
      clamp(
        typeof grading.balance ===
          "number"
          ? grading.balance
          : 0,
        -100,
        100
      ),

    blending:
      clamp(
        typeof grading.blending ===
          "number"
          ? grading.blending
          : 50,
        0,
        100
      ),
  };
}

export function cloneColorGrading(
  grading:
    ColorGradingData
):
  ColorGradingData {
  return {
    shadows: {
      ...grading.shadows,
    },

    midtones: {
      ...grading.midtones,
    },

    highlights: {
      ...grading.highlights,
    },

    balance:
      grading.balance,

    blending:
      grading.blending,
  };
}

function hueToRgb(
  hue: number
) {
  const angle =
    (
      (
        hue %
        360
      ) +
      360
    ) %
    360;

  const section =
    angle / 60;

  const x =
    1 -
    Math.abs(
      section %
        2 -
      1
    );

  let r = 0;
  let g = 0;
  let b = 0;

  if (section < 1) {
    r = 1;
    g = x;
  } else if (section < 2) {
    r = x;
    g = 1;
  } else if (section < 3) {
    g = 1;
    b = x;
  } else if (section < 4) {
    g = x;
    b = 1;
  } else if (section < 5) {
    r = x;
    b = 1;
  } else {
    r = 1;
    b = x;
  }

  const average =
    (r + g + b) / 3;

  return {
    r: r - average,
    g: g - average,
    b: b - average,
  };
}

function smoothstep(
  edge0: number,
  edge1: number,
  value: number
) {
  const t =
    clamp(
      (value - edge0) /
        Math.max(
          0.0001,
          edge1 - edge0
        ),
      0,
      1
    );

  return t * t * (3 - 2 * t);
}

function hasChanges(
  grading:
    ColorGradingData
) {
  const ranges = [
    grading.shadows,
    grading.midtones,
    grading.highlights,
  ];

  return (
    grading.balance !== 0 ||
    ranges.some(
      (range) =>
        range.saturation !== 0 ||
        range.luminance !== 0
    )
  );
}

export function applyColorGradingToCanvas(
  canvas:
    HTMLCanvasElement,
  input:
    ColorGradingData
) {
  const grading =
    normalizeColorGrading(
      input
    );

  if (!hasChanges(grading)) {
    return;
  }

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      }
    );

  if (
    !context ||
    canvas.width <= 0 ||
    canvas.height <= 0
  ) {
    return;
  }

  const imageData =
    context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const data = imageData.data;

  const shadowTint =
    hueToRgb(
      grading.shadows.hue
    );

  const midtoneTint =
    hueToRgb(
      grading.midtones.hue
    );

  const highlightTint =
    hueToRgb(
      grading.highlights.hue
    );

  const balanceShift =
    grading.balance /
    100 *
    0.22;

  const shadowCenter =
    clamp(
      0.28 + balanceShift,
      0.08,
      0.48
    );

  const highlightCenter =
    clamp(
      0.72 + balanceShift,
      0.52,
      0.92
    );

  const overlap =
    0.10 +
    grading.blending /
      100 *
      0.28;

  for (
    let index = 0;
    index < data.length;
    index += 4
  ) {
    if (data[index + 3] === 0) {
      continue;
    }

    let red = data[index];
    let green = data[index + 1];
    let blue = data[index + 2];

    const luma =
      (
        red * 0.2126 +
        green * 0.7152 +
        blue * 0.0722
      ) / 255;

    const shadowWeight =
      1 -
      smoothstep(
        shadowCenter - overlap,
        shadowCenter + overlap,
        luma
      );

    const highlightWeight =
      smoothstep(
        highlightCenter - overlap,
        highlightCenter + overlap,
        luma
      );

    const midtoneWeight =
      clamp(
        1 -
          shadowWeight -
          highlightWeight,
        0,
        1
      );

    const ranges: {
      range: ColorGradeRange;
      tint: {
        r: number;
        g: number;
        b: number;
      };
      weight: number;
    }[] = [
      {
        range: grading.shadows,
        tint: shadowTint,
        weight: shadowWeight,
      },
      {
        range: grading.midtones,
        tint: midtoneTint,
        weight: midtoneWeight,
      },
      {
        range: grading.highlights,
        tint: highlightTint,
        weight: highlightWeight,
      },
    ];

    for (const item of ranges) {
      if (item.weight <= 0) {
        continue;
      }

      const saturationAmount =
        item.range.saturation /
        100 *
        95 *
        item.weight;

      red +=
        item.tint.r *
        saturationAmount;

      green +=
        item.tint.g *
        saturationAmount;

      blue +=
        item.tint.b *
        saturationAmount;

      const luminance =
        item.range.luminance /
        100 *
        70 *
        item.weight;

      red += luminance;
      green += luminance;
      blue += luminance;
    }

    data[index] =
      Math.round(
        clamp(red, 0, 255)
      );

    data[index + 1] =
      Math.round(
        clamp(green, 0, 255)
      );

    data[index + 2] =
      Math.round(
        clamp(blue, 0, 255)
      );
  }

  context.putImageData(
    imageData,
    0,
    0
  );
}
