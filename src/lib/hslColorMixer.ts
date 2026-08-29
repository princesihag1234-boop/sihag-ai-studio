import type {
  HslBandAdjustment,
  HslColorBand,
  HslColorMixer,
} from "./layerTypes";

export const HSL_BANDS:
  HslColorBand[] = [
    "red",
    "orange",
    "yellow",
    "green",
    "aqua",
    "blue",
    "purple",
    "magenta",
  ];

function emptyBand():
  HslBandAdjustment {
  return {
    hue: 0,
    saturation: 0,
    luminance: 0,
  };
}

export const DEFAULT_HSL_MIXER:
  HslColorMixer = {
    red:
      emptyBand(),

    orange:
      emptyBand(),

    yellow:
      emptyBand(),

    green:
      emptyBand(),

    aqua:
      emptyBand(),

    blue:
      emptyBand(),

    purple:
      emptyBand(),

    magenta:
      emptyBand(),
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

function normalizeBand(
  value: unknown
):
  HslBandAdjustment {
  const item =
    value &&
    typeof value ===
      "object"
      ? value as
          Partial<HslBandAdjustment>
      : {};

  return {
    hue:
      clamp(
        typeof item.hue ===
          "number"
          ? item.hue
          : 0,
        -100,
        100
      ),

    saturation:
      clamp(
        typeof item.saturation ===
          "number"
          ? item.saturation
          : 0,
        -100,
        100
      ),

    luminance:
      clamp(
        typeof item.luminance ===
          "number"
          ? item.luminance
          : 0,
        -100,
        100
      ),
  };
}

export function normalizeHslColorMixer(
  value: unknown
):
  HslColorMixer {
  const mixer =
    value &&
    typeof value ===
      "object"
      ? value as
          Partial<HslColorMixer>
      : {};

  return {
    red:
      normalizeBand(
        mixer.red
      ),

    orange:
      normalizeBand(
        mixer.orange
      ),

    yellow:
      normalizeBand(
        mixer.yellow
      ),

    green:
      normalizeBand(
        mixer.green
      ),

    aqua:
      normalizeBand(
        mixer.aqua
      ),

    blue:
      normalizeBand(
        mixer.blue
      ),

    purple:
      normalizeBand(
        mixer.purple
      ),

    magenta:
      normalizeBand(
        mixer.magenta
      ),
  };
}

export function cloneHslColorMixer(
  mixer:
    HslColorMixer
):
  HslColorMixer {
  return {
    red: {
      ...mixer.red,
    },

    orange: {
      ...mixer.orange,
    },

    yellow: {
      ...mixer.yellow,
    },

    green: {
      ...mixer.green,
    },

    aqua: {
      ...mixer.aqua,
    },

    blue: {
      ...mixer.blue,
    },

    purple: {
      ...mixer.purple,
    },

    magenta: {
      ...mixer.magenta,
    },
  };
}

function rgbToHsl(
  red: number,
  green: number,
  blue: number
) {
  const r =
    red / 255;

  const g =
    green / 255;

  const b =
    blue / 255;

  const max =
    Math.max(
      r,
      g,
      b
    );

  const min =
    Math.min(
      r,
      g,
      b
    );

  const delta =
    max - min;

  let hue =
    0;

  if (
    delta !== 0
  ) {
    if (
      max === r
    ) {
      hue =
        60 *
        (
          (
            g -
            b
          ) /
            delta %
          6
        );
    } else if (
      max === g
    ) {
      hue =
        60 *
        (
          (
            b -
            r
          ) /
            delta +
          2
        );
    } else {
      hue =
        60 *
        (
          (
            r -
            g
          ) /
            delta +
          4
        );
    }
  }

  if (
    hue < 0
  ) {
    hue +=
      360;
  }

  const lightness =
    (
      max +
      min
    ) /
    2;

  const saturation =
    delta === 0
      ? 0
      : delta /
        (
          1 -
          Math.abs(
            2 *
            lightness -
            1
          )
        );

  return {
    h:
      hue,

    s:
      saturation,

    l:
      lightness,
  };
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
) {
  const h =
    (
      (
        hue %
        360
      ) +
      360
    ) %
    360;

  const s =
    clamp(
      saturation,
      0,
      1
    );

  const l =
    clamp(
      lightness,
      0,
      1
    );

  const chroma =
    (
      1 -
      Math.abs(
        2 *
        l -
        1
      )
    ) *
    s;

  const hPrime =
    h / 60;

  const x =
    chroma *
    (
      1 -
      Math.abs(
        hPrime %
          2 -
        1
      )
    );

  let r1 =
    0;

  let g1 =
    0;

  let b1 =
    0;

  if (
    hPrime <
    1
  ) {
    r1 =
      chroma;
    g1 =
      x;
  } else if (
    hPrime <
    2
  ) {
    r1 =
      x;
    g1 =
      chroma;
  } else if (
    hPrime <
    3
  ) {
    g1 =
      chroma;
    b1 =
      x;
  } else if (
    hPrime <
    4
  ) {
    g1 =
      x;
    b1 =
      chroma;
  } else if (
    hPrime <
    5
  ) {
    r1 =
      x;
    b1 =
      chroma;
  } else {
    r1 =
      chroma;
    b1 =
      x;
  }

  const m =
    l -
    chroma /
      2;

  return {
    r:
      Math.round(
        clamp(
          (
            r1 +
            m
          ) *
            255,
          0,
          255
        )
      ),

    g:
      Math.round(
        clamp(
          (
            g1 +
            m
          ) *
            255,
          0,
          255
        )
      ),

    b:
      Math.round(
        clamp(
          (
            b1 +
            m
          ) *
            255,
          0,
          255
        )
      ),
  };
}

const BAND_CENTERS:
  Record<
    HslColorBand,
    number
  > = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    aqua: 180,
    blue: 240,
    purple: 280,
    magenta: 320,
  };

