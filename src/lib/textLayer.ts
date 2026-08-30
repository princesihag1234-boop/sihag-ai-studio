import type {
  TextFontWeight,
  TextLayerData,
} from "./layerTypes";

export const DEFAULT_TEXT_LAYER: TextLayerData = {
  text: "Your Text",
  fontSize: 96,
  fontFamily: "Arial",
  color: "#ffffff",
  textOpacity: 100,
  fontWeight: "700",
  italic: false,
  underline: false,
  strikethrough: false,
  textTransform: "none",
  align: "center",
  verticalAlign: "top",
  lineHeight: 1.15,
  letterSpacing: 0,
  wordSpacing: 0,
  paragraphSpacing: 0,
  strokeWidth: 0,
  strokeColor: "#000000",
  shadowEnabled: false,
  shadowColor: "#000000",
  shadowOpacity: 70,
  shadowBlur: 16,
  shadowX: 8,
  shadowY: 8,
  backgroundEnabled: false,
  backgroundColor: "#000000",
  backgroundOpacity: 70,
  backgroundPaddingX: 28,
  backgroundPaddingY: 18,
  backgroundRadius: 16,
  wrapEnabled: false,
  boxWidth: 600,
  fixedHeightEnabled: false,
  boxHeight: 400,
};

const FONT_WEIGHTS: TextFontWeight[] = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

function clamp(
  value: unknown,
  min: number,
  max: number,
  fallback: number
) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;
}

