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

export function normalizeShapeLayerData(
  value:
    Partial<ShapeLayerData> | null | undefined
): ShapeLayerData {
  const shapeType =
    value?.shapeType;

  return {
    shapeType:
      shapeType ===
        "ellipse" ||
      shapeType ===
        "rounded-rectangle"
        ? shapeType
        : "rectangle",

    width:
      typeof value?.width ===
      "number"
        ? Math.max(
            20,
            Math.min(
              3000,
              value.width
            )
          )
        : DEFAULT_SHAPE_LAYER.width,

    height:
      typeof value?.height ===
      "number"
        ? Math.max(
            20,
            Math.min(
              3000,
              value.height
            )
          )
        : DEFAULT_SHAPE_LAYER.height,

    fillEnabled:
      value?.fillEnabled !==
      false,

    fillMode:
      value?.fillMode ===
      "linear-gradient"
        ? "linear-gradient"
        : "solid",

    fillColor:
      normalizeHexColor(
        value?.fillColor,
        DEFAULT_SHAPE_LAYER.fillColor
      ),

    fillOpacity:
      typeof value?.fillOpacity ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              value.fillOpacity
            )
          )
        : DEFAULT_SHAPE_LAYER.fillOpacity,

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

    gradientAngle:
      typeof value?.gradientAngle ===
      "number"
        ? (
            (
              value.gradientAngle %
              360
            ) +
            360
          ) %
          360
        : DEFAULT_SHAPE_LAYER.gradientAngle,

    strokeEnabled:
      value?.strokeEnabled ===
      true,

    strokeColor:
      normalizeHexColor(
        value?.strokeColor,
        DEFAULT_SHAPE_LAYER.strokeColor
      ),

    strokeWidth:
      typeof value?.strokeWidth ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              value.strokeWidth
            )
          )
        : DEFAULT_SHAPE_LAYER.strokeWidth,

    strokeOpacity:
      typeof value?.strokeOpacity ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              value.strokeOpacity
            )
          )
        : DEFAULT_SHAPE_LAYER.strokeOpacity,

    strokeStyle:
      value?.strokeStyle ===
        "dashed" ||
      value?.strokeStyle ===
        "dotted"
        ? value.strokeStyle
        : "solid",

    cornerRadius:
      typeof value?.cornerRadius ===
      "number"
        ? Math.max(
            0,
            Math.min(
              1000,
              value.cornerRadius
            )
          )
        : DEFAULT_SHAPE_LAYER.cornerRadius,

    shadowEnabled:
      value?.shadowEnabled ===
      true,

    shadowColor:
      normalizeHexColor(
        value?.shadowColor,
        DEFAULT_SHAPE_LAYER.shadowColor
      ),

    shadowOpacity:
      typeof value?.shadowOpacity ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              value.shadowOpacity
            )
          )
        : DEFAULT_SHAPE_LAYER.shadowOpacity,

    shadowBlur:
      typeof value?.shadowBlur ===
      "number"
        ? Math.max(
            0,
            Math.min(
              200,
              value.shadowBlur
            )
          )
        : DEFAULT_SHAPE_LAYER.shadowBlur,

    shadowX:
      typeof value?.shadowX ===
      "number"
        ? Math.max(
            -200,
            Math.min(
              200,
              value.shadowX
            )
          )
        : DEFAULT_SHAPE_LAYER.shadowX,

    shadowY:
      typeof value?.shadowY ===
      "number"
        ? Math.max(
            -200,
            Math.min(
              200,
              value.shadowY
            )
          )
        : DEFAULT_SHAPE_LAYER.shadowY,
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

  /*
    Project the rectangle onto the gradient
    direction so the gradient reaches fully
    across the shape at any angle.
  */

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

  const x =
    padding;

  const y =
    padding;

  const width =
    data.width;

  const height =
    data.height;

  if (
    data.shapeType ===
    "ellipse"
  ) {
    context.beginPath();

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
  } else if (
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
  } else {
    context.beginPath();

    context.rect(
      x,
      y,
      width,
      height
    );
  }

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

    /*
      Draw an opaque copy of the shape only to
      generate its shadow. destination-out then
      removes the temporary copy itself, leaving
      just the shadow pixels behind.
    */

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

    context.fillStyle =
      data.fillMode ===
      "linear-gradient"
        ? createLinearGradient(
            context,
            x,
            y,
            width,
            height,
            data.gradientAngle,
            data.gradientColor1,
            data.gradientColor2
          )
        : data.fillColor;

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
