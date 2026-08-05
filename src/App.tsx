import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Scene, Shape } from "three";
import { binHalf, cubeHalf, floorX, floorY } from "./constants";
import type { Item, SceneState, TransformMode } from "./types";
import MapCanvas from "./components/map/MapCanvas";
import Sidebar from "./components/map/Sidebar";
import { onExport, onImport } from "./utils/map/serde";
import { mapKeyboardEventListener } from "./utils/map/eventListeners";
import { useClipboard, useHistory } from "./hooks/useEditorHistory";

let nextId = 1

let app = () => {

	let [scene, setScene] = useState<SceneState>(() => ({
		items: [{ type: "cube", id: nextId++, position: [0, cubeHalf, 0], scale: [1, 1, 1] }],
		floorShape: null,
	}))
	let { items, floorShape } = scene

	let setItems: Dispatch<SetStateAction<Item[]>> = (update) => {
		setScene((prev) => ({ ...prev, items: typeof update === "function" ? (update as (prev: Item[]) => Item[])(prev.items) : update }))
	}
	let setFloorShape: Dispatch<SetStateAction<Shape | null>> = (update) => {
		setScene((prev) => ({ ...prev, floorShape: typeof update === "function" ? (update as (prev: Shape | null) => Shape | null)(prev.floorShape) : update }))
	}

	let [selectedId, setSelectedId] = useState<number | null>(() => items[0].id)
	let [mode, setMode] = useState<TransformMode>("translate")
	let [editing, setEditing] = useState(false)
	let sceneRef = useRef<Scene | null>(null)
	let { clipboardRef, copy } = useClipboard()
	let { pushHistory, undo, redo } = useHistory(scene, setScene)


	let addItem = (type: Item["type"], y: number) => {
		pushHistory()
		let id = nextId++
		let x = ((items.length * 1.5) % floorX) - floorX / 2
		setItems([...items, { type, id, position: [x, y, 0], scale: [1, 1, 1] }])
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
		let onKeyDown = (e: KeyboardEvent) => mapKeyboardEventListener(e, {
			editing,
			items,
			selectedId,
			setItems,
			setSelectedId,
			setMode,
			setEditing,
			clipboardRef,
			getNextId: () => nextId++,
			copy,
			pushHistory,
			undo,
			redo,
		})
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [selectedId, editing, scene])

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
				onExport={async () => onExport(sceneRef)}
				onImport={async (file) => {
					let imported = await onImport(file)
					if (!imported) return false
					pushHistory()
					setItems(imported.items.map((item) => ({ ...item, id: nextId++ })))
					if (imported.floorShape) setFloorShape(imported.floorShape)
					return true
				}}
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
					sceneRef={sceneRef}
					setEditing={setEditing}
					onBeginTransform={pushHistory}
				/>
			</div>
		</div>
	)
}

export default app;
