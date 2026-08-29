export type Settings = {
  exposure: number;
  brightness: number;
  contrast: number;

  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;

  temperature: number;
  tint: number;
  vibrance: number;
  saturation: number;

  texture: number;
  clarity: number;
  dehaze: number;

  sharpness: number;
  noiseReduction: number;

  vignette: number;
  grain: number;
  fade: number;

  blur: number;
  opacity: number;
};

export const DEFAULT_SETTINGS: Settings = {
  exposure: 0,
  brightness: 0,
  contrast: 0,

  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,

  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,

  texture: 0,
  clarity: 0,
  dehaze: 0,

  sharpness: 0,
  noiseReduction: 0,

  vignette: 0,
  grain: 0,
  fade: 0,

  blur: 0,
  opacity: 100,
};

export function renderImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  settings: Settings,
  width: number,
  height: number,
  previewScale = 1
) {
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  /*
    BASE IMAGE
  */

  ctx.save();

  if (settings.blur > 0) {
    ctx.filter = `blur(${settings.blur * previewScale}px)`;
  } else {
    ctx.filter = "none";
  }

  ctx.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  ctx.restore();

  const imageData = ctx.getImageData(
    0,
    0,
    width,
    height
  );

  const data = imageData.data;

  /*
    EXPOSURE
  */

  const exposureFactor = Math.pow(
    2,
    settings.exposure
  );

  /*
    CONTRAST
  */

  const contrastInput =
    settings.contrast * 2.2;

  const contrastFactor =
    (259 * (contrastInput + 255)) /
    (255 * (259 - contrastInput));

  /*
    FIRST COLOR PASS
  */

  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    /*
      Exposure
    */

    r *= exposureFactor;
    g *= exposureFactor;
    b *= exposureFactor;

    /*
      Brightness
    */

    const brightness =
      settings.brightness * 1.4;

    r += brightness;
    g += brightness;
    b += brightness;

    /*
      Contrast
    */

    r =
      contrastFactor *
        (r - 128) +
      128;

    g =
      contrastFactor *
        (g - 128) +
      128;

    b =
      contrastFactor *
        (b - 128) +
      128;

    /*
      Luminance
    */

    let luminance =
      (
        0.2126 * r +
        0.7152 * g +
        0.0722 * b
      ) / 255;

    luminance = clamp(
      luminance,
      0,
      1
    );

    /*
      Shadows
    */

    const shadowWeight =
      Math.pow(
        1 - luminance,
        2
      );

    const shadow =
      settings.shadows *
      1.2 *
      shadowWeight;

    r += shadow;
    g += shadow;
    b += shadow;

    /*
      Highlights
    */

    const highlightWeight =
      Math.pow(
        luminance,
        2
      );

    const highlight =
      settings.highlights *
      1.2 *
      highlightWeight;

    r += highlight;
    g += highlight;
    b += highlight;

    /*
      Whites
    */

    const whiteMask =
      Math.pow(
        clamp(
          (luminance - 0.55) /
            0.45,
          0,
          1
        ),
        2
      );

    const whites =
      settings.whites *
      1.15 *
      whiteMask;

    r += whites;
    g += whites;
    b += whites;

    /*
      Blacks
    */

    const blackMask =
      Math.pow(
        clamp(
          (0.45 - luminance) /
            0.45,
          0,
          1
        ),
        2
      );

    const blacks =
      settings.blacks *
      1.15 *
      blackMask;

    r += blacks;
    g += blacks;
    b += blacks;

    /*
      Temperature
    */

    const temperature =
      settings.temperature;

    r += temperature * 0.75;
    g += temperature * 0.1;
    b -= temperature * 0.75;

    /*
      Tint
    */

    const tint =
      settings.tint;

    r += tint * 0.3;
    g -= tint * 0.6;
    b += tint * 0.3;

    /*
      Saturation
    */

    let gray =
      0.2126 * r +
      0.7152 * g +
      0.0722 * b;

    const saturationFactor =
      1 +
      settings.saturation /
        100;

    r =
      gray +
      (r - gray) *
        saturationFactor;

    g =
      gray +
      (g - gray) *
        saturationFactor;

    b =
      gray +
      (b - gray) *
        saturationFactor;

    /*
      Vibrance

      Low-saturation colors receive
      a stronger adjustment.
    */

    const maximum =
      Math.max(r, g, b);

    const minimum =
      Math.min(r, g, b);

    const colorRange =
      clamp(
        (maximum - minimum) /
          255,
        0,
        1
      );

    const vibrance =
      1 +
      (settings.vibrance /
        100) *
        (1 - colorRange) *
        0.9;

    gray =
      0.2126 * r +
      0.7152 * g +
      0.0722 * b;

    r =
      gray +
      (r - gray) *
        vibrance;

    g =
      gray +
      (g - gray) *
        vibrance;

    b =
      gray +
      (b - gray) *
        vibrance;

    /*
      DEHAZE

      Approximate atmospheric haze
      removal using local contrast
      and saturation.
    */

    if (settings.dehaze !== 0) {
      const dehazeAmount =
        settings.dehaze / 100;

      const factor =
        1 +
        dehazeAmount *
          0.75;

      r =
        (r - 128) *
          factor +
        128;

      g =
        (g - 128) *
          factor +
        128;

      b =
        (b - 128) *
          factor +
        128;

      gray =
        0.2126 * r +
        0.7152 * g +
        0.0722 * b;

      const dehazeSaturation =
        1 +
        dehazeAmount *
          0.28;

      r =
        gray +
        (r - gray) *
          dehazeSaturation;

      g =
        gray +
        (g - gray) *
          dehazeSaturation;

      b =
        gray +
        (b - gray) *
          dehazeSaturation;
    }

    /*
      FADE
    */

    if (settings.fade > 0) {
      const fade =
        settings.fade / 100;

      r =
        r *
          (1 - fade * 0.22) +
        32 * fade;

      g =
        g *
          (1 - fade * 0.22) +
        32 * fade;

      b =
        b *
          (1 - fade * 0.22) +
        32 * fade;
    }

    data[i] =
      clamp(r, 0, 255);

    data[i + 1] =
      clamp(g, 0, 255);

    data[i + 2] =
      clamp(b, 0, 255);
  }

  /*
    DETAIL PROCESSING

    We calculate a softly blurred
    version of the image.

    The difference between the original
    and blurred version provides local
    detail information.
  */

  const needsDetail =
    settings.texture !== 0 ||
    settings.clarity !== 0 ||
    settings.sharpness !== 0 ||
    settings.noiseReduction !== 0;

  if (needsDetail) {
    const original =
      new Uint8ClampedArray(
        data
      );

    const blurred =
      createSoftBlur(
        original,
        width,
        height
      );

    const texture =
      settings.texture *
      0.003;

    const clarity =
      settings.clarity *
      0.005;

    const sharpness =
      settings.sharpness *
      0.008;

    const detailStrength =
      texture +
      clarity +
      sharpness;

    const noiseReduction =
      clamp(
        settings.noiseReduction /
          100,
        0,
        1
      ) *
      0.65;

    for (
      let i = 0;
      i < data.length;
      i += 4
    ) {
      for (
        let channel = 0;
        channel < 3;
        channel++
      ) {
        const originalValue =
          original[i + channel];

        const blurredValue =
          blurred[i + channel];

        /*
          Noise reduction:
          move pixels slightly toward
          the local average.
        */

        let value =
          originalValue *
            (1 -
              noiseReduction) +
          blurredValue *
            noiseReduction;

        /*
          Detail enhancement
        */

        value +=
          (
            originalValue -
            blurredValue
          ) *
          detailStrength;

        data[i + channel] =
          clamp(
            value,
            0,
            255
          );
      }
    }
  }

  /*
    VIGNETTE + GRAIN
  */

  const centerX =
    width / 2;

  const centerY =
    height / 2;

  const maxDistance =
    centerX * centerX +
    centerY * centerY;

  const vignetteStrength =
    settings.vignette /
    100;

  const grainStrength =
    settings.grain *
    0.65;

  for (
    let y = 0;
    y < height;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x++
    ) {
      const index =
        (y * width + x) *
        4;

      /*
        VIGNETTE
      */

      if (
        settings.vignette !== 0
      ) {
        const dx =
          x - centerX;

        const dy =
          y - centerY;

        const distance =
          (
            dx * dx +
            dy * dy
          ) /
          maxDistance;

        const edge =
          clamp(
            (
              distance -
              0.12
            ) /
              0.88,
            0,
            1
          );

        const vignette =
          1 -
          vignetteStrength *
            edge *
            edge *
            0.75;

        data[index] =
          clamp(
            data[index] *
              vignette,
            0,
            255
          );

        data[index + 1] =
          clamp(
            data[index + 1] *
              vignette,
            0,
            255
          );

        data[index + 2] =
          clamp(
            data[index + 2] *
              vignette,
            0,
            255
          );
      }

      /*
        GRAIN

        Deterministic pixel noise,
        so it doesn't flash while
        moving sliders.
      */

      if (settings.grain > 0) {
        const noise =
          pixelNoise(
            x,
            y
          ) *
          grainStrength;

        data[index] =
          clamp(
            data[index] +
              noise,
            0,
            255
          );

        data[index + 1] =
          clamp(
            data[index + 1] +
              noise,
            0,
            255
          );

        data[index + 2] =
          clamp(
            data[index + 2] +
              noise,
            0,
            255
          );
      }

      /*
        OPACITY
      */

      data[index + 3] =
        data[index + 3] *
        (
          settings.opacity /
          100
        );
    }
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );
}


