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

/*
  PERFORMANCE STAGE 2

  The old renderer always copied the complete canvas into
  ImageData and ran multiple full-image loops, even when most
  controls were at their neutral values. That made a simple
  slider move unnecessarily expensive.

  This version keeps the same CPU image-processing model and
  export behavior, but it only performs the passes that are
  actually needed by the active settings.
*/
export function renderImage(
  canvas: HTMLCanvasElement,
  image: CanvasImageSource,
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

  /* BASE IMAGE */

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

  const hasExposure =
    settings.exposure !== 0;

  const hasBrightness =
    settings.brightness !== 0;

  const hasContrast =
    settings.contrast !== 0;

  const hasTone =
    settings.highlights !== 0 ||
    settings.shadows !== 0 ||
    settings.whites !== 0 ||
    settings.blacks !== 0;

  const hasTemperature =
    settings.temperature !== 0;

  const hasTint =
    settings.tint !== 0;

  const hasSaturation =
    settings.saturation !== 0;

  const hasVibrance =
    settings.vibrance !== 0;

  const hasDehaze =
    settings.dehaze !== 0;

  const hasFade =
    settings.fade > 0;

  const needsColorPass =
    hasExposure ||
    hasBrightness ||
    hasContrast ||
    hasTone ||
    hasTemperature ||
    hasTint ||
    hasSaturation ||
    hasVibrance ||
    hasDehaze ||
    hasFade;

  const needsDetail =
    settings.texture !== 0 ||
    settings.clarity !== 0 ||
    settings.sharpness !== 0 ||
    settings.noiseReduction !== 0;

  const hasVignette =
    settings.vignette !== 0;

  const hasGrain =
    settings.grain > 0;

  const hasOpacity =
    settings.opacity !== 100;

  const needsFinishPass =
    hasVignette ||
    hasGrain ||
    hasOpacity;

  /*
    Most images open with all pixel settings neutral.
    In that common case the base draw above is the complete
    result, so avoid the expensive getImageData/putImageData
    round trip entirely.
  */
  if (
    !needsColorPass &&
    !needsDetail &&
    !needsFinishPass
  ) {
    return;
  }

  const imageData = ctx.getImageData(
    0,
    0,
    width,
    height
  );

  const data = imageData.data;

  if (needsColorPass) {
    const exposureFactor =
      hasExposure
        ? Math.pow(
            2,
            settings.exposure
          )
        : 1;

    const brightness =
      hasBrightness
        ? settings.brightness *
          1.4
        : 0;

    const contrastInput =
      settings.contrast * 2.2;

    const contrastFactor =
      hasContrast
        ? (
            259 *
            (contrastInput + 255)
          ) /
          (
            255 *
            (259 - contrastInput)
          )
        : 1;

    const temperature =
      settings.temperature;

    const tint =
      settings.tint;

    const saturationFactor =
      1 +
      settings.saturation /
        100;

    const vibranceAmount =
      settings.vibrance /
      100;

    const dehazeAmount =
      settings.dehaze /
      100;

    const dehazeFactor =
      1 +
      dehazeAmount *
        0.75;

    const dehazeSaturation =
      1 +
      dehazeAmount *
        0.28;

    const fade =
      settings.fade /
      100;

    const fadeMultiplier =
      1 - fade * 0.22;

    const fadeLift =
      32 * fade;

    for (
      let i = 0;
      i < data.length;
      i += 4
    ) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (hasExposure) {
        r *= exposureFactor;
        g *= exposureFactor;
        b *= exposureFactor;
      }

      if (hasBrightness) {
        r += brightness;
        g += brightness;
        b += brightness;
      }

      if (hasContrast) {
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
      }

      if (hasTone) {
        let luminance =
          (
            0.2126 * r +
            0.7152 * g +
            0.0722 * b
          ) /
          255;

        luminance = clamp(
          luminance,
          0,
          1
        );

        if (
          settings.shadows !== 0
        ) {
          const inverse =
            1 - luminance;

          const shadow =
            settings.shadows *
            1.2 *
            inverse *
            inverse;

          r += shadow;
          g += shadow;
          b += shadow;
        }

        if (
          settings.highlights !== 0
        ) {
          const highlight =
            settings.highlights *
            1.2 *
            luminance *
            luminance;

          r += highlight;
          g += highlight;
          b += highlight;
        }

        if (
          settings.whites !== 0
        ) {
          const whiteBase =
            clamp(
              (
                luminance -
                0.55
              ) /
                0.45,
              0,
              1
            );

          const whites =
            settings.whites *
            1.15 *
            whiteBase *
            whiteBase;

          r += whites;
          g += whites;
          b += whites;
        }

        if (
          settings.blacks !== 0
        ) {
          const blackBase =
            clamp(
              (
                0.45 -
                luminance
              ) /
                0.45,
              0,
              1
            );

          const blacks =
            settings.blacks *
            1.15 *
            blackBase *
            blackBase;

          r += blacks;
          g += blacks;
          b += blacks;
        }
      }

      if (hasTemperature) {
        r +=
          temperature *
          0.75;

        g +=
          temperature *
          0.1;

        b -=
          temperature *
          0.75;
      }

      if (hasTint) {
        r += tint * 0.3;
        g -= tint * 0.6;
        b += tint * 0.3;
      }

      if (hasSaturation) {
        const gray =
          0.2126 * r +
          0.7152 * g +
          0.0722 * b;

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
      }

      if (hasVibrance) {
        const maximum =
          Math.max(
            r,
            g,
            b
          );

        const minimum =
          Math.min(
            r,
            g,
            b
          );

        const colorRange =
          clamp(
            (
              maximum -
              minimum
            ) /
              255,
            0,
            1
          );

        const vibrance =
          1 +
          vibranceAmount *
            (1 - colorRange) *
            0.9;

        const gray =
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
      }

      if (hasDehaze) {
        r =
          (r - 128) *
            dehazeFactor +
          128;

        g =
          (g - 128) *
            dehazeFactor +
          128;

        b =
          (b - 128) *
            dehazeFactor +
          128;

        const gray =
          0.2126 * r +
          0.7152 * g +
          0.0722 * b;

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

      if (hasFade) {
        r =
          r *
            fadeMultiplier +
          fadeLift;

        g =
          g *
            fadeMultiplier +
          fadeLift;

        b =
          b *
            fadeMultiplier +
          fadeLift;
      }

      data[i] =
        clamp(
          r,
          0,
          255
        );

      data[i + 1] =
        clamp(
          g,
          0,
          255
        );

      data[i + 2] =
        clamp(
          b,
          0,
          255
        );
    }
  }

  /* DETAIL PROCESSING */

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

    /* Preserve the existing editor look. */
    const detailStrength =
      texture +
      clarity +
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

    const keepOriginal =
      1 -
      noiseReduction;

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
          original[
            i + channel
          ];

        const blurredValue =
          blurred[
            i + channel
          ];

        let value =
          originalValue *
            keepOriginal +
          blurredValue *
            noiseReduction;

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

  /* VIGNETTE + GRAIN + OPACITY */

  if (needsFinishPass) {
    const opacity =
      settings.opacity /
      100;

    /*
      Opacity by itself only needs one linear alpha pass.
      Avoid the x/y work required by vignette and grain.
    */
    if (
      !hasVignette &&
      !hasGrain
    ) {
      for (
        let index = 3;
        index < data.length;
        index += 4
      ) {
        data[index] =
          data[index] *
          opacity;
      }
    } else {
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
            (
              y * width +
              x
            ) *
            4;

          if (hasVignette) {
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

          if (hasGrain) {
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

          if (hasOpacity) {
            data[index + 3] =
              data[index + 3] *
              opacity;
          }
        }
      }
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

  A 3x3 box blur is separable. The previous implementation
  visited all nine neighbors for every RGB channel. This
  produces the same 3x3 average using a horizontal sum and
  then a vertical sum, cutting the hot-loop work sharply.
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

  output.set(source);

  if (
    width < 3 ||
    height < 3
  ) {
    return output;
  }

  const horizontal =
    new Uint16Array(
      source.length
    );

  const rowStride =
    width * 4;

  for (
    let y = 0;
    y < height;
    y++
  ) {
    const rowStart =
      y * rowStride;

    for (
      let x = 1;
      x < width - 1;
      x++
    ) {
      const index =
        rowStart +
        x * 4;

      const left =
        index - 4;

      const right =
        index + 4;

      horizontal[index] =
        source[left] +
        source[index] +
        source[right];

      horizontal[index + 1] =
        source[left + 1] +
        source[index + 1] +
        source[right + 1];

      horizontal[index + 2] =
        source[left + 2] +
        source[index + 2] +
        source[right + 2];
    }
  }

  for (
    let y = 1;
    y < height - 1;
    y++
  ) {
    const rowStart =
      y * rowStride;

    for (
      let x = 1;
      x < width - 1;
      x++
    ) {
      const index =
        rowStart +
        x * 4;

      const above =
        index -
        rowStride;

      const below =
        index +
        rowStride;

      output[index] =
        (
          horizontal[above] +
          horizontal[index] +
          horizontal[below]
        ) /
        9;

      output[index + 1] =
        (
          horizontal[above + 1] +
          horizontal[index + 1] +
          horizontal[below + 1]
        ) /
        9;

      output[index + 2] =
        (
          horizontal[above + 2] +
          horizontal[index + 2] +
          horizontal[below + 2]
        ) /
        9;
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
