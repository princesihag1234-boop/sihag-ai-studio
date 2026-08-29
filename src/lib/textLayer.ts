import type {
  TextLayerData,
} from "./layerTypes";

export const DEFAULT_TEXT_LAYER:
  TextLayerData = {
    text:
      "Your Text",

    fontSize:
      96,

    fontFamily:
      "Arial",

    color:
      "#ffffff",

    fontWeight:
      "700",

    italic:
      false,

    align:
      "center",

    lineHeight:
      1.15,

    letterSpacing:
      0,

    strokeWidth:
      0,

    strokeColor:
      "#000000",

    shadowEnabled:
      false,

    shadowColor:
      "#000000",

    shadowBlur:
      16,

    shadowX:
      8,

    shadowY:
      8,

    backgroundEnabled:
      false,

    backgroundColor:
      "#000000",

    backgroundOpacity:
      70,

    backgroundPaddingX:
      28,

    backgroundPaddingY:
      18,

    backgroundRadius:
      16,

    wrapEnabled:
      false,

    boxWidth:
      600,
  };

function normalizeHexColor(
  value: unknown,
  fallback: string
) {
  return (
    typeof value ===
      "string" &&
    /^#[0-9a-fA-F]{6}$/.test(
      value
    )
      ? value
      : fallback
  );
}

export function normalizeTextLayerData(
  value:
    Partial<TextLayerData> | null | undefined
): TextLayerData {
  const fontWeight =
    value?.fontWeight;

  const align =
    value?.align;

  return {
    text:
      typeof value?.text ===
      "string"
        ? value.text
        : DEFAULT_TEXT_LAYER.text,

    fontSize:
      typeof value?.fontSize ===
      "number"
        ? Math.max(
            8,
            Math.min(
              600,
              value.fontSize
            )
          )
        : DEFAULT_TEXT_LAYER.fontSize,

    fontFamily:
      typeof value?.fontFamily ===
      "string" &&
      value.fontFamily.trim()
        ? value.fontFamily
        : DEFAULT_TEXT_LAYER.fontFamily,

    color:
      normalizeHexColor(
        value?.color,
        DEFAULT_TEXT_LAYER.color
      ),

    fontWeight:
      fontWeight === "400" ||
      fontWeight === "600" ||
      fontWeight === "700"
        ? fontWeight
        : DEFAULT_TEXT_LAYER.fontWeight,

    italic:
      value?.italic ===
      true,

    align:
      align === "left" ||
      align === "right" ||
      align === "center"
        ? align
        : DEFAULT_TEXT_LAYER.align,

    lineHeight:
      typeof value?.lineHeight ===
      "number"
        ? Math.max(
            0.8,
            Math.min(
              3,
              value.lineHeight
            )
          )
        : DEFAULT_TEXT_LAYER.lineHeight,

    letterSpacing:
      typeof value?.letterSpacing ===
      "number"
        ? Math.max(
            -20,
            Math.min(
              80,
              value.letterSpacing
            )
          )
        : DEFAULT_TEXT_LAYER.letterSpacing,

    strokeWidth:
      typeof value?.strokeWidth ===
      "number"
        ? Math.max(
            0,
            Math.min(
              30,
              value.strokeWidth
            )
          )
        : DEFAULT_TEXT_LAYER.strokeWidth,

    strokeColor:
      normalizeHexColor(
        value?.strokeColor,
        DEFAULT_TEXT_LAYER.strokeColor
      ),

    shadowEnabled:
      value?.shadowEnabled ===
      true,

    shadowColor:
      normalizeHexColor(
        value?.shadowColor,
        DEFAULT_TEXT_LAYER.shadowColor
      ),

    shadowBlur:
      typeof value?.shadowBlur ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              value.shadowBlur
            )
          )
        : DEFAULT_TEXT_LAYER.shadowBlur,

    shadowX:
      typeof value?.shadowX ===
      "number"
        ? Math.max(
            -100,
            Math.min(
              100,
              value.shadowX
            )
          )
        : DEFAULT_TEXT_LAYER.shadowX,

    shadowY:
      typeof value?.shadowY ===
      "number"
        ? Math.max(
            -100,
            Math.min(
              100,
              value.shadowY
            )
          )
        : DEFAULT_TEXT_LAYER.shadowY,

    backgroundEnabled:
      value?.backgroundEnabled ===
      true,

    backgroundColor:
      normalizeHexColor(
        value?.backgroundColor,
        DEFAULT_TEXT_LAYER.backgroundColor
      ),

    backgroundOpacity:
      typeof value?.backgroundOpacity ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              value.backgroundOpacity
            )
          )
        : DEFAULT_TEXT_LAYER.backgroundOpacity,

    backgroundPaddingX:
      typeof value?.backgroundPaddingX ===
      "number"
        ? Math.max(
            0,
            Math.min(
              200,
              value.backgroundPaddingX
            )
          )
        : DEFAULT_TEXT_LAYER.backgroundPaddingX,

    backgroundPaddingY:
      typeof value?.backgroundPaddingY ===
      "number"
        ? Math.max(
            0,
            Math.min(
              200,
              value.backgroundPaddingY
            )
          )
        : DEFAULT_TEXT_LAYER.backgroundPaddingY,

    backgroundRadius:
      typeof value?.backgroundRadius ===
      "number"
        ? Math.max(
            0,
            Math.min(
              200,
              value.backgroundRadius
            )
          )
        : DEFAULT_TEXT_LAYER.backgroundRadius,

    wrapEnabled:
      value?.wrapEnabled ===
      true,

    boxWidth:
      typeof value?.boxWidth ===
      "number"
        ? Math.max(
            80,
            Math.min(
              3000,
              value.boxWidth
            )
          )
        : DEFAULT_TEXT_LAYER.boxWidth,
  };
}

