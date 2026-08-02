// import { useRef, useState } from 'react'
// import { Canvas } from '@react-three/fiber'
// import { Grid, OrbitControls, TransformControls } from '@react-three/drei'
// import type { Mesh } from 'three'
//
// const CUBE_HALF_HEIGHT = 0.5
// const FLOOR_THICKNESS = 0.2
// const FLOOR_WIDTH = 50
// const FLOOR_DEPTH = 100
// const GRID_CELL_SIZE = 0.5
//
// // function Cube({ onDraggingChange }: { onDraggingChange: (dragging: boolean) => void }) {
// // 	const meshRef = useRef<Mesh>(null!)
// //
// // 	const clampToFloor = () => {
// // 		const mesh = meshRef.current
// // 		const maxX = FLOOR_WIDTH / 2 - CUBE_HALF_HEIGHT
// // 		const maxZ = FLOOR_DEPTH / 2 - CUBE_HALF_HEIGHT
// // 		mesh.position.x = Math.max(-maxX, Math.min(maxX, mesh.position.x))
// // 		mesh.position.z = Math.max(-maxZ, Math.min(maxZ, mesh.position.z))
// // 		if (mesh.position.y < CUBE_HALF_HEIGHT) mesh.position.y = CUBE_HALF_HEIGHT
// // 	}
// //
// // 	return (
// // 		<>
// // 			<mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
// // 				<boxGeometry args={[1, 1, 1]} />
// // 				<meshStandardMaterial color="orange" />
// // 			</mesh>
// // 			<TransformControls
// // 				object={meshRef}
// // 				mode="translate"
// // 				translationSnap={GRID_CELL_SIZE}
// // 				onObjectChange={clampToFloor}
// // 				onMouseDown={() => onDraggingChange(true)}
// // 				onMouseUp={() => onDraggingChange(false)}
// // 				showY={false}
// // 			/>
// // 		</>
// // 	)
// // }
//
// function App() {
// 	// const [dragging, setDragging] = useState(false)
//
// 	return (
// 		<div id="canvas-container" style={{ width: '100%', height: '100%' }}>
// 			<Canvas shadows camera={{ position: [0, 0, 0], fov: 50 }}>
// 				<ambientLight intensity={0.8} />
// 				<directionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
//
// 				<mesh>
// 					<boxGeometry args={[1, 1, 1]} />
// 					<meshStandardMaterial color="orange" />
//
// 				</mesh>
//
// 				{/* <Cube onDraggingChange={setDragging} /> */}
//
// 				{/* <mesh position={[0, -FLOOR_THICKNESS / 2, 0]} receiveShadow> */}
// 				{/* 	<boxGeometry args={[FLOOR_WIDTH, FLOOR_THICKNESS, FLOOR_DEPTH]} /> */}
// 				{/* 	<meshStandardMaterial color="#000" /> */}
// 				{/* </mesh> */}
// 				{/**/}
// 				<Grid
// 					position={[0, 0.001, 0]}
// 					args={[50, 50]}
// 					cellSize={GRID_CELL_SIZE}
// 					cellThickness={0.5}
// 					cellColor="#6f6f6f"
// 					sectionSize={5}
// 					sectionThickness={1}
// 					sectionColor="#9d9d9d"
// 					fadeDistance={40}
// 					fadeStrength={1}
// 					infiniteGrid
// 				/>
//
// 				{/* <OrbitControls makeDefault target={[0, 0.5, 0]} /> */}
//
// 				<color attach="background" args={['#dcdcdc']} />
// 			</Canvas>
// 		</div>
// 	)
// }
//
// export default App
