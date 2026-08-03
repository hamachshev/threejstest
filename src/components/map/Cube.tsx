import { TransformControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { footprintInPolygon } from "../../utils/map/floorContainment";
import { gridSnap, minScale } from "../../constants";
import type { ItemProps } from "../../types";

export let Cube = ({ id, position, selected, mode, editing, floorPolygon, onSelect, onDoubleClick, onTransformingChange, onPositionChange }: ItemProps) => {
	let meshRef = useRef<Mesh>(null!)
	let lastValidPosition = useRef({ x: position[0], z: position[2] })
	let lastValidScale = useRef({ x: 1, y: 1, z: 1 })

	let clampToFloor = () => {
		let mesh = meshRef.current
		if (!mesh) return
		let halfX = mesh.scale.x / 2
		let halfY = mesh.scale.y / 2
		let halfZ = mesh.scale.z / 2

		if (footprintInPolygon(mesh.position.x, mesh.position.z, halfX, halfZ, floorPolygon)) {
			lastValidPosition.current = { x: mesh.position.x, z: mesh.position.z }
		} else {
			mesh.position.x = lastValidPosition.current.x
			mesh.position.z = lastValidPosition.current.z
		}

		if (mesh.position.y < halfY) mesh.position.y = halfY
	}

	let clampScale = () => {
		let mesh = meshRef.current
		if (!mesh) return
		mesh.scale.x = Math.max(minScale, mesh.scale.x)
		mesh.scale.y = Math.max(minScale, mesh.scale.y)
		mesh.scale.z = Math.max(minScale, mesh.scale.z)

		let halfX = mesh.scale.x / 2
		let halfZ = mesh.scale.z / 2
		if (footprintInPolygon(mesh.position.x, mesh.position.z, halfX, halfZ, floorPolygon)) {
			lastValidScale.current = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z }
		} else {
			mesh.scale.x = lastValidScale.current.x
			mesh.scale.y = lastValidScale.current.y
			mesh.scale.z = lastValidScale.current.z
		}

		// keep resting on the floor instead of scaling through/off of it
		mesh.position.y = mesh.scale.y / 2
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
				<boxGeometry args={[1, 1, 1]} />
				<meshPhongMaterial color={selected && editing ? "orange" : "blue"} transparent opacity={0.35} />
			</mesh>
			{selected && editing && (
				<TransformControls
					object={meshRef}
					mode={mode}
					translationSnap={mode === "translate" ? gridSnap : null}
					onObjectChange={handleObjectChange}
					onMouseDown={() => onTransformingChange(true)}
					onMouseUp={() => onTransformingChange(false)}
					showY={mode === "scale"}
				/>
			)}
		</>
	)
}
