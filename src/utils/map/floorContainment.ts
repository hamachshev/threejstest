import type { Point } from "../../types";

export let pointInPolygon = (x: number, z: number, polygon: Point[]) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let a = polygon[i];
    let b = polygon[j];
    let intersect =
      a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x;
    if (intersect) inside = !inside;
  }
  return inside;
};

let orientation = (a: Point, b: Point, c: Point) => {
  let val = (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
  if (val === 0) return 0;
  return val > 0 ? 1 : 2;
};

let onSegment = (a: Point, b: Point, c: Point) =>
  Math.min(a.x, c.x) <= b.x &&
  b.x <= Math.max(a.x, c.x) &&
  Math.min(a.z, c.z) <= b.z &&
  b.z <= Math.max(a.z, c.z);

export let segmentsIntersect = (p1: Point, p2: Point, p3: Point, p4: Point) => {
  let o1 = orientation(p1, p2, p3);
  let o2 = orientation(p1, p2, p4);
  let o3 = orientation(p3, p4, p1);
  let o4 = orientation(p3, p4, p2);

  if (o1 !== o2 && o3 !== o4) return true;

  if (o1 === 0 && onSegment(p1, p3, p2)) return true;
  if (o2 === 0 && onSegment(p1, p4, p2)) return true;
  if (o3 === 0 && onSegment(p3, p1, p4)) return true;
  if (o4 === 0 && onSegment(p3, p2, p4)) return true;

  return false;
};

// Sub-millimeter shrink applied to the tested footprint so a box flush
// against the wall reads as strictly inside instead of being rejected by
// boundary-touching false positives in pointInPolygon/segmentsIntersect.
let containmentEpsilon = 1e-3;

// Checks that an axis-aligned box footprint sits fully inside the floor
// polygon: all 4 corners must be inside, and no box edge may cross a floor
// boundary edge (the corner check alone misses a box that straddles a
// concave notch with all corners landing inside two different "arms").
export let footprintInPolygon = (
  x: number,
  z: number,
  halfX: number,
  halfZ: number,
  polygon: Point[],
) => {
  halfX = Math.max(0, halfX - containmentEpsilon);
  halfZ = Math.max(0, halfZ - containmentEpsilon);
  let corners: Point[] = [
    { x: x - halfX, z: z - halfZ },
    { x: x + halfX, z: z - halfZ },
    { x: x + halfX, z: z + halfZ },
    { x: x - halfX, z: z + halfZ },
  ];

  if (!corners.every((corner) => pointInPolygon(corner.x, corner.z, polygon)))
    return false;

  for (let i = 0; i < corners.length; i++) {
    let boxA = corners[i];
    let boxB = corners[(i + 1) % corners.length];
    for (let j = 0; j < polygon.length; j++) {
      let polyA = polygon[j];
      let polyB = polygon[(j + 1) % polygon.length];
      if (segmentsIntersect(boxA, boxB, polyA, polyB)) return false;
    }
  }

  return true;
};
