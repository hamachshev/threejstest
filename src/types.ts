import type { Shape } from "three"

export type TransformMode = "translate" | "scale"

export type FloorPoint = { x: number; z: number }

export let itemTypes = ["cube", "bin"] as const
export type ItemType = typeof itemTypes[number]

export type Item = { type: ItemType; id: number; position: [number, number, number]; scale: [number, number, number] }

// Everything that should be captured together in one undo/redo snapshot.
// Add new undoable fields here — useHistory treats this opaquely, so nothing
// else needs to change for them to become undo-tracked.
export type SceneState = { items: Item[]; floorShape: Shape | null }

export type ItemUpdate = Partial<Pick<Item, "position" | "scale">>

export type ItemProps = {
	id: number
	position: [number, number, number]
	scale: [number, number, number]
	selected: boolean
	mode: TransformMode
	editing: boolean
	setEditing: (editing: boolean) => void
	floorPolygon: FloorPoint[]
	onSelect: (id: number) => void
	onDoubleClick: (id: number) => void
	onTransformingChange: (transforming: boolean) => void
	onUpdateItem: (id: number, changes: ItemUpdate) => void
	onBeginTransform: () => void
}
