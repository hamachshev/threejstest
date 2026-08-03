import { useMemo, useState } from "react"
import { FloorCanvas } from "../components/floor-editor/FloorCanvas"
import { Sidebar } from "../components/floor-editor/Sidebar"
import { computeSegments, downloadSvg, resizeSegment, type WorldPoint } from "../components/floor-editor/geometry"

let FloorEditor = () => {
	let [points, setPoints] = useState<WorldPoint[]>([])
	let [closed, setClosed] = useState(false)
	let [selectedSegment, setSelectedSegment] = useState<number | null>(null)
	let [lengthInput, setLengthInput] = useState("")

	let segments = useMemo(() => computeSegments(points, closed), [points, closed])

	let selectSegment = (i: number) => {
		setSelectedSegment(i)
		setLengthInput(segments[i].length.toFixed(1))
	}

	let addPoint = (p: WorldPoint) => setPoints((prev) => [...prev, p])

	let closeShape = () => {
		if (points.length < 3) return
		setClosed(true)
	}

	let undoPoint = () => setPoints((prev) => prev.slice(0, -1))

	let clearAll = () => {
		setPoints([])
		setClosed(false)
		setSelectedSegment(null)
	}

	let moveVertex = (i: number, p: WorldPoint) => {
		setPoints((prev) => prev.map((existing, idx) => (idx === i ? p : existing)))
	}

	let applyLength = () => {
		if (selectedSegment === null) return
		let updated = resizeSegment(points, selectedSegment, parseFloat(lengthInput))
		if (updated) setPoints(updated)
	}

	return (
		<div style={{ display: "flex", width: "100%", height: "100%" }}>
			<Sidebar
				points={points}
				closed={closed}
				segments={segments}
				selectedSegment={selectedSegment}
				lengthInput={lengthInput}
				onSelectSegment={selectSegment}
				onUndo={undoPoint}
				onCloseShape={closeShape}
				onClear={clearAll}
				onExport={() => downloadSvg(points)}
				onLengthInputChange={setLengthInput}
				onApplyLength={applyLength}
			/>
			<div style={{ flex: 1, background: "#fafafa" }}>
				<FloorCanvas
					points={points}
					closed={closed}
					selectedSegment={selectedSegment}
					segments={segments}
					onAddPoint={addPoint}
					onCloseShape={closeShape}
					onSelectSegment={(i) => (i === null ? setSelectedSegment(null) : selectSegment(i))}
					onMoveVertex={moveVertex}
				/>
			</div>
		</div>
	)
}

export default FloorEditor
