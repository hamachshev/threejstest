import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Cube } from "./components/Cube";
import { Bin } from "./components/Bin";
import { binHalf, cubeHalf, floorThickness, floorX, floorY, gridSnap } from "./constants";
import type { ItemProps, TransformMode } from "./constants";

let nextId = 1

type Item = { type: "cube" | "bin"; id: number; position: [number, number, number] }

let app = () => {
	let [transforming, setTransforming] = useState(false)
	let [items, setItems] = useState<Item[]>(() => [{ type: "cube", id: nextId++, position: [0, cubeHalf, 0] }])
	let [selectedId, setSelectedId] = useState<number | null>(() => items[0].id)
	let [mode, setMode] = useState<TransformMode>("translate")
	let [editing, setEditing] = useState(false)

	let addItem = (type: Item["type"], y: number) => {
		let id = nextId++
		let x = ((items.length * 1.5) % floorX) - floorX / 2
		setItems([...items, { type, id, position: [x, y, 0] }])
		setSelectedId(id)
		setMode("translate")
	}

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

	let warehouseItemCoordinates = useMemo(
		() => {
			type WarehouseCoordinates = { id: Number, x: Number, y: Number, height: Number }
			return items.reduce((acc, item) => {
				let [x, y, z] = item.position
				const itemCoords = {
					id: item.id,
					x: floorX / 2 - x,
					y: floorY / 2 - z,
					height: y,
				}
				if (item.type === "cube") {
					acc.cubes.push(itemCoords)
				} else if (item.type === "bin") {
					acc.bins.push(itemCoords)
				}
				return acc
			}, { cubes: [] as WarehouseCoordinates[], bins: [] as WarehouseCoordinates[] })
		}, [items]

	)

	let logPositions = () => {
		console.log(warehouseItemCoordinates)
	}

	useEffect(() => {
		let onKeyDown = (e: KeyboardEvent) => {
			if (!editing) return
			if (e.key !== "Delete" && e.key !== "Backspace") return
			setItems((prev) => prev.filter((item) => item.id !== selectedId))
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [selectedId, editing])

	return (
		<div style={{ display: "flex", width: "100%", height: "100%" }}>
			<div style={{ width: 140, padding: 10, background: "#eee" }}>
				<button onClick={() => setEditing((prev) => !prev)}>{editing ? "Confirm" : "Edit"}</button>
				<button onClick={() => addItem("cube", cubeHalf)} disabled={!editing}>Cube</button>
				<button onClick={() => addItem("bin", binHalf)} disabled={!editing}>Bin</button>
				<button onClick={logPositions}>Log Positions</button>
			</div>
			<div style={{ flex: 1 }}>
				<Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 5, 5]} intensity={1} />
					{items.map((item) => {
						let props: ItemProps = {
							id: item.id,
							position: item.position,
							selected: item.id === selectedId,
							mode,
							editing,
							onSelect: selectItem,
							onDoubleClick: doubleClickItem,
							onTransformingChange: setTransforming,
							onPositionChange: updateItemPosition,
						}
						return item.type === "cube" ? <Cube key={item.id} {...props} /> : <Bin key={item.id} {...props} />
					})}
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
