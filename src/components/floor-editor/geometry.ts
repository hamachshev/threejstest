import { gridSnap } from "../../constants";

export type Point = { x: number; y: number };

// Branded so a screen (pixel) point can't be passed where a world (feet) point
// is expected, or vice versa, without going through worldToScreen/screenToWorld.
export type WorldPoint = Point & { readonly __unit: "world" };
export type ScreenPoint = Point & { readonly __unit: "screen" };

export let worldPoint = (x: number, y: number) => ({ x, y }) as WorldPoint;
export let screenPoint = (x: number, y: number) => ({ x, y }) as ScreenPoint;

export type Segment = { a: WorldPoint; b: WorldPoint; length: number };

export const UNIT_SIZE = 24;
export const VIEW_SIZE = 640;
export const CENTER = VIEW_SIZE / 2;
export const CLOSE_THRESHOLD = 0.5;
export const SEGMENT_HIT_THRESHOLD = 0.35;
export const MAJOR_GRID_INTERVAL = 5;

export let snap = (v: number) => Math.round(v / gridSnap) * gridSnap;
export let snapPoint = (p: WorldPoint) => worldPoint(snap(p.x), snap(p.y));

export let worldToScreen = (p: WorldPoint) =>
  screenPoint(CENTER + p.x * UNIT_SIZE, CENTER + p.y * UNIT_SIZE);
export let screenToWorld = (p: ScreenPoint) =>
  worldPoint((p.x - CENTER) / UNIT_SIZE, (p.y - CENTER) / UNIT_SIZE);

export let distance = <T extends Point>(a: T, b: T) =>
  Math.hypot(b.x - a.x, b.y - a.y);

export let distanceToSegment = (
  p: WorldPoint,
  a: WorldPoint,
  b: WorldPoint,
) => {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return distance(p, a);
  let t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq),
  );
  let closest = worldPoint(a.x + t * dx, a.y + t * dy);
  return distance(p, closest);
};

export let computeSegments = (
  points: WorldPoint[],
  closed: boolean,
): Segment[] => {
  if (points.length < 2) return [];
  let count = closed ? points.length : points.length - 1;
  return Array.from({ length: count }, (_, i) => {
    let a = points[i];
    let b = points[(i + 1) % points.length];
    return { a, b, length: distance(a, b) };
  });
};

export let resizeSegment = (
  points: WorldPoint[],
  index: number,
  newLength: number,
): WorldPoint[] | null => {
  if (!Number.isFinite(newLength) || newLength <= 0) return null;

  let n = points.length;
  let j = (index + 1) % n;
  let a = points[index];
  let b = points[j];
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let currentLength = Math.hypot(dx, dy);
  if (currentLength === 0) return null;

  let ux = dx / currentLength;
  let uy = dy / currentLength;
  let newPoint = worldPoint(a.x + ux * newLength, a.y + uy * newLength);
  return points.map((p, idx) => (idx === j ? newPoint : p));
};

export let downloadSvg = (points: WorldPoint[]) => {
  // Keep raw world (feet) coordinates here, not screen pixels, so the exported
  // shape is dimensionally accurate when imported elsewhere (e.g. Three.js).
  let xs = points.map((p) => p.x);
  let ys = points.map((p) => p.y);
  let minX = Math.min(...xs);
  let minY = Math.min(...ys);
  let maxX = Math.max(...xs);
  let maxY = Math.max(...ys);
  let pointsAttr = points.map((p) => `${p.x},${p.y}`).join(" ");
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}">
	<polygon points="${pointsAttr}" fill="none" stroke="#000" stroke-width="0.05" />
</svg>
`;
  let blob = new Blob([svg], { type: "image/svg+xml" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "floor-plan.svg";
  a.click();
  URL.revokeObjectURL(url);
};
