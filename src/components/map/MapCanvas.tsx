import { Grid, GizmoHelper, OrbitControls } from "@react-three/drei";
import { CompassGizmo } from "./CompassGizmo";
import { Canvas } from "@react-three/fiber";
import { AlwaysStencilFunc, DoubleSide, ReplaceStencilOp } from "three";
import type { Mesh, Scene, Shape } from "three";
import { useMemo, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { Cube } from "./Cube";
import { Bin } from "./Bin";
import GridStencilMask from "./GridStencilMask";
import { floorX, floorY, floorThickness, gridSnap } from "../../constants";
import type { FloorPoint, Item, ItemProps, ItemUpdate, TransformMode } from "../../types";

type MapCanvasProps = {
	items: Item[]
	setItems: Dispatch<SetStateAction<Item[]>>
	selectedId: number | null
	setSelectedId: Dispatch<SetStateAction<number | null>>
	mode: TransformMode
	setMode: Dispatch<SetStateAction<TransformMode>>
	setEditing: Dispatch<SetStateAction<boolean>>
	editing: boolean
	floorShape: Shape | null
	sceneRef: RefObject<Scene | null>
}

let MapCanvas = ({ items, setItems, selectedId, setSelectedId, mode, setMode, editing, floorShape, sceneRef, setEditing }: MapCanvasProps) => {
	let gridRef = useRef<Mesh>(null)
	let [transforming, setTransforming] = useState(false)

	let floorPolygon = useMemo<FloorPoint[]>(() => {
		if (!floorShape) return [
			{ x: -floorX / 2, z: -floorY / 2 },
			{ x: floorX / 2, z: -floorY / 2 },
			{ x: floorX / 2, z: floorY / 2 },
			{ x: -floorX / 2, z: floorY / 2 },
		]
		return floorShape.getPoints().map((p) => ({ x: p.x, z: p.y }))
	}, [floorShape])

	let floorBounds = useMemo(() => {
		let xs = floorPolygon.map((p) => p.x)
		let zs = floorPolygon.map((p) => p.z)
		return { width: Math.max(...xs) - Math.min(...xs), depth: Math.max(...zs) - Math.min(...zs) }
	}, [floorPolygon])

	let selectItem = (id: number) => {
		setSelectedId(id)
		setMode("translate")
	}

	let doubleClickItem = (id: number) => {
		setSelectedId(id)
		setMode("scale")
	}

	let updateItem = (id: number, changes: ItemUpdate) => {
		setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)))
	}

	return (
		<Canvas
			camera={{ position: [10, 10, 10], fov: 50 }}
			gl={{ stencil: true }}
			onCreated={(state) => { sceneRef.current = state.scene }}
			onDoubleClick={() => { if (!editing) setEditing(true) }}
		>
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			{items.map((item) => {
				let props: ItemProps = {
					id: item.id,
					position: item.position,
					scale: item.scale,
					selected: item.id === selectedId,
					mode,
					editing,
					floorPolygon,
					onSelect: selectItem,
					onDoubleClick: doubleClickItem,
					onTransformingChange: setTransforming,
					onUpdateItem: updateItem,
				}
				return item.type === "cube" ? <Cube key={item.id} {...props} /> : <Bin key={item.id} {...props} />
			})}
			<color attach="background" args={["white"]} />
			{floorShape ? (
				<mesh rotation={[Math.PI / 2, 0, 0]} userData={{ type: "floor", floorPolygon }}>
					<extrudeGeometry args={[floorShape, { depth: floorThickness, bevelEnabled: false }]} />
					<meshPhongMaterial
						color={"gray"}
						side={DoubleSide}
						stencilWrite
						stencilRef={1}
						stencilFunc={AlwaysStencilFunc}
						stencilZPass={ReplaceStencilOp}
					/>
				</mesh>
			) : (
				<mesh position={[0, -floorThickness / 2, 0]} userData={{ type: "floor", floorPolygon }}>
					<boxGeometry args={[floorX, floorThickness, floorY]} />
					<meshPhongMaterial
						color={"gray"}
						stencilWrite
						stencilRef={1}
						stencilFunc={AlwaysStencilFunc}
						stencilZPass={ReplaceStencilOp}
					/>
				</mesh>
			)}
			<Grid ref={gridRef} position={[0, 0.001, 0]} args={[floorBounds.width, floorBounds.depth]} cellSize={gridSnap} />
			<GridStencilMask gridRef={gridRef} />
			<OrbitControls enabled={!transforming} />
			<GizmoHelper alignment="bottom-right" margin={[80, 80]}>
				<CompassGizmo />
			</GizmoHelper>
		</Canvas>
	)
}

export default MapCanvas;
