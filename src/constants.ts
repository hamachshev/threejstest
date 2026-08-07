// Only used to build the initial floor shape in the scene-state constructor —
// everywhere else derives the floor's actual size from that shape/polygon.
export const defaultFloorX = 10;
export const defaultFloorY = 10;
export const gridSnap = 0.5;
export const floorThickness = 0.1;
export const cubeHalf = 0.5;
export const binHalf = 0.025;
export const minScale = 0.1;

// axis colors, shared by CompassGizmo and DimensionLabels
export const axisColors = { x: "#ff2060", y: "#20df80", z: "#2080ff" } as const;
