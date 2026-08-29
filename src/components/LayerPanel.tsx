"use client";

import {
  DragEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  BlendMode,
  ImageLayer,
  LayerGroup,
} from "@/lib/layerTypes";

type LayerPanelProps = {
  layers: ImageLayer[];
  groups: LayerGroup[];

  selectedLayerId: string | null;

  selectedLayerIds: string[];

  onCreateGroup: () => void;

  onRenameGroup: (
    id: string,
    name: string
  ) => void;

  onDeleteGroup: (
    id: string
  ) => void;

  onDuplicateGroup: (
    id: string
  ) => void;

  onBringGroupToFront: (
    id: string
  ) => void;

  onSendGroupToBack: (
    id: string
  ) => void;

  onMoveGroup: (
    id: string,
    dx: number,
    dy: number
  ) => void;

  onToggleGroupCollapsed: (
    id: string
  ) => void;

  onToggleGroupVisible: (
    id: string
  ) => void;

  onToggleGroupLock: (
    id: string
  ) => void;

  onAssignGroup: (
    layerId: string,
    groupId: string | null
  ) => void;

  onSelect: (
    id: string,
    options?: {
      toggle?: boolean;
      range?: boolean;
    }
  ) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;

  onRename: (
    id: string,
    name: string
  ) => void;

  onReorder: (
    draggedId: string,
    targetId: string,
    position: "before" | "after"
  ) => void;

  onOpacityChange: (
    id: string,
    value: number
  ) => void;

  onOpacityStart: () => void;

  onBlendModeChange: (
    id: string,
    mode: BlendMode
  ) => void;

  onAddMask: (
    id: string
  ) => void;

  onToggleMask: (
    id: string
  ) => void;

  onInvertMask: (
    id: string
  ) => void;

  onRemoveMask: (
    id: string
  ) => void;

  onMaskDensityChange: (
    id: string,
    value: number
  ) => void;

  onMaskDensityStart: () => void;

  onMaskFeatherChange: (
    id: string,
    value: number
  ) => void;

  onMaskFeatherStart: () => void;

  onRevealAllMask: (
    id: string
  ) => void;

  onHideAllMask: (
    id: string
  ) => void;
};

