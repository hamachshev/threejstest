import { TransformControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { footprintInPolygon } from "../../utils/map/floorContainment";
import { binHalf, gridSnap, minScale } from "../../constants";
import type { ItemProps } from "../../types";
import { mod } from "three/tsl";

export let Bin = ({ id, position, selected, mode, editing, floorPolygon, onSelect, onDoubleClick, onTransformingChange, onPositionChange }: ItemProps) => {
	let meshRef = useRef<Mesh>(null!)
	let lastValidPosition = useRef({ x: position[0], z: position[2] })
	let lastValidScale = useRef({ x: 1, y: 1, z: 1 })
	let lastValidScalePosition = useRef({ x: position[0], z: position[2] })
	// position of the face opposite whichever side is being dragged, captured when
	// a scale drag starts, so the box grows from that fixed side instead of
	// expanding symmetrically from the center
	let scaleAnchor = useRef({ x: position[0], z: position[2] })

	let beginScale = () => {
		let mesh = meshRef.current
		if (!mesh) return
		scaleAnchor.current = {
			x: mesh.position.x - mesh.scale.x / 2,
			z: mesh.position.z - mesh.scale.z / 2,
		}
	}

	let clampToFloor = () => {
		let mesh = meshRef.current
		if (!mesh) return
		let halfX = mesh.scale.x / 2
		let halfY = mesh.scale.y * binHalf
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

		// anchor the opposite face so only the dragged side moves
		mesh.position.x = scaleAnchor.current.x + mesh.scale.x / 2
		mesh.position.z = scaleAnchor.current.z + mesh.scale.z / 2

		let halfX = mesh.scale.x / 2
		let halfZ = mesh.scale.z / 2
		if (footprintInPolygon(mesh.position.x, mesh.position.z, halfX, halfZ, floorPolygon)) {
			lastValidScale.current = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z }
			lastValidScalePosition.current = { x: mesh.position.x, z: mesh.position.z }
		} else {
			mesh.scale.x = lastValidScale.current.x
			mesh.scale.y = lastValidScale.current.y
			mesh.scale.z = lastValidScale.current.z
			mesh.position.x = lastValidScalePosition.current.x
			mesh.position.z = lastValidScalePosition.current.z
		}
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
					onMouseDown={() => {
						onTransformingChange(true)
						if (mode === "scale") beginScale()
					}}
					showY={mode === "translate"}
					onMouseUp={() => onTransformingChange(false)}
				/>
			)}
		</>
	)
}
