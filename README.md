# Warehouse Builder & Floor Editor

A React + Three.js app for laying out a warehouse floor plan and placing items
(cubes, bins) on it. Two routes, two editors:

- **`/` — Builder**: a 3D scene where you place and arrange items on a floor.
- **`/floor-editor` — Floor Editor**: a 2D top-down tool for drawing the floor
  polygon itself (the shape used as the floor in the Builder).

All positions/dimensions are in feet, snapped to a half-foot grid (`gridSnap`
in `src/constants.ts`).

## Builder (`/`)

Add cubes and bins, arrange them on the floor, and export the scene.

- **Add items**: "Cube" / "Bin" buttons (enabled while editing).
- **Editing mode**: toggle with the "Edit"/"Confirm" button, `Escape`, or
  `Cmd/Ctrl+S`. Clicking away from any item (`onPointerMissed`) also exits
  editing and deselects.
- **Select an item**: click it in the scene, or click its entry in the
  sidebar list (grouped by type, showing its position).
- **Move / resize**: selected items show a transform gizmo.
  - Translate mode snaps to the grid and is clamped so the item's footprint
    stays inside the floor polygon.
  - Scale mode grows/shrinks from a fixed anchor corner (not the center),
    also clamped to stay on the floor and above a minimum size.
  - Double-click an item (or its sidebar entry) to switch between
    translate/scale mode.
- **Dimension labels**: while selected, each item shows its length/width/
  height next to its edges, color-coded per axis, plus its top corner
  position in warehouse coordinates (origin at the floor's own corner, not
  the Three.js scene center). Double-click a dimension label to type an
  exact value.
- **Undo / redo**: `Cmd/Ctrl+Z` / `Shift+Cmd/Ctrl+Z` or `Cmd/Ctrl+Y`.
- **Copy / paste**: `Cmd/Ctrl+C` copies the selected item; `Cmd/Ctrl+V`
  pastes a duplicate offset by one grid step.
- **Delete**: `Delete`/`Backspace` removes the selected item.
- **Log Positions**: prints every item's warehouse coordinates to the
  console, grouped by type.
- **Import / export**:
  - Export the scene to a `.glb` file.
  - Import a `.glb` model back in.
  - Import a floor shape from an `.svg` file.
- Orbit camera controls with a compass gizmo for orientation.

## Floor Editor (`/floor-editor`)

Draw the polygon that defines the floor's shape, in 2D, top-down.

- **Draw the shape**: click to place points one at a time; a dashed preview
  line and live length tooltip show where the next segment will land.
- **Close the shape**: click back near the first point, or press "Close
  Shape" (needs at least 3 points). "Undo Point" removes the last placed
  point; "Clear" resets everything.
- **Edit a segment's length**: click a segment (on the canvas or in the
  sidebar's "Segments" list) to select it, then type an exact length —
  the far endpoint moves along the segment's direction to match.
- **Select / delete a vertex**: click a point (on the canvas or in the
  sidebar's "Points" list) to select it; press `Delete`/`Backspace` to
  remove it (blocked if it would drop the shape below 3 points). Segment
  and point selection are mutually exclusive.
- **Move a vertex**: drag it to reshape the polygon. Hold `Shift` while
  dragging to snap to the grid; otherwise it moves freely.
- **Insert a point on a line**: hold `Shift` and hover near an existing
  segment — a preview point appears and slides along that line under the
  cursor. Click to confirm and keep it, or move away / release `Shift` to
  cancel it.
- **Export**: "Export SVG" downloads the polygon in real-world (feet) units.
- Compass gizmo for orientation, matching the Builder's.

## Development

Built with Vite + React + TypeScript. Canvas rendering uses
`@react-three/fiber`/`drei` (Builder, 3D) and `react-konva` (Floor Editor,
2D).

```
npm run dev       # start the dev server
npm run build     # tsc -b (project references) and build
npm run lint      # oxlint
npm run preview   # preview a production build
```
