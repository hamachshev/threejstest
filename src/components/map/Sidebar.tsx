import { useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Shape } from "three"
import { readFloorSvgFile } from "../../utils/map/floorSvg"

type SidebarProps = {
	editing: boolean
	onToggleEditing: () => void
	onAddCube: () => void
	onAddBin: () => void
	onLogPositions: () => void
	setFloorShape: Dispatch<SetStateAction<Shape | null>>
}

let Sidebar = ({ editing, onToggleEditing, onAddCube, onAddBin, onLogPositions, setFloorShape }: SidebarProps) => {
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
		</div>
	)
}

export default Sidebar
