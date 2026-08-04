export type TransformMode = "translate" | "scale"

export type FloorPoint = { x: number; z: number }

export let itemTypes = ["cube", "bin"] as const
export type ItemType = typeof itemTypes[number]

export type Item = { type: ItemType; id: number; position: [number, number, number] }

export type ItemProps = {
	id: number
	position: [number, number, number]
	selected: boolean
	mode: TransformMode
	editing: boolean
	floorPolygon: FloorPoint[]
	onSelect: (id: number) => void
	onDoubleClick: (id: number) => void
	onTransformingChange: (transforming: boolean) => void
	onPositionChange: (id: number, position: [number, number, number]) => void
}
