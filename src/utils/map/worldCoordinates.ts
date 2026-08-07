import type { Point, WorldCoordinate } from "../../types";
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
  [x, y, z]: [number, number, number],
  floorPolygon: Point[],
): WorldCoordinate => {
  let { maxX, maxZ } = boundsFromPolygon(floorPolygon);

  return {
    x: maxX - x,
    y: maxZ - z,
    z: y,
  };
};
