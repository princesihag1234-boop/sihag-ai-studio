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

  const [
    openActionMenu,
    setOpenActionMenu,
  ] = useState<{
    kind: "folder" | "layer";
    id: string;
  } | null>(null);

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
    <section className="sihag-layer-panel border-b border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0))]">

      <div className="sihag-layer-panel-header sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-white/[0.06] bg-[#11141b]/95 px-4 py-3 backdrop-blur-xl">

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
          className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/[0.10] disabled:cursor-not-allowed disabled:opacity-30"
        >
          + Folder
        </button>

      </div>

      {groups.length > 0 && (
        <div className="mx-2 mb-3 space-y-1 rounded-2xl border border-white/[0.065] bg-white/[0.018] p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">

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
                      "sihag-folder-row relative flex flex-wrap items-center gap-2 rounded-xl border px-2.5 py-2.5 transition-all duration-150",
                      dragOverGroupId ===
                      group.id
                        ? "border-cyan-400/60 bg-cyan-400/[0.10] shadow-[0_0_0_1px_rgba(34,211,238,0.10)]"
                        : "border-white/[0.055] bg-white/[0.025] hover:border-white/[0.10] hover:bg-white/[0.045]",
                    ].join(
                      " "
                    )
                  }
                >

                  {dragOverGroupId ===
                    group.id &&
                    draggingLayerId && (
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-lg">
                      <div className="mb-1 rounded-full border border-cyan-200/20 bg-cyan-400/90 px-2.5 py-1 text-[8px] font-semibold tracking-wide text-[#041014] shadow-lg">
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
                    className="sihag-folder-collapse flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-[10px] text-gray-400 transition hover:border-white/[0.08] hover:bg-white/[0.055]"
                  >
                    {group.collapsed
                      ? "▶"
                      : "▼"}
                  </button>

                  <span className="sihag-folder-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.055] bg-black/10 text-gray-400">
                    <FolderVectorIcon
                      open={!group.collapsed}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-semibold text-gray-200">
                      {group.name}
                    </div>
                    <div className="mt-0.5 truncate text-[9px] text-gray-600">
                      {count}
                      {count === 1
                        ? " layer"
                        : " layers"}
                      {!group.visible && " • Hidden"}
                      {group.locked && " • Locked"}
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
                        ? "sihag-layer-quick-action text-gray-300"
                        : "sihag-layer-quick-action bg-red-500/10 text-red-300"
                    }
                  >
                    <LayerVisibilityIcon
                      visible={group.visible}
                    />
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
                        ? "sihag-layer-quick-action bg-amber-500/10 text-amber-300"
                        : "sihag-layer-quick-action text-gray-500"
                    }
                  >
                    <LayerLockIcon
                      locked={group.locked}
                    />
                  </button>

                  <button
                    type="button"
                    title="Folder actions"
                    aria-label={`Actions for ${group.name}`}
                    aria-expanded={
                      openActionMenu?.kind === "folder" &&
                      openActionMenu.id === group.id
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenActionMenu((current) =>
                        current?.kind === "folder" && current.id === group.id
                          ? null
                          : { kind: "folder", id: group.id }
                      );
                    }}
                    className="sihag-overflow-trigger shrink-0"
                  >
                    •••
                  </button>

                  {openActionMenu?.kind === "folder" &&
                    openActionMenu.id === group.id && (
                    <div
                      className="sihag-inline-overflow-panel sihag-folder-inline-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="sihag-overflow-menu-title">
                        Folder Actions
                      </div>

                      <div className="sihag-folder-move-label">
                        Move folder layers
                      </div>
                      <div className="sihag-folder-move-grid">
                        <span />
                        <button
                          title="Move folder up 10 px"
                          disabled={count === 0 || group.locked}
                          onClick={() => onMoveGroup(group.id, 0, -10)}
                        >
                          ↑
                        </button>
                        <span />
                        <button
                          title="Move folder left 10 px"
                          disabled={count === 0 || group.locked}
                          onClick={() => onMoveGroup(group.id, -10, 0)}
                        >
                          ←
                        </button>
                        <div className="sihag-folder-move-center">10</div>
                        <button
                          title="Move folder right 10 px"
                          disabled={count === 0 || group.locked}
                          onClick={() => onMoveGroup(group.id, 10, 0)}
                        >
                          →
                        </button>
                        <span />
                        <button
                          title="Move folder down 10 px"
                          disabled={count === 0 || group.locked}
                          onClick={() => onMoveGroup(group.id, 0, 10)}
                        >
                          ↓
                        </button>
                        <span />
                      </div>

                      <div className="sihag-overflow-divider" />

                      <button
                        className="sihag-overflow-action"
                        disabled={count === 0}
                        onClick={() => {
                          onBringGroupToFront(group.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Bring to Front</span><span>⇈</span>
                      </button>
                      <button
                        className="sihag-overflow-action"
                        disabled={count === 0}
                        onClick={() => {
                          onSendGroupToBack(group.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Send to Back</span><span>⇊</span>
                      </button>
                      <button
                        className="sihag-overflow-action"
                        onClick={() => {
                          onDuplicateGroup(group.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Duplicate Folder</span><span>⧉</span>
                      </button>
                      <button
                        className="sihag-overflow-action"
                        onClick={() => {
                          renameGroupPrompt(group);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Rename Folder</span><span>✎</span>
                      </button>

                      <div className="sihag-overflow-divider" />

                      <button
                        className="sihag-overflow-action sihag-overflow-action-danger"
                        onClick={() => {
                          onDeleteGroup(group.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Delete Folder</span><span>×</span>
                      </button>
                    </div>
                  )}

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
          Visibility and lock stay one click away. Use ••• for move, order, duplicate, rename and delete.
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
              "mx-2 mb-2 flex items-center justify-center rounded-xl border border-dashed px-3 py-2.5 text-[9px] font-medium transition-all",
              dragOverUngroup
                ? "border-cyan-300/70 bg-cyan-400/[0.10] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.08)]"
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
        <div className="mx-2 mb-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.055] px-3 py-2 text-[9px] leading-4 text-cyan-100/80">
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
        <div className="space-y-1.5 px-2 pb-3">

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
                      "sihag-layer-row group relative rounded-xl border p-2.5 transition-all duration-150",
                      layer.groupId
                        ? "ml-4"
                        : "",
                      selected
                        ? "sihag-layer-row-selected border-cyan-400/45 bg-cyan-400/[0.085] shadow-[0_8px_22px_rgba(0,0,0,0.18)] ring-1 ring-cyan-300/10"
                        : multiSelected
                          ? "border-violet-400/30 bg-violet-400/[0.07]"
                          : "border-transparent hover:border-white/[0.065] hover:bg-white/[0.035]",
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
                          ? "pointer-events-none absolute -top-[2px] left-2 right-2 h-[2px] rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.55)]"
                          : "pointer-events-none absolute -bottom-[2px] left-2 right-2 h-[2px] rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.55)]"
                      }
                    />
                  )}

                  {layer.groupId && (
                    <div className="pointer-events-none absolute -left-3 top-0 bottom-0 flex items-center opacity-80">
                      <div className="h-[calc(100%-8px)] w-px bg-cyan-400/20" />
                      <div className="h-px w-3 bg-cyan-400/20" />
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-xs text-gray-300 transition hover:border-white/[0.07] hover:bg-white/[0.06]"
                    >
                      <LayerVisibilityIcon
                        visible={layer.visible}
                      />
                    </button>

                    {/* THUMBNAIL */}

                    <div className="flex shrink-0 items-center gap-1">
                      <div className="h-11 w-11 overflow-hidden rounded-xl border border-white/[0.11] bg-black/35 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">

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
                              ? "h-11 w-8 overflow-hidden rounded-lg border-2 border-cyan-300/80 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                              : "h-11 w-8 overflow-hidden rounded-lg border border-white/20 bg-white opacity-40"
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
                          className="w-full rounded-lg border border-cyan-400/40 bg-[#0b0e13] px-2.5 py-1.5 text-xs text-white outline-none ring-2 ring-cyan-400/[0.05]"
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
                          className="block w-full truncate text-left text-xs font-semibold text-gray-200 transition group-hover:text-white"
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
                            {" • Folder: "}
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-xs transition hover:border-white/[0.07] hover:bg-white/[0.06]"
                    >
                      <LayerLockIcon
                        locked={layer.locked}
                      />
                    </button>

                    <button
                      type="button"
                      title="Layer actions"
                      aria-label={`Actions for ${layer.name}`}
                      aria-expanded={
                        openActionMenu?.kind === "layer" &&
                        openActionMenu.id === layer.id
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenActionMenu((current) =>
                          current?.kind === "layer" && current.id === layer.id
                            ? null
                            : { kind: "layer", id: layer.id }
                        );
                      }}
                      className="sihag-overflow-trigger shrink-0"
                    >
                      •••
                    </button>

                  </div>

                  {openActionMenu?.kind === "layer" &&
                    openActionMenu.id === layer.id && (
                    <div
                      className="sihag-inline-overflow-panel sihag-layer-inline-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="sihag-overflow-menu-title">
                        Layer Actions
                      </div>
                      <button
                        className="sihag-overflow-action"
                        onClick={() => {
                          beginRename(layer);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Rename</span><span>✎</span>
                      </button>
                      <button
                        className="sihag-overflow-action"
                        onClick={() => {
                          onMoveUp(layer.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Move Up</span><span>↑</span>
                      </button>
                      <button
                        className="sihag-overflow-action"
                        onClick={() => {
                          onMoveDown(layer.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Move Down</span><span>↓</span>
                      </button>
                      <button
                        className="sihag-overflow-action"
                        onClick={() => {
                          onDuplicate(layer.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Duplicate</span><span>⧉</span>
                      </button>
                      <div className="sihag-overflow-divider" />
                      <button
                        className="sihag-overflow-action sihag-overflow-action-danger"
                        onClick={() => {
                          onDelete(layer.id);
                          setOpenActionMenu(null);
                        }}
                      >
                        <span>Delete Layer</span><span>×</span>
                      </button>
                    </div>
                  )}

                  {selected && (
                    <>
                      <div
                        className="mt-2.5 rounded-xl border border-white/[0.065] bg-black/[0.12] p-2.5"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <div className="mb-3 rounded-xl border border-white/[0.055] bg-white/[0.018] p-2.5">

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
                            className="w-full rounded-lg border border-white/[0.09] bg-[#0d1016] px-2.5 py-2 text-[11px] text-gray-100 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/[0.06]"
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
                          className="mb-3 w-full rounded-lg border border-white/[0.09] bg-[#0d1016] px-2.5 py-2 text-[11px] text-gray-100 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
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

                          <span className="rounded-md border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
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
                          className="w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                        />
                      </div>

                      <div
                        className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-2.5"
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
                            className="w-full rounded-lg border border-cyan-400/15 bg-cyan-400/[0.055] px-2 py-2 text-[10px] font-medium text-cyan-100 transition hover:bg-cyan-400/[0.10] disabled:cursor-not-allowed disabled:opacity-30"
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

                                <span className="rounded-md border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
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
                                className="w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                              />
                            </div>

                            <div className="mt-3">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  Feather
                                </span>

                                <span className="rounded-md border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[10px] tabular-nums text-gray-300">
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
                                className="w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                              />
                            </div>
                          </>
                        )}
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
        <div className="border-t border-white/[0.07] bg-black/[0.08] px-4 py-2.5 text-[9px] tracking-[0.02em] text-gray-600">
          Drag to reorder • Double-click to rename • ••• for layer actions • Blend • Opacity • Mask
        </div>
      )}

    </section>
  );
}

function LayerVisibilityIcon({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M2.7 12s3.2-5 9.3-5 9.3 5 9.3 5-3.2 5-9.3 5-9.3-5-9.3-5Z" />
          <circle cx="12" cy="12" r="2.6" />
        </>
      ) : (
        <>
          <path d="M4.3 4.3 19.7 19.7" />
          <path d="M9.6 7.4A10.4 10.4 0 0 1 12 7c6.1 0 9.3 5 9.3 5a15.4 15.4 0 0 1-2.5 2.8" />
          <path d="M6.2 8.6A15.9 15.9 0 0 0 2.7 12s3.2 5 9.3 5c1 0 1.9-.1 2.7-.4" />
        </>
      )}
    </svg>
  );
}

function LayerLockIcon({
  locked,
}: {
  locked: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[14px] w-[14px]"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path
        d={
          locked
            ? "M8 10V7.6a4 4 0 0 1 8 0V10"
            : "M8 10V7.6a4 4 0 0 1 7.4-2.1"
        }
      />
    </svg>
  );
}

function FolderVectorIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[16px] w-[16px]"
      aria-hidden="true"
    >
      <path d="M3.5 7.5h6l1.7 2H20.5v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
      {open && <path d="M4 11h16" />}
    </svg>
  );
}

