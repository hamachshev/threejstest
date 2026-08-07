import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Shape } from "three";
import type { Polygon } from "../../types";
import { defaultFloorX, defaultFloorY } from "../../constants";

// Recenters the shape on its own bounding-box center, so downstream code
// (grid, extrusion, floor polygon) can all assume the floor sits at the origin.
let centerShape = (shape: Shape) => {
  let points = shape.getPoints();
  let xs = points.map((p) => p.x);
  let ys = points.map((p) => p.y);
  let centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  let centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

  let centered = new Shape();
  points.forEach((p, i) => {
    let x = p.x - centerX;
    let y = p.y - centerY;
    if (i === 0) centered.moveTo(x, y);
    else centered.lineTo(x, y);
  });
  centered.closePath();
  return centered;
};

export let parseFloorSvg = (svgText: string): Shape | null => {
  let data = new SVGLoader().parse(svgText);
  let shapes = data.paths.flatMap((path) => path.toShapes());
  let shape = shapes[0];
  return shape ? centerShape(shape) : null;
};

export let readFloorSvgFile = async (file: File): Promise<Shape | null> => {
  let text = await file.text();
  return parseFloorSvg(text);
};

export let shapeFromPolygon = (polygon: Polygon): Shape => {
  let shape = new Shape();
  polygon.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, p.z);
    else shape.lineTo(p.x, p.z);
  });
  shape.closePath();
  return shape;
};

// The floor always has a real Shape in scene state — this builds the initial
// one (a defaultFloorX × defaultFloorY rectangle), used only when the scene
// state is constructed. Nothing downstream needs those constants directly;
// it all reads the actual floorShape/floorPolygon instead.
export let createDefaultFloorShape = (): Shape =>
  shapeFromPolygon([
    { x: -defaultFloorX / 2, z: -defaultFloorY / 2 },
    { x: defaultFloorX / 2, z: -defaultFloorY / 2 },
    { x: defaultFloorX / 2, z: defaultFloorY / 2 },
    { x: -defaultFloorX / 2, z: defaultFloorY / 2 },
  ]);

export let polygonFromShape = (shape: Shape): Polygon =>
  shape.getPoints().map((p) => ({ x: p.x, z: p.y }));

export type FloorBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  depth: number;
};

export let boundsFromPolygon = (polygon: Polygon): FloorBounds => {
  let xs = polygon.map((p) => p.x);
  let zs = polygon.map((p) => p.z);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minZ = Math.min(...zs);
  let maxZ = Math.max(...zs);
  return { minX, maxX, minZ, maxZ, width: maxX - minX, depth: maxZ - minZ };
};
