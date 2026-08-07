import type { Shape } from "three";

export type TransformMode = "translate" | "scale";

//this is x and *z* as opposed to y bc three js coords y is up and down
export type Point = { x: number; z: number };

// A scene-space position re-anchored to the floor's own corner as the origin
// (see utils/map/worldCoordinates.ts) — x/y are the floor plane, z is height.
export type WorldCoordinate = { x: number; y: number; z: number };

export let itemTypes = ["cube", "bin"] as const;
export type ItemType = (typeof itemTypes)[number];

export type Item = {
  type: ItemType;
  id: number;
  position: [number, number, number];
  scale: [number, number, number];
};

// Everything that should be captured together in one undo/redo snapshot.
// Add new undoable fields here — useHistory treats this opaquely, so nothing
// else needs to change for them to become undo-tracked.
export type SceneState = { items: Item[]; floorShape: Shape };

export type ItemUpdate = Partial<Pick<Item, "position" | "scale">>;

export type ItemProps = {
  id: number;
  position: [number, number, number];
  scale: [number, number, number];
  selected: boolean;
  mode: TransformMode;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  floorPolygon: Point[];
  onSelect: (id: number) => void;
  onDoubleClick: (id: number) => void;
  onTransformingChange: (transforming: boolean) => void;
  onUpdateItem: (id: number, changes: ItemUpdate) => void;
  onBeginTransform: () => void;
};

export type Polygon = Point[];
