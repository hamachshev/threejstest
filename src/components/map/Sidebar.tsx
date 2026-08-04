import { useRef, useState } from "react"
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
	onExport: () => Promise<boolean>
	onImport: (file: File) => Promise<boolean>
	setFloorShape: Dispatch<SetStateAction<Shape | null>>
	items: Item[]
	selectedId: number | null
	setSelectedId: Dispatch<SetStateAction<number | null>>
	setMode: Dispatch<SetStateAction<TransformMode>>
}

let itemTypeLabels: Record<Item["type"], string> = { cube: "Cubes", bin: "Bins" }
type status = "idle" | "success" | "error";
type importKind = "floorSvg" | "model"
let acceptByImportKind: Record<importKind, string> = {
	floorSvg: ".svg,image/svg+xml",
	model: ".gltf,.glb",
}

let Sidebar = ({ editing, onToggleEditing, onAddCube, onAddBin, onLogPositions, setFloorShape, items, selectedId, setSelectedId, setMode, onExport, onImport }: SidebarProps) => {
	let fileInputRef = useRef<HTMLInputElement>(null)
	let [exportStatus, setExportStatus] = useState<status>("idle")
	let [importStatus, setImportStatus] = useState<status>("idle")
	let [pendingImportKind, setPendingImportKind] = useState<importKind>("floorSvg")

	let handleExport = async () => {
		let success = await onExport()
		setExportStatus(success ? "success" : "error")
		setTimeout(() => setExportStatus("idle"), 2000)
	}

	let openFilePicker = (kind: importKind) => {
		setPendingImportKind(kind)
		let input = fileInputRef.current
		if (!input) return
		input.accept = acceptByImportKind[kind]
		input.click()
	}

	let importFloorSvg = async (file: File) => {
		let shape = await readFloorSvgFile(file)
		if (shape) setFloorShape(shape)
	}

	let handleImportModel = async (file: File) => {
		let success = await onImport(file)
		setImportStatus(success ? "success" : "error")
		setTimeout(() => setImportStatus("idle"), 2000)
	}


	return (
		<div
			style={{ width: 140, padding: 10, background: "#eee" }}
			onClick={(e) => {
				if ((e.target as HTMLElement).closest("button")) return
				setSelectedId(null)
			}}
		>
			<button onClick={onToggleEditing}>{editing ? "Confirm" : "Edit"}</button>
			<button onClick={onAddCube} disabled={!editing}>Cube</button>
			<button onClick={onAddBin} disabled={!editing}>Bin</button>
			<button onClick={onLogPositions}>Log Positions</button>
			<input
				ref={fileInputRef}
				type="file"
				style={{ display: "none" }}
				onChange={(e) => {
					let file = e.target.files?.[0]
					if (file) {
						if (pendingImportKind === "floorSvg") importFloorSvg(file)
						else if (pendingImportKind === "model") handleImportModel(file)
					}
					e.target.value = ""
				}}
			/>
			<button onClick={() => openFilePicker("floorSvg")}>Import Floor SVG</button>
			<button
				onClick={handleExport}
				disabled={editing}
				style={
					exportStatus === "success"
						? { background: "#4caf50", color: "white" }
						: exportStatus === "error"
							? { background: "#f44336", color: "white" }
							: undefined
				}
			>
				{exportStatus === "success" ? "Exported!" : exportStatus === "error" ? "Failed to export" : "Export"}
			</button>
			<button
				onClick={() => openFilePicker("model")}
				disabled={editing}
				style={
					importStatus === "success"
						? { background: "#4caf50", color: "white" }
						: importStatus === "error"
							? { background: "#f44336", color: "white" }
							: undefined
				}
			>
				{importStatus === "success" ? "Imported!" : importStatus === "error" ? "Failed to import" : "Import"}
			</button>

			{(["cube", "bin"] as const).map((type) => {
				let group = items.filter((item) => item.type === type)
				if (group.length === 0) return null
				return (
					<div key={type} style={{ marginTop: 10 }}>
						<div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>{itemTypeLabels[type]}</div>
						{group.map((item) => (
							<div
								key={item.id}
								onClick={(e) => {
									e.stopPropagation()
									setSelectedId(item.id)
								}}
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