function circularHueDistance(
  a: number,
  b: number
) {
  const distance =
    Math.abs(
      a -
      b
    ) %
    360;

  return Math.min(
    distance,
    360 -
      distance
  );
}

function bandWeight(
  hue: number,
  center: number
) {
  /*
    Soft overlapping color ranges keep transitions
    natural instead of creating harsh color borders.
  */

  const distance =
    circularHueDistance(
      hue,
      center
    );

  const radius =
    48;

  if (
    distance >=
    radius
  ) {
    return 0;
  }

  const linear =
    1 -
    distance /
      radius;

  return (
    linear *
    linear *
    (
      3 -
      2 *
      linear
    )
  );
}

function hasMixerChanges(
  mixer:
    HslColorMixer
) {
  return HSL_BANDS.some(
    (band) => {
      const value =
        mixer[band];

      return (
        value.hue !==
          0 ||
        value.saturation !==
          0 ||
        value.luminance !==
          0
      );
    }
  );
}

export function applyHslColorMixerToCanvas(
  canvas:
    HTMLCanvasElement,
  input:
    HslColorMixer
) {
  const mixer =
    normalizeHslColorMixer(
      input
    );

  if (
    !hasMixerChanges(
      mixer
    )
  ) {
    return;
  }

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
    if (
      data[
        index + 3
      ] ===
      0
    ) {
      continue;
    }

    const hsl =
      rgbToHsl(
        data[index],
        data[
          index + 1
        ],
        data[
          index + 2
        ]
      );

    /*
      Extremely neutral pixels do not have a stable
      hue. Reducing HSL mixer influence on near-gray
      pixels avoids unwanted color noise.
    */

    const chromaInfluence =
      clamp(
        hsl.s *
          4,
        0,
        1
      );

    let totalWeight =
      0;

    let hueAdjustment =
      0;

    let saturationAdjustment =
      0;

    let luminanceAdjustment =
      0;

    for (
      const band of
        HSL_BANDS
    ) {
      const weight =
        bandWeight(
          hsl.h,
          BAND_CENTERS[
            band
          ]
        ) *
        chromaInfluence;

      if (
        weight <=
        0
      ) {
        continue;
      }

      const adjustment =
        mixer[band];

      totalWeight +=
        weight;

      hueAdjustment +=
        adjustment.hue *
        weight;

      saturationAdjustment +=
        adjustment.saturation *
        weight;

      luminanceAdjustment +=
        adjustment.luminance *
        weight;
    }

    if (
      totalWeight <=
      0.0001
    ) {
      continue;
    }

    const hueValue =
      hueAdjustment /
      totalWeight;

    const saturationValue =
      saturationAdjustment /
      totalWeight;

    const luminanceValue =
      luminanceAdjustment /
      totalWeight;

    /*
      Hue ±100 maps to ±60 degrees.
    */

    const newHue =
      hsl.h +
      hueValue *
        0.6;

    /*
      Saturation behaves like an HSL color mixer:
      -100 removes saturation from the targeted color.
      Positive values progressively intensify it.
    */

    const newSaturation =
      saturationValue >=
      0
        ? hsl.s +
          (
            1 -
            hsl.s
          ) *
          (
            saturationValue /
            100
          )
        : hsl.s *
          (
            1 +
            saturationValue /
            100
          );

    /*
      Luminance pushes toward white or black while
      preserving a smooth usable range.
    */

    const newLightness =
      luminanceValue >=
      0
        ? hsl.l +
          (
            1 -
            hsl.l
          ) *
          (
            luminanceValue /
            100
          ) *
          0.8
        : hsl.l *
          (
            1 +
            luminanceValue /
            100 *
            0.8
          );

    const rgb =
      hslToRgb(
        newHue,
        newSaturation,
        newLightness
      );

    data[index] =
      rgb.r;

    data[
      index + 1
    ] =
      rgb.g;

    data[
      index + 2
    ] =
      rgb.b;
  }

  context.putImageData(
    imageData,
    0,
    0
  );
}
