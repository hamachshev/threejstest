import { TransformControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { binHalf, floorX, floorY, gridSnap, minScale } from "../constants";
import type { ItemProps } from "../constants";

export let Bin = ({ id, position, selected, mode, editing, onSelect, onDoubleClick, onTransformingChange, onPositionChange }: ItemProps) => {
	let meshRef = useRef<Mesh>(null!)

	let clampToFloor = () => {
		let mesh = meshRef.current
		if (!mesh) return
		let halfX = mesh.scale.x / 2
		let halfY = mesh.scale.y * binHalf
		let halfZ = mesh.scale.z / 2
		let maxX = floorX / 2 - halfX
		let maxZ = floorY / 2 - halfZ
		mesh.position.x = Math.max(-maxX, Math.min(maxX, mesh.position.x))
		mesh.position.z = Math.max(-maxZ, Math.min(maxZ, mesh.position.z))
		if (mesh.position.y < halfY) mesh.position.y = halfY
	}

	let clampScale = () => {
		let mesh = meshRef.current
		if (!mesh) return
		mesh.scale.x = Math.max(minScale, mesh.scale.x)
		mesh.scale.y = Math.max(minScale, mesh.scale.y)
		mesh.scale.z = Math.max(minScale, mesh.scale.z)

		let maxScaleX = 2 * Math.min(floorX / 2 - mesh.position.x, mesh.position.x + floorX / 2)
		let maxScaleZ = 2 * Math.min(floorY / 2 - mesh.position.z, mesh.position.z + floorY / 2)
		mesh.scale.x = Math.min(mesh.scale.x, Math.max(minScale, maxScaleX))
		mesh.scale.z = Math.min(mesh.scale.z, Math.max(minScale, maxScaleZ))
	}

	let handleObjectChange = () => {
		if (mode === "translate") clampToFloor()
		else if (mode === "scale") clampScale()
		let mesh = meshRef.current
		onPositionChange(id, [mesh.position.x, mesh.position.y, mesh.position.z])
	}

	return (
		<>
			<mesh
				ref={meshRef}
				position={position}
				onClick={(e) => {
					if (!editing) return
					e.stopPropagation()
					onSelect(id)
				}}
				onDoubleClick={(e) => {
					if (!editing) return
					e.stopPropagation()
					onDoubleClick(id)
				}}
			>
				<boxGeometry args={[1, binHalf * 2, 1]} />
				<meshPhongMaterial color={selected && editing ? "orange" : "green"} />
			</mesh>
			{selected && editing && (
				<TransformControls
					object={meshRef}
					mode={mode}
					translationSnap={mode === "translate" ? gridSnap : null}
					onObjectChange={handleObjectChange}
					onMouseDown={() => onTransformingChange(true)}
					onMouseUp={() => onTransformingChange(false)}
				/>
			)}
		</>
	)
}