export default function LayerPanel({
  layers,
  groups,
  selectedLayerId,
  selectedLayerIds,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onDuplicateGroup,
  onBringGroupToFront,
  onSendGroupToBack,
  onMoveGroup,
  onToggleGroupCollapsed,
  onToggleGroupVisible,
  onToggleGroupLock,
  onAssignGroup,
  onSelect,
  onToggleVisible,
  onToggleLock,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onRename,
  onReorder,
  onOpacityChange,
  onOpacityStart,
  onBlendModeChange,
  onAddMask,
  onToggleMask,
  onInvertMask,
  onRemoveMask,
  onMaskDensityChange,
  onMaskDensityStart,
  onMaskFeatherChange,
  onMaskFeatherStart,
  onRevealAllMask,
  onHideAllMask,
}: LayerPanelProps) {
  const [
    editingLayerId,
    setEditingLayerId,
  ] =
    useState<string | null>(
      null
    );

  const [
    editingName,
    setEditingName,
  ] = useState("");

  const [
    draggingLayerId,
    setDraggingLayerId,
  ] =
    useState<string | null>(
      null
    );

  const [
    dragOverLayerId,
    setDragOverLayerId,
  ] =
    useState<string | null>(
      null
    );

  const [
    dragPosition,
    setDragPosition,
  ] =
    useState<
      "before" | "after"
    >("before");

  const [
    dragOverGroupId,
    setDragOverGroupId,
  ] =
    useState<string | null>(
      null
    );

  const [
    dragOverUngroup,
    setDragOverUngroup,
  ] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  useEffect(() => {
    if (!editingLayerId) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editingLayerId]);

  function beginRename(
    layer: ImageLayer
  ) {
    setEditingLayerId(
      layer.id
    );

    setEditingName(
      layer.name
    );
  }

  function cancelRename() {
    setEditingLayerId(
      null
    );

    setEditingName(
      ""
    );
  }

  function finishRename(
    layer: ImageLayer
  ) {
    const nextName =
      editingName.trim();

    if (
      nextName &&
      nextName !== layer.name
    ) {
      onRename(
        layer.id,
        nextName
      );
    }

    cancelRename();
  }

  function handleRenameKeyDown(
    event:
      KeyboardEvent<HTMLInputElement>,
    layer: ImageLayer
  ) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      finishRename(
        layer
      );

      return;
    }

    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      cancelRename();
    }
  }

  function handleDragStart(
    event:
      DragEvent<HTMLDivElement>,
    layer: ImageLayer
  ) {
    if (
      editingLayerId ===
      layer.id
    ) {
      event.preventDefault();
      return;
    }

    setDraggingLayerId(
      layer.id
    );

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      layer.id
    );
  }

  function handleDragOver(
    event:
      DragEvent<HTMLDivElement>,
    targetId: string
  ) {
    event.preventDefault();

    if (
      !draggingLayerId ||
      draggingLayerId ===
        targetId
    ) {
      return;
    }

    const rect =
      event.currentTarget
        .getBoundingClientRect();

    const midpoint =
      rect.top +
      rect.height / 2;

    setDragOverLayerId(
      targetId
    );

    setDragOverGroupId(
      null
    );

    setDragOverUngroup(
      false
    );

    setDragPosition(
      event.clientY <
        midpoint
        ? "before"
        : "after"
    );

    event.dataTransfer.dropEffect =
      "move";
  }

  function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
    targetId: string
  ) {
    event.preventDefault();

    const draggedId =
      draggingLayerId ||
      event.dataTransfer.getData(
        "text/plain"
      );

    if (
      draggedId &&
      draggedId !== targetId
    ) {
      onReorder(
        draggedId,
        targetId,
        dragPosition
      );
    }

    clearDragState();
  }

  function handleGroupDragOver(
    event:
      DragEvent<HTMLDivElement>,
    groupId: string
  ) {
    if (!draggingLayerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setDragOverGroupId(
      groupId
    );

    setDragOverUngroup(
      false
    );

    setDragOverLayerId(
      null
    );

    event.dataTransfer.dropEffect =
      "move";
  }

  function handleGroupDrop(
    event:
      DragEvent<HTMLDivElement>,
    groupId: string
  ) {
    event.preventDefault();
    event.stopPropagation();

    const draggedId =
      draggingLayerId ||
      event.dataTransfer.getData(
        "text/plain"
      );

    if (draggedId) {
      onAssignGroup(
        draggedId,
        groupId
      );
    }

    clearDragState();
  }

  function handleUngroupDragOver(
    event:
      DragEvent<HTMLDivElement>
  ) {
    if (!draggingLayerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setDragOverUngroup(
      true
    );

    setDragOverGroupId(
      null
    );

    setDragOverLayerId(
      null
    );

    event.dataTransfer.dropEffect =
      "move";
  }

  function handleUngroupDrop(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    const draggedId =
      draggingLayerId ||
      event.dataTransfer.getData(
        "text/plain"
      );

    if (draggedId) {
      onAssignGroup(
        draggedId,
        null
      );
    }

    clearDragState();
  }

  function clearDragState() {
    setDraggingLayerId(
      null
    );

    setDragOverLayerId(
      null
    );

    setDragPosition(
      "before"
    );

    setDragOverGroupId(
      null
    );

    setDragOverUngroup(
      false
    );
  }

  function getGroupName(
    groupId:
      string | null
  ) {
    if (!groupId) {
      return null;
    }

    return (
      groups.find(
        (group) =>
          group.id ===
          groupId
      )?.name ??
      null
    );
  }

  function renameGroupPrompt(
    group: LayerGroup
  ) {
    const next =
      window.prompt(
        "Rename folder",
        group.name
      );

    if (
      next &&
      next.trim() &&
      next.trim() !==
        group.name
    ) {
      onRenameGroup(
        group.id,
        next.trim()
      );
    }
  }

  /*
    The array is stored bottom -> top,
    but the panel displays top -> bottom.
  */

  const displayLayers =
    [...layers].reverse();

  const visibleDisplayLayers =
    displayLayers.filter(
      (layer) => {
        if (!layer.groupId) {
          return true;
        }

        const group =
          groups.find(
            (item) =>
              item.id ===
              layer.groupId
          );

        return !group?.collapsed;
      }
    );

  return (
    <section className="border-b border-white/10">

      <div className="flex items-center justify-between gap-2 px-4 py-3">

        <div>
          <h3 className="text-xs font-semibold tracking-[0.16em] text-gray-300">
            LAYERS
          </h3>

          <div className="mt-1 text-[9px] text-gray-600">
            {layers.length}
            {layers.length === 1
              ? " layer"
              : " layers"}
            {" • "}
            {groups.length}
            {groups.length === 1
              ? " folder"
              : " folders"}
          </div>
        </div>

        <button
          disabled={
            layers.length === 0
          }
          onClick={
            onCreateGroup
          }
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          + Folder
        </button>

      </div>

      {groups.length > 0 && (
        <div className="mx-2 mb-3 space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-2">

          <div className="px-1 pb-1 text-[9px] font-semibold tracking-[0.12em] text-gray-500">
            FOLDERS
          </div>

          {groups.map(
            (group) => {
              const count =
                layers.filter(
                  (layer) =>
                    layer.groupId ===
                    group.id
                ).length;

              return (
                <div
                  key={
                    group.id
                  }
                  onDragOver={(
                    event
                  ) =>
                    handleGroupDragOver(
                      event,
                      group.id
                    )
                  }
                  onDragLeave={(
                    event
                  ) => {
                    if (
                      event.currentTarget.contains(
                        event.relatedTarget as
                          Node | null
                      )
                    ) {
                      return;
                    }

                    if (
                      dragOverGroupId ===
                      group.id
                    ) {
                      setDragOverGroupId(
                        null
                      );
                    }
                  }}
                  onDrop={(
                    event
                  ) =>
                    handleGroupDrop(
                      event,
                      group.id
                    )
                  }
                  className={
                    [
                      "relative flex items-center gap-2 rounded-lg border px-2 py-2 transition",
                      dragOverGroupId ===
                      group.id
                        ? "border-indigo-400/70 bg-indigo-500/20 shadow-[0_0_0_1px_rgba(129,140,248,0.18)]"
                        : "border-white/[0.04] bg-white/[0.03]",
                    ].join(
                      " "
                    )
                  }
                >

                  {dragOverGroupId ===
                    group.id &&
                    draggingLayerId && (
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-lg">
                      <div className="mb-1 rounded bg-indigo-500/90 px-2 py-0.5 text-[8px] font-medium text-white shadow-lg">
                        Move layer here
                      </div>
                    </div>
                  )}

                  <button
                    title={
                      group.collapsed
                        ? "Expand folder"
                        : "Collapse folder"
                    }
                    onClick={() =>
                      onToggleGroupCollapsed(
                        group.id
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-[10px] text-gray-400 hover:bg-white/10"
                  >
                    {group.collapsed
                      ? "▶"
                      : "▼"}
                  </button>

                  <span className="text-sm">
                    {group.collapsed
                      ? "📁"
                      : "📂"}
                  </span>

                  <div className="min-w-0 flex-1">

                    <div className="truncate text-[10px] font-medium text-gray-300">
                      {group.name}
                    </div>

                    <div className="mt-0.5 text-[9px] text-gray-600">
                      {count}
                      {count === 1
                        ? " layer"
                        : " layers"}
                      {" • "}
                      {group.collapsed
                        ? "Collapsed"
                        : "Expanded"}
                      {!group.visible && (
                        <>
                          {" • Hidden"}
                        </>
                      )}
                      {group.locked && (
                        <>
                          {" • Locked"}
                        </>
                      )}
                    </div>

                  </div>

                  <button
                    title={
                      group.visible
                        ? "Hide all layers in folder"
                        : "Show all layers in folder"
                    }
                    onClick={() =>
                      onToggleGroupVisible(
                        group.id
                      )
                    }
                    className={
                      group.visible
                        ? "flex h-6 w-6 items-center justify-center rounded bg-white/5 text-[11px] text-gray-300 hover:bg-white/10"
                        : "flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-[11px] text-red-300 hover:bg-red-500/20"
                    }
                  >
                    {group.visible
                      ? "◉"
                      : "○"}
                  </button>

                  <button
                    title={
                      group.locked
                        ? "Unlock all layers in folder"
                        : "Lock all layers in folder"
                    }
                    onClick={() =>
                      onToggleGroupLock(
                        group.id
                      )
                    }
                    className={
                      group.locked
                        ? "flex h-6 w-6 items-center justify-center rounded bg-amber-500/15 text-[11px] text-amber-300 hover:bg-amber-500/25"
                        : "flex h-6 w-6 items-center justify-center rounded bg-white/5 text-[11px] text-gray-400 hover:bg-white/10"
                    }
                  >
                    {group.locked
                      ? "🔒"
                      : "🔓"}
                  </button>

                  <div className="grid grid-cols-3 gap-0.5 rounded-md border border-white/10 bg-black/10 p-0.5">

                    <span />

                    <button
                      title="Move folder up 10 px"
                      disabled={
                        count === 0 ||
                        group.locked
                      }
                      onClick={() =>
                        onMoveGroup(
                          group.id,
                          0,
                          -10
                        )
                      }
                      className="flex h-5 w-5 items-center justify-center rounded text-[9px] text-gray-400 hover:bg-white/10 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      ↑
                    </button>

                    <span />

                    <button
                      title="Move folder left 10 px"
                      disabled={
                        count === 0 ||
                        group.locked
                      }
                      onClick={() =>
                        onMoveGroup(
                          group.id,
                          -10,
                          0
                        )
                      }
                      className="flex h-5 w-5 items-center justify-center rounded text-[9px] text-gray-400 hover:bg-white/10 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      ←
                    </button>

                    <div
                      title="Move all folder layers together"
                      className="flex h-5 w-5 items-center justify-center text-[8px] text-gray-600"
                    >
                      +
                    </div>

                    <button
                      title="Move folder right 10 px"
                      disabled={
                        count === 0 ||
                        group.locked
                      }
                      onClick={() =>
                        onMoveGroup(
                          group.id,
                          10,
                          0
                        )
                      }
                      className="flex h-5 w-5 items-center justify-center rounded text-[9px] text-gray-400 hover:bg-white/10 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      →
                    </button>

                    <span />

                    <button
                      title="Move folder down 10 px"
                      disabled={
                        count === 0 ||
                        group.locked
                      }
                      onClick={() =>
                        onMoveGroup(
                          group.id,
                          0,
                          10
                        )
                      }
                      className="flex h-5 w-5 items-center justify-center rounded text-[9px] text-gray-400 hover:bg-white/10 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      ↓
                    </button>

                    <span />

                  </div>

                  <button
                    title="Bring entire folder to front"
                    disabled={
                      count === 0
                    }
                    onClick={() =>
                      onBringGroupToFront(
                        group.id
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-[11px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ⇈
                  </button>

                  <button
                    title="Send entire folder to back"
                    disabled={
                      count === 0
                    }
                    onClick={() =>
                      onSendGroupToBack(
                        group.id
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-[11px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ⇊
                  </button>

                  <button
                    title="Duplicate folder and all layers"
                    onClick={() =>
                      onDuplicateGroup(
                        group.id
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-[11px] text-gray-300 hover:bg-white/10"
                  >
                    ⧉
                  </button>

                  <button
                    onClick={() =>
                      renameGroupPrompt(
                        group
                      )
                    }
                    className="rounded bg-white/5 px-2 py-1 text-[9px] text-gray-400 hover:bg-white/10"
                  >
                    Edit
                  </button>

                  <button
                    title="Delete folder; keep layers"
                    onClick={() =>
                      onDeleteGroup(
                        group.id
                      )
                    }
                    className="rounded bg-red-500/10 px-2 py-1 text-[9px] text-red-300 hover:bg-red-500/20"
                  >
                    ×
                  </button>

                </div>
              );
            }
          )}

        </div>
      )}

      {groups.some(
        (group) =>
          group.collapsed
      ) && (
        <div className="mx-3 mb-2 text-[9px] leading-4 text-gray-600">
          Layers inside collapsed folders are hidden from this panel only. They still remain visible on the canvas.
        </div>
      )}

      {groups.length > 0 && (
        <div className="mx-3 mb-2 text-[9px] leading-4 text-gray-600">
          Folder controls: arrows move all layers 10 px • ◉ visibility • 🔓 lock • ⇈ front • ⇊ back • ⧉ duplicate
        </div>
      )}

      {draggingLayerId &&
        groups.length > 0 && (
        <div
          onDragOver={
            handleUngroupDragOver
          }
          onDragLeave={() =>
            setDragOverUngroup(
              false
            )
          }
          onDrop={
            handleUngroupDrop
          }
          className={
            [
              "mx-2 mb-2 flex items-center justify-center rounded-lg border border-dashed px-3 py-2 text-[9px] transition",
              dragOverUngroup
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                : "border-white/15 bg-white/[0.02] text-gray-500",
            ].join(
              " "
            )
          }
        >
          {dragOverUngroup
            ? "Release to remove from folder"
            : "Drop here for No Folder"}
        </div>
      )}

      {selectedLayerIds.length >
        1 && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-2 text-[9px] leading-4 text-cyan-200/80">
          {selectedLayerIds.length}
          {" "}
          layers selected • Ctrl/Cmd+Click toggles • Shift+Click selects a range
        </div>
      )}

      {displayLayers.length === 0 ? (
        <div className="px-4 pb-4 text-xs text-gray-500">
          No layers
        </div>
      ) : (
        <div className="space-y-1 px-2 pb-3">

          {visibleDisplayLayers.map(
            (layer) => {
              const selected =
                layer.id ===
                selectedLayerId;

              const multiSelected =
                selectedLayerIds.includes(
                  layer.id
                );

              const editing =
                editingLayerId ===
                layer.id;

              return (
                <div
                  key={layer.id}
                  draggable={!editing}
                  onDragStart={(event) =>
                    handleDragStart(
                      event,
                      layer
                    )
                  }
                  onDragOver={(event) =>
                    handleDragOver(
                      event,
                      layer.id
                    )
                  }
                  onDrop={(event) =>
                    handleDrop(
                      event,
                      layer.id
                    )
                  }
                  onDragEnd={
                    clearDragState
                  }
                  onClick={(event) =>
                    onSelect(
                      layer.id,
                      {
                        toggle:
                          event.ctrlKey ||
                          event.metaKey,

                        range:
                          event.shiftKey,
                      }
                    )
                  }
                  className={
                    [
                      "relative rounded-lg border p-2 transition",
                      layer.groupId
                        ? "ml-4"
                        : "",
                      selected
                        ? "border-indigo-400/70 bg-indigo-500/20 ring-1 ring-indigo-400/20"
                        : multiSelected
                          ? "border-cyan-500/35 bg-cyan-500/[0.08]"
                          : "border-transparent hover:bg-white/5",
                      draggingLayerId === layer.id
                        ? "opacity-40"
                        : "",
                    ].join(" ")
                  }
                >
                  {dragOverLayerId ===
                    layer.id &&
                    draggingLayerId !==
                      layer.id && (
                    <div
                      className={
                        dragPosition ===
                        "before"
                          ? "pointer-events-none absolute -top-[2px] left-2 right-2 h-[2px] rounded bg-indigo-400"
                          : "pointer-events-none absolute -bottom-[2px] left-2 right-2 h-[2px] rounded bg-indigo-400"
                      }
                    />
                  )}

                  {layer.groupId && (
                    <div className="pointer-events-none absolute -left-3 top-0 bottom-0 flex items-center">
                      <div className="h-[calc(100%-8px)] w-px bg-indigo-400/20" />
                      <div className="h-px w-3 bg-indigo-400/20" />
                    </div>
                  )}

                  <div className="flex items-center gap-2">

                    {/* VISIBILITY */}

                    <button
                      title={
                        layer.visible
                          ? "Hide layer"
                          : "Show layer"
                      }
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        onToggleVisible(
                          layer.id
                        );
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs text-gray-300 hover:bg-white/10"
                    >
                      {layer.visible
                        ? "👁"
                        : "○"}
                    </button>

                    {/* THUMBNAIL */}

                    <div className="flex shrink-0 items-center gap-1">
                      <div className="h-10 w-10 overflow-hidden rounded border border-white/10 bg-black/30">

                        {layer.layerKind ===
                        "adjustment" ? (
                          <div
                            title="Adjustment Layer"
                            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-900 text-lg font-bold text-indigo-300"
                          >
                            ◐
                          </div>
                        ) : (
                          <img
                            src={layer.src}
                            alt=""
                            draggable={false}
                            className={
                              layer.layerKind ===
                                "text" ||
                              layer.layerKind ===
                                "shape"
                                ? "h-full w-full object-contain p-1"
                                : "h-full w-full object-cover"
                            }
                          />
                        )}

                      </div>

                      {layer.maskSrc && (
                        <div
                          title={
                            layer.maskEnabled ?? true
                              ? "Layer mask enabled"
                              : "Layer mask disabled"
                          }
                          className={
                            (layer.maskEnabled ?? true)
                              ? "h-10 w-8 overflow-hidden rounded border-2 border-indigo-400 bg-white"
                              : "h-10 w-8 overflow-hidden rounded border border-white/20 bg-white opacity-40"
                          }
                        >
                          <img
                            src={layer.maskSrc}
                            alt=""
                            draggable={false}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* NAME / INLINE EDITOR */}

                    <div className="min-w-0 flex-1">

                      {editing ? (
                        <input
                          ref={
                            inputRef
                          }
                          value={
                            editingName
                          }
                          onChange={(
                            event
                          ) =>
                            setEditingName(
                              event.target
                                .value
                            )
                          }
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                          onDoubleClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                          onKeyDown={(
                            event
                          ) =>
                            handleRenameKeyDown(
                              event,
                              layer
                            )
                          }
                          onBlur={() =>
                            finishRename(
                              layer
                            )
                          }
                          className="w-full rounded border border-indigo-500/60 bg-black/40 px-2 py-1 text-xs text-white outline-none"
                        />
                      ) : (
                        <button
                          title="Double-click to rename"
                          onDoubleClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            beginRename(
                              layer
                            );
                          }}
                          className="block w-full truncate text-left text-xs font-medium text-gray-200"
                        >
                          {layer.name}
                        </button>
                      )}

                      <div className="mt-1 truncate text-[10px] text-gray-500">
                        {layer.locked
                          ? "Locked"
                          : layer.layerKind ===
                              "text"
                            ? "Text Layer"
                            : layer.layerKind ===
                                "shape"
                              ? "Shape Layer"
                              : layer.layerKind ===
                                  "adjustment"
                                ? "Adjustment Layer"
                                : "Image Layer"}
                        {getGroupName(
                          layer.groupId
                        ) && (
                          <>
                            {" • 📁 "}
                            {getGroupName(
                              layer.groupId
                            )}
                          </>
                        )}

                        {layer.layerKind ===
                          "adjustment" &&
                          layer.clipToBelow && (
                          <>
                            {" • "}
                            <span className="text-indigo-300">
                              CLIPPED
                            </span>
                          </>
                        )}

                        {" • "}
                        {Math.round(
                          layer.opacity
                        )}
                        %
                      </div>

                    </div>

                    {/* LOCK */}

                    <button
                      title={
                        layer.locked
                          ? "Unlock layer"
                          : "Lock layer"
                      }
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        onToggleLock(
                          layer.id
                        );
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs hover:bg-white/10"
                    >
                      {layer.locked
                        ? "🔒"
                        : "🔓"}
                    </button>

                  </div>

                  {selected && (
                    <>
                      <div
                        className="mt-2 border-t border-white/10 pt-2"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <div className="mb-3">

                          <div className="mb-1.5 flex items-center justify-between">

                            <span className="text-[10px] text-gray-400">
                              Folder
                            </span>

                            {layer.groupId && (
                              <span className="text-[9px] text-indigo-300">
                                Grouped
                              </span>
                            )}

                          </div>

                          <select
                            value={
                              layer.groupId ??
                              ""
                            }
                            onChange={(event) =>
                              onAssignGroup(
                                layer.id,
                                event.target
                                  .value ||
                                  null
                              )
                            }
                            className="w-full rounded-md border border-white/10 bg-[#151823] px-2 py-1.5 text-[11px] text-gray-200 outline-none focus:border-indigo-500/60"
                          >
                            <option value="">
                              No Folder
                            </option>

                            {groups.map(
                              (group) => (
                                <option
                                  key={
                                    group.id
                                  }
                                  value={
                                    group.id
                                  }
                                >
                                  {group.name}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Blend Mode
                          </span>
                        </div>

                        <select
                          value={
                            layer.blendMode ??
                            "normal"
                          }
                          disabled={
                            layer.locked
                          }
                          onChange={(event) =>
                            onBlendModeChange(
                              layer.id,
                              event.target
                                .value as BlendMode
                            )
                          }
                          className="mb-3 w-full rounded-md border border-white/10 bg-[#151823] px-2 py-1.5 text-[11px] text-gray-200 outline-none focus:border-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <option value="normal">Normal</option>
                          <option value="multiply">Multiply</option>
                          <option value="screen">Screen</option>
                          <option value="overlay">Overlay</option>
                          <option value="soft-light">Soft Light</option>
                          <option value="darken">Darken</option>
                          <option value="lighten">Lighten</option>
                          <option value="color-dodge">Color Dodge</option>
                        </select>

                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Opacity
                          </span>

                          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                            {Math.round(
                              layer.opacity
                            )}
                            %
                          </span>
                        </div>

                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={layer.opacity}
                          disabled={layer.locked}
                          onPointerDown={() =>
                            onOpacityStart()
                          }
                          onChange={(event) =>
                            onOpacityChange(
                              layer.id,
                              Number(
                                event.target.value
                              )
                            )
                          }
                          className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                        />
                      </div>

                      <div
                        className="mt-3 border-t border-white/10 pt-2"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold tracking-[0.12em] text-gray-400">
                            MASK
                          </span>

                          {layer.maskSrc && (
                            <span className="text-[10px] text-gray-500">
                              {(layer.maskEnabled ?? true)
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          )}
                        </div>

                        {!layer.maskSrc ? (
                          <button
                            disabled={layer.locked}
                            onClick={() =>
                              onAddMask(
                                layer.id
                              )
                            }
                            className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-2 text-[10px] text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            + Add Layer Mask
                          </button>
                        ) : (
                          <>
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                disabled={layer.locked}
                                onClick={() =>
                                  onToggleMask(
                                    layer.id
                                  )
                                }
                                className="rounded bg-white/5 px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/10 disabled:opacity-30"
                              >
                                {(layer.maskEnabled ?? true)
                                  ? "Disable"
                                  : "Enable"}
                              </button>

                              <button
                                disabled={layer.locked}
                                onClick={() =>
                                  onInvertMask(
                                    layer.id
                                  )
                                }
                                className="rounded bg-white/5 px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/10 disabled:opacity-30"
                              >
                                Invert
                              </button>

                              <button
                                disabled={layer.locked}
                                onClick={() =>
                                  onRemoveMask(
                                    layer.id
                                  )
                                }
                                className="rounded bg-red-500/10 px-2 py-1.5 text-[10px] text-red-300 hover:bg-red-500/20 disabled:opacity-30"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-1">
                              <button
                                disabled={layer.locked}
                                onClick={() =>
                                  onRevealAllMask(
                                    layer.id
                                  )
                                }
                                className="rounded bg-white/5 px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                Reveal All
                              </button>

                              <button
                                disabled={layer.locked}
                                onClick={() =>
                                  onHideAllMask(
                                    layer.id
                                  )
                                }
                                className="rounded bg-white/5 px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                Hide All
                              </button>
                            </div>

                            <div className="mt-3">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  Density
                                </span>

                                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                                  {Math.round(
                                    layer.maskDensity ??
                                      100
                                  )}
                                  %
                                </span>
                              </div>

                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={
                                  layer.maskDensity ??
                                  100
                                }
                                disabled={
                                  layer.locked ||
                                  !(layer.maskEnabled ?? true)
                                }
                                onPointerDown={() =>
                                  onMaskDensityStart()
                                }
                                onChange={(event) =>
                                  onMaskDensityChange(
                                    layer.id,
                                    Number(
                                      event.target.value
                                    )
                                  )
                                }
                                className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                              />
                            </div>

                            <div className="mt-3">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  Feather
                                </span>

                                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
                                  {Math.round(
                                    layer.maskFeather ??
                                      0
                                  )}
                                  px
                                </span>
                              </div>

                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={
                                  layer.maskFeather ??
                                  0
                                }
                                disabled={
                                  layer.locked ||
                                  !(layer.maskEnabled ?? true)
                                }
                                onPointerDown={() =>
                                  onMaskFeatherStart()
                                }
                                onChange={(event) =>
                                  onMaskFeatherChange(
                                    layer.id,
                                    Number(
                                      event.target.value
                                    )
                                  )
                                }
                                className="w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-4 gap-1">

                      <ActionButton
                        title="↑"
                        label="Move layer up"
                        onClick={() =>
                          onMoveUp(
                            layer.id
                          )
                        }
                      />

                      <ActionButton
                        title="↓"
                        label="Move layer down"
                        onClick={() =>
                          onMoveDown(
                            layer.id
                          )
                        }
                      />

                      <ActionButton
                        title="Copy"
                        label="Duplicate layer"
                        onClick={() =>
                          onDuplicate(
                            layer.id
                          )
                        }
                      />

                      <ActionButton
                        title="Delete"
                        label="Delete layer"
                        danger
                        onClick={() =>
                          onDelete(
                            layer.id
                          )
                        }
                      />

                      </div>
                    </>
                  )}

                </div>
              );
            }
          )}

        </div>
      )}

      {layers.length > 0 && (
        <div className="border-t border-white/10 px-4 py-2 text-[10px] text-gray-500">
          Drag/Reorder • Drop into Folder • Rename • Blend • Opacity • Mask
        </div>
      )}

    </section>
  );
}

function ActionButton({
  title,
  label,
  danger = false,
  onClick,
}: {
  title: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={label}
      onClick={(
        event
      ) => {
        event.stopPropagation();
        onClick();
      }}
      className={
        danger
          ? "rounded bg-red-500/10 px-2 py-1.5 text-[10px] text-red-300 hover:bg-red-500/20"
          : "rounded bg-white/5 px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/10"
      }
    >
      {title}
    </button>
  );
}