function measureSpacedText(
  context:
    CanvasRenderingContext2D,
  text: string,
  letterSpacing: number
) {
  if (
    text.length === 0
  ) {
    return context.measureText(
      " "
    ).width;
  }

  let width =
    0;

  for (
    let index = 0;
    index <
      text.length;
    index += 1
  ) {
    width +=
      context.measureText(
        text[index]
      ).width;

    if (
      index <
      text.length - 1
    ) {
      width +=
        letterSpacing;
    }
  }

  return Math.max(
    1,
    width
  );
}

function drawSpacedText(
  context:
    CanvasRenderingContext2D,
  text: string,
  startX: number,
  y: number,
  letterSpacing: number,
  draw:
    (
      character: string,
      x: number,
      y: number
    ) => void
) {
  let x =
    startX;

  for (
    let index = 0;
    index <
      text.length;
    index += 1
  ) {
    const character =
      text[index];

    draw(
      character,
      x,
      y
    );

    x +=
      context.measureText(
        character
      ).width;

    if (
      index <
      text.length - 1
    ) {
      x +=
        letterSpacing;
    }
  }
}

function wrapTextLines(
  context:
    CanvasRenderingContext2D,
  rawLines: string[],
  maxWidth: number,
  letterSpacing: number
) {
  const result: string[] =
    [];

  for (
    const paragraph of
      rawLines
  ) {
    if (
      paragraph.length ===
      0
    ) {
      result.push(
        ""
      );

      continue;
    }

    const words =
      paragraph.split(
        /\s+/
      );

    let line =
      "";

    for (
      const word of words
    ) {
      const candidate =
        line
          ? `${line} ${word}`
          : word;

      const candidateWidth =
        measureSpacedText(
          context,
          candidate,
          letterSpacing
        );

      if (
        candidateWidth <=
          maxWidth ||
        !line
      ) {
        line =
          candidate;
      } else {
        result.push(
          line
        );

        line =
          word;
      }
    }

    result.push(
      line
    );
  }

  return result.length > 0
    ? result
    : [""];
}

function drawRoundedRect(
  context:
    CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius =
    Math.max(
      0,
      Math.min(
        radius,
        width / 2,
        height / 2
      )
    );

  context.beginPath();

  context.moveTo(
    x + safeRadius,
    y
  );

  context.lineTo(
    x + width -
      safeRadius,
    y
  );

  context.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + safeRadius
  );

  context.lineTo(
    x + width,
    y + height -
      safeRadius
  );

  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width -
      safeRadius,
    y + height
  );

  context.lineTo(
    x + safeRadius,
    y + height
  );

  context.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height -
      safeRadius
  );

  context.lineTo(
    x,
    y + safeRadius
  );

  context.quadraticCurveTo(
    x,
    y,
    x + safeRadius,
    y
  );

  context.closePath();
}

