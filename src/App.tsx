import { Grid, OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";

const floorX = 10
const floorY = 10
const gridSnap = 0.5
const floorThickness = 0.1
const cubeHalf = 0.5
const minScale = 0.1

let nextId = 1

type TransformMode = "translate" | "scale"

type CubeProps = {
	id: number
	position: [number, number, number]
	selected: boolean
	mode: TransformMode
	onSelect: (id: number) => void
	onDoubleClick: (id: number) => void
	onDraggingChange: (dragging: boolean) => void
}

let Cube = ({ id, position, selected, mode, onSelect, onDoubleClick, onDraggingChange }: CubeProps) => {
	let meshRef = useRef<Mesh>(null!)

	let clampToFloor = () => {
		let mesh = meshRef.current
		if (!mesh) return
		let halfX = mesh.scale.x / 2
		let halfY = mesh.scale.y / 2
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

		// keep resting on the floor instead of scaling through/off of it
		mesh.position.y = mesh.scale.y / 2
	}

	return (
		<>
			<mesh
				ref={meshRef}
				position={position}
				onClick={(e) => {
					e.stopPropagation()
					onSelect(id)
				}}
				onDoubleClick={(e) => {
					e.stopPropagation()
					onDoubleClick(id)
				}}
			>
				<boxGeometry args={[1, 1, 1]} />
				<meshPhongMaterial color={selected ? "orange" : "blue"} />
			</mesh>
			{selected && (
				<TransformControls
					object={meshRef}
					mode={mode}
					translationSnap={mode === "translate" ? gridSnap : null}
					onObjectChange={mode === "translate" ? clampToFloor : clampScale}
					onMouseDown={() => onDraggingChange(true)}
					onMouseUp={() => onDraggingChange(false)}
					showY={mode === "scale"}
				/>
			)}
		</>
	)
}

type CubeState = { id: number; position: [number, number, number] }

let app = () => {
	let [transforming, setTransforming] = useState(false)
	let [cubes, setCubes] = useState<CubeState[]>(() => [{ id: nextId++, position: [0, cubeHalf, 0] }])
	let [selectedId, setSelectedId] = useState<number | null>(() => cubes[0].id)
	let [mode, setMode] = useState<TransformMode>("translate")

	let addCube = () => {
		let id = nextId++
		let x = ((cubes.length * 1.5) % floorX) - floorX / 2
		setCubes([...cubes, { id, position: [x, cubeHalf, 0] }])
		setSelectedId(id)
		setMode("translate")
	}

	let selectCube = (id: number) => {
		setSelectedId(id)
		setMode("translate")
	}

	let doubleClickCube = (id: number) => {
		setSelectedId(id)
		setMode("scale")
	}

	useEffect(() => {
		let onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Delete" && e.key !== "Backspace") return
			setCubes((prev) => prev.filter((cube) => cube.id !== selectedId))
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [selectedId])

	return (
		<div style={{ display: "flex", width: "100%", height: "100%" }}>
			<div style={{ width: 140, padding: 10, background: "#eee" }}>
				<button onClick={addCube}>Cube</button>
			</div>
			<div style={{ flex: 1 }}>
				<Canvas>
					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 5, 5]} intensity={1} />
					{cubes.map((cube) => (
						<Cube
							key={cube.id}
							id={cube.id}
							position={cube.position}
							selected={cube.id === selectedId}
							mode={mode}
							onSelect={selectCube}
							onDoubleClick={doubleClickCube}
							onDraggingChange={setTransforming}
						/>
					))}
					<color attach="background" args={["white"]} />
					<mesh position={[0, -floorThickness / 2, 0]}>
						<boxGeometry args={[floorX, floorThickness, floorY]} />
						<meshPhongMaterial color={"gray"} />
					</mesh>
					<Grid position={[0, 0.001, 0]} args={[floorX, floorY]} cellSize={gridSnap} />
					<OrbitControls enabled={!transforming} />
				</Canvas>
			</div>
		</div>
	)
}

export default app;
