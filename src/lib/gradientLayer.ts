import type {
  GradientLayerData,
  GradientStop,
} from "./layerTypes";

export const DEFAULT_GRADIENT_STOPS: GradientStop[] = [
  {
    position: 0,
    color: "#6366f1",
    opacity: 100,
  },
  {
    position: 100,
    color: "#ec4899",
    opacity: 100,
  },
];

export const DEFAULT_GRADIENT_LAYER: GradientLayerData = {
  gradientType: "linear",
  width: 1600,
  height: 1000,
  angle: 45,
  centerX: 50,
  centerY: 50,
  scale: 100,
  stops: DEFAULT_GRADIENT_STOPS.map((stop) => ({ ...stop })),
};

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

function normalizeFiniteNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return clamp(
    value,
    minimum,
    maximum
  );
}

function normalizeHexColor(
  value: unknown,
  fallback: string
) {
  return (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : fallback
  );
}

function normalizeAngle(
  value: unknown,
  fallback: number
) {
  const finite =
    normalizeFiniteNumber(
      value,
      fallback,
      -100000,
      100000
    );

  return (
    (
      finite %
      360
    ) +
    360
  ) % 360;
}

function normalizeGradientStop(
  value: Partial<GradientStop> | null | undefined,
  fallback: GradientStop
): GradientStop {
  return {
    position:
      normalizeFiniteNumber(
        value?.position,
        fallback.position,
        0,
        100
      ),

    color:
      normalizeHexColor(
        value?.color,
        fallback.color
      ),

    opacity:
      normalizeFiniteNumber(
        value?.opacity,
        fallback.opacity,
        0,
        100
      ),
  };
}

export function normalizeGradientStops(
  value: unknown
): GradientStop[] {
  if (!Array.isArray(value)) {
    return DEFAULT_GRADIENT_STOPS.map(
      (stop) => ({ ...stop })
    );
  }

  const normalized =
    value
      .slice(0, 8)
      .map((item, index) =>
        normalizeGradientStop(
          item &&
          typeof item === "object"
            ? item as Partial<GradientStop>
            : null,
          DEFAULT_GRADIENT_STOPS[
            Math.min(
              index,
              DEFAULT_GRADIENT_STOPS.length - 1
            )
          ] ??
          DEFAULT_GRADIENT_STOPS[0]
        )
      )
      .sort(
        (a, b) =>
          a.position -
          b.position
      );

  if (
    normalized.length >= 2
  ) {
    return normalized;
  }

  return DEFAULT_GRADIENT_STOPS.map(
    (stop) => ({ ...stop })
  );
}

export function normalizeGradientLayerData(
  value:
    Partial<GradientLayerData> | null | undefined
): GradientLayerData {
  const gradientType =
    value?.gradientType === "radial" ||
    value?.gradientType === "conic"
      ? value.gradientType
      : "linear";

  return {
    gradientType,

    width:
      normalizeFiniteNumber(
        value?.width,
        DEFAULT_GRADIENT_LAYER.width,
        20,
        6000
      ),

    height:
      normalizeFiniteNumber(
        value?.height,
        DEFAULT_GRADIENT_LAYER.height,
        20,
        6000
      ),

    angle:
      normalizeAngle(
        value?.angle,
        DEFAULT_GRADIENT_LAYER.angle
      ),

    centerX:
      normalizeFiniteNumber(
        value?.centerX,
        DEFAULT_GRADIENT_LAYER.centerX,
        0,
        100
      ),

    centerY:
      normalizeFiniteNumber(
        value?.centerY,
        DEFAULT_GRADIENT_LAYER.centerY,
        0,
        100
      ),

    scale:
      normalizeFiniteNumber(
        value?.scale,
        DEFAULT_GRADIENT_LAYER.scale,
        10,
        300
      ),

    stops:
      normalizeGradientStops(
        value?.stops
      ),
  };
}

function hexToRgba(
  color: string,
  opacity: number
) {
  const normalized =
    normalizeHexColor(
      color,
      "#000000"
    );

  const red =
    Number.parseInt(
      normalized.slice(1, 3),
      16
    );

  const green =
    Number.parseInt(
      normalized.slice(3, 5),
      16
    );

  const blue =
    Number.parseInt(
      normalized.slice(5, 7),
      16
    );

  const alpha =
    clamp(
      opacity,
      0,
      100
    ) /
    100;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function addStops(
  gradient: CanvasGradient,
  stops: GradientStop[]
) {
  stops.forEach((stop) => {
    gradient.addColorStop(
      clamp(
        stop.position /
          100,
        0,
        1
      ),
      hexToRgba(
        stop.color,
        stop.opacity
      )
    );
  });
}

export function renderGradientLayerToDataUrl(
  value:
    Partial<GradientLayerData> | null | undefined
) {
  if (
    typeof document === "undefined"
  ) {
    return "";
  }

  const data =
    normalizeGradientLayerData(
      value
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    Math.max(
      1,
      Math.round(
        data.width
      )
    );

  canvas.height =
    Math.max(
      1,
      Math.round(
        data.height
      )
    );

  const context =
    canvas.getContext("2d");

  if (!context) {
    return "";
  }

  context.imageSmoothingEnabled =
    true;

  context.imageSmoothingQuality =
    "high";

  const centerX =
    canvas.width *
    (data.centerX /
      100);

  const centerY =
    canvas.height *
    (data.centerY /
      100);

  let gradient:
    CanvasGradient;

  if (
    data.gradientType ===
    "radial"
  ) {
    const radius =
      Math.max(
        canvas.width,
        canvas.height
      ) *
      0.5 *
      (data.scale /
        100);

    gradient =
      context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(
          1,
          radius
        )
      );
  } else if (
    data.gradientType ===
    "conic"
  ) {
    gradient =
      context.createConicGradient(
        (
          (
            data.angle -
            90
          ) *
          Math.PI
        ) /
          180,
        centerX,
        centerY
      );
  } else {
    const radians =
      (
        data.angle *
        Math.PI
      ) /
      180;

    const directionX =
      Math.cos(
        radians
      );

    const directionY =
      Math.sin(
        radians
      );

    const length =
      Math.hypot(
        canvas.width,
        canvas.height
      ) *
      (data.scale /
        100);

    const half =
      Math.max(
        1,
        length /
          2
      );

    gradient =
      context.createLinearGradient(
        centerX -
          directionX *
            half,
        centerY -
          directionY *
            half,
        centerX +
          directionX *
            half,
        centerY +
          directionY *
            half
      );
  }

  addStops(
    gradient,
    data.stops
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL(
    "image/png"
  );
}
