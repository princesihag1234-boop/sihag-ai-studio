import type {
  Settings,
} from "./imageEngine";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "darken"
  | "lighten"
  | "color-dodge";


export type TextAlign =
  | "left"
  | "center"
  | "right";

export type TextLayerData = {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight:
    | "400"
    | "600"
    | "700";
  italic: boolean;
  align: TextAlign;
  lineHeight: number;

  letterSpacing: number;

  strokeWidth: number;
  strokeColor: string;

  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;

  backgroundEnabled: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundPaddingX: number;
  backgroundPaddingY: number;
  backgroundRadius: number;

  wrapEnabled: boolean;
  boxWidth: number;
};

export type ShapeType =
  | "rectangle"
  | "rounded-rectangle"
  | "ellipse";

export type ShapeLayerData = {
  shapeType: ShapeType;

  width: number;
  height: number;

  fillEnabled: boolean;

  fillMode:
    | "solid"
    | "linear-gradient";

  fillColor: string;
  fillOpacity: number;

  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number;

  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;

  strokeStyle:
    | "solid"
    | "dashed"
    | "dotted";

  cornerRadius: number;

  shadowEnabled: boolean;
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
};


export type ToneCurvePoint = {
  x: number;
  y: number;
};


export type HslColorBand =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "aqua"
  | "blue"
  | "purple"
  | "magenta";

export type HslBandAdjustment = {
  hue: number;
  saturation: number;
  luminance: number;
};

export type HslColorMixer = {
  red: HslBandAdjustment;
  orange: HslBandAdjustment;
  yellow: HslBandAdjustment;
  green: HslBandAdjustment;
  aqua: HslBandAdjustment;
  blue: HslBandAdjustment;
  purple: HslBandAdjustment;
  magenta: HslBandAdjustment;
};


export type ColorGradeRange = {
  hue: number;
  saturation: number;
  luminance: number;
};

export type ColorGradingData = {
  shadows: ColorGradeRange;
  midtones: ColorGradeRange;
  highlights: ColorGradeRange;

  balance: number;
  blending: number;
};


export type LayerGroup = {
  id: string;
  name: string;

  collapsed: boolean;

  visible: boolean;
  locked: boolean;
};

export type ImageLayer = {
  id: string;
  name: string;

  /*
    Text layers are stored as editable text
    metadata plus a transparent raster preview
    in src. Existing image layers remain fully
    compatible.
  */

  layerKind:
    | "image"
    | "text"
    | "shape"
    | "adjustment";

  text:
    | TextLayerData
    | null;

  shape:
    | ShapeLayerData
    | null;

  groupId:
    | string
    | null;

  /*
    Used by Adjustment Layers.
    true = affect only the visual layer directly below.
  */
  clipToBelow?: boolean;

  /*
    Used by Adjustment Layers.
    0..255 input -> 0..255 output.
  */
  toneCurve?:
    ToneCurvePoint[];

  toneCurveRed?:
    ToneCurvePoint[];

  toneCurveGreen?:
    ToneCurvePoint[];

  toneCurveBlue?:
    ToneCurvePoint[];

  hslMixer?:
    HslColorMixer;

  colorGrading?:
    ColorGradingData;

  src: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;

  /*
    Non-destructive layer mask.
    White = visible
    Black = hidden
  */

  maskSrc: string | null;
  maskEnabled: boolean;
  maskInverted: boolean;
  maskDensity: number;
  maskFeather: number;

  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  settings: Settings;
};

export function createLayerId() {
  return (
    "layer-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}

export function createGroupId() {
  return (
    "group-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}
