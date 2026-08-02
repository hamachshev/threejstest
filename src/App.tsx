import { Grid, OrbitControls, TransformControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

const floorX = 10
const floorY = 10
const gridSnap = 0.5
const floorThickness = 0.1

let app = () => {
	let [transforming, setTransforming] = useState(false)
	return (
		<Canvas >
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			<TransformControls mode="translate" translationSnap={gridSnap} onMouseDown={() => setTransforming(true)} onMouseUp={() => setTransforming(false)} showY={false}>
				<mesh>
					<boxGeometry args={[1, 1, 0.5]} />
					<meshPhongMaterial color={"blue"} />

				</mesh>
			</TransformControls>
			<color attach="background" args={["white"]} />
			<mesh position={[0, -floorThickness / 2, 0]}>
				<boxGeometry args={[floorX, floorThickness, floorY]} />
				<meshPhongMaterial color={"gray"} />
			</mesh>
			<Grid position={[0, 0.001, 0]} args={[floorX, floorY]} cellSize={gridSnap} />
			<OrbitControls enabled={!transforming} />
		</Canvas >
	)
}

export default app;
