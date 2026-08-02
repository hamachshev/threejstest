import { Grid, OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";

const floorX = 10
const floorY = 10
const gridSnap = 0.5
const floorThickness = 0.1
const cubeHalf = 0.5

let nextId = 1

type CubeProps = {
	id: number
	position: [number, number, number]
	selected: boolean
	onSelect: (id: number) => void
	onDraggingChange: (dragging: boolean) => void
}

let Cube = ({ id, position, selected, onSelect, onDraggingChange }: CubeProps) => {
	let meshRef = useRef<Mesh>(null!)

	let clampToFloor = () => {
		let mesh = meshRef.current
		if (!mesh) return
		let maxX = floorX / 2 - cubeHalf
		let maxZ = floorY / 2 - cubeHalf
		mesh.position.x = Math.max(-maxX, Math.min(maxX, mesh.position.x))
		mesh.position.z = Math.max(-maxZ, Math.min(maxZ, mesh.position.z))
		if (mesh.position.y < cubeHalf) mesh.position.y = cubeHalf
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
			>
				<boxGeometry args={[1, 1, 1]} />
				<meshPhongMaterial color={selected ? "orange" : "blue"} />
			</mesh>
			{selected && (
				<TransformControls
					object={meshRef}
					mode="translate"
					translationSnap={gridSnap}
					onObjectChange={clampToFloor}
					onMouseDown={() => onDraggingChange(true)}
					onMouseUp={() => onDraggingChange(false)}
					showY={false}
				/>
			)}
		</>
	)
}

type CubeState = { id: number; position: [number, number, number] }

let app = () => {
	let [transforming, setTransforming] = useState(false)
	let [cubes, setCubes] = useState<CubeState[]>([{ id: nextId++, position: [0, cubeHalf, 0] }])
	let [selectedId, setSelectedId] = useState(cubes[0].id)

	let addCube = () => {
		let id = nextId++
		let x = ((cubes.length * 1.5) % floorX) - floorX / 2
		setCubes([...cubes, { id, position: [x, cubeHalf, 0] }])
		setSelectedId(id)
	}

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
							onSelect={setSelectedId}
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