function normalizeHexColor(
  value: unknown,
  fallback: string
) {
  return typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

export function normalizeTextLayerData(
  value: Partial<TextLayerData> | null | undefined
): TextLayerData {
  const fontWeight =
    typeof value?.fontWeight === "string" &&
    FONT_WEIGHTS.includes(value.fontWeight as TextFontWeight)
      ? (value.fontWeight as TextFontWeight)
      : DEFAULT_TEXT_LAYER.fontWeight;

  const align =
    value?.align === "left" ||
    value?.align === "center" ||
    value?.align === "right" ||
    value?.align === "justify"
      ? value.align
      : DEFAULT_TEXT_LAYER.align;

  const verticalAlign =
    value?.verticalAlign === "top" ||
    value?.verticalAlign === "middle" ||
    value?.verticalAlign === "bottom"
      ? value.verticalAlign
      : DEFAULT_TEXT_LAYER.verticalAlign;

  const textTransform =
    value?.textTransform === "none" ||
    value?.textTransform === "uppercase" ||
    value?.textTransform === "lowercase" ||
    value?.textTransform === "capitalize"
      ? value.textTransform
      : DEFAULT_TEXT_LAYER.textTransform;

  return {
    text:
      typeof value?.text === "string"
        ? value.text
        : DEFAULT_TEXT_LAYER.text,

    fontSize: clamp(
      value?.fontSize,
      6,
      1000,
      DEFAULT_TEXT_LAYER.fontSize
    ),

    fontFamily:
      typeof value?.fontFamily === "string" &&
      value.fontFamily.trim()
        ? value.fontFamily.trim()
        : DEFAULT_TEXT_LAYER.fontFamily,

    color: normalizeHexColor(
      value?.color,
      DEFAULT_TEXT_LAYER.color
    ),

    textOpacity: clamp(
      value?.textOpacity,
      0,
      100,
      DEFAULT_TEXT_LAYER.textOpacity
    ),

    fontWeight,
    italic: value?.italic === true,
    underline: value?.underline === true,
    strikethrough: value?.strikethrough === true,
    textTransform,
    align,
    verticalAlign,

    lineHeight: clamp(
      value?.lineHeight,
      0.5,
      4,
      DEFAULT_TEXT_LAYER.lineHeight
    ),

    letterSpacing: clamp(
      value?.letterSpacing,
      -40,
      160,
      DEFAULT_TEXT_LAYER.letterSpacing
    ),

    wordSpacing: clamp(
      value?.wordSpacing,
      -40,
      240,
      DEFAULT_TEXT_LAYER.wordSpacing
    ),

    paragraphSpacing: clamp(
      value?.paragraphSpacing,
      0,
      400,
      DEFAULT_TEXT_LAYER.paragraphSpacing
    ),

    strokeWidth: clamp(
      value?.strokeWidth,
      0,
      40,
      DEFAULT_TEXT_LAYER.strokeWidth
    ),

    strokeColor: normalizeHexColor(
      value?.strokeColor,
      DEFAULT_TEXT_LAYER.strokeColor
    ),

    shadowEnabled: value?.shadowEnabled === true,

    shadowColor: normalizeHexColor(
      value?.shadowColor,
      DEFAULT_TEXT_LAYER.shadowColor
    ),

    shadowOpacity: clamp(
      value?.shadowOpacity,
      0,
      100,
      DEFAULT_TEXT_LAYER.shadowOpacity
    ),

    shadowBlur: clamp(
      value?.shadowBlur,
      0,
      200,
      DEFAULT_TEXT_LAYER.shadowBlur
    ),

    shadowX: clamp(
      value?.shadowX,
      -300,
      300,
      DEFAULT_TEXT_LAYER.shadowX
    ),

    shadowY: clamp(
      value?.shadowY,
      -300,
      300,
      DEFAULT_TEXT_LAYER.shadowY
    ),

    backgroundEnabled: value?.backgroundEnabled === true,

    backgroundColor: normalizeHexColor(
      value?.backgroundColor,
      DEFAULT_TEXT_LAYER.backgroundColor
    ),

    backgroundOpacity: clamp(
      value?.backgroundOpacity,
      0,
      100,
      DEFAULT_TEXT_LAYER.backgroundOpacity
    ),

    backgroundPaddingX: clamp(
      value?.backgroundPaddingX,
      0,
      300,
      DEFAULT_TEXT_LAYER.backgroundPaddingX
    ),

    backgroundPaddingY: clamp(
      value?.backgroundPaddingY,
      0,
      300,
      DEFAULT_TEXT_LAYER.backgroundPaddingY
    ),

    backgroundRadius: clamp(
      value?.backgroundRadius,
      0,
      300,
      DEFAULT_TEXT_LAYER.backgroundRadius
    ),

    wrapEnabled: value?.wrapEnabled === true,

    boxWidth: clamp(
      value?.boxWidth,
      80,
      5000,
      DEFAULT_TEXT_LAYER.boxWidth
    ),

    fixedHeightEnabled: value?.fixedHeightEnabled === true,

    boxHeight: clamp(
      value?.boxHeight,
      80,
      5000,
      DEFAULT_TEXT_LAYER.boxHeight
    ),
  };
}

function applyTextTransform(
  text: string,
  mode: TextLayerData["textTransform"]
) {
  if (mode === "uppercase") return text.toUpperCase();
  if (mode === "lowercase") return text.toLowerCase();
  if (mode === "capitalize") {
    return text.replace(/(^|\s)(\S)/g, (match) => match.toUpperCase());
  }
  return text;
}

function characterAdvance(
  context: CanvasRenderingContext2D,
  character: string,
  letterSpacing: number,
  wordSpacing: number,
  includeLetterSpacing: boolean
) {
  return (
    context.measureText(character).width +
    (character === " " ? wordSpacing : 0) +
    (includeLetterSpacing ? letterSpacing : 0)
  );
}

function measureSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  letterSpacing: number,
  wordSpacing: number
) {
  if (!text.length) return 0;

  let width = 0;
  for (let index = 0; index < text.length; index += 1) {
    width += characterAdvance(
      context,
      text[index],
      letterSpacing,
      wordSpacing,
      index < text.length - 1
    );
  }
  return Math.max(0, width);
}

function drawSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  startX: number,
  y: number,
  letterSpacing: number,
  wordSpacing: number,
  draw: (character: string, x: number, y: number) => void
) {
  let x = startX;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    draw(character, x, y);
    x += characterAdvance(
      context,
      character,
      letterSpacing,
      wordSpacing,
      index < text.length - 1
    );
  }
}

type RenderLine = {
  text: string;
  paragraphEnd: boolean;
  canJustify: boolean;
};

