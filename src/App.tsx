import { useEffect, useMemo, useState } from "react";
import type { Shape } from "three";
import { binHalf, cubeHalf, floorX, floorY } from "./constants";
import type { Item, TransformMode } from "./types";
import MapCanvas from "./components/map/MapCanvas";
import Sidebar from "./components/map/Sidebar";

let nextId = 1

let app = () => {
	let [items, setItems] = useState<Item[]>(() => [{ type: "cube", id: nextId++, position: [0, cubeHalf, 0] }])
	let [selectedId, setSelectedId] = useState<number | null>(() => items[0].id)
	let [mode, setMode] = useState<TransformMode>("translate")
	let [editing, setEditing] = useState(false)
	let [floorShape, setFloorShape] = useState<Shape | null>(null)

	let addItem = (type: Item["type"], y: number) => {
		let id = nextId++
		let x = ((items.length * 1.5) % floorX) - floorX / 2
		setItems([...items, { type, id, position: [x, y, 0] }])
		setSelectedId(id)
		setMode("translate")
	}

	let warehouseItemCoordinates = useMemo(
		() => {
			type WarehouseCoordinates = { id: number, x: number, y: number, height: number }
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
			<Sidebar
				editing={editing}
				onToggleEditing={() => setEditing((prev) => !prev)}
				onAddCube={() => addItem("cube", cubeHalf)}
				onAddBin={() => addItem("bin", binHalf)}
				onLogPositions={logPositions}
				setFloorShape={setFloorShape}
				items={items}
				selectedId={selectedId}
				setSelectedId={setSelectedId}
				setMode={setMode}
			/>
			<div style={{ flex: 1 }}>
				<MapCanvas
					items={items}
					setItems={setItems}
					selectedId={selectedId}
					setSelectedId={setSelectedId}
					mode={mode}
					setMode={setMode}
					editing={editing}
					floorShape={floorShape}
				/>
			</div>
		</div>
	)
}

export default app;