export function renderTextLayerToDataUrl(
  input:
    Partial<TextLayerData>
): string {
  const data =
    normalizeTextLayerData(
      input
    );

  const measureCanvas =
    document.createElement(
      "canvas"
    );

  const measureContext =
    measureCanvas.getContext(
      "2d"
    );

  if (!measureContext) {
    return "";
  }

  const fontStyle =
    data.italic
      ? "italic"
      : "normal";

  const font =
    `${fontStyle} ${data.fontWeight} ${data.fontSize}px ${data.fontFamily}`;

  measureContext.font =
    font;

  const rawLines =
    data.text.split(
      "\n"
    );

  const lines =
    data.wrapEnabled
      ? wrapTextLines(
          measureContext,
          rawLines,
          data.boxWidth,
          data.letterSpacing
        )
      : rawLines.length > 0
        ? rawLines
        : [""];

  const lineWidths =
    lines.map(
      (line) =>
        measureSpacedText(
          measureContext,
          line.length > 0
            ? line
            : " ",
          data.letterSpacing
        )
    );

  const maxLineWidth =
    Math.max(
      1,
      ...lineWidths
    );

  const contentWidth =
    data.wrapEnabled
      ? data.boxWidth
      : maxLineWidth;

  const effectPadding =
    Math.ceil(
      Math.max(
        data.strokeWidth *
          2,

        data.shadowEnabled
          ? data.shadowBlur *
              2 +
              Math.abs(
                data.shadowX
              ) +
              Math.abs(
                data.shadowY
              )
          : 0
      )
    );

  const textPadding =
    Math.max(
      24,
      Math.ceil(
        data.fontSize *
          0.35
      )
    );

  const backgroundExtraX =
    data.backgroundEnabled
      ? data.backgroundPaddingX
      : 0;

  const backgroundExtraY =
    data.backgroundEnabled
      ? data.backgroundPaddingY
      : 0;

  const paddingX =
    textPadding +
    effectPadding +
    backgroundExtraX;

  const paddingY =
    textPadding +
    effectPadding +
    backgroundExtraY;

  const lineHeightPixels =
    Math.max(
      1,
      data.fontSize *
      data.lineHeight
    );

  const width =
    Math.max(
      64,
      Math.ceil(
        contentWidth +
        paddingX *
        2
      )
    );

  const height =
    Math.max(
      64,
      Math.ceil(
        lineHeightPixels *
          lines.length +
        paddingY *
          2
      )
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return "";
  }

  context.clearRect(
    0,
    0,
    width,
    height
  );

  if (
    data.backgroundEnabled
  ) {
    const backgroundX =
      Math.max(
        0,
        textPadding +
        effectPadding
      );

    const backgroundY =
      Math.max(
        0,
        textPadding +
        effectPadding
      );

    const backgroundWidth =
      Math.max(
        1,
        width -
        backgroundX *
          2
      );

    const backgroundHeight =
      Math.max(
        1,
        height -
        backgroundY *
          2
      );

    context.save();

    context.globalAlpha =
      data.backgroundOpacity /
      100;

    context.fillStyle =
      data.backgroundColor;

    drawRoundedRect(
      context,
      backgroundX,
      backgroundY,
      backgroundWidth,
      backgroundHeight,
      data.backgroundRadius
    );

    context.fill();

    context.restore();
  }

  context.font =
    font;

  context.textBaseline =
    "top";

  context.textAlign =
    "left";

  context.lineJoin =
    "round";

  context.lineCap =
    "round";

  if (
    data.shadowEnabled
  ) {
    context.shadowColor =
      data.shadowColor;

    context.shadowBlur =
      data.shadowBlur;

    context.shadowOffsetX =
      data.shadowX;

    context.shadowOffsetY =
      data.shadowY;
  }

  lines.forEach(
    (line, index) => {
      const drawLine =
        line.length > 0
          ? line
          : " ";

      const lineWidth =
        measureSpacedText(
          context,
          drawLine,
          data.letterSpacing
        );

      const startX =
        data.align === "left"
          ? paddingX
          : data.align ===
              "right"
            ? paddingX +
              contentWidth -
              lineWidth
            : paddingX +
              (
                contentWidth -
                lineWidth
              ) /
              2;

      const y =
        paddingY +
        index *
          lineHeightPixels;

      if (
        data.strokeWidth >
        0
      ) {
        context.strokeStyle =
          data.strokeColor;

        context.lineWidth =
          data.strokeWidth *
          2;

        drawSpacedText(
          context,
          drawLine,
          startX,
          y,
          data.letterSpacing,
          (
            character,
            x,
            drawY
          ) => {
            context.strokeText(
              character,
              x,
              drawY
            );
          }
        );
      }

      context.fillStyle =
        data.color;

      drawSpacedText(
        context,
        drawLine,
        startX,
        y,
        data.letterSpacing,
        (
          character,
          x,
          drawY
        ) => {
          context.fillText(
            character,
            x,
            drawY
          );
        }
      );
    }
  );

  return canvas.toDataURL(
    "image/png"
  );
}