function wrapParagraph(
  context: CanvasRenderingContext2D,
  paragraph: string,
  maxWidth: number,
  letterSpacing: number,
  wordSpacing: number
) {
  if (!paragraph.length) return [""];

  const words = paragraph.split(/\s+/);
  const result: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const width = measureSpacedText(
      context,
      candidate,
      letterSpacing,
      wordSpacing
    );

    if (width <= maxWidth || !line) {
      line = candidate;
    } else {
      result.push(line);
      line = word;
    }
  }

  result.push(line);
  return result;
}

function buildRenderLines(
  context: CanvasRenderingContext2D,
  rawText: string,
  data: TextLayerData
): RenderLine[] {
  const paragraphs = rawText.split("\n");
  const result: RenderLine[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const lines = data.wrapEnabled
      ? wrapParagraph(
          context,
          paragraph,
          data.boxWidth,
          data.letterSpacing,
          data.wordSpacing
        )
      : [paragraph];

    lines.forEach((line, lineIndex) => {
      const isLastLine = lineIndex === lines.length - 1;
      result.push({
        text: line,
        paragraphEnd: isLastLine,
        canJustify:
          data.wrapEnabled &&
          !isLastLine &&
          line.trim().split(/\s+/).length > 1,
      });
    });

    if (paragraphIndex === paragraphs.length - 1 && !lines.length) {
      result.push({
        text: "",
        paragraphEnd: true,
        canJustify: false,
      });
    }
  });

  return result.length
    ? result
    : [{ text: "", paragraphEnd: true, canJustify: false }];
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.max(
    0,
    Math.min(radius, width / 2, height / 2)
  );

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function hexToRgba(
  hex: string,
  alpha: number
) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}

function drawJustifiedText(
  context: CanvasRenderingContext2D,
  text: string,
  startX: number,
  y: number,
  width: number,
  data: TextLayerData,
  draw: (character: string, x: number, y: number) => void
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    drawSpacedText(
      context,
      text,
      startX,
      y,
      data.letterSpacing,
      data.wordSpacing,
      draw
    );
    return;
  }

  const wordWidths = words.map((word) =>
    measureSpacedText(
      context,
      word,
      data.letterSpacing,
      0
    )
  );
  const totalWordWidth = wordWidths.reduce((sum, value) => sum + value, 0);
  const gap = Math.max(
    0,
    (width - totalWordWidth) / (words.length - 1)
  );

  let x = startX;
  words.forEach((word, index) => {
    drawSpacedText(
      context,
      word,
      x,
      y,
      data.letterSpacing,
      0,
      draw
    );
    x += wordWidths[index] + (index < words.length - 1 ? gap : 0);
  });
}

