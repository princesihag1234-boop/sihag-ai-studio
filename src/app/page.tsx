"use client";

import {
  ChangeEvent,
  PointerEvent,
  WheelEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  DEFAULT_SETTINGS,
  renderImage,
} from "@/lib/imageEngine";

import type {
  Settings,
} from "@/lib/imageEngine";

import LayerPanel from "@/components/LayerPanel";
import LayerTransformPanel from "@/components/LayerTransformPanel";
import MaskBrushPanel from "@/components/MaskBrushPanel";
import HealBrushPanel from "@/components/HealBrushPanel";
import CloneStampPanel from "@/components/CloneStampPanel";
import EraserBrushPanel from "@/components/EraserBrushPanel";
import DodgeBurnPanel from "@/components/DodgeBurnPanel";
import BlurSharpenPanel from "@/components/BlurSharpenPanel";
import PaintBrushPanel from "@/components/PaintBrushPanel";
import AiToolsPanel from "@/components/AiToolsPanel";
import TextLayerPanel from "@/components/TextLayerPanel";
import ShapeLayerPanel from "@/components/ShapeLayerPanel";

import AdjustmentLayerPanel from "@/components/AdjustmentLayerPanel";
import CurvesPanel from "@/components/CurvesPanel";
import HslColorMixerPanel from "@/components/HslColorMixerPanel";
import ColorGradingPanel from "@/components/ColorGradingPanel";

import type {
  CurvesChannel,
} from "@/components/CurvesPanel";

import type {
  DodgeBurnMode,
  DodgeBurnRange,
} from "@/components/DodgeBurnPanel";

import type {
  BlurSharpenMode,
} from "@/components/BlurSharpenPanel";

import type {
  AdjustmentPresetId,
} from "@/components/AdjustmentLayerPanel";

import LayerCanvas, {
  renderLayerStack,
  purgeLayerCanvasImageCache,
} from "@/components/LayerCanvas";

import type {
  SelectionRect,
  SelectionPoint,
  SelectionShape,
  SelectionCombineMode,
  SelectionRegion,
  CloneSamplePoint,
} from "@/components/LayerCanvas";

import {
  createGroupId,
  createLayerId,
} from "@/lib/layerTypes";

import type {
  BlendMode,
  ImageLayer,
  LayerGroup,
  TextLayerData,
  ShapeLayerData,
  ToneCurvePoint,
  HslColorMixer,
  ColorGradingData,
} from "@/lib/layerTypes";

import {
  DEFAULT_TEXT_LAYER,
  normalizeTextLayerData,
  renderTextLayerToDataUrl,
} from "@/lib/textLayer";

import {
  DEFAULT_SHAPE_LAYER,
  normalizeShapeLayerData,
  renderShapeLayerToDataUrl,
} from "@/lib/shapeLayer";

import {
  DEFAULT_TONE_CURVE,
  normalizeToneCurve,
} from "@/lib/toneCurve";

import {
  cloneHslColorMixer,
  DEFAULT_HSL_MIXER,
  normalizeHslColorMixer,
} from "@/lib/hslColorMixer";

import {
  cloneColorGrading,
  DEFAULT_COLOR_GRADING,
  normalizeColorGrading,
} from "@/lib/colorGrading";

import {
  clearRecoveryProject,
  loadRecoveryProject,
  saveRecoveryProject,
} from "@/lib/projectRecovery";

type Tool =
  | "move"
  | "hand"
  | "crop"
  | "select"
  | "lasso"
  | "polygonal-lasso"
  | "magic-wand"
  | "quick-select"
  | "brush"
  | "heal"
  | "clone"
  | "eraser"
  | "dodge-burn"
  | "blur-sharpen"
  | "paint"
  | "text"
  | "shape"
  | "gradient"
  | "ai"
  | "zoom";

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropAspect =
  | "free"
  | "1:1"
  | "4:3"
  | "3:2"
  | "16:9";

type ExportFormat =
  | "png"
  | "jpeg"
  | "webp";

type ExportArea =
  | "document"
  | "selection";

type ExportBackground =
  | "transparent"
  | "white"
  | "black"
  | "custom";

type CropDragMode =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | null;

const DEFAULT_CROP: CropRect = {
  x: 0.1,
  y: 0.1,
  width: 0.8,
  height: 0.8,
};

type EditorSnapshot = {
  imageSrc: string | null;
  fileName: string;
  settings: Settings;
  rotation: number;
  straighten: number;
  flipHorizontal: boolean;
  flipVertical: boolean;

  layers: ImageLayer[];
  groups: LayerGroup[];

  selectedLayerId: string | null;
};

type SihagProjectFile = {
  version: 1;
  app: "SIHAG AI STUDIO";

  savedAt: string;

  fileName: string;

  layers: ImageLayer[];
  groups: LayerGroup[];

  selectedLayerId: string | null;

  selection: SelectionRect | null;
  selectionInverted: boolean;
  selectionFeather: number;

  selectionRefineAmount?: number;

  magicWandTolerance?: number;

  quickSelectionBrushSize?: number;

  quickSelectionTolerance?: number;

  selectionShape:
    SelectionShape;

  selectionPath:
    SelectionPoint[] | null;

  selectionMode?:
    SelectionCombineMode;

  selectionRegions?:
    SelectionRegion[];

  selectionAspect:
    | "free"
    | "1:1"
    | "4:3"
    | "3:2"
    | "16:9";

  zoom: number;

  previewQuality?:
    | "fast"
    | "balanced"
    | "quality";

  pan: {
    x: number;
    y: number;
  };

  snapEnabled?: boolean;
  showGrid?: boolean;
  gridSize?: number;

  showGuides?: boolean;
  showRulers?: boolean;
  guidesX?: number[];
  guidesY?: number[];

  crop: CropRect;
  cropAspect: CropAspect;

  maskBrushSize: number;
  maskBrushHardness: number;
  maskBrushOpacity: number;
  maskBrushMode:
    | "hide"
    | "reveal";

  maskOverlayEnabled: boolean;

  healBrushSize?: number;
  healBrushHardness?: number;
  healBrushOpacity?: number;

  cloneBrushSize?: number;
  cloneBrushHardness?: number;
  cloneBrushOpacity?: number;

  eraserBrushSize?: number;
  eraserBrushHardness?: number;
  eraserBrushOpacity?: number;

  dodgeBurnMode?:
    DodgeBurnMode;

  dodgeBurnRange?:
    DodgeBurnRange;

  dodgeBurnBrushSize?: number;
  dodgeBurnBrushHardness?: number;
  dodgeBurnExposure?: number;

  blurSharpenMode?:
    BlurSharpenMode;

  blurSharpenBrushSize?: number;
  blurSharpenBrushHardness?: number;
  blurSharpenStrength?: number;

  paintBrushColor?: string;
  paintBrushSize?: number;
  paintBrushHardness?: number;
  paintBrushOpacity?: number;
  paintBrushFlow?: number;
  paintBrushSpacing?: number;
  paintBrushSmoothing?: number;
  paintBrushMode?: "paint" | "erase";
  paintBrushBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay";
  paintPressureSize?: boolean;
  paintPressureOpacity?: boolean;
};


function cloneSettings(
  settings: Settings
): Settings {
  return {
    ...settings,
  };
}

function cloneLayers(
  layers: ImageLayer[]
): ImageLayer[] {
  return layers.map(
    (layer) => ({
      ...layer,
      settings: {
        ...layer.settings,
      },

      text:
        layer.text
          ? {
              ...layer.text,
            }
          : null,

      shape:
        layer.shape
          ? {
              ...layer.shape,
            }
          : null,

      toneCurve:
        layer.toneCurve
          ? layer.toneCurve.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      toneCurveRed:
        layer.toneCurveRed
          ? layer.toneCurveRed.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      toneCurveGreen:
        layer.toneCurveGreen
          ? layer.toneCurveGreen.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      toneCurveBlue:
        layer.toneCurveBlue
          ? layer.toneCurveBlue.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      hslMixer:
        layer.hslMixer
          ? cloneHslColorMixer(
              layer.hslMixer
            )
          : undefined,

      colorGrading:
        layer.colorGrading
          ? cloneColorGrading(
              layer.colorGrading
            )
          : undefined,
    })
  );
}


function cloneGroups(
  groups: LayerGroup[]
): LayerGroup[] {
  return groups.map(
    (group) => ({
      ...group,
    })
  );
}

function normalizeLoadedGroups(
  value: unknown
): LayerGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen =
    new Set<string>();

  return value
    .filter(
      (item) =>
        !!item &&
        typeof item ===
          "object"
    )
    .map((item) => {
      const group =
        item as
          Partial<LayerGroup>;

      return {
        id:
          typeof group.id ===
            "string" &&
          group.id
            ? group.id
            : createGroupId(),

        name:
          typeof group.name ===
            "string" &&
          group.name.trim()
            ? group.name.trim()
            : "Folder",

        collapsed:
          group.collapsed ===
          true,

        visible:
          group.visible !==
          false,

        locked:
          group.locked ===
          true,
      };
    })
    .filter((group) => {
      if (
        seen.has(
          group.id
        )
      ) {
        return false;
      }

      seen.add(
        group.id
      );

      return true;
    });
}

function normalizeLoadedLayers(
  value: unknown
): ImageLayer[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        !!item &&
        typeof item ===
          "object"
    )
    .map((item): ImageLayer => {
      const layer =
        item as Partial<ImageLayer>;

      return {
        id:
          typeof layer.id ===
          "string"
            ? layer.id
            : createLayerId(),

        name:
          typeof layer.name ===
          "string"
            ? layer.name
            : "Layer",

        layerKind:
          layer.layerKind ===
          "text"
            ? "text"
            : layer.layerKind ===
                "shape"
              ? "shape"
              : layer.layerKind ===
                  "adjustment"
                ? "adjustment"
                : "image",

        text:
          layer.layerKind ===
            "text"
            ? normalizeTextLayerData(
                layer.text
              )
            : null,

        shape:
          layer.layerKind ===
            "shape"
            ? normalizeShapeLayerData(
                layer.shape
              )
            : null,

        groupId:
          typeof layer.groupId ===
          "string"
            ? layer.groupId
            : null,

        clipToBelow:
          layer.layerKind ===
            "adjustment"
            ? layer.clipToBelow ===
              true
            : false,

        toneCurve:
          layer.layerKind ===
            "adjustment"
            ? normalizeToneCurve(
                layer.toneCurve
              )
            : undefined,

        toneCurveRed:
          layer.layerKind ===
            "adjustment"
            ? normalizeToneCurve(
                layer.toneCurveRed
              )
            : undefined,

        toneCurveGreen:
          layer.layerKind ===
            "adjustment"
            ? normalizeToneCurve(
                layer.toneCurveGreen
              )
            : undefined,

        toneCurveBlue:
          layer.layerKind ===
            "adjustment"
            ? normalizeToneCurve(
                layer.toneCurveBlue
              )
            : undefined,

        hslMixer:
          layer.layerKind ===
            "adjustment"
            ? normalizeHslColorMixer(
                layer.hslMixer
              )
            : undefined,

        colorGrading:
          layer.layerKind ===
            "adjustment"
            ? normalizeColorGrading(
                layer.colorGrading
              )
            : undefined,

        src:
          typeof layer.src ===
          "string"
            ? layer.src
            : "",

        visible:
          layer.visible !==
          false,

        locked:
          layer.locked ===
          true,

        opacity:
          typeof layer.opacity ===
          "number"
            ? Math.max(
                0,
                Math.min(
                  100,
                  layer.opacity
                )
              )
            : 100,

        blendMode:
          layer.blendMode ??
          "normal",

        maskSrc:
          typeof layer.maskSrc ===
          "string"
            ? layer.maskSrc
            : null,

        maskEnabled:
          layer.maskEnabled !==
          false,

        maskInverted:
          layer.maskInverted ===
          true,

        maskDensity:
          typeof layer.maskDensity ===
          "number"
            ? Math.max(
                0,
                Math.min(
                  100,
                  layer.maskDensity
                )
              )
            : 100,

        maskFeather:
          typeof layer.maskFeather ===
          "number"
            ? Math.max(
                0,
                layer.maskFeather
              )
            : 0,

        x:
          typeof layer.x ===
          "number"
            ? layer.x
            : 0,

        y:
          typeof layer.y ===
          "number"
            ? layer.y
            : 0,

        scale:
          typeof layer.scale ===
          "number"
            ? Math.max(
                0.05,
                layer.scale
              )
            : 1,

        rotation:
          typeof layer.rotation ===
          "number"
            ? layer.rotation
            : 0,

        flipHorizontal:
          layer.flipHorizontal ===
          true,

        flipVertical:
          layer.flipVertical ===
          true,

        settings: {
          ...DEFAULT_SETTINGS,
          ...(
            layer.settings ??
            {}
          ),
        },
      };
    })
    .filter(
      (layer) =>
        layer.src.length >
        0
    );
}

export default function Home() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const imageStageRef =
    useRef<HTMLDivElement | null>(null);

  const projectInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const imageInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const temporaryHandToolRef =
    useRef<Tool | null>(
      null
    );

  const [image, setImage] =
    useState<HTMLImageElement | null>(null);

  const [fileName, setFileName] =
    useState("No image open");

  /* AUTOSAVE / RECOVERY */

  const [
    recoveryProject,
    setRecoveryProject,
  ] =
    useState<SihagProjectFile | null>(
      null
    );

  const [
    recoverySavedAt,
    setRecoverySavedAt,
  ] =
    useState<string | null>(
      null
    );

  const [
    autosaveStatus,
    setAutosaveStatus,
  ] = useState<
    | "idle"
    | "saving"
    | "saved"
    | "error"
  >("idle");

  /* EXPORT */

  const [
    exportDialogOpen,
    setExportDialogOpen,
  ] = useState(false);

  const [
    shortcutsOpen,
    setShortcutsOpen,
  ] = useState(false);

  const [
    shortcutSearch,
    setShortcutSearch,
  ] = useState("");

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    mobilePanel,
    setMobilePanel,
  ] = useState<
    | "tools"
    | "properties"
    | "adjust"
    | "layers"
    | "text"
    | "brush"
    | "more"
    | null
  >(null);

  const [
    mobileAdjustGroup,
    setMobileAdjustGroup,
  ] = useState<
    "light" | "color" | "presence" | "detail" | "effects" | "layer"
  >("light");

  const [
    desktopInspectorTab,
    setDesktopInspectorTab,
  ] = useState<
    "properties" | "adjust" | "layers"
  >("properties");

  /* PHOTOSHOP-STYLE WORKSPACE PANEL VISIBILITY */

  const [
    workspacePanelsHidden,
    setWorkspacePanelsHidden,
  ] = useState(false);

  const [
    workspaceInspectorHidden,
    setWorkspaceInspectorHidden,
  ] = useState(false);

  const [
    desktopAdjustSection,
    setDesktopAdjustSection,
  ] = useState<
    "basic" | "curves" | "hsl" | "grading" | "layer"
  >("basic");

  const [
    desktopBasicAdjustGroup,
    setDesktopBasicAdjustGroup,
  ] = useState<
    "light" | "color" | "presence" | "detail" | "effects" | "layer"
  >("light");

  const [
    topMenuOpen,
    setTopMenuOpen,
  ] = useState<
    | "file"
    | "edit"
    | "image"
    | "layer"
    | "select"
    | "filter"
    | "view"
    | null
  >(null);

  const [
    exportFormat,
    setExportFormat,
  ] =
    useState<ExportFormat>(
      "png"
    );

  const [
    exportArea,
    setExportArea,
  ] =
    useState<ExportArea>(
      "document"
    );

  const [
    exportBackground,
    setExportBackground,
  ] =
    useState<ExportBackground>(
      "transparent"
    );

  const [
    exportCustomBackground,
    setExportCustomBackground,
  ] = useState(
    "#ffffff"
  );

  const [
    exportDocumentSize,
    setExportDocumentSize,
  ] = useState({
    width: 0,
    height: 0,
  });

  const [
    exportQuality,
    setExportQuality,
  ] = useState(92);

  const [
    exportScale,
    setExportScale,
  ] = useState(1);

  const [
    exportCustomWidth,
    setExportCustomWidth,
  ] = useState(0);

  const [
    exportCustomHeight,
    setExportCustomHeight,
  ] = useState(0);

  const [
    exportAspectLocked,
    setExportAspectLocked,
  ] = useState(true);

  const [
    exportOriginalSize,
    setExportOriginalSize,
  ] = useState({
    width: 0,
    height: 0,
  });

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [
    exportPreviewUrl,
    setExportPreviewUrl,
  ] = useState<string | null>(
    null
  );

  const [
    exportPreviewLoading,
    setExportPreviewLoading,
  ] = useState(false);

  /* LAYERS */

  const [layers, setLayers] =
    useState<ImageLayer[]>([]);

  const [groups, setGroups] =
    useState<LayerGroup[]>([]);

  const [selectedLayerId, setSelectedLayerId] =
    useState<string | null>(null);

  const [
    selectedLayerIds,
    setSelectedLayerIds,
  ] =
    useState<string[]>(
      []
    );

  const selectedLayer =
    layers.find(
      (layer) => layer.id === selectedLayerId
    ) ?? null;

  useEffect(() => {
    if (
      selectedLayer?.layerKind !== "adjustment" &&
      desktopAdjustSection !== "basic"
    ) {
      setDesktopAdjustSection("basic");
    }
  }, [
    selectedLayer?.layerKind,
    desktopAdjustSection,
  ]);

  useEffect(() => {
    if (mobilePanel !== "text") {
      return;
    }

    const timer = window.setTimeout(() => {
      const panel = document.querySelector(
        '[data-mobile-text-editor="true"]'
      );

      const field = panel?.querySelector(
        'textarea, input[type="text"]'
      ) as HTMLTextAreaElement | HTMLInputElement | null;

      field?.focus();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [mobilePanel, selectedLayerId]);

  const [settings, setSettings] =
    useState<Settings>({
      ...DEFAULT_SETTINGS,
    });

  const [activeTool, setActiveTool] =
    useState<Tool>("move");

  /*
    MULTI-LAYER SELECTION

    Most editor tools still have one primary selected layer.
    selectedLayerIds adds secondary layers for group movement,
    alignment and distribution without changing that model.
  */

  useEffect(() => {
    setSelectedLayerIds(
      (current) => {
        const valid =
          current.filter(
            (id) =>
              layers.some(
                (layer) =>
                  layer.id ===
                  id
              )
          );

        if (
          !selectedLayerId
        ) {
          return [];
        }

        if (
          valid.includes(
            selectedLayerId
          )
        ) {
          return valid;
        }

        return [
          selectedLayerId,
        ];
      }
    );
  }, [
    layers,
    selectedLayerId,
  ]);

  /* SELECTION */

  const [
    selection,
    setSelection,
  ] =
    useState<SelectionRect | null>(
      null
    );

  const [
    selectionInverted,
    setSelectionInverted,
  ] = useState(false);

  const [
    selectionFeather,
    setSelectionFeather,
  ] = useState(0);

  const [
    selectionRefineAmount,
    setSelectionRefineAmount,
  ] = useState(10);

  const [
    magicWandTolerance,
    setMagicWandTolerance,
  ] = useState(32);

  const [
    quickSelectionBrushSize,
    setQuickSelectionBrushSize,
  ] = useState(60);

  const [
    quickSelectionTolerance,
    setQuickSelectionTolerance,
  ] = useState(36);

  const [
    selectionShape,
    setSelectionShape,
  ] =
    useState<SelectionShape>(
      "rectangle"
    );

  const [
    selectionPath,
    setSelectionPath,
  ] =
    useState<
      SelectionPoint[] | null
    >(
      null
    );

  const [
    selectionMode,
    setSelectionMode,
  ] =
    useState<SelectionCombineMode>(
      "new"
    );

  const [
    selectionRegions,
    setSelectionRegions,
  ] =
    useState<SelectionRegion[]>(
      []
    );

  const [
    selectionAspect,
    setSelectionAspect,
  ] = useState<
    | "free"
    | "1:1"
    | "4:3"
    | "3:2"
    | "16:9"
  >("free");

  const [
    lastSelectionSnapshot,
    setLastSelectionSnapshot,
  ] = useState<{
    selection: SelectionRect;
    inverted: boolean;
    shape: SelectionShape;
    path: SelectionPoint[] | null;
    regions: SelectionRegion[];
    mode: SelectionCombineMode;
  } | null>(null);

  const temporarySelectionModeRef =
    useRef<SelectionCombineMode | null>(
      null
    );

  function cloneSelectionRegion(
    region:
      SelectionRegion
  ): SelectionRegion {
    return {
      shape:
        region.shape,

      rect: {
        ...region.rect,
      },

      path:
        region.path
          ? region.path.map(
              (point) => ({
                ...point,
              })
            )
          : null,

      operation:
        region.operation,
    };
  }

  function currentSelectionAsRegion():
    SelectionRegion | null {
    if (!selection) {
      return null;
    }

    return {
      shape:
        selectionShape,

      rect: {
        ...selection,
      },

      path:
        selectionPath
          ? selectionPath.map(
              (point) => ({
                ...point,
              })
            )
          : null,

      operation:
        "add",
    };
  }

  function getSelectionRegionsWithFallback() {
    if (
      selectionRegions.length >
      0
    ) {
      return selectionRegions.map(
        cloneSelectionRegion
      );
    }

    const fallback =
      currentSelectionAsRegion();

    return fallback
      ? [
          fallback,
        ]
      : [];
  }

  function getSelectionRegionBounds(
    regions:
      SelectionRegion[]
  ): SelectionRect | null {
    if (
      regions.length ===
      0
    ) {
      return null;
    }

    let bounds:
      SelectionRect | null =
        null;

    for (
      const region of
        regions
    ) {
      const rect =
        region.rect;

      if (!bounds) {
        if (
          region.operation ===
          "subtract"
        ) {
          continue;
        }

        bounds = {
          ...rect,
        };

        continue;
      }

      if (
        region.operation ===
        "subtract"
      ) {
        continue;
      }

      if (
        region.operation ===
        "intersect"
      ) {
        const left =
          Math.max(
            bounds.x,
            rect.x
          );

        const top =
          Math.max(
            bounds.y,
            rect.y
          );

        const right =
          Math.min(
            bounds.x +
              bounds.width,
            rect.x +
              rect.width
          );

        const bottom =
          Math.min(
            bounds.y +
              bounds.height,
            rect.y +
              rect.height
          );

        if (
          right <=
            left ||
          bottom <=
            top
        ) {
          return null;
        }

        bounds = {
          x:
            left,

          y:
            top,

          width:
            right -
            left,

          height:
            bottom -
            top,
        };

        continue;
      }

      const left =
        Math.min(
          bounds.x,
          rect.x
        );

      const top =
        Math.min(
          bounds.y,
          rect.y
        );

      const right =
        Math.max(
          bounds.x +
            bounds.width,
          rect.x +
            rect.width
        );

      const bottom =
        Math.max(
          bounds.y +
            bounds.height,
          rect.y +
            rect.height
        );

      bounds = {
        x:
          left,

        y:
          top,

        width:
          right -
          left,

        height:
          bottom -
          top,
      };
    }

    return bounds;
  }

  function commitSelectionRegion(
    region:
      Omit<
        SelectionRegion,
        "operation"
      >,
    mode:
      SelectionCombineMode
  ) {
    const normalized: SelectionRegion = {
      shape:
        region.shape,

      rect:
        clampSelection(
          region.rect
        ),

      path:
        region.path
          ? region.path.map(
              (point) => ({
                x:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      point.x
                    )
                  ),

                y:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      point.y
                    )
                  ),
              })
            )
          : null,

      operation:
        mode ===
          "subtract"
          ? "subtract"
          : mode ===
              "intersect"
            ? "intersect"
            : "add",
    };

    const existing =
      getSelectionRegionsWithFallback();

    const nextRegions:
      SelectionRegion[] =
        mode ===
          "new" ||
        existing.length ===
          0
          ? [
              {
                ...normalized,
                operation:
                  "add",
              },
            ]
          : [
              ...existing,
              normalized,
            ];

    setSelectionRegions(
      nextRegions
    );

    setSelection(
      getSelectionRegionBounds(
        nextRegions
      )
    );

    setSelectionShape(
      region.shape
    );

    setSelectionPath(
      region.path
        ? region.path.map(
            (point) => ({
              ...point,
            })
          )
        : null
    );

    setSelectionInverted(
      false
    );
  }

  function getSelectionDocumentSize() {
    return {
      width:
        Math.max(
          1,
          image?.naturalWidth ??
            1000
        ),

      height:
        Math.max(
          1,
          image?.naturalHeight ??
            1000
        ),
    };
  }

  function resizeSelectionRegion(
    region:
      SelectionRegion,
    amountPixels: number
  ): SelectionRegion | null {
    const {
      width:
        documentWidth,
      height:
        documentHeight,
    } =
      getSelectionDocumentSize();

    /*
      Subtract regions behave like holes.
      Growing the selected area shrinks holes,
      while contracting the selection enlarges them.
    */

    const signedAmount =
      region.operation ===
        "subtract"
        ? -amountPixels
        : amountPixels;

    const dx =
      signedAmount /
      documentWidth;

    const dy =
      signedAmount /
      documentHeight;

    const oldRect =
      region.rect;

    const oldCenterX =
      oldRect.x +
      oldRect.width /
        2;

    const oldCenterY =
      oldRect.y +
      oldRect.height /
        2;

    const left =
      Math.max(
        0,
        Math.min(
          1,
          oldRect.x -
            dx
        )
      );

    const top =
      Math.max(
        0,
        Math.min(
          1,
          oldRect.y -
            dy
        )
      );

    const right =
      Math.max(
        0,
        Math.min(
          1,
          oldRect.x +
            oldRect.width +
            dx
        )
      );

    const bottom =
      Math.max(
        0,
        Math.min(
          1,
          oldRect.y +
            oldRect.height +
            dy
        )
      );

    const width =
      right -
      left;

    const height =
      bottom -
      top;

    if (
      width <=
        0.0005 ||
      height <=
        0.0005
    ) {
      return null;
    }

    const newCenterX =
      left +
      width /
        2;

    const newCenterY =
      top +
      height /
        2;

    const nextPath =
      region.path
        ? region.path.map(
            (point) => {
              const scaleX =
                oldRect.width >
                0.000001
                  ? width /
                    oldRect.width
                  : 1;

              const scaleY =
                oldRect.height >
                0.000001
                  ? height /
                    oldRect.height
                  : 1;

              return {
                x:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      newCenterX +
                        (
                          point.x -
                          oldCenterX
                        ) *
                        scaleX
                    )
                  ),

                y:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      newCenterY +
                        (
                          point.y -
                          oldCenterY
                        ) *
                        scaleY
                    )
                  ),
              };
            }
          )
        : null;

    return {
      ...region,

      rect: {
        x:
          left,

        y:
          top,

        width,

        height,
      },

      path:
        nextPath,
    };
  }

  function applySelectionExpandContract(
    direction:
      "expand" |
      "contract"
  ) {
    if (!selection) {
      return;
    }

    const amount =
      Math.max(
        1,
        Math.min(
          500,
          selectionRefineAmount
        )
      ) *
      (
        direction ===
          "expand"
          ? 1
          : -1
      );

    const sourceRegions =
      getSelectionRegionsWithFallback();

    const nextRegions =
      sourceRegions
        .map(
          (region) =>
            resizeSelectionRegion(
              region,
              amount
            )
        )
        .filter(
          (
            region
          ): region is
            SelectionRegion =>
              region !==
              null
        );

    if (
      nextRegions.length ===
      0
    ) {
      clearSelectionState();

      return;
    }

    setSelectionRegions(
      nextRegions
    );

    setSelection(
      getSelectionRegionBounds(
        nextRegions
      )
    );

    const lastRegion =
      nextRegions[
        nextRegions.length -
          1
      ];

    setSelectionShape(
      lastRegion.shape
    );

    setSelectionPath(
      lastRegion.path
        ? lastRegion.path.map(
            (point) => ({
              ...point,
            })
          )
        : null
    );
  }

  function smoothSelectionPath(
    points:
      SelectionPoint[],
    amount: number
  ) {
    if (
      points.length <
      5
    ) {
      return points.map(
        (point) => ({
          ...point,
        })
      );
    }

    const blend =
      Math.max(
        0.08,
        Math.min(
          0.8,
          amount
        )
      );

    const passes =
      Math.max(
        1,
        Math.min(
          5,
          Math.round(
            1 +
            blend *
              4
          )
        )
      );

    let result =
      points.map(
        (point) => ({
          ...point,
        })
      );

    for (
      let pass = 0;
      pass < passes;
      pass += 1
    ) {
      const source =
        result;

      result =
        source.map(
          (
            point,
            index
          ) => {
            const previous =
              source[
                (
                  index -
                  1 +
                  source.length
                ) %
                source.length
              ];

            const next =
              source[
                (
                  index +
                  1
                ) %
                source.length
              ];

            const averageX =
              (
                previous.x +
                point.x +
                next.x
              ) /
              3;

            const averageY =
              (
                previous.y +
                point.y +
                next.y
              ) /
              3;

            return {
              x:
                Math.max(
                  0,
                  Math.min(
                    1,
                    point.x +
                      (
                        averageX -
                        point.x
                      ) *
                      blend
                  )
                ),

              y:
                Math.max(
                  0,
                  Math.min(
                    1,
                    point.y +
                      (
                        averageY -
                        point.y
                      ) *
                      blend
                  )
                ),
            };
          }
        );
    }

    return result;
  }

  function smoothSelectionRegions() {
    if (!selection) {
      return;
    }

    const sourceRegions =
      getSelectionRegionsWithFallback();

    let changed =
      false;

    const smoothAmount =
      Math.max(
        0.08,
        Math.min(
          0.8,
          selectionRefineAmount /
            50
        )
      );

    const nextRegions =
      sourceRegions.map(
        (region) => {
          if (
            region.shape !==
              "lasso" ||
            !region.path ||
            region.path.length <
              5
          ) {
            return cloneSelectionRegion(
              region
            );
          }

          changed =
            true;

          const nextPath =
            smoothSelectionPath(
              region.path,
              smoothAmount
            );

          const xs =
            nextPath.map(
              (point) =>
                point.x
            );

          const ys =
            nextPath.map(
              (point) =>
                point.y
            );

          const minX =
            Math.min(
              ...xs
            );

          const maxX =
            Math.max(
              ...xs
            );

          const minY =
            Math.min(
              ...ys
            );

          const maxY =
            Math.max(
              ...ys
            );

          return {
            ...region,

            path:
              nextPath,

            rect: {
              x:
                minX,

              y:
                minY,

              width:
                Math.max(
                  0,
                  maxX -
                    minX
                ),

              height:
                Math.max(
                  0,
                  maxY -
                    minY
                ),
            },
          };
        }
      );

    if (!changed) {
      return;
    }

    setSelectionRegions(
      nextRegions
    );

    setSelection(
      getSelectionRegionBounds(
        nextRegions
      )
    );

    const lastRegion =
      nextRegions[
        nextRegions.length -
          1
      ];

    setSelectionShape(
      lastRegion.shape
    );

    setSelectionPath(
      lastRegion.path
        ? lastRegion.path.map(
            (point) => ({
              ...point,
            })
          )
        : null
    );
  }

  function rememberSelectionForReselect() {
    if (!selection) {
      return;
    }

    setLastSelectionSnapshot({
      selection: {
        ...selection,
      },
      inverted:
        selectionInverted,
      shape:
        selectionShape,
      path:
        selectionPath
          ? selectionPath.map(
              (point) => ({
                ...point,
              })
            )
          : null,
      regions:
        getSelectionRegionsWithFallback().map(
          cloneSelectionRegion
        ),
      mode:
        selectionMode,
    });
  }

  function deselectSelectionShortcut() {
    if (!selection) {
      return;
    }

    rememberSelectionForReselect();
    clearSelectionState();
  }

  function reselectLastSelectionShortcut() {
    if (!lastSelectionSnapshot) {
      return;
    }

    setSelection({
      ...lastSelectionSnapshot.selection,
    });

    setSelectionInverted(
      lastSelectionSnapshot.inverted
    );

    setSelectionShape(
      lastSelectionSnapshot.shape
    );

    setSelectionPath(
      lastSelectionSnapshot.path
        ? lastSelectionSnapshot.path.map(
            (point) => ({
              ...point,
            })
          )
        : null
    );

    setSelectionRegions(
      lastSelectionSnapshot.regions.map(
        cloneSelectionRegion
      )
    );

    setSelectionMode(
      lastSelectionSnapshot.mode
    );

    setActiveTool(
      lastSelectionSnapshot.shape ===
        "lasso"
        ? "lasso"
        : "select"
    );
  }

  function clearSelectionState() {
    setSelection(
      null
    );

    setSelectionInverted(
      false
    );

    setSelectionPath(
      null
    );

    setSelectionRegions(
      []
    );

    setSelectionMode(
      "new"
    );
  }

  function clampSelection(
    next: SelectionRect
  ): SelectionRect {
    const minimum =
      0.0025;

    const width =
      Math.max(
        minimum,
        Math.min(
          1,
          next.width
        )
      );

    const height =
      Math.max(
        minimum,
        Math.min(
          1,
          next.height
        )
      );

    const x =
      Math.max(
        0,
        Math.min(
          1 - width,
          next.x
        )
      );

    const y =
      Math.max(
        0,
        Math.min(
          1 - height,
          next.y
        )
      );

    return {
      x,
      y,
      width,
      height,
    };
  }

  function updateSelectionField(
    field:
      | "x"
      | "y"
      | "width"
      | "height",
    percentValue: number
  ) {
    if (!selection) {
      return;
    }

    const value =
      percentValue / 100;

    setSelection(
      clampSelection({
        ...selection,
        [field]:
          value,
      })
    );
  }

  function centerSelection() {
    if (!selection) {
      return;
    }

    setSelection({
      ...selection,

      x:
        (1 -
          selection.width) /
        2,

      y:
        (1 -
          selection.height) /
        2,
    });
  }

  function buildCompositeSelectionMask(
    width: number,
    height: number,
    mapPoint: (
      x: number,
      y: number
    ) => {
      x: number;
      y: number;
    },
    featherPixels: number,
    inverted:
      boolean
  ) {
    const regions =
      getSelectionRegionsWithFallback();

    if (
      regions.length ===
      0
    ) {
      return null;
    }

    const combined =
      document.createElement(
        "canvas"
      );

    combined.width =
      Math.max(
        1,
        Math.round(
          width
        )
      );

    combined.height =
      Math.max(
        1,
        Math.round(
          height
        )
      );

    const combinedContext =
      combined.getContext(
        "2d"
      );

    if (
      !combinedContext
    ) {
      return null;
    }

    function regionPoints(
      region:
        SelectionRegion
    ) {
      if (
        region.shape ===
          "lasso" &&
        region.path &&
        region.path.length >=
          3
      ) {
        return region.path.map(
          (point) =>
            mapPoint(
              point.x,
              point.y
            )
        );
      }

      const left =
        region.rect.x;

      const top =
        region.rect.y;

      const right =
        region.rect.x +
        region.rect.width;

      const bottom =
        region.rect.y +
        region.rect.height;

      if (
        region.shape ===
          "ellipse"
      ) {
        const centerX =
          (
            left +
            right
          ) /
          2;

        const centerY =
          (
            top +
            bottom
          ) /
          2;

        const radiusX =
          (
            right -
            left
          ) /
          2;

        const radiusY =
          (
            bottom -
            top
          ) /
          2;

        return Array.from(
          {
            length:
              96,
          },
          (
            _,
            index
          ) => {
            const angle =
              (
                index /
                96
              ) *
              Math.PI *
              2;

            return mapPoint(
              centerX +
                Math.cos(
                  angle
                ) *
                radiusX,

              centerY +
                Math.sin(
                  angle
                ) *
                radiusY
            );
          }
        );
      }

      return [
        mapPoint(
          left,
          top
        ),

        mapPoint(
          right,
          top
        ),

        mapPoint(
          right,
          bottom
        ),

        mapPoint(
          left,
          bottom
        ),
      ];
    }

    function paintRegion(
      context:
        CanvasRenderingContext2D,
      region:
        SelectionRegion
    ) {
      const points =
        regionPoints(
          region
        );

      if (
        points.length <
        3
      ) {
        return;
      }

      context.beginPath();

      context.moveTo(
        points[0].x,
        points[0].y
      );

      for (
        let index = 1;
        index <
          points.length;
        index += 1
      ) {
        context.lineTo(
          points[index].x,
          points[index].y
        );
      }

      context.closePath();
      context.fill();
    }

    regions.forEach(
      (
        region,
        index
      ) => {
        const regionCanvas =
          document.createElement(
            "canvas"
          );

        regionCanvas.width =
          combined.width;

        regionCanvas.height =
          combined.height;

        const regionContext =
          regionCanvas.getContext(
            "2d"
          );

        if (
          !regionContext
        ) {
          return;
        }

        regionContext.fillStyle =
          "#ffffff";

        paintRegion(
          regionContext,
          region
        );

        combinedContext.save();

        if (
          index === 0 ||
          region.operation ===
            "add"
        ) {
          combinedContext.globalCompositeOperation =
            "source-over";
        } else if (
          region.operation ===
            "subtract"
        ) {
          combinedContext.globalCompositeOperation =
            "destination-out";
        } else {
          combinedContext.globalCompositeOperation =
            "destination-in";
        }

        combinedContext.drawImage(
          regionCanvas,
          0,
          0
        );

        combinedContext.restore();
      }
    );

    let result =
      combined;

    if (
      inverted
    ) {
      const invertedCanvas =
        document.createElement(
          "canvas"
        );

      invertedCanvas.width =
        combined.width;

      invertedCanvas.height =
        combined.height;

      const invertedContext =
        invertedCanvas.getContext(
          "2d"
        );

      if (
        invertedContext
      ) {
        invertedContext.fillStyle =
          "#ffffff";

        invertedContext.fillRect(
          0,
          0,
          invertedCanvas.width,
          invertedCanvas.height
        );

        invertedContext.globalCompositeOperation =
          "destination-out";

        invertedContext.drawImage(
          combined,
          0,
          0
        );

        invertedContext.globalCompositeOperation =
          "source-over";

        result =
          invertedCanvas;
      }
    }

    const safeFeather =
      Math.max(
        0,
        featherPixels
      );

    if (
      safeFeather <=
      0.01
    ) {
      return result;
    }

    /*
      Feather the final boolean result rather than
      feathering every region individually. This keeps
      Add/Subtract/Intersect behavior predictable.
    */

    const padding =
      Math.max(
        2,
        Math.ceil(
          safeFeather *
            3
        )
      );

    const padded =
      document.createElement(
        "canvas"
      );

    padded.width =
      result.width +
      padding *
        2;

    padded.height =
      result.height +
      padding *
        2;

    const paddedContext =
      padded.getContext(
        "2d"
      );

    if (
      !paddedContext
    ) {
      return result;
    }

    paddedContext.drawImage(
      result,
      padding,
      padding
    );

    const blurred =
      document.createElement(
        "canvas"
      );

    blurred.width =
      padded.width;

    blurred.height =
      padded.height;

    const blurredContext =
      blurred.getContext(
        "2d"
      );

    if (
      !blurredContext
    ) {
      return result;
    }

    blurredContext.filter =
      `blur(${safeFeather}px)`;

    blurredContext.drawImage(
      padded,
      0,
      0
    );

    blurredContext.filter =
      "none";

    const cropped =
      document.createElement(
        "canvas"
      );

    cropped.width =
      result.width;

    cropped.height =
      result.height;

    const croppedContext =
      cropped.getContext(
        "2d"
      );

    if (
      !croppedContext
    ) {
      return result;
    }

    croppedContext.drawImage(
      blurred,
      padding,
      padding,
      result.width,
      result.height,
      0,
      0,
      result.width,
      result.height
    );

    return cropped;
  }

  function buildDocumentSelectionMask(
    width: number,
    height: number,
    inverted =
      selectionInverted
  ) {
    return buildCompositeSelectionMask(
      width,
      height,
      (
        x,
        y
      ) => ({
        x:
          x *
          width,

        y:
          y *
          height,
      }),
      selectionFeather,
      inverted
    );
  }

  function drawSelectionExportContent(
    destination:
      HTMLCanvasElement,
    renderedCanvas:
      HTMLCanvasElement,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number
  ) {
    const destinationContext =
      destination.getContext(
        "2d"
      );

    if (
      !destinationContext
    ) {
      return;
    }

    if (
      exportArea !==
        "selection" ||
      !selection ||
      selectionInverted
    ) {
      destinationContext.drawImage(
        renderedCanvas,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        destination.width,
        destination.height
      );

      return;
    }

    const imageLayer =
      document.createElement(
        "canvas"
      );

    imageLayer.width =
      destination.width;

    imageLayer.height =
      destination.height;

    const imageContext =
      imageLayer.getContext(
        "2d"
      );

    if (
      !imageContext
    ) {
      return;
    }

    imageContext.imageSmoothingEnabled =
      true;

    imageContext.imageSmoothingQuality =
      "high";

    imageContext.drawImage(
      renderedCanvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      imageLayer.width,
      imageLayer.height
    );

    const documentMask =
      buildDocumentSelectionMask(
        renderedCanvas.width,
        renderedCanvas.height,
        false
      );

    if (
      documentMask
    ) {
      const scaledMask =
        document.createElement(
          "canvas"
        );

      scaledMask.width =
        imageLayer.width;

      scaledMask.height =
        imageLayer.height;

      const scaledMaskContext =
        scaledMask.getContext(
          "2d"
        );

      if (
        scaledMaskContext
      ) {
        scaledMaskContext.imageSmoothingEnabled =
          true;

        scaledMaskContext.imageSmoothingQuality =
          "high";

        scaledMaskContext.drawImage(
          documentMask,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          scaledMask.width,
          scaledMask.height
        );

        imageContext.globalCompositeOperation =
          "destination-in";

        imageContext.drawImage(
          scaledMask,
          0,
          0
        );

        imageContext.globalCompositeOperation =
          "source-over";
      }
    }

    destinationContext.drawImage(
      imageLayer,
      0,
      0
    );
  }

  async function createMaskFromSelection() {
    if (
      !selection ||
      !selectedLayer ||
      selectedLayer.locked
    ) {
      return;
    }

    const layerImage =
      new Image();

    const baseLayer =
      layers[0];

    if (!baseLayer) {
      return;
    }

    const baseImage =
      new Image();

    await Promise.all([
      new Promise<void>(
        (
          resolve,
          reject
        ) => {
          layerImage.onload =
            () =>
              resolve();

          layerImage.onerror =
            () =>
              reject(
                new Error(
                  "Could not load selected layer."
                )
              );

          layerImage.src =
            selectedLayer.src;
        }
      ),

      new Promise<void>(
        (
          resolve,
          reject
        ) => {
          baseImage.onload =
            () =>
              resolve();

          baseImage.onerror =
            () =>
              reject(
                new Error(
                  "Could not load base layer."
                )
              );

          baseImage.src =
            baseLayer.src;
        }
      ),
    ]);

    const width =
      Math.max(
        1,
        layerImage.naturalWidth
      );

    const height =
      Math.max(
        1,
        layerImage.naturalHeight
      );

    const documentWidth =
      Math.max(
        1,
        baseImage.naturalWidth
      );

    const documentHeight =
      Math.max(
        1,
        baseImage.naturalHeight
      );

    const centerX =
      documentWidth /
        2 +
      selectedLayer.x;

    const centerY =
      documentHeight /
        2 +
      selectedLayer.y;

    const scaleX =
      selectedLayer.scale *
      (
        selectedLayer.flipHorizontal
          ? -1
          : 1
      );

    const scaleY =
      selectedLayer.scale *
      (
        selectedLayer.flipVertical
          ? -1
          : 1
      );

    if (
      Math.abs(
        scaleX
      ) <
        0.0001 ||
      Math.abs(
        scaleY
      ) <
        0.0001
    ) {
      return;
    }

    const angle =
      (
        -selectedLayer.rotation *
        Math.PI
      ) /
      180;

    function documentToLayer(
      normalizedX: number,
      normalizedY: number
    ) {
      const documentX =
        normalizedX *
        documentWidth;

      const documentY =
        normalizedY *
        documentHeight;

      const dx =
        documentX -
        centerX;

      const dy =
        documentY -
        centerY;

      const rotatedX =
        dx *
          Math.cos(
            angle
          ) -
        dy *
          Math.sin(
            angle
          );

      const rotatedY =
        dx *
          Math.sin(
            angle
          ) +
        dy *
          Math.cos(
            angle
          );

      return {
        x:
          rotatedX /
            scaleX +
          width /
            2,

        y:
          rotatedY /
            scaleY +
          height /
            2,
      };
    }

    const selectionMask =
      buildCompositeSelectionMask(
        width,
        height,
        documentToLayer,
        selectionFeather /
          Math.max(
            0.001,
            Math.abs(
              selectedLayer.scale
            )
          ),
        selectionInverted
      );

    if (
      !selectionMask
    ) {
      return;
    }

    /*
      Layer masks are opaque grayscale images:
      black = hidden, white = visible.
      The composite selection mask uses alpha,
      so paint it over a black background.
    */

    const maskCanvas =
      document.createElement(
        "canvas"
      );

    maskCanvas.width =
      width;

    maskCanvas.height =
      height;

    const context =
      maskCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.fillStyle =
      "#000000";

    context.fillRect(
      0,
      0,
      width,
      height
    );

    context.drawImage(
      selectionMask,
      0,
      0
    );

    saveHistory();

    const maskSrc =
      maskCanvas.toDataURL(
        "image/png"
      );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id ===
            selectedLayer.id
              ? {
                  ...layer,
                  maskSrc,
                  maskEnabled:
                    true,
                  maskInverted:
                    false,
                  maskDensity:
                    100,
                  maskFeather:
                    0,
                }
              : layer
        )
    );
  }

  /* MASK BRUSH */

  const [
    maskBrushSize,
    setMaskBrushSize,
  ] = useState(80);

  const [
    maskBrushHardness,
    setMaskBrushHardness,
  ] = useState(80);

  const [
    maskBrushOpacity,
    setMaskBrushOpacity,
  ] = useState(100);

  const [
    maskOverlayEnabled,
    setMaskOverlayEnabled,
  ] = useState(false);

  const [
    healBrushSize,
    setHealBrushSize,
  ] = useState(50);

  const [
    healBrushHardness,
    setHealBrushHardness,
  ] = useState(70);

  const [
    healBrushOpacity,
    setHealBrushOpacity,
  ] = useState(100);

  const [
    cloneBrushSize,
    setCloneBrushSize,
  ] = useState(50);

  const [
    cloneBrushHardness,
    setCloneBrushHardness,
  ] = useState(70);

  const [
    cloneBrushOpacity,
    setCloneBrushOpacity,
  ] = useState(100);

  const [
    cloneSample,
    setCloneSample,
  ] =
    useState<CloneSamplePoint | null>(
      null
    );

  const [
    eraserBrushSize,
    setEraserBrushSize,
  ] = useState(50);

  const [
    eraserBrushHardness,
    setEraserBrushHardness,
  ] = useState(80);

  const [
    eraserBrushOpacity,
    setEraserBrushOpacity,
  ] = useState(100);

  const [
    dodgeBurnMode,
    setDodgeBurnMode,
  ] =
    useState<DodgeBurnMode>(
      "dodge"
    );

  const [
    dodgeBurnRange,
    setDodgeBurnRange,
  ] =
    useState<DodgeBurnRange>(
      "midtones"
    );

  const [
    dodgeBurnBrushSize,
    setDodgeBurnBrushSize,
  ] = useState(70);

  const [
    dodgeBurnBrushHardness,
    setDodgeBurnBrushHardness,
  ] = useState(40);

  const [
    dodgeBurnExposure,
    setDodgeBurnExposure,
  ] = useState(20);

  const [
    blurSharpenMode,
    setBlurSharpenMode,
  ] =
    useState<BlurSharpenMode>(
      "blur"
    );

  const [
    blurSharpenBrushSize,
    setBlurSharpenBrushSize,
  ] = useState(60);

  const [
    blurSharpenBrushHardness,
    setBlurSharpenBrushHardness,
  ] = useState(50);

  const [
    blurSharpenStrength,
    setBlurSharpenStrength,
  ] = useState(35);

  const [
    paintBrushColor,
    setPaintBrushColor,
  ] = useState(
    "#ffffff"
  );

  const [
    paintBrushSize,
    setPaintBrushSize,
  ] = useState(40);

  const [
    paintBrushHardness,
    setPaintBrushHardness,
  ] = useState(80);

  const [
    paintBrushOpacity,
    setPaintBrushOpacity,
  ] = useState(100);

  const [
    paintBrushFlow,
    setPaintBrushFlow,
  ] = useState(100);

  const [
    paintBrushSpacing,
    setPaintBrushSpacing,
  ] = useState(16);

  const [
    paintBrushSmoothing,
    setPaintBrushSmoothing,
  ] = useState(0);

  const [
    paintBrushMode,
    setPaintBrushMode,
  ] = useState<
    "paint" | "erase"
  >("paint");

  const [
    paintBrushBlendMode,
    setPaintBrushBlendMode,
  ] = useState<
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
  >("normal");

  const [
    paintPressureSize,
    setPaintPressureSize,
  ] = useState(false);

  const [
    paintPressureOpacity,
    setPaintPressureOpacity,
  ] = useState(false);

  const [
    maskBrushMode,
    setMaskBrushMode,
  ] = useState<
    "hide" | "reveal"
  >("hide");

  /* VIEW */

  const [zoom, setZoom] = useState(1);

  const [
    previewQuality,
    setPreviewQuality,
  ] = useState<
    | "fast"
    | "balanced"
    | "quality"
  >("fast");

  const previewMaxSize =
    previewQuality ===
      "fast"
      ? 800
      : previewQuality ===
          "quality"
        ? 1600
        : 1200;

  const [
    previewCachePurged,
    setPreviewCachePurged,
  ] = useState(false);

  function purgePreviewCache() {
    purgeLayerCanvasImageCache();

    setPreviewCachePurged(
      true
    );

    window.setTimeout(
      () => {
        setPreviewCachePurged(
          false
        );
      },
      1400
    );
  }

  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  const [
    snapEnabled,
    setSnapEnabled,
  ] = useState(true);

  const [
    showGrid,
    setShowGrid,
  ] = useState(false);

  const [
    gridSize,
    setGridSize,
  ] = useState(50);

  const [
    showGuides,
    setShowGuides,
  ] = useState(true);

  const [
    showRulers,
    setShowRulers,
  ] = useState(false);

  const [
    guidesX,
    setGuidesX,
  ] =
    useState<number[]>(
      []
    );

  const [
    guidesY,
    setGuidesY,
  ] =
    useState<number[]>(
      []
    );

  const [dragging, setDragging] =
    useState(false);

  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    panX: 0,
    panY: 0,
  });

  const touchPointers = useRef(
    new Map<
      number,
      { x: number; y: number }
    >()
  );

  const pinchStart = useRef({
    active: false,
    distance: 1,
    zoom: 1,
    centerX: 0,
    centerY: 0,
    panX: 0,
    panY: 0,
  });

  /* TRANSFORM */

  const [rotation, setRotation] =
    useState(0);

  const [straighten, setStraighten] =
    useState(0);

  const [
    flipHorizontal,
    setFlipHorizontal,
  ] = useState(false);

  const [
    flipVertical,
    setFlipVertical,
  ] = useState(false);

  /* HISTORY */

  const [
    history,
    setHistory,
  ] = useState<EditorSnapshot[]>([]);

  const [
    future,
    setFuture,
  ] = useState<EditorSnapshot[]>([]);

  /* CROP */

  const [crop, setCrop] =
    useState<CropRect>({
      ...DEFAULT_CROP,
    });

  const [cropAspect, setCropAspect] =
    useState<CropAspect>("free");

  const cropDrag =
    useRef<{
      mode: CropDragMode;
      startX: number;
      startY: number;
      startCrop: CropRect;
    }>({
      mode: null,
      startX: 0,
      startY: 0,
      startCrop: {
        ...DEFAULT_CROP,
      },
    });

  function createSnapshot(): EditorSnapshot {
    return {
      imageSrc:
        image?.src ?? null,

      fileName,

      settings:
        cloneSettings(
          settings
        ),

      rotation,

      straighten,

      flipHorizontal,

      flipVertical,

      layers:
        cloneLayers(
          layers
        ),

      groups:
        cloneGroups(
          groups
        ),

      selectedLayerId,
    };
  }

  function saveHistory() {
    if (!image) return;

    const snapshot =
      createSnapshot();

    setHistory(
      (previous) => {
        const updated = [
          ...previous,
          snapshot,
        ];

        return updated.slice(
          -30
        );
      }
    );

    setFuture([]);
  }

  function restoreSnapshot(
    snapshot: EditorSnapshot
  ) {
    const restoredLayers =
      cloneLayers(
        snapshot.layers
      );

    setLayers(
      restoredLayers
    );

    setGroups(
      cloneGroups(
        snapshot.groups ??
        []
      )
    );

    setSelectedLayerId(
      snapshot.selectedLayerId
    );

    setFileName(
      snapshot.fileName
    );

    setSettings(
      cloneSettings(
        snapshot.settings
      )
    );

    setRotation(
      snapshot.rotation
    );

    setStraighten(
      snapshot.straighten
    );

    setFlipHorizontal(
      snapshot.flipHorizontal
    );

    setFlipVertical(
      snapshot.flipVertical
    );

    setCrop({
      ...DEFAULT_CROP,
    });

    setCropAspect(
      "free"
    );

    setActiveTool(
      "move"
    );

    if (
      snapshot.imageSrc
    ) {
      const restored =
        new Image();

      restored.onload =
        () => {
          setImage(
            restored
          );
        };

      restored.src =
        snapshot.imageSrc;
    } else {
      setImage(
        null
      );
    }
  }

  function undo() {
    if (
      history.length === 0
    ) {
      return;
    }

    const previous =
      history[
        history.length - 1
      ];

    const current =
      createSnapshot();

    setFuture(
      (items) => [
        current,
        ...items,
      ]
    );

    setHistory(
      history.slice(
        0,
        -1
      )
    );

    restoreSnapshot(
      previous
    );
  }

  function redo() {
    if (
      future.length === 0
    ) {
      return;
    }

    const next =
      future[0];

    const current =
      createSnapshot();

    setHistory(
      (items) =>
        [
          ...items,
          current,
        ].slice(-30)
    );

    setFuture(
      future.slice(1)
    );

    restoreSnapshot(
      next
    );
  }

  function change(
    name: keyof Settings,
    value: number
  ) {
    setSettings(
      (previous: Settings) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function resetAll() {
    saveHistory();

    setSettings({
      ...DEFAULT_SETTINGS,
    });
  }

  function applyAdjustmentPreset(
    preset:
      AdjustmentPresetId
  ) {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    saveHistory();

    const preserveOpacity =
      settings.opacity;

    const presetValues:
      Partial<Settings> =
      preset ===
      "cinematic"
        ? {
            exposure:
              -0.1,

            contrast:
              24,

            highlights:
              -28,

            shadows:
              18,

            blacks:
              -18,

            temperature:
              -8,

            tint:
              3,

            vibrance:
              16,

            saturation:
              -6,

            clarity:
              12,

            dehaze:
              8,

            vignette:
              -18,

            grain:
              8,
          }
        : preset ===
            "warm"
          ? {
              exposure:
                0.1,

              contrast:
                10,

              highlights:
                -12,

              shadows:
                14,

              temperature:
                24,

              tint:
                4,

              vibrance:
                22,

              saturation:
                8,

              clarity:
                4,
            }
          : preset ===
              "cool"
            ? {
                exposure:
                  0.05,

                contrast:
                  12,

                highlights:
                  -10,

                shadows:
                  8,

                temperature:
                  -28,

                tint:
                  -3,

                vibrance:
                  12,

                saturation:
                  -4,

                clarity:
                  8,

                dehaze:
                  4,
              }
            : preset ===
                "matte"
              ? {
                  contrast:
                    -8,

                  highlights:
                    -24,

                  shadows:
                    22,

                  whites:
                    -10,

                  blacks:
                    30,

                  saturation:
                    -8,

                  fade:
                    28,

                  grain:
                    7,

                  vignette:
                    -8,
                }
              : preset ===
                  "black-white"
                ? {
                    contrast:
                      22,

                    highlights:
                      -18,

                    shadows:
                      18,

                    whites:
                      8,

                    blacks:
                      -20,

                    saturation:
                      -100,

                    clarity:
                      10,

                    grain:
                      6,

                    vignette:
                      -14,
                  }
                : {
                    exposure:
                      0.05,

                    contrast:
                      -6,

                    highlights:
                      -20,

                    shadows:
                      18,

                    blacks:
                      18,

                    temperature:
                      18,

                    tint:
                      5,

                    vibrance:
                      -6,

                    saturation:
                      -14,

                    fade:
                      22,

                    grain:
                      18,

                    vignette:
                      -12,
                  };

    setSettings({
      ...DEFAULT_SETTINGS,
      ...presetValues,

      /*
        Keep the user's chosen layer strength.
        The preset changes the look, not the
        current adjustment-layer opacity.
      */

      opacity:
        preserveOpacity,
    });
  }

  function toggleSelectedAdjustmentClip() {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id ===
            selectedLayer.id
              ? {
                  ...layer,

                  clipToBelow:
                    !layer.clipToBelow,
                }
              : layer
        )
    );
  }

  function updateSelectedToneCurve(
    channel:
      CurvesChannel,
    points:
      ToneCurvePoint[]
  ) {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    const normalized =
      normalizeToneCurve(
        points
      );

    setLayers(
      (items) =>
        items.map(
          (layer) => {
            if (
              layer.id !==
              selectedLayer.id
            ) {
              return layer;
            }

            if (
              channel ===
              "red"
            ) {
              return {
                ...layer,

                toneCurveRed:
                  normalized.map(
                    (point) => ({
                      ...point,
                    })
                  ),
              };
            }

            if (
              channel ===
              "green"
            ) {
              return {
                ...layer,

                toneCurveGreen:
                  normalized.map(
                    (point) => ({
                      ...point,
                    })
                  ),
              };
            }

            if (
              channel ===
              "blue"
            ) {
              return {
                ...layer,

                toneCurveBlue:
                  normalized.map(
                    (point) => ({
                      ...point,
                    })
                  ),
              };
            }

            return {
              ...layer,

              toneCurve:
                normalized.map(
                  (point) => ({
                    ...point,
                  })
                ),
            };
          }
        )
    );
  }

  function updateSelectedHslMixer(
    mixer:
      HslColorMixer
  ) {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    const normalized =
      normalizeHslColorMixer(
        mixer
      );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id ===
            selectedLayer.id
              ? {
                  ...layer,

                  hslMixer:
                    cloneHslColorMixer(
                      normalized
                    ),
                }
              : layer
        )
    );
  }

  function resetSelectedHslMixer() {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    saveHistory();

    updateSelectedHslMixer(
      DEFAULT_HSL_MIXER
    );
  }

  function updateSelectedColorGrading(
    grading:
      ColorGradingData
  ) {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    const normalized =
      normalizeColorGrading(
        grading
      );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id ===
            selectedLayer.id
              ? {
                  ...layer,

                  colorGrading:
                    cloneColorGrading(
                      normalized
                    ),
                }
              : layer
        )
    );
  }

  function resetSelectedColorGrading() {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    saveHistory();

    updateSelectedColorGrading(
      DEFAULT_COLOR_GRADING
    );
  }

  function resetSelectedAdjustment() {
    if (
      !selectedLayer ||
      selectedLayer.layerKind !==
        "adjustment" ||
      selectedLayer.locked
    ) {
      return;
    }

    saveHistory();

    setSettings({
      ...DEFAULT_SETTINGS,

      opacity:
        settings.opacity,
    });

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id ===
            selectedLayer.id
              ? {
                  ...layer,

                  toneCurve:
                    DEFAULT_TONE_CURVE.map(
                      (point) => ({
                        ...point,
                      })
                    ),

                  toneCurveRed:
                    DEFAULT_TONE_CURVE.map(
                      (point) => ({
                        ...point,
                      })
                    ),

                  toneCurveGreen:
                    DEFAULT_TONE_CURVE.map(
                      (point) => ({
                        ...point,
                      })
                    ),

                  toneCurveBlue:
                    DEFAULT_TONE_CURVE.map(
                      (point) => ({
                        ...point,
                      })
                    ),

                  hslMixer:
                    cloneHslColorMixer(
                      DEFAULT_HSL_MIXER
                    ),

                  colorGrading:
                    cloneColorGrading(
                      DEFAULT_COLOR_GRADING
                    ),
                }
              : layer
        )
    );
  }

  /* LAYER HELPERS */

  function updateLayerTransform(
    id: string,
    changes: Partial<ImageLayer>
  ) {
    const target = layers.find(
      (layer) => layer.id === id
    );

    if (!target || target.locked) return;

    setLayers((items) =>
      items.map((layer) =>
        layer.id === id
          ? { ...layer, ...changes }
          : layer
      )
    );

    if (id === selectedLayerId) {
      if (changes.rotation !== undefined) {
        setRotation(changes.rotation);
        setStraighten(0);
      }

      if (changes.flipHorizontal !== undefined) {
        setFlipHorizontal(changes.flipHorizontal);
      }

      if (changes.flipVertical !== undefined) {
        setFlipVertical(changes.flipVertical);
      }

      if (changes.opacity !== undefined) {
        setSettings((previous) => ({
          ...previous,
          opacity: changes.opacity as number,
        }));
      }
    }
  }

  function changeLayerMaskFeather(
    id: string,
    value: number
  ) {
    const nextValue =
      Math.max(
        0,
        Math.min(
          100,
          value
        )
      );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  maskFeather:
                    nextValue,
                }
              : layer
        )
    );
  }

  function changeLayerMaskDensity(
    id: string,
    value: number
  ) {
    const nextValue =
      Math.max(
        0,
        Math.min(
          100,
          value
        )
      );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  maskDensity:
                    nextValue,
                }
              : layer
        )
    );
  }

  function updateLayerMaskSrc(
    id: string,
    maskSrc: string
  ) {
    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  maskSrc,
                }
              : layer
        )
    );
  }

  function updateLayerSource(
    id: string,
    src: string
  ) {
    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  src,
                }
              : layer
        )
    );

    if (
      selectedLayerId ===
      id
    ) {
      const nextImage =
        new Image();

      nextImage.onload =
        () => {
          setImage(
            nextImage
          );
        };

      nextImage.src =
        src;
    }
  }

  function fillLayerMask(
    id: string,
    reveal: boolean
  ) {
    const target =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !target ||
      target.locked ||
      !target.maskSrc
    ) {
      return;
    }

    const image =
      new Image();

    image.onload = () => {
      const maskCanvas =
        document.createElement(
          "canvas"
        );

      maskCanvas.width =
        Math.max(
          1,
          image.naturalWidth
        );

      maskCanvas.height =
        Math.max(
          1,
          image.naturalHeight
        );

      const context =
        maskCanvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      /*
        Reveal All / Hide All should match
        what the user sees even when the
        mask itself is inverted.
      */

      const inverted =
        target.maskInverted ??
        false;

      const rawWhite =
        inverted
          ? !reveal
          : reveal;

      context.fillStyle =
        rawWhite
          ? "#ffffff"
          : "#000000";

      context.fillRect(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );

      saveHistory();

      setLayers(
        (items) =>
          items.map(
            (layer) =>
              layer.id === id
                ? {
                    ...layer,
                    maskSrc:
                      maskCanvas.toDataURL(
                        "image/png"
                      ),
                    maskEnabled:
                      true,
                  }
                : layer
          )
      );
    };

    image.src =
      target.src;
  }

  function revealAllLayerMask(
    id: string
  ) {
    fillLayerMask(
      id,
      true
    );
  }

  function hideAllLayerMask(
    id: string
  ) {
    fillLayerMask(
      id,
      false
    );
  }

  function addLayerMask(
    id: string
  ) {
    const target =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !target ||
      target.locked ||
      target.maskSrc
    ) {
      return;
    }

    const image =
      new Image();

    image.onload = () => {
      const maskCanvas =
        document.createElement(
          "canvas"
        );

      maskCanvas.width =
        Math.max(
          1,
          image.naturalWidth
        );

      maskCanvas.height =
        Math.max(
          1,
          image.naturalHeight
        );

      const context =
        maskCanvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      /*
        New masks start white:
        the whole layer remains visible.
      */

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );

      const maskSrc =
        maskCanvas.toDataURL(
          "image/png"
        );

      saveHistory();

      setLayers(
        (items) =>
          items.map(
            (layer) =>
              layer.id === id
                ? {
                    ...layer,
                    maskSrc,
                    maskEnabled:
                      true,
                    maskInverted:
                      false,
                    maskDensity:
                      100,
                    maskFeather:
                      0,
                  }
                : layer
          )
      );
    };

    image.src =
      target.src;
  }

  function toggleLayerMask(
    id: string
  ) {
    const target =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !target ||
      target.locked ||
      !target.maskSrc
    ) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  maskEnabled:
                    !(
                      layer.maskEnabled ??
                      true
                    ),
                }
              : layer
        )
    );
  }

  function invertLayerMask(
    id: string
  ) {
    const target =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !target ||
      target.locked ||
      !target.maskSrc
    ) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  maskInverted:
                    !(
                      layer.maskInverted ??
                      false
                    ),
                }
              : layer
        )
    );
  }

  function removeLayerMask(
    id: string
  ) {
    const target =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !target ||
      target.locked ||
      !target.maskSrc
    ) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  maskSrc:
                    null,
                  maskEnabled:
                    true,
                  maskInverted:
                    false,
                  maskDensity:
                    100,
                  maskFeather:
                    0,
                }
              : layer
        )
    );
  }

  function changeLayerBlendMode(
    id: string,
    mode: BlendMode
  ) {
    const target =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !target ||
      target.locked ||
      target.blendMode === mode
    ) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,
                  blendMode: mode,
                }
              : layer
        )
    );
  }

  function changeLayerOpacity(
    id: string,
    value: number
  ) {
    updateLayerTransform(
      id,
      {
        opacity:
          Math.max(
            0,
            Math.min(
              100,
              value
            )
          ),
      }
    );
  }

  function resetLayerTransform(id: string) {
    saveHistory();

    updateLayerTransform(id, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
      opacity: 100,
    });
  }

  function showLayerInEditor(
    layer: ImageLayer,
    resetView = true
  ) {
    const img = new Image();

    img.onload = () => {
      setImage(img);
      setFileName(layer.name);
      setSettings({
        ...layer.settings,
        opacity: layer.opacity,
      });
      setRotation(layer.rotation);
      setStraighten(0);
      setFlipHorizontal(layer.flipHorizontal);
      setFlipVertical(layer.flipVertical);

      if (resetView) {
        setZoom(1);
        setPan({
          x: 0,
          y: 0,
        });
        setActiveTool("move");
      }
    };

    img.src = layer.src;
  }

  function selectLayerFromCanvas(
    id: string
  ) {
    const layer =
      layers.find(
        (item) =>
          item.id === id
      );

    if (!layer) return;

    setSelectedLayerId(
      id
    );

    setSelectedLayerIds([
      id,
    ]);

    /*
      Canvas selection should not reset
      zoom or pan while the user is
      working in the document.
    */

    showLayerInEditor(
      layer,
      false
    );
  }

  function deselectLayer() {
    setSelectedLayerId(
      null
    );

    setSelectedLayerIds(
      []
    );
  }

  function selectLayer(
    id: string,
    options?: {
      toggle?: boolean;
      range?: boolean;
    }
  ) {
    const layer =
      layers.find(
        (item) =>
          item.id === id
      );

    if (!layer) {
      return;
    }

    /*
      Shift selects a continuous range in the same
      top-to-bottom order shown by the Layers panel.
    */

    if (
      options?.range &&
      selectedLayerId
    ) {
      const displayOrder =
        [...layers].reverse();

      const anchorIndex =
        displayOrder.findIndex(
          (item) =>
            item.id ===
            selectedLayerId
        );

      const targetIndex =
        displayOrder.findIndex(
          (item) =>
            item.id ===
            id
        );

      if (
        anchorIndex >=
          0 &&
        targetIndex >=
          0
      ) {
        const start =
          Math.min(
            anchorIndex,
            targetIndex
          );

        const end =
          Math.max(
            anchorIndex,
            targetIndex
          );

        const rangeIds =
          displayOrder
            .slice(
              start,
              end + 1
            )
            .map(
              (item) =>
                item.id
            );

        setSelectedLayerIds(
          rangeIds
        );

        setSelectedLayerId(
          id
        );

        showLayerInEditor(
          layer
        );

        return;
      }
    }

    /*
      Ctrl/Cmd toggles one layer without discarding the
      rest of the current multi-selection.
    */

    if (
      options?.toggle
    ) {
      const alreadySelected =
        selectedLayerIds.includes(
          id
        );

      if (
        alreadySelected
      ) {
        const next =
          selectedLayerIds.filter(
            (selectedId) =>
              selectedId !==
              id
          );

        setSelectedLayerIds(
          next
        );

        if (
          selectedLayerId ===
            id
        ) {
          const nextPrimaryId =
            next[
              next.length -
                1
            ] ??
            null;

          setSelectedLayerId(
            nextPrimaryId
          );

          if (
            nextPrimaryId
          ) {
            const nextPrimary =
              layers.find(
                (item) =>
                  item.id ===
                  nextPrimaryId
              );

            if (
              nextPrimary
            ) {
              showLayerInEditor(
                nextPrimary
              );
            }
          }
        }

        return;
      }

      setSelectedLayerIds(
        [
          ...selectedLayerIds,
          id,
        ]
      );

      setSelectedLayerId(
        id
      );

      showLayerInEditor(
        layer
      );

      return;
    }

    setSelectedLayerIds([
      id,
    ]);

    setSelectedLayerId(
      id
    );

    showLayerInEditor(
      layer
    );
  }

  function renameLayer(
    id: string,
    name: string
  ) {
    const trimmedName =
      name.trim();

    if (!trimmedName) {
      return;
    }

    const layer =
      layers.find(
        (item) =>
          item.id === id
      );

    if (
      !layer ||
      layer.name ===
        trimmedName
    ) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  name:
                    trimmedName,
                }
              : item
        )
    );

    /*
      Keep the legacy selected-image
      filename display synchronized too.
    */

    if (
      selectedLayerId ===
      id
    ) {
      setFileName(
        trimmedName
      );
    }
  }

  function reorderLayer(
    draggedId: string,
    targetId: string,
    position: "before" | "after"
  ) {
    if (
      draggedId === targetId
    ) {
      return;
    }

    /*
      The Layers panel displays top -> bottom,
      while our internal array is bottom -> top.
      Reorder in display order first, then reverse
      back into the renderer's order.
    */

    const displayOrder =
      [...layers].reverse();

    const draggedIndex =
      displayOrder.findIndex(
        (layer) =>
          layer.id ===
          draggedId
      );

    const targetIndexBeforeRemoval =
      displayOrder.findIndex(
        (layer) =>
          layer.id ===
          targetId
      );

    if (
      draggedIndex < 0 ||
      targetIndexBeforeRemoval < 0
    ) {
      return;
    }

    const nextDisplayOrder =
      [...displayOrder];

    const [draggedLayer] =
      nextDisplayOrder.splice(
        draggedIndex,
        1
      );

    const targetIndex =
      nextDisplayOrder.findIndex(
        (layer) =>
          layer.id ===
          targetId
      );

    if (targetIndex < 0) {
      return;
    }

    const insertIndex =
      position === "before"
        ? targetIndex
        : targetIndex + 1;

    nextDisplayOrder.splice(
      insertIndex,
      0,
      draggedLayer
    );

    const nextLayers =
      [...nextDisplayOrder].reverse();

    const changed =
      nextLayers.some(
        (layer, index) =>
          layer.id !==
          layers[index]?.id
      );

    if (!changed) {
      return;
    }

    saveHistory();

    setLayers(
      nextLayers
    );
  }

  function createLayerGroup() {
    if (
      layers.length === 0
    ) {
      return;
    }

    saveHistory();

    const group: LayerGroup = {
      id:
        createGroupId(),

      name:
        `Group ${
          groups.length +
          1
        }`,

      collapsed:
        false,

      visible:
        true,

      locked:
        false,
    };

    setGroups(
      (items) => [
        ...items,
        group,
      ]
    );

    if (
      selectedLayerId
    ) {
      setLayers(
        (items) =>
          items.map(
            (layer) =>
              layer.id ===
              selectedLayerId
                ? {
                    ...layer,

                    groupId:
                      group.id,

                    visible:
                      group.visible,

                    locked:
                      group.locked,
                  }
                : layer
          )
      );
    }
  }

  function toggleLayerGroupVisible(
    id: string
  ) {
    const group =
      groups.find(
        (item) =>
          item.id === id
      );

    if (!group) {
      return;
    }

    saveHistory();

    const nextVisible =
      !group.visible;

    setGroups(
      (items) =>
        items.map(
          (item) =>
            item.id === id
              ? {
                  ...item,

                  visible:
                    nextVisible,
                }
              : item
        )
    );

    /*
      Apply the folder visibility state to
      every current child layer. This means
      the existing renderer/export system can
      continue using layer.visible normally.
    */

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.groupId === id
              ? {
                  ...layer,

                  visible:
                    nextVisible,
                }
              : layer
        )
    );
  }

  function toggleLayerGroupLock(
    id: string
  ) {
    const group =
      groups.find(
        (item) =>
          item.id === id
      );

    if (!group) {
      return;
    }

    saveHistory();

    const nextLocked =
      !group.locked;

    setGroups(
      (items) =>
        items.map(
          (item) =>
            item.id === id
              ? {
                  ...item,

                  locked:
                    nextLocked,
                }
              : item
        )
    );

    /*
      Apply the folder lock to each child.
      Existing transform/text/shape/mask logic
      already respects layer.locked.
    */

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.groupId === id
              ? {
                  ...layer,

                  locked:
                    nextLocked,
                }
              : layer
        )
    );
  }

  function toggleLayerGroupCollapsed(
    id: string
  ) {
    if (
      !groups.some(
        (group) =>
          group.id === id
      )
    ) {
      return;
    }

    /*
      Folder open/closed state is a project UI
      property. It is persisted by autosave and
      .sihag project files through the group data.
    */

    setGroups(
      (items) =>
        items.map(
          (group) =>
            group.id === id
              ? {
                  ...group,

                  collapsed:
                    !group.collapsed,
                }
              : group
        )
    );
  }

  function renameLayerGroup(
    id: string,
    name: string
  ) {
    const trimmed =
      name.trim();

    const current =
      groups.find(
        (group) =>
          group.id === id
      );

    if (
      !trimmed ||
      !current ||
      current.name ===
        trimmed
    ) {
      return;
    }

    saveHistory();

    setGroups(
      (items) =>
        items.map(
          (group) =>
            group.id === id
              ? {
                  ...group,
                  name:
                    trimmed,
                }
              : group
        )
    );
  }

  function moveLayerGroup(
    id: string,
    dx: number,
    dy: number
  ) {
    const group =
      groups.find(
        (item) =>
          item.id === id
      );

    if (
      !group ||
      group.locked
    ) {
      return;
    }

    const hasLayers =
      layers.some(
        (layer) =>
          layer.groupId === id
      );

    if (!hasLayers) {
      return;
    }

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.groupId === id
              ? {
                  ...layer,

                  x:
                    layer.x +
                    dx,

                  y:
                    layer.y +
                    dy,
                }
              : layer
        )
    );
  }

  function bringLayerGroupToFront(
    id: string
  ) {
    const groupLayers =
      layers.filter(
        (layer) =>
          layer.groupId === id
      );

    if (
      groupLayers.length === 0
    ) {
      return;
    }

    saveHistory();

    /*
      Layer array order is bottom -> top.
      Appending the group's layers therefore
      brings the complete folder to the front.
      Relative order inside the folder stays
      exactly the same.
    */

    const otherLayers =
      layers.filter(
        (layer) =>
          layer.groupId !== id
      );

    setLayers([
      ...otherLayers,
      ...groupLayers,
    ]);
  }

  function sendLayerGroupToBack(
    id: string
  ) {
    const groupLayers =
      layers.filter(
        (layer) =>
          layer.groupId === id
      );

    if (
      groupLayers.length === 0
    ) {
      return;
    }

    saveHistory();

    /*
      Prepending the group's layers sends the
      entire folder behind every other layer.
    */

    const otherLayers =
      layers.filter(
        (layer) =>
          layer.groupId !== id
      );

    setLayers([
      ...groupLayers,
      ...otherLayers,
    ]);
  }

  function duplicateLayerGroup(
    id: string
  ) {
    const sourceGroup =
      groups.find(
        (group) =>
          group.id === id
      );

    if (!sourceGroup) {
      return;
    }

    saveHistory();

    const newGroupId =
      createGroupId();

    const copyGroup:
      LayerGroup = {
        ...sourceGroup,

        id:
          newGroupId,

        name:
          `${sourceGroup.name} copy`,

        collapsed:
          false,
      };

    const sourceLayers =
      layers.filter(
        (layer) =>
          layer.groupId === id
      );

    const copiedLayers =
      sourceLayers.map(
        (source) => ({
          ...source,

          id:
            createLayerId(),

          name:
            `${source.name} copy`,

          groupId:
            newGroupId,

          x:
            source.x +
            30,

          y:
            source.y +
            30,

          settings: {
            ...source.settings,
          },

          text:
            source.text
              ? {
                  ...source.text,
                }
              : null,

          shape:
            source.shape
              ? {
                  ...source.shape,
                }
              : null,

          toneCurve:
            source.toneCurve
              ? source.toneCurve.map(
                  (point) => ({
                    ...point,
                  })
                )
              : undefined,

          toneCurveRed:
            source.toneCurveRed
              ? source.toneCurveRed.map(
                  (point) => ({
                    ...point,
                  })
                )
              : undefined,

          toneCurveGreen:
            source.toneCurveGreen
              ? source.toneCurveGreen.map(
                  (point) => ({
                    ...point,
                  })
                )
              : undefined,

          toneCurveBlue:
            source.toneCurveBlue
              ? source.toneCurveBlue.map(
                  (point) => ({
                    ...point,
                  })
                )
              : undefined,

          hslMixer:
            source.hslMixer
              ? cloneHslColorMixer(
                  source.hslMixer
                )
              : undefined,

          colorGrading:
            source.colorGrading
              ? cloneColorGrading(
                  source.colorGrading
                )
              : undefined,
        })
      );

    setGroups(
      (items) => [
        ...items,
        copyGroup,
      ]
    );

    if (
      copiedLayers.length === 0
    ) {
      return;
    }

    const sourceIds =
      new Set(
        sourceLayers.map(
          (layer) =>
            layer.id
        )
      );

    let highestIndex =
      -1;

    layers.forEach(
      (layer, index) => {
        if (
          sourceIds.has(
            layer.id
          )
        ) {
          highestIndex =
            Math.max(
              highestIndex,
              index
            );
        }
      }
    );

    const insertionIndex =
      highestIndex >= 0
        ? highestIndex + 1
        : layers.length;

    const nextLayers =
      [...layers];

    nextLayers.splice(
      insertionIndex,
      0,
      ...copiedLayers
    );

    setLayers(
      nextLayers
    );

    const selectedCopy =
      copiedLayers[
        copiedLayers.length -
        1
      ];

    setSelectedLayerId(
      selectedCopy.id
    );

    showLayerInEditor(
      selectedCopy
    );
  }

  function deleteLayerGroup(
    id: string
  ) {
    if (
      !groups.some(
        (group) =>
          group.id === id
      )
    ) {
      return;
    }

    saveHistory();

    setGroups(
      (items) =>
        items.filter(
          (group) =>
            group.id !== id
        )
    );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.groupId === id
              ? {
                  ...layer,
                  groupId:
                    null,
                }
              : layer
        )
    );
  }

  function assignLayerGroup(
    layerId: string,
    groupId:
      string | null
  ) {
    const layer =
      layers.find(
        (item) =>
          item.id ===
          layerId
      );

    if (!layer) {
      return;
    }

    const nextGroupId =
      groupId &&
      groups.some(
        (group) =>
          group.id ===
          groupId
      )
        ? groupId
        : null;

    if (
      layer.groupId ===
      nextGroupId
    ) {
      return;
    }

    saveHistory();

    const targetGroup =
      nextGroupId
        ? groups.find(
            (group) =>
              group.id ===
              nextGroupId
          ) ??
          null
        : null;

    setLayers(
      (items) =>
        items.map(
          (item) =>
            item.id ===
            layerId
              ? {
                  ...item,

                  groupId:
                    nextGroupId,

                  visible:
                    targetGroup
                      ? targetGroup.visible
                      : item.visible,

                  locked:
                    targetGroup
                      ? targetGroup.locked
                      : item.locked,
                }
              : item
        )
    );
  }

  function toggleLayerVisible(id: string) {
    saveHistory();

    setLayers((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, visible: !item.visible }
          : item
      )
    );
  }

  function toggleLayerLock(id: string) {
    saveHistory();

    setLayers((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, locked: !item.locked }
          : item
      )
    );
  }

  function createBakedRasterLayer(
    src: string,
    name: string,
    groupId:
      string | null =
        null
  ): ImageLayer {
    return {
      id:
        createLayerId(),

      name,

      layerKind:
        "image",

      text:
        null,

      shape:
        null,

      groupId,

      src,

      visible:
        true,

      locked:
        false,

      opacity:
        100,

      blendMode:
        "normal",

      maskSrc:
        null,

      maskEnabled:
        true,

      maskInverted:
        false,

      maskDensity:
        100,

      maskFeather:
        0,

      x:
        0,

      y:
        0,

      scale:
        1,

      rotation:
        0,

      flipHorizontal:
        false,

      flipVertical:
        false,

      settings: {
        ...DEFAULT_SETTINGS,
      },
    };
  }

  function cleanUnusedGroups(
    nextLayers:
      ImageLayer[]
  ) {
    setGroups(
      (items) =>
        items.filter(
          (group) =>
            nextLayers.some(
              (layer) =>
                layer.groupId ===
                group.id
            )
        )
    );
  }

  function rasterizeSelectedLayer() {
    if (
      !selectedLayer ||
      selectedLayer.locked ||
      (
        selectedLayer.layerKind !==
          "text" &&
        selectedLayer.layerKind !==
          "shape"
      )
    ) {
      return;
    }

    saveHistory();

    const nextLayer:
      ImageLayer = {
        ...selectedLayer,

        layerKind:
          "image",

        text:
          null,

        shape:
          null,

        name:
          `${selectedLayer.name} (Rasterized)`,
      };

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id ===
            selectedLayer.id
              ? nextLayer
              : layer
        )
    );

    setSelectedLayerId(
      nextLayer.id
    );

    showLayerInEditor(
      nextLayer
    );
  }

  async function mergeSelectedLayerDown() {
    if (
      !selectedLayer ||
      selectedLayer.locked
    ) {
      return;
    }

    const selectedIndex =
      layers.findIndex(
        (layer) =>
          layer.id ===
          selectedLayer.id
      );

    if (
      selectedIndex <=
      0
    ) {
      return;
    }

    const below =
      layers[
        selectedIndex -
          1
      ];

    /*
      An adjustment layer has no independent raster
      surface underneath another visual layer, so it
      cannot be used as the lower merge target.
      An adjustment layer CAN be the selected/top layer:
      Merge Down then bakes its effect into the visual
      layer immediately below.
    */

    if (
      !below ||
      below.locked ||
      below.layerKind ===
        "adjustment"
    ) {
      return;
    }

    const ids =
      new Set([
        below.id,
        selectedLayer.id,
      ]);

    /*
      Keep the complete stack as the rendering reference
      so document dimensions stay unchanged, but render
      only the two layers being merged.
    */

    const isolatedStack =
      layers.map(
        (layer) => ({
          ...layer,

          visible:
            ids.has(
              layer.id
            ),
        })
      );

    const mergedCanvas =
      document.createElement(
        "canvas"
      );

    await renderLayerStack(
      mergedCanvas,
      isolatedStack,
      null
    );

    const src =
      mergedCanvas.toDataURL(
        "image/png"
      );

    const sharedGroupId =
      below.groupId ===
      selectedLayer.groupId
        ? below.groupId ??
          null
        : null;

    const mergedLayer =
      createBakedRasterLayer(
        src,
        `${below.name} + ${selectedLayer.name}`,
        sharedGroupId
      );

    const nextLayers =
      layers.filter(
        (layer) =>
          !ids.has(
            layer.id
          )
      );

    nextLayers.splice(
      selectedIndex -
        1,
      0,
      mergedLayer
    );

    saveHistory();

    setLayers(
      nextLayers
    );

    cleanUnusedGroups(
      nextLayers
    );

    setSelectedLayerId(
      mergedLayer.id
    );

    showLayerInEditor(
      mergedLayer
    );
  }

  async function mergeVisibleLayers() {
    const visibleLayers =
      layers.filter(
        (layer) =>
          layer.visible
      );

    if (
      visibleLayers.length <
      2
    ) {
      return;
    }

    const mergedCanvas =
      document.createElement(
        "canvas"
      );

    await renderLayerStack(
      mergedCanvas,
      layers,
      null
    );

    const src =
      mergedCanvas.toDataURL(
        "image/png"
      );

    const visibleIds =
      new Set(
        visibleLayers.map(
          (layer) =>
            layer.id
        )
      );

    const topVisibleIndex =
      layers.reduce(
        (
          result,
          layer,
          index
        ) =>
          layer.visible
            ? index
            : result,
        -1
      );

    const visibleGroupIds =
      new Set(
        visibleLayers.map(
          (layer) =>
            layer.groupId ??
            null
        )
      );

    const groupId =
      visibleGroupIds.size ===
      1
        ? visibleLayers[0]
            .groupId ??
          null
        : null;

    const mergedLayer =
      createBakedRasterLayer(
        src,
        "Merged Visible",
        groupId
      );

    const nextLayers:
      ImageLayer[] =
        [];

    layers.forEach(
      (
        layer,
        index
      ) => {
        if (
          index ===
          topVisibleIndex
        ) {
          nextLayers.push(
            mergedLayer
          );
        }

        if (
          !visibleIds.has(
            layer.id
          )
        ) {
          nextLayers.push(
            layer
          );
        }
      }
    );

    saveHistory();

    setLayers(
      nextLayers
    );

    cleanUnusedGroups(
      nextLayers
    );

    setSelectedLayerId(
      mergedLayer.id
    );

    showLayerInEditor(
      mergedLayer
    );
  }

  async function flattenImage() {
    if (
      layers.length ===
      0
    ) {
      return;
    }

    const flattenedCanvas =
      document.createElement(
        "canvas"
      );

    await renderLayerStack(
      flattenedCanvas,
      layers,
      null
    );

    const src =
      flattenedCanvas.toDataURL(
        "image/png"
      );

    const flattenedLayer =
      createBakedRasterLayer(
        src,
        "Flattened Image"
      );

    saveHistory();

    setLayers([
      flattenedLayer,
    ]);

    setGroups(
      []
    );

    setSelectedLayerId(
      flattenedLayer.id
    );

    setFileName(
      "Flattened Image"
    );

    showLayerInEditor(
      flattenedLayer
    );
  }

  type LayerAlignment =
    | "left"
    | "center-x"
    | "right"
    | "top"
    | "center-y"
    | "bottom"
    | "center-both";

  async function loadAlignmentImage(
    src: string
  ) {
    return await new Promise<HTMLImageElement>(
      (
        resolve,
        reject
      ) => {
        const nextImage =
          new Image();

        nextImage.onload =
          () =>
            resolve(
              nextImage
            );

        nextImage.onerror =
          () =>
            reject(
              new Error(
                "Could not load layer image."
              )
            );

        nextImage.src =
          src;
      }
    );
  }

  async function alignSelectedLayer(
    alignment:
      LayerAlignment
  ) {
    if (
      !selectedLayer ||
      selectedLayer.locked ||
      selectedLayer.layerKind ===
        "adjustment"
    ) {
      return;
    }

    const documentReference =
      layers[0];

    if (
      !documentReference
    ) {
      return;
    }

    try {
      const [
        documentImage,
        layerImage,
      ] =
        await Promise.all([
          loadAlignmentImage(
            documentReference.src
          ),

          loadAlignmentImage(
            selectedLayer.src
          ),
        ]);

      const documentWidth =
        Math.max(
          1,
          documentImage.naturalWidth
        );

      const documentHeight =
        Math.max(
          1,
          documentImage.naturalHeight
        );

      const sourceWidth =
        Math.max(
          1,
          layerImage.naturalWidth
        );

      const sourceHeight =
        Math.max(
          1,
          layerImage.naturalHeight
        );

      /*
        Use the axis-aligned bounding box of the
        rotated visual layer. This keeps edge
        alignment correct even when the layer has
        been rotated.
      */

      const angle =
        (
          selectedLayer.rotation *
          Math.PI
        ) /
        180;

      const cosine =
        Math.abs(
          Math.cos(
            angle
          )
        );

      const sine =
        Math.abs(
          Math.sin(
            angle
          )
        );

      const safeScale =
        Math.max(
          0.0001,
          Math.abs(
            selectedLayer.scale
          )
        );

      const visualWidth =
        (
          sourceWidth *
            cosine +
          sourceHeight *
            sine
        ) *
        safeScale;

      const visualHeight =
        (
          sourceWidth *
            sine +
          sourceHeight *
            cosine
        ) *
        safeScale;

      let nextX =
        selectedLayer.x;

      let nextY =
        selectedLayer.y;

      if (
        alignment ===
          "left"
      ) {
        nextX =
          -documentWidth /
            2 +
          visualWidth /
            2;
      } else if (
        alignment ===
          "center-x" ||
        alignment ===
          "center-both"
      ) {
        nextX =
          0;
      } else if (
        alignment ===
          "right"
      ) {
        nextX =
          documentWidth /
            2 -
          visualWidth /
            2;
      }

      if (
        alignment ===
          "top"
      ) {
        nextY =
          -documentHeight /
            2 +
          visualHeight /
            2;
      } else if (
        alignment ===
          "center-y" ||
        alignment ===
          "center-both"
      ) {
        nextY =
          0;
      } else if (
        alignment ===
          "bottom"
      ) {
        nextY =
          documentHeight /
            2 -
          visualHeight /
            2;
      }

      saveHistory();

      setLayers(
        (items) =>
          items.map(
            (layer) =>
              layer.id ===
              selectedLayer.id
                ? {
                    ...layer,
                    x:
                      nextX,
                    y:
                      nextY,
                  }
                : layer
          )
      );

      /*
        Keep the editor transform controls synced
        with the newly aligned selected layer.
      */

      setSelectedLayerId(
        selectedLayer.id
      );
    } catch {
      /*
        If a layer image fails to load, leave the
        document untouched rather than guessing
        its dimensions.
      */
    }
  }

  type DistributionAxis =
    | "horizontal"
    | "vertical";

  async function getVisualLayerBounds(
    layer:
      ImageLayer
  ) {
    if (
      layer.layerKind ===
        "adjustment"
    ) {
      return null;
    }

    const layerImage =
      await loadAlignmentImage(
        layer.src
      );

    const sourceWidth =
      Math.max(
        1,
        layerImage.naturalWidth
      );

    const sourceHeight =
      Math.max(
        1,
        layerImage.naturalHeight
      );

    const angle =
      (
        layer.rotation *
        Math.PI
      ) /
      180;

    const cosine =
      Math.abs(
        Math.cos(
          angle
        )
      );

    const sine =
      Math.abs(
        Math.sin(
          angle
        )
      );

    const safeScale =
      Math.max(
        0.0001,
        Math.abs(
          layer.scale
        )
      );

    const width =
      (
        sourceWidth *
          cosine +
        sourceHeight *
          sine
      ) *
      safeScale;

    const height =
      (
        sourceWidth *
          sine +
        sourceHeight *
          cosine
      ) *
      safeScale;

    return {
      id:
        layer.id,

      x:
        layer.x,

      y:
        layer.y,

      width,

      height,

      left:
        layer.x -
        width /
          2,

      right:
        layer.x +
        width /
          2,

      top:
        layer.y -
        height /
          2,

      bottom:
        layer.y +
        height /
          2,
    };
  }

  function getMovableSelectedLayers() {
    const ids =
      new Set(
        selectedLayerIds
      );

    return layers.filter(
      (layer) =>
        ids.has(
          layer.id
        ) &&
        !layer.locked &&
        layer.layerKind !==
          "adjustment"
    );
  }

  async function distributeSelectedLayers(
    axis:
      DistributionAxis
  ) {
    const selected =
      getMovableSelectedLayers();

    if (
      selected.length <
      3
    ) {
      return;
    }

    try {
      const loaded =
        await Promise.all(
          selected.map(
            getVisualLayerBounds
          )
        );

      const bounds =
        loaded.filter(
          (
            item
          ): item is
            NonNullable<
              typeof item
            > =>
              item !==
              null
        );

      if (
        bounds.length <
        3
      ) {
        return;
      }

      const sorted =
        [...bounds].sort(
          (
            first,
            second
          ) =>
            axis ===
              "horizontal"
              ? first.left -
                second.left
              : first.top -
                second.top
        );

      const first =
        sorted[0];

      const last =
        sorted[
          sorted.length -
            1
        ];

      const occupied =
        sorted.reduce(
          (
            total,
            item
          ) =>
            total +
            (
              axis ===
                "horizontal"
                ? item.width
                : item.height
            ),
          0
        );

      const outerSpan =
        axis ===
          "horizontal"
          ? last.right -
            first.left
          : last.bottom -
            first.top;

      const gap =
        (
          outerSpan -
          occupied
        ) /
        (
          sorted.length -
          1
        );

      const changes =
        new Map<
          string,
          {
            x?: number;
            y?: number;
          }
        >();

      let cursor =
        axis ===
          "horizontal"
          ? first.left
          : first.top;

      sorted.forEach(
        (
          item,
          index
        ) => {
          const size =
            axis ===
              "horizontal"
              ? item.width
              : item.height;

          if (
            index ===
              0 ||
            index ===
              sorted.length -
                1
          ) {
            cursor +=
              size +
              gap;

            return;
          }

          const center =
            cursor +
            size /
              2;

          changes.set(
            item.id,
            axis ===
              "horizontal"
              ? {
                  x:
                    center,
                }
              : {
                  y:
                    center,
                }
          );

          cursor +=
            size +
            gap;
        }
      );

      if (
        changes.size ===
        0
      ) {
        return;
      }

      saveHistory();

      setLayers(
        (items) =>
          items.map(
            (layer) => {
              const change =
                changes.get(
                  layer.id
                );

              return change
                ? {
                    ...layer,
                    ...change,
                  }
                : layer;
            }
          )
      );
    } catch {
      /*
        Leave the document untouched if any selected
        visual layer cannot provide reliable dimensions.
      */
    }
  }

  function duplicateLayer(id: string) {
    const index = layers.findIndex((item) => item.id === id);

    if (index === -1) return;

    saveHistory();

    const source = layers[index];
    const copy: ImageLayer = {
      ...source,
      id: createLayerId(),
      name: `${source.name} copy`,
      x: source.x + 30,
      y: source.y + 30,
      settings: { ...source.settings },

      text:
        source.text
          ? {
              ...source.text,
            }
          : null,

      shape:
        source.shape
          ? {
              ...source.shape,
            }
          : null,

      toneCurve:
        source.toneCurve
          ? source.toneCurve.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      toneCurveRed:
        source.toneCurveRed
          ? source.toneCurveRed.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      toneCurveGreen:
        source.toneCurveGreen
          ? source.toneCurveGreen.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      toneCurveBlue:
        source.toneCurveBlue
          ? source.toneCurveBlue.map(
              (point) => ({
                ...point,
              })
            )
          : undefined,

      hslMixer:
        source.hslMixer
          ? cloneHslColorMixer(
              source.hslMixer
            )
          : undefined,

      colorGrading:
        source.colorGrading
          ? cloneColorGrading(
              source.colorGrading
            )
          : undefined,
    };

    const next = [...layers];
    next.splice(index + 1, 0, copy);
    setLayers(next);
    setSelectedLayerId(copy.id);
    showLayerInEditor(copy);
  }

  function deleteLayer(id: string) {
    if (!layers.some((item) => item.id === id)) return;

    saveHistory();

    const next = layers.filter((item) => item.id !== id);
    setLayers(next);

    if (selectedLayerId !== id) return;

    const replacement = next[next.length - 1];

    if (replacement) {
      setSelectedLayerId(replacement.id);
      showLayerInEditor(replacement);
    } else {
      setSelectedLayerId(null);
      setImage(null);
      setFileName("No image open");
      setGroups([]);
    }
  }

  function moveLayerUp(id: string) {
    const index = layers.findIndex(
      (item) => item.id === id
    );

    if (
      index < 0 ||
      index === layers.length - 1
    ) {
      return;
    }

    saveHistory();

    setLayers((items) => {
      const index = items.findIndex((item) => item.id === id);

      if (index < 0 || index === items.length - 1) return items;

      const next = [...items];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function moveLayerDown(id: string) {
    const index = layers.findIndex(
      (item) => item.id === id
    );

    if (index <= 0) {
      return;
    }

    saveHistory();

    setLayers((items) => {
      const index = items.findIndex((item) => item.id === id);

      if (index <= 0) return items;

      const next = [...items];
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
      return next;
    });
  }

  /* MOBILE TEXT / RASTER TOOL FIX

     On phones, Text is edited in a bottom sheet instead of
     staying in canvas-placement mode. Crop and Paint should
     operate on a raster image layer when a text/shape/adjustment
     layer is currently selected. Desktop behavior is unchanged.
  */

  function selectRasterLayerForMobileTool() {
    if (
      selectedLayer?.layerKind === "image"
    ) {
      return;
    }

    const selectedIndex = selectedLayer
  ? layers.findIndex(
      (layer) => layer.id === selectedLayer.id
    )
  : -1;

    const layerBelow =
      selectedIndex > 0
        ? [...layers.slice(0, selectedIndex)]
            .reverse()
            .find((layer) => layer.layerKind === "image")
        : undefined;

    const rasterLayer =
      layerBelow ??
      [...layers]
        .reverse()
        .find((layer) => layer.layerKind === "image");

    if (!rasterLayer) {
      return;
    }

    setSelectedLayerId(rasterLayer.id);
    setSelectedLayerIds([rasterLayer.id]);
    showLayerInEditor(rasterLayer, false);
  }

  function activateMobileTool(tool: Tool) {
    setMobileMenuOpen(false);
    setMobilePanel(null);

    if (tool === "crop" || tool === "paint") {
      selectRasterLayerForMobileTool();
    }

    setActiveTool(tool);
  }

  function openMobileBrushEditor() {
    setMobileMenuOpen(false);
    selectRasterLayerForMobileTool();
    setActiveTool("paint");
    setMobilePanel("brush");
  }

  function openMobileTextEditor() {
    setMobileMenuOpen(false);

    /*
      Text Pro opens the editor first. A new text layer is only
      created when the user intentionally presses Add Text.
      Keeping Move active prevents canvas taps from spawning
      repeated "Your Text" layers on touch devices.
    */
    setActiveTool("move");
    setMobilePanel("text");
  }

  function addTextLayer(
    x = 0,
    y = 0
  ) {
    if (
      layers.length === 0
    ) {
      alert(
        "Open an image first so the text has a document to be placed on."
      );

      return;
    }

    saveHistory();

    const textData = {
      ...DEFAULT_TEXT_LAYER,
    };

    const src =
      renderTextLayerToDataUrl(
        textData
      );

    if (!src) {
      return;
    }

    const layer: ImageLayer = {
      id:
        createLayerId(),

      name:
        "Text Layer",

      layerKind:
        "text",

      text:
        textData,

      shape:
        null,

      groupId:
        null,

      src,

      visible:
        true,

      locked:
        false,

      opacity:
        100,

      blendMode:
        "normal",

      maskSrc:
        null,

      maskEnabled:
        true,

      maskInverted:
        false,

      maskDensity:
        100,

      maskFeather:
        0,

      x,

      y,

      scale:
        1,

      rotation:
        0,

      flipHorizontal:
        false,

      flipVertical:
        false,

      settings: {
        ...DEFAULT_SETTINGS,
      },
    };

    setLayers(
      (items) => [
        ...items,
        layer,
      ]
    );

    setSelectedLayerId(
      layer.id
    );

    setActiveTool(
      "text"
    );

    showLayerInEditor(
      layer,
      false
    );
  }

  function updateTextLayer(
    id: string,
    changes:
      Partial<TextLayerData>
  ) {
    const current =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !current ||
      current.layerKind !==
        "text" ||
      !current.text ||
      current.locked
    ) {
      return;
    }

    const nextText =
      normalizeTextLayerData({
        ...current.text,
        ...changes,
      });

    const nextSrc =
      renderTextLayerToDataUrl(
        nextText
      );

    if (!nextSrc) {
      return;
    }

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,

                  text:
                    nextText,

                  src:
                    nextSrc,
                }
              : layer
        )
    );

    /*
      Keep the legacy selected-image state
      synchronized so transform controls and
      preview dimensions update immediately.
    */

    if (
      selectedLayerId ===
      id
    ) {
      const img =
        new Image();

      img.onload =
        () => {
          setImage(
            img
          );
        };

      img.src =
        nextSrc;
    }
  }

  function addAdjustmentLayer() {
    if (
      layers.length === 0
    ) {
      return;
    }

    const referenceLayer =
      layers.find(
        (layer) =>
          layer.layerKind ===
          "image"
      ) ??
      layers.find(
        (layer) =>
          layer.layerKind !==
          "adjustment"
      );

    if (
      !referenceLayer ||
      !referenceLayer.src
    ) {
      return;
    }

    saveHistory();

    const layer:
      ImageLayer = {
        id:
          createLayerId(),

        name:
          "Adjustment Layer",

        layerKind:
          "adjustment",

        text:
          null,

        shape:
          null,

        groupId:
          null,

        clipToBelow:
          false,

        toneCurve:
          DEFAULT_TONE_CURVE.map(
            (point) => ({
              ...point,
            })
          ),

        toneCurveRed:
          DEFAULT_TONE_CURVE.map(
            (point) => ({
              ...point,
            })
          ),

        toneCurveGreen:
          DEFAULT_TONE_CURVE.map(
            (point) => ({
              ...point,
            })
          ),

        toneCurveBlue:
          DEFAULT_TONE_CURVE.map(
            (point) => ({
              ...point,
            })
          ),

        hslMixer:
          cloneHslColorMixer(
            DEFAULT_HSL_MIXER
          ),

        colorGrading:
          cloneColorGrading(
            DEFAULT_COLOR_GRADING
          ),

        /*
          src is only a full-document reference
          for masks/editor state. The renderer
          does NOT draw this source directly.
        */

        src:
          referenceLayer.src,

        visible:
          true,

        locked:
          false,

        opacity:
          100,

        blendMode:
          "normal",

        maskSrc:
          null,

        maskEnabled:
          true,

        maskInverted:
          false,

        maskDensity:
          100,

        maskFeather:
          0,

        x:
          0,

        y:
          0,

        scale:
          1,

        rotation:
          0,

        flipHorizontal:
          false,

        flipVertical:
          false,

        settings: {
          ...DEFAULT_SETTINGS,
          opacity:
            100,
        },
      };

    setLayers(
      (items) => [
        ...items,
        layer,
      ]
    );

    setSelectedLayerId(
      layer.id
    );

    /*
      Reuse the existing Adjustments controls.
      showLayerInEditor loads the adjustment's
      settings into the editor state.
    */

    showLayerInEditor(
      layer,
      false
    );

    setActiveTool(
      "move"
    );
  }

  function addShapeLayer(
    x = 0,
    y = 0,
    width?: number,
    height?: number
  ) {
    if (
      layers.length === 0
    ) {
      alert(
        "Open an image first so the shape has a document to be placed on."
      );

      return;
    }

    saveHistory();

    const shapeData =
      normalizeShapeLayerData({
        ...DEFAULT_SHAPE_LAYER,

        ...(typeof width ===
          "number"
          ? {
              width,
            }
          : {}),

        ...(typeof height ===
          "number"
          ? {
              height,
            }
          : {}),
      });

    const src =
      renderShapeLayerToDataUrl(
        shapeData
      );

    if (!src) {
      return;
    }

    const layer: ImageLayer = {
      id:
        createLayerId(),

      name:
        "Shape Layer",

      layerKind:
        "shape",

      text:
        null,

      shape:
        shapeData,

      groupId:
        null,

      src,

      visible:
        true,

      locked:
        false,

      opacity:
        100,

      blendMode:
        "normal",

      maskSrc:
        null,

      maskEnabled:
        true,

      maskInverted:
        false,

      maskDensity:
        100,

      maskFeather:
        0,

      x,

      y,

      scale:
        1,

      rotation:
        0,

      flipHorizontal:
        false,

      flipVertical:
        false,

      settings: {
        ...DEFAULT_SETTINGS,
      },
    };

    setLayers(
      (items) => [
        ...items,
        layer,
      ]
    );

    setSelectedLayerId(
      layer.id
    );

    setActiveTool(
      "shape"
    );

    showLayerInEditor(
      layer,
      false
    );
  }

  function updateShapeLayer(
    id: string,
    changes:
      Partial<ShapeLayerData>
  ) {
    const current =
      layers.find(
        (layer) =>
          layer.id === id
      );

    if (
      !current ||
      current.layerKind !==
        "shape" ||
      !current.shape ||
      current.locked
    ) {
      return;
    }

    const nextShape =
      normalizeShapeLayerData({
        ...current.shape,
        ...changes,
      });

    const nextSrc =
      renderShapeLayerToDataUrl(
        nextShape
      );

    if (!nextSrc) {
      return;
    }

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            layer.id === id
              ? {
                  ...layer,

                  shape:
                    nextShape,

                  src:
                    nextSrc,
                }
              : layer
        )
    );

    if (
      selectedLayerId ===
      id
    ) {
      const img =
        new Image();

      img.onload =
        () => {
          setImage(
            img
          );
        };

      img.src =
        nextSrc;
    }
  }

  function addImageLayer(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) return;

    const existingLayerCount = layers.length;

    if (existingLayerCount > 0) {
      saveHistory();
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      const newLayer: ImageLayer = {
        id: createLayerId(),
        name: file.name,
        layerKind: "image",
        text: null,
        shape: null,
        groupId: null,
        src: reader.result,
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: "normal",
        maskSrc: null,
        maskEnabled: true,
        maskInverted: false,
        maskDensity: 100,
        maskFeather: 0,
        x:
          existingLayerCount === 0
            ? 0
            : 90,
        y:
          existingLayerCount === 0
            ? 0
            : 60,
        scale:
          existingLayerCount === 0
            ? 1
            : 0.55,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        settings: { ...DEFAULT_SETTINGS },
      };

      setLayers((items) => [...items, newLayer]);
      setSelectedLayerId(newLayer.id);
      showLayerInEditor(newLayer);
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  }

  /* OPEN IMAGE */

  function buildProjectFile():
    SihagProjectFile | null {
    if (
      layers.length === 0
    ) {
      return null;
    }

    return {
      version: 1,

      app:
        "SIHAG AI STUDIO",

      savedAt:
        new Date().toISOString(),

      fileName,

      layers:
        cloneLayers(
          layers
        ),

      groups:
        cloneGroups(
          groups
        ),

      selectedLayerId,

      selection:
        selection
          ? {
              ...selection,
            }
          : null,

      selectionInverted,

      selectionFeather,

      selectionRefineAmount,

      magicWandTolerance,

      quickSelectionBrushSize,

      quickSelectionTolerance,

      selectionShape,

      selectionPath:
        selectionPath
          ? selectionPath.map(
              (point) => ({
                ...point,
              })
            )
          : null,

      selectionMode,

      selectionRegions:
        selectionRegions.map(
          cloneSelectionRegion
        ),

      selectionAspect,

      zoom,

      previewQuality,

      pan: {
        ...pan,
      },

      snapEnabled,

      showGrid,

      gridSize,

      showGuides,

      showRulers,

      guidesX: [
        ...guidesX,
      ],

      guidesY: [
        ...guidesY,
      ],

      crop: {
        ...crop,
      },

      cropAspect,

      maskBrushSize,

      maskBrushHardness,

      maskBrushOpacity,

      maskBrushMode,

      maskOverlayEnabled,

      healBrushSize,

      healBrushHardness,

      healBrushOpacity,

      cloneBrushSize,

      cloneBrushHardness,

      cloneBrushOpacity,

      eraserBrushSize,

      eraserBrushHardness,

      eraserBrushOpacity,

      dodgeBurnMode,

      dodgeBurnRange,

      dodgeBurnBrushSize,

      dodgeBurnBrushHardness,

      dodgeBurnExposure,

      blurSharpenMode,

      blurSharpenBrushSize,

      blurSharpenBrushHardness,

      blurSharpenStrength,

      paintBrushColor,

      paintBrushSize,

      paintBrushHardness,

      paintBrushOpacity,

      paintBrushFlow,

      paintBrushSpacing,

      paintBrushSmoothing,

      paintBrushMode,

      paintBrushBlendMode,

      paintPressureSize,

      paintPressureOpacity,
    };
  }

  function saveProject() {
    const project =
      buildProjectFile();

    if (!project) {
      return;
    }

    const json =
      JSON.stringify(
        project,
        null,
        2
      );

    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    const baseName =
      fileName.replace(
        /\.[^/.]+$/,
        ""
      );

    link.download =
      `${baseName || "sihag-project"}.sihag`;

    link.href =
      url;

    link.click();

    URL.revokeObjectURL(
      url
    );
  }

  function openProjectPicker() {
    projectInputRef.current
      ?.click();
  }

  function restoreProjectData(
    parsed:
      Partial<SihagProjectFile>
  ) {
    if (
      parsed.version !== 1 ||
      parsed.app !==
        "SIHAG AI STUDIO"
    ) {
      throw new Error(
        "This is not a supported SIHAG AI STUDIO project."
      );
    }

    const loadedGroups =
      normalizeLoadedGroups(
        parsed.groups
      );

    const validGroupIds =
      new Set(
        loadedGroups.map(
          (group) =>
            group.id
        )
      );

    const loadedLayers =
      normalizeLoadedLayers(
        parsed.layers
      ).map(
        (layer) => ({
          ...layer,

          groupId:
            layer.groupId &&
            validGroupIds.has(
              layer.groupId
            )
              ? layer.groupId
              : null,
        })
      );

    if (
      loadedLayers.length === 0
    ) {
      throw new Error(
        "The project contains no valid image layers."
      );
    }

    const requestedSelectedId =
      typeof parsed.selectedLayerId ===
      "string"
        ? parsed.selectedLayerId
        : null;

    const restoredSelectedLayer =
      loadedLayers.find(
        (layer) =>
          layer.id ===
          requestedSelectedId
      ) ??
      loadedLayers[
        loadedLayers.length -
          1
      ];

    setLayers(
      loadedLayers
    );

    setGroups(
      loadedGroups
    );

    setSelectedLayerId(
      restoredSelectedLayer.id
    );

    const restoredSelection =
      parsed.selection &&
      typeof parsed.selection.x ===
        "number" &&
      typeof parsed.selection.y ===
        "number" &&
      typeof parsed.selection.width ===
        "number" &&
      typeof parsed.selection.height ===
        "number"
        ? clampSelection({
            x:
              parsed.selection.x,

            y:
              parsed.selection.y,

            width:
              parsed.selection.width,

            height:
              parsed.selection.height,
          })
        : null;

    setSelection(
      restoredSelection
    );

    setSelectionInverted(
      parsed.selectionInverted ===
      true
    );

    setSelectionFeather(
      typeof parsed.selectionFeather ===
      "number"
        ? Math.max(
            0,
            parsed.selectionFeather
          )
        : 0
    );

    setSelectionRefineAmount(
      typeof parsed.selectionRefineAmount ===
        "number"
        ? Math.max(
            1,
            Math.min(
              500,
              Math.round(
                parsed.selectionRefineAmount
              )
            )
          )
        : 10
    );

    setMagicWandTolerance(
      typeof parsed.magicWandTolerance ===
        "number"
        ? Math.max(
            0,
            Math.min(
              255,
              Math.round(
                parsed.magicWandTolerance
              )
            )
          )
        : 32
    );

    setQuickSelectionBrushSize(
      typeof parsed.quickSelectionBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              300,
              Math.round(
                parsed.quickSelectionBrushSize
              )
            )
          )
        : 60
    );

    setQuickSelectionTolerance(
      typeof parsed.quickSelectionTolerance ===
        "number"
        ? Math.max(
            0,
            Math.min(
              255,
              Math.round(
                parsed.quickSelectionTolerance
              )
            )
          )
        : 36
    );

    const restoredSelectionPath =
      Array.isArray(
        parsed.selectionPath
      )
        ? parsed.selectionPath
            .filter(
              (point) =>
                !!point &&
                typeof point.x ===
                  "number" &&
                typeof point.y ===
                  "number"
            )
            .slice(
              0,
              4096
            )
            .map(
              (point) => ({
                x:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      point.x
                    )
                  ),

                y:
                  Math.max(
                    0,
                    Math.min(
                      1,
                      point.y
                    )
                  ),
              })
            )
        : [];

    const hasRestoredLasso =
      parsed.selectionShape ===
        "lasso" &&
      restoredSelectionPath.length >=
        3;

    setSelectionPath(
      hasRestoredLasso
        ? restoredSelectionPath
        : null
    );

    setSelectionShape(
      hasRestoredLasso
        ? "lasso"
        : parsed.selectionShape ===
            "ellipse"
          ? "ellipse"
          : "rectangle"
    );

    setSelectionMode(
      parsed.selectionMode ===
        "add" ||
      parsed.selectionMode ===
        "subtract" ||
      parsed.selectionMode ===
        "intersect"
        ? parsed.selectionMode
        : "new"
    );

    const restoredRegions:
      SelectionRegion[] =
        Array.isArray(
          parsed.selectionRegions
        )
          ? parsed.selectionRegions
              .filter(
                (region) =>
                  !!region &&
                  !!region.rect &&
                  typeof region.rect.x ===
                    "number" &&
                  typeof region.rect.y ===
                    "number" &&
                  typeof region.rect.width ===
                    "number" &&
                  typeof region.rect.height ===
                    "number"
              )
              .slice(
                0,
                64
              )
              .map(
                (region) => ({
                  shape:
                    region.shape ===
                      "ellipse" ||
                    region.shape ===
                      "lasso"
                      ? region.shape
                      : "rectangle",

                  rect:
                    clampSelection(
                      region.rect
                    ),

                  path:
                    Array.isArray(
                      region.path
                    )
                      ? region.path
                          .filter(
                            (point) =>
                              !!point &&
                              typeof point.x ===
                                "number" &&
                              typeof point.y ===
                                "number"
                          )
                          .slice(
                            0,
                            4096
                          )
                          .map(
                            (point) => ({
                              x:
                                Math.max(
                                  0,
                                  Math.min(
                                    1,
                                    point.x
                                  )
                                ),

                              y:
                                Math.max(
                                  0,
                                  Math.min(
                                    1,
                                    point.y
                                  )
                                ),
                            })
                          )
                      : null,

                  operation:
                    region.operation ===
                      "subtract" ||
                    region.operation ===
                      "intersect"
                      ? region.operation
                      : "add",
                }))
          : [];

    setSelectionRegions(
      restoredRegions
    );

    const aspect =
      parsed.selectionAspect;

    setSelectionAspect(
      aspect === "1:1" ||
      aspect === "4:3" ||
      aspect === "3:2" ||
      aspect === "16:9"
        ? aspect
        : "free"
    );

    setZoom(
      typeof parsed.zoom ===
      "number"
        ? Math.max(
            0.05,
            Math.min(
              8,
              parsed.zoom
            )
          )
        : 1
    );

    setPreviewQuality(
      parsed.previewQuality ===
        "balanced" ||
      parsed.previewQuality ===
        "quality"
        ? parsed.previewQuality
        : "fast"
    );

    setPan({
      x:
        typeof parsed.pan?.x ===
        "number"
          ? parsed.pan.x
          : 0,

      y:
        typeof parsed.pan?.y ===
        "number"
          ? parsed.pan.y
          : 0,
    });

    setSnapEnabled(
      parsed.snapEnabled !==
        false
    );

    setShowGrid(
      parsed.showGrid ===
        true
    );

    setGridSize(
      typeof parsed.gridSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              500,
              Math.round(
                parsed.gridSize
              )
            )
          )
        : 50
    );

    setShowGuides(
      parsed.showGuides !==
        false
    );

    setShowRulers(
      parsed.showRulers ===
        true
    );

    setGuidesX(
      Array.isArray(
        parsed.guidesX
      )
        ? parsed.guidesX
            .filter(
              (value) =>
                typeof value ===
                "number"
            )
            .map(
              (value) =>
                Math.max(
                  0,
                  Math.min(
                    1,
                    value
                  )
                )
            )
            .slice(
              0,
              32
            )
        : []
    );

    setGuidesY(
      Array.isArray(
        parsed.guidesY
      )
        ? parsed.guidesY
            .filter(
              (value) =>
                typeof value ===
                "number"
            )
            .map(
              (value) =>
                Math.max(
                  0,
                  Math.min(
                    1,
                    value
                  )
                )
            )
            .slice(
              0,
              32
            )
        : []
    );

    setCrop(
      parsed.crop &&
      typeof parsed.crop.x ===
        "number" &&
      typeof parsed.crop.y ===
        "number" &&
      typeof parsed.crop.width ===
        "number" &&
      typeof parsed.crop.height ===
        "number"
        ? {
            ...parsed.crop,
          }
        : {
            ...DEFAULT_CROP,
          }
    );

    const restoredCropAspect =
      parsed.cropAspect;

    setCropAspect(
      restoredCropAspect ===
        "1:1" ||
      restoredCropAspect ===
        "4:3" ||
      restoredCropAspect ===
        "3:2" ||
      restoredCropAspect ===
        "16:9"
        ? restoredCropAspect
        : "free"
    );

    setMaskBrushSize(
      typeof parsed.maskBrushSize ===
      "number"
        ? Math.max(
            5,
            Math.min(
              300,
              parsed.maskBrushSize
            )
          )
        : 80
    );

    setMaskBrushHardness(
      typeof parsed.maskBrushHardness ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.maskBrushHardness
            )
          )
        : 80
    );

    setMaskBrushOpacity(
      typeof parsed.maskBrushOpacity ===
      "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.maskBrushOpacity
            )
          )
        : 100
    );

    setMaskBrushMode(
      parsed.maskBrushMode ===
      "reveal"
        ? "reveal"
        : "hide"
    );

    setMaskOverlayEnabled(
      parsed.maskOverlayEnabled ===
      true
    );

    setHealBrushSize(
      typeof parsed.healBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              300,
              parsed.healBrushSize
            )
          )
        : 50
    );

    setHealBrushHardness(
      typeof parsed.healBrushHardness ===
        "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.healBrushHardness
            )
          )
        : 70
    );

    setHealBrushOpacity(
      typeof parsed.healBrushOpacity ===
        "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.healBrushOpacity
            )
          )
        : 100
    );

    setCloneBrushSize(
      typeof parsed.cloneBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              300,
              parsed.cloneBrushSize
            )
          )
        : 50
    );

    setCloneBrushHardness(
      typeof parsed.cloneBrushHardness ===
        "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.cloneBrushHardness
            )
          )
        : 70
    );

    setCloneBrushOpacity(
      typeof parsed.cloneBrushOpacity ===
        "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.cloneBrushOpacity
            )
          )
        : 100
    );

    setCloneSample(
      null
    );

    setEraserBrushSize(
      typeof parsed.eraserBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              300,
              parsed.eraserBrushSize
            )
          )
        : 50
    );

    setEraserBrushHardness(
      typeof parsed.eraserBrushHardness ===
        "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.eraserBrushHardness
            )
          )
        : 80
    );

    setEraserBrushOpacity(
      typeof parsed.eraserBrushOpacity ===
        "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.eraserBrushOpacity
            )
          )
        : 100
    );

    setDodgeBurnMode(
      parsed.dodgeBurnMode ===
        "burn"
        ? "burn"
        : "dodge"
    );

    setDodgeBurnRange(
      parsed.dodgeBurnRange ===
        "shadows" ||
      parsed.dodgeBurnRange ===
        "highlights"
        ? parsed.dodgeBurnRange
        : "midtones"
    );

    setDodgeBurnBrushSize(
      typeof parsed.dodgeBurnBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              300,
              parsed.dodgeBurnBrushSize
            )
          )
        : 70
    );

    setDodgeBurnBrushHardness(
      typeof parsed.dodgeBurnBrushHardness ===
        "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.dodgeBurnBrushHardness
            )
          )
        : 40
    );

    setDodgeBurnExposure(
      typeof parsed.dodgeBurnExposure ===
        "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.dodgeBurnExposure
            )
          )
        : 20
    );

    setBlurSharpenMode(
      parsed.blurSharpenMode ===
        "sharpen" ||
      parsed.blurSharpenMode ===
        "smudge"
        ? parsed.blurSharpenMode
        : "blur"
    );

    setBlurSharpenBrushSize(
      typeof parsed.blurSharpenBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              300,
              parsed.blurSharpenBrushSize
            )
          )
        : 60
    );

    setBlurSharpenBrushHardness(
      typeof parsed.blurSharpenBrushHardness ===
        "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.blurSharpenBrushHardness
            )
          )
        : 50
    );

    setBlurSharpenStrength(
      typeof parsed.blurSharpenStrength ===
        "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.blurSharpenStrength
            )
          )
        : 35
    );

    setPaintBrushColor(
      typeof parsed.paintBrushColor ===
        "string" &&
      /^#[0-9a-fA-F]{6}$/.test(
        parsed.paintBrushColor
      )
        ? parsed.paintBrushColor
        : "#ffffff"
    );

    setPaintBrushSize(
      typeof parsed.paintBrushSize ===
        "number"
        ? Math.max(
            5,
            Math.min(
              500,
              parsed.paintBrushSize
            )
          )
        : 40
    );

    setPaintBrushHardness(
      typeof parsed.paintBrushHardness ===
        "number"
        ? Math.max(
            0,
            Math.min(
              100,
              parsed.paintBrushHardness
            )
          )
        : 80
    );

    setPaintBrushOpacity(
      typeof parsed.paintBrushOpacity ===
        "number"
        ? Math.max(
            1,
            Math.min(
              100,
              parsed.paintBrushOpacity
            )
          )
        : 100
    );

    setPaintBrushFlow(
      typeof parsed.paintBrushFlow === "number"
        ? Math.max(1, Math.min(100, parsed.paintBrushFlow))
        : 100
    );

    setPaintBrushSpacing(
      typeof parsed.paintBrushSpacing === "number"
        ? Math.max(1, Math.min(100, parsed.paintBrushSpacing))
        : 16
    );

    setPaintBrushSmoothing(
      typeof parsed.paintBrushSmoothing === "number"
        ? Math.max(0, Math.min(100, parsed.paintBrushSmoothing))
        : 0
    );

    setPaintBrushMode(
      parsed.paintBrushMode === "erase" ? "erase" : "paint"
    );

    setPaintBrushBlendMode(
      parsed.paintBrushBlendMode === "multiply" ||
      parsed.paintBrushBlendMode === "screen" ||
      parsed.paintBrushBlendMode === "overlay"
        ? parsed.paintBrushBlendMode
        : "normal"
    );

    setPaintPressureSize(parsed.paintPressureSize === true);
    setPaintPressureOpacity(parsed.paintPressureOpacity === true);

    const img =
      new Image();

    img.onload = () => {
      setImage(
        img
      );

      setFileName(
        typeof parsed.fileName ===
        "string" &&
        parsed.fileName.trim()
          ? parsed.fileName
          : restoredSelectedLayer.name
      );

      setSettings({
        ...restoredSelectedLayer.settings,
        opacity:
          restoredSelectedLayer.opacity,
      });

      setRotation(
        restoredSelectedLayer.rotation
      );

      setStraighten(
        0
      );

      setFlipHorizontal(
        restoredSelectedLayer.flipHorizontal
      );

      setFlipVertical(
        restoredSelectedLayer.flipVertical
      );

      setActiveTool(
        "move"
      );

      setHistory(
        []
      );

      setFuture(
        []
      );
    };

    img.src =
      restoredSelectedLayer.src;
  }

  function openProject(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        if (
          typeof reader.result !==
          "string"
        ) {
          throw new Error(
            "Project file could not be read."
          );
        }

        const parsed =
          JSON.parse(
            reader.result
          ) as Partial<SihagProjectFile>;

        restoreProjectData(
          parsed
        );

        setRecoveryProject(
          null
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not open this project.";

        alert(
          message
        );
      } finally {
        event.target.value =
          "";
      }
    };

    reader.readAsText(
      file
    );
  }

  async function restoreRecovery() {
    if (
      !recoveryProject
    ) {
      return;
    }

    try {
      restoreProjectData(
        recoveryProject
      );

      setRecoveryProject(
        null
      );

      setAutosaveStatus(
        "saved"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not restore the recovery project.";

      alert(
        message
      );
    }
  }

  async function discardRecovery() {
    try {
      await clearRecoveryProject();

      setRecoveryProject(
        null
      );

      setRecoverySavedAt(
        null
      );

      setAutosaveStatus(
        "idle"
      );
    } catch {
      setAutosaveStatus(
        "error"
      );
    }
  }

  function openImagePicker() {
    const input =
      imageInputRef.current;

    if (!input) {
      return;
    }

    /*
      Clear the previous value first so mobile browsers
      also fire change when the same image is chosen again.
    */
    input.value = "";
    input.click();
  }

  function openImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const input =
      event.currentTarget;

    const file =
      input.files?.[0];

    /*
      Keep the File object, but clear the control immediately.
      This makes repeated selections reliable on mobile Safari,
      Chrome and Android file pickers.
    */
    input.value = "";

    if (!file) {
      return;
    }

    const imageExtension =
      /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i;

    const hasImageMime =
      file.type.startsWith("image/");

    const hasImageExtension =
      imageExtension.test(
        file.name
      );

    /*
      Some mobile file providers leave file.type blank.
      In that case, allow a normal image filename through and
      let the browser decoder make the final decision.
    */
    if (
      file.type &&
      !hasImageMime &&
      !hasImageExtension
    ) {
      alert(
        "Please choose an image file."
      );
      return;
    }

    if (
      !file.type &&
      !hasImageExtension
    ) {
      alert(
        "Please choose a supported image file."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onerror = () => {
      alert(
        "This image could not be read. Please try another image."
      );
    };

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result !==
        "string"
      ) {
        alert(
          "This image could not be opened."
        );
        return;
      }

      const img =
        new Image();

      img.onload = () => {
        setImage(img);
        setFileName(file.name);

        const firstLayer: ImageLayer = {
          id: createLayerId(),
          name: file.name,
          layerKind: "image",
          text: null,
          shape: null,
          groupId: null,
          src: result,
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: "normal",
          maskSrc: null,
          maskEnabled: true,
          maskInverted: false,
          maskDensity: 100,
          maskFeather: 0,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,
          settings: { ...DEFAULT_SETTINGS },
        };

        setLayers([firstLayer]);
        setGroups([]);
        setSelectedLayerId(firstLayer.id);
        setSelectedLayerIds([firstLayer.id]);
        setSelection(null);
        setSelectionInverted(false);
        setSelectionFeather(0);
        setSelectionShape("rectangle");
        setSelectionPath(null);
        setSelectionRegions([]);
        setSelectionMode("new");
        setSelectionAspect("free");

        setSettings({
          ...DEFAULT_SETTINGS,
        });

        setZoom(1);

        setPan({
          x: 0,
          y: 0,
        });

        setRotation(0);
        setStraighten(0);
        setFlipHorizontal(false);
        setFlipVertical(false);

        setCrop({
          ...DEFAULT_CROP,
        });

        setCropAspect("free");
        setActiveTool("move");

        /*
          A successful open should always return the phone to
          the canvas instead of leaving a sheet/menu over it.
        */
        setMobileMenuOpen(false);
        setMobilePanel(null);

        setHistory([]);
        setFuture([]);
      };

      img.onerror = () => {
        alert(
          "Your browser could not decode this image. Try JPG, PNG or WebP."
        );
      };

      img.src = result;
    };

    reader.readAsDataURL(
      file
    );
  }

  /*
    LOAD RECOVERY CHECKPOINT ON STARTUP
  */

  useEffect(() => {
    let cancelled =
      false;

    void loadRecoveryProject<
      SihagProjectFile
    >()
      .then((record) => {
        if (
          cancelled ||
          !record
        ) {
          return;
        }

        const project =
          record.project;

        if (
          project?.version !== 1 ||
          project?.app !==
            "SIHAG AI STUDIO" ||
          !Array.isArray(
            project.layers
          ) ||
          project.layers.length ===
            0
        ) {
          return;
        }

        setRecoveryProject(
          project
        );

        setRecoverySavedAt(
          record.savedAt
        );
      })
      .catch(() => {
        if (!cancelled) {
          setAutosaveStatus(
            "error"
          );
        }
      });

    return () => {
      cancelled =
        true;
    };
  }, []);

  /*
    INDEXEDDB AUTOSAVE

    Wait briefly after the last edit so
    rapid sliders, transforms and brush
    strokes do not write on every event.
  */

  useEffect(() => {
    if (
      layers.length === 0
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          const project =
            buildProjectFile();

          if (!project) {
            return;
          }

          setAutosaveStatus(
            "saving"
          );

          void saveRecoveryProject(
            project
          )
            .then(() => {
              setAutosaveStatus(
                "saved"
              );

              setRecoverySavedAt(
                project.savedAt
              );
            })
            .catch(() => {
              setAutosaveStatus(
                "error"
              );
            });
        },
        1400
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    layers,
    groups,
    selectedLayerId,
    selection,
    selectionInverted,
    selectionFeather,
    selectionRefineAmount,
    magicWandTolerance,
    quickSelectionBrushSize,
    quickSelectionTolerance,
    selectionShape,
    selectionPath,
    selectionMode,
    selectionRegions,
    selectionAspect,
    zoom,
    previewQuality,
    pan,
    snapEnabled,
    showGrid,
    gridSize,
    showGuides,
    showRulers,
    guidesX,
    guidesY,
    crop,
    cropAspect,
    maskBrushSize,
    maskBrushHardness,
    maskBrushOpacity,
    maskBrushMode,
    maskOverlayEnabled,
    healBrushSize,
    healBrushHardness,
    healBrushOpacity,
    cloneBrushSize,
    cloneBrushHardness,
    cloneBrushOpacity,
    eraserBrushSize,
    eraserBrushHardness,
    eraserBrushOpacity,
    dodgeBurnMode,
    dodgeBurnRange,
    dodgeBurnBrushSize,
    dodgeBurnBrushHardness,
    dodgeBurnExposure,
    blurSharpenMode,
    blurSharpenBrushSize,
    blurSharpenBrushHardness,
    blurSharpenStrength,
    paintBrushColor,
    paintBrushSize,
    paintBrushHardness,
    paintBrushOpacity,
    fileName,
  ]);

  /*
    ACCIDENTAL TAB / RELOAD PROTECTION

    Browsers intentionally control the wording of this
    confirmation dialog. We only request a warning when
    the editor currently contains at least one layer.
  */

  useEffect(() => {
    if (
      layers.length === 0
    ) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      event.preventDefault();

      /*
        returnValue is kept for compatibility with
        browsers that still require it.
      */
      event.returnValue = "";
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    layers.length,
  ]);

  /*
    LIVE EXPORT PREVIEW
  */

  useEffect(() => {
    if (
      !exportDialogOpen
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void buildExportPreview();
        },
        120
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    exportDialogOpen,
    exportArea,
    exportBackground,
    exportCustomBackground,
    exportFormat,
    layers,
    selection,
    selectionInverted,
  ]);

  /*
    STEP 6 - MOBILE DIALOG COORDINATION

    Full-screen dialogs should always take priority over
    the mobile menu and bottom sheets.
  */

  useEffect(() => {
    if (
      !exportDialogOpen &&
      !shortcutsOpen
    ) {
      return;
    }

    setMobileMenuOpen(false);
    setMobilePanel(null);
  }, [
    exportDialogOpen,
    shortcutsOpen,
  ]);

  /*
    TOP MENU BEHAVIOR

    Close any open menu when the user clicks outside
    the menu bar. This keeps the editor from feeling
    "stuck" with an open dropdown.
  */

  useEffect(() => {
    if (!topMenuOpen) {
      return;
    }

    function closeTopMenuOnPointerDown(
      event: globalThis.PointerEvent
    ) {
      const target =
        event.target as HTMLElement | null;

      if (
        target?.closest(
          "[data-top-menu-root]"
        )
      ) {
        return;
      }

      setTopMenuOpen(
        null
      );
    }

    window.addEventListener(
      "pointerdown",
      closeTopMenuOnPointerDown
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        closeTopMenuOnPointerDown
      );
    };
  }, [
    topMenuOpen,
  ]);

  /*
    PROFESSIONAL KEYBOARD SHORTCUT CORE

    The goal is Photoshop-style muscle memory where SIHAG
    already has the matching command. Stage 2 follows the
    Photoshop desktop layer-order and merge key mappings.
    Browser-reserved
    shortcuts can still be intercepted differently by
    individual browsers or operating systems.
  */

  function getShortcutSelectionIds() {
    if (
      selectedLayerIds.length >
        0
    ) {
      return selectedLayerIds;
    }

    return selectedLayerId
      ? [selectedLayerId]
      : [];
  }

  function groupSelectedLayersShortcut() {
    const ids =
      getShortcutSelectionIds();

    if (ids.length === 0) {
      return;
    }

    const selectedIds =
      new Set(ids);

    saveHistory();

    const group: LayerGroup = {
      id:
        createGroupId(),
      name:
        `Group ${
          groups.length + 1
        }`,
      collapsed:
        false,
      visible:
        true,
      locked:
        false,
    };

    setGroups(
      (items) => [
        ...items,
        group,
      ]
    );

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            selectedIds.has(
              layer.id
            )
              ? {
                  ...layer,
                  groupId:
                    group.id,
                }
              : layer
        )
    );
  }

  function ungroupSelectedLayersShortcut() {
    const ids =
      getShortcutSelectionIds();

    if (ids.length === 0) {
      return;
    }

    const selectedIds =
      new Set(ids);

    const hasGroupedLayer =
      layers.some(
        (layer) =>
          selectedIds.has(
            layer.id
          ) &&
          !!layer.groupId
      );

    if (!hasGroupedLayer) {
      return;
    }

    const groupsStillUsed =
      new Set(
        layers
          .filter(
            (layer) =>
              !selectedIds.has(
                layer.id
              ) &&
              !!layer.groupId
          )
          .map(
            (layer) =>
              layer.groupId as string
          )
      );

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            selectedIds.has(
              layer.id
            )
              ? {
                  ...layer,
                  groupId:
                    null,
                }
              : layer
        )
    );

    setGroups(
      (items) =>
        items.filter(
          (group) =>
            groupsStillUsed.has(
              group.id
            )
        )
    );
  }

  function selectShortcutLayer(
    layer:
      ImageLayer | undefined
  ) {
    if (!layer) {
      return;
    }

    setSelectedLayerId(
      layer.id
    );

    setSelectedLayerIds([
      layer.id,
    ]);

    showLayerInEditor(
      layer,
      false
    );
  }

  function selectAdjacentLayerShortcut(
    direction:
      "up" | "down"
  ) {
    if (layers.length === 0) {
      return;
    }

    const displayOrder =
      [...layers].reverse();

    const currentIndex =
      selectedLayerId
        ? displayOrder.findIndex(
            (layer) =>
              layer.id ===
              selectedLayerId
          )
        : -1;

    const nextIndex =
      currentIndex < 0
        ? 0
        : Math.max(
            0,
            Math.min(
              displayOrder.length -
                1,
              currentIndex +
                (
                  direction === "up"
                    ? -1
                    : 1
                )
            )
          );

    selectShortcutLayer(
      displayOrder[nextIndex]
    );
  }

  function extendAdjacentLayerSelectionShortcut(
    direction:
      "up" | "down"
  ) {
    if (layers.length === 0) {
      return;
    }

    const displayOrder =
      [...layers].reverse();

    const currentIndex =
      selectedLayerId
        ? displayOrder.findIndex(
            (layer) =>
              layer.id ===
              selectedLayerId
          )
        : -1;

    const nextIndex =
      currentIndex < 0
        ? 0
        : Math.max(
            0,
            Math.min(
              displayOrder.length -
                1,
              currentIndex +
                (
                  direction === "up"
                    ? -1
                    : 1
                )
            )
          );

    const nextLayer =
      displayOrder[nextIndex];

    if (!nextLayer) {
      return;
    }

    setSelectedLayerIds(
      (current) => {
        const selected =
          new Set(
            current.length > 0
              ? current
              : selectedLayerId
                ? [selectedLayerId]
                : []
          );

        selected.add(
          nextLayer.id
        );

        return Array.from(
          selected
        );
      }
    );

    setSelectedLayerId(
      nextLayer.id
    );

    showLayerInEditor(
      nextLayer,
      false
    );
  }

  function selectEdgeLayerShortcut(
    edge:
      "top" | "bottom"
  ) {
    if (layers.length === 0) {
      return;
    }

    const displayOrder =
      [...layers].reverse();

    selectShortcutLayer(
      edge === "top"
        ? displayOrder[0]
        : displayOrder[
            displayOrder.length -
              1
          ]
    );
  }

  function moveSelectedLayersToEdgeShortcut(
    edge:
      "front" | "back"
  ) {
    const ids =
      getShortcutSelectionIds();

    if (ids.length === 0) {
      return;
    }

    const selectedIds =
      new Set(ids);

    const movable =
      layers.filter(
        (layer) =>
          selectedIds.has(
            layer.id
          )
      );

    if (movable.length === 0) {
      return;
    }

    saveHistory();

    setLayers(
      (items) => {
        const selected =
          items.filter(
            (layer) =>
              selectedIds.has(
                layer.id
              )
          );

        const rest =
          items.filter(
            (layer) =>
              !selectedIds.has(
                layer.id
              )
          );

        return edge ===
          "front"
          ? [
              ...rest,
              ...selected,
            ]
          : [
              ...selected,
              ...rest,
            ];
      }
    );
  }

  function toggleSelectedLayersVisibleShortcut() {
    const ids =
      getShortcutSelectionIds();

    if (
      ids.length === 0 ||
      !selectedLayer
    ) {
      return;
    }

    const selectedIds =
      new Set(ids);

    const nextVisible =
      !selectedLayer.visible;

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            selectedIds.has(
              layer.id
            )
              ? {
                  ...layer,
                  visible:
                    nextVisible,
                }
              : layer
        )
    );
  }

  function toggleSelectedLayersLockShortcut() {
    const ids =
      getShortcutSelectionIds();

    if (
      ids.length === 0 ||
      !selectedLayer
    ) {
      return;
    }

    const selectedIds =
      new Set(ids);

    const nextLocked =
      !selectedLayer.locked;

    saveHistory();

    setLayers(
      (items) =>
        items.map(
          (layer) =>
            selectedIds.has(
              layer.id
            )
              ? {
                  ...layer,
                  locked:
                    nextLocked,
                }
              : layer
        )
    );
  }

  function isBrushFamilyTool(
    tool: Tool
  ) {
    return [
      "brush",
      "paint",
      "heal",
      "clone",
      "eraser",
      "dodge-burn",
      "blur-sharpen",
      "quick-select",
    ].includes(tool);
  }

  function adjustActiveBrushSize(
    delta: number
  ) {
    const clamp = (
      value: number,
      minimum = 1,
      maximum = 500
    ) =>
      Math.max(
        minimum,
        Math.min(
          maximum,
          value
        )
      );

    switch (activeTool) {
      case "brush":
        setMaskBrushSize(
          (value) =>
            clamp(
              value + delta,
              5,
              300
            )
        );
        break;

      case "paint":
        setPaintBrushSize(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "heal":
        setHealBrushSize(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "clone":
        setCloneBrushSize(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "eraser":
        setEraserBrushSize(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "dodge-burn":
        setDodgeBurnBrushSize(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "blur-sharpen":
        setBlurSharpenBrushSize(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "quick-select":
        setQuickSelectionBrushSize(
          (value) =>
            clamp(
              value + delta,
              5,
              300
            )
        );
        break;
    }
  }

  function adjustActiveBrushHardness(
    delta: number
  ) {
    const clamp = (
      value: number
    ) =>
      Math.max(
        0,
        Math.min(
          100,
          value
        )
      );

    switch (activeTool) {
      case "brush":
        setMaskBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "paint":
        setPaintBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "heal":
        setHealBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "clone":
        setCloneBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "eraser":
        setEraserBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "dodge-burn":
        setDodgeBurnBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;

      case "blur-sharpen":
        setBlurSharpenBrushHardness(
          (value) =>
            clamp(
              value + delta
            )
        );
        break;
    }
  }

  function setActiveBrushStrength(
    value: number
  ) {
    const safeValue =
      Math.max(
        0,
        Math.min(
          100,
          value
        )
      );

    switch (activeTool) {
      case "brush":
        setMaskBrushOpacity(
          safeValue
        );
        break;

      case "paint":
        setPaintBrushOpacity(
          safeValue
        );
        break;

      case "heal":
        setHealBrushOpacity(
          safeValue
        );
        break;

      case "clone":
        setCloneBrushOpacity(
          safeValue
        );
        break;

      case "eraser":
        setEraserBrushOpacity(
          safeValue
        );
        break;

      case "dodge-burn":
        setDodgeBurnExposure(
          safeValue
        );
        break;

      case "blur-sharpen":
        setBlurSharpenStrength(
          safeValue
        );
        break;
    }
  }

  useEffect(() => {
    function handleEditorKeyDown(
      event:
        globalThis.KeyboardEvent
    ) {
      const target =
        event.target as
          HTMLElement | null;

      const tagName =
        target?.tagName;

      const isTyping =
        target?.isContentEditable ||
        tagName === "INPUT" ||
        tagName ===
          "TEXTAREA" ||
        tagName === "SELECT";

      const commandKey =
        event.ctrlKey ||
        event.metaKey;

      const key =
        event.key.toLowerCase();

      /*
        Temporary Hand tool.
        Photoshop uses Space from almost any tool.
      */

      if (
        event.code === "Space" &&
        !isTyping &&
        !commandKey &&
        !event.altKey &&
        !shortcutsOpen &&
        !exportDialogOpen &&
        layers.length > 0
      ) {
        event.preventDefault();

        if (
          temporaryHandToolRef.current ===
          null
        ) {
          temporaryHandToolRef.current =
            activeTool;

          setActiveTool(
            "hand"
          );
        }

        return;
      }

      /*
        Escape closes transient UI first.
      */

      if (
        event.key === "Escape" &&
        topMenuOpen
      ) {
        event.preventDefault();
        setTopMenuOpen(null);
        return;
      }

      if (
        event.key === "Escape" &&
        shortcutsOpen
      ) {
        event.preventDefault();
        setShortcutsOpen(false);
        return;
      }

      if (
        event.key === "Escape" &&
        exportDialogOpen
      ) {
        event.preventDefault();

        if (!exporting) {
          setExportDialogOpen(
            false
          );
        }

        return;
      }

      if (
        event.key === "Escape" &&
        activeTool === "crop"
      ) {
        event.preventDefault();
        cancelCrop();
        return;
      }

      if (
        event.key === "Escape"
      ) {
        event.preventDefault();

        if (selection) {
          deselectSelectionShortcut();
        } else {
          deselectLayer();
        }

        return;
      }

      if (isTyping) {
        return;
      }

      /*
        Photoshop-style workspace panel visibility.

        Tab hides/shows the side panels. Shift+Tab keeps
        the Tools rail visible while toggling the Inspector.
        This mirrors Photoshop's core panel-visibility muscle
        memory while fitting SIHAG's web workspace structure.
      */

      if (
        event.key === "Tab" &&
        !commandKey &&
        !event.altKey &&
        !shortcutsOpen &&
        !exportDialogOpen &&
        !topMenuOpen
      ) {
        event.preventDefault();

        if (event.shiftKey) {
          if (workspacePanelsHidden) {
            setWorkspacePanelsHidden(false);
            setWorkspaceInspectorHidden(true);
          } else {
            setWorkspaceInspectorHidden(
              (value) => !value
            );
          }
        } else if (workspacePanelsHidden) {
          setWorkspacePanelsHidden(false);
          setWorkspaceInspectorHidden(false);
        } else {
          setWorkspacePanelsHidden(true);
        }

        return;
      }

      /*
        Photoshop-style temporary selection modes.
        Shift = Add, Alt/Option = Subtract,
        Shift+Alt/Option = Intersect.
      */

      const selectionFamilyActive =
        [
          "select",
          "lasso",
          "polygonal-lasso",
          "magic-wand",
          "quick-select",
        ].includes(activeTool);

      if (
        selectionFamilyActive &&
        !commandKey &&
        (
          event.key === "Shift" ||
          event.key === "Alt"
        )
      ) {
        if (
          temporarySelectionModeRef.current ===
          null
        ) {
          temporarySelectionModeRef.current =
            selectionMode;
        }

        setSelectionMode(
          event.shiftKey &&
            event.altKey
            ? "intersect"
            : event.altKey
              ? "subtract"
              : "add"
        );

        if (event.key === "Alt") {
          event.preventDefault();
        }
      }

      /*
        Shortcut manager.
      */

      if (
        event.key === "F1" ||
        (
          key === "?" &&
          !commandKey &&
          !event.altKey
        ) ||
        (
          commandKey &&
          event.altKey &&
          event.shiftKey &&
          key === "k"
        )
      ) {
        event.preventDefault();
        setShortcutSearch("");
        setShortcutsOpen(true);
        return;
      }

      /*
        Crop confirmation.
      */

      if (
        activeTool === "crop" &&
        (
          event.key === "Enter" ||
          event.key === "Return"
        )
      ) {
        event.preventDefault();

        if (!event.repeat) {
          applyCrop();
        }

        return;
      }

      /*
        Undo / redo.
      */

      if (
        commandKey &&
        key === "z"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        }

        return;
      }

      if (
        commandKey &&
        key === "y"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          redo();
        }

        return;
      }

      /*
        File / project.
        Ctrl/Cmd+O follows Photoshop and opens an image.
        Ctrl/Cmd+Alt+O is SIHAG's project-open shortcut.
      */

      if (
        commandKey &&
        event.altKey &&
        key === "o"
      ) {
        event.preventDefault();
        openProjectPicker();
        return;
      }

      if (
        commandKey &&
        !event.altKey &&
        key === "o"
      ) {
        event.preventDefault();
        openImagePicker();
        return;
      }

      if (
        commandKey &&
        key === "s"
      ) {
        event.preventDefault();
        saveProject();
        return;
      }

      if (
        commandKey &&
        event.altKey &&
        event.shiftKey &&
        key === "w"
      ) {
        event.preventDefault();
        void openExportDialog();
        return;
      }

      /*
        View / zoom.
      */

      if (
        commandKey &&
        !event.altKey &&
        (
          event.key === "+" ||
          event.key === "="
        )
      ) {
        event.preventDefault();
        zoomIn();
        return;
      }

      if (
        commandKey &&
        !event.altKey &&
        event.key === "-"
      ) {
        event.preventDefault();
        zoomOut();
        return;
      }

      if (
        commandKey &&
        !event.altKey &&
        key === "0"
      ) {
        event.preventDefault();
        fitToScreen();
        return;
      }

      if (
        commandKey &&
        !event.altKey &&
        key === "1"
      ) {
        event.preventDefault();
        setZoomPreset(100);
        return;
      }

      if (
        commandKey &&
        !event.altKey &&
        key === "2"
      ) {
        event.preventDefault();
        setZoomPreset(200);
        return;
      }

      if (
        commandKey &&
        key === "r"
      ) {
        event.preventDefault();

        setShowRulers(
          (value) =>
            !value
        );

        return;
      }

      if (
        commandKey &&
        event.key === "'"
      ) {
        event.preventDefault();

        setShowGrid(
          (value) =>
            !value
        );

        return;
      }

      if (
        commandKey &&
        event.key === ";"
      ) {
        event.preventDefault();

        setShowGuides(
          (value) =>
            !value
        );

        return;
      }

      /*
        Panels.
      */

      if (
        event.key === "F7"
      ) {
        event.preventDefault();

        setDesktopInspectorTab(
          "layers"
        );

        setMobilePanel(
          (value) =>
            value === "layers"
              ? null
              : "layers"
        );

        return;
      }

      if (
        event.key === "F5"
      ) {
        event.preventDefault();

        setActiveTool(
          "paint"
        );

        setDesktopInspectorTab(
          "properties"
        );

        setMobilePanel(
          (value) =>
            value === "brush"
              ? null
              : "brush"
        );

        return;
      }

      /*
        Layer selection and organization.
      */

      if (
        commandKey &&
        event.altKey &&
        key === "a"
      ) {
        event.preventDefault();

        const allIds =
          layers.map(
            (layer) =>
              layer.id
          );

        setSelectedLayerIds(
          allIds
        );

        const topLayer =
          layers[
            layers.length - 1
          ];

        if (topLayer) {
          setSelectedLayerId(
            topLayer.id
          );

          showLayerInEditor(
            topLayer,
            false
          );
        }

        return;
      }

      if (
        !commandKey &&
        event.altKey &&
        event.key === "."
      ) {
        event.preventDefault();
        selectEdgeLayerShortcut("top");
        return;
      }

      if (
        !commandKey &&
        event.altKey &&
        event.key === ","
      ) {
        event.preventDefault();
        selectEdgeLayerShortcut("bottom");
        return;
      }

      if (
        !commandKey &&
        event.altKey &&
        event.shiftKey &&
        event.code === "BracketRight"
      ) {
        event.preventDefault();
        extendAdjacentLayerSelectionShortcut("up");
        return;
      }

      if (
        !commandKey &&
        event.altKey &&
        event.shiftKey &&
        event.code === "BracketLeft"
      ) {
        event.preventDefault();
        extendAdjacentLayerSelectionShortcut("down");
        return;
      }

      if (
        !commandKey &&
        event.altKey &&
        !event.shiftKey &&
        event.code === "BracketRight"
      ) {
        event.preventDefault();
        selectAdjacentLayerShortcut("up");
        return;
      }

      if (
        !commandKey &&
        event.altKey &&
        !event.shiftKey &&
        event.code === "BracketLeft"
      ) {
        event.preventDefault();
        selectAdjacentLayerShortcut("down");
        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        key === "j"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          duplicateLayer(
            selectedLayerId
          );
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        !event.shiftKey &&
        !event.altKey &&
        key === "g"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          groupSelectedLayersShortcut();
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        event.shiftKey &&
        !event.altKey &&
        key === "g"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          ungroupSelectedLayersShortcut();
        }

        return;
      }

      if (
        selectedLayerId &&
        selectedLayer?.layerKind ===
          "adjustment" &&
        commandKey &&
        event.altKey &&
        key === "g"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          toggleSelectedAdjustmentClip();
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        event.key === ","
      ) {
        event.preventDefault();

        if (!event.repeat) {
          toggleSelectedLayersVisibleShortcut();
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        event.key === "/"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          toggleSelectedLayersLockShortcut();
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        event.shiftKey &&
        !event.altKey &&
        event.code === "BracketRight"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          moveSelectedLayersToEdgeShortcut(
            "front"
          );
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        event.shiftKey &&
        !event.altKey &&
        event.code === "BracketLeft"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          moveSelectedLayersToEdgeShortcut(
            "back"
          );
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.code === "BracketRight"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          moveLayerUp(
            selectedLayerId
          );
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.code === "BracketLeft"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          moveLayerDown(
            selectedLayerId
          );
        }

        return;
      }

      /*
        Photoshop layer merge commands.
      */

      if (
        commandKey &&
        event.shiftKey &&
        !event.altKey &&
        key === "e"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          void mergeVisibleLayers();
        }

        return;
      }

      if (
        selectedLayerId &&
        commandKey &&
        !event.shiftKey &&
        !event.altKey &&
        key === "e"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          void mergeSelectedLayerDown();
        }

        return;
      }

      /*
        Free Transform entry point.

        Photoshop uses Ctrl/Cmd+T, but desktop browsers
        reserve that combination for opening a new tab
        before a normal web page can handle it. SIHAG
        therefore uses the browser-safe Ctrl/Cmd+Alt/Option+T
        mapping while preserving the same transform action.
      */

      if (
        selectedLayer &&
        selectedLayer.layerKind !==
          "adjustment" &&
        !selectedLayer.locked &&
        commandKey &&
        !event.shiftKey &&
        event.altKey &&
        key === "t"
      ) {
        event.preventDefault();
        setActiveTool("move");
        setDesktopInspectorTab(
          "properties"
        );
        return;
      }

      /*
        Selection.
      */

      if (
        commandKey &&
        !event.altKey &&
        key === "a"
      ) {
        event.preventDefault();

        setSelection({
          x: 0,
          y: 0,
          width: 1,
          height: 1,
        });

        setSelectionInverted(
          false
        );

        setSelectionShape(
          "rectangle"
        );

        setSelectionPath(
          null
        );

        setActiveTool(
          "select"
        );

        return;
      }

      if (
        (
          commandKey &&
          event.shiftKey &&
          key === "i"
        ) ||
        (
          event.shiftKey &&
          event.key === "F7"
        )
      ) {
        if (selection) {
          event.preventDefault();

          setSelectionInverted(
            (value) =>
              !value
          );

          setActiveTool(
            "select"
          );
        }

        return;
      }

      if (
        !commandKey &&
        event.shiftKey &&
        !event.altKey &&
        key === "d"
      ) {
        if (lastSelectionSnapshot) {
          event.preventDefault();
          reselectLastSelectionShortcut();
        }

        return;
      }

      if (
        commandKey &&
        !event.shiftKey &&
        !event.altKey &&
        key === "d"
      ) {
        if (selection) {
          event.preventDefault();
          deselectSelectionShortcut();
        }

        return;
      }

      /*
        Tool families.
      */

      if (
        !commandKey &&
        !event.altKey &&
        event.shiftKey &&
        key === "m"
      ) {
        event.preventDefault();

        setActiveTool(
          "select"
        );

        setSelectionShape(
          (value) =>
            value ===
            "rectangle"
              ? "ellipse"
              : "rectangle"
        );

        setSelectionPath(
          null
        );

        return;
      }

      if (
        !commandKey &&
        !event.altKey &&
        event.shiftKey &&
        key === "l"
      ) {
        event.preventDefault();

        setSelectionShape(
          "lasso"
        );

        setSelectionPath(
          null
        );

        setActiveTool(
          (current) =>
            current ===
              "lasso"
              ? "polygonal-lasso"
              : "lasso"
        );

        return;
      }

      if (
        !commandKey &&
        !event.altKey
      ) {
        switch (key) {
          case "v":
            event.preventDefault();
            setActiveTool("move");
            return;

          case "m":
            event.preventDefault();
            setActiveTool("select");
            return;

          case "l":
            event.preventDefault();
            setSelectionShape("lasso");
            setSelectionPath(null);
            setActiveTool("lasso");
            return;

          case "w":
            event.preventDefault();

            if (event.shiftKey) {
              setActiveTool(
                (current) =>
                  current ===
                    "magic-wand"
                    ? "quick-select"
                    : "magic-wand"
              );
            } else {
              setActiveTool(
                "magic-wand"
              );
            }

            return;

          case "b":
            event.preventDefault();

            setActiveTool(
              event.shiftKey
                ? "brush"
                : "paint"
            );

            return;

          case "j":
            event.preventDefault();
            setActiveTool("heal");
            return;

          case "s":
            event.preventDefault();
            setActiveTool("clone");
            return;

          case "e":
            event.preventDefault();
            setActiveTool("eraser");
            return;

          case "o":
            event.preventDefault();
            setActiveTool(
              "dodge-burn"
            );

            if (event.shiftKey) {
              setDodgeBurnMode(
                (value) =>
                  value ===
                    "dodge"
                    ? "burn"
                    : "dodge"
              );
            }

            return;

          case "r":
            event.preventDefault();
            setActiveTool(
              "blur-sharpen"
            );

            if (event.shiftKey) {
              setBlurSharpenMode(
                (value) =>
                  value ===
                    "blur"
                    ? "sharpen"
                    : value ===
                      "sharpen"
                      ? "smudge"
                      : "blur"
              );
            }

            return;

          case "g":
            event.preventDefault();
            setActiveTool(
              "gradient"
            );
            return;

          case "k":
            /*
              Legacy SIHAG alias.
              B is the Photoshop-style Paint shortcut.
            */
            event.preventDefault();
            setActiveTool(
              "paint"
            );
            return;

          case "h":
            event.preventDefault();
            setActiveTool("hand");
            return;

          case "c":
            event.preventDefault();
            setActiveTool("crop");
            return;

          case "t":
            event.preventDefault();
            setActiveTool("text");
            return;

          case "u":
            event.preventDefault();
            setActiveTool("shape");
            return;

          case "z":
            event.preventDefault();
            setActiveTool("zoom");
            return;
        }
      }

      /*
        Brush family controls.
      */

      if (
        !commandKey &&
        !event.altKey &&
        isBrushFamilyTool(
          activeTool
        ) &&
        (
          event.code ===
            "BracketLeft" ||
          event.code ===
            "BracketRight"
        )
      ) {
        event.preventDefault();

        const direction =
          event.code ===
          "BracketLeft"
            ? -1
            : 1;

        if (event.shiftKey) {
          adjustActiveBrushHardness(
            direction * 10
          );
        } else {
          adjustActiveBrushSize(
            direction * 10
          );
        }

        return;
      }

      if (
        !commandKey &&
        !event.altKey &&
        isBrushFamilyTool(
          activeTool
        ) &&
        /^[0-9]$/.test(
          event.key
        )
      ) {
        event.preventDefault();

        setActiveBrushStrength(
          event.key === "0"
            ? 100
            : Number(
                event.key
              ) * 10
        );

        return;
      }

      if (
        activeTool === "brush" &&
        !commandKey &&
        !event.altKey &&
        key === "x"
      ) {
        event.preventDefault();

        setMaskBrushMode(
          (mode) =>
            mode === "hide"
              ? "reveal"
              : "hide"
        );

        return;
      }

      if (
        activeTool === "brush" &&
        !commandKey &&
        !event.altKey &&
        event.key === "\\"
      ) {
        event.preventDefault();

        setMaskOverlayEnabled(
          (value) =>
            !value
        );

        return;
      }

      /*
        Selection and layer movement.
      */

      if (
        activeTool === "select" &&
        selection
      ) {
        const amount =
          event.shiftKey
            ? 0.01
            : 0.001;

        let nextX =
          selection.x;

        let nextY =
          selection.y;

        switch (event.key) {
          case "ArrowLeft":
            nextX -= amount;
            break;
          case "ArrowRight":
            nextX += amount;
            break;
          case "ArrowUp":
            nextY -= amount;
            break;
          case "ArrowDown":
            nextY += amount;
            break;
          default:
            nextX = selection.x;
            nextY = selection.y;
        }

        if (
          nextX !== selection.x ||
          nextY !== selection.y
        ) {
          event.preventDefault();

          setSelection(
            clampSelection({
              ...selection,
              x: nextX,
              y: nextY,
            })
          );

          return;
        }
      }

      if (
        !selectedLayerId ||
        !selectedLayer
      ) {
        return;
      }

      if (
        event.key === "Delete" ||
        event.key ===
          "Backspace"
      ) {
        event.preventDefault();

        if (!event.repeat) {
          deleteLayer(
            selectedLayerId
          );
        }

        return;
      }

      const step =
        event.shiftKey
          ? 10
          : 1;

      let nextX =
        selectedLayer.x;

      let nextY =
        selectedLayer.y;

      switch (event.key) {
        case "ArrowLeft":
          nextX -= step;
          break;
        case "ArrowRight":
          nextX += step;
          break;
        case "ArrowUp":
          nextY -= step;
          break;
        case "ArrowDown":
          nextY += step;
          break;
        default:
          return;
      }

      event.preventDefault();

      if (!event.repeat) {
        saveHistory();
      }

      if (
        selectedLayerIds.length >
          1
      ) {
        const dx =
          nextX -
          selectedLayer.x;

        const dy =
          nextY -
          selectedLayer.y;

        const selectedIds =
          new Set(
            selectedLayerIds
          );

        setLayers(
          (items) =>
            items.map(
              (layer) =>
                selectedIds.has(
                  layer.id
                ) &&
                !layer.locked &&
                layer.layerKind !==
                  "adjustment"
                  ? {
                      ...layer,
                      x:
                        layer.x +
                        dx,
                      y:
                        layer.y +
                        dy,
                    }
                  : layer
            )
        );
      } else {
        updateLayerTransform(
          selectedLayerId,
          {
            x: nextX,
            y: nextY,
          }
        );
      }
    }

    function handleEditorKeyUp(
      event:
        globalThis.KeyboardEvent
    ) {
      if (
        (
          event.key === "Shift" ||
          event.key === "Alt"
        ) &&
        temporarySelectionModeRef.current !==
          null
      ) {
        if (
          event.shiftKey ||
          event.altKey
        ) {
          setSelectionMode(
            event.shiftKey &&
              event.altKey
              ? "intersect"
              : event.altKey
                ? "subtract"
                : "add"
          );
        } else {
          setSelectionMode(
            temporarySelectionModeRef.current
          );

          temporarySelectionModeRef.current =
            null;
        }
      }

      if (
        event.code !== "Space" ||
        temporaryHandToolRef.current ===
          null
      ) {
        return;
      }

      event.preventDefault();

      const previousTool =
        temporaryHandToolRef.current;

      temporaryHandToolRef.current =
        null;

      setActiveTool(
        previousTool
      );
    }

    window.addEventListener(
      "keydown",
      handleEditorKeyDown
    );

    window.addEventListener(
      "keyup",
      handleEditorKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEditorKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleEditorKeyUp
      );
    };
  }, [
    topMenuOpen,
    shortcutsOpen,
    exportDialogOpen,
    workspacePanelsHidden,
    workspaceInspectorHidden,
    exporting,
    selectedLayerId,
    selectedLayerIds,
    selectedLayer,
    layers,
    groups,
    history,
    future,
    activeTool,
    selection,
    selectionInverted,
    selectionFeather,
    selectionMode,
    lastSelectionSnapshot,
    fileName,
    crop,
    cropAspect,
    maskBrushSize,
    maskBrushHardness,
    maskBrushOpacity,
    maskBrushMode,
    maskOverlayEnabled,
    zoom,
    pan,
  ]);

  /*
    Keep the selected layer synchronized
    with the adjustment / transform controls.
  */

  useEffect(() => {
    if (!selectedLayerId) return;

    setLayers((items) =>
      items.map((layer) =>
        layer.id === selectedLayerId
          ? {
              ...layer,
              settings: {
                ...settings,
                opacity: 100,
              },
              opacity: settings.opacity,
              rotation:
                rotation + straighten,
              flipHorizontal,
              flipVertical,
            }
          : layer
      )
    );
  }, [
    selectedLayerId,
    settings,
    rotation,
    straighten,
    flipHorizontal,
    flipVertical,
  ]);

  /*
    Crop / undo can replace the selected
    image source. Keep that source stored
    in the selected layer too.
  */

  useEffect(() => {
    if (
      !selectedLayerId ||
      !image ||
      selectedLayer?.layerKind !==
        "image"
    ) {
      return;
    }

    setLayers((items) =>
      items.map((layer) =>
        layer.id === selectedLayerId
          ? {
              ...layer,
              src: image.src,
            }
          : layer
      )
    );
  }, [
    image,
    selectedLayerId,
    selectedLayer?.layerKind,
  ]);

  /* PREVIEW */

  useEffect(() => {
    if (
      !image ||
      activeTool !== "crop"
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const maxPreview = 1000;

    const largest =
      Math.max(
        image.naturalWidth,
        image.naturalHeight
      );

    const scale =
      Math.min(
        1,
        maxPreview / largest
      );

    const width =
      Math.round(
        image.naturalWidth * scale
      );

    const height =
      Math.round(
        image.naturalHeight * scale
      );

    const frame =
      requestAnimationFrame(() => {
        renderImage(
          canvas,
          image,
          settings,
          width,
          height,
          scale
        );
      });

    return () =>
      cancelAnimationFrame(frame);
  }, [
    image,
    settings,
    activeTool,
  ]);

  /* ZOOM */

  function changeZoom(
    newZoom: number
  ) {
    setZoom(
      Math.min(
        8,
        Math.max(0.1, newZoom)
      )
    );
  }

  function zoomIn() {
    changeZoom(zoom + 0.25);
  }

  function zoomOut() {
    changeZoom(zoom - 0.25);
  }

  function fitToScreen() {
    setZoom(1);

    setPan({
      x: 0,
      y: 0,
    });
  }

  function setZoomPreset(
    percentage: number
  ) {
    setZoom(percentage / 100);

    setPan({
      x: 0,
      y: 0,
    });
  }

  /* ROTATE */

  function rotateLeft() {
    saveHistory();

    setRotation(
      (previous) => previous - 90
    );
  }

  function rotateRight() {
    saveHistory();

    setRotation(
      (previous) => previous + 90
    );
  }

  function toggleFlipHorizontal() {
    saveHistory();

    setFlipHorizontal(
      (previous) => !previous
    );
  }

  function toggleFlipVertical() {
    saveHistory();

    setFlipVertical(
      (previous) => !previous
    );
  }

  function resetTransform() {
    saveHistory();

    setRotation(0);
    setStraighten(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
  }

  /* WHEEL */

  function handleWheel(
    event: WheelEvent<HTMLDivElement>
  ) {
    if (!image) return;

    event.preventDefault();

    if (event.deltaY < 0) {
      changeZoom(zoom + 0.1);
    } else {
      changeZoom(zoom - 0.1);
    }
  }

  /* PAN / MOBILE PINCH ZOOM */

  function getTouchGesture() {
    const points = Array.from(
      touchPointers.current.values()
    );

    if (points.length < 2) {
      return null;
    }

    const first = points[0];
    const second = points[1];

    return {
      distance: Math.max(
        1,
        Math.hypot(
          second.x - first.x,
          second.y - first.y
        )
      ),
      centerX:
        (first.x + second.x) / 2,
      centerY:
        (first.y + second.y) / 2,
    };
  }

  function startPan(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (!image) return;

    if (activeTool !== "hand") {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    if (event.pointerType === "touch") {
      event.preventDefault();

      touchPointers.current.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY,
        }
      );

      const gesture =
        getTouchGesture();

      if (gesture) {
        pinchStart.current = {
          active: true,
          distance:
            gesture.distance,
          zoom,
          centerX:
            gesture.centerX,
          centerY:
            gesture.centerY,
          panX: pan.x,
          panY: pan.y,
        };

        setDragging(false);
        return;
      }
    }

    setDragging(true);

    dragStart.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  }

  function movePan(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (
      event.pointerType === "touch" &&
      activeTool === "hand" &&
      touchPointers.current.has(
        event.pointerId
      )
    ) {
      event.preventDefault();

      touchPointers.current.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY,
        }
      );

      const gesture =
        getTouchGesture();

      if (
        pinchStart.current.active &&
        gesture
      ) {
        const ratio =
          gesture.distance /
          pinchStart.current.distance;

        changeZoom(
          pinchStart.current.zoom *
            ratio
        );

        setPan({
          x:
            pinchStart.current.panX +
            (gesture.centerX -
              pinchStart.current
                .centerX),
          y:
            pinchStart.current.panY +
            (gesture.centerY -
              pinchStart.current
                .centerY),
        });

        return;
      }
    }

    if (!dragging) return;

    const deltaX =
      event.clientX -
      dragStart.current.mouseX;

    const deltaY =
      event.clientY -
      dragStart.current.mouseY;

    setPan({
      x:
        dragStart.current.panX +
        deltaX,

      y:
        dragStart.current.panY +
        deltaY,
    });
  }

  function endPan(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (event.pointerType === "touch") {
      touchPointers.current.delete(
        event.pointerId
      );

      if (
        touchPointers.current.size < 2
      ) {
        pinchStart.current.active =
          false;
      }
    }

    setDragging(false);
  }

  /* -------------------- */
  /* CROP                  */
  /* -------------------- */

  function chooseCropAspect(
    aspect: CropAspect
  ) {
    setCropAspect(aspect);

    if (
      aspect === "free" ||
      !image
    ) {
      return;
    }

    const ratios: Record<
      Exclude<CropAspect, "free">,
      number
    > = {
      "1:1": 1,
      "4:3": 4 / 3,
      "3:2": 3 / 2,
      "16:9": 16 / 9,
    };

    const wantedRatio =
      ratios[aspect];

    /*
      Convert real image aspect ratio
      into normalized crop coordinates.
    */

    const normalizedRatio =
      wantedRatio *
      (image.naturalHeight /
        image.naturalWidth);

    let width = 0.8;

    let height =
      width / normalizedRatio;

    if (height > 0.8) {
      height = 0.8;

      width =
        height *
        normalizedRatio;
    }

    setCrop({
      x: (1 - width) / 2,
      y: (1 - height) / 2,
      width,
      height,
    });
  }

  function startCropDrag(
    event: PointerEvent<HTMLDivElement>,
    mode: CropDragMode
  ) {
    event.stopPropagation();
    event.preventDefault();

    const stage =
      imageStageRef.current;

    if (!stage) return;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    cropDrag.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: {
        ...crop,
      },
    };
  }

  function moveCrop(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (!cropDrag.current.mode)
      return;

    const stage =
      imageStageRef.current;

    if (!stage) return;

    const rect =
      stage.getBoundingClientRect();

    const dx =
      (event.clientX -
        cropDrag.current.startX) /
      rect.width;

    const dy =
      (event.clientY -
        cropDrag.current.startY) /
      rect.height;

    const start =
      cropDrag.current.startCrop;

    const minimum = 0.05;

    let x = start.x;
    let y = start.y;

    let width =
      start.width;

    let height =
      start.height;

    const mode =
      cropDrag.current.mode;

    if (mode === "move") {
      x = clamp(
        start.x + dx,
        0,
        1 - start.width
      );

      y = clamp(
        start.y + dy,
        0,
        1 - start.height
      );
    }

    if (mode === "nw") {
      const right =
        start.x +
        start.width;

      const bottom =
        start.y +
        start.height;

      x = clamp(
        start.x + dx,
        0,
        right - minimum
      );

      y = clamp(
        start.y + dy,
        0,
        bottom - minimum
      );

      width =
        right - x;

      height =
        bottom - y;
    }

    if (mode === "ne") {
      const bottom =
        start.y +
        start.height;

      y = clamp(
        start.y + dy,
        0,
        bottom - minimum
      );

      width = clamp(
        start.width + dx,
        minimum,
        1 - start.x
      );

      height =
        bottom - y;
    }

    if (mode === "sw") {
      const right =
        start.x +
        start.width;

      x = clamp(
        start.x + dx,
        0,
        right - minimum
      );

      width =
        right - x;

      height = clamp(
        start.height + dy,
        minimum,
        1 - start.y
      );
    }

    if (mode === "se") {
      width = clamp(
        start.width + dx,
        minimum,
        1 - start.x
      );

      height = clamp(
        start.height + dy,
        minimum,
        1 - start.y
      );
    }

    setCrop({
      x,
      y,
      width,
      height,
    });
  }

  function endCropDrag() {
    cropDrag.current.mode =
      null;
  }

  function resetCrop() {
    setCrop({
      ...DEFAULT_CROP,
    });

    setCropAspect("free");
  }

  function cancelCrop() {
    resetCrop();

    setActiveTool("move");
  }

  function applyCrop() {
    if (!image) return;

    saveHistory();

    const sourceX =
      Math.round(
        crop.x *
          image.naturalWidth
      );

    const sourceY =
      Math.round(
        crop.y *
          image.naturalHeight
      );

    const sourceWidth =
      Math.max(
        1,
        Math.round(
          crop.width *
            image.naturalWidth
        )
      );

    const sourceHeight =
      Math.max(
        1,
        Math.round(
          crop.height *
            image.naturalHeight
        )
      );

    const cropCanvas =
      document.createElement(
        "canvas"
      );

    cropCanvas.width =
      sourceWidth;

    cropCanvas.height =
      sourceHeight;

    const context =
      cropCanvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      image,

      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,

      0,
      0,
      sourceWidth,
      sourceHeight
    );

    const croppedImage =
      new Image();

    croppedImage.onload = () => {
      setImage(croppedImage);

      setPan({
        x: 0,
        y: 0,
      });

      setZoom(1);

      setCrop({
        ...DEFAULT_CROP,
      });

      setCropAspect(
        "free"
      );

      setActiveTool(
        "move"
      );
    };

    croppedImage.src =
      cropCanvas.toDataURL(
        "image/png"
      );
  }

  /* EXPORT */

  async function openExportDialog() {
    if (
      layers.length === 0
    ) {
      return;
    }

    const previewCanvas =
      document.createElement(
        "canvas"
      );

    await renderLayerStack(
      previewCanvas,
      layers,
      null
    );

    const documentSize = {
      width:
        previewCanvas.width,

      height:
        previewCanvas.height,
    };

    setExportDocumentSize(
      documentSize
    );

    /*
      Open on Full Document every time.
      The user can switch to Selection
      from the Export Area controls.
    */

    setExportArea(
      "document"
    );

    setExportOriginalSize(
      documentSize
    );

    setExportCustomWidth(
      documentSize.width
    );

    setExportCustomHeight(
      documentSize.height
    );

    setExportScale(
      1
    );

    setExportDialogOpen(
      true
    );
  }

  function changeExportArea(
    area: ExportArea
  ) {
    if (
      area === "selection"
    ) {
      if (
        !selection ||
        selectionInverted ||
        exportDocumentSize.width <=
          0 ||
        exportDocumentSize.height <=
          0
      ) {
        return;
      }

      const width =
        Math.max(
          1,
          Math.round(
            selection.width *
            exportDocumentSize.width
          )
        );

      const height =
        Math.max(
          1,
          Math.round(
            selection.height *
            exportDocumentSize.height
          )
        );

      setExportArea(
        "selection"
      );

      setExportOriginalSize({
        width,
        height,
      });

      setExportCustomWidth(
        width
      );

      setExportCustomHeight(
        height
      );

      setExportScale(
        1
      );

      return;
    }

    setExportArea(
      "document"
    );

    setExportOriginalSize({
      ...exportDocumentSize,
    });

    setExportCustomWidth(
      exportDocumentSize.width
    );

    setExportCustomHeight(
      exportDocumentSize.height
    );

    setExportScale(
      1
    );
  }


  function applyExportPreset(
    width: number,
    height: number
  ) {
    setExportCustomWidth(
      width
    );

    setExportCustomHeight(
      height
    );

    /*
      Presets are exact pixel dimensions,
      so they become custom-size exports
      rather than forcing one of the scale
      buttons to remain active.
    */

    const scaleFromWidth =
      exportOriginalSize.width >
      0
        ? width /
          exportOriginalSize.width
        : 1;

    const scaleFromHeight =
      exportOriginalSize.height >
      0
        ? height /
          exportOriginalSize.height
        : 1;

    if (
      Math.abs(
        scaleFromWidth -
        scaleFromHeight
      ) <
      0.0001 &&
      (
        scaleFromWidth ===
          0.5 ||
        scaleFromWidth ===
          1 ||
        scaleFromWidth ===
          2 ||
        scaleFromWidth ===
          4
      )
    ) {
      setExportScale(
        scaleFromWidth
      );
    } else {
      setExportScale(
        0
      );
    }
  }

  function swapExportOrientation() {
    const currentWidth =
      exportCustomWidth;

    const currentHeight =
      exportCustomHeight;

    setExportCustomWidth(
      currentHeight
    );

    setExportCustomHeight(
      currentWidth
    );

    setExportScale(
      0
    );
  }

  function updateExportWidth(
    width: number
  ) {
    const safeWidth =
      Math.max(
        1,
        Math.round(
          width
        )
      );

    setExportCustomWidth(
      safeWidth
    );

    setExportScale(
      0
    );

    if (
      exportAspectLocked &&
      exportOriginalSize.width >
        0 &&
      exportOriginalSize.height >
        0
    ) {
      const ratio =
        exportOriginalSize.height /
        exportOriginalSize.width;

      setExportCustomHeight(
        Math.max(
          1,
          Math.round(
            safeWidth *
            ratio
          )
        )
      );
    }
  }

  function updateExportHeight(
    height: number
  ) {
    const safeHeight =
      Math.max(
        1,
        Math.round(
          height
        )
      );

    setExportCustomHeight(
      safeHeight
    );

    setExportScale(
      0
    );

    if (
      exportAspectLocked &&
      exportOriginalSize.width >
        0 &&
      exportOriginalSize.height >
        0
    ) {
      const ratio =
        exportOriginalSize.width /
        exportOriginalSize.height;

      setExportCustomWidth(
        Math.max(
          1,
          Math.round(
            safeHeight *
            ratio
          )
        )
      );
    }
  }

  function applyExportScale(
    scale: number
  ) {
    const safeScale =
      Math.max(
        0.25,
        Math.min(
          4,
          scale
        )
      );

    setExportScale(
      safeScale
    );

    setExportCustomWidth(
      Math.max(
        1,
        Math.round(
          exportOriginalSize.width *
          safeScale
        )
      )
    );

    setExportCustomHeight(
      Math.max(
        1,
        Math.round(
          exportOriginalSize.height *
          safeScale
        )
      )
    );
  }

  function getExportBackgroundColor() {
    if (
      exportFormat === "jpeg" &&
      exportBackground ===
        "transparent"
    ) {
      return "#ffffff";
    }

    switch (
      exportBackground
    ) {
      case "white":
        return "#ffffff";

      case "black":
        return "#000000";

      case "custom":
        return exportCustomBackground;

      case "transparent":
      default:
        return null;
    }
  }

  async function buildExportPreview() {
    if (
      !exportDialogOpen ||
      layers.length === 0
    ) {
      return;
    }

    setExportPreviewLoading(
      true
    );

    try {
      const renderedCanvas =
        document.createElement(
          "canvas"
        );

      await renderLayerStack(
        renderedCanvas,
        layers,
        null
      );

      let sourceX =
        0;

      let sourceY =
        0;

      let sourceWidth =
        renderedCanvas.width;

      let sourceHeight =
        renderedCanvas.height;

      if (
        exportArea ===
          "selection" &&
        selection &&
        !selectionInverted
      ) {
        sourceX =
          Math.max(
            0,
            Math.round(
              selection.x *
              renderedCanvas.width
            )
          );

        sourceY =
          Math.max(
            0,
            Math.round(
              selection.y *
              renderedCanvas.height
            )
          );

        sourceWidth =
          Math.max(
            1,
            Math.min(
              renderedCanvas.width -
                sourceX,
              Math.round(
                selection.width *
                renderedCanvas.width
              )
            )
          );

        sourceHeight =
          Math.max(
            1,
            Math.min(
              renderedCanvas.height -
                sourceY,
              Math.round(
                selection.height *
                renderedCanvas.height
              )
            )
          );
      }

      /*
        Keep the preview small so it remains
        quick even when the actual export is 4K.
      */

      const maxPreviewEdge =
        420;

      const previewScale =
        Math.min(
          1,
          maxPreviewEdge /
            Math.max(
              sourceWidth,
              sourceHeight
            )
        );

      const previewCanvas =
        document.createElement(
          "canvas"
        );

      previewCanvas.width =
        Math.max(
          1,
          Math.round(
            sourceWidth *
            previewScale
          )
        );

      previewCanvas.height =
        Math.max(
          1,
          Math.round(
            sourceHeight *
            previewScale
          )
        );

      const context =
        previewCanvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      const backgroundColor =
        getExportBackgroundColor();

      if (backgroundColor) {
        context.fillStyle =
          backgroundColor;

        context.fillRect(
          0,
          0,
          previewCanvas.width,
          previewCanvas.height
        );
      }

      context.imageSmoothingEnabled =
        true;

      context.imageSmoothingQuality =
        "high";

      drawSelectionExportContent(
        previewCanvas,
        renderedCanvas,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight
      );

      setExportPreviewUrl(
        previewCanvas.toDataURL(
          "image/png"
        )
      );
    } finally {
      setExportPreviewLoading(
        false
      );
    }
  }

  async function exportImage() {
    if (
      layers.length === 0 ||
      exporting
    ) {
      return;
    }

    setExporting(
      true
    );

    try {
      /*
        Render the full editable layer stack
        first at its native document size.
      */

      const renderedCanvas =
        document.createElement(
          "canvas"
        );

      await renderLayerStack(
        renderedCanvas,
        layers,
        null
      );

      const outputCanvas =
        document.createElement(
          "canvas"
        );

      outputCanvas.width =
        Math.max(
          1,
          Math.round(
            exportCustomWidth ||
            renderedCanvas.width
          )
        );

      outputCanvas.height =
        Math.max(
          1,
          Math.round(
            exportCustomHeight ||
            renderedCanvas.height
          )
        );

      const context =
        outputCanvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      context.imageSmoothingEnabled =
        true;

      context.imageSmoothingQuality =
        "high";

      /*
        Optional export background.

        PNG/WebP may remain transparent.
        JPEG cannot store transparency, so
        Transparent automatically becomes white.
      */

      const backgroundColor =
        getExportBackgroundColor();

      if (backgroundColor) {
        context.fillStyle =
          backgroundColor;

        context.fillRect(
          0,
          0,
          outputCanvas.width,
          outputCanvas.height
        );
      }

      /*
        Choose which part of the rendered
        document becomes the exported image.

        Selection export is a rectangular crop
        of the current non-inverted marquee.
      */

      let sourceX =
        0;

      let sourceY =
        0;

      let sourceWidth =
        renderedCanvas.width;

      let sourceHeight =
        renderedCanvas.height;

      if (
        exportArea ===
          "selection" &&
        selection &&
        !selectionInverted
      ) {
        sourceX =
          Math.max(
            0,
            Math.round(
              selection.x *
              renderedCanvas.width
            )
          );

        sourceY =
          Math.max(
            0,
            Math.round(
              selection.y *
              renderedCanvas.height
            )
          );

        sourceWidth =
          Math.max(
            1,
            Math.round(
              selection.width *
              renderedCanvas.width
            )
          );

        sourceHeight =
          Math.max(
            1,
            Math.round(
              selection.height *
              renderedCanvas.height
            )
          );

        /*
          Keep the source rectangle inside
          the document after rounding.
        */

        sourceWidth =
          Math.min(
            sourceWidth,
            renderedCanvas.width -
            sourceX
          );

        sourceHeight =
          Math.min(
            sourceHeight,
            renderedCanvas.height -
            sourceY
          );
      }

      drawSelectionExportContent(
        outputCanvas,
        renderedCanvas,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight
      );

      const mimeType =
        exportFormat === "jpeg"
          ? "image/jpeg"
          : exportFormat === "webp"
            ? "image/webp"
            : "image/png";

      const extension =
        exportFormat === "jpeg"
          ? "jpg"
          : exportFormat;

      const quality =
        exportFormat === "png"
          ? undefined
          : Math.max(
              0.01,
              Math.min(
                1,
                exportQuality /
                100
              )
            );

      const blob =
        await new Promise<
          Blob | null
        >((resolve) => {
          outputCanvas.toBlob(
            resolve,
            mimeType,
            quality
          );
        });

      if (!blob) {
        throw new Error(
          "The browser could not create the exported image."
        );
      }

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      const baseName =
        fileName.replace(
          /\.[^/.]+$/,
          ""
        );

      const sizeChanged =
        outputCanvas.width !==
          renderedCanvas.width ||
        outputCanvas.height !==
          renderedCanvas.height;

      const sizeLabel =
        sizeChanged
          ? `-${outputCanvas.width}x${outputCanvas.height}`
          : "";

      const areaLabel =
        exportArea ===
        "selection"
          ? "-selection"
          : "";

      link.download =
        `${baseName || "sihag-project"}-export${areaLabel}${sizeLabel}.${extension}`;

      link.href =
        url;

      link.click();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        1000
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Export failed.";

      alert(
        message
      );
    } finally {
      setExporting(
        false
      );
    }
  }


  const tools: {
    id: Tool;
    name: string;
    icon: string;
    shortcut?: string;
    group: "navigate" | "select" | "retouch" | "create" | "view";
  }[] = [
    { id: "move", name: "Move", icon: "↗", shortcut: "V", group: "navigate" },
    { id: "hand", name: "Hand", icon: "✋", shortcut: "H", group: "navigate" },
    { id: "crop", name: "Crop", icon: "⌗", shortcut: "C", group: "navigate" },

    { id: "select", name: "Select", icon: "▣", shortcut: "M", group: "select" },
    { id: "lasso", name: "Lasso", icon: "⌁", group: "select" },
    { id: "polygonal-lasso", name: "Polygon", icon: "◇", group: "select" },
    { id: "magic-wand", name: "Magic Wand", icon: "✦", group: "select" },
    { id: "quick-select", name: "Quick Select", icon: "◌", group: "select" },

    { id: "brush", name: "Mask Brush", icon: "◐", shortcut: "B", group: "retouch" },
    { id: "paint", name: "Paint", icon: "✎", group: "retouch" },
    { id: "heal", name: "Heal", icon: "✚", group: "retouch" },
    { id: "clone", name: "Clone", icon: "⧉", group: "retouch" },
    { id: "eraser", name: "Eraser", icon: "⌫", group: "retouch" },
    { id: "dodge-burn", name: "Dodge/Burn", icon: "◒", group: "retouch" },
    { id: "blur-sharpen", name: "Blur/Sharp/Smudge", icon: "◉", group: "retouch" },

    { id: "text", name: "Text", icon: "T", shortcut: "T", group: "create" },
    { id: "shape", name: "Shape", icon: "□", shortcut: "U", group: "create" },
    { id: "gradient", name: "Gradient", icon: "◩", group: "create" },
    { id: "ai", name: "AI", icon: "✧", group: "create" },

    { id: "zoom", name: "Zoom", icon: "⌕", group: "view" },
  ];

  function mobileDockIcon(
    id:
      | "tools"
      | "properties"
      | "adjust"
      | "layers"
      | "more"
  ) {
    const common =
      "h-[21px] w-[21px]";

    if (id === "tools") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          className={common}
          aria-hidden="true"
        >
          <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.4" />
          <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.4" />
          <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.4" />
          <rect x="14" y="14" width="6.5" height="6.5" rx="1.4" />
        </svg>
      );
    }

    if (id === "properties") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          className={common}
          aria-hidden="true"
        >
          <path d="M4 6h10" />
          <path d="M18 6h2" />
          <circle cx="16" cy="6" r="2" />
          <path d="M4 12h2" />
          <path d="M10 12h10" />
          <circle cx="8" cy="12" r="2" />
          <path d="M4 18h8" />
          <path d="M16 18h4" />
          <circle cx="14" cy="18" r="2" />
        </svg>
      );
    }

    if (id === "adjust") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          className={common}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="7.2" />
          <path d="M12 4.8a7.2 7.2 0 0 1 0 14.4Z" fill="currentColor" stroke="none" opacity="0.24" />
          <path d="M12 4.8v14.4" />
        </svg>
      );
    }

    if (id === "layers") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
          className={common}
          aria-hidden="true"
        >
          <path d="m12 4 8 4.4-8 4.4-8-4.4Z" />
          <path d="m4 12.1 8 4.4 8-4.4" />
          <path d="m4 15.8 8 4.2 8-4.2" />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={common}
        aria-hidden="true"
      >
        <circle cx="5" cy="12" r="1.45" />
        <circle cx="12" cy="12" r="1.45" />
        <circle cx="19" cy="12" r="1.45" />
      </svg>
    );
  }


  return (
    <main className="sihag-editor-shell h-[100dvh] overflow-hidden bg-[#0b0d12] text-white lg:h-screen">
      {/* STEP 7 - FINAL MOBILE RESPONSIVE POLISH */}

{/* MOBILE TOP BAR */}

<header className="sihag-mobile-header relative z-[200] flex h-14 shrink-0 items-center border-b border-white/10 bg-[#111318] px-2 sm:px-3 lg:hidden">
  <div className="min-w-0 shrink-0">
    <div className="text-[12px] font-bold tracking-[0.18em] text-white sm:text-[13px]">
      SIHAG
    </div>

    <div className="text-[7px] tracking-[0.25em] text-gray-500">
      AI STUDIO
    </div>
  </div>

  <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5">
    <button
      type="button"
      onClick={undo}
      disabled={history.length === 0}
      className="sihag-mobile-history-button flex h-10 w-10 touch-manipulation items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200 active:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      title="Undo"
      aria-label="Undo"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M9 7 5 11l4 4" />
        <path d="M5.5 11H14a5 5 0 1 1 0 10h-2" />
      </svg>
    </button>

    <button
      type="button"
      onClick={redo}
      disabled={future.length === 0}
      className="sihag-mobile-history-button flex h-10 w-10 touch-manipulation items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200 active:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      title="Redo"
      aria-label="Redo"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="m15 7 4 4-4 4" />
        <path d="M18.5 11H10a5 5 0 1 0 0 10h2" />
      </svg>
    </button>

    <button
      type="button"
      onClick={() => {
        setMobileMenuOpen(false);
        void openExportDialog();
      }}
      disabled={layers.length === 0}
      className="sihag-mobile-export h-10 touch-manipulation px-3 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-[11px]"
    >
      Export
    </button>

    <button
      type="button"
      onClick={() => {
        setMobilePanel(null);
        setMobileMenuOpen(
          (value) => !value
        );
      }}
      className="sihag-mobile-icon-button flex h-10 w-10 touch-manipulation items-center justify-center text-gray-200"
      aria-label="Open menu"
      title="Menu"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-[19px] w-[19px]" aria-hidden="true">
        <path d="M5 7h14" />
        <path d="M5 12h14" />
        <path d="M5 17h14" />
      </svg>
    </button>
  </div>

  {mobileMenuOpen && (
    <div className="sihag-mobile-overflow-menu absolute right-2 top-full z-[220] w-56 max-w-[calc(100vw-16px)] overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl sm:right-3 sm:w-64">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs text-gray-300 active:bg-white/10"
        onClick={() => {
          setMobileMenuOpen(false);
          openImagePicker();
        }}
      >
        <span>Open Image</span>

        <span className="text-[9px] text-gray-600">
          IMAGE
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          setMobileMenuOpen(false);
          openProjectPicker();
        }}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs text-gray-300 active:bg-white/10"
      >
        <span>Open Project</span>

        <span className="text-[9px] text-gray-600">
          .SIHAG
        </span>
      </button>

      <button
        type="button"
        disabled={layers.length === 0}
        onClick={() => {
          setMobileMenuOpen(false);
          saveProject();
        }}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs text-gray-300 active:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <span>Save Project</span>

        <span className="text-[9px] text-gray-600">
          SAVE
        </span>
      </button>

      <div className="my-1 border-t border-white/10" />

      <button
        type="button"
        onClick={() => {
          setMobileMenuOpen(false);
          setShortcutsOpen(true);
        }}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs text-gray-300 active:bg-white/10"
      >
        <span>Keyboard Shortcuts</span>

        <span className="text-[9px] text-gray-600">
          ?
        </span>
      </button>
    </div>
  )}
</header>

      {/* TOP */}

      <header className="sihag-desktop-header hidden h-14 items-center border-b border-white/10 bg-[#111318] px-4 lg:flex">

        <div>
          <div className="font-bold tracking-[0.2em]">
            SIHAG
          </div>

          <div className="text-[8px] tracking-[0.3em] text-gray-500">
            AI STUDIO
          </div>
        </div>

        <nav
          data-top-menu-root
          className="sihag-menu-bar relative ml-10 flex gap-5 text-sm text-gray-400"
        >

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "file"
                      ? null
                      : "file"
                )
              }
              className={
                topMenuOpen ===
                "file"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              File
            </button>

            {topMenuOpen ===
              "file" && (
              <div className="sihag-menu-popover absolute left-0 top-7 z-[150] w-56 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );
                    openImagePicker();
                  }}
                >
                  <span>
                    Open Image
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+O
                  </span>
                </button>

                <button
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    openProjectPicker();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <span>
                    Open Project
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+Alt+O
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    saveProject();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Save Project
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+S
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    void openExportDialog();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Export
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+Alt+Shift+W
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setShortcutsOpen(
                      true
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <span>
                    Keyboard Shortcuts
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ? / F1
                  </span>
                </button>

              </div>
            )}

          </div>

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "edit"
                      ? null
                      : "edit"
                )
              }
              className={
                topMenuOpen ===
                "edit"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              Edit
            </button>

            {topMenuOpen ===
              "edit" && (
              <div className="absolute left-0 top-7 z-[150] w-60 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <button
                  disabled={
                    history.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    undo();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Undo
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+Z
                  </span>
                </button>

                <button
                  disabled={
                    future.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    redo();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Redo
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+Y
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !selectedLayerId
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    if (
                      selectedLayerId
                    ) {
                      duplicateLayer(
                        selectedLayerId
                      );
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Duplicate Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+J
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayerId
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    if (
                      selectedLayerId
                    ) {
                      deleteLayer(
                        selectedLayerId
                      );
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-red-300/80 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Delete Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Delete
                  </span>
                </button>

              </div>
            )}

          </div>

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "image"
                      ? null
                      : "image"
                )
              }
              className={
                topMenuOpen ===
                "image"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              Image
            </button>

            {topMenuOpen ===
              "image" && (
              <div className="absolute left-0 top-7 z-[150] w-64 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <button
                  disabled={
                    !image ||
                    layers.length ===
                      0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setActiveTool(
                      "crop"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Crop
                  </span>

                  <span className="text-[9px] text-gray-600">
                    C
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !image
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    rotateLeft();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Rotate 90° Left
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ↺
                  </span>
                </button>

                <button
                  disabled={
                    !image
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    rotateRight();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Rotate 90° Right
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ↻
                  </span>
                </button>

                <button
                  disabled={
                    !image
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    toggleFlipHorizontal();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Flip Horizontal
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ↔
                  </span>
                </button>

                <button
                  disabled={
                    !image
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    toggleFlipVertical();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Flip Vertical
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ↕
                  </span>
                </button>

                <button
                  disabled={
                    !image
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    resetTransform();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Reset Transform
                  </span>

                  <span className="text-[9px] text-gray-600">
                    0°
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment"
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    resetAll();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Reset Adjustments
                  </span>

                  <span className="text-[9px] text-gray-600">
                    DEFAULT
                  </span>
                </button>

              </div>
            )}

          </div>

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "layer"
                      ? null
                      : "layer"
                )
              }
              className={
                topMenuOpen ===
                "layer"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              Layer
            </button>

            {topMenuOpen ===
              "layer" && (
              <div className="absolute left-0 top-7 z-[150] w-64 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    addTextLayer();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    New Text Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    T
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    addShapeLayer();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    New Shape Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    U
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    addAdjustmentLayer();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    New Adjustment Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ◐
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    createLayerGroup();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    New Group
                  </span>

                  <span className="text-[9px] text-gray-600">
                    FOLDER
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !selectedLayerId
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    if (
                      selectedLayerId
                    ) {
                      duplicateLayer(
                        selectedLayerId
                      );
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Duplicate Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+J
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayerId
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    if (
                      selectedLayerId
                    ) {
                      deleteLayer(
                        selectedLayerId
                      );
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-red-300/80 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Delete Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Delete
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.locked ||
                    (
                      selectedLayer.layerKind !==
                        "text" &&
                      selectedLayer.layerKind !==
                        "shape"
                    )
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    rasterizeSelectedLayer();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Rasterize Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    RASTER
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.locked ||
                    layers.findIndex(
                      (layer) =>
                        layer.id ===
                        selectedLayer.id
                    ) <= 0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    void mergeSelectedLayerDown();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Merge Down
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+E
                  </span>
                </button>

                <button
                  disabled={
                    layers.filter(
                      (layer) =>
                        layer.visible
                    ).length < 2
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    void mergeVisibleLayers();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Merge Visible
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+Shift+E
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    void flattenImage();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Flatten Image
                  </span>

                  <span className="text-[9px] text-gray-600">
                    ALL
                  </span>
                </button>

              </div>
            )}

          </div>

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "select"
                      ? null
                      : "select"
                )
              }
              className={
                topMenuOpen ===
                "select"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              Select
            </button>

            {topMenuOpen ===
              "select" && (
              <div className="absolute left-0 top-7 z-[150] w-72 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setSelection({
                      x: 0,
                      y: 0,
                      width: 1,
                      height: 1,
                    });

                    setSelectionInverted(
                      false
                    );

                    setSelectionShape(
                      "rectangle"
                    );

                    setSelectionPath(
                      null
                    );

                    setSelectionRegions([
                      {
                        shape:
                          "rectangle",
                        rect: {
                          x: 0,
                          y: 0,
                          width: 1,
                          height: 1,
                        },
                        path:
                          null,
                        operation:
                          "add",
                      },
                    ]);

                    setSelectionMode(
                      "new"
                    );

                    setActiveTool(
                      "select"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Select All
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+A
                  </span>
                </button>

                <button
                  disabled={
                    !selection
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    clearSelectionState();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Deselect
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+D
                  </span>
                </button>

                <button
                  disabled={
                    !selection
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setSelectionInverted(
                      (value) =>
                        !value
                    );

                    setActiveTool(
                      "select"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Invert Selection
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Ctrl+Shift+I
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setSelectionShape(
                      "rectangle"
                    );

                    setSelectionPath(
                      null
                    );

                    setActiveTool(
                      "select"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Rectangular Marquee
                  </span>

                  <span className="text-[9px] text-gray-600">
                    M
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setSelectionShape(
                      "ellipse"
                    );

                    setSelectionPath(
                      null
                    );

                    setActiveTool(
                      "select"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Elliptical Marquee
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Shift+M
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setSelectionShape(
                      "lasso"
                    );

                    setSelectionPath(
                      null
                    );

                    setActiveTool(
                      "lasso"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Freehand Lasso
                  </span>

                  <span className="text-[9px] text-gray-600">
                    L
                  </span>
                </button>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setSelectionShape(
                      "lasso"
                    );

                    setSelectionPath(
                      null
                    );

                    setActiveTool(
                      "polygonal-lasso"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Polygonal Lasso
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Shift+L
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment"
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setActiveTool(
                      "magic-wand"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Magic Wand
                  </span>

                  <span className="text-[9px] text-gray-600">
                    W
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment"
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setActiveTool(
                      "quick-select"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Quick Selection
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Shift+W
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !selection
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    applySelectionExpandContract(
                      "expand"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Expand Selection
                  </span>

                  <span className="text-[9px] text-gray-600">
                    {selectionRefineAmount}px
                  </span>
                </button>

                <button
                  disabled={
                    !selection
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    applySelectionExpandContract(
                      "contract"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Contract Selection
                  </span>

                  <span className="text-[9px] text-gray-600">
                    {selectionRefineAmount}px
                  </span>
                </button>

                <button
                  disabled={
                    !selection
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    smoothSelectionRegions();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Smooth Selection
                  </span>

                  <span className="text-[9px] text-gray-600">
                    REFINE
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  disabled={
                    !selection ||
                    !selectedLayer ||
                    selectedLayer.locked
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    createMaskFromSelection();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Create Layer Mask
                  </span>

                  <span className="text-[9px] text-gray-600">
                    FROM SELECT
                  </span>
                </button>

              </div>
            )}

          </div>

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "filter"
                      ? null
                      : "filter"
                )
              }
              className={
                topMenuOpen ===
                "filter"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              Filter
            </button>

            {topMenuOpen ===
              "filter" && (
              <div className="absolute left-0 top-7 z-[150] w-72 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    addAdjustmentLayer();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    New Adjustment Layer
                  </span>

                  <span className="text-[9px] text-gray-600">
                    NON-DESTRUCTIVE
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <div className="px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-gray-600">
                  ADJUSTMENT PRESETS
                </div>

                {(
                  [
                    [
                      "cinematic",
                      "Cinematic",
                    ],
                    [
                      "warm",
                      "Warm",
                    ],
                    [
                      "cool",
                      "Cool",
                    ],
                    [
                      "matte",
                      "Matte",
                    ],
                    [
                      "black-white",
                      "Black & White",
                    ],
                    [
                      "vintage",
                      "Vintage",
                    ],
                  ] as const
                ).map(
                  ([
                    preset,
                    label,
                  ]) => (
                    <button
                      key={preset}
                      disabled={
                        !selectedLayer ||
                        selectedLayer.layerKind !==
                          "adjustment" ||
                        selectedLayer.locked
                      }
                      onClick={() => {
                        setTopMenuOpen(
                          null
                        );

                        applyAdjustmentPreset(
                          preset
                        );
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <span>
                        {label}
                      </span>

                      <span className="text-[9px] text-gray-600">
                        PRESET
                      </span>
                    </button>
                  )
                )}

                <div className="my-1 border-t border-white/10" />

                <div className="px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-gray-600">
                  LOCAL FILTER BRUSHES
                </div>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment" ||
                    selectedLayer.locked
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setBlurSharpenMode(
                      "blur"
                    );

                    setActiveTool(
                      "blur-sharpen"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Blur Brush
                  </span>

                  <span className="text-[9px] text-gray-600">
                    R
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment" ||
                    selectedLayer.locked
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setBlurSharpenMode(
                      "sharpen"
                    );

                    setActiveTool(
                      "blur-sharpen"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Sharpen Brush
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Shift+R
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment" ||
                    selectedLayer.locked
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setBlurSharpenMode(
                      "smudge"
                    );

                    setActiveTool(
                      "blur-sharpen"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Smudge Brush
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Shift+R
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment" ||
                    selectedLayer.locked
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setDodgeBurnMode(
                      "dodge"
                    );

                    setActiveTool(
                      "dodge-burn"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Dodge Brush
                  </span>

                  <span className="text-[9px] text-gray-600">
                    O
                  </span>
                </button>

                <button
                  disabled={
                    !selectedLayer ||
                    selectedLayer.layerKind ===
                      "adjustment" ||
                    selectedLayer.locked
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    setDodgeBurnMode(
                      "burn"
                    );

                    setActiveTool(
                      "dodge-burn"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Burn Brush
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Shift+O
                  </span>
                </button>

              </div>
            )}

          </div>

          <div className="relative">

            <button
              onClick={() =>
                setTopMenuOpen(
                  (value) =>
                    value === "view"
                      ? null
                      : "view"
                )
              }
              className={
                topMenuOpen ===
                "view"
                  ? "text-white"
                  : "hover:text-white"
              }
            >
              View
            </button>

            {topMenuOpen ===
              "view" && (
              <div className="absolute right-0 top-7 z-[150] w-72 overflow-hidden rounded-xl border border-white/10 bg-[#151821]/98 p-1.5 shadow-2xl backdrop-blur-xl">

                <div className="px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-gray-600">
                  ZOOM
                </div>

                <button
                  disabled={
                    layers.length ===
                    0
                  }
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    fitToScreen();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>
                    Fit to Screen
                  </span>

                  <span className="text-[9px] text-gray-600">
                    FIT
                  </span>
                </button>

                {[
                  25,
                  50,
                  100,
                  200,
                ].map(
                  (value) => (
                    <button
                      key={value}
                      disabled={
                        layers.length ===
                        0
                      }
                      onClick={() => {
                        setTopMenuOpen(
                          null
                        );

                        setZoomPreset(
                          value
                        );
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <span>
                        Zoom {value}%
                      </span>

                      <span className="text-[9px] text-gray-600">
                        {value}%
                      </span>
                    </button>
                  )
                )}

                <div className="my-1 border-t border-white/10" />

                <div className="px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-gray-600">
                  OVERLAYS
                </div>

                <button
                  onClick={() => {
                    setShowRulers(
                      (value) =>
                        !value
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <span>
                    Rulers
                  </span>

                  <span className={
                    showRulers
                      ? "text-[9px] text-emerald-300"
                      : "text-[9px] text-gray-600"
                  }>
                    {showRulers
                      ? "ON"
                      : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowGuides(
                      (value) =>
                        !value
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <span>
                    Guides
                  </span>

                  <span className={
                    showGuides
                      ? "text-[9px] text-emerald-300"
                      : "text-[9px] text-gray-600"
                  }>
                    {showGuides
                      ? "ON"
                      : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowGrid(
                      (value) =>
                        !value
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <span>
                    Document Grid
                  </span>

                  <span className={
                    showGrid
                      ? "text-[9px] text-emerald-300"
                      : "text-[9px] text-gray-600"
                  }>
                    {showGrid
                      ? "ON"
                      : "OFF"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSnapEnabled(
                      (value) =>
                        !value
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <span>
                    Snapping
                  </span>

                  <span className={
                    snapEnabled
                      ? "text-[9px] text-fuchsia-300"
                      : "text-[9px] text-gray-600"
                  }>
                    {snapEnabled
                      ? "ON"
                      : "OFF"}
                  </span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <div className="px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-gray-600">
                  PREVIEW QUALITY
                </div>

                {(
                  [
                    [
                      "fast",
                      "Fast",
                      "800px",
                    ],
                    [
                      "balanced",
                      "Balanced",
                      "1200px",
                    ],
                    [
                      "quality",
                      "Quality",
                      "1600px",
                    ],
                  ] as const
                ).map(
                  ([
                    mode,
                    label,
                    size,
                  ]) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPreviewQuality(
                          mode
                        );

                        setTopMenuOpen(
                          null
                        );
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      <span>
                        {label}
                      </span>

                      <span
                        className={
                          previewQuality ===
                          mode
                            ? "text-[9px] text-indigo-300"
                            : "text-[9px] text-gray-600"
                        }
                      >
                        {previewQuality ===
                        mode
                          ? `✓ ${size}`
                          : size}
                      </span>
                    </button>
                  )
                )}

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={() => {
                    setTopMenuOpen(
                      null
                    );

                    purgePreviewCache();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
                >
                  <span>
                    Purge Preview Cache
                  </span>

                  <span className="text-[9px] text-gray-600">
                    MEMORY
                  </span>
                </button>

              </div>
            )}

          </div>

        </nav>

        <div className="sihag-document-status ml-6 hidden min-w-0 flex-1 items-center justify-center xl:flex">
          <div className="sihag-document-pill min-w-0 max-w-[360px]">
            <span className={layers.length > 0 ? "sihag-document-dot sihag-document-dot-open" : "sihag-document-dot"} />
            <span className="truncate">{fileName}</span>
            {layers.length > 0 && (
              <span className="sihag-document-meta">{layers.length} {layers.length === 1 ? "layer" : "layers"}</span>
            )}
          </div>
        </div>

        <div className="sihag-header-actions ml-auto flex items-center gap-1.5">

          <button
            onClick={undo}
            disabled={
              history.length === 0
            }
            className="sihag-header-button sihag-header-button-compact disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↶ Undo
          </button>

          <button
            onClick={redo}
            disabled={
              future.length === 0
            }
            className="sihag-header-button sihag-header-button-compact disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↷ Redo
          </button>

          <div
            className={
              autosaveStatus ===
              "error"
                ? "hidden text-[10px] text-red-300 xl:block"
                : "hidden text-[10px] text-gray-500 xl:block"
            }
            title={
              recoverySavedAt
                ? `Last recovery save: ${new Date(
                    recoverySavedAt
                  ).toLocaleString()}`
                : "Automatic recovery"
            }
          >
            {autosaveStatus ===
            "saving"
              ? "Autosaving…"
              : autosaveStatus ===
                  "saved"
                ? "Autosaved"
                : autosaveStatus ===
                    "error"
                  ? "Autosave error"
                  : "Autosave"}
          </div>

          <button
            onClick={() => {
              setTopMenuOpen(
                null
              );

              setShortcutsOpen(
                true
              );
            }}
            className="sihag-header-button hidden xl:inline-flex"
            title="Keyboard shortcuts (? / F1 / Ctrl+Alt+Shift+K)"
          >
            Shortcuts
          </button>

          <button
            onClick={saveProject}
            disabled={
              layers.length === 0
            }
            className="sihag-header-button sihag-header-button-compact disabled:cursor-not-allowed disabled:opacity-30"
            title="Save project (Ctrl/Cmd+S)"
          >
            Save Project
          </button>

          <button
            onClick={
              openProjectPicker
            }
            className="sihag-header-button"
            title="Open project (Ctrl/Cmd+Alt+O)"
          >
            Open Project
          </button>

          <input
            ref={projectInputRef}
            hidden
            type="file"
            accept=".sihag,application/json"
            onChange={openProject}
          />

          <input
            ref={imageInputRef}
            hidden
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.heic,.heif"
            onChange={openImage}
          />

          <button
            type="button"
            onClick={openImagePicker}
            className="sihag-header-button sihag-open-image-button cursor-pointer"
          >
            Open Image
          </button>

          <button
            onClick={
              openExportDialog
            }
            disabled={
              layers.length === 0
            }
            className="sihag-export-button disabled:opacity-40"
            title="Export image (Ctrl/Cmd+Alt+Shift+W)"
          >
            Export
          </button>

        </div>

      </header>

      {/* STEP 6 - MOBILE DIALOGS / EXPORT FLOW */}

      {recoveryProject && (
        <div className="fixed inset-x-2 top-16 z-[250] flex flex-wrap items-center gap-2 rounded-xl border border-indigo-500/30 bg-[#161925]/95 px-3 py-3 shadow-2xl backdrop-blur lg:left-1/2 lg:right-auto lg:flex-nowrap lg:-translate-x-1/2 lg:gap-3 lg:px-4">

          <div className="min-w-0 w-full lg:w-auto">

            <div className="text-xs font-semibold text-white">
              Recovery project found
            </div>

            <div className="mt-1 max-w-[420px] truncate text-[10px] text-gray-400">
              {recoveryProject.fileName}
              {recoverySavedAt
                ? ` • ${new Date(
                    recoverySavedAt
                  ).toLocaleString()}`
                : ""}
            </div>

          </div>

          <button
            onClick={
              restoreRecovery
            }
            className="flex-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs text-white hover:bg-indigo-500 lg:flex-none lg:py-2"
          >
            Restore
          </button>

          <button
            onClick={
              discardRecovery
            }
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-gray-300 hover:bg-white/10 lg:flex-none lg:py-2"
          >
            Discard
          </button>

        </div>
      )}

      {shortcutsOpen && (
        <div
          className="fixed inset-0 z-[330] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm lg:items-center lg:p-4"
          onPointerDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShortcutsOpen(
                false
              );
            }
          }}
        >
          <div className="sihag-shortcut-dialog flex max-h-[calc(100dvh-24px)] w-full max-w-6xl flex-col overflow-hidden rounded-t-[22px] border border-white/[0.09] bg-[#0f1218] shadow-[0_30px_100px_rgba(0,0,0,0.72)] lg:max-h-[88vh] lg:rounded-[18px]">

            <div className="sihag-shortcut-header flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] px-4 py-4 lg:px-5">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f7886]">
                  SIHAG WORKSPACE
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <h2 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-white">
                    Keyboard Shortcuts
                  </h2>

                  <span className="hidden rounded-md border border-cyan-300/15 bg-cyan-300/[0.055] px-2 py-0.5 text-[8px] font-semibold tracking-[0.08em] text-cyan-200 sm:inline-flex">
                    PRO
                  </span>
                </div>

                <div className="mt-1 text-[10px] text-[#737d8a]">
                  Photoshop-style muscle memory • only working SIHAG commands are listed
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShortcutsOpen(
                    false
                  )
                }
                className="sihag-shortcut-close"
              >
                <span className="hidden sm:inline">
                  Esc
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="m7 7 10 10M17 7 7 17" />
                </svg>
              </button>
            </div>

            <div className="shrink-0 border-b border-white/[0.055] bg-black/[0.12] px-4 py-3 lg:px-5">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6875]"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4 4" />
                </svg>

                <input
                  type="search"
                  value={shortcutSearch}
                  onChange={(event) =>
                    setShortcutSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search command or shortcut…"
                  className="sihag-shortcut-search h-10 w-full rounded-[10px] border border-white/[0.07] bg-[#0a0d12] pl-10 pr-3 text-[11px] text-[#e4e8ee] outline-none placeholder:text-[#59616d] focus:border-cyan-300/25"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[calc(16px+env(safe-area-inset-bottom))] sm:p-4 lg:p-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title: "File & Project",
                    rows: [
                      ["Ctrl / Cmd + O", "Open Image"],
                      ["Ctrl / Cmd + Alt + O", "Open SIHAG Project"],
                      ["Ctrl / Cmd + S", "Save SIHAG Project"],
                      ["Ctrl / Cmd + Alt + Shift + W", "Export"],
                      ["Ctrl / Cmd + Z", "Undo"],
                      ["Ctrl / Cmd + Shift + Z", "Redo"],
                      ["Ctrl / Cmd + Y", "Redo (Windows alias)"],
                    ],
                  },
                  {
                    title: "Tools",
                    rows: [
                      ["V", "Move"],
                      ["H", "Hand / Pan"],
                      ["Space (hold)", "Temporary Hand"],
                      ["C", "Crop"],
                      ["Enter", "Apply Crop"],
                      ["Esc", "Cancel Crop / Deselect"],
                      ["M", "Rectangular Marquee"],
                      ["Shift + M", "Cycle Marquee"],
                      ["L", "Lasso"],
                      ["Shift + L", "Cycle Lasso / Polygonal Lasso"],
                      ["W", "Magic Wand"],
                      ["Shift + W", "Cycle Wand / Quick Select"],
                      ["B", "Paint Brush"],
                      ["Shift + B", "Mask Brush"],
                      ["J", "Heal"],
                      ["S", "Clone Stamp"],
                      ["E", "Eraser"],
                      ["O", "Dodge / Burn"],
                      ["Shift + O", "Toggle Dodge / Burn"],
                      ["R", "Blur / Sharpen / Smudge"],
                      ["Shift + R", "Cycle Blur / Sharpen / Smudge"],
                      ["G", "Gradient"],
                      ["T", "Text"],
                      ["U", "Shape"],
                      ["Z", "Zoom Tool"],
                    ],
                  },
                  {
                    title: "Selection",
                    rows: [
                      ["Ctrl / Cmd + A", "Select All"],
                      ["Ctrl / Cmd + D", "Deselect"],
                      ["Shift + D", "Reselect"],
                      ["Ctrl / Cmd + Shift + I", "Invert Selection"],
                      ["Shift (while selecting)", "Temporarily Add to Selection"],
                      ["Alt / Option (while selecting)", "Temporarily Subtract from Selection"],
                      ["Shift + Alt / Option", "Temporarily Intersect Selection"],
                      ["Shift + F7", "Invert Selection"],
                      ["Arrow", "Nudge Selection"],
                      ["Shift + Arrow", "Nudge Selection Faster"],
                      ["Ctrl/Cmd + Click", "Toggle Layer Multi-select"],
                      ["Shift + Click", "Select Layer Range"],
                    ],
                  },
                  {
                    title: "Layers",
                    rows: [
                      ["Ctrl / Cmd + J", "Duplicate Layer"],
                      ["Ctrl / Cmd + Alt / Option + T", "Free Transform (browser-safe)"],
                      ["Ctrl / Cmd + E", "Merge Down"],
                      ["Ctrl / Cmd + Shift + E", "Merge Visible"],
                      ["Ctrl / Cmd + G", "Group Selected Layers"],
                      ["Ctrl / Cmd + Shift + G", "Ungroup Selected Layers"],
                      ["Ctrl / Cmd + Alt + G", "Toggle Adjustment Clipping"],
                      ["Ctrl / Cmd + ,", "Show / Hide Selected Layer(s)"],
                      ["Ctrl / Cmd + /", "Lock / Unlock Selected Layer(s)"],
                      ["Ctrl / Cmd + ]", "Move Layer Forward"],
                      ["Ctrl / Cmd + [", "Move Layer Backward"],
                      ["Ctrl / Cmd + Shift + ]", "Bring Layer(s) to Front"],
                      ["Ctrl / Cmd + Shift + [", "Send Layer(s) to Back"],
                      ["Alt / Option + ]", "Select Layer Above"],
                      ["Alt / Option + [", "Select Layer Below"],
                      ["Shift + Alt / Option + ]", "Add Layer Above to Selection"],
                      ["Shift + Alt / Option + [", "Add Layer Below to Selection"],
                      ["Alt / Option + .", "Select Top Layer"],
                      ["Alt / Option + ,", "Select Bottom Layer"],
                      ["Ctrl / Cmd + Alt + A", "Select All Layers"],
                      ["Delete / Backspace", "Delete Selected Layer"],
                      ["Arrow", "Move Layer 1 px"],
                      ["Shift + Arrow", "Move Layer 10 px"],
                    ],
                  },
                  {
                    title: "Brush & Retouch",
                    rows: [
                      ["[", "Decrease Brush Size"],
                      ["]", "Increase Brush Size"],
                      ["Shift + [", "Decrease Brush Hardness"],
                      ["Shift + ]", "Increase Brush Hardness"],
                      ["1…9", "Set Strength / Opacity 10–90%"],
                      ["0", "Set Strength / Opacity 100%"],
                      ["X", "Swap Mask Hide / Reveal"],
                      ["\\", "Toggle Mask Overlay"],
                    ],
                  },
                  {
                    title: "View",
                    rows: [
                      ["Ctrl / Cmd + +", "Zoom In"],
                      ["Ctrl / Cmd + -", "Zoom Out"],
                      ["Ctrl / Cmd + 0", "Fit to Screen"],
                      ["Ctrl / Cmd + 1", "Zoom 100%"],
                      ["Ctrl / Cmd + 2", "Zoom 200%"],
                      ["Ctrl / Cmd + R", "Toggle Rulers"],
                      ["Ctrl / Cmd + '", "Toggle Grid"],
                      ["Ctrl / Cmd + ;", "Toggle Guides"],
                      ["Tab", "Hide / Show Workspace Panels"],
                      ["Shift + Tab", "Hide / Show Inspector (keep Tools)"],
                      ["F5", "Brush Properties"],
                      ["F7", "Layers Panel"],
                    ],
                  },
                  {
                    title: "Shortcut Manager",
                    rows: [
                      ["?", "Open Shortcuts"],
                      ["F1", "Open Shortcuts"],
                      ["Ctrl / Cmd + Alt + Shift + K", "Open Shortcut Manager"],
                      ["Esc", "Close Shortcut Manager"],
                    ],
                  },
                ].map(
                  (section) => {
                    const query =
                      shortcutSearch
                        .trim()
                        .toLowerCase();

                    const rows =
                      section.rows.filter(
                        ([shortcut, command]) =>
                          !query ||
                          section.title
                            .toLowerCase()
                            .includes(query) ||
                          shortcut
                            .toLowerCase()
                            .includes(query) ||
                          command
                            .toLowerCase()
                            .includes(query)
                      );

                    if (
                      rows.length === 0
                    ) {
                      return null;
                    }

                    return (
                      <section
                        key={
                          section.title
                        }
                        className="sihag-shortcut-section"
                      >
                        <div className="sihag-shortcut-section-header">
                          <span>
                            {section.title}
                          </span>

                          <span className="sihag-shortcut-count">
                            {rows.length}
                          </span>
                        </div>

                        <div className="divide-y divide-white/[0.045]">
                          {rows.map(
                            ([
                              shortcut,
                              command,
                            ]) => (
                              <div
                                key={`${section.title}-${shortcut}-${command}`}
                                className="sihag-shortcut-row"
                              >
                                <span className="min-w-0 flex-1 truncate text-[10px] text-[#9aa3af]">
                                  {command}
                                </span>

                                <kbd className="sihag-shortcut-key">
                                  {shortcut}
                                </kbd>
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    );
                  }
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-white/[0.055] bg-white/[0.018] px-4 py-3 text-[9px] leading-4 text-[#69727e] sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Shortcuts are ignored while typing in fields. Browser or OS reserved combinations can override web-app shortcuts.
                </span>

                <span className="shrink-0 font-medium text-[#8b94a1]">
                  Photoshop-style • SIHAG-native
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {exportDialogOpen && (
        <div
          className="fixed inset-0 z-[320] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm lg:items-center lg:p-4"
          onPointerDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget &&
              !exporting
            ) {
              setExportDialogOpen(
                false
              );

              setExportPreviewUrl(
                null
              );
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-8px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#151821] shadow-2xl lg:max-h-[calc(100vh-24px)] lg:rounded-2xl">

            <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-4 py-3 lg:px-5 lg:py-4">

              <div>
                <div className="text-sm font-semibold text-white">
                  Export Image
                </div>

                <div className="mt-1 text-[10px] text-gray-500">
                  SIHAG AI STUDIO
                </div>
              </div>

              <button
                disabled={exporting}
                onClick={() => {
                  setExportDialogOpen(
                    false
                  );

                  setExportPreviewUrl(
                    null
                  );
                }}
                className="flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 hover:bg-white/10 disabled:opacity-30 lg:min-h-0 lg:py-1.5"
              >
                Close
              </button>

            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 lg:space-y-5 lg:p-5">

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] text-gray-500">
                Scroll this panel to see all export options. The Export button stays visible below.
              </div>

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                    PREVIEW
                  </div>

                  <span className="text-[9px] text-gray-600">
                    Live export preview
                  </span>

                </div>

                <div
                  className="relative flex min-h-[130px] items-center justify-center overflow-hidden rounded-xl border border-white/10 p-3 sm:min-h-[160px]"
                  style={{
                    backgroundColor:
                      "#1b1d24",

                    backgroundImage:
                      exportBackground ===
                        "transparent" &&
                      exportFormat !==
                        "jpeg"
                        ? "linear-gradient(45deg, #252833 25%, transparent 25%), linear-gradient(-45deg, #252833 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #252833 75%), linear-gradient(-45deg, transparent 75%, #252833 75%)"
                        : "none",

                    backgroundSize:
                      "20px 20px",

                    backgroundPosition:
                      "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                >

                  {exportPreviewUrl ? (
                    <img
                      src={
                        exportPreviewUrl
                      }
                      alt="Export preview"
                      className="max-h-[190px] max-w-full object-contain shadow-2xl sm:max-h-[230px]"
                    />
                  ) : (
                    <div className="text-xs text-gray-600">
                      Preparing preview…
                    </div>
                  )}

                  {exportPreviewLoading && (
                    <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[9px] text-gray-300 backdrop-blur">
                      Updating…
                    </div>
                  )}

                </div>

              </div>

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                    EXPORT AREA
                  </div>

                  <span className="text-[9px] text-gray-600">
                    Choose what to export
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    onClick={() =>
                      changeExportArea(
                        "document"
                      )
                    }
                    className={
                      exportArea ===
                      "document"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 hover:bg-white/10"
                    }
                  >
                    Full Document
                  </button>

                  <button
                    disabled={
                      !selection ||
                      selectionInverted
                    }
                    onClick={() =>
                      changeExportArea(
                        "selection"
                      )
                    }
                    className={
                      exportArea ===
                      "selection"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    }
                  >
                    Selection Only
                  </button>

                </div>

                {!selection && (
                  <div className="mt-2 text-[9px] leading-4 text-gray-600">
                    Create a selection to enable Selection Only.
                  </div>
                )}

                {selection &&
                  selectionInverted && (
                  <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[9px] leading-4 text-amber-200/80">
                    Selection Only is unavailable for an inverted selection. Use Full Document export for inverted selections.
                  </div>
                )}

              </div>

              <div>

                <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  FORMAT
                </div>

                <div className="grid grid-cols-2 gap-2">

                  {(
                    [
                      "png",
                      "jpeg",
                      "webp",
                    ] as const
                  ).map(
                    (format) => (
                      <button
                        key={format}
                        onClick={() =>
                          setExportFormat(
                            format
                          )
                        }
                        className={
                          exportFormat ===
                          format
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-3 py-2 text-xs font-medium uppercase text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase text-gray-400 hover:bg-white/10"
                        }
                      >
                        {format ===
                        "jpeg"
                          ? "JPG"
                          : format}
                      </button>
                    )
                  )}

                </div>

              </div>

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                    BACKGROUND
                  </div>

                  <span className="text-[9px] text-gray-600">
                    Transparent or flattened
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">

                  <button
                    disabled={
                      exportFormat ===
                      "jpeg"
                    }
                    onClick={() =>
                      setExportBackground(
                        "transparent"
                      )
                    }
                    className={
                      exportBackground ===
                        "transparent" &&
                      exportFormat !==
                        "jpeg"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    }
                  >
                    Transparent
                  </button>

                  <button
                    onClick={() =>
                      setExportBackground(
                        "white"
                      )
                    }
                    className={
                      exportBackground ===
                      "white"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                    }
                  >
                    White
                  </button>

                  <button
                    onClick={() =>
                      setExportBackground(
                        "black"
                      )
                    }
                    className={
                      exportBackground ===
                      "black"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                    }
                  >
                    Black
                  </button>

                  <button
                    onClick={() =>
                      setExportBackground(
                        "custom"
                      )
                    }
                    className={
                      exportBackground ===
                      "custom"
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                    }
                  >
                    Custom
                  </button>

                </div>

                {exportBackground ===
                  "custom" && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">

                    <input
                      type="color"
                      value={
                        exportCustomBackground
                      }
                      onChange={(
                        event
                      ) =>
                        setExportCustomBackground(
                          event.target.value
                        )
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
                    />

                    <div className="min-w-0 flex-1">

                      <div className="text-[9px] text-gray-500">
                        Custom color
                      </div>

                      <input
                        type="text"
                        value={
                          exportCustomBackground
                        }
                        onChange={(
                          event
                        ) => {
                          const value =
                            event.target.value;

                          setExportCustomBackground(
                            value
                          );
                        }}
                        className="mt-0.5 w-full bg-transparent text-xs uppercase text-gray-200 outline-none"
                      />

                    </div>

                  </div>
                )}

                {exportFormat ===
                  "jpeg" &&
                  exportBackground ===
                    "transparent" && (
                  <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[9px] leading-4 text-amber-200/80">
                    JPEG cannot store transparency, so transparent areas will export on white.
                  </div>
                )}

              </div>

              {exportFormat !==
                "png" && (
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                      QUALITY
                    </span>

                    <span className="rounded bg-white/5 px-2 py-1 text-[10px] tabular-nums text-gray-300">
                      {exportQuality}%
                    </span>

                  </div>

                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={
                      exportQuality
                    }
                    onChange={(
                      event
                    ) =>
                      setExportQuality(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="w-full cursor-pointer accent-indigo-500"
                  />

                </div>
              )}

              <div>

                <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  OUTPUT SCALE
                </div>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">

                  {(
                    [
                      0.5,
                      1,
                      2,
                      4,
                    ] as const
                  ).map(
                    (scale) => (
                      <button
                        key={scale}
                        onClick={() =>
                          applyExportScale(
                            scale
                          )
                        }
                        className={
                          exportScale ===
                          scale
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-xs text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-gray-400 hover:bg-white/10"
                        }
                      >
                        {scale ===
                        0.5
                          ? "50%"
                          : `${scale}×`}
                      </button>
                    )
                  )}

                </div>

              </div>

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                    QUICK PRESETS
                  </div>

                  <span className="text-[9px] text-gray-600">
                    Exact pixels
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    onClick={() =>
                      applyExportPreset(
                        1080,
                        1080
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-[10px] font-medium text-gray-200">
                      Square
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-500">
                      1080 × 1080
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      applyExportPreset(
                        1080,
                        1350
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-[10px] font-medium text-gray-200">
                      Portrait Post
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-500">
                      1080 × 1350
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      applyExportPreset(
                        1080,
                        1920
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-[10px] font-medium text-gray-200">
                      Story / Reel
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-500">
                      1080 × 1920
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      applyExportPreset(
                        1920,
                        1080
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-[10px] font-medium text-gray-200">
                      Full HD
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-500">
                      1920 × 1080
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      applyExportPreset(
                        2560,
                        1440
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-[10px] font-medium text-gray-200">
                      QHD
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-500">
                      2560 × 1440
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      applyExportPreset(
                        3840,
                        2160
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="text-[10px] font-medium text-gray-200">
                      4K UHD
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-500">
                      3840 × 2160
                    </div>
                  </button>

                </div>

              </div>

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                    CUSTOM DIMENSIONS
                  </div>

                  <button
                    onClick={() =>
                      setExportAspectLocked(
                        (value) =>
                          !value
                      )
                    }
                    className={
                      exportAspectLocked
                        ? "rounded border border-indigo-500/40 bg-indigo-500/15 px-2 py-1 text-[9px] text-indigo-200"
                        : "rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] text-gray-400 hover:bg-white/10"
                    }
                  >
                    {exportAspectLocked
                      ? "🔒 Locked"
                      : "🔓 Unlocked"}
                  </button>

                </div>

                <div className="grid grid-cols-1 items-end gap-2 lg:grid-cols-[1fr_auto_1fr]">

                  <label>

                    <div className="mb-1 text-[9px] text-gray-500">
                      Width
                    </div>

                    <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3">

                      <input
                        type="number"
                        min={1}
                        max={16000}
                        value={
                          exportCustomWidth
                        }
                        onChange={(
                          event
                        ) =>
                          updateExportWidth(
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="min-w-0 flex-1 bg-transparent py-2 text-xs tabular-nums text-gray-200 outline-none"
                      />

                      <span className="text-[9px] text-gray-500">
                        px
                      </span>

                    </div>

                  </label>

                  <div className="hidden pb-2 text-xs text-gray-600 lg:block">
                    ×
                  </div>

                  <label>

                    <div className="mb-1 text-[9px] text-gray-500">
                      Height
                    </div>

                    <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3">

                      <input
                        type="number"
                        min={1}
                        max={16000}
                        value={
                          exportCustomHeight
                        }
                        onChange={(
                          event
                        ) =>
                          updateExportHeight(
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="min-w-0 flex-1 bg-transparent py-2 text-xs tabular-nums text-gray-200 outline-none"
                      />

                      <span className="text-[9px] text-gray-500">
                        px
                      </span>

                    </div>

                  </label>

                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">

                  <button
                    onClick={
                      swapExportOrientation
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                  >
                    Swap W ↔ H
                  </button>

                  <button
                    onClick={() => {
                      setExportCustomWidth(
                        exportOriginalSize.width
                      );

                      setExportCustomHeight(
                        exportOriginalSize.height
                      );

                      setExportScale(
                        1
                      );
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                  >
                    Original Size
                  </button>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">

                  <div className="text-[10px] text-gray-500">
                    {exportArea ===
                    "selection"
                      ? "Selection"
                      : "Original"}
                  </div>

                  <div className="mt-1 text-xs tabular-nums text-gray-200">
                    {exportOriginalSize.width}
                    {" × "}
                    {exportOriginalSize.height}
                    {" px"}
                  </div>

                </div>

                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3">

                  <div className="text-[10px] text-indigo-300/70">
                    Export
                  </div>

                  <div className="mt-1 text-xs tabular-nums text-indigo-100">
                    {Math.max(
                      1,
                      Math.round(
                        exportCustomWidth
                      )
                    )}
                    {" × "}
                    {Math.max(
                      1,
                      Math.round(
                        exportCustomHeight
                      )
                    )}
                    {" px"}
                  </div>

                  <div className="mt-1 text-[9px] text-indigo-300/60">
                    {exportFormat ===
                      "jpeg" &&
                    exportBackground ===
                      "transparent"
                      ? "White background"
                      : exportBackground ===
                          "transparent"
                        ? "Transparent background"
                        : exportBackground ===
                            "custom"
                          ? exportCustomBackground.toUpperCase()
                          : `${exportBackground.charAt(
                              0
                            ).toUpperCase()}${exportBackground.slice(
                              1
                            )} background`}
                  </div>

                </div>

              </div>

            </div>

            <div
              className="shrink-0 flex items-center gap-2 border-t border-white/10 bg-[#11141c] px-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.20)] lg:justify-between lg:px-5 lg:py-3"
              style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
            >

              <div className="hidden text-[10px] text-gray-500 lg:block">
                Ctrl + Alt + Shift + W
              </div>

              <button
                disabled={
                  exporting
                }
                onClick={
                  exportImage
                }
                className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60 lg:min-h-0 lg:w-auto lg:min-w-[130px]"
              >
                {exporting
                  ? "Exporting…"
                  : `Export ${
                      exportFormat ===
                      "jpeg"
                        ? "JPG"
                        : exportFormat.toUpperCase()
                    }${
                      exportArea ===
                      "selection"
                        ? " Selection"
                        : ""
                    }`}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* WORKSPACE */}

      <div className="flex h-[calc(100dvh-56px)] lg:h-[calc(100vh-56px)]">

        {/* TOOLS */}

        <aside
          className={
            workspacePanelsHidden
              ? "hidden"
              : "sihag-tool-rail hidden shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#111318] lg:flex"
          }
        >

          <div className="sihag-tool-rail-label">TOOLS</div>

          {tools.map((tool, index) => {
            const previous = tools[index - 1];
            const startsGroup = index > 0 && previous?.group !== tool.group;

            return (
              <div key={tool.id} className="sihag-tool-slot">
                {startsGroup && <div className="sihag-tool-divider" />}

                <button
                  onClick={() => setActiveTool(tool.id)}
                  className={
                    activeTool === tool.id
                      ? "sihag-tool-button sihag-tool-button-active"
                      : "sihag-tool-button"
                  }
                  title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
                  aria-label={tool.name}
                >
                  <span className="sihag-tool-icon" aria-hidden="true">{tool.icon}</span>
                  <span className="sihag-tool-name">{tool.name}</span>
                  {tool.shortcut && <span className="sihag-tool-shortcut">{tool.shortcut}</span>}
                </button>
              </div>
            );
          })}

        </aside>

        {/* CENTER */}

        <section className="sihag-workspace relative flex min-w-0 flex-1 flex-col bg-[#12151a]">

          <div
            onWheel={handleWheel}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            className={`sihag-canvas-stage relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.035),transparent_34%),linear-gradient(180deg,#171a20_0%,#12151a_100%)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] before:bg-[size:24px_24px] before:[mask-image:radial-gradient(circle_at_center,black,transparent_78%)] lg:touch-auto ${
              mobilePanel === "properties" || mobilePanel === "adjust" || mobilePanel === "layers" || mobilePanel === "text" || mobilePanel === "brush"
                ? "p-2.5 pb-[42dvh] sm:p-4 sm:pb-[48dvh] lg:p-8"
                : "p-2.5 sm:p-4 lg:p-8"
            } ${
              activeTool === "hand"
                ? dragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-default"
            }`}
          >

            <div className="pointer-events-none absolute left-3 top-3 z-10 hidden items-center gap-2 rounded-full border border-white/[0.07] bg-[#0d1016]/75 px-2.5 py-1.5 text-[9px] font-medium tracking-[0.10em] text-gray-500 shadow-lg backdrop-blur-md sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_10px_rgba(103,232,249,0.45)]" />
              CANVAS
            </div>

            {layers.length > 0 ? (

              activeTool === "crop" && image ? (


              <div
                style={{
                  transform: `
                    translate(${pan.x}px, ${pan.y}px)
                    scale(${zoom})
                    rotate(${rotation + straighten}deg)
                    scaleX(${flipHorizontal ? -1 : 1})
                    scaleY(${flipVertical ? -1 : 1})
                  `,
                  transformOrigin:
                    "center center",
                }}
              >

                <div
                  ref={imageStageRef}
                  className="relative inline-block rounded-[4px] ring-1 ring-black/50 shadow-[0_30px_80px_rgba(0,0,0,0.42)]"
                >

                  <canvas
  ref={canvasRef}
  className="block max-h-[calc(100dvh-176px)] max-w-[calc(100vw-16px)] rounded-[3px] ring-1 ring-white/[0.10] shadow-[0_28px_70px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.35)] lg:max-h-[70vh] lg:max-w-[70vw]"
/>

                  {activeTool ===
                    "crop" && (

                    <div
                      className="absolute inset-0"
                      onPointerMove={
                        moveCrop
                      }
                      onPointerUp={
                        endCropDrag
                      }
                      onPointerCancel={
                        endCropDrag
                      }
                    >

                      {/* DARK OUTSIDE AREA */}

                      <div
                        className="pointer-events-none absolute bg-black/60"
                        style={{
                          left: 0,
                          top: 0,
                          right: 0,
                          height: `${crop.y * 100}%`,
                        }}
                      />

                      <div
                        className="pointer-events-none absolute bg-black/60"
                        style={{
                          left: 0,
                          top: `${crop.y * 100}%`,
                          width: `${crop.x * 100}%`,
                          height: `${crop.height * 100}%`,
                        }}
                      />

                      <div
                        className="pointer-events-none absolute bg-black/60"
                        style={{
                          right: 0,
                          top: `${crop.y * 100}%`,
                          width: `${
                            (1 -
                              crop.x -
                              crop.width) *
                            100
                          }%`,
                          height: `${crop.height * 100}%`,
                        }}
                      />

                      <div
                        className="pointer-events-none absolute bg-black/60"
                        style={{
                          left: 0,
                          right: 0,
                          top: `${
                            (crop.y +
                              crop.height) *
                            100
                          }%`,
                          bottom: 0,
                        }}
                      />

                      {/* CROP RECTANGLE */}

                      <div
                        onPointerDown={(
                          event
                        ) =>
                          startCropDrag(
                            event,
                            "move"
                          )
                        }
                        className="absolute cursor-move border-2 border-white"
                        style={{
                          left: `${crop.x * 100}%`,
                          top: `${crop.y * 100}%`,
                          width: `${crop.width * 100}%`,
                          height: `${crop.height * 100}%`,
                        }}
                      >

                        {/* RULE OF THIRDS */}

                        <div className="pointer-events-none absolute left-1/3 top-0 h-full border-l border-white/35" />

                        <div className="pointer-events-none absolute left-2/3 top-0 h-full border-l border-white/35" />

                        <div className="pointer-events-none absolute left-0 top-1/3 w-full border-t border-white/35" />

                        <div className="pointer-events-none absolute left-0 top-2/3 w-full border-t border-white/35" />

                        <CropHandle
                          position="nw"
                          onPointerDown={(
                            event
                          ) =>
                            startCropDrag(
                              event,
                              "nw"
                            )
                          }
                        />

                        <CropHandle
                          position="ne"
                          onPointerDown={(
                            event
                          ) =>
                            startCropDrag(
                              event,
                              "ne"
                            )
                          }
                        />

                        <CropHandle
                          position="sw"
                          onPointerDown={(
                            event
                          ) =>
                            startCropDrag(
                              event,
                              "sw"
                            )
                          }
                        />

                        <CropHandle
                          position="se"
                          onPointerDown={(
                            event
                          ) =>
                            startCropDrag(
                              event,
                              "se"
                            )
                          }
                        />

                      </div>

                    </div>

                  )}

                </div>

              </div>

              ) : (

                <LayerCanvas
                  layers={layers}
                  zoom={zoom}
                  previewMaxSize={previewMaxSize}
                  pan={pan}
                  selectedLayerId={selectedLayerId}
                  activeTool={activeTool}
                  snapEnabled={snapEnabled}
                  showGrid={showGrid}
                  gridSize={gridSize}
                  showGuides={showGuides}
                  showRulers={showRulers}
                  guidesX={guidesX}
                  guidesY={guidesY}
                  onGuidesXChange={setGuidesX}
                  onGuidesYChange={setGuidesY}
                  selection={selection}
                  selectionInverted={selectionInverted}
                  selectionFeather={selectionFeather}
                  selectionShape={selectionShape}
                  selectionPath={selectionPath}
                  selectionMode={selectionMode}
                  selectionRegions={selectionRegions}
                  magicWandTolerance={magicWandTolerance}
                  quickSelectionBrushSize={quickSelectionBrushSize}
                  quickSelectionTolerance={quickSelectionTolerance}
                  selectionAspect={selectionAspect}
                  onSelectionChange={setSelection}
                  onSelectionInvertChange={setSelectionInverted}
                  onSelectionShapeChange={setSelectionShape}
                  onSelectionPathChange={setSelectionPath}
                  onSelectionRegionCommit={commitSelectionRegion}
                  onMoveLayer={updateLayerTransform}
                  onSelectLayer={selectLayerFromCanvas}
                  onDeselectLayer={deselectLayer}
                  onAddTextAt={(
                    x,
                    y
                  ) =>
                    addTextLayer(
                      x,
                      y
                    )
                  }
                  onAddShapeAt={(
                    x,
                    y,
                    width,
                    height
                  ) =>
                    addShapeLayer(
                      x,
                      y,
                      width,
                      height
                    )
                  }
                  onTransformStart={saveHistory}
                  maskBrushSize={maskBrushSize}
                  maskBrushHardness={maskBrushHardness}
                  maskBrushOpacity={maskBrushOpacity}
                  maskOverlayEnabled={maskOverlayEnabled}
                  maskBrushMode={maskBrushMode}
                  onMaskStrokeStart={saveHistory}
                  onMaskChange={updateLayerMaskSrc}
                  healBrushSize={healBrushSize}
                  healBrushHardness={healBrushHardness}
                  healBrushOpacity={healBrushOpacity}
                  onHealStrokeStart={saveHistory}
                  onLayerSourceChange={updateLayerSource}
                  cloneBrushSize={cloneBrushSize}
                  cloneBrushHardness={cloneBrushHardness}
                  cloneBrushOpacity={cloneBrushOpacity}
                  cloneSample={cloneSample}
                  onCloneSampleChange={setCloneSample}
                  onCloneStrokeStart={saveHistory}
                  eraserBrushSize={eraserBrushSize}
                  eraserBrushHardness={eraserBrushHardness}
                  eraserBrushOpacity={eraserBrushOpacity}
                  onEraserStrokeStart={saveHistory}
                  dodgeBurnMode={dodgeBurnMode}
                  dodgeBurnRange={dodgeBurnRange}
                  dodgeBurnBrushSize={dodgeBurnBrushSize}
                  dodgeBurnBrushHardness={dodgeBurnBrushHardness}
                  dodgeBurnExposure={dodgeBurnExposure}
                  onDodgeBurnStrokeStart={saveHistory}
                  blurSharpenMode={blurSharpenMode}
                  blurSharpenBrushSize={blurSharpenBrushSize}
                  blurSharpenBrushHardness={blurSharpenBrushHardness}
                  blurSharpenStrength={blurSharpenStrength}
                  onBlurSharpenStrokeStart={saveHistory}
                  paintBrushColor={paintBrushColor}
                  paintBrushSize={paintBrushSize}
                  paintBrushHardness={paintBrushHardness}
                  paintBrushOpacity={paintBrushOpacity}
                  paintBrushFlow={paintBrushFlow}
                  paintBrushSpacing={paintBrushSpacing}
                  paintBrushSmoothing={paintBrushSmoothing}
                  paintBrushMode={paintBrushMode}
                  paintBrushBlendMode={paintBrushBlendMode}
                  paintPressureSize={paintPressureSize}
                  paintPressureOpacity={paintPressureOpacity}
                  onPaintStrokeStart={saveHistory}
                />

              )

            ) : (

             <div className="relative flex h-[75%] w-[94%] items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.075] bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.055),transparent_38%),#171a20] shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:w-[88%] lg:h-[70%] lg:w-[70%]">

                <div className="text-center">

                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] border border-cyan-400/15 bg-cyan-400/[0.055] text-3xl text-cyan-300 shadow-[0_12px_30px_rgba(0,0,0,0.18)] sm:mb-5 sm:h-20 sm:w-20 sm:text-4xl">
                    +
                  </div>

                  <h2 className="text-xl font-semibold sm:text-2xl">
                    Start Editing
                  </h2>

                  <p className="mt-2 px-3 text-xs text-gray-500 sm:text-sm">
                    Professional browser image editor
                  </p>

                  <button
                    type="button"
                    onClick={openImagePicker}
                    className="mt-5 inline-block min-h-11 cursor-pointer touch-manipulation rounded-xl border border-cyan-300/20 bg-cyan-500/90 px-6 py-3 text-sm font-semibold text-[#061114] shadow-[0_10px_24px_rgba(0,0,0,0.20)] active:scale-[0.98] sm:mt-6"
                  >
                    Open Image
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* MOBILE TEXT / CROP / BRUSH FIX - text editor sheet + raster targeting */}

          {/* TEXT PRO STAGE 1 - intentional add, mobile keyboard, advanced typography */}

          {/* MOBILE ADJUST + LAYERS PREVIEW FIX - keeps canvas visible while editing */}

          {/* MOBILE PROFESSIONAL WORKSPACE */}

          {mobilePanel && (
            <div
              className={
                mobilePanel === "brush" || mobilePanel === "properties"
                  ? "pointer-events-none fixed inset-x-0 top-14 z-[210] lg:hidden"
                  : "fixed inset-x-0 top-14 z-[210] lg:hidden"
              }
              style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                aria-label="Close mobile panel"
                onClick={() => setMobilePanel(null)}
                className={
                  mobilePanel === "brush" || mobilePanel === "properties"
                    ? "pointer-events-none absolute inset-0 bg-transparent"
                    : mobilePanel === "adjust" ||
                        mobilePanel === "layers" ||
                        mobilePanel === "text"
                      ? "absolute inset-0 bg-transparent"
                      : "absolute inset-0 bg-black/25"
                }
              />

              <div
                className={`sihag-mobile-sheet pointer-events-auto absolute inset-x-0 bottom-0 overflow-y-auto overscroll-contain border-t lg:hidden ${
                  mobilePanel === "properties" ||
                  mobilePanel === "adjust" ||
                  mobilePanel === "layers" ||
                  mobilePanel === "text" ||
                  mobilePanel === "brush"
                    ? "h-[46dvh] max-h-[470px] sm:h-[50dvh] sm:max-h-[560px]"
                    : "max-h-[68dvh]"
                }`}
              >
                <div className="sihag-mobile-sheet-header sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="sihag-mobile-sheet-kicker">
                      {mobilePanel === "tools"
                        ? "Workspace"
                        : mobilePanel === "properties" ||
                            mobilePanel === "text" ||
                            mobilePanel === "brush"
                          ? "Context"
                          : mobilePanel === "adjust"
                            ? "Image"
                            : mobilePanel === "layers"
                              ? "Document"
                              : "Studio"}
                    </div>

                    <div className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.01em] text-white">
                      {mobilePanel === "tools"
                        ? "Tools"
                        : mobilePanel === "properties"
                          ? "Properties"
                          : mobilePanel === "adjust"
                            ? "Adjust"
                            : mobilePanel === "layers"
                              ? "Layers"
                              : mobilePanel === "text"
                                ? "Text Properties"
                                : mobilePanel === "brush"
                                  ? "Brush Properties"
                                  : "More"}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-[#7f8793]">
                      {mobilePanel === "tools"
                        ? "Choose a tool, then refine it in Properties"
                        : mobilePanel === "properties"
                          ? `${activeTool.replaceAll("-", " ")}${selectedLayer ? ` • ${selectedLayer.name}` : ""}`
                          : mobilePanel === "adjust"
                            ? "Non-destructive image corrections"
                            : mobilePanel === "layers"
                              ? `${layers.length} ${layers.length === 1 ? "layer" : "layers"} • ${groups.length} ${groups.length === 1 ? "folder" : "folders"}`
                              : mobilePanel === "text"
                                ? selectedLayer?.layerKind === "text"
                                  ? selectedLayer.name
                                  : "Typography and text layer controls"
                                : mobilePanel === "brush"
                                  ? "Paint settings • canvas remains available"
                                  : "Document, export and performance"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobilePanel(null)}
                    className="sihag-mobile-sheet-close"
                    aria-label="Close panel"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path d="m7 7 10 10M17 7 7 17" />
                    </svg>
                  </button>
                </div>

                {mobilePanel === "tools" && (
                  <section className="px-3 pb-5 pt-3">
                    {(
                      [
                        ["navigate", "Navigate"],
                        ["select", "Select"],
                        ["retouch", "Retouch"],
                        ["create", "Create"],
                        ["view", "View"],
                      ] as const
                    ).map(([group, label]) => {
                      const groupTools = tools.filter(
                        (tool) => tool.group === group
                      );

                      if (groupTools.length === 0) {
                        return null;
                      }

                      return (
                        <div key={group} className="mb-4 last:mb-0">
                          <div className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#646c78]">
                            {label}
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {groupTools.map((tool) => {
                              const selected =
                                activeTool === tool.id;

                              return (
                                <button
                                  key={tool.id}
                                  type="button"
                                  onClick={() => {
                                    if (tool.id === "text") {
                                      openMobileTextEditor();
                                      return;
                                    }

                                    if (tool.id === "paint") {
                                      openMobileBrushEditor();
                                      return;
                                    }

                                    activateMobileTool(tool.id);
                                    setMobilePanel("properties");
                                  }}
                                  className={
                                    selected
                                      ? "sihag-mobile-tool-row sihag-mobile-tool-row-active"
                                      : "sihag-mobile-tool-row"
                                  }
                                >
                                  <span className="min-w-0 truncate text-left">
                                    {tool.name}
                                  </span>

                                  <span className="sihag-mobile-tool-meta">
                                    {tool.shortcut ?? (selected ? "ACTIVE" : "OPEN")}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                )}

                {mobilePanel === "properties" && (
                  <section>
                    <div className="sihag-mobile-context-strip">
                      <div className="min-w-0">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#656e7b]">
                          Active tool
                        </div>
                        <div className="mt-1 truncate text-[12px] font-medium capitalize text-[#e7eaf0]">
                          {activeTool.replaceAll("-", " ")}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMobilePanel("tools")}
                        className="sihag-mobile-secondary-button"
                      >
                        Change Tool
                      </button>
                    </div>

                    {activeTool === "move" &&
                      selectedLayer?.layerKind !== "adjustment" && (
                        <LayerTransformPanel
                          layer={selectedLayer}
                          onChange={updateLayerTransform}
                          onReset={resetLayerTransform}
                        />
                      )}

                    {activeTool === "crop" && image && (
                      <div className="px-4 pb-5 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[13px] font-semibold text-white">
                              Crop
                            </div>
                            <div className="mt-1 text-[10px] text-[#747d89]">
                              Choose a ratio or adjust directly on canvas
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={resetCrop}
                            className="sihag-mobile-text-button"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="mt-4 grid grid-cols-5 gap-1.5">
                          {(
                            [
                              "free",
                              "1:1",
                              "4:3",
                              "3:2",
                              "16:9",
                            ] as CropAspect[]
                          ).map((aspect) => (
                            <button
                              key={aspect}
                              type="button"
                              onClick={() =>
                                chooseCropAspect(aspect)
                              }
                              className={
                                cropAspect === aspect
                                  ? "sihag-mobile-segment sihag-mobile-segment-active"
                                  : "sihag-mobile-segment"
                              }
                            >
                              {aspect === "free" ? "Free" : aspect}
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                          <div>
                            <div className="text-[9px] uppercase tracking-[0.12em] text-[#646c78]">
                              Output
                            </div>
                            <div className="mt-1 text-[11px] tabular-nums text-[#c7ccd4]">
                              {Math.round(
                                crop.width * image.naturalWidth
                              )}
                              {" × "}
                              {Math.round(
                                crop.height * image.naturalHeight
                              )}
                              px
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={cancelCrop}
                              className="sihag-mobile-secondary-button"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={applyCrop}
                              className="sihag-mobile-primary-button"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTool === "shape" && (
                      <ShapeLayerPanel
                        layer={selectedLayer}
                        onAdd={() => addShapeLayer()}
                        onChange={updateShapeLayer}
                        onChangeStart={saveHistory}
                      />
                    )}

                    {activeTool === "brush" && (
                      <MaskBrushPanel
                        layer={selectedLayer}
                        brushSize={maskBrushSize}
                        brushHardness={maskBrushHardness}
                        brushOpacity={maskBrushOpacity}
                        overlayEnabled={maskOverlayEnabled}
                        mode={maskBrushMode}
                        onBrushSizeChange={setMaskBrushSize}
                        onBrushHardnessChange={setMaskBrushHardness}
                        onBrushOpacityChange={setMaskBrushOpacity}
                        onOverlayToggle={() =>
                          setMaskOverlayEnabled(
                            (value) => !value
                          )
                        }
                        onModeChange={setMaskBrushMode}
                      />
                    )}

                    {activeTool === "heal" && (
                      <HealBrushPanel
                        layer={selectedLayer}
                        brushSize={healBrushSize}
                        brushHardness={healBrushHardness}
                        brushOpacity={healBrushOpacity}
                        onBrushSizeChange={setHealBrushSize}
                        onBrushHardnessChange={setHealBrushHardness}
                        onBrushOpacityChange={setHealBrushOpacity}
                      />
                    )}

                    {activeTool === "clone" && (
                      <CloneStampPanel
                        layer={selectedLayer}
                        brushSize={cloneBrushSize}
                        brushHardness={cloneBrushHardness}
                        brushOpacity={cloneBrushOpacity}
                        hasSample={
                          !!cloneSample &&
                          !!selectedLayer &&
                          cloneSample.layerId ===
                            selectedLayer.id
                        }
                        onBrushSizeChange={setCloneBrushSize}
                        onBrushHardnessChange={setCloneBrushHardness}
                        onBrushOpacityChange={setCloneBrushOpacity}
                        onClearSample={() =>
                          setCloneSample(null)
                        }
                      />
                    )}

                    {activeTool === "eraser" && (
                      <EraserBrushPanel
                        layer={selectedLayer}
                        brushSize={eraserBrushSize}
                        brushHardness={eraserBrushHardness}
                        brushOpacity={eraserBrushOpacity}
                        onBrushSizeChange={setEraserBrushSize}
                        onBrushHardnessChange={setEraserBrushHardness}
                        onBrushOpacityChange={setEraserBrushOpacity}
                      />
                    )}

                    {activeTool === "dodge-burn" && (
                      <DodgeBurnPanel
                        layer={selectedLayer}
                        mode={dodgeBurnMode}
                        range={dodgeBurnRange}
                        brushSize={dodgeBurnBrushSize}
                        brushHardness={dodgeBurnBrushHardness}
                        exposure={dodgeBurnExposure}
                        onModeChange={setDodgeBurnMode}
                        onRangeChange={setDodgeBurnRange}
                        onBrushSizeChange={setDodgeBurnBrushSize}
                        onBrushHardnessChange={setDodgeBurnBrushHardness}
                        onExposureChange={setDodgeBurnExposure}
                      />
                    )}

                    {activeTool === "blur-sharpen" && (
                      <BlurSharpenPanel
                        layer={selectedLayer}
                        mode={blurSharpenMode}
                        brushSize={blurSharpenBrushSize}
                        brushHardness={blurSharpenBrushHardness}
                        strength={blurSharpenStrength}
                        onModeChange={setBlurSharpenMode}
                        onBrushSizeChange={setBlurSharpenBrushSize}
                        onBrushHardnessChange={setBlurSharpenBrushHardness}
                        onStrengthChange={setBlurSharpenStrength}
                      />
                    )}

                    {activeTool === "ai" && (
                      <AiToolsPanel />
                    )}

                    {![
                      "move",
                      "crop",
                      "shape",
                      "brush",
                      "heal",
                      "clone",
                      "eraser",
                      "dodge-burn",
                      "blur-sharpen",
                      "ai",
                    ].includes(activeTool) && (
                      <div className="px-4 py-5">
                        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-4">
                          <div className="text-[12px] font-medium capitalize text-[#e3e6eb]">
                            {activeTool.replaceAll("-", " ")}
                          </div>
                          <p className="mt-1.5 text-[10px] leading-5 text-[#7a828e]">
                            This tool works directly on the canvas. Use the canvas controls below for navigation, or choose another tool from Tools.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {mobilePanel === "adjust" && (
                  <section className="px-4 pb-6 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-semibold text-white">
                          Basic Adjustments
                        </div>
                        <div className="mt-1 text-[10px] text-[#747d89]">
                          One correction group at a time
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={resetAll}
                        className="sihag-mobile-text-button"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="sihag-mobile-adjust-tabs mt-4 flex gap-1.5 overflow-x-auto pb-1">
                      {(
                        [
                          ["light", "Light"],
                          ["color", "Color"],
                          ["presence", "Presence"],
                          ["detail", "Detail"],
                          ["effects", "Effects"],
                          ["layer", "Layer"],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            setMobileAdjustGroup(id)
                          }
                          className={
                            mobileAdjustGroup === id
                              ? "sihag-mobile-adjust-tab sihag-mobile-adjust-tab-active"
                              : "sihag-mobile-adjust-tab"
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      {mobileAdjustGroup === "light" && (
                        <>
                          <Slider
                            title="Exposure"
                            value={settings.exposure}
                            min={-2}
                            max={2}
                            step={0.1}
                            suffix=" EV"
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("exposure", v)
                            }
                          />
                          <Slider
                            title="Brightness"
                            value={settings.brightness}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("brightness", v)
                            }
                          />
                          <Slider
                            title="Contrast"
                            value={settings.contrast}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("contrast", v)
                            }
                          />
                          <Slider
                            title="Highlights"
                            value={settings.highlights}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("highlights", v)
                            }
                          />
                          <Slider
                            title="Shadows"
                            value={settings.shadows}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("shadows", v)
                            }
                          />
                          <Slider
                            title="Whites"
                            value={settings.whites}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("whites", v)
                            }
                          />
                          <Slider
                            title="Blacks"
                            value={settings.blacks}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("blacks", v)
                            }
                          />
                        </>
                      )}

                      {mobileAdjustGroup === "color" && (
                        <>
                          <Slider
                            title="Temperature"
                            value={settings.temperature}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("temperature", v)
                            }
                          />
                          <Slider
                            title="Tint"
                            value={settings.tint}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("tint", v)
                            }
                          />
                          <Slider
                            title="Vibrance"
                            value={settings.vibrance}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("vibrance", v)
                            }
                          />
                          <Slider
                            title="Saturation"
                            value={settings.saturation}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("saturation", v)
                            }
                          />
                        </>
                      )}

                      {mobileAdjustGroup === "presence" && (
                        <>
                          <Slider
                            title="Texture"
                            value={settings.texture}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("texture", v)
                            }
                          />
                          <Slider
                            title="Clarity"
                            value={settings.clarity}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("clarity", v)
                            }
                          />
                          <Slider
                            title="Dehaze"
                            value={settings.dehaze}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("dehaze", v)
                            }
                          />
                        </>
                      )}

                      {mobileAdjustGroup === "detail" && (
                        <>
                          <Slider
                            title="Sharpening"
                            value={settings.sharpness}
                            min={0}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("sharpness", v)
                            }
                          />
                          <Slider
                            title="Noise Reduction"
                            value={settings.noiseReduction}
                            min={0}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("noiseReduction", v)
                            }
                          />
                        </>
                      )}

                      {mobileAdjustGroup === "effects" && (
                        <>
                          <Slider
                            title="Vignette"
                            value={settings.vignette}
                            min={-100}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("vignette", v)
                            }
                          />
                          <Slider
                            title="Grain"
                            value={settings.grain}
                            min={0}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("grain", v)
                            }
                          />
                          <Slider
                            title="Fade"
                            value={settings.fade}
                            min={0}
                            max={100}
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("fade", v)
                            }
                          />
                          <Slider
                            title="Blur"
                            value={settings.blur}
                            min={0}
                            max={20}
                            suffix=" px"
                            onEditStart={saveHistory}
                            onChange={(v) =>
                              change("blur", v)
                            }
                          />
                        </>
                      )}

                      {mobileAdjustGroup === "layer" && (
                        <Slider
                          title="Opacity"
                          value={settings.opacity}
                          min={0}
                          max={100}
                          suffix="%"
                          onEditStart={saveHistory}
                          onChange={(v) =>
                            change("opacity", v)
                          }
                        />
                      )}
                    </div>
                  </section>
                )}

                {mobilePanel === "layers" && (
                  <section>
                    <div className="sihag-mobile-layer-addbar grid grid-cols-4 gap-1.5 px-3 py-3">
                      <label className="sihag-mobile-add-layer-button cursor-pointer">
                        <span className="text-[15px] leading-none">+</span>
                        <span>Image</span>
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={addImageLayer}
                        />
                      </label>

                      <button
                        type="button"
                        disabled={layers.length === 0}
                        onClick={openMobileTextEditor}
                        className="sihag-mobile-add-layer-button disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span className="text-[15px] leading-none">+</span>
                        <span>Text</span>
                      </button>

                      <button
                        type="button"
                        disabled={layers.length === 0}
                        onClick={() => addShapeLayer()}
                        className="sihag-mobile-add-layer-button disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span className="text-[15px] leading-none">+</span>
                        <span>Shape</span>
                      </button>

                      <button
                        type="button"
                        disabled={layers.length === 0}
                        onClick={addAdjustmentLayer}
                        className="sihag-mobile-add-layer-button disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span className="text-[15px] leading-none">+</span>
                        <span>Adjust</span>
                      </button>
                    </div>

                    <LayerPanel
                      layers={layers}
                      groups={groups}
                      selectedLayerId={selectedLayerId}
                      selectedLayerIds={selectedLayerIds}
                      onCreateGroup={createLayerGroup}
                      onRenameGroup={renameLayerGroup}
                      onDeleteGroup={deleteLayerGroup}
                      onDuplicateGroup={duplicateLayerGroup}
                      onBringGroupToFront={bringLayerGroupToFront}
                      onSendGroupToBack={sendLayerGroupToBack}
                      onMoveGroup={moveLayerGroup}
                      onToggleGroupCollapsed={toggleLayerGroupCollapsed}
                      onToggleGroupVisible={toggleLayerGroupVisible}
                      onToggleGroupLock={toggleLayerGroupLock}
                      onAssignGroup={assignLayerGroup}
                      onSelect={selectLayer}
                      onToggleVisible={toggleLayerVisible}
                      onToggleLock={toggleLayerLock}
                      onDuplicate={duplicateLayer}
                      onDelete={deleteLayer}
                      onMoveUp={moveLayerUp}
                      onMoveDown={moveLayerDown}
                      onRename={renameLayer}
                      onReorder={reorderLayer}
                      onOpacityChange={changeLayerOpacity}
                      onOpacityStart={saveHistory}
                      onBlendModeChange={changeLayerBlendMode}
                      onAddMask={addLayerMask}
                      onToggleMask={toggleLayerMask}
                      onInvertMask={invertLayerMask}
                      onRemoveMask={removeLayerMask}
                      onMaskDensityChange={changeLayerMaskDensity}
                      onMaskDensityStart={saveHistory}
                      onMaskFeatherChange={changeLayerMaskFeather}
                      onMaskFeatherStart={saveHistory}
                      onRevealAllMask={revealAllLayerMask}
                      onHideAllMask={hideAllLayerMask}
                    />
                  </section>
                )}

                {mobilePanel === "brush" && (
                  <PaintBrushPanel
                    layer={selectedLayer}
                    color={paintBrushColor}
                    brushSize={paintBrushSize}
                    brushHardness={paintBrushHardness}
                    brushOpacity={paintBrushOpacity}
                    brushFlow={paintBrushFlow}
                    brushSpacing={paintBrushSpacing}
                    brushSmoothing={paintBrushSmoothing}
                    mode={paintBrushMode}
                    blendMode={paintBrushBlendMode}
                    pressureSize={paintPressureSize}
                    pressureOpacity={paintPressureOpacity}
                    onColorChange={setPaintBrushColor}
                    onBrushSizeChange={setPaintBrushSize}
                    onBrushHardnessChange={setPaintBrushHardness}
                    onBrushOpacityChange={setPaintBrushOpacity}
                    onBrushFlowChange={setPaintBrushFlow}
                    onBrushSpacingChange={setPaintBrushSpacing}
                    onBrushSmoothingChange={setPaintBrushSmoothing}
                    onModeChange={setPaintBrushMode}
                    onBlendModeChange={setPaintBrushBlendMode}
                    onPressureSizeChange={setPaintPressureSize}
                    onPressureOpacityChange={setPaintPressureOpacity}
                    compact
                  />
                )}

                {mobilePanel === "text" && (
                  <section
                    className="p-3"
                    data-mobile-text-editor="true"
                  >
                    {selectedLayer?.layerKind === "text" ? (
                      <TextLayerPanel
                        layer={selectedLayer}
                        onAdd={() => {
                          addTextLayer();
                          setActiveTool("move");
                        }}
                        onChange={updateTextLayer}
                        onChangeStart={saveHistory}
                        onDuplicate={duplicateLayer}
                        onDelete={deleteLayer}
                        onLayerChange={updateLayerTransform}
                        onLayerChangeStart={saveHistory}
                        autoFocusText
                      />
                    ) : (
                      <div className="flex min-h-32 flex-col items-center justify-center gap-3 px-4 text-center">
                        <div className="text-[12px] font-medium text-[#dfe3e9]">
                          Create a text layer
                        </div>
                        <p className="max-w-[280px] text-[10px] leading-5 text-[#747d89]">
                          Add text, then typography and transform controls will appear here.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            addTextLayer();
                            setActiveTool("move");
                          }}
                          className="sihag-mobile-primary-button min-h-10 px-4"
                        >
                          Add Text
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {mobilePanel === "more" && (
                  <section className="px-3 pb-5 pt-3">
                    <div className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#646c78]">
                      Document
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.018]">
                      <button
                        type="button"
                        onClick={() => {
                          setMobilePanel(null);
                          openImagePicker();
                        }}
                        className="sihag-mobile-more-row"
                      >
                        <span>Open Image</span>
                        <span className="sihag-mobile-more-meta">IMAGE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobilePanel(null);
                          openProjectPicker();
                        }}
                        className="sihag-mobile-more-row"
                      >
                        <span>Open Project</span>
                        <span className="sihag-mobile-more-meta">.SIHAG</span>
                      </button>

                      <button
                        type="button"
                        disabled={layers.length === 0}
                        onClick={() => {
                          saveProject();
                          setMobilePanel(null);
                        }}
                        className="sihag-mobile-more-row disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span>Save Project</span>
                        <span className="sihag-mobile-more-meta">SAVE</span>
                      </button>

                      <button
                        type="button"
                        disabled={layers.length === 0}
                        onClick={() => {
                          setMobilePanel(null);
                          void openExportDialog();
                        }}
                        className="sihag-mobile-more-row disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <span>Export</span>
                        <span className="sihag-mobile-more-meta">OUTPUT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobilePanel(null);
                          setShortcutsOpen(true);
                        }}
                        className="sihag-mobile-more-row"
                      >
                        <span>Keyboard Shortcuts</span>
                        <span className="sihag-mobile-more-meta">HELP</span>
                      </button>
                    </div>

                    <div className="mb-2 mt-5 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#646c78]">
                      Preview
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-3">
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            ["fast", "Fast", "800"],
                            ["balanced", "Balanced", "1200"],
                            ["quality", "Quality", "1600"],
                          ] as const
                        ).map(([mode, label, size]) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() =>
                              setPreviewQuality(mode)
                            }
                            className={
                              previewQuality === mode
                                ? "sihag-mobile-quality-button sihag-mobile-quality-button-active"
                                : "sihag-mobile-quality-button"
                            }
                          >
                            <span>{label}</span>
                            <span className="mt-0.5 text-[8px] text-[#6d7581]">
                              {size}px
                            </span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={purgePreviewCache}
                        className="mt-2.5 w-full rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[10px] text-[#aeb4bd] active:bg-white/[0.055]"
                      >
                        {previewCachePurged
                          ? "Preview cache cleared"
                          : "Clear preview cache"}
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}

          {/* MOBILE CANVAS CONTROLS */}

          {layers.length > 0 && (
            <div className="sihag-mobile-canvas-controls grid shrink-0 select-none grid-cols-5 lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setMobilePanel(null);
                  setMobileMenuOpen(false);
                  setActiveTool("hand");
                }}
                className={
                  activeTool === "hand"
                    ? "sihag-mobile-canvas-button sihag-mobile-canvas-button-active"
                    : "sihag-mobile-canvas-button"
                }
                title="Pan canvas"
              >
                Pan
              </button>

              <button
                type="button"
                onClick={zoomOut}
                className="sihag-mobile-canvas-button text-lg"
                title="Zoom out"
                aria-label="Zoom out"
              >
                −
              </button>

              <div className="flex min-h-10 items-center justify-center text-[10px] font-medium tabular-nums text-[#b7bdc7]">
                {Math.round(zoom * 100)}%
              </div>

              <button
                type="button"
                onClick={fitToScreen}
                className="sihag-mobile-canvas-button"
                title="Fit canvas"
              >
                Fit
              </button>

              <button
                type="button"
                onClick={zoomIn}
                className="sihag-mobile-canvas-button text-lg"
                title="Zoom in"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          )}

          {/* MOBILE PRIMARY NAVIGATION */}

          <nav
            className="sihag-mobile-dock grid shrink-0 select-none grid-cols-5 lg:hidden"
            style={{
              height: "calc(64px + env(safe-area-inset-bottom))",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            aria-label="Editor navigation"
          >
            {(
              [
                {
                  id: "tools",
                  label: "Tools",
                },
                {
                  id: "properties",
                  label: "Properties",
                },
                {
                  id: "adjust",
                  label: "Adjust",
                },
                {
                  id: "layers",
                  label: "Layers",
                },
                {
                  id: "more",
                  label: "More",
                },
              ] as const
            ).map((item) => {
              const isProperties =
                item.id === "properties";

              const isActive = isProperties
                ? mobilePanel === "properties" ||
                  mobilePanel === "text" ||
                  mobilePanel === "brush"
                : mobilePanel === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);

                    if (item.id === "properties") {
                      if (
                        mobilePanel === "properties" ||
                        mobilePanel === "text" ||
                        mobilePanel === "brush"
                      ) {
                        setMobilePanel(null);
                        return;
                      }

                      if (activeTool === "paint") {
                        openMobileBrushEditor();
                        return;
                      }

                      if (
                        selectedLayer?.layerKind === "text"
                      ) {
                        setActiveTool("move");
                        setMobilePanel("text");
                        return;
                      }

                      setMobilePanel("properties");
                      return;
                    }

                    setMobilePanel((value) =>
                      value === item.id
                        ? null
                        : item.id
                    );
                  }}
                  className={
                    isActive
                      ? "sihag-mobile-nav-item sihag-mobile-nav-item-active"
                      : "sihag-mobile-nav-item"
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="sihag-mobile-nav-icon">
                    {mobileDockIcon(item.id)}
                  </span>
                  <span className="sihag-mobile-nav-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* STATUS */}

          <footer className="sihag-statusbar hidden h-12 shrink-0 items-center gap-3 border-t border-white/10 bg-[#111318] px-4 text-xs text-gray-500 lg:flex">

            <span
              className="max-w-[180px] truncate text-gray-300"
              title={fileName}
            >
              {fileName}
            </span>

            {image && (
              <span className="hidden lg:inline">
                {image.naturalWidth}
                ×
                {image.naturalHeight}
                px
              </span>
            )}

            <span className="hidden rounded border border-white/10 bg-white/[0.035] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-gray-400 md:inline">
              {activeTool.replaceAll(
                "-",
                " "
              )}
            </span>

            <span className="hidden text-[10px] xl:inline">
              {layers.length}
              {layers.length === 1
                ? " layer"
                : " layers"}
            </span>

            {selectedLayerIds.length >
              1 && (
              <span className="hidden text-[10px] text-indigo-300 xl:inline">
                {selectedLayerIds.length} selected
              </span>
            )}

            {selection && (
              <span className="hidden rounded bg-cyan-500/10 px-2 py-1 text-[9px] text-cyan-300 xl:inline">
                SELECTION
              </span>
            )}

            <span
              className={
                previewQuality ===
                "fast"
                  ? "hidden rounded bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300 2xl:inline"
                  : previewQuality ===
                      "quality"
                    ? "hidden rounded bg-violet-500/10 px-2 py-1 text-[9px] text-violet-300 2xl:inline"
                    : "hidden rounded bg-indigo-500/10 px-2 py-1 text-[9px] text-indigo-300 2xl:inline"
              }
            >
              {previewQuality.toUpperCase()} PREVIEW
            </span>

            <span
              className={
                autosaveStatus ===
                "error"
                  ? "hidden text-[9px] text-red-300 2xl:inline"
                  : autosaveStatus ===
                      "saved"
                    ? "hidden text-[9px] text-emerald-400/70 2xl:inline"
                    : "hidden text-[9px] text-gray-600 2xl:inline"
              }
            >
              {autosaveStatus ===
              "saving"
                ? "SAVING…"
                : autosaveStatus ===
                    "saved"
                  ? "AUTOSAVED"
                  : autosaveStatus ===
                      "error"
                    ? "AUTOSAVE ERROR"
                    : "AUTOSAVE"}
            </span>

            <div className="ml-auto flex items-center gap-2">

              <button
                onClick={zoomOut}
                className="rounded bg-white/5 px-3 py-1.5 text-white hover:bg-white/10"
                title="Zoom out"
              >
                −
              </button>

              {[25, 50, 100, 200].map(
                (value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setZoomPreset(
                        value
                      )
                    }
                    className="hidden rounded px-2 py-1 hover:bg-white/10 lg:block"
                  >
                    {value}%
                  </button>
                )
              )}

              <button
                onClick={fitToScreen}
                className="rounded border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
              >
                Fit
              </button>

              <button
                onClick={zoomIn}
                className="rounded bg-white/5 px-3 py-1.5 text-white hover:bg-white/10"
                title="Zoom in"
              >
                +
              </button>

              <span className="w-14 text-center text-gray-300">
                {Math.round(
                  zoom * 100
                )}
                %
              </span>

            </div>

          </footer>

        </section>

        {/* RIGHT PANEL */}
<aside
  className={
    workspacePanelsHidden || workspaceInspectorHidden
      ? "hidden"
      : "sihag-inspector hidden w-80 shrink-0 overflow-y-auto border-l border-white/10 bg-[#111318] lg:block"
  }
>
        

          <div className="sihag-inspector-tabs sticky top-0 z-30 grid grid-cols-3 border-b border-white/[0.08] bg-[#0f131b]/96 p-2 backdrop-blur-xl">
            {([
              ["properties", "Properties"],
              ["adjust", "Adjust"],
              ["layers", "Layers"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setDesktopInspectorTab(id)}
                className={
                  desktopInspectorTab === id
                    ? "sihag-inspector-tab sihag-inspector-tab-active"
                    : "sihag-inspector-tab"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="sihag-inspector-context px-4 py-3">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {desktopInspectorTab === "properties"
                ? `${activeTool.replaceAll("-", " ")} options`
                : desktopInspectorTab === "adjust"
                  ? "Image & adjustment controls"
                  : "Document structure"}
            </div>
            <div className="mt-1 truncate text-[11px] text-gray-300">
              {desktopInspectorTab === "properties"
                ? selectedLayer
                  ? `${selectedLayer.name} • tool-specific controls`
                  : "Tool-specific controls"
                : desktopInspectorTab === "adjust"
                  ? selectedLayer?.layerKind === "adjustment"
                    ? selectedLayer.name
                    : "Adjust current image or adjustment layer"
                  : `${layers.length} ${layers.length === 1 ? "layer" : "layers"} • ${groups.length} ${groups.length === 1 ? "folder" : "folders"}`}
            </div>
          </div>

          {desktopInspectorTab === "adjust" && (
            <div className="sihag-adjust-workspace-bar border-b border-white/[0.08] px-3 pb-3">
              <div className="sihag-adjust-workspace-tabs grid grid-cols-5 gap-1">
                {([
                  ["basic", "Basic"],
                  ["curves", "Curves"],
                  ["hsl", "HSL"],
                  ["grading", "Grade"],
                  ["layer", "Layer"],
                ] as const).map(([id, label]) => {
                  const requiresAdjustmentLayer =
                    id !== "basic";

                  const disabled =
                    requiresAdjustmentLayer &&
                    selectedLayer?.layerKind !== "adjustment";

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setDesktopAdjustSection(id)
                      }
                      className={
                        desktopAdjustSection === id
                          ? "sihag-adjust-workspace-tab sihag-adjust-workspace-tab-active"
                          : "sihag-adjust-workspace-tab"
                      }
                      title={
                        disabled
                          ? "Select or create an adjustment layer first"
                          : `${label} adjustment workspace`
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="sihag-adjust-workspace-status mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    {desktopAdjustSection === "basic"
                      ? "Direct image adjustments"
                      : "Non-destructive adjustment layer"}
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-gray-400">
                    {desktopAdjustSection === "basic"
                      ? selectedLayer
                        ? `Editing ${selectedLayer.name}`
                        : "Open an image to begin"
                      : selectedLayer?.layerKind === "adjustment"
                        ? selectedLayer.name
                        : "Advanced controls need an adjustment layer"}
                  </div>
                </div>

                {selectedLayer?.layerKind !== "adjustment" && (
                  <button
                    type="button"
                    disabled={layers.length === 0}
                    onClick={() => {
                      addAdjustmentLayer();
                      setDesktopAdjustSection("layer");
                    }}
                    className="sihag-adjust-create-button shrink-0 rounded-lg border border-violet-400/20 bg-violet-400/[0.07] px-2.5 py-1.5 text-[9px] font-medium text-violet-200 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    + Adjustment
                  </button>
                )}
              </div>
            </div>
          )}

          {desktopInspectorTab === "layers" && (
            <>
          {/* LAYERS */}

          <div className="border-b border-white/10 p-3">

            <div className="grid grid-cols-3 gap-2">

              <label className="block cursor-pointer rounded-lg bg-indigo-600 px-2 py-2 text-center text-[10px] hover:bg-indigo-500">
                + Image Layer

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={addImageLayer}
                />
              </label>

              <button
                disabled={
                  layers.length === 0
                }
                onClick={() =>
                  addTextLayer()
                }
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-2 text-[10px] text-indigo-200 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                + Text
              </button>

              <button
                disabled={
                  layers.length === 0
                }
                onClick={() =>
                  addShapeLayer()
                }
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-2 text-[10px] text-indigo-200 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                + Shape
              </button>

              <button
                disabled={
                  layers.length === 0
                }
                onClick={
                  addAdjustmentLayer
                }
                className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-2 text-[10px] text-violet-200 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                + Adjustment
              </button>

            </div>

          </div>
            </>
          )}
          {desktopInspectorTab === "properties" &&
            (activeTool === "hand" || activeTool === "zoom") && (
            <>
          <section className="border-b border-white/10 p-4">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  PERFORMANCE
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Editor preview quality
                </div>

              </div>

              <span
                className={
                  previewQuality ===
                  "fast"
                    ? "rounded bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300"
                    : previewQuality ===
                        "quality"
                      ? "rounded bg-violet-500/10 px-2 py-1 text-[9px] text-violet-300"
                      : "rounded bg-indigo-500/10 px-2 py-1 text-[9px] text-indigo-300"
                }
              >
                {previewMaxSize}px
              </span>

            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">

              {(
                [
                  [
                    "fast",
                    "Fast",
                    "800",
                  ],
                  [
                    "balanced",
                    "Balanced",
                    "1200",
                  ],
                  [
                    "quality",
                    "Quality",
                    "1600",
                  ],
                ] as const
              ).map(
                ([
                  mode,
                  label,
                  size,
                ]) => (
                  <button
                    key={mode}
                    onClick={() =>
                      setPreviewQuality(
                        mode
                      )
                    }
                    className={
                      previewQuality ===
                      mode
                        ? "rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-1 py-2 text-[9px] text-indigo-200"
                        : "rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-[9px] text-gray-500 hover:bg-white/10"
                    }
                  >
                    <div>
                      {label}
                    </div>

                    <div className="mt-0.5 text-[8px] opacity-60">
                      {size}px
                    </div>
                  </button>
                )
              )}

            </div>

            <button
              onClick={
                purgePreviewCache
              }
              className={
                previewCachePurged
                  ? "mt-3 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[9px] text-emerald-200"
                  : "mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-gray-400 hover:border-amber-500/30 hover:bg-amber-500/[0.08] hover:text-amber-200"
              }
              title="Release cached decoded preview images"
            >
              {previewCachePurged
                ? "✓ Preview Cache Purged"
                : "Purge Preview Cache"}
            </button>

            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-600">
              This changes only the live editor preview. Export still renders at full requested resolution. Use Fast for smoother editing on lower-memory computers. Purge the preview cache after working with many large images to release cached decoded image memory.
            </div>

          </section>

          <section className="border-b border-white/10 p-4">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  SNAP & GRID
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Precision alignment controls
                </div>

              </div>

              <span
                className={
                  snapEnabled
                    ? "rounded bg-fuchsia-500/10 px-2 py-1 text-[9px] text-fuchsia-300"
                    : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
                }
              >
                {snapEnabled
                  ? "SNAP ON"
                  : "SNAP OFF"}
              </span>

            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">

              <button
                onClick={() =>
                  setSnapEnabled(
                    (value) =>
                      !value
                  )
                }
                className={
                  snapEnabled
                    ? "rounded-lg border border-fuchsia-500/35 bg-fuchsia-500/10 px-2 py-2 text-[10px] text-fuchsia-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                ⊕ Snapping
              </button>

              <button
                onClick={() =>
                  setShowGrid(
                    (value) =>
                      !value
                  )
                }
                className={
                  showGrid
                    ? "rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-2 py-2 text-[10px] text-indigo-200"
                    : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                }
              >
                # Grid
              </button>

            </div>

            <div className="mt-3">

              <div className="mb-1.5 flex items-center justify-between">

                <span className="text-[10px] text-gray-500">
                  Grid Size
                </span>

                <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] tabular-nums text-gray-400">
                  {gridSize}px
                </span>

              </div>

              <input
                type="range"
                min={10}
                max={200}
                step={5}
                value={gridSize}
                onChange={(
                  event
                ) =>
                  setGridSize(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full cursor-pointer accent-indigo-500"
              />

              <div className="mt-2 grid grid-cols-4 gap-1">

                {[20, 50, 100, 200].map(
                  (value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setGridSize(
                          value
                        )
                      }
                      className={
                        gridSize ===
                        value
                          ? "rounded border border-indigo-500/40 bg-indigo-500/15 px-1 py-1.5 text-[9px] text-indigo-200"
                          : "rounded border border-white/10 bg-white/[0.03] px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/[0.07]"
                      }
                    >
                      {value}
                    </button>
                  )
                )}

              </div>

            </div>

            <div className="mt-4 border-t border-white/10 pt-4">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  CUSTOM GUIDES
                </span>

                <div className="flex items-center gap-1">

                  <button
                    onClick={() =>
                      setShowRulers(
                        (value) =>
                          !value
                      )
                    }
                    className={
                      showRulers
                        ? "rounded bg-indigo-500/10 px-2 py-1 text-[9px] text-indigo-300"
                        : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
                    }
                  >
                    {showRulers
                      ? "Rulers On"
                      : "Rulers"}
                  </button>

                  <button
                    onClick={() =>
                      setShowGuides(
                        (value) =>
                          !value
                      )
                    }
                    className={
                      showGuides
                        ? "rounded bg-cyan-500/10 px-2 py-1 text-[9px] text-cyan-300"
                        : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
                    }
                  >
                    {showGuides
                      ? "Visible"
                      : "Hidden"}
                  </button>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    setGuidesX(
                      (items) =>
                        items.some(
                          (value) =>
                            Math.abs(
                              value -
                              0.5
                            ) <
                            0.001
                        )
                          ? items
                          : [
                              ...items,
                              0.5,
                            ]
                    )
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  + Vertical Center
                </button>

                <button
                  onClick={() =>
                    setGuidesY(
                      (items) =>
                        items.some(
                          (value) =>
                            Math.abs(
                              value -
                              0.5
                            ) <
                            0.001
                        )
                          ? items
                          : [
                              ...items,
                              0.5,
                            ]
                    )
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  + Horizontal Center
                </button>

                <button
                  onClick={() => {
                    setGuidesX(
                      [
                        1 / 3,
                        2 / 3,
                      ]
                    );

                    setGuidesY(
                      [
                        1 / 3,
                        2 / 3,
                      ]
                    );

                    setShowGuides(
                      true
                    );
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  Rule of Thirds
                </button>

                <button
                  onClick={() => {
                    setGuidesX(
                      []
                    );

                    setGuidesY(
                      []
                    );
                  }}
                  disabled={
                    guidesX.length ===
                      0 &&
                    guidesY.length ===
                      0
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-500 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Clear Guides
                </button>

              </div>

              <div className="mt-2 flex items-center justify-between text-[9px] text-gray-600">

                <span>
                  {guidesX.length} vertical
                </span>

                <span>
                  {guidesY.length} horizontal
                </span>

              </div>

              <div className="mt-2 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.03] p-2 text-[9px] leading-4 text-gray-600">
                Turn on Rulers and click the top ruler for a vertical guide or the left ruler for a horizontal guide. Drag guides to reposition them. Double-click a guide, or drag it outside the canvas, to delete it.
              </div>

            </div>

          </section>

            </>
          )}

          {desktopInspectorTab === "properties" &&
            activeTool === "ai" && (
              <AiToolsPanel />
            )}

          {desktopInspectorTab === "layers" && (
            <>
          <section className="border-b border-white/10 p-4">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  LAYER ACTIONS
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Bake and combine editable layers
                </div>

              </div>

              <span className="rounded bg-white/5 px-2 py-1 text-[9px] text-gray-500">
                {layers.length}
                {" "}
                layer
                {layers.length ===
                1
                  ? ""
                  : "s"}
              </span>

            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">

              <button
                onClick={
                  rasterizeSelectedLayer
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  (
                    selectedLayer.layerKind !==
                      "text" &&
                    selectedLayer.layerKind !==
                      "shape"
                  )
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Rasterize
              </button>

              <button
                onClick={
                  mergeSelectedLayerDown
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  layers.findIndex(
                    (layer) =>
                      layer.id ===
                      selectedLayer.id
                  ) <=
                    0 ||
                  layers[
                    layers.findIndex(
                      (layer) =>
                        layer.id ===
                        selectedLayer.id
                    ) -
                      1
                  ]?.locked ||
                  layers[
                    layers.findIndex(
                      (layer) =>
                        layer.id ===
                        selectedLayer.id
                    ) -
                      1
                  ]?.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Merge Down
              </button>

              <button
                onClick={
                  mergeVisibleLayers
                }
                disabled={
                  layers.filter(
                    (layer) =>
                      layer.visible
                  ).length <
                  2
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Merge Visible
              </button>

              <button
                onClick={
                  flattenImage
                }
                disabled={
                  layers.length <
                  2
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Flatten Image
              </button>

            </div>

            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[9px] leading-4 text-gray-600">
              Rasterize converts editable Text or Shape layers to pixels. Merge Down combines the selected layer with the visual layer below. Merge Visible preserves hidden layers. Flatten Image replaces the complete visible result with one raster layer.
            </div>

          </section>
            </>
          )}
          {desktopInspectorTab === "properties" &&
            activeTool === "move" && (
            <>
          <section className="border-b border-white/10 p-4">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                  ALIGN TO DOCUMENT
                </div>

                <div className="mt-1 text-[9px] text-gray-600">
                  Precision position and spacing for selected layers
                </div>

              </div>

              <span
                className={
                  selectedLayer &&
                  selectedLayer.layerKind !==
                    "adjustment" &&
                  !selectedLayer.locked
                    ? "rounded bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-300"
                    : "rounded bg-white/5 px-2 py-1 text-[9px] text-gray-600"
                }
              >
                {selectedLayerIds.length >
                1
                  ? `${selectedLayerIds.length} SELECTED`
                  : selectedLayer &&
                      selectedLayer.layerKind !==
                        "adjustment" &&
                      !selectedLayer.locked
                    ? "READY"
                    : "SELECT LAYER"}
              </span>

            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">

              <button
                onClick={() =>
                  alignSelectedLayer(
                    "left"
                  )
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  selectedLayer.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-30"
                title="Align left edge to document"
              >
                ⇤ Left
              </button>

              <button
                onClick={() =>
                  alignSelectedLayer(
                    "center-x"
                  )
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  selectedLayer.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-30"
                title="Center horizontally"
              >
                ↔ Center
              </button>

              <button
                onClick={() =>
                  alignSelectedLayer(
                    "right"
                  )
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  selectedLayer.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-30"
                title="Align right edge to document"
              >
                Right ⇥
              </button>

              <button
                onClick={() =>
                  alignSelectedLayer(
                    "top"
                  )
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  selectedLayer.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                title="Align top edge to document"
              >
                ⇡ Top
              </button>

              <button
                onClick={() =>
                  alignSelectedLayer(
                    "center-y"
                  )
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  selectedLayer.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-30"
                title="Center vertically"
              >
                ↕ Middle
              </button>

              <button
                onClick={() =>
                  alignSelectedLayer(
                    "bottom"
                  )
                }
                disabled={
                  !selectedLayer ||
                  selectedLayer.locked ||
                  selectedLayer.layerKind ===
                    "adjustment"
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                title="Align bottom edge to document"
              >
                ⇣ Bottom
              </button>

            </div>

            <button
              onClick={() =>
                alignSelectedLayer(
                  "center-both"
                )
              }
              disabled={
                !selectedLayer ||
                selectedLayer.locked ||
                selectedLayer.layerKind ===
                  "adjustment"
              }
              className="mt-2 w-full rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/[0.06] px-3 py-2 text-[9px] text-fuchsia-200 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ◎ Center Both Axes
            </button>

            <div className="mt-3 border-t border-white/10 pt-3">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-[9px] font-semibold tracking-[0.12em] text-gray-500">
                  DISTRIBUTE SELECTED
                </span>

                <span className="rounded bg-cyan-500/[0.08] px-2 py-0.5 text-[9px] text-cyan-300">
                  {selectedLayerIds.length}
                  {" "}
                  selected
                </span>

              </div>

              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    distributeSelectedLayers(
                      "horizontal"
                    )
                  }
                  disabled={
                    getMovableSelectedLayers().length <
                    3
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Create equal horizontal gaps while keeping outer layers anchored"
                >
                  ⇆ Equal H Gaps
                </button>

                <button
                  onClick={() =>
                    distributeSelectedLayers(
                      "vertical"
                    )
                  }
                  disabled={
                    getMovableSelectedLayers().length <
                    3
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[9px] text-gray-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Create equal vertical gaps while keeping outer layers anchored"
                >
                  ⇅ Equal V Gaps
                </button>

              </div>

              <div className="mt-2 text-[9px] leading-4 text-gray-600">
                Select 3+ unlocked visual layers. The outer two remain anchored while the layers between them are spaced evenly by their visible rotated bounds.
              </div>

            </div>

            <div className="mt-3 text-[9px] leading-4 text-gray-600">
              Alignment uses the visible rotated bounds of the selected layer, so left/right/top/bottom placement remains accurate after rotation and scaling.
            </div>

          </section>
            </>
          )}
          {desktopInspectorTab === "layers" && (
            <>
          <LayerPanel
            layers={layers}
            groups={groups}
            selectedLayerId={selectedLayerId}
            selectedLayerIds={selectedLayerIds}
            onCreateGroup={createLayerGroup}
            onRenameGroup={renameLayerGroup}
            onDeleteGroup={deleteLayerGroup}
            onDuplicateGroup={duplicateLayerGroup}
            onBringGroupToFront={bringLayerGroupToFront}
            onSendGroupToBack={sendLayerGroupToBack}
            onMoveGroup={moveLayerGroup}
            onToggleGroupCollapsed={toggleLayerGroupCollapsed}
            onToggleGroupVisible={toggleLayerGroupVisible}
            onToggleGroupLock={toggleLayerGroupLock}
            onAssignGroup={assignLayerGroup}
            onSelect={selectLayer}
            onToggleVisible={toggleLayerVisible}
            onToggleLock={toggleLayerLock}
            onDuplicate={duplicateLayer}
            onDelete={deleteLayer}
            onMoveUp={moveLayerUp}
            onMoveDown={moveLayerDown}
            onRename={renameLayer}
            onReorder={reorderLayer}
            onOpacityChange={changeLayerOpacity}
            onOpacityStart={saveHistory}
            onBlendModeChange={changeLayerBlendMode}
            onAddMask={addLayerMask}
            onToggleMask={toggleLayerMask}
            onInvertMask={invertLayerMask}
            onRemoveMask={removeLayerMask}
            onMaskDensityChange={changeLayerMaskDensity}
            onMaskDensityStart={saveHistory}
            onMaskFeatherChange={changeLayerMaskFeather}
            onMaskFeatherStart={saveHistory}
            onRevealAllMask={revealAllLayerMask}
            onHideAllMask={hideAllLayerMask}
          />

          </>
          )}
          {desktopInspectorTab === "properties" &&
            activeTool === "move" && (
            <>
          {selectedLayer?.layerKind !==
            "adjustment" && (
            <LayerTransformPanel
              layer={selectedLayer}
              onChange={updateLayerTransform}
              onReset={resetLayerTransform}
            />
          )}
            </>
          )}
          {desktopInspectorTab === "adjust" && (
            <>
          {desktopAdjustSection === "layer" && (
            <div className="sihag-adjust-advanced-panel">
              <AdjustmentLayerPanel
            layer={selectedLayer}
            onApplyPreset={
              applyAdjustmentPreset
            }
            onReset={
              resetSelectedAdjustment
            }
            onStrengthStart={
              saveHistory
            }
            onStrengthChange={(
              value
            ) => {
              if (
                !selectedLayer ||
                selectedLayer.layerKind !==
                  "adjustment"
              ) {
                return;
              }

              updateLayerTransform(
                selectedLayer.id,
                {
                  opacity:
                    Math.max(
                      0,
                      Math.min(
                        100,
                        value
                      )
                    ),
                }
              );
            }}
            onToggleBypass={() => {
              if (
                selectedLayer?.layerKind ===
                "adjustment"
              ) {
                toggleLayerVisible(
                  selectedLayer.id
                );
              }
            }}
            onToggleClip={
              toggleSelectedAdjustmentClip
            }
            onDuplicate={() => {
              if (
                selectedLayer?.layerKind ===
                "adjustment"
              ) {
                duplicateLayer(
                  selectedLayer.id
                );
              }
            }}
            onRename={() => {
              if (
                !selectedLayer ||
                selectedLayer.layerKind !==
                  "adjustment"
              ) {
                return;
              }

              const nextName =
                window.prompt(
                  "Rename adjustment layer",
                  selectedLayer.name
                );

              if (
                nextName &&
                nextName.trim()
              ) {
                renameLayer(
                  selectedLayer.id,
                  nextName.trim()
                );
              }
            }}
          />
            </div>
          )}

          {desktopAdjustSection === "curves" &&
            selectedLayer?.layerKind ===
              "adjustment" && (
            <CurvesPanel
              masterPoints={
                selectedLayer.toneCurve ??
                DEFAULT_TONE_CURVE
              }
              redPoints={
                selectedLayer.toneCurveRed ??
                DEFAULT_TONE_CURVE
              }
              greenPoints={
                selectedLayer.toneCurveGreen ??
                DEFAULT_TONE_CURVE
              }
              bluePoints={
                selectedLayer.toneCurveBlue ??
                DEFAULT_TONE_CURVE
              }
              disabled={
                selectedLayer.locked
              }
              onChangeStart={
                saveHistory
              }
              onChange={
                updateSelectedToneCurve
              }
            />
          )}

          {desktopAdjustSection === "hsl" &&
            selectedLayer?.layerKind ===
              "adjustment" && (
            <HslColorMixerPanel
              mixer={
                selectedLayer.hslMixer ??
                DEFAULT_HSL_MIXER
              }
              disabled={
                selectedLayer.locked
              }
              onChangeStart={
                saveHistory
              }
              onChange={
                updateSelectedHslMixer
              }
              onResetAll={
                resetSelectedHslMixer
              }
            />
          )}

          {desktopAdjustSection === "grading" &&
            selectedLayer?.layerKind ===
              "adjustment" && (
            <ColorGradingPanel
              grading={
                selectedLayer.colorGrading ??
                DEFAULT_COLOR_GRADING
              }
              disabled={
                selectedLayer.locked
              }
              onChangeStart={
                saveHistory
              }
              onChange={
                updateSelectedColorGrading
              }
              onReset={
                resetSelectedColorGrading
              }
            />
          )}

            </>
          )}

          {desktopInspectorTab === "properties" && (
            <>
          {activeTool === "text" && (
            <TextLayerPanel
              layer={selectedLayer}
              onAdd={() =>
                addTextLayer()
              }
              onChange={updateTextLayer}
              onChangeStart={saveHistory}
              onDuplicate={duplicateLayer}
              onDelete={deleteLayer}
              onLayerChange={updateLayerTransform}
              onLayerChangeStart={saveHistory}
            />
          )}

          {activeTool === "shape" && (
            <ShapeLayerPanel
              layer={selectedLayer}
              onAdd={() =>
                addShapeLayer()
              }
              onChange={updateShapeLayer}
              onChangeStart={saveHistory}
            />
          )}
            </>
          )}

          {desktopInspectorTab === "properties" && (
            <>
          {activeTool === "brush" && (
            <MaskBrushPanel
              layer={selectedLayer}
              brushSize={maskBrushSize}
              brushHardness={maskBrushHardness}
              brushOpacity={maskBrushOpacity}
              overlayEnabled={maskOverlayEnabled}
              mode={maskBrushMode}
              onBrushSizeChange={setMaskBrushSize}
              onBrushHardnessChange={setMaskBrushHardness}
              onBrushOpacityChange={setMaskBrushOpacity}
              onOverlayToggle={() =>
                setMaskOverlayEnabled(
                  (value) =>
                    !value
                )
              }
              onModeChange={setMaskBrushMode}
            />
          )}

          {activeTool === "heal" && (
            <HealBrushPanel
              layer={selectedLayer}
              brushSize={healBrushSize}
              brushHardness={healBrushHardness}
              brushOpacity={healBrushOpacity}
              onBrushSizeChange={setHealBrushSize}
              onBrushHardnessChange={setHealBrushHardness}
              onBrushOpacityChange={setHealBrushOpacity}
            />
          )}

          {activeTool === "clone" && (
            <CloneStampPanel
              layer={selectedLayer}
              brushSize={cloneBrushSize}
              brushHardness={cloneBrushHardness}
              brushOpacity={cloneBrushOpacity}
              hasSample={
                !!cloneSample &&
                !!selectedLayer &&
                cloneSample.layerId ===
                  selectedLayer.id
              }
              onBrushSizeChange={setCloneBrushSize}
              onBrushHardnessChange={setCloneBrushHardness}
              onBrushOpacityChange={setCloneBrushOpacity}
              onClearSample={() =>
                setCloneSample(
                  null
                )
              }
            />
          )}

          {activeTool === "eraser" && (
            <EraserBrushPanel
              layer={selectedLayer}
              brushSize={eraserBrushSize}
              brushHardness={eraserBrushHardness}
              brushOpacity={eraserBrushOpacity}
              onBrushSizeChange={setEraserBrushSize}
              onBrushHardnessChange={setEraserBrushHardness}
              onBrushOpacityChange={setEraserBrushOpacity}
            />
          )}

          {activeTool === "dodge-burn" && (
            <DodgeBurnPanel
              layer={selectedLayer}
              mode={dodgeBurnMode}
              range={dodgeBurnRange}
              brushSize={dodgeBurnBrushSize}
              brushHardness={dodgeBurnBrushHardness}
              exposure={dodgeBurnExposure}
              onModeChange={setDodgeBurnMode}
              onRangeChange={setDodgeBurnRange}
              onBrushSizeChange={setDodgeBurnBrushSize}
              onBrushHardnessChange={setDodgeBurnBrushHardness}
              onExposureChange={setDodgeBurnExposure}
            />
          )}

          {activeTool === "blur-sharpen" && (
            <BlurSharpenPanel
              layer={selectedLayer}
              mode={blurSharpenMode}
              brushSize={blurSharpenBrushSize}
              brushHardness={blurSharpenBrushHardness}
              strength={blurSharpenStrength}
              onModeChange={setBlurSharpenMode}
              onBrushSizeChange={setBlurSharpenBrushSize}
              onBrushHardnessChange={setBlurSharpenBrushHardness}
              onStrengthChange={setBlurSharpenStrength}
            />
          )}

          {activeTool === "paint" && (
            <PaintBrushPanel
              layer={selectedLayer}
              color={paintBrushColor}
              brushSize={paintBrushSize}
              brushHardness={paintBrushHardness}
              brushOpacity={paintBrushOpacity}
              brushFlow={paintBrushFlow}
              brushSpacing={paintBrushSpacing}
              brushSmoothing={paintBrushSmoothing}
              mode={paintBrushMode}
              blendMode={paintBrushBlendMode}
              pressureSize={paintPressureSize}
              pressureOpacity={paintPressureOpacity}
              onColorChange={setPaintBrushColor}
              onBrushSizeChange={setPaintBrushSize}
              onBrushHardnessChange={setPaintBrushHardness}
              onBrushOpacityChange={setPaintBrushOpacity}
              onBrushFlowChange={setPaintBrushFlow}
              onBrushSpacingChange={setPaintBrushSpacing}
              onBrushSmoothingChange={setPaintBrushSmoothing}
              onModeChange={setPaintBrushMode}
              onBlendModeChange={setPaintBrushBlendMode}
              onPressureSizeChange={setPaintPressureSize}
              onPressureOpacityChange={setPaintPressureOpacity}
            />
          )}

          {(activeTool === "select" ||
            activeTool === "lasso" ||
            activeTool === "polygonal-lasso" ||
            activeTool === "magic-wand" ||
            activeTool === "quick-select") &&
            image && (

            <section className="border-b border-white/10 p-4">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-semibold">
                    Selection
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-500">
                    {activeTool ===
                    "quick-select"
                      ? "Quick Selection"
                      : activeTool ===
                          "magic-wand"
                        ? "Magic Wand"
                      : activeTool ===
                          "polygonal-lasso"
                        ? "Polygonal Lasso"
                      : selectionShape ===
                          "lasso"
                        ? "Freehand Lasso"
                      : selectionShape ===
                          "ellipse"
                        ? "Elliptical Marquee"
                        : "Rectangular Marquee"}
                  </p>
                </div>

                {selection && (
                  <span
                    className={
                      selectionInverted
                        ? "rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-300"
                        : "rounded bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300"
                    }
                  >
                    {selectionInverted
                      ? "INVERTED"
                      : "ACTIVE"}
                  </span>
                )}

              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">

                <button
                  onClick={() => {
                    const fullSelection = {
                      x: 0,
                      y: 0,
                      width: 1,
                      height: 1,
                    };

                    setSelection(
                      fullSelection
                    );

                    setSelectionInverted(
                      false
                    );

                    setSelectionShape(
                      "rectangle"
                    );

                    setSelectionPath(
                      null
                    );

                    setSelectionMode(
                      "new"
                    );

                    setSelectionRegions([
                      {
                        shape:
                          "rectangle",

                        rect:
                          fullSelection,

                        path:
                          null,

                        operation:
                          "add",
                      },
                    ]);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-300 hover:bg-white/10"
                >
                  Select All
                </button>

                <button
                  disabled={!selection}
                  onClick={() =>
                    setSelectionInverted(
                      (value) =>
                        !value
                    )
                  }
                  className={
                    selectionInverted
                      ? "rounded-lg border border-red-500/40 bg-red-500/15 px-2 py-2 text-[10px] text-red-200 disabled:opacity-30"
                      : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-300 hover:bg-white/10 disabled:opacity-30"
                  }
                >
                  Invert
                </button>

                <button
                  disabled={
                    !selection ||
                    selectionShape ===
                      "lasso" ||
                    selectionRegions.length >
                      1
                  }
                  onClick={
                    centerSelection
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Center
                </button>

                <button
                  disabled={!selection}
                  onClick={() => {
                    clearSelectionState();

                    setSelectionFeather(
                      0
                    );
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Clear
                </button>

              </div>

              <button
                disabled={
                  !selection ||
                  !selectedLayer ||
                  selectedLayer.locked
                }
                onClick={
                  createMaskFromSelection
                }
                className="mt-3 w-full rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-200 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Create Layer Mask from Selection
              </button>

              {selection ? (
                <>
                  <div className="mt-4">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                        SELECTION MODE
                      </span>

                      <span className="text-[9px] text-gray-600">
                        {selectionRegions.length}
                        {" "}
                        region
                        {selectionRegions.length ===
                        1
                          ? ""
                          : "s"}
                      </span>

                    </div>

                    <div className="grid grid-cols-4 gap-1">

                      {(
                        [
                          [
                            "new",
                            "New",
                          ],
                          [
                            "add",
                            "Add",
                          ],
                          [
                            "subtract",
                            "Subtract",
                          ],
                          [
                            "intersect",
                            "Intersect",
                          ],
                        ] as const
                      ).map(
                        ([
                          mode,
                          label,
                        ]) => (
                          <button
                            key={mode}
                            onClick={() =>
                              setSelectionMode(
                                mode
                              )
                            }
                            className={
                              selectionMode ===
                              mode
                                ? mode ===
                                  "subtract"
                                  ? "rounded border border-red-500/40 bg-red-500/15 px-1 py-2 text-[9px] text-red-200"
                                  : mode ===
                                    "intersect"
                                    ? "rounded border border-cyan-500/40 bg-cyan-500/15 px-1 py-2 text-[9px] text-cyan-200"
                                    : "rounded border border-indigo-500/50 bg-indigo-500/20 px-1 py-2 text-[9px] text-indigo-200"
                                : "rounded border border-white/10 bg-white/5 px-1 py-2 text-[9px] text-gray-500 hover:bg-white/10"
                            }
                          >
                            {label}
                          </button>
                        )
                      )}

                    </div>

                    <div className="mt-2 text-[9px] leading-4 text-gray-600">
                      New replaces the selection. Add combines areas. Subtract removes areas. Intersect keeps only overlap.
                    </div>

                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                        REFINE SELECTION
                      </span>

                      <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] tabular-nums text-gray-400">
                        {selectionRefineAmount}px
                      </span>

                    </div>

                    <input
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={selectionRefineAmount}
                      onChange={(
                        event
                      ) =>
                        setSelectionRefineAmount(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="w-full cursor-pointer accent-indigo-500"
                    />

                    <div className="mt-2 grid grid-cols-3 gap-1.5">

                      <button
                        onClick={() =>
                          applySelectionExpandContract(
                            "expand"
                          )
                        }
                        className="rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-[9px] text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                      >
                        Expand
                      </button>

                      <button
                        onClick={() =>
                          applySelectionExpandContract(
                            "contract"
                          )
                        }
                        className="rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-[9px] text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                      >
                        Contract
                      </button>

                      <button
                        onClick={
                          smoothSelectionRegions
                        }
                        disabled={
                          !getSelectionRegionsWithFallback().some(
                            (region) =>
                              region.shape ===
                                "lasso" &&
                              !!region.path &&
                              region.path.length >=
                                5
                          )
                        }
                        className="rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-[9px] text-gray-400 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Smooth
                      </button>

                    </div>

                    <div className="mt-2 text-[9px] leading-4 text-gray-600">
                      Expand grows the selected area. Contract shrinks it. Smooth softens lasso and polygon edges.
                    </div>

                  </div>

                  <div className="mt-4">

                    <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                      SELECTION TOOL
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">

                      <button
                        onClick={() => {
                          setActiveTool(
                            "select"
                          );

                          if (
                            selectionMode ===
                              "new"
                          ) {
                            setSelectionPath(
                              null
                            );
                          }

                          if (
                            selectionShape ===
                            "lasso"
                          ) {
                            setSelectionShape(
                              "rectangle"
                            );
                          }
                        }}
                        className={
                          activeTool ===
                          "select"
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-1.5 py-2 text-[9px] text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-1.5 py-2 text-[9px] text-gray-400 hover:bg-white/10"
                        }
                      >
                        Marquee
                      </button>

                      <button
                        onClick={() =>
                          setActiveTool(
                            "lasso"
                          )
                        }
                        className={
                          activeTool ===
                          "lasso"
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-1.5 py-2 text-[9px] text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-1.5 py-2 text-[9px] text-gray-400 hover:bg-white/10"
                        }
                      >
                        Lasso
                      </button>

                      <button
                        onClick={() =>
                          setActiveTool(
                            "polygonal-lasso"
                          )
                        }
                        className={
                          activeTool ===
                          "polygonal-lasso"
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-1.5 py-2 text-[9px] text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-1.5 py-2 text-[9px] text-gray-400 hover:bg-white/10"
                        }
                      >
                        Polygon
                      </button>

                      <button
                        onClick={() =>
                          setActiveTool(
                            "magic-wand"
                          )
                        }
                        disabled={
                          !selectedLayer ||
                          selectedLayer.layerKind ===
                            "adjustment"
                        }
                        className={
                          activeTool ===
                          "magic-wand"
                            ? "rounded-lg border border-amber-500/50 bg-amber-500/15 px-1.5 py-2 text-[9px] text-amber-200 disabled:opacity-30"
                            : "rounded-lg border border-white/10 bg-white/5 px-1.5 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                        }
                      >
                        Wand
                      </button>

                      <button
                        onClick={() =>
                          setActiveTool(
                            "quick-select"
                          )
                        }
                        disabled={
                          !selectedLayer ||
                          selectedLayer.layerKind ===
                            "adjustment"
                        }
                        className={
                          activeTool ===
                          "quick-select"
                            ? "rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-1.5 py-2 text-[9px] text-emerald-200 disabled:opacity-30"
                            : "rounded-lg border border-white/10 bg-white/5 px-1.5 py-2 text-[9px] text-gray-400 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                        }
                      >
                        Quick
                      </button>

                    </div>

                    <div className="mt-2 text-[9px] text-gray-600">
                      Shortcuts: M Marquee • L Lasso • P Polygon • W Wand • Shift+W Quick
                    </div>

                  </div>

                  {activeTool ===
                    "magic-wand" && (
                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-[10px] font-semibold tracking-[0.14em] text-amber-200/80">
                          MAGIC WAND
                        </span>

                        <span className="rounded bg-black/20 px-2 py-0.5 text-[9px] tabular-nums text-amber-200">
                          {magicWandTolerance}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-[9px] text-gray-500">
                        <span>Tolerance</span>
                        <span>0 precise • 255 broad</span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={255}
                        step={1}
                        value={
                          magicWandTolerance
                        }
                        onChange={(
                          event
                        ) =>
                          setMagicWandTolerance(
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="mt-2 w-full cursor-pointer accent-amber-500"
                      />

                      <div className="mt-3 grid grid-cols-4 gap-1">

                        {[8, 24, 48, 96].map(
                          (value) => (
                            <button
                              key={
                                value
                              }
                              onClick={() =>
                                setMagicWandTolerance(
                                  value
                                )
                              }
                              className={
                                magicWandTolerance ===
                                value
                                  ? "rounded border border-amber-500/40 bg-amber-500/15 px-1 py-1.5 text-[9px] text-amber-200"
                                  : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/10"
                              }
                            >
                              {value}
                            </button>
                          )
                        )}

                      </div>

                      <div className="mt-3 text-[9px] leading-4 text-gray-600">
                        Select a visual layer, then click a connected color area. New, Add, Subtract and Intersect modes are supported.
                      </div>

                    </div>
                  )}

                  {activeTool ===
                    "quick-select" && (
                    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[10px] font-semibold tracking-[0.14em] text-emerald-200/80">
                          QUICK SELECTION
                        </span>

                        <span className="rounded bg-black/20 px-2 py-0.5 text-[9px] text-emerald-200">
                          Brush
                        </span>

                      </div>

                      <div>

                        <div className="mb-1 flex items-center justify-between text-[9px] text-gray-500">
                          <span>Size</span>
                          <span>{quickSelectionBrushSize}px</span>
                        </div>

                        <input
                          type="range"
                          min={5}
                          max={300}
                          step={1}
                          value={
                            quickSelectionBrushSize
                          }
                          onChange={(
                            event
                          ) =>
                            setQuickSelectionBrushSize(
                              Number(
                                event.target.value
                              )
                            )
                          }
                          className="w-full cursor-pointer accent-emerald-500"
                        />

                      </div>

                      <div className="mt-3">

                        <div className="mb-1 flex items-center justify-between text-[9px] text-gray-500">
                          <span>Color Tolerance</span>
                          <span>{quickSelectionTolerance}</span>
                        </div>

                        <input
                          type="range"
                          min={0}
                          max={255}
                          step={1}
                          value={
                            quickSelectionTolerance
                          }
                          onChange={(
                            event
                          ) =>
                            setQuickSelectionTolerance(
                              Number(
                                event.target.value
                              )
                            )
                          }
                          className="w-full cursor-pointer accent-emerald-500"
                        />

                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-1">

                        {[30, 60, 120].map(
                          (value) => (
                            <button
                              key={value}
                              onClick={() =>
                                setQuickSelectionBrushSize(
                                  value
                                )
                              }
                              className={
                                quickSelectionBrushSize ===
                                value
                                  ? "rounded border border-emerald-500/40 bg-emerald-500/15 px-1 py-1.5 text-[9px] text-emerald-200"
                                  : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[9px] text-gray-500 hover:bg-white/10"
                              }
                            >
                              {value}px
                            </button>
                          )
                        )}

                      </div>

                      <div className="mt-3 text-[9px] leading-4 text-gray-600">
                        Brush across part of an object. The editor samples the stroke and grows connected similar-color regions from those points.
                      </div>

                    </div>
                  )}

                  {activeTool !==
                    "magic-wand" &&
                  activeTool !==
                    "quick-select" &&
                  selectionShape !==
                    "lasso" ? (
                    <>
                  <div className="mt-4">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                        MARQUEE SHAPE
                      </span>

                      <span className="text-[9px] text-gray-600">
                        Shift + M
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      <button
                        onClick={() =>
                          {
                            setSelectionShape(
                              "rectangle"
                            );

                            setSelectionPath(
                              null
                            );
                          }
                        }
                        className={
                          selectionShape ===
                          "rectangle"
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                        }
                      >
                        ▭ Rectangle
                      </button>

                      <button
                        onClick={() =>
                          {
                            setSelectionShape(
                              "ellipse"
                            );

                            setSelectionPath(
                              null
                            );
                          }
                        }
                        className={
                          selectionShape ===
                          "ellipse"
                            ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-[10px] text-indigo-200"
                            : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-400 hover:bg-white/10"
                        }
                      >
                        ◯ Ellipse
                      </button>

                    </div>

                  </div>

                  <div className="mt-4">

                    <div className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                      ASPECT RATIO
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {(
                        [
                          "free",
                          "1:1",
                          "4:3",
                          "3:2",
                          "16:9",
                        ] as const
                      ).map(
                        (aspect) => (
                          <button
                            key={aspect}
                            onClick={() =>
                              setSelectionAspect(
                                aspect
                              )
                            }
                            className={
                              selectionAspect ===
                              aspect
                                ? "rounded border border-indigo-500/50 bg-indigo-500/20 px-1 py-1.5 text-[9px] text-indigo-200"
                                : "rounded border border-white/10 bg-white/5 px-1 py-1.5 text-[9px] text-gray-400 hover:bg-white/10"
                            }
                          >
                            {aspect ===
                            "free"
                              ? "Free"
                              : aspect}
                          </button>
                        )
                      )}
                    </div>

                  </div>

                    </>
                  ) : (
                    <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3 text-[10px] leading-5 text-gray-400">
                      {activeTool === "polygonal-lasso"
                        ? "Polygonal selections keep every placed vertex. Click to place points, double-click or press Enter to close, and Backspace removes the last point."
                        : "Freehand lasso outline is preserved exactly. Draw a new lasso to replace it. Press M to return to the marquee tool."}
                    </div>
                  )}

                  <div className="mt-4">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">
                        FEATHER
                      </span>

                      <span className="rounded bg-white/5 px-2 py-1 text-[10px] tabular-nums text-gray-300">
                        {Math.round(
                          selectionFeather
                        )}
                        px
                      </span>

                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={selectionFeather}
                      onChange={(event) =>
                        setSelectionFeather(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="w-full cursor-pointer accent-indigo-500"
                    />

                  </div>

                  {selectionShape !==
                    "lasso" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <SelectionNumberInput
                      label="X"
                      value={
                        selection.x *
                        100
                      }
                      onChange={(
                        value
                      ) =>
                        updateSelectionField(
                          "x",
                          value
                        )
                      }
                    />

                    <SelectionNumberInput
                      label="Y"
                      value={
                        selection.y *
                        100
                      }
                      onChange={(
                        value
                      ) =>
                        updateSelectionField(
                          "y",
                          value
                        )
                      }
                    />

                    <SelectionNumberInput
                      label="Width"
                      value={
                        selection.width *
                        100
                      }
                      onChange={(
                        value
                      ) =>
                        updateSelectionField(
                          "width",
                          value
                        )
                      }
                    />

                    <SelectionNumberInput
                      label="Height"
                      value={
                        selection.height *
                        100
                      }
                      onChange={(
                        value
                      ) =>
                        updateSelectionField(
                          "height",
                          value
                        )
                      }
                    />

                  </div>

                  )}

                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[10px] leading-5 text-gray-400">
                    {selectionShape === "lasso"
                      ? activeTool === "polygonal-lasso"
                        ? "Polygonal Lasso: Shift+L activates it. Double-click or Enter closes the shape, Backspace removes the last point, Ctrl+Shift+I inverts, and Ctrl+D deselects."
                        : "Lasso: drag freely around an area. L redraws the selection, Ctrl+Shift+I inverts it, and Ctrl+D deselects."
                      : "Arrow keys move the selection by 0.1%. Hold Shift for 1%. Ctrl+A selects all, Ctrl+Shift+I inverts, and Ctrl+D deselects."}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[10px] leading-5 text-gray-400">
                  {activeTool ===
                  "polygonal-lasso"
                    ? "Click around the subject to place straight-edged points. Double-click or press Enter to close the polygon. Backspace removes the last point."
                    : activeTool === "lasso"
                      ? "Drag freely around the subject or area you want to select. Release the pointer to close the lasso."
                      : "Drag directly over the canvas to create a rectangle or ellipse selection. Press Esc to clear it."}
                </div>
              )}

            </section>

          )}

          {/* CROP PANEL */}

          {activeTool === "crop" &&
            image && (

            <section className="border-b border-white/10 p-4">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-semibold">
                  Crop
                </h3>

                <button
                  onClick={resetCrop}
                  className="text-xs text-indigo-400"
                >
                  Reset
                </button>

              </div>

              <PanelTitle title="ASPECT RATIO" />

              <div className="grid grid-cols-3 gap-2">

                {(
                  [
                    "free",
                    "1:1",
                    "4:3",
                    "3:2",
                    "16:9",
                  ] as CropAspect[]
                ).map((aspect) => (

                  <button
                    key={aspect}
                    onClick={() =>
                      chooseCropAspect(
                        aspect
                      )
                    }
                    className={
                      cropAspect ===
                      aspect
                        ? "rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-2 py-2 text-xs text-indigo-300"
                        : "rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-gray-400 hover:bg-white/10"
                    }
                  >
                    {aspect ===
                    "free"
                      ? "Free"
                      : aspect}
                  </button>

                ))}

              </div>

              <div className="mt-5 text-xs text-gray-500">

                Crop size

                <div className="mt-1 text-gray-300">
                  {Math.round(
                    crop.width *
                      image.naturalWidth
                  )}
                  {" × "}
                  {Math.round(
                    crop.height *
                      image.naturalHeight
                  )}
                  px
                </div>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">

                <button
                  onClick={cancelCrop}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={applyCrop}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs hover:bg-indigo-500"
                >
                  Apply Crop
                </button>

              </div>

            </section>

          )}

          {/* TRANSFORM */}

          <section className="border-b border-white/10 p-4">

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-semibold">
                Transform
              </h3>

              <button
                onClick={resetTransform}
                className="text-xs text-indigo-400"
              >
                Reset
              </button>

            </div>

            <PanelTitle title="ROTATE" />

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={rotateLeft}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
              >
                ↺ 90°
              </button>

              <button
                onClick={rotateRight}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs"
              >
                ↻ 90°
              </button>

            </div>

            <PanelTitle title="FLIP" />

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={
                  toggleFlipHorizontal
                }
                className={
                  flipHorizontal
                    ? "rounded-lg bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300"
                    : "rounded-lg bg-white/5 px-3 py-2 text-xs"
                }
              >
                Horizontal
              </button>

              <button
                onClick={
                  toggleFlipVertical
                }
                className={
                  flipVertical
                    ? "rounded-lg bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300"
                    : "rounded-lg bg-white/5 px-3 py-2 text-xs"
                }
              >
                Vertical
              </button>

            </div>

            <PanelTitle title="STRAIGHTEN" />

            <Slider
              title="Angle"
              value={straighten}
              min={-45}
              max={45}
              step={0.1}
              suffix="°"
              onEditStart={saveHistory}
              onChange={
                setStraighten
              }
            />

          </section>
            </>
          )}
          {desktopInspectorTab === "adjust" &&
            desktopAdjustSection === "basic" && (
            <>
          {/* BASIC ADJUSTMENTS */}

          <section className="sihag-basic-adjust-panel p-4">

            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Basic Adjustments
                </h3>
                <p className="mt-1 text-[9px] leading-4 text-gray-500">
                  Work one correction group at a time for a cleaner editing flow.
                </p>
              </div>

              <button
                type="button"
                onClick={resetAll}
                className="sihag-adjust-reset-button shrink-0 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.055] px-2.5 py-1.5 text-[9px] font-medium text-cyan-100 hover:bg-cyan-400/[0.09]"
              >
                Reset All
              </button>
            </div>

            <div className="sihag-basic-adjust-tabs mt-4 grid grid-cols-3 gap-1.5">
              {([
                ["light", "Light"],
                ["color", "Color"],
                ["presence", "Presence"],
                ["detail", "Detail"],
                ["effects", "Effects"],
                ["layer", "Layer"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setDesktopBasicAdjustGroup(id)
                  }
                  className={
                    desktopBasicAdjustGroup === id
                      ? "sihag-basic-adjust-tab sihag-basic-adjust-tab-active"
                      : "sihag-basic-adjust-tab"
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="sihag-basic-adjust-body mt-4">
              {desktopBasicAdjustGroup === "light" && (
                <div className="sihag-adjust-group-card">
                  <div className="sihag-adjust-group-heading">
                    <div>
                      <div className="sihag-adjust-group-kicker">LIGHT</div>
                      <div className="sihag-adjust-group-description">
                        Exposure and tonal range
                      </div>
                    </div>
                    <span>7 controls</span>
                  </div>

                  <Slider
                    title="Exposure"
                    value={settings.exposure}
                    min={-2}
                    max={2}
                    step={0.1}
                    suffix=" EV"
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("exposure", v)
                    }
                  />

                  <Slider
                    title="Brightness"
                    value={settings.brightness}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("brightness", v)
                    }
                  />

                  <Slider
                    title="Contrast"
                    value={settings.contrast}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("contrast", v)
                    }
                  />

                  <Slider
                    title="Highlights"
                    value={settings.highlights}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("highlights", v)
                    }
                  />

                  <Slider
                    title="Shadows"
                    value={settings.shadows}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("shadows", v)
                    }
                  />

                  <Slider
                    title="Whites"
                    value={settings.whites}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("whites", v)
                    }
                  />

                  <Slider
                    title="Blacks"
                    value={settings.blacks}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("blacks", v)
                    }
                  />
                </div>
              )}

              {desktopBasicAdjustGroup === "color" && (
                <div className="sihag-adjust-group-card">
                  <div className="sihag-adjust-group-heading">
                    <div>
                      <div className="sihag-adjust-group-kicker">COLOR</div>
                      <div className="sihag-adjust-group-description">
                        White balance and color intensity
                      </div>
                    </div>
                    <span>4 controls</span>
                  </div>

                  <Slider
                    title="Temperature"
                    value={settings.temperature}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("temperature", v)
                    }
                  />

                  <Slider
                    title="Tint"
                    value={settings.tint}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("tint", v)
                    }
                  />

                  <Slider
                    title="Vibrance"
                    value={settings.vibrance}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("vibrance", v)
                    }
                  />

                  <Slider
                    title="Saturation"
                    value={settings.saturation}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("saturation", v)
                    }
                  />
                </div>
              )}

              {desktopBasicAdjustGroup === "presence" && (
                <div className="sihag-adjust-group-card">
                  <div className="sihag-adjust-group-heading">
                    <div>
                      <div className="sihag-adjust-group-kicker">PRESENCE</div>
                      <div className="sihag-adjust-group-description">
                        Local contrast and atmosphere
                      </div>
                    </div>
                    <span>3 controls</span>
                  </div>

                  <Slider
                    title="Texture"
                    value={settings.texture}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("texture", v)
                    }
                  />

                  <Slider
                    title="Clarity"
                    value={settings.clarity}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("clarity", v)
                    }
                  />

                  <Slider
                    title="Dehaze"
                    value={settings.dehaze}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("dehaze", v)
                    }
                  />
                </div>
              )}

              {desktopBasicAdjustGroup === "detail" && (
                <div className="sihag-adjust-group-card">
                  <div className="sihag-adjust-group-heading">
                    <div>
                      <div className="sihag-adjust-group-kicker">DETAIL</div>
                      <div className="sihag-adjust-group-description">
                        Crispness and noise cleanup
                      </div>
                    </div>
                    <span>2 controls</span>
                  </div>

                  <Slider
                    title="Sharpening"
                    value={settings.sharpness}
                    min={0}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("sharpness", v)
                    }
                  />

                  <Slider
                    title="Noise Reduction"
                    value={settings.noiseReduction}
                    min={0}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("noiseReduction", v)
                    }
                  />
                </div>
              )}

              {desktopBasicAdjustGroup === "effects" && (
                <div className="sihag-adjust-group-card">
                  <div className="sihag-adjust-group-heading">
                    <div>
                      <div className="sihag-adjust-group-kicker">EFFECTS</div>
                      <div className="sihag-adjust-group-description">
                        Finishing effects and softness
                      </div>
                    </div>
                    <span>4 controls</span>
                  </div>

                  <Slider
                    title="Vignette"
                    value={settings.vignette}
                    min={-100}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("vignette", v)
                    }
                  />

                  <Slider
                    title="Grain"
                    value={settings.grain}
                    min={0}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("grain", v)
                    }
                  />

                  <Slider
                    title="Fade"
                    value={settings.fade}
                    min={0}
                    max={100}
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("fade", v)
                    }
                  />

                  <Slider
                    title="Blur"
                    value={settings.blur}
                    min={0}
                    max={20}
                    suffix=" px"
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("blur", v)
                    }
                  />
                </div>
              )}

              {desktopBasicAdjustGroup === "layer" && (
                <div className="sihag-adjust-group-card">
                  <div className="sihag-adjust-group-heading">
                    <div>
                      <div className="sihag-adjust-group-kicker">LAYER</div>
                      <div className="sihag-adjust-group-description">
                        Final strength for the current layer
                      </div>
                    </div>
                    <span>1 control</span>
                  </div>

                  <Slider
                    title="Opacity"
                    value={settings.opacity}
                    min={0}
                    max={100}
                    suffix="%"
                    onEditStart={saveHistory}
                    onChange={(v) =>
                      change("opacity", v)
                    }
                  />
                </div>
              )}
            </div>

          </section>
            </>
          )}

        </aside>

      </div>

    </main>
  );
}

/* CROP HANDLE */

function CropHandle({
  position,
  onPointerDown,
}: {
  position:
    | "nw"
    | "ne"
    | "sw"
    | "se";

  onPointerDown: (
    event: PointerEvent<HTMLDivElement>
  ) => void;
}) {
  const positionClasses = {
    nw: "-left-2 -top-2 cursor-nwse-resize",
    ne: "-right-2 -top-2 cursor-nesw-resize",
    sw: "-bottom-2 -left-2 cursor-nesw-resize",
    se: "-bottom-2 -right-2 cursor-nwse-resize",
  };

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute h-4 w-4 rounded-sm border-2 border-black bg-white ${positionClasses[position]}`}
    />
  );
}

/* PANEL TITLE */

function SelectionNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <label className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">

      <div className="text-[10px] text-gray-500">
        {label}
      </div>

      <div className="mt-1 flex items-center gap-1">

        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={
            Number(
              value.toFixed(
                1
              )
            )
          }
          onChange={(event) =>
            onChange(
              Number(
                event.target.value
              )
            )
          }
          className="min-w-0 flex-1 bg-transparent text-xs tabular-nums text-gray-200 outline-none"
        />

        <span className="text-[10px] text-gray-500">
          %
        </span>

      </div>

    </label>
  );
}

function PanelTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-3 mt-6 border-b border-white/10 pb-2 text-[10px] font-semibold tracking-[0.2em] text-gray-500">
      {title}
    </div>
  );
}

/* SLIDER */

type SliderProps = {
  title: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (
    value: number
  ) => void;
  onEditStart?: () => void;
};

function Slider({
  title,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
  onEditStart,
}: SliderProps) {
  return (
    <div className="mb-5">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs text-gray-400">
          {title}
        </span>

        <span className="min-w-[58px] rounded bg-white/5 px-2 py-1 text-center text-[10px] text-gray-300">

          {step < 1
            ? value.toFixed(1)
            : Math.round(value)}

          {suffix}

        </span>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={
          onEditStart
        }
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full cursor-pointer accent-indigo-500"
      />

    </div>
  );
}

/* EXPORT TRANSFORM */

function transformCanvas(
  source: HTMLCanvasElement,
  angleDegrees: number,
  flipHorizontal: boolean,
  flipVertical: boolean
) {
  const angle =
    (angleDegrees * Math.PI) /
    180;

  const cos =
    Math.abs(
      Math.cos(angle)
    );

  const sin =
    Math.abs(
      Math.sin(angle)
    );

  const outputWidth =
    Math.ceil(
      source.width * cos +
        source.height * sin
    );

  const outputHeight =
    Math.ceil(
      source.width * sin +
        source.height * cos
    );

  const output =
    document.createElement(
      "canvas"
    );

  output.width =
    outputWidth;

  output.height =
    outputHeight;

  const context =
    output.getContext("2d");

  if (!context) {
    return source;
  }

  context.translate(
    outputWidth / 2,
    outputHeight / 2
  );

  context.rotate(angle);

  context.scale(
    flipHorizontal ? -1 : 1,
    flipVertical ? -1 : 1
  );

  context.drawImage(
    source,
    -source.width / 2,
    -source.height / 2
  );

  return output;
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
