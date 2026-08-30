"use client";

import {
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  renderImage,
} from "@/lib/imageEngine";

import {
  applyToneCurvesToCanvas,
  DEFAULT_TONE_CURVE,
} from "@/lib/toneCurve";

import {
  applyHslColorMixerToCanvas,
  DEFAULT_HSL_MIXER,
} from "@/lib/hslColorMixer";

import {
  applyColorGradingToCanvas,
  DEFAULT_COLOR_GRADING,
} from "@/lib/colorGrading";

import type {
  BlendMode,
  ImageLayer,
} from "@/lib/layerTypes";

export type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SelectionPoint = {
  x: number;
  y: number;
};

export type SelectionShape =
  | "rectangle"
  | "ellipse"
  | "lasso";

export type SelectionCombineMode =
  | "new"
  | "add"
  | "subtract"
  | "intersect";

export type SelectionRegion = {
  shape: SelectionShape;
  rect: SelectionRect;
  path: SelectionPoint[] | null;
  operation:
    | "add"
    | "subtract"
    | "intersect";
};

type LayerCanvasProps = {
  layers: ImageLayer[];

  zoom: number;

  previewMaxSize: number;

  pan: {
    x: number;
    y: number;
  };

  selectedLayerId: string | null;

  activeTool: string;

  snapEnabled: boolean;

  showGrid: boolean;

  gridSize: number;

  showGuides: boolean;

  showRulers: boolean;

  guidesX: number[];

  guidesY: number[];

  onGuidesXChange: (
    guides: number[]
  ) => void;

  onGuidesYChange: (
    guides: number[]
  ) => void;

  selection: SelectionRect | null;

  selectionInverted: boolean;

  selectionFeather: number;

  selectionShape:
    SelectionShape;

  selectionPath:
    SelectionPoint[] | null;

  selectionMode:
    SelectionCombineMode;

  selectionRegions:
    SelectionRegion[];

  magicWandTolerance: number;

  quickSelectionBrushSize: number;

  quickSelectionTolerance: number;

  selectionAspect:
    | "free"
    | "1:1"
    | "4:3"
    | "3:2"
    | "16:9";

  onSelectionChange: (
    selection: SelectionRect | null
  ) => void;

  onSelectionInvertChange: (
    inverted: boolean
  ) => void;

  onSelectionShapeChange: (
    shape: SelectionShape
  ) => void;

  onSelectionPathChange: (
    points:
      SelectionPoint[] | null
  ) => void;

  onSelectionRegionCommit: (
    region:
      Omit<
        SelectionRegion,
        "operation"
      >,
    mode:
      SelectionCombineMode
  ) => void;

  onMoveLayer: (
    id: string,
    changes: Partial<ImageLayer>
  ) => void;

  onSelectLayer: (
    id: string
  ) => void;

  onDeselectLayer: () => void;

  onAddTextAt: (
    x: number,
    y: number
  ) => void;

  onAddShapeAt: (
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => void;

  onTransformStart: () => void;

  maskBrushSize: number;

  maskBrushHardness: number;

  maskBrushOpacity: number;

  maskOverlayEnabled: boolean;

  maskBrushMode:
    | "hide"
    | "reveal";

  onMaskStrokeStart: () => void;

  onMaskChange: (
    id: string,
    maskSrc: string
  ) => void;

  healBrushSize: number;

  healBrushHardness: number;

  healBrushOpacity: number;

  onHealStrokeStart: () => void;

  onLayerSourceChange: (
    id: string,
    src: string
  ) => void;

  cloneBrushSize: number;

  cloneBrushHardness: number;

  cloneBrushOpacity: number;

  cloneSample:
    CloneSamplePoint | null;

  onCloneSampleChange: (
    sample:
      CloneSamplePoint | null
  ) => void;

  onCloneStrokeStart: () => void;

  eraserBrushSize: number;

  eraserBrushHardness: number;

  eraserBrushOpacity: number;

  onEraserStrokeStart: () => void;

  dodgeBurnMode:
    "dodge" | "burn";

  dodgeBurnRange:
    "shadows" |
    "midtones" |
    "highlights";

  dodgeBurnBrushSize: number;

  dodgeBurnBrushHardness: number;

  dodgeBurnExposure: number;

  onDodgeBurnStrokeStart: () => void;

  blurSharpenMode:
    "blur" |
    "sharpen" |
    "smudge";

  blurSharpenBrushSize: number;

  blurSharpenBrushHardness: number;

  blurSharpenStrength: number;

  onBlurSharpenStrokeStart: () => void;

  paintBrushColor: string;

  paintBrushSize: number;

  paintBrushHardness: number;

  paintBrushOpacity: number;

  onPaintStrokeStart: () => void;
};

export type CloneSamplePoint = {
  layerId: string;
  x: number;
  y: number;
};

type ImageSize = {
  width: number;
  height: number;
};

export default function LayerCanvas({
  layers,
  zoom,
  previewMaxSize,
  pan,
  selectedLayerId,
  activeTool,
  snapEnabled,
  showGrid,
  gridSize,
  showGuides,
  showRulers,
  guidesX,
  guidesY,
  onGuidesXChange,
  onGuidesYChange,
  selection,
  selectionInverted,
  selectionFeather,
  selectionShape,
  selectionPath,
  selectionMode,
  selectionRegions,
  magicWandTolerance,
  quickSelectionBrushSize,
  quickSelectionTolerance,
  selectionAspect,
  onSelectionChange,
  onSelectionInvertChange,
  onSelectionShapeChange,
  onSelectionPathChange,
  onSelectionRegionCommit,
  onMoveLayer,
  onSelectLayer,
  onDeselectLayer,
  onAddTextAt,
  onAddShapeAt,
  onTransformStart,
  maskBrushSize,
  maskBrushHardness,
  maskBrushOpacity,
  maskOverlayEnabled,
  maskBrushMode,
  onMaskStrokeStart,
  onMaskChange,
  healBrushSize,
  healBrushHardness,
  healBrushOpacity,
  onHealStrokeStart,
  onLayerSourceChange,
  cloneBrushSize,
  cloneBrushHardness,
  cloneBrushOpacity,
  cloneSample,
  onCloneSampleChange,
  onCloneStrokeStart,
  eraserBrushSize,
  eraserBrushHardness,
  eraserBrushOpacity,
  onEraserStrokeStart,
  dodgeBurnMode,
  dodgeBurnRange,
  dodgeBurnBrushSize,
  dodgeBurnBrushHardness,
  dodgeBurnExposure,
  onDodgeBurnStrokeStart,
  blurSharpenMode,
  blurSharpenBrushSize,
  blurSharpenBrushHardness,
  blurSharpenStrength,
  onBlurSharpenStrokeStart,
  paintBrushColor,
  paintBrushSize,
  paintBrushHardness,
  paintBrushOpacity,
  onPaintStrokeStart,
}: LayerCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const maskOverlayCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const [
    previewScale,
    setPreviewScale,
  ] = useState(1);

  const [
    documentSize,
    setDocumentSize,
  ] = useState({
    width: 1,
    height: 1,
  });

  const [
    selectedImageSize,
    setSelectedImageSize,
  ] =
    useState<ImageSize | null>(
      null
    );

  const [
    layerSizes,
    setLayerSizes,
  ] = useState<
    Record<string, ImageSize>
  >({});

  const [
    draggingLayer,
    setDraggingLayer,
  ] = useState(false);

  const [
    smartGuideX,
    setSmartGuideX,
  ] =
    useState<number | null>(
      null
    );

  const [
    smartGuideY,
    setSmartGuideY,
  ] =
    useState<number | null>(
      null
    );

  const [
    resizingLayer,
    setResizingLayer,
  ] = useState(false);

  const [
    rotatingLayer,
    setRotatingLayer,
  ] = useState(false);

  const [
    paintingMask,
    setPaintingMask,
  ] = useState(false);

  const [
    healing,
    setHealing,
  ] = useState(false);

  const [
    cloning,
    setCloning,
  ] = useState(false);

  const [
    erasing,
    setErasing,
  ] = useState(false);

  const [
    dodgeBurnPainting,
    setDodgeBurnPainting,
  ] = useState(false);

  const [
    blurSharpenPainting,
    setBlurSharpenPainting,
  ] = useState(false);

  const [
    rasterPainting,
    setRasterPainting,
  ] = useState(false);

  const [
    brushCursor,
    setBrushCursor,
  ] = useState({
    x: 0,
    y: 0,
    size: 0,
    visible: false,
  });

  const [
    selecting,
    setSelecting,
  ] = useState(false);

  const [
    magicWandBusy,
    setMagicWandBusy,
  ] = useState(false);

  const [
    quickSelecting,
    setQuickSelecting,
  ] = useState(false);

  const [
    quickSelectionBusy,
    setQuickSelectionBusy,
  ] = useState(false);

  const quickSelectionSeedsRef =
    useRef<
      {
        x: number;
        y: number;
      }[]
    >([]);

  const lastQuickSelectionSeedRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const [
    movingSelection,
    setMovingSelection,
  ] = useState(false);

  const [
    drawingLasso,
    setDrawingLasso,
  ] = useState(false);

  const [
    lassoDraft,
    setLassoDraft,
  ] =
    useState<SelectionPoint[]>(
      []
    );

  const lassoDraftRef =
    useRef<SelectionPoint[]>(
      []
    );

  const [
    polygonDraft,
    setPolygonDraft,
  ] =
    useState<SelectionPoint[]>(
      []
    );

  const polygonDraftRef =
    useRef<SelectionPoint[]>(
      []
    );

  const [
    polygonPointer,
    setPolygonPointer,
  ] =
    useState<SelectionPoint | null>(
      null
    );

  const [
    resizingSelection,
    setResizingSelection,
  ] = useState(false);

  const selectionResizeStartRef =
    useRef({
      handle: "se" as
        | "nw"
        | "n"
        | "ne"
        | "e"
        | "se"
        | "s"
        | "sw"
        | "w",

      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

  const selectionStartRef =
    useRef({
      x: 0,
      y: 0,
    });

  const selectionDraftRef =
    useRef<SelectionRect | null>(
      null
    );

  const [
    drawingShape,
    setDrawingShape,
  ] = useState(false);

  const [
    shapeDraft,
    setShapeDraft,
  ] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const shapeStartRef =
    useRef({
      x: 0,
      y: 0,
    });

  const shapeDraftRef =
    useRef<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const selectionMoveStartRef =
    useRef({
      pointerX: 0,
      pointerY: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

  const maskCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const maskStrokeLayerIdRef =
    useRef("");

  const lastMaskPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastMaskEmitRef =
    useRef(0);

  const healCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const healSourceCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const healStrokeLayerIdRef =
    useRef("");

  const lastHealPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastHealEmitRef =
    useRef(0);

  const cloneCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const cloneSourceCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const cloneStrokeLayerIdRef =
    useRef("");

  const cloneOffsetRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastClonePointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastCloneEmitRef =
    useRef(0);

  const eraserCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const eraserStrokeLayerIdRef =
    useRef("");

  const lastEraserPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastEraserEmitRef =
    useRef(0);

  const dodgeBurnCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const dodgeBurnSelectionMaskRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const dodgeBurnStrokeLayerIdRef =
    useRef("");

  const lastDodgeBurnPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastDodgeBurnEmitRef =
    useRef(0);

  const blurSharpenCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const blurSharpenSelectionMaskRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const blurSharpenStrokeLayerIdRef =
    useRef("");

  const lastBlurSharpenPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastBlurSharpenEmitRef =
    useRef(0);

  const paintCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const paintSelectionMaskRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const paintStrokeLayerIdRef =
    useRef("");

  const lastPaintPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(
      null
    );

  const lastPaintEmitRef =
    useRef(0);

  const layerDragStart =
    useRef({
      layerId: "",
      mouseX: 0,
      mouseY: 0,
      layerX: 0,
      layerY: 0,
    });

  const resizeStart =
    useRef({
      centerX: 0,
      centerY: 0,
      distance: 1,
      scale: 1,
    });

  const rotateStart =
    useRef({
      centerX: 0,
      centerY: 0,
      pointerAngle: 0,
      layerRotation: 0,
    });

  const selectedLayer =
    layers.find(
      (layer) =>
        layer.id ===
        selectedLayerId
    ) ?? null;

  /*
    LOW-MEMORY PREVIEW BUDGET

    Heavy visible stacks use more temporary canvases and
    decoded images. Reduce only the editor preview size
    when the stack gets large. Export remains full quality.
  */

  const visibleVisualLayerCount =
    layers.filter(
      (layer) =>
        layer.visible &&
        layer.layerKind !==
          "adjustment"
    ).length;

  const effectivePreviewMaxSize =
    Math.max(
      520,
      Math.round(
        previewMaxSize *
          (
            visibleVisualLayerCount >=
              12
              ? 0.62
              : visibleVisualLayerCount >=
                  8
                ? 0.72
                : visibleVisualLayerCount >=
                    5
                  ? 0.85
                  : 1
          )
      )
    );

  const [
    renderingPreview,
    setRenderingPreview,
  ] = useState(false);

  const previewRenderVersionRef =
    useRef(0);

  /*
    Render the visible stack.

    Rapid slider/brush/layer updates can trigger many
    renders in a short time. We debounce them slightly,
    render offscreen, and only commit the newest result.
  */

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const renderVersion =
      previewRenderVersionRef.current +
      1;

    previewRenderVersionRef.current =
      renderVersion;

    let cancelled =
      false;

    setRenderingPreview(
      true
    );

    void getDocumentInfo(
      layers,
      effectivePreviewMaxSize
    ).then((info) => {
      if (
        cancelled ||
        previewRenderVersionRef.current !==
          renderVersion
      ) {
        return;
      }

      setPreviewScale(
        info.previewScale
      );

      setDocumentSize({
        width:
          info.documentWidth,
        height:
          info.documentHeight,
      });
    });

    /*
      A short delay collapses bursts from sliders,
      brush previews and repeated layer changes.
    */

    const timer =
      window.setTimeout(
        () => {
          const offscreen =
            document.createElement(
              "canvas"
            );

          void renderLayerStack(
            offscreen,
            layers,
            effectivePreviewMaxSize
          )
            .then(
              () => {
                if (
                  cancelled ||
                  previewRenderVersionRef.current !==
                    renderVersion
                ) {
                  return;
                }

                const target =
                  canvasRef.current;

                if (!target) {
                  return;
                }

                target.width =
                  offscreen.width;

                target.height =
                  offscreen.height;

                const context =
                  target.getContext(
                    "2d"
                  );

                if (!context) {
                  return;
                }

                context.clearRect(
                  0,
                  0,
                  target.width,
                  target.height
                );

                context.drawImage(
                  offscreen,
                  0,
                  0
                );

                setRenderingPreview(
                  false
                );
              }
            )
            .catch(
              (error) => {
                if (
                  cancelled ||
                  previewRenderVersionRef.current !==
                    renderVersion
                ) {
                  return;
                }

                setRenderingPreview(
                  false
                );

                console.error(
                  "Layer render failed:",
                  error
                );
              }
            );
        },
        45
      );

    return () => {
      cancelled =
        true;

      window.clearTimeout(
        timer
      );
    };
  }, [
    layers,
    previewMaxSize,
    effectivePreviewMaxSize,
  ]);

  /*
    RED MASK OVERLAY PREVIEW

    This is editor-only. It never becomes
    part of the exported image.
  */

  useEffect(() => {
    const overlayCanvas =
      maskOverlayCanvasRef.current;

    const mainCanvas =
      canvasRef.current;

    if (
      !overlayCanvas ||
      !mainCanvas
    ) {
      return;
    }

    overlayCanvas.width =
      mainCanvas.width;

    overlayCanvas.height =
      mainCanvas.height;

    const overlayContext =
      overlayCanvas.getContext(
        "2d"
      );

    if (!overlayContext) {
      return;
    }

    overlayContext.clearRect(
      0,
      0,
      overlayCanvas.width,
      overlayCanvas.height
    );

    if (
      !maskOverlayEnabled ||
      !selectedLayer ||
      !selectedLayer.maskSrc ||
      !(selectedLayer.maskEnabled ?? true)
    ) {
      return;
    }

    let cancelled = false;

    void renderMaskOverlay(
      overlayCanvas,
      selectedLayer,
      previewScale,
      documentSize.width,
      documentSize.height
    ).catch((error) => {
      if (!cancelled) {
        console.error(
          "Mask overlay render failed:",
          error
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    maskOverlayEnabled,
    selectedLayer,
    previewScale,
    documentSize.width,
    documentSize.height,
  ]);

  /*
    Load the selected layer's original
    dimensions. This lets us draw a
    Photoshop-style selection box.
  */

  useEffect(() => {
    if (!selectedLayer) {
      setSelectedImageSize(
        null
      );

      return;
    }

    let cancelled = false;

    void loadImage(
      selectedLayer.src
    ).then((image) => {
      if (cancelled) return;

      setSelectedImageSize({
        width:
          image.naturalWidth,
        height:
          image.naturalHeight,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    selectedLayer?.id,
    selectedLayer?.src,
  ]);

  /*
    Cache every layer's natural dimensions.
    We use these for canvas hit-testing so
    clicking a visible layer can select it.
  */

  useEffect(() => {
    let cancelled = false;

    void Promise.all(
      layers.map(
        async (layer) => {
          const image =
            await loadImage(
              layer.src
            );

          return [
            layer.id,
            {
              width:
                image.naturalWidth,
              height:
                image.naturalHeight,
            },
          ] as const;
        }
      )
    ).then((entries) => {
      if (cancelled) return;

      setLayerSizes(
        Object.fromEntries(
          entries
        )
      );
    });

    return () => {
      cancelled = true;
    };
  }, [layers]);

  /*
    Return the top-most visible layer
    under the pointer.

    This is rectangle hit-testing after
    undoing the layer's rotation.
  */

  function hitTestLayer(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return null;
    }

    const pointX =
      (clientX - rect.left) *
      (canvas.width /
        rect.width);

    const pointY =
      (clientY - rect.top) *
      (canvas.height /
        rect.height);

    /*
      Last item is the top-most layer,
      so test from top to bottom.
    */

    for (
      let index =
        layers.length - 1;
      index >= 0;
      index -= 1
    ) {
      const layer =
        layers[index];

      if (
        !layer.visible ||
        layer.layerKind ===
          "adjustment"
      ) {
        continue;
      }

      const size =
        layerSizes[
          layer.id
        ];

      if (!size) {
        continue;
      }

      const centerX =
        documentSize.width / 2 +
        layer.x *
          previewScale;

      const centerY =
        documentSize.height / 2 +
        layer.y *
          previewScale;

      const dx =
        pointX -
        centerX;

      const dy =
        pointY -
        centerY;

      /*
        Inverse rotation converts the
        pointer into the layer's local
        coordinate system.
      */

      const angle =
        (-layer.rotation *
          Math.PI) /
        180;

      const localX =
        dx *
          Math.cos(angle) -
        dy *
          Math.sin(angle);

      const localY =
        dx *
          Math.sin(angle) +
        dy *
          Math.cos(angle);

      const halfWidth =
        (
          size.width *
          previewScale *
          layer.scale
        ) /
        2;

      const halfHeight =
        (
          size.height *
          previewScale *
          layer.scale
        ) /
        2;

      if (
        Math.abs(localX) <=
          halfWidth &&
        Math.abs(localY) <=
          halfHeight
      ) {
        return layer;
      }
    }

    return null;
  }

  /*
    RECTANGULAR MARQUEE SELECTION

    Selection coordinates are normalized
    to the document:
    0 = left/top, 1 = right/bottom.

    This keeps the selection stable while
    zooming and panning.
  */

  function pointerToDocumentPoint(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return null;
    }

    const x =
      (clientX -
        rect.left) /
      rect.width;

    const y =
      (clientY -
        rect.top) /
      rect.height;

    return {
      x:
        Math.max(
          0,
          Math.min(
            1,
            x
          )
        ),

      y:
        Math.max(
          0,
          Math.min(
            1,
            y
          )
        ),
    };
  }

  function getSelectionAspectRatio() {
    switch (
      selectionAspect
    ) {
      case "1:1":
        return 1;

      case "4:3":
        return 4 / 3;

      case "3:2":
        return 3 / 2;

      case "16:9":
        return 16 / 9;

      case "free":
      default:
        return null;
    }
  }

  function startSelection(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "select"
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    /*
      Clicking inside the existing marquee
      moves it instead of replacing it.
    */

    const insideSelection =
      !!selection &&
      selection.width > 0 &&
      selection.height > 0 &&
      point.x >=
        selection.x &&
      point.x <=
        selection.x +
          selection.width &&
      point.y >=
        selection.y &&
      point.y <=
        selection.y +
          selection.height;

    if (
      selectionMode ===
        "new" &&
      selectionRegions.length <=
        1 &&
      insideSelection &&
      selection
    ) {
      selectionMoveStartRef.current = {
        pointerX:
          point.x,

        pointerY:
          point.y,

        x:
          selection.x,

        y:
          selection.y,

        width:
          selection.width,

        height:
          selection.height,
      };

      setSelecting(
        false
      );

      setMovingSelection(
        true
      );

      return;
    }

    /*
      Otherwise begin a brand-new marquee.
      A fresh selection starts in normal
      (inside selected) mode.
    */

    onSelectionInvertChange(
      false
    );

    if (
      selectionMode ===
      "new"
    ) {
      onSelectionPathChange(
        null
      );
    }

    if (
      selectionShape ===
      "lasso"
    ) {
      onSelectionShapeChange(
        "rectangle"
      );
    }

    selectionStartRef.current =
      point;

    setMovingSelection(
      false
    );

    setSelecting(
      true
    );

    const initialSelection = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    };

    selectionDraftRef.current =
      initialSelection;

    onSelectionChange(
      initialSelection
    );
  }

  function moveSelection(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "select"
    ) {
      return;
    }

    if (
      !selecting &&
      !movingSelection
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    /*
      MOVE EXISTING SELECTION
    */

    if (movingSelection) {
      const start =
        selectionMoveStartRef.current;

      const deltaX =
        point.x -
        start.pointerX;

      const deltaY =
        point.y -
        start.pointerY;

      const maxX =
        Math.max(
          0,
          1 -
            start.width
        );

      const maxY =
        Math.max(
          0,
          1 -
            start.height
        );

      const nextX =
        Math.max(
          0,
          Math.min(
            maxX,
            start.x +
              deltaX
          )
        );

      const nextY =
        Math.max(
          0,
          Math.min(
            maxY,
            start.y +
              deltaY
          )
        );

      onSelectionChange({
        x: nextX,
        y: nextY,
        width:
          start.width,
        height:
          start.height,
      });

      return;
    }

    /*
      DRAW NEW SELECTION
    */

    const start =
      selectionStartRef.current;

    let currentX =
      point.x;

    let currentY =
      point.y;

    let deltaX =
      currentX -
      start.x;

    let deltaY =
      currentY -
      start.y;

    /*
      Selection aspect ratio.

      The preset uses actual document pixels,
      not normalized percentages, so a 1:1
      selection is visually square even on
      non-square photographs.

      Holding Shift temporarily forces 1:1,
      just like the earlier square shortcut.
    */

    const presetRatio =
      event.shiftKey
        ? 1
        : getSelectionAspectRatio();

    if (presetRatio) {
      const signX =
        deltaX < 0
          ? -1
          : 1;

      const signY =
        deltaY < 0
          ? -1
          : 1;

      const rawWidthPixels =
        Math.abs(
          deltaX
        ) *
        documentSize.width;

      const rawHeightPixels =
        Math.abs(
          deltaY
        ) *
        documentSize.height;

      let widthPixels =
        rawWidthPixels;

      let heightPixels =
        rawHeightPixels;

      if (
        rawHeightPixels <= 0.0001 ||
        rawWidthPixels /
          Math.max(
            0.0001,
            rawHeightPixels
          ) >
          presetRatio
      ) {
        widthPixels =
          rawWidthPixels;

        heightPixels =
          widthPixels /
          presetRatio;
      } else {
        heightPixels =
          rawHeightPixels;

        widthPixels =
          heightPixels *
          presetRatio;
      }

      deltaX =
        signX *
        (
          widthPixels /
          Math.max(
            1,
            documentSize.width
          )
        );

      deltaY =
        signY *
        (
          heightPixels /
          Math.max(
            1,
            documentSize.height
          )
        );

      currentX =
        start.x +
        deltaX;

      currentY =
        start.y +
        deltaY;
    }

    let left: number;
    let top: number;
    let right: number;
    let bottom: number;

    /*
      Hold Alt to draw outward from the
      starting point as the selection's
      center instead of its corner.
    */

    if (event.altKey) {
      const halfWidth =
        Math.abs(
          deltaX
        );

      const halfHeight =
        Math.abs(
          deltaY
        );

      left =
        start.x -
        halfWidth;

      right =
        start.x +
        halfWidth;

      top =
        start.y -
        halfHeight;

      bottom =
        start.y +
        halfHeight;
    } else {
      left =
        Math.min(
          start.x,
          currentX
        );

      top =
        Math.min(
          start.y,
          currentY
        );

      right =
        Math.max(
          start.x,
          currentX
        );

      bottom =
        Math.max(
          start.y,
          currentY
        );
    }

    /*
      Keep the marquee inside the document.
    */

    left =
      Math.max(
        0,
        Math.min(
          1,
          left
        )
      );

    top =
      Math.max(
        0,
        Math.min(
          1,
          top
        )
      );

    right =
      Math.max(
        0,
        Math.min(
          1,
          right
        )
      );

    bottom =
      Math.max(
        0,
        Math.min(
          1,
          bottom
        )
      );

    const nextSelection = {
      x: left,
      y: top,
      width:
        Math.max(
          0,
          right - left
        ),
      height:
        Math.max(
          0,
          bottom - top
        ),
    };

    selectionDraftRef.current =
      nextSelection;

    onSelectionChange(
      nextSelection
    );
  }

  /*
    MAGIC WAND

    Samples the selected visual layer and flood-fills
    connected pixels within the current tolerance.
  */

  function layerPixelToDocumentPoint(
    layer:
      ImageLayer,
    sourceWidth: number,
    sourceHeight: number,
    pixelX: number,
    pixelY: number
  ) {
    const centerX =
      documentSize.width /
        2 +
      layer.x *
        previewScale;

    const centerY =
      documentSize.height /
        2 +
      layer.y *
        previewScale;

    const scaleX =
      layer.scale *
      (
        layer.flipHorizontal
          ? -1
          : 1
      );

    const scaleY =
      layer.scale *
      (
        layer.flipVertical
          ? -1
          : 1
      );

    const localX =
      (
        pixelX -
        sourceWidth /
          2
      ) *
      previewScale *
      scaleX;

    const localY =
      (
        pixelY -
        sourceHeight /
          2
      ) *
      previewScale *
      scaleY;

    const angle =
      (
        layer.rotation *
        Math.PI
      ) /
      180;

    const rotatedX =
      localX *
        Math.cos(
          angle
        ) -
      localY *
        Math.sin(
          angle
        );

    const rotatedY =
      localX *
        Math.sin(
          angle
        ) +
      localY *
        Math.cos(
          angle
        );

    return {
      x:
        Math.max(
          0,
          Math.min(
            1,
            (
              centerX +
              rotatedX
            ) /
              Math.max(
                1,
                documentSize.width
              )
          )
        ),

      y:
        Math.max(
          0,
          Math.min(
            1,
            (
              centerY +
              rotatedY
            ) /
              Math.max(
                1,
                documentSize.height
              )
          )
        ),
    };
  }

  function traceMagicWandBoundary(
    selected:
      Uint8Array,
    width: number,
    height: number
  ) {
    type Edge = {
      ax: number;
      ay: number;
      bx: number;
      by: number;
    };

    const edges:
      Edge[] =
        [];

    function isSelected(
      x: number,
      y: number
    ) {
      return (
        x >= 0 &&
        y >= 0 &&
        x < width &&
        y < height &&
        selected[
          y *
            width +
          x
        ] ===
          1
      );
    }

    for (
      let y = 0;
      y < height;
      y += 1
    ) {
      for (
        let x = 0;
        x < width;
        x += 1
      ) {
        if (
          !isSelected(
            x,
            y
          )
        ) {
          continue;
        }

        if (
          !isSelected(
            x,
            y - 1
          )
        ) {
          edges.push({
            ax: x,
            ay: y,
            bx: x + 1,
            by: y,
          });
        }

        if (
          !isSelected(
            x + 1,
            y
          )
        ) {
          edges.push({
            ax: x + 1,
            ay: y,
            bx: x + 1,
            by: y + 1,
          });
        }

        if (
          !isSelected(
            x,
            y + 1
          )
        ) {
          edges.push({
            ax: x + 1,
            ay: y + 1,
            bx: x,
            by: y + 1,
          });
        }

        if (
          !isSelected(
            x - 1,
            y
          )
        ) {
          edges.push({
            ax: x,
            ay: y + 1,
            bx: x,
            by: y,
          });
        }
      }
    }

    if (
      edges.length ===
      0
    ) {
      return [];
    }

    const startMap =
      new Map<
        string,
        number[]
      >();

    edges.forEach(
      (
        edge,
        index
      ) => {
        const key =
          `${edge.ax},${edge.ay}`;

        const list =
          startMap.get(
            key
          ) ??
          [];

        list.push(
          index
        );

        startMap.set(
          key,
          list
        );
      }
    );

    const used =
      new Uint8Array(
        edges.length
      );

    const loops:
      {
        x: number;
        y: number;
      }[][] =
        [];

    for (
      let edgeIndex = 0;
      edgeIndex <
        edges.length;
      edgeIndex += 1
    ) {
      if (
        used[
          edgeIndex
        ]
      ) {
        continue;
      }

      const first =
        edges[
          edgeIndex
        ];

      const loop = [
        {
          x:
            first.ax,
          y:
            first.ay,
        },
      ];

      let currentIndex =
        edgeIndex;

      let safety =
        0;

      while (
        safety <
        edges.length +
          8
      ) {
        safety +=
          1;

        if (
          used[
            currentIndex
          ]
        ) {
          break;
        }

        used[
          currentIndex
        ] =
          1;

        const current =
          edges[
            currentIndex
          ];

        loop.push({
          x:
            current.bx,
          y:
            current.by,
        });

        if (
          current.bx ===
            first.ax &&
          current.by ===
            first.ay
        ) {
          break;
        }

        const candidates =
          startMap.get(
            `${current.bx},${current.by}`
          ) ??
          [];

        const nextIndex =
          candidates.find(
            (candidate) =>
              !used[
                candidate
              ]
          );

        if (
          nextIndex ===
          undefined
        ) {
          break;
        }

        currentIndex =
          nextIndex;
      }

      if (
        loop.length >=
        4
      ) {
        loops.push(
          loop
        );
      }
    }

    if (
      loops.length ===
      0
    ) {
      return [];
    }

    function area(
      points: {
        x: number;
        y: number;
      }[]
    ) {
      let result =
        0;

      for (
        let index = 0;
        index <
          points.length;
        index += 1
      ) {
        const current =
          points[
            index
          ];

        const next =
          points[
            (
              index +
              1
            ) %
            points.length
          ];

        result +=
          current.x *
            next.y -
          next.x *
            current.y;
      }

      return (
        result /
        2
      );
    }

    const outer =
      loops.reduce(
        (
          best,
          loop
        ) =>
          Math.abs(
            area(
              loop
            )
          ) >
          Math.abs(
            area(
              best
            )
          )
            ? loop
            : best,
        loops[0]
      );

    const simplified:
      {
        x: number;
        y: number;
      }[] =
        [];

    for (
      let index = 0;
      index <
        outer.length;
      index += 1
    ) {
      const previous =
        outer[
          (
            index -
            1 +
            outer.length
          ) %
          outer.length
        ];

      const current =
        outer[
          index
        ];

      const next =
        outer[
          (
            index +
            1
          ) %
          outer.length
        ];

      const firstDx =
        current.x -
        previous.x;

      const firstDy =
        current.y -
        previous.y;

      const secondDx =
        next.x -
        current.x;

      const secondDy =
        next.y -
        current.y;

      if (
        firstDx ===
          secondDx &&
        firstDy ===
          secondDy
      ) {
        continue;
      }

      simplified.push({
        ...current,
      });
    }

    const maxPoints =
      900;

    if (
      simplified.length <=
      maxPoints
    ) {
      return simplified;
    }

    const step =
      Math.ceil(
        simplified.length /
          maxPoints
      );

    return simplified.filter(
      (
        _,
        index
      ) =>
        index %
          step ===
        0
    );
  }

  function addQuickSelectionSeed(
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastQuickSelectionSeedRef.current;

    const minimumSpacing =
      Math.max(
        3,
        quickSelectionBrushSize *
          0.3
      );

    if (
      previous &&
      Math.hypot(
        point.x -
          previous.x,
        point.y -
          previous.y
      ) <
        minimumSpacing
    ) {
      return;
    }

    if (
      quickSelectionSeedsRef.current.length >=
      24
    ) {
      return;
    }

    quickSelectionSeedsRef.current.push({
      ...point,
    });

    lastQuickSelectionSeedRef.current = {
      ...point,
    };
  }

  async function buildQuickSelectionRegion(
    layer:
      ImageLayer,
    seeds:
      {
        x: number;
        y: number;
      }[]
  ) {
    const sourceImage =
      await loadImage(
        layer.src
      );

    const sourceWidth =
      Math.max(
        1,
        sourceImage.naturalWidth
      );

    const sourceHeight =
      Math.max(
        1,
        sourceImage.naturalHeight
      );

    const maximumDimension =
      900;

    const workingScale =
      Math.min(
        1,
        maximumDimension /
          Math.max(
            sourceWidth,
            sourceHeight
          )
      );

    const width =
      Math.max(
        1,
        Math.round(
          sourceWidth *
            workingScale
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          sourceHeight *
            workingScale
        )
      );

    const working =
      document.createElement(
        "canvas"
      );

    working.width =
      width;

    working.height =
      height;

    const context =
      working.getContext(
        "2d",
        {
          willReadFrequently:
            true,
        }
      );

    if (!context) {
      return null;
    }

    context.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    const pixels =
      context.getImageData(
        0,
        0,
        width,
        height
      ).data;

    const combined =
      new Uint8Array(
        width *
          height
      );

    const tolerance =
      Math.max(
        0,
        Math.min(
          255,
          quickSelectionTolerance
        )
      );

    const radius =
      Math.max(
        1,
        quickSelectionBrushSize *
          workingScale /
          2
      );

    const samplePoints:
      {
        x: number;
        y: number;
      }[] =
        [];

    for (
      const seed of
        seeds
    ) {
      const centerX =
        seed.x *
        workingScale;

      const centerY =
        seed.y *
        workingScale;

      const offset =
        radius *
        0.55;

      const candidates = [
        [
          centerX,
          centerY,
        ],
        [
          centerX -
            offset,
          centerY,
        ],
        [
          centerX +
            offset,
          centerY,
        ],
        [
          centerX,
          centerY -
            offset,
        ],
        [
          centerX,
          centerY +
            offset,
        ],
      ];

      for (
        const [
          rawX,
          rawY,
        ] of
          candidates
      ) {
        const x =
          Math.max(
            0,
            Math.min(
              width - 1,
              Math.round(
                rawX
              )
            )
          );

        const y =
          Math.max(
            0,
            Math.min(
              height - 1,
              Math.round(
                rawY
              )
            )
          );

        if (
          !samplePoints.some(
            (item) =>
              item.x ===
                x &&
              item.y ===
                y
          )
        ) {
          samplePoints.push({
            x,
            y,
          });
        }
      }
    }

    let floodCount =
      0;

    for (
      const seed of
        samplePoints
    ) {
      if (
        floodCount >=
        36
      ) {
        break;
      }

      const seedPixel =
        seed.y *
          width +
        seed.x;

      if (
        combined[
          seedPixel
        ]
      ) {
        continue;
      }

      const seedIndex =
        seedPixel *
        4;

      const targetR =
        pixels[
          seedIndex
        ];

      const targetG =
        pixels[
          seedIndex +
            1
        ];

      const targetB =
        pixels[
          seedIndex +
            2
        ];

      const targetA =
        pixels[
          seedIndex +
            3
        ];

      function matches(
        pixel:
          number
      ) {
        const index =
          pixel *
          4;

        const alpha =
          pixels[
            index +
              3
          ];

        if (
          targetA <=
          8
        ) {
          return (
            Math.abs(
              alpha -
              targetA
            ) <=
            tolerance
          );
        }

        return (
          Math.max(
            Math.abs(
              pixels[
                index
              ] -
              targetR
            ),
            Math.abs(
              pixels[
                index +
                  1
              ] -
              targetG
            ),
            Math.abs(
              pixels[
                index +
                  2
              ] -
              targetB
            ),
            Math.abs(
              alpha -
              targetA
            )
          ) <=
          tolerance
        );
      }

      const visited =
        new Uint8Array(
          width *
            height
        );

      const queue =
        new Int32Array(
          width *
            height
        );

      let start =
        0;

      let end =
        0;

      queue[
        end
      ] =
        seedPixel;

      end +=
        1;

      visited[
        seedPixel
      ] =
        1;

      while (
        start <
        end
      ) {
        const pixel =
          queue[
            start
          ];

        start +=
          1;

        if (
          !matches(
            pixel
          )
        ) {
          continue;
        }

        combined[
          pixel
        ] =
          1;

        const x =
          pixel %
          width;

        const y =
          Math.floor(
            pixel /
              width
          );

        const neighbors = [
          x > 0
            ? pixel - 1
            : -1,

          x <
          width - 1
            ? pixel + 1
            : -1,

          y > 0
            ? pixel - width
            : -1,

          y <
          height - 1
            ? pixel + width
            : -1,
        ];

        for (
          const neighbor of
            neighbors
        ) {
          if (
            neighbor <
              0 ||
            visited[
              neighbor
            ]
          ) {
            continue;
          }

          visited[
            neighbor
          ] =
            1;

          if (
            matches(
              neighbor
            )
          ) {
            queue[
              end
            ] =
              neighbor;

            end +=
              1;
          }
        }
      }

      floodCount +=
        1;
    }

    const contour =
      traceMagicWandBoundary(
        combined,
        width,
        height
      );

    if (
      contour.length <
        3
    ) {
      return null;
    }

    const path =
      contour.map(
        (point) =>
          layerPixelToDocumentPoint(
            layer,
            sourceWidth,
            sourceHeight,
            point.x /
              workingScale,
            point.y /
              workingScale
          )
      );

    const xs =
      path.map(
        (point) =>
          point.x
      );

    const ys =
      path.map(
        (point) =>
          point.y
      );

    const minX =
      Math.min(
        ...xs
      );

    const minY =
      Math.min(
        ...ys
      );

    const maxX =
      Math.max(
        ...xs
      );

    const maxY =
      Math.max(
        ...ys
      );

    return {
      shape:
        "lasso" as const,

      rect: {
        x:
          minX,

        y:
          minY,

        width:
          Math.max(
            0.0001,
            maxX -
              minX
          ),

        height:
          Math.max(
            0.0001,
            maxY -
              minY
          ),
      },

      path,
    };
  }

  function startQuickSelection(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "quick-select" ||
      quickSelectionBusy ||
      !selectedLayer ||
      selectedLayer.layerKind ===
        "adjustment"
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    quickSelectionSeedsRef.current =
      [];

    lastQuickSelectionSeedRef.current =
      null;

    addQuickSelectionSeed(
      point
    );

    setQuickSelecting(
      true
    );
  }

  function moveQuickSelection(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      !quickSelecting ||
      !selectedLayer
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    addQuickSelectionSeed(
      point
    );
  }

  async function endQuickSelection() {
    if (
      !quickSelecting ||
      !selectedLayer
    ) {
      return;
    }

    const targetLayer =
      selectedLayer;

    const seeds =
      quickSelectionSeedsRef.current.map(
        (seed) => ({
          ...seed,
        })
      );

    setQuickSelecting(
      false
    );

    quickSelectionSeedsRef.current =
      [];

    lastQuickSelectionSeedRef.current =
      null;

    if (
      seeds.length ===
      0
    ) {
      return;
    }

    setQuickSelectionBusy(
      true
    );

    try {
      const region =
        await buildQuickSelectionRegion(
          targetLayer,
          seeds
        );

      if (!region) {
        return;
      }

      onSelectionInvertChange(
        false
      );

      onSelectionRegionCommit(
        region,
        selectionMode
      );
    } finally {
      setQuickSelectionBusy(
        false
      );
    }
  }

  async function startMagicWand(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "magic-wand" ||
      magicWandBusy ||
      !selectedLayer ||
      selectedLayer.layerKind ===
        "adjustment"
    ) {
      return;
    }

    const localPoint =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (
      !localPoint
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setMagicWandBusy(
      true
    );

    try {
      const sourceImage =
        await loadImage(
          selectedLayer.src
        );

      const sourceWidth =
        Math.max(
          1,
          sourceImage.naturalWidth
        );

      const sourceHeight =
        Math.max(
          1,
          sourceImage.naturalHeight
        );

      const maximumDimension =
        1400;

      const workingScale =
        Math.min(
          1,
          maximumDimension /
            Math.max(
              sourceWidth,
              sourceHeight
            )
        );

      const width =
        Math.max(
          1,
          Math.round(
            sourceWidth *
              workingScale
          )
        );

      const height =
        Math.max(
          1,
          Math.round(
            sourceHeight *
              workingScale
          )
        );

      const working =
        document.createElement(
          "canvas"
        );

      working.width =
        width;

      working.height =
        height;

      const context =
        working.getContext(
          "2d",
          {
            willReadFrequently:
              true,
          }
        );

      if (!context) {
        return;
      }

      context.drawImage(
        sourceImage,
        0,
        0,
        width,
        height
      );

      const pixels =
        context.getImageData(
          0,
          0,
          width,
          height
        ).data;

      const seedX =
        Math.max(
          0,
          Math.min(
            width - 1,
            Math.floor(
              localPoint.x *
              (
                width /
                sourceWidth
              )
            )
          )
        );

      const seedY =
        Math.max(
          0,
          Math.min(
            height - 1,
            Math.floor(
              localPoint.y *
              (
                height /
                sourceHeight
              )
            )
          )
        );

      const seedDataIndex =
        (
          seedY *
            width +
          seedX
        ) *
        4;

      const targetR =
        pixels[
          seedDataIndex
        ];

      const targetG =
        pixels[
          seedDataIndex +
            1
        ];

      const targetB =
        pixels[
          seedDataIndex +
            2
        ];

      const targetA =
        pixels[
          seedDataIndex +
            3
        ];

      const tolerance =
        Math.max(
          0,
          Math.min(
            255,
            magicWandTolerance
          )
        );

      function matches(
        pixel:
          number
      ) {
        const index =
          pixel *
          4;

        const alpha =
          pixels[
            index +
              3
          ];

        if (
          targetA <=
          8
        ) {
          return (
            Math.abs(
              alpha -
              targetA
            ) <=
            tolerance
          );
        }

        return (
          Math.max(
            Math.abs(
              pixels[
                index
              ] -
              targetR
            ),
            Math.abs(
              pixels[
                index +
                  1
              ] -
              targetG
            ),
            Math.abs(
              pixels[
                index +
                  2
              ] -
              targetB
            ),
            Math.abs(
              alpha -
              targetA
            )
          ) <=
          tolerance
        );
      }

      const selected =
        new Uint8Array(
          width *
            height
        );

      const queued =
        new Uint8Array(
          width *
            height
        );

      const queue =
        new Int32Array(
          width *
            height
        );

      let start =
        0;

      let end =
        0;

      const seedPixel =
        seedY *
          width +
        seedX;

      queue[
        end
      ] =
        seedPixel;

      end +=
        1;

      queued[
        seedPixel
      ] =
        1;

      while (
        start <
        end
      ) {
        const pixel =
          queue[
            start
          ];

        start +=
          1;

        if (
          !matches(
            pixel
          )
        ) {
          continue;
        }

        selected[
          pixel
        ] =
          1;

        const x =
          pixel %
          width;

        const y =
          Math.floor(
            pixel /
              width
          );

        const neighbors = [
          x > 0
            ? pixel - 1
            : -1,

          x <
          width - 1
            ? pixel + 1
            : -1,

          y > 0
            ? pixel - width
            : -1,

          y <
          height - 1
            ? pixel + width
            : -1,
        ];

        for (
          const neighbor of
            neighbors
        ) {
          if (
            neighbor <
              0 ||
            queued[
              neighbor
            ]
          ) {
            continue;
          }

          queued[
            neighbor
          ] =
            1;

          if (
            matches(
              neighbor
            )
          ) {
            queue[
              end
            ] =
              neighbor;

            end +=
              1;
          }
        }
      }

      const contour =
        traceMagicWandBoundary(
          selected,
          width,
          height
        );

      if (
        contour.length <
        3
      ) {
        return;
      }

      const path =
        contour.map(
          (point) =>
            layerPixelToDocumentPoint(
              selectedLayer,
              sourceWidth,
              sourceHeight,
              point.x /
                workingScale,
              point.y /
                workingScale
            )
        );

      const minX =
        Math.min(
          ...path.map(
            (point) =>
              point.x
          )
        );

      const minY =
        Math.min(
          ...path.map(
            (point) =>
              point.y
          )
        );

      const maxX =
        Math.max(
          ...path.map(
            (point) =>
              point.x
          )
        );

      const maxY =
        Math.max(
          ...path.map(
            (point) =>
              point.y
          )
        );

      onSelectionInvertChange(
        false
      );

      onSelectionRegionCommit(
        {
          shape:
            "lasso",

          rect: {
            x:
              minX,

            y:
              minY,

            width:
              Math.max(
                0.0001,
                maxX -
                  minX
              ),

            height:
              Math.max(
                0.0001,
                maxY -
                  minY
              ),
          },

          path,
        },

        selectionMode
      );
    } finally {
      setMagicWandBusy(
        false
      );
    }
  }

  /*
    POLYGONAL LASSO

    Each click places a vertex. Double-click or Enter
    closes the polygon. Backspace removes the most
    recent vertex while drawing.
  */

  function finishPolygonalLasso(
    pointsInput?:
      SelectionPoint[]
  ) {
    const points =
      pointsInput ??
      polygonDraftRef.current;

    if (
      points.length <
      3
    ) {
      polygonDraftRef.current =
        [];

      setPolygonDraft(
        []
      );

      setPolygonPointer(
        null
      );

      onSelectionChange(
        null
      );

      onSelectionPathChange(
        null
      );

      return;
    }

    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;

    for (
      const point of
        points
    ) {
      minX =
        Math.min(
          minX,
          point.x
        );

      minY =
        Math.min(
          minY,
          point.y
        );

      maxX =
        Math.max(
          maxX,
          point.x
        );

      maxY =
        Math.max(
          maxY,
          point.y
        );
    }

    const width =
      Math.max(
        0,
        maxX -
          minX
      );

    const height =
      Math.max(
        0,
        maxY -
          minY
      );

    if (
      width <
        0.001 ||
      height <
        0.001
    ) {
      polygonDraftRef.current =
        [];

      setPolygonDraft(
        []
      );

      setPolygonPointer(
        null
      );

      onSelectionChange(
        null
      );

      onSelectionPathChange(
        null
      );

      return;
    }

    onSelectionInvertChange(
      false
    );

    onSelectionShapeChange(
      "lasso"
    );

    onSelectionPathChange(
      points.map(
        (point) => ({
          ...point,
        })
      )
    );

    const completedRect = {
      x:
        minX,

      y:
        minY,

      width,
      height,
    };

    onSelectionChange(
      completedRect
    );

    onSelectionRegionCommit(
      {
        shape:
          "lasso",

        rect:
          completedRect,

        path:
          points.map(
            (point) => ({
              ...point,
            })
          ),
      },

      selectionMode
    );

    polygonDraftRef.current =
      [];

    setPolygonDraft(
      []
    );

    setPolygonPointer(
      null
    );
  }

  function startPolygonalLasso(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
      "polygonal-lasso"
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextPoint = {
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
    };

    if (
      polygonDraftRef.current.length ===
      0
    ) {
      if (
        selectionMode ===
        "new"
      ) {
        onSelectionChange(
          null
        );

        onSelectionPathChange(
          null
        );
      }

      onSelectionInvertChange(
        false
      );
    }

    const next = [
      ...polygonDraftRef.current,
      nextPoint,
    ];

    polygonDraftRef.current =
      next;

    setPolygonDraft(
      next
    );

    setPolygonPointer(
      nextPoint
    );

    /*
      PointerEvent.detail is 2 on double-click.
      The final clicked point becomes part of the
      polygon before the selection is closed.
    */

    if (
      event.detail >=
        2 &&
      next.length >=
        3
    ) {
      finishPolygonalLasso(
        next
      );
    }
  }

  function movePolygonalLasso(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "polygonal-lasso" ||
      polygonDraftRef.current.length ===
        0
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    setPolygonPointer({
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
    });
  }

  /*
    FREEHAND LASSO

    Points are stored in normalized document
    coordinates, so the selection remains stable
    across zoom, pan and project reloads.
  */

  function startLasso(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
      "lasso"
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onSelectionInvertChange(
      false
    );

    onSelectionShapeChange(
      "lasso"
    );

    if (
      selectionMode ===
      "new"
    ) {
      onSelectionChange(
        null
      );

      onSelectionPathChange(
        null
      );
    }

    const firstPoint = {
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
    };

    lassoDraftRef.current = [
      firstPoint,
    ];

    setLassoDraft([
      firstPoint,
    ]);

    setDrawingLasso(
      true
    );
  }

  function moveLasso(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "lasso" ||
      !drawingLasso
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const current =
      lassoDraftRef.current;

    const previous =
      current[
        current.length -
          1
      ];

    if (!previous) {
      return;
    }

    const nextPoint = {
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
    };

    const distancePixels =
      Math.hypot(
        (
          nextPoint.x -
          previous.x
        ) *
          documentSize.width,
        (
          nextPoint.y -
          previous.y
        ) *
          documentSize.height
      );

    /*
      Sample every few pixels. This keeps the
      freehand path smooth without storing tens
      of thousands of points.
    */

    if (
      distancePixels <
        3 &&
      current.length >
        1
    ) {
      return;
    }

    if (
      current.length >=
      4096
    ) {
      return;
    }

    const next = [
      ...current,
      nextPoint,
    ];

    lassoDraftRef.current =
      next;

    setLassoDraft(
      next
    );
  }

  function endLasso() {
    if (
      !drawingLasso
    ) {
      return;
    }

    const points =
      lassoDraftRef.current;

    setDrawingLasso(
      false
    );

    lassoDraftRef.current =
      [];

    setLassoDraft(
      []
    );

    if (
      points.length <
      3
    ) {
      onSelectionChange(
        null
      );

      onSelectionPathChange(
        null
      );

      return;
    }

    let minX = 1;
    let minY = 1;
    let maxX = 0;
    let maxY = 0;

    for (
      const point of
        points
    ) {
      minX =
        Math.min(
          minX,
          point.x
        );

      minY =
        Math.min(
          minY,
          point.y
        );

      maxX =
        Math.max(
          maxX,
          point.x
        );

      maxY =
        Math.max(
          maxY,
          point.y
        );
    }

    const width =
      Math.max(
        0,
        maxX -
          minX
      );

    const height =
      Math.max(
        0,
        maxY -
          minY
      );

    if (
      width <
        0.001 ||
      height <
        0.001
    ) {
      onSelectionChange(
        null
      );

      onSelectionPathChange(
        null
      );

      return;
    }

    onSelectionShapeChange(
      "lasso"
    );

    const completedPath =
      points.map(
        (point) => ({
          ...point,
        })
      );

    const completedRect = {
      x:
        minX,

      y:
        minY,

      width,
      height,
    };

    onSelectionPathChange(
      completedPath
    );

    onSelectionChange(
      completedRect
    );

    onSelectionRegionCommit(
      {
        shape:
          "lasso",

        rect:
          completedRect,

        path:
          completedPath,
      },

      selectionMode
    );
  }

  function startSelectionResize(
    event:
      PointerEvent<HTMLDivElement>,
    handle:
      | "nw"
      | "n"
      | "ne"
      | "e"
      | "se"
      | "s"
      | "sw"
      | "w"
  ) {
    if (
      activeTool !== "select" ||
      !selection ||
      selectionRegions.length >
        1
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    selectionResizeStartRef.current = {
      handle,

      x:
        selection.x,

      y:
        selection.y,

      width:
        selection.width,

      height:
        selection.height,
    };

    setSelecting(
      false
    );

    setMovingSelection(
      false
    );

    setResizingSelection(
      true
    );
  }

  function resizeSelection(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "select" ||
      !resizingSelection
    ) {
      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const start =
      selectionResizeStartRef.current;

    const originalLeft =
      start.x;

    const originalTop =
      start.y;

    const originalRight =
      start.x +
      start.width;

    const originalBottom =
      start.y +
      start.height;

    let left =
      originalLeft;

    let top =
      originalTop;

    let right =
      originalRight;

    let bottom =
      originalBottom;

    const handle =
      start.handle;

    if (
      handle.includes(
        "w"
      )
    ) {
      left =
        Math.min(
          point.x,
          originalRight
        );
    }

    if (
      handle.includes(
        "e"
      )
    ) {
      right =
        Math.max(
          point.x,
          originalLeft
        );
    }

    if (
      handle.includes(
        "n"
      )
    ) {
      top =
        Math.min(
          point.y,
          originalBottom
        );
    }

    if (
      handle.includes(
        "s"
      )
    ) {
      bottom =
        Math.max(
          point.y,
          originalTop
        );
    }

    /*
      Edge handles contain only one
      direction, so they change only
      one dimension.
    */

    if (handle === "n") {
      left =
        originalLeft;

      right =
        originalRight;
    }

    if (handle === "s") {
      left =
        originalLeft;

      right =
        originalRight;
    }

    if (handle === "e") {
      top =
        originalTop;

      bottom =
        originalBottom;
    }

    if (handle === "w") {
      top =
        originalTop;

      bottom =
        originalBottom;
    }

    /*
      Keep the marquee within the
      document and prevent zero-size
      selections.
    */

    const minimum =
      0.0025;

    left =
      Math.max(
        0,
        Math.min(
          1,
          left
        )
      );

    top =
      Math.max(
        0,
        Math.min(
          1,
          top
        )
      );

    right =
      Math.max(
        0,
        Math.min(
          1,
          right
        )
      );

    bottom =
      Math.max(
        0,
        Math.min(
          1,
          bottom
        )
      );

    if (
      right - left <
      minimum
    ) {
      if (
        handle.includes(
          "w"
        )
      ) {
        left =
          Math.max(
            0,
            right -
              minimum
          );
      } else {
        right =
          Math.min(
            1,
            left +
              minimum
          );
      }
    }

    if (
      bottom - top <
      minimum
    ) {
      if (
        handle.includes(
          "n"
        )
      ) {
        top =
          Math.max(
            0,
            bottom -
              minimum
          );
      } else {
        bottom =
          Math.min(
            1,
            top +
              minimum
          );
      }
    }

    onSelectionChange({
      x: left,
      y: top,
      width:
        right - left,
      height:
        bottom - top,
    });
  }

  function endSelection() {
    if (
      !selecting &&
      !movingSelection &&
      !resizingSelection
    ) {
      return;
    }

    const completed =
      selecting
        ? selectionDraftRef.current
        : null;

    setSelecting(
      false
    );

    setMovingSelection(
      false
    );

    setResizingSelection(
      false
    );

    selectionDraftRef.current =
      null;

    if (
      completed &&
      completed.width >=
        0.001 &&
      completed.height >=
        0.001
    ) {
      onSelectionRegionCommit(
        {
          shape:
            selectionShape ===
              "ellipse"
              ? "ellipse"
              : "rectangle",

          rect: {
            ...completed,
          },

          path:
            null,
        },

        selectionMode
      );
    }
  }

  /*
    MASK BRUSH

    Pointer coordinates are converted from
    document space back into the selected
    layer's original pixel coordinates.

    The mask itself remains a normal PNG:
    black hides, white reveals.
  */

  function pointerToMaskPoint(
    clientX: number,
    clientY: number,
    layer: ImageLayer
  ) {
    const canvas =
      canvasRef.current;

    const size =
      layerSizes[
        layer.id
      ];

    if (
      !canvas ||
      !size
    ) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return null;
    }

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const centerX =
      documentSize.width / 2 +
      layer.x *
        previewScale;

    const centerY =
      documentSize.height / 2 +
      layer.y *
        previewScale;

    const dx =
      documentX -
      centerX;

    const dy =
      documentY -
      centerY;

    const angle =
      (-layer.rotation *
        Math.PI) /
      180;

    const rotatedX =
      dx *
        Math.cos(angle) -
      dy *
        Math.sin(angle);

    const rotatedY =
      dx *
        Math.sin(angle) +
      dy *
        Math.cos(angle);

    const scaleX =
      layer.scale *
      (
        layer.flipHorizontal
          ? -1
          : 1
      );

    const scaleY =
      layer.scale *
      (
        layer.flipVertical
          ? -1
          : 1
      );

    if (
      Math.abs(scaleX) <
        0.0001 ||
      Math.abs(scaleY) <
        0.0001 ||
      previewScale <= 0
    ) {
      return null;
    }

    const localPreviewX =
      rotatedX /
      scaleX;

    const localPreviewY =
      rotatedY /
      scaleY;

    const maskX =
      localPreviewX /
        previewScale +
      size.width / 2;

    const maskY =
      localPreviewY /
        previewScale +
      size.height / 2;

    if (
      maskX < 0 ||
      maskY < 0 ||
      maskX >
        size.width ||
      maskY >
        size.height
    ) {
      return null;
    }

    return {
      x: maskX,
      y: maskY,
    };
  }

  function updateBrushCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !== "brush" ||
      !selectedLayer.maskSrc ||
      !(selectedLayer.maskEnabled ?? true)
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScaleX =
      canvas.clientWidth /
      canvas.width;

    const cssScaleY =
      canvas.clientHeight /
      canvas.height;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      maskBrushSize *
      previewScale *
      selectedLayer.scale *
      (
        (
          cssScaleX +
          cssScaleY
        ) /
        2
      );

    setBrushCursor({
      x:
        documentX *
        cssScaleX,

      y:
        documentY *
        cssScaleY,

      size:
        Math.max(
          4,
          diameter
        ),

      visible: true,
    });
  }

  function updateHealCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !==
        "heal" ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScaleX =
      canvas.clientWidth /
      canvas.width;

    const cssScaleY =
      canvas.clientHeight /
      canvas.height;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      healBrushSize *
      previewScale *
      selectedLayer.scale *
      (
        (
          cssScaleX +
          cssScaleY
        ) /
        2
      );

    setBrushCursor({
      x:
        documentX *
        cssScaleX,

      y:
        documentY *
        cssScaleY,

      size:
        Math.max(
          4,
          diameter
        ),

      visible:
        true,
    });
  }

  function updateCloneCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !==
        "clone" ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScale =
      (
        canvas.clientWidth /
          canvas.width +
        canvas.clientHeight /
          canvas.height
      ) /
      2;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      cloneBrushSize *
      previewScale *
      selectedLayer.scale *
      cssScale;

    setBrushCursor({
      x:
        documentX *
        (
          canvas.clientWidth /
          canvas.width
        ),

      y:
        documentY *
        (
          canvas.clientHeight /
          canvas.height
        ),

      size:
        Math.max(
          4,
          diameter
        ),

      visible:
        true,
    });
  }

  function updateEraserCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !==
        "eraser" ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScale =
      (
        canvas.clientWidth /
          canvas.width +
        canvas.clientHeight /
          canvas.height
      ) /
      2;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      eraserBrushSize *
      previewScale *
      selectedLayer.scale *
      cssScale;

    setBrushCursor({
      x:
        documentX *
        (
          canvas.clientWidth /
          canvas.width
        ),

      y:
        documentY *
        (
          canvas.clientHeight /
          canvas.height
        ),

      size:
        Math.max(
          4,
          diameter
        ),

      visible:
        true,
    });
  }

  function updateDodgeBurnCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !==
        "dodge-burn" ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScale =
      (
        canvas.clientWidth /
          canvas.width +
        canvas.clientHeight /
          canvas.height
      ) /
      2;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      dodgeBurnBrushSize *
      previewScale *
      selectedLayer.scale *
      cssScale;

    setBrushCursor({
      x:
        documentX *
        (
          canvas.clientWidth /
          canvas.width
        ),

      y:
        documentY *
        (
          canvas.clientHeight /
          canvas.height
        ),

      size:
        Math.max(
          4,
          diameter
        ),

      visible:
        true,
    });
  }

  function updateBlurSharpenCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !==
        "blur-sharpen" ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScale =
      (
        canvas.clientWidth /
          canvas.width +
        canvas.clientHeight /
          canvas.height
      ) /
      2;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      blurSharpenBrushSize *
      previewScale *
      selectedLayer.scale *
      cssScale;

    setBrushCursor({
      x:
        documentX *
        (
          canvas.clientWidth /
          canvas.width
        ),

      y:
        documentY *
        (
          canvas.clientHeight /
          canvas.height
        ),

      size:
        Math.max(
          4,
          diameter
        ),

      visible:
        true,
    });
  }

  function updatePaintCursor(
    clientX: number,
    clientY: number
  ) {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedLayer ||
      activeTool !==
        "paint" ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const point =
      pointerToMaskPoint(
        clientX,
        clientY,
        selectedLayer
      );

    if (!point) {
      setBrushCursor(
        (current) => ({
          ...current,
          visible: false,
        })
      );

      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const cssScale =
      (
        canvas.clientWidth /
          canvas.width +
        canvas.clientHeight /
          canvas.height
      ) /
      2;

    const documentX =
      (clientX -
        rect.left) *
      (
        canvas.width /
        rect.width
      );

    const documentY =
      (clientY -
        rect.top) *
      (
        canvas.height /
        rect.height
      );

    const diameter =
      paintBrushSize *
      previewScale *
      selectedLayer.scale *
      cssScale;

    setBrushCursor({
      x:
        documentX *
        (
          canvas.clientWidth /
          canvas.width
        ),

      y:
        documentY *
        (
          canvas.clientHeight /
          canvas.height
        ),

      size:
        Math.max(
          4,
          diameter
        ),

      visible:
        true,
    });
  }

  function selectionRegionToMaskPolygon(
    layer: ImageLayer,
    region:
      Omit<
        SelectionRegion,
        "operation"
      >
  ) {
    const size =
      layerSizes[
        layer.id
      ];

    if (!size) {
      return null;
    }

    const centerX =
      documentSize.width / 2 +
      layer.x *
        previewScale;

    const centerY =
      documentSize.height / 2 +
      layer.y *
        previewScale;

    const scaleX =
      layer.scale *
      (
        layer.flipHorizontal
          ? -1
          : 1
      );

    const scaleY =
      layer.scale *
      (
        layer.flipVertical
          ? -1
          : 1
      );

    if (
      Math.abs(scaleX) <
        0.0001 ||
      Math.abs(scaleY) <
        0.0001 ||
      previewScale <= 0
    ) {
      return null;
    }

    const angle =
      (-layer.rotation *
        Math.PI) /
      180;

    function documentPointToMask(
      x: number,
      y: number
    ) {
      const documentX =
        x *
        documentSize.width;

      const documentY =
        y *
        documentSize.height;

      const dx =
        documentX -
        centerX;

      const dy =
        documentY -
        centerY;

      const rotatedX =
        dx *
          Math.cos(angle) -
        dy *
          Math.sin(angle);

      const rotatedY =
        dx *
          Math.sin(angle) +
        dy *
          Math.cos(angle);

      return {
        x:
          rotatedX /
            scaleX /
            previewScale +
          size.width / 2,

        y:
          rotatedY /
            scaleY /
            previewScale +
          size.height / 2,
      };
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
        "lasso" &&
      region.path &&
      region.path.length >=
        3
    ) {
      return region.path.map(
        (point) =>
          documentPointToMask(
            point.x,
            point.y
          )
      );
    }

    if (
      region.shape ===
        "ellipse"
    ) {
      const regionCenterX =
        (
          left +
          right
        ) /
        2;

      const regionCenterY =
        (
          top +
          bottom
        ) /
        2;

      const radiusX =
        Math.max(
          0,
          (
            right -
            left
          ) /
          2
        );

      const radiusY =
        Math.max(
          0,
          (
            bottom -
            top
          ) /
          2
        );

      return Array.from(
        {
          length:
            72,
        },
        (
          _,
          index
        ) => {
          const theta =
            (
              index /
              72
            ) *
            Math.PI *
            2;

          return documentPointToMask(
            regionCenterX +
              Math.cos(
                theta
              ) *
              radiusX,
            regionCenterY +
              Math.sin(
                theta
              ) *
              radiusY
          );
        }
      );
    }

    return [
      documentPointToMask(
        left,
        top
      ),

      documentPointToMask(
        right,
        top
      ),

      documentPointToMask(
        right,
        bottom
      ),

      documentPointToMask(
        left,
        bottom
      ),
    ];
  }

  function clampGuide(
    value: number
  ) {
    return Math.max(
      0,
      Math.min(
        1,
        value
      )
    );
  }

  function changeGuideX(
    index: number,
    value: number
  ) {
    onGuidesXChange(
      guidesX.map(
        (
          guide,
          guideIndex
        ) =>
          guideIndex ===
          index
            ? clampGuide(
                value
              )
            : guide
      )
    );
  }

  function changeGuideY(
    index: number,
    value: number
  ) {
    onGuidesYChange(
      guidesY.map(
        (
          guide,
          guideIndex
        ) =>
          guideIndex ===
          index
            ? clampGuide(
                value
              )
            : guide
      )
    );
  }

  function removeGuideX(
    index: number
  ) {
    onGuidesXChange(
      guidesX.filter(
        (
          _,
          guideIndex
        ) =>
          guideIndex !==
          index
      )
    );
  }

  function removeGuideY(
    index: number
  ) {
    onGuidesYChange(
      guidesY.filter(
        (
          _,
          guideIndex
        ) =>
          guideIndex !==
          index
      )
    );
  }

  function createVerticalGuideFromRuler(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    const parent =
      event.currentTarget
        .parentElement;

    if (!parent) {
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    if (
      rect.width <=
      0
    ) {
      return;
    }

    const value =
      clampGuide(
        (
          event.clientX -
          rect.left
        ) /
          rect.width
      );

    onGuidesXChange([
      ...guidesX,
      value,
    ]);
  }

  function createHorizontalGuideFromRuler(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    const parent =
      event.currentTarget
        .parentElement;

    if (!parent) {
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    if (
      rect.height <=
      0
    ) {
      return;
    }

    const value =
      clampGuide(
        (
          event.clientY -
          rect.top
        ) /
          rect.height
      );

    onGuidesYChange([
      ...guidesY,
      value,
    ]);
  }

  function dragVerticalGuide(
    event:
      PointerEvent<HTMLDivElement>,
    index: number
  ) {
    const parent =
      event.currentTarget
        .parentElement;

    if (!parent) {
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    if (
      rect.width <=
      0
    ) {
      return;
    }

    const raw =
      (
        event.clientX -
        rect.left
      ) /
      rect.width;

    changeGuideX(
      index,
      raw
    );
  }

  function dragHorizontalGuide(
    event:
      PointerEvent<HTMLDivElement>,
    index: number
  ) {
    const parent =
      event.currentTarget
        .parentElement;

    if (!parent) {
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    if (
      rect.height <=
      0
    ) {
      return;
    }

    const raw =
      (
        event.clientY -
        rect.top
      ) /
      rect.height;

    changeGuideY(
      index,
      raw
    );
  }

  function finishVerticalGuideDrag(
    event:
      PointerEvent<HTMLDivElement>,
    index: number
  ) {
    const parent =
      event.currentTarget
        .parentElement;

    if (!parent) {
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    const outside =
      event.clientX <
        rect.left -
          20 ||
      event.clientX >
        rect.right +
          20 ||
      event.clientY <
        rect.top -
          20 ||
      event.clientY >
        rect.bottom +
          20;

    if (
      outside
    ) {
      removeGuideX(
        index
      );
    }
  }

  function finishHorizontalGuideDrag(
    event:
      PointerEvent<HTMLDivElement>,
    index: number
  ) {
    const parent =
      event.currentTarget
        .parentElement;

    if (!parent) {
      return;
    }

    const rect =
      parent.getBoundingClientRect();

    const outside =
      event.clientX <
        rect.left -
          20 ||
      event.clientX >
        rect.right +
          20 ||
      event.clientY <
        rect.top -
          20 ||
      event.clientY >
        rect.bottom +
          20;

    if (
      outside
    ) {
      removeGuideY(
        index
      );
    }
  }

  function selectionToMaskPolygon(
    layer: ImageLayer
  ) {
    if (!selection) {
      return null;
    }

    return selectionRegionToMaskPolygon(
      layer,
      {
        shape:
          selectionShape,

        rect:
          selection,

        path:
          selectionPath,
      }
    );
  }

  function createSelectionMaskForLayer(
    layer: ImageLayer,
    width: number,
    height: number
  ) {
    const activeRegions:
      SelectionRegion[] =
        selectionRegions.length >
          0
          ? selectionRegions
          : selection
            ? [
                {
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
                },
              ]
            : [];

    if (
      activeRegions.length ===
      0
    ) {
      return null;
    }

    const shapeCanvas =
      document.createElement(
        "canvas"
      );

    shapeCanvas.width =
      width;

    shapeCanvas.height =
      height;

    const shapeContext =
      shapeCanvas.getContext(
        "2d"
      );

    if (!shapeContext) {
      return null;
    }

    function fillPolygon(
      context:
        CanvasRenderingContext2D,
      polygon: {
        x: number;
        y: number;
      }[]
    ) {
      if (
        polygon.length <
        3
      ) {
        return;
      }

      context.beginPath();

      context.moveTo(
        polygon[0].x,
        polygon[0].y
      );

      for (
        let index = 1;
        index <
          polygon.length;
        index += 1
      ) {
        context.lineTo(
          polygon[index].x,
          polygon[index].y
        );
      }

      context.closePath();
      context.fill();
    }

    for (
      let index = 0;
      index <
        activeRegions.length;
      index += 1
    ) {
      const region =
        activeRegions[
          index
        ];

      const polygon =
        selectionRegionToMaskPolygon(
          layer,
          region
        );

      if (
        !polygon ||
        polygon.length <
          3
      ) {
        continue;
      }

      const regionCanvas =
        document.createElement(
          "canvas"
        );

      regionCanvas.width =
        width;

      regionCanvas.height =
        height;

      const regionContext =
        regionCanvas.getContext(
          "2d"
        );

      if (!regionContext) {
        continue;
      }

      regionContext.fillStyle =
        "#ffffff";

      fillPolygon(
        regionContext,
        polygon
      );

      shapeContext.save();

      if (
        index === 0 ||
        region.operation ===
          "add"
      ) {
        shapeContext.globalCompositeOperation =
          "source-over";
      } else if (
        region.operation ===
          "subtract"
      ) {
        shapeContext.globalCompositeOperation =
          "destination-out";
      } else {
        shapeContext.globalCompositeOperation =
          "destination-in";
      }

      shapeContext.drawImage(
        regionCanvas,
        0,
        0
      );

      shapeContext.restore();
    }

    if (
      selectionInverted
    ) {
      const inverted =
        document.createElement(
          "canvas"
        );

      inverted.width =
        width;

      inverted.height =
        height;

      const invertedContext =
        inverted.getContext(
          "2d"
        );

      if (invertedContext) {
        invertedContext.fillStyle =
          "#ffffff";

        invertedContext.fillRect(
          0,
          0,
          width,
          height
        );

        invertedContext.globalCompositeOperation =
          "destination-out";

        invertedContext.drawImage(
          shapeCanvas,
          0,
          0
        );

        shapeContext.clearRect(
          0,
          0,
          width,
          height
        );

        shapeContext.globalCompositeOperation =
          "source-over";

        shapeContext.drawImage(
          inverted,
          0,
          0
        );
      }
    }

    const featherPixels =
      Math.max(
        0,
        selectionFeather /
          Math.max(
            0.001,
            Math.abs(
              layer.scale
            )
          )
      );

    if (
      featherPixels <=
      0.01
    ) {
      return shapeCanvas;
    }

    const padding =
      Math.max(
        2,
        Math.ceil(
          featherPixels *
            3
        )
      );

    const padded =
      document.createElement(
        "canvas"
      );

    padded.width =
      width +
      padding *
        2;

    padded.height =
      height +
      padding *
        2;

    const paddedContext =
      padded.getContext(
        "2d"
      );

    if (!paddedContext) {
      return shapeCanvas;
    }

    paddedContext.drawImage(
      shapeCanvas,
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

    if (!blurredContext) {
      return shapeCanvas;
    }

    blurredContext.filter =
      `blur(${featherPixels}px)`;

    blurredContext.drawImage(
      padded,
      0,
      0
    );

    blurredContext.filter =
      "none";

    const result =
      document.createElement(
        "canvas"
      );

    result.width =
      width;

    result.height =
      height;

    const resultContext =
      result.getContext(
        "2d"
      );

    if (!resultContext) {
      return shapeCanvas;
    }

    resultContext.drawImage(
      blurred,
      padding,
      padding,
      width,
      height,
      0,
      0,
      width,
      height
    );

    return result;
  }

  function paintMaskSegment(
    layer: ImageLayer,
    point: {
      x: number;
      y: number;
    }
  ) {
    const maskCanvas =
      maskCanvasRef.current;

    if (!maskCanvas) {
      return;
    }

    const maskContext =
      maskCanvas.getContext(
        "2d"
      );

    if (!maskContext) {
      return;
    }

    const wantsVisible =
      maskBrushMode ===
      "reveal";

    const rawWhite =
      layer.maskInverted
        ? !wantsVisible
        : wantsVisible;

    const previous =
      lastMaskPointRef.current;

    const radius =
      Math.max(
        0.5,
        maskBrushSize / 2
      );

    /*
      When a marquee exists, paint this
      stroke onto a temporary canvas first.
      The selection mask is then applied to
      that stroke, including feathering.
    */

    const strokeCanvas =
      selection
        ? document.createElement(
            "canvas"
          )
        : maskCanvas;

    if (selection) {
      strokeCanvas.width =
        maskCanvas.width;

      strokeCanvas.height =
        maskCanvas.height;
    }

    const strokeContext =
      strokeCanvas.getContext(
        "2d"
      );

    if (!strokeContext) {
      return;
    }

    /*
      Preserve the non-null context type for
      the nested paintStamp function.
    */

    const paintContext =
      strokeContext;

    function paintStamp(
      x: number,
      y: number
    ) {
      stampMaskBrush(
        paintContext,
        x,
        y,
        radius,
        rawWhite,
        maskBrushHardness,
        maskBrushOpacity
      );
    }

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          1,
          maskBrushSize *
            0.12
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintStamp(
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintStamp(
        point.x,
        point.y
      );
    }

    if (selection) {
      const selectionMask =
        createSelectionMaskForLayer(
          layer,
          maskCanvas.width,
          maskCanvas.height
        );

      if (selectionMask) {
        strokeContext.save();

        strokeContext.globalCompositeOperation =
          "destination-in";

        strokeContext.drawImage(
          selectionMask,
          0,
          0
        );

        strokeContext.restore();
      }

      /*
        Composite the selection-limited
        stroke back onto the real mask.
      */

      maskContext.drawImage(
        strokeCanvas,
        0,
        0
      );
    }

    lastMaskPointRef.current =
      point;

    emitMaskPreview(
      layer.id,
      false
    );
  }

  function emitMaskPreview(
    layerId: string,
    force: boolean
  ) {
    const maskCanvas =
      maskCanvasRef.current;

    if (!maskCanvas) {
      return;
    }

    const now =
      performance.now();

    /*
      Updating a full PNG on every pointer
      event is expensive. Throttle live
      updates, then force one final update
      when the stroke ends.
    */

    if (
      !force &&
      now -
        lastMaskEmitRef.current <
        35
    ) {
      return;
    }

    lastMaskEmitRef.current =
      now;

    onMaskChange(
      layerId,
      maskCanvas.toDataURL(
        "image/png"
      )
    );
  }

  async function startMaskStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "brush" ||
      !selectedLayer ||
      selectedLayer.locked ||
      !selectedLayer.maskSrc ||
      !(selectedLayer.maskEnabled ?? true)
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onMaskStrokeStart();

    const maskImage =
      await loadImage(
        selectedLayer.maskSrc
      );

    const maskCanvas =
      document.createElement(
        "canvas"
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    maskCanvas.width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    maskCanvas.height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const context =
      maskCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.drawImage(
      maskImage,
      0,
      0,
      maskCanvas.width,
      maskCanvas.height
    );

    maskCanvasRef.current =
      maskCanvas;

    maskStrokeLayerIdRef.current =
      selectedLayer.id;

    lastMaskPointRef.current =
      null;

    lastMaskEmitRef.current =
      0;

    setPaintingMask(
      true
    );

    paintMaskSegment(
      selectedLayer,
      point
    );
  }

  function moveMaskStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updateBrushCursor(
      event.clientX,
      event.clientY
    );

    if (
      !paintingMask ||
      !selectedLayer ||
      selectedLayer.id !==
        maskStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastMaskPointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintMaskSegment(
      selectedLayer,
      point
    );
  }

  function endMaskStroke() {
    if (!paintingMask) {
      return;
    }

    emitMaskPreview(
      maskStrokeLayerIdRef.current,
      true
    );

    setPaintingMask(
      false
    );

    maskCanvasRef.current =
      null;

    lastMaskPointRef.current =
      null;

    maskStrokeLayerIdRef.current =
      "";
  }

  /*
    SPOT HEAL TOOL

    The working layer is copied at stroke start.
    Every brush stamp samples a nearby patch from
    that original snapshot, then blends the patch
    through a soft circular mask.
  */

  function emitHealPreview(
    layerId: string,
    force = false
  ) {
    const healCanvas =
      healCanvasRef.current;

    if (
      !healCanvas ||
      !layerId
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      !force &&
      now -
        lastHealEmitRef.current <
        45
    ) {
      return;
    }

    lastHealEmitRef.current =
      now;

    onLayerSourceChange(
      layerId,
      healCanvas.toDataURL(
        "image/png"
      )
    );
  }

  function paintHealStamp(
    layer: ImageLayer,
    x: number,
    y: number
  ) {
    const healCanvas =
      healCanvasRef.current;

    const sourceCanvas =
      healSourceCanvasRef.current;

    if (
      !healCanvas ||
      !sourceCanvas
    ) {
      return;
    }

    const context =
      healCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        healBrushSize /
          2
      );

    const diameter =
      Math.max(
        2,
        Math.ceil(
          radius *
          2
        )
      );

    /*
      Automatically choose a nearby sample area.
      Prefer upper-right; fall back to lower-left
      near image boundaries.
    */

    const sampleDistance =
      radius *
      2.2;

    let sampleCenterX =
      x +
      sampleDistance;

    let sampleCenterY =
      y -
      sampleDistance;

    if (
      sampleCenterX +
        radius >
      sourceCanvas.width
    ) {
      sampleCenterX =
        x -
        sampleDistance;
    }

    if (
      sampleCenterY -
        radius <
      0
    ) {
      sampleCenterY =
        y +
        sampleDistance;
    }

    sampleCenterX =
      Math.max(
        radius,
        Math.min(
          sourceCanvas.width -
            radius,
          sampleCenterX
        )
      );

    sampleCenterY =
      Math.max(
        radius,
        Math.min(
          sourceCanvas.height -
            radius,
          sampleCenterY
        )
      );

    const stamp =
      document.createElement(
        "canvas"
      );

    stamp.width =
      diameter;

    stamp.height =
      diameter;

    const stampContext =
      stamp.getContext(
        "2d"
      );

    if (!stampContext) {
      return;
    }

    stampContext.drawImage(
      sourceCanvas,
      sampleCenterX -
        radius,
      sampleCenterY -
        radius,
      radius *
        2,
      radius *
        2,
      0,
      0,
      diameter,
      diameter
    );

    /*
      Soft circular alpha mask.
      Hardness 100 = almost hard edge.
      Hardness 0 = very soft transition.
    */

    const mask =
      document.createElement(
        "canvas"
      );

    mask.width =
      diameter;

    mask.height =
      diameter;

    const maskContext =
      mask.getContext(
        "2d"
      );

    if (!maskContext) {
      return;
    }

    const center =
      diameter /
      2;

    const outer =
      diameter /
      2;

    const inner =
      outer *
      Math.min(
        0.98,
        Math.max(
          0,
          healBrushHardness /
            100
        )
      );

    const gradient =
      maskContext.createRadialGradient(
        center,
        center,
        inner,
        center,
        center,
        outer
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    maskContext.fillStyle =
      gradient;

    maskContext.fillRect(
      0,
      0,
      diameter,
      diameter
    );

    stampContext.globalCompositeOperation =
      "destination-in";

    stampContext.drawImage(
      mask,
      0,
      0
    );

    stampContext.globalCompositeOperation =
      "source-over";

    /*
      Draw to a full layer-sized temporary canvas
      when a selection exists so healing respects
      rectangle, ellipse, freehand and polygonal
      selection boundaries.
    */

    if (selection) {
      const stroke =
        document.createElement(
          "canvas"
        );

      stroke.width =
        healCanvas.width;

      stroke.height =
        healCanvas.height;

      const strokeContext =
        stroke.getContext(
          "2d"
        );

      if (!strokeContext) {
        return;
      }

      strokeContext.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      const selectionMask =
        createSelectionMaskForLayer(
          layer,
          healCanvas.width,
          healCanvas.height
        );

      if (
        selectionMask
      ) {
        strokeContext.globalCompositeOperation =
          "destination-in";

        strokeContext.drawImage(
          selectionMask,
          0,
          0,
          healCanvas.width,
          healCanvas.height
        );

        strokeContext.globalCompositeOperation =
          "source-over";
      }

      context.save();

      context.globalAlpha =
        Math.max(
          0.01,
          Math.min(
            1,
            healBrushOpacity /
              100
          )
        );

      context.drawImage(
        stroke,
        0,
        0
      );

      context.restore();
    } else {
      context.save();

      context.globalAlpha =
        Math.max(
          0.01,
          Math.min(
            1,
            healBrushOpacity /
              100
          )
        );

      context.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      context.restore();
    }
  }

  function paintHealSegment(
    layer: ImageLayer,
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastHealPointRef.current;

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          1,
          healBrushSize *
            0.18
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintHealStamp(
          layer,
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintHealStamp(
        layer,
        point.x,
        point.y
      );
    }

    lastHealPointRef.current =
      point;

    emitHealPreview(
      layer.id
    );
  }

  async function startHealStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "heal" ||
      !selectedLayer ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onHealStrokeStart();

    const sourceImage =
      await loadImage(
        selectedLayer.src
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    const width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const healCanvas =
      document.createElement(
        "canvas"
      );

    healCanvas.width =
      width;

    healCanvas.height =
      height;

    const healContext =
      healCanvas.getContext(
        "2d"
      );

    if (!healContext) {
      return;
    }

    healContext.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    const sourceCanvas =
      document.createElement(
        "canvas"
      );

    sourceCanvas.width =
      width;

    sourceCanvas.height =
      height;

    const sourceContext =
      sourceCanvas.getContext(
        "2d"
      );

    if (!sourceContext) {
      return;
    }

    sourceContext.drawImage(
      healCanvas,
      0,
      0
    );

    healCanvasRef.current =
      healCanvas;

    healSourceCanvasRef.current =
      sourceCanvas;

    healStrokeLayerIdRef.current =
      selectedLayer.id;

    lastHealPointRef.current =
      null;

    lastHealEmitRef.current =
      0;

    setHealing(
      true
    );

    paintHealSegment(
      selectedLayer,
      point
    );
  }

  function moveHealStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updateHealCursor(
      event.clientX,
      event.clientY
    );

    if (
      !healing ||
      !selectedLayer ||
      selectedLayer.id !==
        healStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastHealPointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintHealSegment(
      selectedLayer,
      point
    );
  }

  function endHealStroke() {
    if (!healing) {
      return;
    }

    emitHealPreview(
      healStrokeLayerIdRef.current,
      true
    );

    setHealing(
      false
    );

    healCanvasRef.current =
      null;

    healSourceCanvasRef.current =
      null;

    lastHealPointRef.current =
      null;

    healStrokeLayerIdRef.current =
      "";
  }

  /*
    CLONE STAMP TOOL

    Alt+Click sets a source point.
    At the beginning of each stroke, the current
    image becomes the immutable source snapshot.
    The source-to-destination offset remains fixed
    for the whole stroke, like a standard clone tool.
  */

  function emitClonePreview(
    layerId: string,
    force = false
  ) {
    const cloneCanvas =
      cloneCanvasRef.current;

    if (
      !cloneCanvas ||
      !layerId
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      !force &&
      now -
        lastCloneEmitRef.current <
        45
    ) {
      return;
    }

    lastCloneEmitRef.current =
      now;

    onLayerSourceChange(
      layerId,
      cloneCanvas.toDataURL(
        "image/png"
      )
    );
  }

  function paintCloneStamp(
    layer: ImageLayer,
    x: number,
    y: number
  ) {
    const targetCanvas =
      cloneCanvasRef.current;

    const sourceCanvas =
      cloneSourceCanvasRef.current;

    const offset =
      cloneOffsetRef.current;

    if (
      !targetCanvas ||
      !sourceCanvas ||
      !offset
    ) {
      return;
    }

    const context =
      targetCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        cloneBrushSize /
          2
      );

    const diameter =
      Math.max(
        2,
        Math.ceil(
          radius *
          2
        )
      );

    const sourceX =
      x +
      offset.x;

    const sourceY =
      y +
      offset.y;

    const stamp =
      document.createElement(
        "canvas"
      );

    stamp.width =
      diameter;

    stamp.height =
      diameter;

    const stampContext =
      stamp.getContext(
        "2d"
      );

    if (!stampContext) {
      return;
    }

    stampContext.drawImage(
      sourceCanvas,
      sourceX -
        radius,
      sourceY -
        radius,
      radius *
        2,
      radius *
        2,
      0,
      0,
      diameter,
      diameter
    );

    const mask =
      document.createElement(
        "canvas"
      );

    mask.width =
      diameter;

    mask.height =
      diameter;

    const maskContext =
      mask.getContext(
        "2d"
      );

    if (!maskContext) {
      return;
    }

    const center =
      diameter /
      2;

    const outer =
      diameter /
      2;

    const inner =
      outer *
      Math.min(
        0.98,
        Math.max(
          0,
          cloneBrushHardness /
            100
        )
      );

    const gradient =
      maskContext.createRadialGradient(
        center,
        center,
        inner,
        center,
        center,
        outer
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    maskContext.fillStyle =
      gradient;

    maskContext.fillRect(
      0,
      0,
      diameter,
      diameter
    );

    stampContext.globalCompositeOperation =
      "destination-in";

    stampContext.drawImage(
      mask,
      0,
      0
    );

    stampContext.globalCompositeOperation =
      "source-over";

    const opacity =
      Math.max(
        0.01,
        Math.min(
          1,
          cloneBrushOpacity /
            100
        )
      );

    if (selection) {
      const stroke =
        document.createElement(
          "canvas"
        );

      stroke.width =
        targetCanvas.width;

      stroke.height =
        targetCanvas.height;

      const strokeContext =
        stroke.getContext(
          "2d"
        );

      if (!strokeContext) {
        return;
      }

      strokeContext.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      const selectionMask =
        createSelectionMaskForLayer(
          layer,
          targetCanvas.width,
          targetCanvas.height
        );

      if (
        selectionMask
      ) {
        strokeContext.globalCompositeOperation =
          "destination-in";

        strokeContext.drawImage(
          selectionMask,
          0,
          0,
          targetCanvas.width,
          targetCanvas.height
        );

        strokeContext.globalCompositeOperation =
          "source-over";
      }

      context.save();

      context.globalAlpha =
        opacity;

      context.drawImage(
        stroke,
        0,
        0
      );

      context.restore();
    } else {
      context.save();

      context.globalAlpha =
        opacity;

      context.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      context.restore();
    }
  }

  function paintCloneSegment(
    layer: ImageLayer,
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastClonePointRef.current;

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          1,
          cloneBrushSize *
            0.18
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintCloneStamp(
          layer,
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintCloneStamp(
        layer,
        point.x,
        point.y
      );
    }

    lastClonePointRef.current =
      point;

    emitClonePreview(
      layer.id
    );
  }

  async function startCloneStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "clone" ||
      !selectedLayer ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    /*
      Alt+Click = choose source only.
    */

    if (
      event.altKey
    ) {
      onCloneSampleChange({
        layerId:
          selectedLayer.id,

        x:
          point.x,

        y:
          point.y,
      });

      return;
    }

    if (
      !cloneSample ||
      cloneSample.layerId !==
        selectedLayer.id
    ) {
      return;
    }

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onCloneStrokeStart();

    const sourceImage =
      await loadImage(
        selectedLayer.src
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    const width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const targetCanvas =
      document.createElement(
        "canvas"
      );

    targetCanvas.width =
      width;

    targetCanvas.height =
      height;

    const targetContext =
      targetCanvas.getContext(
        "2d"
      );

    if (!targetContext) {
      return;
    }

    targetContext.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    const sourceCanvas =
      document.createElement(
        "canvas"
      );

    sourceCanvas.width =
      width;

    sourceCanvas.height =
      height;

    const sourceContext =
      sourceCanvas.getContext(
        "2d"
      );

    if (!sourceContext) {
      return;
    }

    sourceContext.drawImage(
      targetCanvas,
      0,
      0
    );

    cloneCanvasRef.current =
      targetCanvas;

    cloneSourceCanvasRef.current =
      sourceCanvas;

    cloneStrokeLayerIdRef.current =
      selectedLayer.id;

    cloneOffsetRef.current = {
      x:
        cloneSample.x -
        point.x,

      y:
        cloneSample.y -
        point.y,
    };

    lastClonePointRef.current =
      null;

    lastCloneEmitRef.current =
      0;

    setCloning(
      true
    );

    paintCloneSegment(
      selectedLayer,
      point
    );
  }

  function moveCloneStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updateCloneCursor(
      event.clientX,
      event.clientY
    );

    if (
      !cloning ||
      !selectedLayer ||
      selectedLayer.id !==
        cloneStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastClonePointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintCloneSegment(
      selectedLayer,
      point
    );
  }

  function endCloneStroke() {
    if (!cloning) {
      return;
    }

    emitClonePreview(
      cloneStrokeLayerIdRef.current,
      true
    );

    setCloning(
      false
    );

    cloneCanvasRef.current =
      null;

    cloneSourceCanvasRef.current =
      null;

    cloneOffsetRef.current =
      null;

    lastClonePointRef.current =
      null;

    cloneStrokeLayerIdRef.current =
      "";
  }

  /*
    RASTER ERASER TOOL

    Each stroke works on a temporary copy of the
    selected raster layer and emits PNG updates.
  */

  function emitEraserPreview(
    layerId: string,
    force = false
  ) {
    const workingCanvas =
      eraserCanvasRef.current;

    if (
      !workingCanvas ||
      !layerId
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      !force &&
      now -
        lastEraserEmitRef.current <
        45
    ) {
      return;
    }

    lastEraserEmitRef.current =
      now;

    onLayerSourceChange(
      layerId,
      workingCanvas.toDataURL(
        "image/png"
      )
    );
  }

  function paintEraserStamp(
    layer: ImageLayer,
    x: number,
    y: number
  ) {
    const workingCanvas =
      eraserCanvasRef.current;

    if (!workingCanvas) {
      return;
    }

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        eraserBrushSize /
          2
      );

    const diameter =
      Math.max(
        2,
        Math.ceil(
          radius *
          2
        )
      );

    const stamp =
      document.createElement(
        "canvas"
      );

    stamp.width =
      diameter;

    stamp.height =
      diameter;

    const stampContext =
      stamp.getContext(
        "2d"
      );

    if (!stampContext) {
      return;
    }

    const center =
      diameter /
      2;

    const outer =
      diameter /
      2;

    const inner =
      outer *
      Math.min(
        0.98,
        Math.max(
          0,
          eraserBrushHardness /
            100
        )
      );

    const gradient =
      stampContext.createRadialGradient(
        center,
        center,
        inner,
        center,
        center,
        outer
      );

    gradient.addColorStop(
      0,
      `rgba(255,255,255,${
        Math.max(
          0.01,
          Math.min(
            1,
            eraserBrushOpacity /
              100
          )
        )
      })`
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    stampContext.fillStyle =
      gradient;

    stampContext.fillRect(
      0,
      0,
      diameter,
      diameter
    );

    if (selection) {
      const stroke =
        document.createElement(
          "canvas"
        );

      stroke.width =
        workingCanvas.width;

      stroke.height =
        workingCanvas.height;

      const strokeContext =
        stroke.getContext(
          "2d"
        );

      if (!strokeContext) {
        return;
      }

      strokeContext.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      const selectionMask =
        createSelectionMaskForLayer(
          layer,
          workingCanvas.width,
          workingCanvas.height
        );

      if (selectionMask) {
        strokeContext.globalCompositeOperation =
          "destination-in";

        strokeContext.drawImage(
          selectionMask,
          0,
          0,
          workingCanvas.width,
          workingCanvas.height
        );
      }

      context.save();

      context.globalCompositeOperation =
        "destination-out";

      context.drawImage(
        stroke,
        0,
        0
      );

      context.restore();
    } else {
      context.save();

      context.globalCompositeOperation =
        "destination-out";

      context.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      context.restore();
    }
  }

  function paintEraserSegment(
    layer: ImageLayer,
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastEraserPointRef.current;

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          1,
          eraserBrushSize *
            0.18
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintEraserStamp(
          layer,
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintEraserStamp(
        layer,
        point.x,
        point.y
      );
    }

    lastEraserPointRef.current =
      point;

    emitEraserPreview(
      layer.id
    );
  }

  async function startEraserStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "eraser" ||
      !selectedLayer ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onEraserStrokeStart();

    const sourceImage =
      await loadImage(
        selectedLayer.src
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    const width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const workingCanvas =
      document.createElement(
        "canvas"
      );

    workingCanvas.width =
      width;

    workingCanvas.height =
      height;

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    eraserCanvasRef.current =
      workingCanvas;

    eraserStrokeLayerIdRef.current =
      selectedLayer.id;

    lastEraserPointRef.current =
      null;

    lastEraserEmitRef.current =
      0;

    setErasing(
      true
    );

    paintEraserSegment(
      selectedLayer,
      point
    );
  }

  function moveEraserStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updateEraserCursor(
      event.clientX,
      event.clientY
    );

    if (
      !erasing ||
      !selectedLayer ||
      selectedLayer.id !==
        eraserStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastEraserPointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintEraserSegment(
      selectedLayer,
      point
    );
  }

  function endEraserStroke() {
    if (!erasing) {
      return;
    }

    emitEraserPreview(
      eraserStrokeLayerIdRef.current,
      true
    );

    setErasing(
      false
    );

    eraserCanvasRef.current =
      null;

    lastEraserPointRef.current =
      null;

    eraserStrokeLayerIdRef.current =
      "";
  }

  /*
    DODGE & BURN TOOL

    Edits the selected raster layer directly.
    Brush influence is weighted by luminance so
    Shadows / Midtones / Highlights behave like
    tonal-range retouch controls.
  */

  function emitDodgeBurnPreview(
    layerId: string,
    force = false
  ) {
    const workingCanvas =
      dodgeBurnCanvasRef.current;

    if (
      !workingCanvas ||
      !layerId
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      !force &&
      now -
        lastDodgeBurnEmitRef.current <
        45
    ) {
      return;
    }

    lastDodgeBurnEmitRef.current =
      now;

    onLayerSourceChange(
      layerId,
      workingCanvas.toDataURL(
        "image/png"
      )
    );
  }

  function smoothStep(
    edge0: number,
    edge1: number,
    value: number
  ) {
    const amount =
      Math.max(
        0,
        Math.min(
          1,
          (
            value -
            edge0
          ) /
          Math.max(
            0.0001,
            edge1 -
            edge0
          )
        )
      );

    return (
      amount *
      amount *
      (
        3 -
        2 *
        amount
      )
    );
  }

  function tonalWeight(
    luminance: number
  ) {
    if (
      dodgeBurnRange ===
      "shadows"
    ) {
      return (
        1 -
        smoothStep(
          0.15,
          0.68,
          luminance
        )
      );
    }

    if (
      dodgeBurnRange ===
      "highlights"
    ) {
      return smoothStep(
        0.32,
        0.85,
        luminance
      );
    }

    /*
      Midtones peak around 50% luminance.
    */

    return Math.max(
      0,
      1 -
      Math.abs(
        luminance -
        0.5
      ) *
      2.2
    );
  }

  function paintDodgeBurnStamp(
    x: number,
    y: number
  ) {
    const workingCanvas =
      dodgeBurnCanvasRef.current;

    if (!workingCanvas) {
      return;
    }

    const context =
      workingCanvas.getContext(
        "2d",
        {
          willReadFrequently:
            true,
        }
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        dodgeBurnBrushSize /
          2
      );

    const left =
      Math.max(
        0,
        Math.floor(
          x -
          radius
        )
      );

    const top =
      Math.max(
        0,
        Math.floor(
          y -
          radius
        )
      );

    const right =
      Math.min(
        workingCanvas.width,
        Math.ceil(
          x +
          radius
        )
      );

    const bottom =
      Math.min(
        workingCanvas.height,
        Math.ceil(
          y +
          radius
        )
      );

    const width =
      right -
      left;

    const height =
      bottom -
      top;

    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    const imageData =
      context.getImageData(
        left,
        top,
        width,
        height
      );

    let selectionData:
      ImageData | null =
        null;

    const selectionMask =
      dodgeBurnSelectionMaskRef.current;

    if (
      selectionMask
    ) {
      const selectionContext =
        selectionMask.getContext(
          "2d",
          {
            willReadFrequently:
              true,
          }
        );

      if (
        selectionContext
      ) {
        selectionData =
          selectionContext.getImageData(
            left,
            top,
            width,
            height
          );
      }
    }

    const data =
      imageData.data;

    const selectionPixels =
      selectionData?.data;

    const hardness =
      Math.max(
        0,
        Math.min(
          1,
          dodgeBurnBrushHardness /
            100
        )
      );

    const innerRadius =
      radius *
      Math.min(
        0.98,
        hardness
      );

    const exposure =
      Math.max(
        0.01,
        Math.min(
          1,
          dodgeBurnExposure /
            100
        )
      );

    for (
      let py = 0;
      py < height;
      py += 1
    ) {
      for (
        let px = 0;
        px < width;
        px += 1
      ) {
        const canvasX =
          left +
          px +
          0.5;

        const canvasY =
          top +
          py +
          0.5;

        const distance =
          Math.hypot(
            canvasX -
              x,
            canvasY -
              y
          );

        if (
          distance >
          radius
        ) {
          continue;
        }

        let brushAlpha =
          1;

        if (
          distance >
          innerRadius
        ) {
          brushAlpha =
            1 -
            (
              distance -
              innerRadius
            ) /
            Math.max(
              0.0001,
              radius -
                innerRadius
            );

          brushAlpha =
            Math.max(
              0,
              Math.min(
                1,
                brushAlpha
              )
            );

          brushAlpha =
            brushAlpha *
            brushAlpha *
            (
              3 -
              2 *
              brushAlpha
            );
        }

        const index =
          (
            py *
            width +
            px
          ) *
          4;

        if (
          data[
            index + 3
          ] ===
          0
        ) {
          continue;
        }

        if (
          selectionPixels
        ) {
          brushAlpha *=
            selectionPixels[
              index + 3
            ] /
            255;
        }

        if (
          brushAlpha <=
          0
        ) {
          continue;
        }

        const red =
          data[index];

        const green =
          data[
            index + 1
          ];

        const blue =
          data[
            index + 2
          ];

        const luminance =
          (
            red *
              0.2126 +
            green *
              0.7152 +
            blue *
              0.0722
          ) /
          255;

        const rangeWeight =
          tonalWeight(
            luminance
          );

        const amount =
          exposure *
          brushAlpha *
          rangeWeight *
          0.20;

        if (
          amount <=
          0
        ) {
          continue;
        }

        if (
          dodgeBurnMode ===
          "dodge"
        ) {
          data[index] =
            Math.round(
              red +
              (
                255 -
                red
              ) *
              amount
            );

          data[
            index + 1
          ] =
            Math.round(
              green +
              (
                255 -
                green
              ) *
              amount
            );

          data[
            index + 2
          ] =
            Math.round(
              blue +
              (
                255 -
                blue
              ) *
              amount
            );
        } else {
          const factor =
            Math.max(
              0,
              1 -
              amount
            );

          data[index] =
            Math.round(
              red *
              factor
            );

          data[
            index + 1
          ] =
            Math.round(
              green *
              factor
            );

          data[
            index + 2
          ] =
            Math.round(
              blue *
              factor
            );
        }
      }
    }

    context.putImageData(
      imageData,
      left,
      top
    );
  }

  function paintDodgeBurnSegment(
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastDodgeBurnPointRef.current;

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          1,
          dodgeBurnBrushSize *
            0.16
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintDodgeBurnStamp(
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintDodgeBurnStamp(
        point.x,
        point.y
      );
    }

    lastDodgeBurnPointRef.current =
      point;

    emitDodgeBurnPreview(
      dodgeBurnStrokeLayerIdRef.current
    );
  }

  async function startDodgeBurnStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "dodge-burn" ||
      !selectedLayer ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onDodgeBurnStrokeStart();

    const sourceImage =
      await loadImage(
        selectedLayer.src
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    const width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const workingCanvas =
      document.createElement(
        "canvas"
      );

    workingCanvas.width =
      width;

    workingCanvas.height =
      height;

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    dodgeBurnCanvasRef.current =
      workingCanvas;

    dodgeBurnSelectionMaskRef.current =
      selection
        ? createSelectionMaskForLayer(
            selectedLayer,
            width,
            height
          )
        : null;

    dodgeBurnStrokeLayerIdRef.current =
      selectedLayer.id;

    lastDodgeBurnPointRef.current =
      null;

    lastDodgeBurnEmitRef.current =
      0;

    setDodgeBurnPainting(
      true
    );

    paintDodgeBurnSegment(
      point
    );
  }

  function moveDodgeBurnStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updateDodgeBurnCursor(
      event.clientX,
      event.clientY
    );

    if (
      !dodgeBurnPainting ||
      !selectedLayer ||
      selectedLayer.id !==
        dodgeBurnStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastDodgeBurnPointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintDodgeBurnSegment(
      point
    );
  }

  function endDodgeBurnStroke() {
    if (
      !dodgeBurnPainting
    ) {
      return;
    }

    emitDodgeBurnPreview(
      dodgeBurnStrokeLayerIdRef.current,
      true
    );

    setDodgeBurnPainting(
      false
    );

    dodgeBurnCanvasRef.current =
      null;

    dodgeBurnSelectionMaskRef.current =
      null;

    lastDodgeBurnPointRef.current =
      null;

    dodgeBurnStrokeLayerIdRef.current =
      "";
  }

  /*
    BLUR / SHARPEN TOOL

    Uses a compact 3x3 neighborhood filter inside
    each brush stamp. Blur mixes toward the local
    average. Sharpen pushes away from that average.
  */

  function emitBlurSharpenPreview(
    layerId: string,
    force = false
  ) {
    const workingCanvas =
      blurSharpenCanvasRef.current;

    if (
      !workingCanvas ||
      !layerId
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      !force &&
      now -
        lastBlurSharpenEmitRef.current <
        45
    ) {
      return;
    }

    lastBlurSharpenEmitRef.current =
      now;

    onLayerSourceChange(
      layerId,
      workingCanvas.toDataURL(
        "image/png"
      )
    );
  }

  function paintSmudgeStamp(
    sourceX: number,
    sourceY: number,
    destinationX: number,
    destinationY: number
  ) {
    const workingCanvas =
      blurSharpenCanvasRef.current;

    if (!workingCanvas) {
      return;
    }

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        blurSharpenBrushSize /
          2
      );

    const diameter =
      Math.max(
        2,
        Math.ceil(
          radius *
          2
        )
      );

    /*
      Snapshot the source patch first. This prevents
      drawImage from reading pixels while the same
      canvas is being modified.
    */

    const patch =
      document.createElement(
        "canvas"
      );

    patch.width =
      diameter;

    patch.height =
      diameter;

    const patchContext =
      patch.getContext(
        "2d"
      );

    if (!patchContext) {
      return;
    }

    patchContext.drawImage(
      workingCanvas,
      sourceX -
        radius,
      sourceY -
        radius,
      radius *
        2,
      radius *
        2,
      0,
      0,
      diameter,
      diameter
    );

    const mask =
      document.createElement(
        "canvas"
      );

    mask.width =
      diameter;

    mask.height =
      diameter;

    const maskContext =
      mask.getContext(
        "2d"
      );

    if (!maskContext) {
      return;
    }

    const center =
      diameter /
      2;

    const outer =
      diameter /
      2;

    const inner =
      outer *
      Math.min(
        0.98,
        Math.max(
          0,
          blurSharpenBrushHardness /
            100
        )
      );

    const gradient =
      maskContext.createRadialGradient(
        center,
        center,
        inner,
        center,
        center,
        outer
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    maskContext.fillStyle =
      gradient;

    maskContext.fillRect(
      0,
      0,
      diameter,
      diameter
    );

    patchContext.globalCompositeOperation =
      "destination-in";

    patchContext.drawImage(
      mask,
      0,
      0
    );

    patchContext.globalCompositeOperation =
      "source-over";

    const strength =
      Math.max(
        0.01,
        Math.min(
          1,
          blurSharpenStrength /
            100
        )
      );

    /*
      If a selection exists, build a full-size
      temporary stroke and clip it to the selection.
    */

    if (
      blurSharpenSelectionMaskRef.current
    ) {
      const stroke =
        document.createElement(
          "canvas"
        );

      stroke.width =
        workingCanvas.width;

      stroke.height =
        workingCanvas.height;

      const strokeContext =
        stroke.getContext(
          "2d"
        );

      if (!strokeContext) {
        return;
      }

      strokeContext.drawImage(
        patch,
        destinationX -
          radius,
        destinationY -
          radius,
        radius *
          2,
        radius *
          2
      );

      strokeContext.globalCompositeOperation =
        "destination-in";

      strokeContext.drawImage(
        blurSharpenSelectionMaskRef.current,
        0,
        0,
        workingCanvas.width,
        workingCanvas.height
      );

      strokeContext.globalCompositeOperation =
        "source-over";

      context.save();

      context.globalAlpha =
        strength;

      context.drawImage(
        stroke,
        0,
        0
      );

      context.restore();
    } else {
      context.save();

      context.globalAlpha =
        strength;

      context.drawImage(
        patch,
        destinationX -
          radius,
        destinationY -
          radius,
        radius *
          2,
        radius *
          2
      );

      context.restore();
    }
  }

  function paintBlurSharpenStamp(
    x: number,
    y: number
  ) {
    const workingCanvas =
      blurSharpenCanvasRef.current;

    if (!workingCanvas) {
      return;
    }

    const context =
      workingCanvas.getContext(
        "2d",
        {
          willReadFrequently:
            true,
        }
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        blurSharpenBrushSize /
          2
      );

    /*
      Read an extra one-pixel border so every pixel
      in the actual brush area can sample 3x3 neighbors.
    */

    const readLeft =
      Math.max(
        0,
        Math.floor(
          x -
          radius
        ) -
          1
      );

    const readTop =
      Math.max(
        0,
        Math.floor(
          y -
          radius
        ) -
          1
      );

    const readRight =
      Math.min(
        workingCanvas.width,
        Math.ceil(
          x +
          radius
        ) +
          1
      );

    const readBottom =
      Math.min(
        workingCanvas.height,
        Math.ceil(
          y +
          radius
        ) +
          1
      );

    const readWidth =
      readRight -
      readLeft;

    const readHeight =
      readBottom -
      readTop;

    if (
      readWidth <= 2 ||
      readHeight <= 2
    ) {
      return;
    }

    const source =
      context.getImageData(
        readLeft,
        readTop,
        readWidth,
        readHeight
      );

    const output =
      new ImageData(
        new Uint8ClampedArray(
          source.data
        ),
        readWidth,
        readHeight
      );

    let selectionData:
      ImageData | null =
        null;

    const selectionMask =
      blurSharpenSelectionMaskRef.current;

    if (selectionMask) {
      const selectionContext =
        selectionMask.getContext(
          "2d",
          {
            willReadFrequently:
              true,
          }
        );

      if (selectionContext) {
        selectionData =
          selectionContext.getImageData(
            readLeft,
            readTop,
            readWidth,
            readHeight
          );
      }
    }

    const src =
      source.data;

    const dst =
      output.data;

    const selectedPixels =
      selectionData?.data;

    const hardness =
      Math.max(
        0,
        Math.min(
          1,
          blurSharpenBrushHardness /
            100
        )
      );

    const innerRadius =
      radius *
      Math.min(
        0.98,
        hardness
      );

    const strength =
      Math.max(
        0.01,
        Math.min(
          1,
          blurSharpenStrength /
            100
        )
      );

    for (
      let py = 1;
      py <
        readHeight -
          1;
      py += 1
    ) {
      for (
        let px = 1;
        px <
          readWidth -
            1;
        px += 1
      ) {
        const canvasX =
          readLeft +
          px +
          0.5;

        const canvasY =
          readTop +
          py +
          0.5;

        const distance =
          Math.hypot(
            canvasX -
              x,
            canvasY -
              y
          );

        if (
          distance >
          radius
        ) {
          continue;
        }

        let brushAlpha =
          1;

        if (
          distance >
          innerRadius
        ) {
          brushAlpha =
            1 -
            (
              distance -
              innerRadius
            ) /
            Math.max(
              0.0001,
              radius -
                innerRadius
            );

          brushAlpha =
            Math.max(
              0,
              Math.min(
                1,
                brushAlpha
              )
            );

          brushAlpha =
            brushAlpha *
            brushAlpha *
            (
              3 -
              2 *
              brushAlpha
            );
        }

        const index =
          (
            py *
            readWidth +
            px
          ) *
          4;

        if (
          src[
            index + 3
          ] ===
          0
        ) {
          continue;
        }

        if (
          selectedPixels
        ) {
          brushAlpha *=
            selectedPixels[
              index + 3
            ] /
            255;
        }

        if (
          brushAlpha <=
          0
        ) {
          continue;
        }

        let averageRed =
          0;

        let averageGreen =
          0;

        let averageBlue =
          0;

        let count =
          0;

        for (
          let offsetY = -1;
          offsetY <= 1;
          offsetY += 1
        ) {
          for (
            let offsetX = -1;
            offsetX <= 1;
            offsetX += 1
          ) {
            const neighborIndex =
              (
                (
                  py +
                  offsetY
                ) *
                  readWidth +
                (
                  px +
                  offsetX
                )
              ) *
              4;

            if (
              src[
                neighborIndex +
                  3
              ] ===
              0
            ) {
              continue;
            }

            averageRed +=
              src[
                neighborIndex
              ];

            averageGreen +=
              src[
                neighborIndex +
                  1
              ];

            averageBlue +=
              src[
                neighborIndex +
                  2
              ];

            count +=
              1;
          }
        }

        if (
          count <=
          0
        ) {
          continue;
        }

        averageRed /=
          count;

        averageGreen /=
          count;

        averageBlue /=
          count;

        const red =
          src[index];

        const green =
          src[
            index + 1
          ];

        const blue =
          src[
            index + 2
          ];

        if (
          blurSharpenMode ===
          "blur"
        ) {
          const amount =
            strength *
            brushAlpha *
            0.45;

          dst[index] =
            Math.round(
              red +
              (
                averageRed -
                red
              ) *
              amount
            );

          dst[
            index + 1
          ] =
            Math.round(
              green +
              (
                averageGreen -
                green
              ) *
              amount
            );

          dst[
            index + 2
          ] =
            Math.round(
              blue +
              (
                averageBlue -
                blue
              ) *
              amount
            );
        } else {
          const amount =
            strength *
            brushAlpha *
            0.85;

          dst[index] =
            Math.round(
              Math.max(
                0,
                Math.min(
                  255,
                  red +
                  (
                    red -
                    averageRed
                  ) *
                  amount
                )
              )
            );

          dst[
            index + 1
          ] =
            Math.round(
              Math.max(
                0,
                Math.min(
                  255,
                  green +
                  (
                    green -
                    averageGreen
                  ) *
                  amount
                )
              )
            );

          dst[
            index + 2
          ] =
            Math.round(
              Math.max(
                0,
                Math.min(
                  255,
                  blue +
                  (
                    blue -
                    averageBlue
                  ) *
                  amount
                )
              )
            );
        }
      }
    }

    context.putImageData(
      output,
      readLeft,
      readTop
    );
  }

  function paintBlurSharpenSegment(
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastBlurSharpenPointRef.current;

    /*
      SMUDGE

      A stroke needs movement to push pixels.
      The first point simply establishes the pickup
      location. Each interpolated stamp then drags
      the previous patch into the next location.
    */

    if (
      blurSharpenMode ===
      "smudge"
    ) {
      if (previous) {
        const dx =
          point.x -
          previous.x;

        const dy =
          point.y -
          previous.y;

        const distance =
          Math.hypot(
            dx,
            dy
          );

        const spacing =
          Math.max(
            1,
            blurSharpenBrushSize *
              0.12
          );

        const steps =
          Math.max(
            1,
            Math.ceil(
              distance /
              spacing
            )
          );

        let sourcePoint = {
          x:
            previous.x,

          y:
            previous.y,
        };

        for (
          let step = 1;
          step <= steps;
          step += 1
        ) {
          const amount =
            step /
            steps;

          const destination = {
            x:
              previous.x +
              dx *
                amount,

            y:
              previous.y +
              dy *
                amount,
          };

          paintSmudgeStamp(
            sourcePoint.x,
            sourcePoint.y,
            destination.x,
            destination.y
          );

          sourcePoint =
            destination;
        }
      }

      lastBlurSharpenPointRef.current =
        point;

      emitBlurSharpenPreview(
        blurSharpenStrokeLayerIdRef.current
      );

      return;
    }

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          2,
          blurSharpenBrushSize *
            0.22
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintBlurSharpenStamp(
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintBlurSharpenStamp(
        point.x,
        point.y
      );
    }

    lastBlurSharpenPointRef.current =
      point;

    emitBlurSharpenPreview(
      blurSharpenStrokeLayerIdRef.current
    );
  }

  async function startBlurSharpenStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "blur-sharpen" ||
      !selectedLayer ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onBlurSharpenStrokeStart();

    const sourceImage =
      await loadImage(
        selectedLayer.src
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    const width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const workingCanvas =
      document.createElement(
        "canvas"
      );

    workingCanvas.width =
      width;

    workingCanvas.height =
      height;

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    blurSharpenCanvasRef.current =
      workingCanvas;

    blurSharpenSelectionMaskRef.current =
      selection
        ? createSelectionMaskForLayer(
            selectedLayer,
            width,
            height
          )
        : null;

    blurSharpenStrokeLayerIdRef.current =
      selectedLayer.id;

    lastBlurSharpenPointRef.current =
      null;

    lastBlurSharpenEmitRef.current =
      0;

    setBlurSharpenPainting(
      true
    );

    paintBlurSharpenSegment(
      point
    );
  }

  function moveBlurSharpenStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updateBlurSharpenCursor(
      event.clientX,
      event.clientY
    );

    if (
      !blurSharpenPainting ||
      !selectedLayer ||
      selectedLayer.id !==
        blurSharpenStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastBlurSharpenPointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintBlurSharpenSegment(
      point
    );
  }

  function endBlurSharpenStroke() {
    if (
      !blurSharpenPainting
    ) {
      return;
    }

    emitBlurSharpenPreview(
      blurSharpenStrokeLayerIdRef.current,
      true
    );

    setBlurSharpenPainting(
      false
    );

    blurSharpenCanvasRef.current =
      null;

    blurSharpenSelectionMaskRef.current =
      null;

    lastBlurSharpenPointRef.current =
      null;

    blurSharpenStrokeLayerIdRef.current =
      "";
  }

  /*
    RASTER PAINT BRUSH

    Paints RGBA pixels onto a temporary layer canvas.
    A complete pointer stroke is committed as one
    editor-history operation by page.tsx.
  */

  function emitPaintPreview(
    layerId: string,
    force = false
  ) {
    const workingCanvas =
      paintCanvasRef.current;

    if (
      !workingCanvas ||
      !layerId
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      !force &&
      now -
        lastPaintEmitRef.current <
        45
    ) {
      return;
    }

    lastPaintEmitRef.current =
      now;

    onLayerSourceChange(
      layerId,
      workingCanvas.toDataURL(
        "image/png"
      )
    );
  }

  function hexToRgb(
    color: string
  ) {
    const match =
      /^#([0-9a-fA-F]{6})$/.exec(
        color
      );

    if (!match) {
      return {
        r: 255,
        g: 255,
        b: 255,
      };
    }

    const value =
      Number.parseInt(
        match[1],
        16
      );

    return {
      r:
        (
          value >>
          16
        ) &
        255,

      g:
        (
          value >>
          8
        ) &
        255,

      b:
        value &
        255,
    };
  }

  function paintRasterStamp(
    x: number,
    y: number
  ) {
    const workingCanvas =
      paintCanvasRef.current;

    if (!workingCanvas) {
      return;
    }

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    const radius =
      Math.max(
        2.5,
        paintBrushSize /
          2
      );

    const diameter =
      Math.max(
        2,
        Math.ceil(
          radius *
          2
        )
      );

    const stamp =
      document.createElement(
        "canvas"
      );

    stamp.width =
      diameter;

    stamp.height =
      diameter;

    const stampContext =
      stamp.getContext(
        "2d"
      );

    if (!stampContext) {
      return;
    }

    const {
      r,
      g,
      b,
    } =
      hexToRgb(
        paintBrushColor
      );

    const center =
      diameter /
      2;

    const outer =
      diameter /
      2;

    const inner =
      outer *
      Math.min(
        0.98,
        Math.max(
          0,
          paintBrushHardness /
            100
        )
      );

    const opacity =
      Math.max(
        0.01,
        Math.min(
          1,
          paintBrushOpacity /
            100
        )
      );

    const gradient =
      stampContext.createRadialGradient(
        center,
        center,
        inner,
        center,
        center,
        outer
      );

    gradient.addColorStop(
      0,
      `rgba(${r},${g},${b},${opacity})`
    );

    gradient.addColorStop(
      1,
      `rgba(${r},${g},${b},0)`
    );

    stampContext.fillStyle =
      gradient;

    stampContext.fillRect(
      0,
      0,
      diameter,
      diameter
    );

    const selectionMask =
      paintSelectionMaskRef.current;

    if (selectionMask) {
      const stroke =
        document.createElement(
          "canvas"
        );

      stroke.width =
        workingCanvas.width;

      stroke.height =
        workingCanvas.height;

      const strokeContext =
        stroke.getContext(
          "2d"
        );

      if (!strokeContext) {
        return;
      }

      strokeContext.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );

      strokeContext.globalCompositeOperation =
        "destination-in";

      strokeContext.drawImage(
        selectionMask,
        0,
        0,
        workingCanvas.width,
        workingCanvas.height
      );

      strokeContext.globalCompositeOperation =
        "source-over";

      context.drawImage(
        stroke,
        0,
        0
      );
    } else {
      context.drawImage(
        stamp,
        x -
          radius,
        y -
          radius,
        radius *
          2,
        radius *
          2
      );
    }
  }

  function paintRasterSegment(
    point: {
      x: number;
      y: number;
    }
  ) {
    const previous =
      lastPaintPointRef.current;

    if (previous) {
      const dx =
        point.x -
        previous.x;

      const dy =
        point.y -
        previous.y;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const spacing =
        Math.max(
          1,
          paintBrushSize *
            0.16
        );

      const steps =
        Math.max(
          1,
          Math.ceil(
            distance /
            spacing
          )
        );

      for (
        let step = 1;
        step <= steps;
        step += 1
      ) {
        const amount =
          step /
          steps;

        paintRasterStamp(
          previous.x +
            dx *
              amount,
          previous.y +
            dy *
              amount
        );
      }
    } else {
      paintRasterStamp(
        point.x,
        point.y
      );
    }

    lastPaintPointRef.current =
      point;

    emitPaintPreview(
      paintStrokeLayerIdRef.current
    );
  }

  async function startPaintStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !==
        "paint" ||
      !selectedLayer ||
      selectedLayer.layerKind !==
        "image" ||
      selectedLayer.locked
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    onPaintStrokeStart();

    const sourceImage =
      await loadImage(
        selectedLayer.src
      );

    const size =
      layerSizes[
        selectedLayer.id
      ];

    if (!size) {
      return;
    }

    const width =
      Math.max(
        1,
        Math.round(
          size.width
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          size.height
        )
      );

    const workingCanvas =
      document.createElement(
        "canvas"
      );

    workingCanvas.width =
      width;

    workingCanvas.height =
      height;

    const context =
      workingCanvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.drawImage(
      sourceImage,
      0,
      0,
      width,
      height
    );

    paintCanvasRef.current =
      workingCanvas;

    paintSelectionMaskRef.current =
      selection
        ? createSelectionMaskForLayer(
            selectedLayer,
            width,
            height
          )
        : null;

    paintStrokeLayerIdRef.current =
      selectedLayer.id;

    lastPaintPointRef.current =
      null;

    lastPaintEmitRef.current =
      0;

    setRasterPainting(
      true
    );

    paintRasterSegment(
      point
    );
  }

  function movePaintStroke(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    updatePaintCursor(
      event.clientX,
      event.clientY
    );

    if (
      !rasterPainting ||
      !selectedLayer ||
      selectedLayer.id !==
        paintStrokeLayerIdRef.current
    ) {
      return;
    }

    const point =
      pointerToMaskPoint(
        event.clientX,
        event.clientY,
        selectedLayer
      );

    if (!point) {
      lastPaintPointRef.current =
        null;

      return;
    }

    event.preventDefault();
    event.stopPropagation();

    paintRasterSegment(
      point
    );
  }

  function endPaintStroke() {
    if (
      !rasterPainting
    ) {
      return;
    }

    emitPaintPreview(
      paintStrokeLayerIdRef.current,
      true
    );

    setRasterPainting(
      false
    );

    paintCanvasRef.current =
      null;

    paintSelectionMaskRef.current =
      null;

    lastPaintPointRef.current =
      null;

    paintStrokeLayerIdRef.current =
      "";
  }

  /*
    TEXT TOOL - TEXT PRO

    Clicking an existing text layer selects it.
    Empty canvas taps no longer create text implicitly;
    new text is added intentionally from the Text panel.
    This avoids repeated "Your Text" layers on touch screens.
  */

  function startTextTool(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "text"
    ) {
      return;
    }

    const hitLayer =
      hitTestLayer(
        event.clientX,
        event.clientY
      );

    event.preventDefault();
    event.stopPropagation();

    if (
      hitLayer &&
      hitLayer.layerKind ===
        "text"
    ) {
      onSelectLayer(
        hitLayer.id
      );
      return;
    }

    onDeselectLayer();
  }

  /*
    SHAPE TOOL

    Drag on the document to create a shape.

    Shift = force square/circle proportions.
    Alt   = draw outward from the starting point.

    Clicking an existing shape selects it.
    A simple click still creates the default
    shape size for convenience.
  */

  function startShapeTool(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "shape"
    ) {
      return;
    }

    const hitLayer =
      hitTestLayer(
        event.clientX,
        event.clientY
      );

    if (
      hitLayer &&
      hitLayer.layerKind ===
        "shape"
    ) {
      event.preventDefault();
      event.stopPropagation();

      onSelectLayer(
        hitLayer.id
      );

      return;
    }

    const point =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!point) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    shapeStartRef.current = {
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
    };

    const initial = {
      x:
        shapeStartRef.current.x,

      y:
        shapeStartRef.current.y,

      width:
        0,

      height:
        0,
    };

    shapeDraftRef.current =
      initial;

    setShapeDraft(
      initial
    );

    setDrawingShape(
      true
    );
  }

  function moveShapeTool(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "shape" ||
      !drawingShape
    ) {
      return;
    }

    const rawPoint =
      pointerToDocumentPoint(
        event.clientX,
        event.clientY
      );

    if (!rawPoint) {
      return;
    }

    event.preventDefault();

    const start =
      shapeStartRef.current;

    let currentX =
      Math.max(
        0,
        Math.min(
          1,
          rawPoint.x
        )
      );

    let currentY =
      Math.max(
        0,
        Math.min(
          1,
          rawPoint.y
        )
      );

    let deltaX =
      currentX -
      start.x;

    let deltaY =
      currentY -
      start.y;

    /*
      Shift creates a true square in document
      pixels, even when the document itself is
      not square.
    */

    if (event.shiftKey) {
      const widthPixels =
        Math.abs(
          deltaX
        ) *
        documentSize.width;

      const heightPixels =
        Math.abs(
          deltaY
        ) *
        documentSize.height;

      const sizePixels =
        Math.max(
          widthPixels,
          heightPixels
        );

      deltaX =
        (
          deltaX < 0
            ? -1
            : 1
        ) *
        (
          sizePixels /
          Math.max(
            1,
            documentSize.width
          )
        );

      deltaY =
        (
          deltaY < 0
            ? -1
            : 1
        ) *
        (
          sizePixels /
          Math.max(
            1,
            documentSize.height
          )
        );

      currentX =
        start.x +
        deltaX;

      currentY =
        start.y +
        deltaY;
    }

    let left: number;
    let top: number;
    let right: number;
    let bottom: number;

    if (event.altKey) {
      left =
        start.x -
        Math.abs(
          deltaX
        );

      right =
        start.x +
        Math.abs(
          deltaX
        );

      top =
        start.y -
        Math.abs(
          deltaY
        );

      bottom =
        start.y +
        Math.abs(
          deltaY
        );
    } else {
      left =
        Math.min(
          start.x,
          currentX
        );

      right =
        Math.max(
          start.x,
          currentX
        );

      top =
        Math.min(
          start.y,
          currentY
        );

      bottom =
        Math.max(
          start.y,
          currentY
        );
    }

    left =
      Math.max(
        0,
        Math.min(
          1,
          left
        )
      );

    right =
      Math.max(
        0,
        Math.min(
          1,
          right
        )
      );

    top =
      Math.max(
        0,
        Math.min(
          1,
          top
        )
      );

    bottom =
      Math.max(
        0,
        Math.min(
          1,
          bottom
        )
      );

    const next = {
      x:
        Math.min(
          left,
          right
        ),

      y:
        Math.min(
          top,
          bottom
        ),

      width:
        Math.abs(
          right -
          left
        ),

      height:
        Math.abs(
          bottom -
          top
        ),
    };

    shapeDraftRef.current =
      next;

    setShapeDraft(
      next
    );
  }

  function endShapeTool(
    event?:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      !drawingShape
    ) {
      return;
    }

    event?.preventDefault();

    const draft =
      shapeDraftRef.current;

    setDrawingShape(
      false
    );

    setShapeDraft(
      null
    );

    shapeDraftRef.current =
      null;

    if (!draft) {
      return;
    }

    const width =
      draft.width *
      documentSize.width;

    const height =
      draft.height *
      documentSize.height;

    /*
      Treat a very tiny drag as a click and
      preserve Step 21A's default-size behavior.
    */

    if (
      width < 8 ||
      height < 8
    ) {
      const x =
        shapeStartRef.current.x *
          documentSize.width -
        documentSize.width /
          2;

      const y =
        shapeStartRef.current.y *
          documentSize.height -
        documentSize.height /
          2;

      onAddShapeAt(
        x,
        y
      );

      return;
    }

    const centerX =
      (
        draft.x +
        draft.width /
          2
      ) *
        documentSize.width -
      documentSize.width /
        2;

    const centerY =
      (
        draft.y +
        draft.height /
          2
      ) *
        documentSize.height -
      documentSize.height /
        2;

    onAddShapeAt(
      centerX,
      centerY,
      width,
      height
    );
  }

  /*
    MOVE SELECTED LAYER
  */

  function startLayerDrag(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "move" ||
      resizingLayer ||
      rotatingLayer
    ) {
      return;
    }

    const hitLayer =
      hitTestLayer(
        event.clientX,
        event.clientY
      );

    /*
      Clicking a visible layer selects
      that layer automatically.
    */

    if (!hitLayer) {
      onDeselectLayer();
      return;
    }

    if (
      hitLayer.id !==
      selectedLayerId
    ) {
      onSelectLayer(
        hitLayer.id
      );
    }

    /*
      Locked layers may be selected but
      cannot be dragged.
    */

    if (hitLayer.locked) {
      return;
    }

    event.preventDefault();

    onTransformStart();

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    setDraggingLayer(
      true
    );

    layerDragStart.current = {
      layerId:
        hitLayer.id,

      mouseX:
        event.clientX,

      mouseY:
        event.clientY,

      layerX:
        hitLayer.x,

      layerY:
        hitLayer.y,
    };
  }

  function moveSelectedLayer(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      !draggingLayer ||
      resizingLayer ||
      rotatingLayer
    ) {
      return;
    }

    const dragLayer =
      layers.find(
        (layer) =>
          layer.id ===
          layerDragStart.current
            .layerId
      );

    if (
      !dragLayer ||
      dragLayer.locked
    ) {
      return;
    }

    event.preventDefault();

    const divisor =
      Math.max(
        0.0001,
        zoom *
          previewScale
      );

    const deltaX =
      (
        event.clientX -
        layerDragStart.current
          .mouseX
      ) /
      divisor;

    const deltaY =
      (
        event.clientY -
        layerDragStart.current
          .mouseY
      ) /
      divisor;

    let nextX =
      layerDragStart.current
        .layerX +
      deltaX;

    let nextY =
      layerDragStart.current
        .layerY +
      deltaY;

    /*
      SMART GUIDE SNAP THRESHOLD

      Convert 8 screen pixels into document-space
      coordinates so snapping feels the same at
      every zoom level.
    */

    const snapThreshold =
      8 /
      Math.max(
        0.0001,
        zoom *
          previewScale
      );

    type SnapCandidate = {
      target: number;
      guide: number;
    };

    const xCandidates:
      SnapCandidate[] = [
        {
          target: 0,
          guide: 0,
        },
      ];

    const yCandidates:
      SnapCandidate[] = [
        {
          target: 0,
          guide: 0,
        },
      ];

    const dragSize =
      layerSizes[
        dragLayer.id
      ];

    const documentWidth =
      documentSize.width /
      Math.max(
        0.0001,
        previewScale
      );

    const documentHeight =
      documentSize.height /
      Math.max(
        0.0001,
        previewScale
      );

    const documentHalfWidth =
      documentWidth /
      2;

    const documentHalfHeight =
      documentHeight /
      2;

    /*
      GRID SNAP

      Layer x/y are stored relative to the document
      center, while the visual grid starts from the
      document's top-left corner. Convert the moving
      layer center into top-left document coordinates,
      find the nearest grid intersection, then convert
      back to editor x/y coordinates.
    */

    if (
      snapEnabled &&
      gridSize >
        1
    ) {
      const movingCenterX =
        nextX +
        documentHalfWidth;

      const movingCenterY =
        nextY +
        documentHalfHeight;

      const nearestGridX =
        Math.round(
          movingCenterX /
            gridSize
        ) *
        gridSize;

      const nearestGridY =
        Math.round(
          movingCenterY /
            gridSize
        ) *
        gridSize;

      xCandidates.push({
        target:
          nearestGridX -
          documentHalfWidth,

        guide:
          nearestGridX -
          documentHalfWidth,
      });

      yCandidates.push({
        target:
          nearestGridY -
          documentHalfHeight,

        guide:
          nearestGridY -
          documentHalfHeight,
      });
    }

    /*
      CUSTOM GUIDE SNAP

      Guide positions are stored as normalized
      document coordinates from 0..1.
    */

    if (
      snapEnabled
    ) {
      for (
        const guide of
          guidesX
      ) {
        const normalized =
          Math.max(
            0,
            Math.min(
              1,
              guide
            )
          );

        const position =
          normalized *
            documentWidth -
          documentHalfWidth;

        xCandidates.push({
          target:
            position,

          guide:
            position,
        });
      }

      for (
        const guide of
          guidesY
      ) {
        const normalized =
          Math.max(
            0,
            Math.min(
              1,
              guide
            )
          );

        const position =
          normalized *
            documentHeight -
          documentHalfHeight;

        yCandidates.push({
          target:
            position,

          guide:
            position,
        });
      }
    }

    const dragHalfWidth =
      dragSize
        ? (
            dragSize.width *
            dragLayer.scale
          ) /
          2
        : 0;

    const dragHalfHeight =
      dragSize
        ? (
            dragSize.height *
            dragLayer.scale
          ) /
          2
        : 0;

    /*
      Snap to document edges when the moving layer
      is effectively axis-aligned.
    */

    const normalizedRotation =
      Math.abs(
        (
          (
            dragLayer.rotation %
              180
          ) +
          180
        ) %
          180
      );

    const axisAligned =
      normalizedRotation <
        0.5 ||
      Math.abs(
        normalizedRotation -
          180
      ) <
        0.5;

    if (
      dragSize &&
      axisAligned
    ) {
      xCandidates.push(
        {
          target:
            -documentHalfWidth +
            dragHalfWidth,
          guide:
            -documentHalfWidth,
        },
        {
          target:
            documentHalfWidth -
            dragHalfWidth,
          guide:
            documentHalfWidth,
        }
      );

      yCandidates.push(
        {
          target:
            -documentHalfHeight +
            dragHalfHeight,
          guide:
            -documentHalfHeight,
        },
        {
          target:
            documentHalfHeight -
            dragHalfHeight,
          guide:
            documentHalfHeight,
        }
      );
    }

    /*
      Snap against every other visible visual layer.

      Centers always snap.
      Matching edges snap when both layers are
      effectively axis-aligned.
    */

    for (
      const otherLayer of
        layers
    ) {
      if (
        otherLayer.id ===
          dragLayer.id ||
        !otherLayer.visible ||
        otherLayer.layerKind ===
          "adjustment"
      ) {
        continue;
      }

      xCandidates.push({
        target:
          otherLayer.x,
        guide:
          otherLayer.x,
      });

      yCandidates.push({
        target:
          otherLayer.y,
        guide:
          otherLayer.y,
      });

      const otherSize =
        layerSizes[
          otherLayer.id
        ];

      if (
        !dragSize ||
        !otherSize ||
        !axisAligned
      ) {
        continue;
      }

      const otherRotation =
        Math.abs(
          (
            (
              otherLayer.rotation %
                180
            ) +
            180
          ) %
            180
        );

      const otherAxisAligned =
        otherRotation <
          0.5 ||
        Math.abs(
          otherRotation -
            180
        ) <
          0.5;

      if (
        !otherAxisAligned
      ) {
        continue;
      }

      const otherHalfWidth =
        (
          otherSize.width *
          otherLayer.scale
        ) /
        2;

      const otherHalfHeight =
        (
          otherSize.height *
          otherLayer.scale
        ) /
        2;

      const otherLeft =
        otherLayer.x -
        otherHalfWidth;

      const otherRight =
        otherLayer.x +
        otherHalfWidth;

      const otherTop =
        otherLayer.y -
        otherHalfHeight;

      const otherBottom =
        otherLayer.y +
        otherHalfHeight;

      /*
        left-to-left and right-to-right
      */

      xCandidates.push(
        {
          target:
            otherLeft +
            dragHalfWidth,
          guide:
            otherLeft,
        },
        {
          target:
            otherRight -
            dragHalfWidth,
          guide:
            otherRight,
        }
      );

      /*
        top-to-top and bottom-to-bottom
      */

      yCandidates.push(
        {
          target:
            otherTop +
            dragHalfHeight,
          guide:
            otherTop,
        },
        {
          target:
            otherBottom -
            dragHalfHeight,
          guide:
            otherBottom,
        }
      );
    }

    function findBestSnap(
      value: number,
      candidates:
        SnapCandidate[]
    ) {
      let best:
        SnapCandidate | null =
          null;

      let bestDistance =
        Infinity;

      for (
        const candidate of
          candidates
      ) {
        const distance =
          Math.abs(
            value -
            candidate.target
          );

        if (
          distance <=
            snapThreshold &&
          distance <
            bestDistance
        ) {
          best =
            candidate;

          bestDistance =
            distance;
        }
      }

      return best;
    }

    const xSnap =
      snapEnabled
        ? findBestSnap(
            nextX,
            xCandidates
          )
        : null;

    const ySnap =
      snapEnabled
        ? findBestSnap(
            nextY,
            yCandidates
          )
        : null;

    if (xSnap) {
      nextX =
        xSnap.target;

      setSmartGuideX(
        xSnap.guide
      );
    } else {
      setSmartGuideX(
        null
      );
    }

    if (ySnap) {
      nextY =
        ySnap.target;

      setSmartGuideY(
        ySnap.guide
      );
    } else {
      setSmartGuideY(
        null
      );
    }

    onMoveLayer(
      dragLayer.id,
      {
        x:
          nextX,

        y:
          nextY,
      }
    );
  }

  function endLayerDrag() {
    setDraggingLayer(
      false
    );

    setResizingLayer(
      false
    );

    setRotatingLayer(
      false
    );

    setSmartGuideX(
      null
    );

    setSmartGuideY(
      null
    );
  }

  /*
    RESIZE SELECTED LAYER

    All four corner handles resize
    proportionally, preserving the
    image's aspect ratio.
  */

  function startResize(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "move" ||
      !selectedLayer ||
      selectedLayer.locked
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onTransformStart();

    const selection =
      event.currentTarget
        .parentElement;

    if (!selection) return;

    const rect =
      selection.getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    const distance =
      Math.max(
        1,
        Math.hypot(
          event.clientX -
            centerX,
          event.clientY -
            centerY
        )
      );

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    resizeStart.current = {
      centerX,
      centerY,
      distance,
      scale:
        selectedLayer.scale,
    };

    setDraggingLayer(
      false
    );

    setResizingLayer(
      true
    );
  }

  function resizeSelectedLayer(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      !resizingLayer ||
      !selectedLayer ||
      selectedLayer.locked
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const currentDistance =
      Math.max(
        1,
        Math.hypot(
          event.clientX -
            resizeStart.current
              .centerX,
          event.clientY -
            resizeStart.current
              .centerY
        )
      );

    const ratio =
      currentDistance /
      resizeStart.current
        .distance;

    let nextScale =
      clamp(
        resizeStart.current
          .scale *
          ratio,
        0.05,
        5
      );

    /*
      Hold Shift while resizing to snap
      scale to clean 50% increments:
      0.5x, 1.0x, 1.5x, 2.0x, etc.
    */

    if (event.shiftKey) {
      nextScale =
        Math.round(
          nextScale / 0.5
        ) * 0.5;

      nextScale =
        clamp(
          nextScale,
          0.5,
          5
        );
    }

    onMoveLayer(
      selectedLayer.id,
      {
        scale:
          nextScale,
      }
    );
  }


  /*
    ROTATE SELECTED LAYER

    Drag the handle above the selection
    rectangle. Rotation is normalized
    to the -180° ... 180° range so it
    stays friendly with the transform
    panel slider.
  */

  function startRotate(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      activeTool !== "move" ||
      !selectedLayer ||
      selectedLayer.locked
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onTransformStart();

    const selection =
      event.currentTarget
        .parentElement
        ?.parentElement;

    if (!selection) return;

    const rect =
      selection.getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    const pointerAngle =
      Math.atan2(
        event.clientY -
          centerY,
        event.clientX -
          centerX
      );

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    rotateStart.current = {
      centerX,
      centerY,
      pointerAngle,
      layerRotation:
        selectedLayer.rotation,
    };

    setDraggingLayer(
      false
    );

    setResizingLayer(
      false
    );

    setRotatingLayer(
      true
    );
  }

  function rotateSelectedLayer(
    event:
      PointerEvent<HTMLDivElement>
  ) {
    if (
      !rotatingLayer ||
      !selectedLayer ||
      selectedLayer.locked
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const currentAngle =
      Math.atan2(
        event.clientY -
          rotateStart.current
            .centerY,
        event.clientX -
          rotateStart.current
            .centerX
      );

    const deltaDegrees =
      (
        currentAngle -
        rotateStart.current
          .pointerAngle
      ) *
      (180 / Math.PI);

    let nextRotation =
      normalizeDegrees(
        rotateStart.current
          .layerRotation +
        deltaDegrees
      );

    /*
      Hold Shift while rotating to snap
      to clean 15-degree increments:
      0°, 15°, 30°, 45°, 90°, etc.
    */

    if (event.shiftKey) {
      nextRotation =
        Math.round(
          nextRotation / 15
        ) * 15;

      nextRotation =
        normalizeDegrees(
          nextRotation
        );
    }

    onMoveLayer(
      selectedLayer.id,
      {
        rotation:
          nextRotation,
      }
    );
  }

  const canTransform =
    activeTool === "move" &&
    !!selectedLayer &&
    selectedLayer.layerKind !==
      "adjustment" &&
    !selectedLayer.locked;

  /*
    Selection rectangle position in
    document percentages.
  */

  let selectionStyle:
    | React.CSSProperties
    | null = null;

  if (
    selectedLayer &&
    selectedLayer.layerKind !==
      "adjustment" &&
    selectedImageSize &&
    documentSize.width > 1 &&
    documentSize.height > 1
  ) {
    const layerWidth =
      selectedImageSize.width *
      previewScale *
      selectedLayer.scale;

    const layerHeight =
      selectedImageSize.height *
      previewScale *
      selectedLayer.scale;

    const centerX =
      documentSize.width / 2 +
      selectedLayer.x *
        previewScale;

    const centerY =
      documentSize.height / 2 +
      selectedLayer.y *
        previewScale;

    const left =
      centerX -
      layerWidth / 2;

    const top =
      centerY -
      layerHeight / 2;

    selectionStyle = {
      left:
        `${
          (
            left /
            documentSize.width
          ) *
          100
        }%`,

      top:
        `${
          (
            top /
            documentSize.height
          ) *
          100
        }%`,

      width:
        `${
          (
            layerWidth /
            documentSize.width
          ) *
          100
        }%`,

      height:
        `${
          (
            layerHeight /
            documentSize.height
          ) *
          100
        }%`,

      transform:
        `rotate(${selectedLayer.rotation}deg)`,

      transformOrigin:
        "center center",
    };
  }

  useEffect(
    () => {
      if (
        activeTool !==
        "polygonal-lasso"
      ) {
        return;
      }

      function handlePolygonKey(
        event:
          KeyboardEvent
      ) {
        const target =
          event.target as
            HTMLElement | null;

        const tag =
          target?.tagName
            ?.toLowerCase();

        if (
          tag === "input" ||
          tag === "textarea" ||
          target?.isContentEditable
        ) {
          return;
        }

        if (
          event.key ===
            "Enter"
        ) {
          if (
            polygonDraftRef.current.length >=
            3
          ) {
            event.preventDefault();

            finishPolygonalLasso();
          }

          return;
        }

        if (
          event.key ===
            "Backspace" ||
          event.key ===
            "Delete"
        ) {
          if (
            polygonDraftRef.current.length >
            0
          ) {
            event.preventDefault();

            const next =
              polygonDraftRef.current.slice(
                0,
                -1
              );

            polygonDraftRef.current =
              next;

            setPolygonDraft(
              next
            );

            if (
              next.length ===
              0
            ) {
              setPolygonPointer(
                null
              );
            }
          }

          return;
        }

        if (
          event.key ===
            "Escape"
        ) {
          if (
            polygonDraftRef.current.length >
            0
          ) {
            event.preventDefault();

            polygonDraftRef.current =
              [];

            setPolygonDraft(
              []
            );

            setPolygonPointer(
              null
            );
          }
        }
      }

      window.addEventListener(
        "keydown",
        handlePolygonKey
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handlePolygonKey
        );
      };
    },
    [
      activeTool,
    ]
  );

  const displayedLassoPoints =
    activeTool ===
      "polygonal-lasso" &&
    polygonDraft.length >
      0
      ? polygonDraft
      : drawingLasso
        ? lassoDraft
        : selectionShape ===
            "lasso"
          ? selectionPath ??
            []
          : [];

  const drawingPolygon =
    activeTool ===
      "polygonal-lasso" &&
    polygonDraft.length >
      0;

  const lassoPathD =
    displayedLassoPoints.length >
    0
      ? displayedLassoPoints
          .map(
            (
              point,
              index
            ) =>
              `${
                index ===
                0
                  ? "M"
                  : "L"
              } ${
                point.x *
                documentSize.width
              } ${
                point.y *
                documentSize.height
              }`
          )
          .join(
            " "
          ) +
        (
          drawingLasso ||
          drawingPolygon
            ? ""
            : " Z"
        )
      : "";

  const polygonPointerLine =
    drawingPolygon &&
    polygonPointer &&
    polygonDraft.length >
      0
      ? `M ${
          polygonDraft[
            polygonDraft.length -
              1
          ].x *
          documentSize.width
        } ${
          polygonDraft[
            polygonDraft.length -
              1
          ].y *
          documentSize.height
        } L ${
          polygonPointer.x *
          documentSize.width
        } ${
          polygonPointer.y *
          documentSize.height
        }`
      : "";

  return (
    <div
      style={{
        transform:
          `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,

        transformOrigin:
          "center center",
      }}
    >
      <div
        onPointerDown={
          activeTool === "select"
            ? startSelection
            : activeTool === "lasso"
              ? startLasso
              : activeTool === "polygonal-lasso"
                ? startPolygonalLasso
                : activeTool === "magic-wand"
                  ? startMagicWand
                  : activeTool === "quick-select"
                    ? startQuickSelection
                    : activeTool === "brush"
              ? startMaskStroke
              : activeTool === "heal"
                ? startHealStroke
              : activeTool === "clone"
                ? startCloneStroke
              : activeTool === "eraser"
                ? startEraserStroke
              : activeTool === "dodge-burn"
                ? startDodgeBurnStroke
              : activeTool === "blur-sharpen"
                ? startBlurSharpenStroke
              : activeTool === "paint"
                ? startPaintStroke
              : activeTool === "text"
                ? startTextTool
                : activeTool === "shape"
                  ? startShapeTool
                  : startLayerDrag
        }
        onPointerMove={
          activeTool === "select"
            ? resizingSelection
              ? resizeSelection
              : moveSelection
            : activeTool === "lasso"
              ? moveLasso
              : activeTool === "polygonal-lasso"
                ? movePolygonalLasso
                : activeTool === "quick-select"
                  ? moveQuickSelection
                  : activeTool === "brush"
              ? moveMaskStroke
              : activeTool === "heal"
                ? moveHealStroke
              : activeTool === "clone"
                ? moveCloneStroke
              : activeTool === "eraser"
                ? moveEraserStroke
              : activeTool === "dodge-burn"
                ? moveDodgeBurnStroke
              : activeTool === "blur-sharpen"
                ? moveBlurSharpenStroke
              : activeTool === "paint"
                ? movePaintStroke
              : activeTool === "shape"
                ? moveShapeTool
                : rotatingLayer
                ? rotateSelectedLayer
                : resizingLayer
                  ? resizeSelectedLayer
                  : moveSelectedLayer
        }
        onPointerUp={
          activeTool === "select"
            ? endSelection
            : activeTool === "lasso"
              ? endLasso
              : activeTool === "polygonal-lasso"
                ? undefined
                : activeTool === "quick-select"
                  ? endQuickSelection
                  : activeTool === "brush"
              ? endMaskStroke
              : activeTool === "heal"
                ? endHealStroke
              : activeTool === "clone"
                ? endCloneStroke
              : activeTool === "eraser"
                ? endEraserStroke
              : activeTool === "dodge-burn"
                ? endDodgeBurnStroke
              : activeTool === "blur-sharpen"
                ? endBlurSharpenStroke
              : activeTool === "paint"
                ? endPaintStroke
              : activeTool === "shape"
                ? endShapeTool
                : endLayerDrag
        }
        onPointerCancel={
          activeTool === "select"
            ? endSelection
            : activeTool === "lasso"
              ? endLasso
              : activeTool === "polygonal-lasso"
                ? undefined
                : activeTool === "quick-select"
                  ? endQuickSelection
                  : activeTool === "brush"
              ? endMaskStroke
              : activeTool === "heal"
                ? endHealStroke
              : activeTool === "clone"
                ? endCloneStroke
              : activeTool === "eraser"
                ? endEraserStroke
              : activeTool === "dodge-burn"
                ? endDodgeBurnStroke
              : activeTool === "blur-sharpen"
                ? endBlurSharpenStroke
              : activeTool === "paint"
                ? endPaintStroke
              : activeTool === "shape"
                ? endShapeTool
                : endLayerDrag
        }
        onPointerLeave={() => {
          if (
            !paintingMask &&
            !healing &&
            !cloning &&
            !erasing &&
            !dodgeBurnPainting &&
            !blurSharpenPainting &&
            !rasterPainting
          ) {
            setBrushCursor(
              (current) => ({
                ...current,
                visible: false,
              })
            );
          }
        }}
        className={
          activeTool === "select" ||
          activeTool === "lasso" ||
          activeTool === "polygonal-lasso" ||
          activeTool === "magic-wand" ||
          activeTool === "quick-select"
            ? "relative inline-block cursor-crosshair touch-none"
            : activeTool === "brush" ||
              activeTool === "heal" ||
              activeTool === "clone" ||
              activeTool === "eraser" ||
              activeTool === "dodge-burn" ||
              activeTool === "blur-sharpen" ||
              activeTool === "paint"
              ? "relative inline-block cursor-none touch-none"
              : activeTool === "text"
                ? "relative inline-block cursor-text touch-none"
                : activeTool === "shape"
                  ? "relative inline-block cursor-crosshair touch-none"
                  : canTransform
                ? draggingLayer
                  ? "relative inline-block cursor-grabbing touch-none"
                  : "relative inline-block cursor-move touch-none"
                : "relative inline-block"
        }
      >
        <canvas
          ref={canvasRef}
          className="block max-h-[70vh] max-w-[70vw] shadow-2xl"
          style={{
            backgroundColor:
              "#d1d5db",

            backgroundImage:
              "linear-gradient(45deg, #9ca3af 25%, transparent 25%), linear-gradient(-45deg, #9ca3af 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #9ca3af 75%), linear-gradient(-45deg, transparent 75%, #9ca3af 75%)",

            backgroundSize:
              "20px 20px",

            backgroundPosition:
              "0 0, 0 10px, 10px -10px, -10px 0px",
          }}
        />

        {renderingPreview && (
          <div className="pointer-events-none absolute right-2 top-2 z-[70] rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[8px] font-medium tracking-[0.08em] text-white/60 backdrop-blur-sm">
            RENDERING…
          </div>
        )}

        {effectivePreviewMaxSize <
          previewMaxSize && (
          <div
            className={
              renderingPreview
                ? "pointer-events-none absolute right-2 top-9 z-[70] rounded-full border border-amber-500/20 bg-black/70 px-2.5 py-1 text-[8px] text-amber-300/80 backdrop-blur-sm"
                : "pointer-events-none absolute right-2 top-2 z-[70] rounded-full border border-amber-500/20 bg-black/70 px-2.5 py-1 text-[8px] text-amber-300/80 backdrop-blur-sm"
            }
          >
            MEMORY SAFE • {effectivePreviewMaxSize}px
          </div>
        )}

        {showRulers && (
          <>
            <div
              className="absolute left-0 right-0 top-0 z-50 h-[18px] cursor-crosshair border-b border-white/10 bg-black/65 backdrop-blur-sm"
              title="Click to add a vertical guide"
              onPointerDown={(
                event
              ) => {
                event.preventDefault();
                event.stopPropagation();

                createVerticalGuideFromRuler(
                  event
                );
              }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 5%)",
              }}
            >
              {[0, 25, 50, 75, 100].map(
                (value) => (
                  <span
                    key={`top-ruler-${value}`}
                    className="pointer-events-none absolute top-[2px] text-[7px] text-white/55"
                    style={{
                      left:
                        `${value}%`,

                      transform:
                        value ===
                        100
                          ? "translateX(-100%)"
                          : value ===
                              0
                            ? "none"
                            : "translateX(-50%)",
                    }}
                  >
                    {value}
                  </span>
                )
              )}
            </div>

            <div
              className="absolute bottom-0 left-0 top-0 z-50 w-[18px] cursor-crosshair border-r border-white/10 bg-black/65 backdrop-blur-sm"
              title="Click to add a horizontal guide"
              onPointerDown={(
                event
              ) => {
                event.preventDefault();
                event.stopPropagation();

                createHorizontalGuideFromRuler(
                  event
                );
              }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 5%)",
              }}
            >
              {[0, 25, 50, 75, 100].map(
                (value) => (
                  <span
                    key={`left-ruler-${value}`}
                    className="pointer-events-none absolute left-[2px] text-[7px] text-white/55"
                    style={{
                      top:
                        `${value}%`,

                      transform:
                        value ===
                        100
                          ? "translateY(-100%)"
                          : value ===
                              0
                            ? "none"
                            : "translateY(-50%)",
                    }}
                  >
                    {value}
                  </span>
                )
              )}
            </div>

            <div className="pointer-events-none absolute left-0 top-0 z-[55] h-[18px] w-[18px] border-b border-r border-white/10 bg-black/80" />
          </>
        )}

        {showGrid && (
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)",

              backgroundSize:
                `${Math.max(
                  2,
                  gridSize *
                    previewScale
                )}px ${Math.max(
                  2,
                  gridSize *
                    previewScale
                )}px`,

              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.18)",
            }}
          />
        )}

        {showGuides &&
          guidesX.map(
            (
              guide,
              index
            ) => (
              <div
                key={`guide-x-${index}`}
                className="group absolute bottom-0 top-0 z-40 w-[9px] -translate-x-1/2 cursor-col-resize touch-none"
                style={{
                  left:
                    `${clampGuide(
                      guide
                    ) * 100}%`,
                }}
                title={`${Math.round(guide * 1000) / 10}% • Drag • Double-click to delete`}
                onDoubleClick={(
                  event
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  removeGuideX(
                    index
                  );
                }}
                onPointerDown={(
                  event
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  event.currentTarget
                    .setPointerCapture(
                      event.pointerId
                    );
                }}
                onPointerMove={(
                  event
                ) => {
                  if (
                    !event.currentTarget
                      .hasPointerCapture(
                        event.pointerId
                      )
                  ) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();

                  dragVerticalGuide(
                    event,
                    index
                  );
                }}
                onPointerUp={(
                  event
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  finishVerticalGuideDrag(
                    event,
                    index
                  );

                  if (
                    event.currentTarget
                      .hasPointerCapture(
                        event.pointerId
                      )
                  ) {
                    event.currentTarget
                      .releasePointerCapture(
                        event.pointerId
                      );
                  }
                }}
              >
                <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-cyan-400/85 shadow-[0_0_5px_rgba(34,211,238,0.45)] group-hover:bg-cyan-200" />
              </div>
            )
          )}

        {showGuides &&
          guidesY.map(
            (
              guide,
              index
            ) => (
              <div
                key={`guide-y-${index}`}
                className="group absolute left-0 right-0 z-40 h-[9px] -translate-y-1/2 cursor-row-resize touch-none"
                style={{
                  top:
                    `${clampGuide(
                      guide
                    ) * 100}%`,
                }}
                title={`${Math.round(guide * 1000) / 10}% • Drag • Double-click to delete`}
                onDoubleClick={(
                  event
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  removeGuideY(
                    index
                  );
                }}
                onPointerDown={(
                  event
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  event.currentTarget
                    .setPointerCapture(
                      event.pointerId
                    );
                }}
                onPointerMove={(
                  event
                ) => {
                  if (
                    !event.currentTarget
                      .hasPointerCapture(
                        event.pointerId
                      )
                  ) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();

                  dragHorizontalGuide(
                    event,
                    index
                  );
                }}
                onPointerUp={(
                  event
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  finishHorizontalGuideDrag(
                    event,
                    index
                  );

                  if (
                    event.currentTarget
                      .hasPointerCapture(
                        event.pointerId
                      )
                  ) {
                    event.currentTarget
                      .releasePointerCapture(
                        event.pointerId
                      );
                  }
                }}
              >
                <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-cyan-400/85 shadow-[0_0_5px_rgba(34,211,238,0.45)] group-hover:bg-cyan-200" />
              </div>
            )
          )}

        <canvas
          ref={maskOverlayCanvasRef}
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        />

        {activeTool ===
          "shape" &&
          shapeDraft &&
          shapeDraft.width >
            0 &&
          shapeDraft.height >
            0 && (
          <div
            className="pointer-events-none absolute border border-indigo-300 bg-indigo-400/15 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
            style={{
              left:
                `${shapeDraft.x * 100}%`,

              top:
                `${shapeDraft.y * 100}%`,

              width:
                `${shapeDraft.width * 100}%`,

              height:
                `${shapeDraft.height * 100}%`,
            }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/60 px-2 py-1 text-[9px] text-indigo-100">
              {Math.round(
                shapeDraft.width *
                documentSize.width
              )}
              {" × "}
              {Math.round(
                shapeDraft.height *
                documentSize.height
              )}
              {" px"}
            </div>
          </div>
        )}

        {draggingLayer &&
          smartGuideX !==
            null && (
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-40 w-px bg-fuchsia-400/90 shadow-[0_0_8px_rgba(232,121,249,0.65)]"
            style={{
              left:
                `${
                  (
                    (
                      documentSize.width /
                        2 +
                      smartGuideX *
                        previewScale
                    ) /
                    Math.max(
                      1,
                      documentSize.width
                    )
                  ) *
                  100
                }%`,
            }}
          />
        )}

        {draggingLayer &&
          smartGuideY !==
            null && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-40 h-px bg-fuchsia-400/90 shadow-[0_0_8px_rgba(232,121,249,0.65)]"
            style={{
              top:
                `${
                  (
                    (
                      documentSize.height /
                        2 +
                      smartGuideY *
                        previewScale
                    ) /
                    Math.max(
                      1,
                      documentSize.height
                    )
                  ) *
                  100
                }%`,
            }}
          />
        )}

        {(selectionShape ===
          "lasso" ||
          activeTool ===
            "polygonal-lasso") &&
          displayedLassoPoints.length >=
            2 &&
          lassoPathD && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${documentSize.width} ${documentSize.height}`}
            preserveAspectRatio="none"
          >
            {selectionInverted &&
              !drawingLasso &&
              displayedLassoPoints.length >=
                3 && (
              <path
                d={`M 0 0 H ${documentSize.width} V ${documentSize.height} H 0 Z ${lassoPathD}`}
                fill="rgba(0,0,0,0.20)"
                fillRule="evenodd"
              />
            )}

            {polygonPointerLine && (
              <path
                d={
                  polygonPointerLine
                }
                fill="none"
                stroke="rgb(129 140 248)"
                strokeWidth="1"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            )}

            <path
              d={
                lassoPathD
              }
              fill="none"
              stroke={
                selectionInverted
                  ? "rgb(252 165 165)"
                  : "white"
              }
              strokeWidth="1.25"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {drawingPolygon &&
              polygonDraft.map(
                (
                  point,
                  index
                ) => (
                  <circle
                    key={`polygon-point-${index}`}
                    cx={
                      point.x *
                      documentSize.width
                    }
                    cy={
                      point.y *
                      documentSize.height
                    }
                    r="3.5"
                    fill="rgb(129 140 248)"
                    stroke="white"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                )
              )}
          </svg>
        )}

        {selectionRegions.length >
          1 &&
          selectionRegions.map(
            (
              region,
              index
            ) => {
              if (
                region.shape ===
                  "lasso" &&
                region.path &&
                region.path.length >=
                  3
              ) {
                const d =
                  region.path
                    .map(
                      (
                        point,
                        pointIndex
                      ) =>
                        `${pointIndex === 0 ? "M" : "L"} ${point.x * 100} ${point.y * 100}`
                    )
                    .join(
                      " "
                    ) +
                  " Z";

                return (
                  <svg
                    key={`selection-region-${index}`}
                    className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        region.operation ===
                          "subtract"
                          ? "rgba(248,113,113,0.95)"
                          : region.operation ===
                              "intersect"
                            ? "rgba(103,232,249,0.95)"
                            : "rgba(165,180,252,0.95)"
                      }
                      strokeWidth="0.22"
                      strokeDasharray="0.9 0.7"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                );
              }

              return (
                <div
                  key={`selection-region-${index}`}
                  className={
                    region.operation ===
                      "subtract"
                      ? "pointer-events-none absolute z-30 border border-dashed border-red-400/90"
                      : region.operation ===
                          "intersect"
                        ? "pointer-events-none absolute z-30 border border-dashed border-cyan-300/90"
                        : "pointer-events-none absolute z-30 border border-dashed border-indigo-300/90"
                  }
                  style={{
                    left:
                      `${region.rect.x * 100}%`,

                    top:
                      `${region.rect.y * 100}%`,

                    width:
                      `${region.rect.width * 100}%`,

                    height:
                      `${region.rect.height * 100}%`,

                    borderRadius:
                      region.shape ===
                        "ellipse"
                        ? "9999px"
                        : "0",
                  }}
                />
              );
            }
          )}

        {selection &&
          selection.width > 0 &&
          selection.height > 0 &&
          selectionInverted &&
          selectionShape ===
            "ellipse" && (
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              left:
                `${selection.x * 100}%`,

              top:
                `${selection.y * 100}%`,

              width:
                `${selection.width * 100}%`,

              height:
                `${selection.height * 100}%`,

              boxShadow:
                "0 0 0 9999px rgba(0,0,0,0.20)",
            }}
          />
        )}

        {selection &&
          selection.width > 0 &&
          selection.height > 0 &&
          selectionInverted &&
          selectionShape ===
            "rectangle" && (
          <>
            <div
              className="pointer-events-none absolute bg-black/20"
              style={{
                left: 0,
                top: 0,
                width: "100%",
                height:
                  `${selection.y * 100}%`,
              }}
            />

            <div
              className="pointer-events-none absolute bg-black/20"
              style={{
                left: 0,
                top:
                  `${(selection.y + selection.height) * 100}%`,
                width: "100%",
                height:
                  `${Math.max(0, 1 - selection.y - selection.height) * 100}%`,
              }}
            />

            <div
              className="pointer-events-none absolute bg-black/20"
              style={{
                left: 0,
                top:
                  `${selection.y * 100}%`,
                width:
                  `${selection.x * 100}%`,
                height:
                  `${selection.height * 100}%`,
              }}
            />

            <div
              className="pointer-events-none absolute bg-black/20"
              style={{
                left:
                  `${(selection.x + selection.width) * 100}%`,
                top:
                  `${selection.y * 100}%`,
                width:
                  `${Math.max(0, 1 - selection.x - selection.width) * 100}%`,
                height:
                  `${selection.height * 100}%`,
              }}
            />
          </>
        )}

        {selection &&
          selection.width > 0 &&
          selection.height > 0 &&
          selectionShape !==
            "lasso" && (
          <div
            className={
              selectionInverted
                ? "pointer-events-none absolute border border-red-300"
                : "pointer-events-none absolute border border-white"
            }
            style={{
              left:
                `${selection.x * 100}%`,

              top:
                `${selection.y * 100}%`,

              width:
                `${selection.width * 100}%`,

              height:
                `${selection.height * 100}%`,

              borderRadius:
                selectionShape ===
                  "ellipse"
                  ? "9999px"
                  : "0",

              borderStyle:
                selectionShape ===
                  "ellipse"
                  ? "dashed"
                  : "solid",

              backgroundImage:
                selectionShape ===
                  "rectangle"
                  ? "linear-gradient(90deg, black 50%, transparent 50%), linear-gradient(90deg, black 50%, transparent 50%), linear-gradient(0deg, black 50%, transparent 50%), linear-gradient(0deg, black 50%, transparent 50%)"
                  : "none",

              backgroundRepeat:
                selectionShape ===
                  "rectangle"
                  ? "repeat-x, repeat-x, repeat-y, repeat-y"
                  : "no-repeat",

              backgroundSize:
                selectionShape ===
                  "rectangle"
                  ? "8px 1px, 8px 1px, 1px 8px, 1px 8px"
                  : "auto",

              backgroundPosition:
                selectionShape ===
                  "rectangle"
                  ? "0 0, 0 100%, 0 0, 100% 0"
                  : "0 0",

              boxShadow:
                selectionFeather > 0
                  ? `0 0 ${Math.max(
                      2,
                      selectionFeather *
                        previewScale
                    )}px rgba(255,255,255,0.28)`
                  : "none",
            }}
          >
            {activeTool ===
              "select" &&
              selectionRegions.length <=
                1 && (
              <>
                <SelectionResizeHandle
                  position="nw"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="n"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="ne"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="e"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="se"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="s"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="sw"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />

                <SelectionResizeHandle
                  position="w"
                  onPointerDown={
                    startSelectionResize
                  }
                  onPointerMove={
                    resizeSelection
                  }
                  onPointerUp={
                    endSelection
                  }
                />
              </>
            )}
          </div>
        )}

        {activeTool === "brush" &&
          brushCursor.visible &&
          selectedLayer &&
          selectedLayer.maskSrc &&
          (selectedLayer.maskEnabled ?? true) && (
          <div
            className="pointer-events-none absolute rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.75)]"
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          />
        )}

        {activeTool === "heal" &&
          brushCursor.visible &&
          selectedLayer?.layerKind ===
            "image" &&
          !selectedLayer.locked && (
          <div
            className="pointer-events-none absolute rounded-full border border-emerald-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(52,211,153,0.35)]"
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200 shadow-[0_0_0_1px_rgba(0,0,0,0.8)]" />
          </div>
        )}

        {activeTool === "clone" &&
          brushCursor.visible &&
          selectedLayer?.layerKind ===
            "image" &&
          !selectedLayer.locked && (
          <div
            className="pointer-events-none absolute rounded-full border border-sky-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(56,189,248,0.35)]"
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-sky-200" />
            <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-sky-200" />
          </div>
        )}

        {activeTool === "eraser" &&
          brushCursor.visible &&
          selectedLayer?.layerKind ===
            "image" &&
          !selectedLayer.locked && (
          <div
            className="pointer-events-none absolute rounded-full border border-rose-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(251,113,133,0.35)]"
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-rose-200" />
            <div className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-rose-200" />
          </div>
        )}

        {activeTool === "dodge-burn" &&
          brushCursor.visible &&
          selectedLayer?.layerKind ===
            "image" &&
          !selectedLayer.locked && (
          <div
            className={
              dodgeBurnMode ===
              "dodge"
                ? "pointer-events-none absolute rounded-full border border-amber-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(251,191,36,0.40)]"
                : "pointer-events-none absolute rounded-full border border-violet-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(167,139,250,0.40)]"
            }
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          >
            <div
              className={
                dodgeBurnMode ===
                "dodge"
                  ? "absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200"
                  : "absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200"
              }
            />
          </div>
        )}

        {activeTool === "blur-sharpen" &&
          brushCursor.visible &&
          selectedLayer?.layerKind ===
            "image" &&
          !selectedLayer.locked && (
          <div
            className={
              blurSharpenMode ===
              "blur"
                ? "pointer-events-none absolute rounded-full border border-cyan-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(34,211,238,0.40)]"
                : blurSharpenMode ===
                  "sharpen"
                  ? "pointer-events-none absolute rounded-full border border-orange-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(251,146,60,0.40)]"
                  : "pointer-events-none absolute rounded-full border border-fuchsia-200 shadow-[0_0_0_1px_rgba(0,0,0,0.75),0_0_8px_rgba(232,121,249,0.40)]"
            }
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          >
            <div
              className={
                blurSharpenMode ===
                "blur"
                  ? "absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200"
                  : blurSharpenMode ===
                    "sharpen"
                    ? "absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-orange-200"
                    : "absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-fuchsia-200"
              }
            />
          </div>
        )}

        {activeTool === "paint" &&
          brushCursor.visible &&
          selectedLayer?.layerKind ===
            "image" &&
          !selectedLayer.locked && (
          <div
            className="pointer-events-none absolute rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.8),0_0_8px_rgba(244,114,182,0.35)]"
            style={{
              left:
                brushCursor.x -
                brushCursor.size / 2,

              top:
                brushCursor.y -
                brushCursor.size / 2,

              width:
                brushCursor.size,

              height:
                brushCursor.size,
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.8)]"
              style={{
                background:
                  /^#[0-9a-fA-F]{6}$/.test(
                    paintBrushColor
                  )
                    ? paintBrushColor
                    : "#ffffff",
              }}
            />
          </div>
        )}

        {activeTool === "clone" &&
          selectedLayer?.layerKind ===
            "image" &&
          cloneSample &&
          cloneSample.layerId ===
            selectedLayer.id &&
          layerSizes[
            selectedLayer.id
          ] && (() => {
            const size =
              layerSizes[
                selectedLayer.id
              ];

            if (!size) {
              return null;
            }

            const localX =
              (
                cloneSample.x -
                size.width /
                  2
              ) *
              previewScale *
              selectedLayer.scale;

            const localY =
              (
                cloneSample.y -
                size.height /
                  2
              ) *
              previewScale *
              selectedLayer.scale;

            const angle =
              (
                selectedLayer.rotation *
                Math.PI
              ) /
              180;

            const flippedX =
              localX *
              (
                selectedLayer.flipHorizontal
                  ? -1
                  : 1
              );

            const flippedY =
              localY *
              (
                selectedLayer.flipVertical
                  ? -1
                  : 1
              );

            const rotatedX =
              flippedX *
                Math.cos(
                  angle
                ) -
              flippedY *
                Math.sin(
                  angle
                );

            const rotatedY =
              flippedX *
                Math.sin(
                  angle
                ) +
              flippedY *
                Math.cos(
                  angle
                );

            const x =
              documentSize.width /
                2 +
              selectedLayer.x *
                previewScale +
              rotatedX;

            const y =
              documentSize.height /
                2 +
              selectedLayer.y *
                previewScale +
              rotatedY;

            return (
              <div
                className="pointer-events-none absolute z-50 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300 bg-sky-400/10 shadow-[0_0_8px_rgba(56,189,248,0.65)]"
                style={{
                  left:
                    `${(
                      x /
                      Math.max(
                        1,
                        documentSize.width
                      )
                    ) *
                    100}%`,

                  top:
                    `${(
                      y /
                      Math.max(
                        1,
                        documentSize.height
                      )
                    ) *
                    100}%`,
                }}
              >
                <div className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-sky-300" />
                <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-sky-300" />
              </div>
            );
          })()}

        {selectionStyle &&
          selectedLayer && (
          <div
            className={
              canTransform
                ? "absolute border border-indigo-300"
                : "pointer-events-none absolute border border-gray-400/50"
            }
            style={
              selectionStyle
            }
          >
            {canTransform && (
              <>
                <div className="pointer-events-none absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2">
                  <div className="absolute bottom-0 left-1/2 h-8 w-px -translate-x-1/2 bg-indigo-300" />

                  <div
                    onPointerDown={
                      startRotate
                    }
                    onPointerMove={
                      rotateSelectedLayer
                    }
                    onPointerUp={
                      endLayerDrag
                    }
                    onPointerCancel={
                      endLayerDrag
                    }
                    className="pointer-events-auto absolute bottom-7 left-1/2 h-5 w-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-indigo-600 bg-white shadow active:cursor-grabbing"
                    title="Drag to rotate"
                  />
                </div>

                <ResizeHandle
                  position="nw"
                  onPointerDown={
                    startResize
                  }
                  onPointerMove={
                    resizeSelectedLayer
                  }
                  onPointerUp={
                    endLayerDrag
                  }
                />

                <ResizeHandle
                  position="ne"
                  onPointerDown={
                    startResize
                  }
                  onPointerMove={
                    resizeSelectedLayer
                  }
                  onPointerUp={
                    endLayerDrag
                  }
                />

                <ResizeHandle
                  position="sw"
                  onPointerDown={
                    startResize
                  }
                  onPointerMove={
                    resizeSelectedLayer
                  }
                  onPointerUp={
                    endLayerDrag
                  }
                />

                <ResizeHandle
                  position="se"
                  onPointerDown={
                    startResize
                  }
                  onPointerMove={
                    resizeSelectedLayer
                  }
                  onPointerUp={
                    endLayerDrag
                  }
                />
              </>
            )}
          </div>
        )}

        {selectedLayer && (
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
            {selectedLayer.locked
              ? "Selected layer is locked"
              : activeTool === "move"
                ? rotatingLayer
                  ? `Rotation ${Math.round(selectedLayer.rotation)}°${" — hold Shift to snap"}`
                  : resizingLayer
                    ? `Scale ${selectedLayer.scale.toFixed(2)}x — hold Shift to snap`
                    : "Drag layer, resize corners, or rotate handle"
                : activeTool === "brush"
                  ? !selectedLayer.maskSrc
                    ? "Add a layer mask before painting"
                    : !(selectedLayer.maskEnabled ?? true)
                      ? "Enable the layer mask before painting"
                      : paintingMask
                        ? maskBrushMode === "hide"
                          ? "Painting mask — hiding layer"
                          : "Painting mask — restoring layer"
                        : selection
                          ? selectionInverted
                            ? maskBrushMode === "hide"
                              ? "Mask Brush: hide outside selection only"
                              : "Mask Brush: restore outside selection only"
                            : maskBrushMode === "hide"
                              ? "Mask Brush: hide inside selection only"
                              : "Mask Brush: restore inside selection only"
                          : maskBrushMode === "hide"
                            ? "Mask Brush: paint to hide"
                            : "Mask Brush: paint to restore"
                  : activeTool === "heal"
                    ? healing
                      ? "Spot Healing • automatic nearby texture sample"
                      : selectedLayer?.layerKind === "image"
                        ? "Spot Heal • paint over a small unwanted detail"
                        : "Spot Heal • select an unlocked image layer"
                  : activeTool === "clone"
                    ? cloning
                      ? "Clone Stamp • copying from sampled source"
                      : cloneSample &&
                          selectedLayer &&
                          cloneSample.layerId === selectedLayer.id
                        ? "Clone source ready • paint to copy • Alt+Click changes source"
                        : "Clone Stamp • Alt+Click to set a source point"
                  : activeTool === "eraser"
                    ? erasing
                      ? "Erasing raster pixels to transparency"
                      : selectedLayer?.layerKind === "image"
                        ? "Eraser • paint to remove pixels"
                        : "Eraser • select an unlocked image layer"
                  : activeTool === "dodge-burn"
                    ? dodgeBurnPainting
                      ? `${dodgeBurnMode === "dodge" ? "Dodging" : "Burning"} ${dodgeBurnRange}`
                      : selectedLayer?.layerKind === "image"
                        ? `${dodgeBurnMode === "dodge" ? "Dodge" : "Burn"} • ${dodgeBurnRange} • paint locally`
                        : "Dodge & Burn • select an unlocked image layer"
                  : activeTool === "blur-sharpen"
                    ? blurSharpenPainting
                      ? `${
                          blurSharpenMode === "blur"
                            ? "Blurring"
                            : blurSharpenMode === "sharpen"
                              ? "Sharpening"
                              : "Smudging"
                        } local pixels`
                      : selectedLayer?.layerKind === "image"
                        ? `${
                            blurSharpenMode === "blur"
                              ? "Blur"
                              : blurSharpenMode === "sharpen"
                                ? "Sharpen"
                                : "Smudge"
                          } • paint locally`
                        : "Blur / Sharpen / Smudge • select an unlocked image layer"
                  : activeTool === "paint"
                    ? rasterPainting
                      ? `Painting ${paintBrushColor.toUpperCase()}`
                      : selectedLayer?.layerKind === "image"
                        ? `Paint Brush • ${paintBrushColor.toUpperCase()} • paint on raster pixels`
                        : "Paint Brush • select an unlocked image layer"
                  : activeTool === "polygonal-lasso"
                    ? polygonDraft.length > 0
                      ? `Polygonal Lasso • ${polygonDraft.length} point${polygonDraft.length === 1 ? "" : "s"} • Double-click or Enter to close • Backspace removes last`
                      : "Polygonal Lasso • Click to place points • Double-click or Enter to close"
                  : activeTool === "lasso"
                    ? drawingLasso
                      ? "Drawing freehand lasso — release to close selection"
                      : selectionShape === "lasso" &&
                          selection
                        ? selectionInverted
                          ? `Lasso selection inverted${selectionFeather > 0 ? ` • Feather ${Math.round(selectionFeather)} px` : ""}`
                          : `Lasso selection active${selectionFeather > 0 ? ` • Feather ${Math.round(selectionFeather)} px` : ""}`
                        : "Drag freely around an area to create a lasso selection"
                  : activeTool === "select"
                    ? resizingSelection
                      ? "Resizing selection"
                      : movingSelection
                        ? "Moving selection"
                        : selection
                          ? selectionInverted
                            ? selectionFeather > 0
                              ? `Inverted selection • Feather ${Math.round(selectionFeather)} px`
                              : "Inverted selection — outside area selected"
                            : selectionFeather > 0
                              ? `Selection active • Feather ${Math.round(selectionFeather)} px`
                              : "Drag inside to move • Drag handles to resize"
                          : selectionAspect === "free"
                            ? selectionShape === "ellipse"
                              ? "Drag ellipse • Shift: circle • Alt: center • Shift+M: rectangle"
                              : "Drag rectangle • Shift: square • Alt: center • Shift+M: ellipse"
                            : `Drag ${selectionAspect} ${selectionShape} • Alt: center`
                    : activeTool === "text"
                      ? selectedLayer.layerKind === "text"
                        ? "Text selected — edit it in the Text Pro panel"
                        : "Use + Add Text in the Text Pro panel to create a new text layer"
                      : activeTool === "shape"
                        ? drawingShape
                          ? "Drawing shape • Shift: square/circle • Alt: from center"
                          : selectedLayer.layerKind === "shape"
                            ? "Shape selected • Drag empty space to draw another • Shift: square • Alt: center"
                            : "Drag to draw shape • Shift: square/circle • Alt: from center"
                        : `Selected: ${selectedLayer.name}`}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectionResizeHandle({
  position,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  position:
    | "nw"
    | "n"
    | "ne"
    | "e"
    | "se"
    | "s"
    | "sw"
    | "w";

  onPointerDown: (
    event:
      PointerEvent<HTMLDivElement>,
    position:
      | "nw"
      | "n"
      | "ne"
      | "e"
      | "se"
      | "s"
      | "sw"
      | "w"
  ) => void;

  onPointerMove: (
    event:
      PointerEvent<HTMLDivElement>
  ) => void;

  onPointerUp: () => void;
}) {
  const classes = {
    nw:
      "-left-1.5 -top-1.5 cursor-nwse-resize",

    n:
      "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize",

    ne:
      "-right-1.5 -top-1.5 cursor-nesw-resize",

    e:
      "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",

    se:
      "-bottom-1.5 -right-1.5 cursor-nwse-resize",

    s:
      "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize",

    sw:
      "-bottom-1.5 -left-1.5 cursor-nesw-resize",

    w:
      "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
  };

  return (
    <div
      onPointerDown={(
        event
      ) =>
        onPointerDown(
          event,
          position
        )
      }
      onPointerMove={
        onPointerMove
      }
      onPointerUp={
        onPointerUp
      }
      onPointerCancel={
        onPointerUp
      }
      className={`pointer-events-auto absolute h-3 w-3 border border-black bg-white shadow ${classes[position]}`}
    />
  );
}

function ResizeHandle({
  position,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  position:
    | "nw"
    | "ne"
    | "sw"
    | "se";

  onPointerDown: (
    event:
      PointerEvent<HTMLDivElement>
  ) => void;

  onPointerMove: (
    event:
      PointerEvent<HTMLDivElement>
  ) => void;

  onPointerUp: () => void;
}) {
  const classes = {
    nw:
      "-left-2 -top-2 cursor-nwse-resize",

    ne:
      "-right-2 -top-2 cursor-nesw-resize",

    sw:
      "-bottom-2 -left-2 cursor-nesw-resize",

    se:
      "-bottom-2 -right-2 cursor-nwse-resize",
  };

  return (
    <div
      onPointerDown={
        onPointerDown
      }
      onPointerMove={
        onPointerMove
      }
      onPointerUp={
        onPointerUp
      }
      onPointerCancel={
        onPointerUp
      }
      className={`absolute h-4 w-4 rounded-sm border-2 border-indigo-600 bg-white shadow ${classes[position]}`}
    />
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

function normalizeDegrees(
  value: number
) {
  let result =
    value % 360;

  if (result > 180) {
    result -= 360;
  }

  if (result < -180) {
    result += 360;
  }

  return result;
}

function getDocumentReferenceLayer(
  layers: ImageLayer[]
) {
  return (
    layers.find(
      (layer) =>
        layer.layerKind !==
          "adjustment" &&
        !!layer.src
    ) ??
    null
  );
}

async function getDocumentInfo(
  layers: ImageLayer[],
  maxPreviewSize: number
) {
  if (
    layers.length === 0
  ) {
    return {
      previewScale: 1,
      documentWidth: 1,
      documentHeight: 1,
    };
  }

  const referenceLayer =
    getDocumentReferenceLayer(
      layers
    );

  if (!referenceLayer) {
    return {
      previewScale: 1,
      documentWidth: 1,
      documentHeight: 1,
    };
  }

  const firstImage =
    await loadImage(
      referenceLayer.src
    );

  const largestSide =
    Math.max(
      firstImage.naturalWidth,
      firstImage.naturalHeight
    );

  const previewScale =
    Math.min(
      1,
      maxPreviewSize /
        largestSide
    );

  return {
    previewScale,

    documentWidth:
      Math.max(
        1,
        Math.round(
          firstImage.naturalWidth *
            previewScale
        )
      ),

    documentHeight:
      Math.max(
        1,
        Math.round(
          firstImage.naturalHeight *
            previewScale
        )
      ),
  };
}


/* -------------------------------- */
/* SHARED MULTI-LAYER RENDERER      */
/* -------------------------------- */

export async function renderLayerStack(
  canvas: HTMLCanvasElement,
  layers: ImageLayer[],
  maxPreviewSize: number | null = 1200
) {
  const context =
    canvas.getContext("2d");

  if (!context) return;

  if (layers.length === 0) {
    canvas.width = 1;
    canvas.height = 1;
    context.clearRect(0, 0, 1, 1);
    return;
  }

  const referenceLayer =
    getDocumentReferenceLayer(
      layers
    );

  if (!referenceLayer) {
    canvas.width = 1;
    canvas.height = 1;

    context.clearRect(
      0,
      0,
      1,
      1
    );

    return;
  }

  const firstImage =
    await loadImage(
      referenceLayer.src
    );

  const largestSide =
    Math.max(
      firstImage.naturalWidth,
      firstImage.naturalHeight
    );

  const previewScale =
    maxPreviewSize === null
      ? 1
      : Math.min(
          1,
          maxPreviewSize /
            largestSide
        );

  const documentWidth =
    Math.max(
      1,
      Math.round(
        firstImage.naturalWidth *
          previewScale
      )
    );

  const documentHeight =
    Math.max(
      1,
      Math.round(
        firstImage.naturalHeight *
          previewScale
      )
    );

  canvas.width =
    documentWidth;

  canvas.height =
    documentHeight;

  context.clearRect(
    0,
    0,
    documentWidth,
    documentHeight
  );

  /*
    Array order:
    first item = bottom layer
    last item  = top layer
  */

  /*
    These three values allow a clipped adjustment
    layer to rebuild only the immediately underlying
    visual layer while leaving lower layers untouched.
  */

  let lastVisualBase:
    HTMLCanvasElement | null =
      null;

  let lastVisualSurface:
    HTMLCanvasElement | null =
      null;

  let lastVisualLayer:
    ImageLayer | null =
      null;

  function copyCanvas(
    source:
      HTMLCanvasElement
  ) {
    const copy =
      document.createElement(
        "canvas"
      );

    copy.width =
      source.width;

    copy.height =
      source.height;

    const copyContext =
      copy.getContext(
        "2d"
      );

    copyContext?.drawImage(
      source,
      0,
      0
    );

    return copy;
  }

  for (const layer of layers) {
    if (!layer.visible) {
      continue;
    }

    /*
      ADJUSTMENT LAYER

      The canvas already contains all layers
      below this point in the stack.

      We snapshot that composite, run the
      existing image engine over the snapshot,
      optionally apply the adjustment layer's
      mask, and blend the processed result back
      over the original composite.

      Therefore:
      - layers below are affected
      - layers above are not affected
      - reordering behaves like a real
        non-destructive adjustment layer
    */

    if (
      layer.layerKind ===
      "adjustment"
    ) {
      /*
        CLIPPED ADJUSTMENT

        lastVisualBase = the document immediately
        before the most recent visual layer.

        lastVisualSurface = that visual layer rendered
        onto a transparent full-document canvas.

        We adjust only that surface, mix it with its
        original using the Adjustment Layer strength/
        mask/blend mode, then rebuild:
        base + modified visual layer.
      */

      if (
        layer.clipToBelow &&
        lastVisualBase &&
        lastVisualSurface &&
        lastVisualLayer
      ) {
        const originalVisual =
          copyCanvas(
            lastVisualSurface
          );

        const originalVisualImage =
          await loadImage(
            originalVisual.toDataURL(
              "image/png"
            )
          );

        const adjustedVisual =
          document.createElement(
            "canvas"
          );

        renderImage(
          adjustedVisual,
          originalVisualImage,
          {
            ...layer.settings,
            opacity:
              100,
          },
          documentWidth,
          documentHeight,
          1
        );

        applyToneCurvesToCanvas(
          adjustedVisual,
          layer.toneCurve ??
            DEFAULT_TONE_CURVE,
          layer.toneCurveRed ??
            DEFAULT_TONE_CURVE,
          layer.toneCurveGreen ??
            DEFAULT_TONE_CURVE,
          layer.toneCurveBlue ??
            DEFAULT_TONE_CURVE
        );

        applyHslColorMixerToCanvas(
          adjustedVisual,
          layer.hslMixer ??
            DEFAULT_HSL_MIXER
        );

        applyColorGradingToCanvas(
          adjustedVisual,
          layer.colorGrading ??
            DEFAULT_COLOR_GRADING
        );

        if (
          layer.maskSrc &&
          (layer.maskEnabled ??
            true)
        ) {
          const maskImage =
            await loadImage(
              layer.maskSrc
            );

          applyLayerMask(
            adjustedVisual,
            maskImage,
            layer.maskInverted ??
              false,
            layer.maskDensity ??
              100,
            layer.maskFeather ??
              0
          );
        }

        const mixedVisual =
          copyCanvas(
            originalVisual
          );

        const mixedContext =
          mixedVisual.getContext(
            "2d"
          );

        if (mixedContext) {
          mixedContext.save();

          mixedContext.globalAlpha =
            Math.max(
              0,
              Math.min(
                1,
                layer.opacity /
                  100
              )
            );

          mixedContext.globalCompositeOperation =
            blendModeToCompositeOperation(
              layer.blendMode ??
                "normal"
            );

          mixedContext.drawImage(
            adjustedVisual,
            0,
            0
          );

          mixedContext.restore();

          /*
            Rebuild the document from the exact
            composite that existed before the visual
            layer, then redraw the modified surface
            using that visual layer's own blend/opacity.
          */

          context.clearRect(
            0,
            0,
            documentWidth,
            documentHeight
          );

          context.drawImage(
            lastVisualBase,
            0,
            0
          );

          context.save();

          context.globalAlpha =
            Math.max(
              0,
              Math.min(
                1,
                lastVisualLayer.opacity /
                  100
              )
            );

          context.globalCompositeOperation =
            blendModeToCompositeOperation(
              lastVisualLayer.blendMode ??
                "normal"
            );

          context.drawImage(
            mixedVisual,
            0,
            0
          );

          context.restore();

          /*
            Keep the modified surface as the new base
            for another clipped Adjustment Layer above.
          */

          lastVisualSurface =
            mixedVisual;
        }

        continue;
      }

      /*
        GLOBAL ADJUSTMENT
      */

      const compositeSnapshot =
        document.createElement(
          "canvas"
        );

      compositeSnapshot.width =
        documentWidth;

      compositeSnapshot.height =
        documentHeight;

      const snapshotContext =
        compositeSnapshot.getContext(
          "2d"
        );

      if (!snapshotContext) {
        continue;
      }

      snapshotContext.drawImage(
        canvas,
        0,
        0
      );

      const compositeImage =
        await loadImage(
          compositeSnapshot.toDataURL(
            "image/png"
          )
        );

      const adjustedCanvas =
        document.createElement(
          "canvas"
        );

      renderImage(
        adjustedCanvas,
        compositeImage,
        {
          ...layer.settings,
          opacity:
            100,
        },
        documentWidth,
        documentHeight,
        1
      );

      applyToneCurvesToCanvas(
        adjustedCanvas,
        layer.toneCurve ??
          DEFAULT_TONE_CURVE,
        layer.toneCurveRed ??
          DEFAULT_TONE_CURVE,
        layer.toneCurveGreen ??
          DEFAULT_TONE_CURVE,
        layer.toneCurveBlue ??
          DEFAULT_TONE_CURVE
      );

      applyHslColorMixerToCanvas(
        adjustedCanvas,
        layer.hslMixer ??
          DEFAULT_HSL_MIXER
      );

      applyColorGradingToCanvas(
        adjustedCanvas,
        layer.colorGrading ??
          DEFAULT_COLOR_GRADING
      );

      if (
        layer.maskSrc &&
        (layer.maskEnabled ??
          true)
      ) {
        const maskImage =
          await loadImage(
            layer.maskSrc
          );

        applyLayerMask(
          adjustedCanvas,
          maskImage,
          layer.maskInverted ??
            false,
          layer.maskDensity ??
            100,
          layer.maskFeather ??
            0
        );
      }

      context.save();

      context.globalAlpha =
        Math.max(
          0,
          Math.min(
            1,
            layer.opacity /
              100
          )
        );

      context.globalCompositeOperation =
        blendModeToCompositeOperation(
          layer.blendMode ??
            "normal"
        );

      context.drawImage(
        adjustedCanvas,
        0,
        0,
        documentWidth,
        documentHeight
      );

      context.restore();

      /*
        A global adjustment changes the whole merged
        stack, so a later clipped adjustment should not
        reconstruct an outdated pre-adjustment base.
      */

      lastVisualBase =
        null;

      lastVisualSurface =
        null;

      lastVisualLayer =
        null;

      continue;
    }

    const image =
      await loadImage(
        layer.src
      );

    const layerCanvas =
      document.createElement(
        "canvas"
      );

    const layerWidth =
      Math.max(
        1,
        Math.round(
          image.naturalWidth *
            previewScale
        )
      );

    const layerHeight =
      Math.max(
        1,
        Math.round(
          image.naturalHeight *
            previewScale
        )
      );

    renderImage(
      layerCanvas,
      image,
      {
        ...layer.settings,
        opacity: 100,
      },
      layerWidth,
      layerHeight,
      previewScale
    );

    /*
      Apply the non-destructive mask to
      this layer before blend mode and
      document compositing.

      White mask pixels keep the layer.
      Black mask pixels hide the layer.
    */

    if (
      layer.maskSrc &&
      (layer.maskEnabled ?? true)
    ) {
      const maskImage =
        await loadImage(
          layer.maskSrc
        );

      applyLayerMask(
        layerCanvas,
        maskImage,
        layer.maskInverted ??
          false,
        layer.maskDensity ??
          100,
        layer.maskFeather ??
          0
      );
    }

    /*
      Preserve the composited document before this
      visual layer. A clipped adjustment immediately
      above can later rebuild from this exact state.
    */

    lastVisualBase =
      copyCanvas(
        canvas
      );

    const visualSurface =
      document.createElement(
        "canvas"
      );

    visualSurface.width =
      documentWidth;

    visualSurface.height =
      documentHeight;

    const visualContext =
      visualSurface.getContext(
        "2d"
      );

    if (!visualContext) {
      continue;
    }

    visualContext.save();

    visualContext.translate(
      documentWidth / 2 +
        layer.x *
          previewScale,
      documentHeight / 2 +
        layer.y *
          previewScale
    );

    visualContext.rotate(
      (layer.rotation *
        Math.PI) /
        180
    );

    visualContext.scale(
      layer.scale *
        (layer.flipHorizontal
          ? -1
          : 1),
      layer.scale *
        (layer.flipVertical
          ? -1
          : 1)
    );

    visualContext.drawImage(
      layerCanvas,
      -layerWidth / 2,
      -layerHeight / 2
    );

    visualContext.restore();

    context.save();

    context.globalAlpha =
      Math.max(
        0,
        Math.min(
          1,
          layer.opacity / 100
        )
      );

    context.globalCompositeOperation =
      blendModeToCompositeOperation(
        layer.blendMode ??
        "normal"
      );

    context.drawImage(
      visualSurface,
      0,
      0
    );

    context.restore();

    lastVisualSurface =
      visualSurface;

    lastVisualLayer =
      layer;
  }
}

async function renderMaskOverlay(
  canvas: HTMLCanvasElement,
  layer: ImageLayer,
  previewScale: number,
  documentWidth: number,
  documentHeight: number
) {
  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return;
  }

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (!layer.maskSrc) {
    return;
  }

  const layerImage =
    await loadImage(
      layer.src
    );

  const maskImage =
    await loadImage(
      layer.maskSrc
    );

  const layerWidth =
    Math.max(
      1,
      Math.round(
        layerImage.naturalWidth *
          previewScale
      )
    );

  const layerHeight =
    Math.max(
      1,
      Math.round(
        layerImage.naturalHeight *
          previewScale
      )
    );

  const featherPixels =
    Math.max(
      0,
      (layer.maskFeather ?? 0) *
        previewScale
    );

  const processedMask =
    createFeatheredMaskCanvas(
      maskImage,
      layerWidth,
      layerHeight,
      featherPixels
    );

  const maskContext =
    processedMask.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  if (!maskContext) {
    return;
  }

  const imageData =
    maskContext.getImageData(
      0,
      0,
      layerWidth,
      layerHeight
    );

  const pixels =
    imageData.data;

  const densityAmount =
    Math.max(
      0,
      Math.min(
        1,
        (layer.maskDensity ?? 100) /
          100
      )
    );

  for (
    let index = 0;
    index < pixels.length;
    index += 4
  ) {
    const red =
      pixels[index];

    const green =
      pixels[index + 1];

    const blue =
      pixels[index + 2];

    let visibleAmount =
      Math.round(
        red * 0.2126 +
        green * 0.7152 +
        blue * 0.0722
      );

    if (
      layer.maskInverted ??
      false
    ) {
      visibleAmount =
        255 -
        visibleAmount;
    }

    visibleAmount =
      Math.round(
        255 -
        (
          255 -
          visibleAmount
        ) *
        densityAmount
      );

    const hiddenAmount =
      255 -
      visibleAmount;

    pixels[index] =
      255;

    pixels[index + 1] =
      35;

    pixels[index + 2] =
      35;

    pixels[index + 3] =
      Math.round(
        hiddenAmount *
        0.55
      );
  }

  maskContext.putImageData(
    imageData,
    0,
    0
  );

  context.save();

  context.translate(
    documentWidth / 2 +
      layer.x *
        previewScale,
    documentHeight / 2 +
      layer.y *
        previewScale
  );

  context.rotate(
    (layer.rotation *
      Math.PI) /
      180
  );

  context.scale(
    layer.scale *
      (
        layer.flipHorizontal
          ? -1
          : 1
      ),
    layer.scale *
      (
        layer.flipVertical
          ? -1
          : 1
      )
  );

  context.drawImage(
    processedMask,
    -layerWidth / 2,
    -layerHeight / 2
  );

  context.restore();
}

function stampMaskBrush(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  white: boolean,
  hardness: number,
  opacity: number
) {
  const hard =
    Math.max(
      0,
      Math.min(
        1,
        hardness / 100
      )
    );

  const alpha =
    Math.max(
      0.01,
      Math.min(
        1,
        opacity / 100
      )
    );

  const value =
    white
      ? 255
      : 0;

  context.save();

  context.globalAlpha =
    alpha;

  if (hard >= 0.999) {
    context.fillStyle =
      `rgb(${value}, ${value}, ${value})`;

    context.beginPath();

    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    context.fill();

    context.restore();
    return;
  }

  const innerRadius =
    radius *
    hard;

  const gradient =
    context.createRadialGradient(
      x,
      y,
      innerRadius,
      x,
      y,
      radius
    );

  if (white) {
    gradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
      Math.max(
        0.001,
        hard
      ),
      "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    /*
      Source-over gradually pushes the
      grayscale mask toward white.
    */

    context.globalCompositeOperation =
      "source-over";
  } else {
    gradient.addColorStop(
      0,
      "rgba(0,0,0,1)"
    );

    gradient.addColorStop(
      Math.max(
        0.001,
        hard
      ),
      "rgba(0,0,0,1)"
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );

    context.globalCompositeOperation =
      "source-over";
  }

  context.fillStyle =
    gradient;

  context.beginPath();

  context.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  context.fill();

  context.restore();
}

function createFeatheredMaskCanvas(
  maskImage: HTMLImageElement,
  width: number,
  height: number,
  featherPixels: number
) {
  const source =
    document.createElement(
      "canvas"
    );

  source.width =
    width;

  source.height =
    height;

  const sourceContext =
    source.getContext(
      "2d"
    );

  if (!sourceContext) {
    return source;
  }

  sourceContext.drawImage(
    maskImage,
    0,
    0,
    width,
    height
  );

  if (
    featherPixels <=
    0.01
  ) {
    return source;
  }

  /*
    Canvas blur normally fades the mask at
    the image boundary because pixels outside
    the canvas are transparent. Pad by
    extending the edge pixels first, then blur,
    then crop the center back out.
  */

  const padding =
    Math.max(
      2,
      Math.ceil(
        featherPixels * 3
      )
    );

  const padded =
    document.createElement(
      "canvas"
    );

  padded.width =
    width +
    padding * 2;

  padded.height =
    height +
    padding * 2;

  const paddedContext =
    padded.getContext(
      "2d"
    );

  if (!paddedContext) {
    return source;
  }

  /* Center */
  paddedContext.drawImage(
    source,
    padding,
    padding
  );

  /* Left / right edge extension */
  paddedContext.drawImage(
    source,
    0,
    0,
    1,
    height,
    0,
    padding,
    padding,
    height
  );

  paddedContext.drawImage(
    source,
    width - 1,
    0,
    1,
    height,
    padding + width,
    padding,
    padding,
    height
  );

  /* Top / bottom edge extension */
  paddedContext.drawImage(
    source,
    0,
    0,
    width,
    1,
    padding,
    0,
    width,
    padding
  );

  paddedContext.drawImage(
    source,
    0,
    height - 1,
    width,
    1,
    padding,
    padding + height,
    width,
    padding
  );

  /* Corner extension */
  paddedContext.drawImage(
    source,
    0,
    0,
    1,
    1,
    0,
    0,
    padding,
    padding
  );

  paddedContext.drawImage(
    source,
    width - 1,
    0,
    1,
    1,
    padding + width,
    0,
    padding,
    padding
  );

  paddedContext.drawImage(
    source,
    0,
    height - 1,
    1,
    1,
    0,
    padding + height,
    padding,
    padding
  );

  paddedContext.drawImage(
    source,
    width - 1,
    height - 1,
    1,
    1,
    padding + width,
    padding + height,
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

  if (!blurredContext) {
    return source;
  }

  blurredContext.filter =
    `blur(${featherPixels}px)`;

  blurredContext.drawImage(
    padded,
    0,
    0
  );

  blurredContext.filter =
    "none";

  const result =
    document.createElement(
      "canvas"
    );

  result.width =
    width;

  result.height =
    height;

  const resultContext =
    result.getContext(
      "2d"
    );

  if (!resultContext) {
    return source;
  }

  resultContext.drawImage(
    blurred,
    padding,
    padding,
    width,
    height,
    0,
    0,
    width,
    height
  );

  return result;
}

function applyLayerMask(
  layerCanvas: HTMLCanvasElement,
  maskImage: HTMLImageElement,
  inverted: boolean,
  density: number,
  feather: number
) {
  const width =
    layerCanvas.width;

  const height =
    layerCanvas.height;

  if (
    width <= 0 ||
    height <= 0
  ) {
    return;
  }

  const outputScale =
    maskImage.naturalWidth > 0
      ? width /
        maskImage.naturalWidth
      : 1;

  const featherPixels =
    Math.max(
      0,
      feather *
        outputScale
    );

  const maskCanvas =
    createFeatheredMaskCanvas(
      maskImage,
      width,
      height,
      featherPixels
    );

  const maskContext =
    maskCanvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  if (!maskContext) {
    return;
  }

  const imageData =
    maskContext.getImageData(
      0,
      0,
      width,
      height
    );

  const pixels =
    imageData.data;

  const densityAmount =
    Math.max(
      0,
      Math.min(
        1,
        density / 100
      )
    );

  /*
    Convert mask brightness into alpha.
    This also prepares the renderer for
    real black/white brush painting.
  */

  for (
    let index = 0;
    index < pixels.length;
    index += 4
  ) {
    const red =
      pixels[index];

    const green =
      pixels[index + 1];

    const blue =
      pixels[index + 2];

    let alpha =
      Math.round(
        red * 0.2126 +
        green * 0.7152 +
        blue * 0.0722
      );

    if (inverted) {
      alpha =
        255 - alpha;
    }

    /*
      Density controls mask strength.
      100% = full mask effect.
      0%   = mask has no effect.
    */

    alpha =
      Math.round(
        255 -
        (
          255 - alpha
        ) *
        densityAmount
      );

    pixels[index] =
      255;

    pixels[index + 1] =
      255;

    pixels[index + 2] =
      255;

    pixels[index + 3] =
      alpha;
  }

  maskContext.putImageData(
    imageData,
    0,
    0
  );

  const layerContext =
    layerCanvas.getContext(
      "2d"
    );

  if (!layerContext) {
    return;
  }

  layerContext.save();

  layerContext.globalCompositeOperation =
    "destination-in";

  layerContext.drawImage(
    maskCanvas,
    0,
    0
  );

  layerContext.restore();
}

function blendModeToCompositeOperation(
  mode: BlendMode
): GlobalCompositeOperation {
  switch (mode) {
    case "multiply":
      return "multiply";
    case "screen":
      return "screen";
    case "overlay":
      return "overlay";
    case "soft-light":
      return "soft-light";
    case "darken":
      return "darken";
    case "lighten":
      return "lighten";
    case "color-dodge":
      return "color-dodge";
    case "normal":
    default:
      return "source-over";
  }
}

async function getPreviewScale(
  layers: ImageLayer[],
  maxPreviewSize: number
) {
  if (layers.length === 0) {
    return 1;
  }

  const referenceLayer =
    getDocumentReferenceLayer(
      layers
    );

  if (!referenceLayer) {
    return 1;
  }

  const firstImage =
    await loadImage(
      referenceLayer.src
    );

  const largestSide =
    Math.max(
      firstImage.naturalWidth,
      firstImage.naturalHeight
    );

  return Math.min(
    1,
    maxPreviewSize /
      largestSide
  );
}

const IMAGE_CACHE_LIMIT =
  10;

const imagePromiseCache =
  new Map<
    string,
    Promise<HTMLImageElement>
  >();

export function purgeLayerCanvasImageCache() {
  imagePromiseCache.clear();
}

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  const cached =
    imagePromiseCache.get(
      src
    );

  if (cached) {
    /*
      Refresh insertion order so frequently used images
      remain in the small LRU cache.
    */

    imagePromiseCache.delete(
      src
    );

    imagePromiseCache.set(
      src,
      cached
    );

    return cached;
  }

  const promise =
    new Promise<HTMLImageElement>(
      (
        resolve,
        reject
      ) => {
        const image =
          new Image();

        image.onload = () =>
          resolve(
            image
          );

        image.onerror = () => {
          imagePromiseCache.delete(
            src
          );

          reject(
            new Error(
              "Could not load layer image."
            )
          );
        };

        image.src =
          src;
      }
    );

  imagePromiseCache.set(
    src,
    promise
  );

  while (
    imagePromiseCache.size >
    IMAGE_CACHE_LIMIT
  ) {
    const oldestKey =
      imagePromiseCache
        .keys()
        .next()
        .value as
        string | undefined;

    if (
      oldestKey ===
      undefined
    ) {
      break;
    }

    imagePromiseCache.delete(
      oldestKey
    );
  }

  return promise;
}
