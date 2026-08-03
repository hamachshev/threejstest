import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AlwaysStencilFunc, DoubleSide, ReplaceStencilOp } from "three";
import type { Mesh, Shape } from "three";
import { useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Cube } from "./Cube";
import { Bin } from "./Bin";
import GridStencilMask from "./GridStencilMask";
import { floorX, floorY, floorThickness, gridSnap } from "../../constants";
import type { FloorPoint, Item, ItemProps, TransformMode } from "../../types";

type MapCanvasProps = {
	items: Item[]
	setItems: Dispatch<SetStateAction<Item[]>>
	selectedId: number | null
	setSelectedId: Dispatch<SetStateAction<number | null>>
	mode: TransformMode
	setMode: Dispatch<SetStateAction<TransformMode>>
	editing: boolean
	floorShape: Shape | null
}

let MapCanvas = ({ items, setItems, selectedId, setSelectedId, mode, setMode, editing, floorShape }: MapCanvasProps) => {
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

	let updateItemPosition = (id: number, position: [number, number, number]) => {
		setItems((prev) => prev.map((item) => (item.id === id ? { ...item, position } : item)))
	}

	return (
		<Canvas camera={{ position: [10, 10, 10], fov: 50 }} gl={{ stencil: true }}>
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			{items.map((item) => {
				let props: ItemProps = {
					id: item.id,
					position: item.position,
					selected: item.id === selectedId,
					mode,
					editing,
					floorPolygon,
					onSelect: selectItem,
					onDoubleClick: doubleClickItem,
					onTransformingChange: setTransforming,
					onPositionChange: updateItemPosition,
				}
				return item.type === "cube" ? <Cube key={item.id} {...props} /> : <Bin key={item.id} {...props} />
			})}
			<color attach="background" args={["white"]} />
			{floorShape ? (
				<mesh rotation={[Math.PI / 2, 0, 0]}>
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
				<mesh position={[0, -floorThickness / 2, 0]}>
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
		</Canvas>
	)
}

export default MapCanvas;
