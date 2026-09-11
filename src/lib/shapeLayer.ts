import type {
  ShapeLayerData,
} from "./layerTypes";

export const DEFAULT_SHAPE_LAYER:
  ShapeLayerData = {
    shapeType:
      "rectangle",

    width:
      520,

    height:
      320,

    fillEnabled:
      true,

    fillMode:
      "solid",

    fillColor:
      "#6366f1",

    fillOpacity:
      100,

    gradientColor1:
      "#6366f1",

    gradientColor2:
      "#ec4899",

    gradientAngle:
      45,

    strokeEnabled:
      false,

    strokeColor:
      "#ffffff",

    strokeWidth:
      6,

    strokeOpacity:
      100,

    strokeStyle:
      "solid",

    cornerRadius:
      48,

    shadowEnabled:
      false,

    shadowColor:
      "#000000",

    shadowOpacity:
      45,

    shadowBlur:
      24,

    shadowX:
      10,

    shadowY:
      10,
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

function normalizeFiniteNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

export function normalizeShapeLayerData(
  value:
    Partial<ShapeLayerData> | null | undefined
): ShapeLayerData {
  const shapeType =
    value?.shapeType;

  const normalizedShapeType =
    shapeType ===
      "rounded-rectangle" ||
    shapeType ===
      "ellipse" ||
    shapeType ===
      "triangle" ||
    shapeType ===
      "diamond" ||
    shapeType ===
      "hexagon" ||
    shapeType ===
      "star"
      ? shapeType
      : "rectangle";

  const fillMode =
    value?.fillMode ===
      "linear-gradient" ||
    value?.fillMode ===
      "radial-gradient"
      ? value.fillMode
      : "solid";

  const gradientAngleRaw =
    normalizeFiniteNumber(
      value?.gradientAngle,
      DEFAULT_SHAPE_LAYER.gradientAngle,
      -100000,
      100000
    );

  const gradientAngle =
    (
      (
        gradientAngleRaw %
        360
      ) +
      360
    ) %
    360;

  return {
    shapeType:
      normalizedShapeType,

    width:
      normalizeFiniteNumber(
        value?.width,
        DEFAULT_SHAPE_LAYER.width,
        20,
        3000
      ),

    height:
      normalizeFiniteNumber(
        value?.height,
        DEFAULT_SHAPE_LAYER.height,
        20,
        3000
      ),

    fillEnabled:
      value?.fillEnabled !==
      false,

    fillMode,

    fillColor:
      normalizeHexColor(
        value?.fillColor,
        DEFAULT_SHAPE_LAYER.fillColor
      ),

    fillOpacity:
      normalizeFiniteNumber(
        value?.fillOpacity,
        DEFAULT_SHAPE_LAYER.fillOpacity,
        0,
        100
      ),

    gradientColor1:
      normalizeHexColor(
        value?.gradientColor1,
        DEFAULT_SHAPE_LAYER.gradientColor1
      ),

    gradientColor2:
      normalizeHexColor(
        value?.gradientColor2,
        DEFAULT_SHAPE_LAYER.gradientColor2
      ),

    gradientAngle,

    strokeEnabled:
      value?.strokeEnabled ===
      true,

    strokeColor:
      normalizeHexColor(
        value?.strokeColor,
        DEFAULT_SHAPE_LAYER.strokeColor
      ),

    strokeWidth:
      normalizeFiniteNumber(
        value?.strokeWidth,
        DEFAULT_SHAPE_LAYER.strokeWidth,
        0,
        100
      ),

    strokeOpacity:
      normalizeFiniteNumber(
        value?.strokeOpacity,
        DEFAULT_SHAPE_LAYER.strokeOpacity,
        0,
        100
      ),

    strokeStyle:
      value?.strokeStyle ===
        "dashed" ||
      value?.strokeStyle ===
        "dotted"
        ? value.strokeStyle
        : "solid",

    cornerRadius:
      normalizeFiniteNumber(
        value?.cornerRadius,
        DEFAULT_SHAPE_LAYER.cornerRadius,
        0,
        1000
      ),

    shadowEnabled:
      value?.shadowEnabled ===
      true,

    shadowColor:
      normalizeHexColor(
        value?.shadowColor,
        DEFAULT_SHAPE_LAYER.shadowColor
      ),

    shadowOpacity:
      normalizeFiniteNumber(
        value?.shadowOpacity,
        DEFAULT_SHAPE_LAYER.shadowOpacity,
        0,
        100
      ),

    shadowBlur:
      normalizeFiniteNumber(
        value?.shadowBlur,
        DEFAULT_SHAPE_LAYER.shadowBlur,
        0,
        200
      ),

    shadowX:
      normalizeFiniteNumber(
        value?.shadowX,
        DEFAULT_SHAPE_LAYER.shadowX,
        -200,
        200
      ),

    shadowY:
      normalizeFiniteNumber(
        value?.shadowY,
        DEFAULT_SHAPE_LAYER.shadowY,
        -200,
        200
      ),
  };
}

function roundedRectPath(
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
}

function buildShapePath(
  context:
    CanvasRenderingContext2D,
  data: ShapeLayerData,
  x: number,
  y: number,
  width: number,
  height: number
) {
  context.beginPath();

  if (
    data.shapeType ===
    "ellipse"
  ) {
    context.ellipse(
      x +
        width / 2,
      y +
        height / 2,
      width / 2,
      height / 2,
      0,
      0,
      Math.PI *
        2
    );

    context.closePath();
    return;
  }

  if (
    data.shapeType ===
    "rounded-rectangle"
  ) {
    roundedRectPath(
      context,
      x,
      y,
      width,
      height,
      data.cornerRadius
    );

    context.closePath();
    return;
  }

  if (
    data.shapeType ===
    "triangle"
  ) {
    context.moveTo(
      x +
        width / 2,
      y
    );

    context.lineTo(
      x + width,
      y + height
    );

    context.lineTo(
      x,
      y + height
    );

    context.closePath();
    return;
  }

  if (
    data.shapeType ===
    "diamond"
  ) {
    context.moveTo(
      x +
        width / 2,
      y
    );

    context.lineTo(
      x + width,
      y +
        height / 2
    );

    context.lineTo(
      x +
        width / 2,
      y + height
    );

    context.lineTo(
      x,
      y +
        height / 2
    );

    context.closePath();
    return;
  }

  if (
    data.shapeType ===
    "hexagon"
  ) {
    const inset =
      width *
      0.25;

    context.moveTo(
      x + inset,
      y
    );

    context.lineTo(
      x + width -
        inset,
      y
    );

    context.lineTo(
      x + width,
      y +
        height / 2
    );

    context.lineTo(
      x + width -
        inset,
      y + height
    );

    context.lineTo(
      x + inset,
      y + height
    );

    context.lineTo(
      x,
      y +
        height / 2
    );

    context.closePath();
    return;
  }

  if (
    data.shapeType ===
    "star"
  ) {
    const centerX =
      x +
      width / 2;

    const centerY =
      y +
      height / 2;

    const outerRadiusX =
      width / 2;

    const outerRadiusY =
      height / 2;

    const innerFactor =
      0.45;

    for (
      let index = 0;
      index < 10;
      index += 1
    ) {
      const angle =
        -Math.PI / 2 +
        index *
          Math.PI / 5;

      const factor =
        index % 2 === 0
          ? 1
          : innerFactor;

      const pointX =
        centerX +
        Math.cos(angle) *
          outerRadiusX *
          factor;

      const pointY =
        centerY +
        Math.sin(angle) *
          outerRadiusY *
          factor;

      if (
        index === 0
      ) {
        context.moveTo(
          pointX,
          pointY
        );
      } else {
        context.lineTo(
          pointX,
          pointY
        );
      }
    }

    context.closePath();
    return;
  }

  context.rect(
    x,
    y,
    width,
    height
  );

  context.closePath();
}

function createLinearGradient(
  context:
    CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angleDegrees: number,
  color1: string,
  color2: string
) {
  const angle =
    (
      angleDegrees *
      Math.PI
    ) /
    180;

  const directionX =
    Math.cos(
      angle
    );

  const directionY =
    Math.sin(
      angle
    );

  const centerX =
    x +
    width / 2;

  const centerY =
    y +
    height / 2;

  const halfLength =
    Math.abs(
      directionX
    ) *
      width /
      2 +
    Math.abs(
      directionY
    ) *
      height /
      2;

  const gradient =
    context.createLinearGradient(
      centerX -
        directionX *
        halfLength,
      centerY -
        directionY *
        halfLength,
      centerX +
        directionX *
        halfLength,
      centerY +
        directionY *
        halfLength
    );

  gradient.addColorStop(
    0,
    color1
  );

  gradient.addColorStop(
    1,
    color2
  );

  return gradient;
}

function createRadialGradient(
  context:
    CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color1: string,
  color2: string
) {
  const centerX =
    x +
    width / 2;

  const centerY =
    y +
    height / 2;

  const radius =
    Math.max(
      1,
      Math.hypot(
        width / 2,
        height / 2
      )
    );

  const gradient =
    context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

  gradient.addColorStop(
    0,
    color1
  );

  gradient.addColorStop(
    1,
    color2
  );

  return gradient;
}

export function renderShapeLayerToDataUrl(
  input:
    Partial<ShapeLayerData>
): string {
  const data =
    normalizeShapeLayerData(
      input
    );

  const strokePadding =
    data.strokeEnabled
      ? Math.ceil(
          data.strokeWidth /
          2 +
          4
        )
      : 4;

  const shadowPadding =
    data.shadowEnabled
      ? Math.ceil(
          data.shadowBlur *
            2 +
          Math.max(
            Math.abs(
              data.shadowX
            ),
            Math.abs(
              data.shadowY
            )
          )
        )
      : 0;

  const padding =
    Math.max(
      strokePadding,
      shadowPadding +
        4
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    Math.max(
      1,
      Math.ceil(
        data.width +
        padding *
          2
      )
    );

  canvas.height =
    Math.max(
      1,
      Math.ceil(
        data.height +
        padding *
          2
      )
    );

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return "";
  }

  context.imageSmoothingEnabled =
    true;

  context.imageSmoothingQuality =
    "high";

  const x =
    padding;

  const y =
    padding;

  const width =
    data.width;

  const height =
    data.height;

  buildShapePath(
    context,
    data,
    x,
    y,
    width,
    height
  );

  if (
    data.shadowEnabled
  ) {
    context.save();

    context.globalAlpha =
      data.shadowOpacity /
      100;

    context.shadowColor =
      data.shadowColor;

    context.shadowBlur =
      data.shadowBlur;

    context.shadowOffsetX =
      data.shadowX;

    context.shadowOffsetY =
      data.shadowY;

    context.fillStyle =
      "#000000";

    context.fill();

    context.restore();

    context.save();

    context.globalCompositeOperation =
      "destination-out";

    context.fillStyle =
      "#000000";

    context.fill();

    context.restore();
  }

  if (
    data.fillEnabled
  ) {
    context.save();

    context.globalAlpha =
      data.fillOpacity /
      100;

    if (
      data.fillMode ===
      "linear-gradient"
    ) {
      context.fillStyle =
        createLinearGradient(
          context,
          x,
          y,
          width,
          height,
          data.gradientAngle,
          data.gradientColor1,
          data.gradientColor2
        );
    } else if (
      data.fillMode ===
      "radial-gradient"
    ) {
      context.fillStyle =
        createRadialGradient(
          context,
          x,
          y,
          width,
          height,
          data.gradientColor1,
          data.gradientColor2
        );
    } else {
      context.fillStyle =
        data.fillColor;
    }

    context.fill();

    context.restore();
  }

  if (
    data.strokeEnabled &&
    data.strokeWidth >
      0
  ) {
    context.save();

    context.globalAlpha =
      data.strokeOpacity /
      100;

    context.strokeStyle =
      data.strokeColor;

    context.lineWidth =
      data.strokeWidth;

    context.lineJoin =
      "round";

    context.lineCap =
      "round";

    if (
      data.strokeStyle ===
      "dashed"
    ) {
      context.setLineDash([
        Math.max(
          8,
          data.strokeWidth *
            3
        ),
        Math.max(
          6,
          data.strokeWidth *
            2
        ),
      ]);
    } else if (
      data.strokeStyle ===
      "dotted"
    ) {
      context.setLineDash([
        0.1,
        Math.max(
          5,
          data.strokeWidth *
            2.3
        ),
      ]);
    } else {
      context.setLineDash(
        []
      );
    }

    context.stroke();

    context.restore();
  }

  return canvas.toDataURL(
    "image/png"
  );
}