export function renderTextLayerToDataUrl(
  input: Partial<TextLayerData>
): string {
  const data = normalizeTextLayerData(input);

  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  if (!measureContext) return "";

  const fontStyle = data.italic ? "italic" : "normal";
  const font = `${fontStyle} ${data.fontWeight} ${data.fontSize}px ${data.fontFamily}`;
  measureContext.font = font;

  const transformedText = applyTextTransform(data.text, data.textTransform);
  const lines = buildRenderLines(measureContext, transformedText, data);

  const lineWidths = lines.map((line) =>
    measureSpacedText(
      measureContext,
      line.text,
      data.letterSpacing,
      data.wordSpacing
    )
  );

  const maxLineWidth = Math.max(1, ...lineWidths);
  const contentWidth = data.wrapEnabled ? data.boxWidth : maxLineWidth;
  const lineHeightPixels = Math.max(1, data.fontSize * data.lineHeight);

  let naturalTextHeight = 0;
  lines.forEach((line, index) => {
    naturalTextHeight += lineHeightPixels;
    if (line.paragraphEnd && index < lines.length - 1) {
      naturalTextHeight += data.paragraphSpacing;
    }
  });

  const contentHeight = data.fixedHeightEnabled
    ? Math.max(data.boxHeight, naturalTextHeight)
    : naturalTextHeight;

  const effectPadding = Math.ceil(
    Math.max(
      data.strokeWidth * 2,
      data.shadowEnabled
        ? data.shadowBlur * 2 + Math.abs(data.shadowX) + Math.abs(data.shadowY)
        : 0
    )
  );

  const textPadding = Math.max(24, Math.ceil(data.fontSize * 0.35));
  const backgroundExtraX = data.backgroundEnabled ? data.backgroundPaddingX : 0;
  const backgroundExtraY = data.backgroundEnabled ? data.backgroundPaddingY : 0;
  const paddingX = textPadding + effectPadding + backgroundExtraX;
  const paddingY = textPadding + effectPadding + backgroundExtraY;

  const width = Math.max(64, Math.ceil(contentWidth + paddingX * 2));
  const height = Math.max(64, Math.ceil(contentHeight + paddingY * 2));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";

  context.clearRect(0, 0, width, height);

  if (data.backgroundEnabled) {
    const backgroundX = Math.max(0, textPadding + effectPadding);
    const backgroundY = Math.max(0, textPadding + effectPadding);
    const backgroundWidth = Math.max(1, width - backgroundX * 2);
    const backgroundHeight = Math.max(1, height - backgroundY * 2);

    context.save();
    context.globalAlpha = data.backgroundOpacity / 100;
    context.fillStyle = data.backgroundColor;
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

  context.font = font;
  context.textBaseline = "top";
  context.textAlign = "left";
  context.lineJoin = "round";
  context.lineCap = "round";

  const verticalOffset =
    !data.fixedHeightEnabled || data.verticalAlign === "top"
      ? 0
      : data.verticalAlign === "middle"
        ? Math.max(0, (contentHeight - naturalTextHeight) / 2)
        : Math.max(0, contentHeight - naturalTextHeight);

  let y = paddingY + verticalOffset;

  lines.forEach((line, index) => {
    const lineText = line.text;
    const lineWidth = lineWidths[index];
    const justify = data.align === "justify" && line.canJustify;

    const startX =
      data.align === "right"
        ? paddingX + contentWidth - lineWidth
        : data.align === "center"
          ? paddingX + (contentWidth - lineWidth) / 2
          : paddingX;

    const visualLineWidth = justify ? contentWidth : lineWidth;

    context.save();
    context.globalAlpha = data.textOpacity / 100;

    if (data.shadowEnabled) {
      context.shadowColor = hexToRgba(
        data.shadowColor,
        data.shadowOpacity / 100
      );
      context.shadowBlur = data.shadowBlur;
      context.shadowOffsetX = data.shadowX;
      context.shadowOffsetY = data.shadowY;
    }

    const drawStroke = (character: string, x: number, drawY: number) => {
      context.strokeText(character, x, drawY);
    };
    const drawFill = (character: string, x: number, drawY: number) => {
      context.fillText(character, x, drawY);
    };

    if (lineText.length > 0 && data.strokeWidth > 0) {
      context.strokeStyle = data.strokeColor;
      context.lineWidth = data.strokeWidth * 2;
      if (justify) {
        drawJustifiedText(
          context,
          lineText,
          paddingX,
          y,
          contentWidth,
          data,
          drawStroke
        );
      } else {
        drawSpacedText(
          context,
          lineText,
          startX,
          y,
          data.letterSpacing,
          data.wordSpacing,
          drawStroke
        );
      }
    }

    if (lineText.length > 0) {
      context.fillStyle = data.color;
      if (justify) {
        drawJustifiedText(
          context,
          lineText,
          paddingX,
          y,
          contentWidth,
          data,
          drawFill
        );
      } else {
        drawSpacedText(
          context,
          lineText,
          startX,
          y,
          data.letterSpacing,
          data.wordSpacing,
          drawFill
        );
      }

      // Decorations are rendered as vector lines so they work with all fonts.
      context.shadowColor = "transparent";
      context.fillStyle = data.color;
      const decorationX = justify ? paddingX : startX;
      const decorationHeight = Math.max(1, data.fontSize * 0.045);

      if (data.underline) {
        context.fillRect(
          decorationX,
          y + data.fontSize * 1.03,
          visualLineWidth,
          decorationHeight
        );
      }

      if (data.strikethrough) {
        context.fillRect(
          decorationX,
          y + data.fontSize * 0.52,
          visualLineWidth,
          decorationHeight
        );
      }
    }

    context.restore();

    y += lineHeightPixels;
    if (line.paragraphEnd && index < lines.length - 1) {
      y += data.paragraphSpacing;
    }
  });

  return canvas.toDataURL("image/png");
}
