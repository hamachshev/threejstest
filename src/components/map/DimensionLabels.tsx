import { Billboard, Text } from "@react-three/drei";
import { axisColors } from "../../constants";

type DimensionLabelsProps = {
	position: [number, number, number]
	size: [number, number, number]
}

let format = (value: number) => value.toFixed(2)

// When outlineWidth is set, troika's `material` getter returns an array
// ([outlineMaterial, fillMaterial]) instead of a single material, so the usual
// `material-depthTest` dot-prop silently no-ops (it lands on the array, not on
// either material). Set depthTest directly on whichever material(s) come back
// once troika finishes syncing, so the label always draws in front regardless
// of what's between the camera and it (floor, other items, ...).
let handleSync = (troika: any) => {
	let materials = Array.isArray(troika.material) ? troika.material : [troika.material]
	materials.forEach((material: any) => { material.depthTest = false })
}

let labelProps = {
	fontSize: 0.18,
	outlineWidth: 0.015,
	outlineColor: "black",
	anchorX: "center" as const,
	anchorY: "middle" as const,
	renderOrder: 999,
	onSync: handleSync,
}

// Shows length (X), width (Z), and depth (Y) next to the selected item's edges,
// color-coded to match the axis colors used by CompassGizmo.
export let DimensionLabels = ({ position, size }: DimensionLabelsProps) => {
	let [x, y, z] = position
	let [sizeX, sizeY, sizeZ] = size
	let halfX = sizeX / 2
	let halfY = sizeY / 2
	let halfZ = sizeZ / 2
	let offset = 0.15

	return (
		<>
			<Billboard position={[x, y - halfY, z + halfZ + offset]}>
				<Text {...labelProps} color={axisColors.x}>{format(sizeX)}</Text>
			</Billboard>
			<Billboard position={[x + halfX + offset, y - halfY, z]}>
				<Text {...labelProps} color={axisColors.z}>{format(sizeZ)}</Text>
			</Billboard>
			<Billboard position={[x + halfX + offset, y, z + halfZ + offset]}>
				<Text {...labelProps} color={axisColors.y}>{format(sizeY)}</Text>
			</Billboard>
		</>
	)
}
