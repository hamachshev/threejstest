import type { Point, ScreenCoordinate, WorldCoordinate } from "../../types";
import { screenCoordinate, worldCoordinate } from "../../types";
import { boundsFromPolygon } from "./floorSvg";

// Converts a scene-space point (Three.js, floor-center-origin, Y-up) into
// real-world warehouse coordinates anchored at the floor's own +X, +Z corner
// as the origin (that corner's scene coordinates are the polygon's max x/z —
// both the default rectangle and imported SVG shapes are centered on the
// scene origin, so max = -min and this holds for either).
//
// Warehouse X/Y are the floor plane, warehouse Z is height, so this reads
// Three.js (x, z, y) into warehouse (x, y, z) — i.e. world.y comes from
// Three.js z, world.z from Three.js y. x/y grow as you move away from the
// origin corner into the floor; z (height) passes through unchanged.
export let toWorldCoordinates = (
  [x, y, z]: ScreenCoordinate,
  floorPolygon: Point[],
): WorldCoordinate => {
  let { maxX, maxZ } = boundsFromPolygon(floorPolygon);

  return worldCoordinate(maxX - x, maxZ - z, y);
};

// Converts an item's center position + world-space size into its +X,+Z
// bottom corner in warehouse coordinates — the same point ItemLabels shows
// above each item, so any other UI (e.g. the sidebar) stays consistent with
// what's drawn in the scene.
export let toWorldCorner = (
  [x, y, z]: ScreenCoordinate,
  [sizeX, sizeY, sizeZ]: [number, number, number],
  floorPolygon: Point[],
): WorldCoordinate =>
  toWorldCoordinates(
    screenCoordinate(x + sizeX / 2, y - sizeY / 2, z + sizeZ / 2),
    floorPolygon,
  );

// Inverse of toWorldCorner: given the item's desired +X,+Z bottom corner in
// warehouse coordinates (plus its current size), returns the scene-space
// center position that would put it there. Used when a user edits the
// coordinate label directly.
export let fromWorldCorner = (
  corner: WorldCoordinate,
  [sizeX, sizeY, sizeZ]: [number, number, number],
  floorPolygon: Point[],
): ScreenCoordinate => {
  let { maxX, maxZ } = boundsFromPolygon(floorPolygon);

  return screenCoordinate(
    maxX - corner.x - sizeX / 2,
    corner.z + sizeY / 2,
    maxZ - corner.y - sizeZ / 2,
  );
};
