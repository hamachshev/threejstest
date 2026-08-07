import type { Dispatch, RefObject, SetStateAction } from "react";
import { gridSnap } from "../../constants";
import { screenCoordinate } from "../../types";
import type { Item, TransformMode } from "../../types";

export type MapKeyboardEventListenerParams = {
  editing: boolean;
  items: Item[];
  selectedId: number | null;
  setItems: Dispatch<SetStateAction<Item[]>>;
  setSelectedId: Dispatch<SetStateAction<number | null>>;
  setMode: Dispatch<SetStateAction<TransformMode>>;
  setEditing: Dispatch<SetStateAction<boolean>>;
  clipboardRef: RefObject<Omit<Item, "id"> | null>;
  getNextId: () => number;
  copy: (item: Item) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
};

export let mapKeyboardEventListener = (
  e: KeyboardEvent,
  {
    editing,
    items,
    selectedId,
    setItems,
    setSelectedId,
    setMode,
    clipboardRef,
    getNextId,
    setEditing,
    copy,
    pushHistory,
    undo,
    redo,
  }: MapKeyboardEventListenerParams,
) => {
  if (!editing) return;

  if (e.key === "Delete" || e.key === "Backspace") {
    pushHistory();
    setItems((prev) => prev.filter((item) => item.id !== selectedId));
    setEditing(false);
    return;
  }
  if (e.key === "Enter" || e.key === "Escape") {
    e.preventDefault();
    setEditing(false);
  }

  let isModifierHeld = e.metaKey || e.ctrlKey;
  if (!isModifierHeld) return;

  if (e.key.toLowerCase() === "c") {
    let selectedItem = items.find((item) => item.id === selectedId);
    if (!selectedItem) return;
    e.preventDefault();
    copy(selectedItem);
  } else if (e.key.toLowerCase() === "v") {
    let copied = clipboardRef.current;
    if (!copied) return;
    e.preventDefault();
    pushHistory();
    let id = getNextId();
    let [x, y, z] = copied.position;
    setItems((prev) => [
      ...prev,
      {
        type: copied.type,
        id,
        position: screenCoordinate(x + gridSnap, y, z + gridSnap),
        scale: [...copied.scale],
      },
    ]);
    setSelectedId(id);
    setMode("translate");
  } else if (e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  } else if (e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
  } else if (e.key.toLowerCase() === "s") {
    e.preventDefault();
    setEditing(false);
  }
};
