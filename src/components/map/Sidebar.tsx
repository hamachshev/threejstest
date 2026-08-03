import { useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Shape } from "three"
import { readFloorSvgFile } from "../../utils/map/floorSvg"
import type { Item, TransformMode } from "../../types"

type SidebarProps = {
	editing: boolean
	onToggleEditing: () => void
	onAddCube: () => void
	onAddBin: () => void
	onLogPositions: () => void
	setFloorShape: Dispatch<SetStateAction<Shape | null>>
	items: Item[]
	selectedId: number | null
	setSelectedId: Dispatch<SetStateAction<number | null>>
	setMode: Dispatch<SetStateAction<TransformMode>>
}

let itemTypeLabels: Record<Item["type"], string> = { cube: "Cubes", bin: "Bins" }

let Sidebar = ({ editing, onToggleEditing, onAddCube, onAddBin, onLogPositions, setFloorShape, items, selectedId, setSelectedId, setMode }: SidebarProps) => {
	let fileInputRef = useRef<HTMLInputElement>(null)

	let importFloorSvg = async (file: File) => {
		let shape = await readFloorSvgFile(file)
		if (shape) setFloorShape(shape)
	}

	return (
		<div style={{ width: 140, padding: 10, background: "#eee" }}>
			<button onClick={onToggleEditing}>{editing ? "Confirm" : "Edit"}</button>
			<button onClick={onAddCube} disabled={!editing}>Cube</button>
			<button onClick={onAddBin} disabled={!editing}>Bin</button>
			<button onClick={onLogPositions}>Log Positions</button>
			<input
				ref={fileInputRef}
				type="file"
				accept=".svg,image/svg+xml"
				style={{ display: "none" }}
				onChange={(e) => {
					let file = e.target.files?.[0]
					if (file) importFloorSvg(file)
					e.target.value = ""
				}}
			/>
			<button onClick={() => fileInputRef.current?.click()}>Import Floor SVG</button>

			{(["cube", "bin"] as const).map((type) => {
				let group = items.filter((item) => item.type === type)
				if (group.length === 0) return null
				return (
					<div key={type} style={{ marginTop: 10 }}>
						<div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>{itemTypeLabels[type]}</div>
						{group.map((item) => (
							<div
								key={item.id}
								onClick={() => setSelectedId(item.id)}
								onDoubleClick={() => setMode((mode) => mode === "translate" ? "scale" : "translate")}
								style={{
									padding: "4px 6px",
									marginBottom: 2,
									borderRadius: 4,
									cursor: "pointer",
									background: selectedId === item.id ? "#cde" : "transparent",
									fontSize: 13,
								}}
							>
								#{item.id} ({item.position.map((n) => n.toFixed(1)).join(", ")})
							</div>
						))}
					</div>
				)
			})}
		</div>
	)
}

export default Sidebar
