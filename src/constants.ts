export const floorX = 10
export const floorY = 10
export const gridSnap = 0.5
export const floorThickness = 0.1
export const cubeHalf = 0.5
export const binHalf = 0.05
export const minScale = 0.1

export type TransformMode = "translate" | "scale"

export type ItemProps = {
	id: number
	position: [number, number, number]
	selected: boolean
	mode: TransformMode
	editing: boolean
	onSelect: (id: number) => void
	onDoubleClick: (id: number) => void
	onTransformingChange: (transforming: boolean) => void
	onPositionChange: (id: number, position: [number, number, number]) => void
}
