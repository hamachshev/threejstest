import type { Shape } from "three";

export type TransformMode = "translate" | "scale";

export type Axis = "x" | "y" | "z";

//this is x and *z* as opposed to y bc three js coords y is up and down
export type Point = { x: number; z: number };

// A Three.js scene-space position (center-origin, Y-up) — the coordinate
// system items are actually positioned/rendered in. Distinct from
// WorldCoordinate below (a scene-space position re-anchored to the floor's
// own corner as the origin — see utils/map/worldCoordinates.ts — x/y are the
// floor plane, z is height).  convert between them via
// toWorldCoordinates/toWorldCorner/fromWorldCorner
export type ScreenCoordinate = [number, number, number] & {
  readonly __space: "screen";
};
export type WorldCoordinate = { x: number; y: number; z: number } & {
  readonly __space: "world";
};

export let screenCoordinate = (
  x: number,
  y: number,
  z: number,
): ScreenCoordinate => [x, y, z] as ScreenCoordinate;
export let worldCoordinate = (
  x: number,
  y: number,
  z: number,
): WorldCoordinate => ({ x, y, z }) as WorldCoordinate;

export let itemTypes = ["cube", "bin"] as const;
export type ItemType = (typeof itemTypes)[number];

export type Item = {
  type: ItemType;
  id: number;
  position: ScreenCoordinate;
  scale: [number, number, number];
};

// Everything that should be captured together in one undo/redo snapshot.
// Add new undoable fields here — useHistory treats this opaquely, so nothing
// else needs to change for them to become undo-tracked.
export type SceneState = { items: Item[]; floorShape: Shape };

export type ItemUpdate = Partial<Pick<Item, "position" | "scale">>;

export type ItemProps = {
  id: number;
  position: ScreenCoordinate;
  scale: [number, number, number];
  selected: boolean;
  mode: TransformMode;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  floorPolygon: Point[];
  onSelect: (id: number) => void;
  onDoubleClick: (id: number) => void;
  setTransforming: (transforming: boolean) => void;
  onUpdateItem: (id: number, changes: ItemUpdate) => void;
};

export type Polygon = Point[];