/*
  FAST 3 x 3 SOFT BLUR
*/

function createSoftBlur(
  source: Uint8ClampedArray,
  width: number,
  height: number
) {
  const output =
    new Uint8ClampedArray(
      source.length
    );

  /*
    Preserve the source first,
    especially for image edges.
  */

  output.set(source);

  for (
    let y = 1;
    y < height - 1;
    y++
  ) {
    for (
      let x = 1;
      x < width - 1;
      x++
    ) {
      const index =
        (y * width + x) *
        4;

      for (
        let channel = 0;
        channel < 3;
        channel++
      ) {
        let sum = 0;

        for (
          let oy = -1;
          oy <= 1;
          oy++
        ) {
          for (
            let ox = -1;
            ox <= 1;
            ox++
          ) {
            const neighbor =
              (
                (y + oy) *
                  width +
                (x + ox)
              ) *
                4 +
              channel;

            sum +=
              source[
                neighbor
              ];
          }
        }

        output[
          index + channel
        ] = sum / 9;
      }

      output[index + 3] =
        source[index + 3];
    }
  }

  return output;
}


/*
  STABLE GRAIN GENERATOR
*/

function pixelNoise(
  x: number,
  y: number
) {
  let value =
    (
      x * 374761393 +
      y * 668265263
    ) |
    0;

  value =
    (
      value ^
      (value >> 13)
    ) *
    1274126177;

  value =
    value ^
    (value >> 16);

  const normalized =
    (
      value & 255
    ) / 255;

  return (
    normalized -
    0.5
  );
}


function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}