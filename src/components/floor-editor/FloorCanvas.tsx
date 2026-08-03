import { useRef, useState } from "react"
import { Stage, Layer, Line, Circle, Label, Tag, Text } from "react-konva"
import type Konva from "konva"
import { Grid } from "./Grid"
import {
	CLOSE_THRESHOLD,
	SEGMENT_HIT_THRESHOLD,
	VIEW_SIZE,
	distance,
	distanceToSegment,
	screenPoint,
	screenToWorld,
	snapPoint,
	worldToScreen,
	type ScreenPoint,
	type Segment,
	type WorldPoint,
} from "./geometry"

type FloorCanvasProps = {
	points: WorldPoint[]
	closed: boolean
	selectedSegment: number | null
	segments: Segment[]
	onAddPoint: (p: WorldPoint) => void
	onCloseShape: () => void
	onSelectSegment: (i: number | null) => void
	onMoveVertex: (i: number, p: WorldPoint) => void
}

export let FloorCanvas = ({ points, closed, selectedSegment, segments, onAddPoint, onCloseShape, onSelectSegment, onMoveVertex }: FloorCanvasProps) => {
	let stageRef = useRef<Konva.Stage>(null)
	let [pointer, setPointer] = useState<ScreenPoint | null>(null)
	let [draggingIndex, setDraggingIndex] = useState<number | null>(null)

	let handlePointerMove = () => {
		let stage = stageRef.current
		if (!stage) return
		let pos = stage.getPointerPosition()
		setPointer(pos ? screenPoint(pos.x, pos.y) : null)
	}

	let handleStageClick = () => {
		let stage = stageRef.current
		if (!stage) return
		let clickPos = stage.getPointerPosition()
		if (!clickPos) return
		let world = screenToWorld(screenPoint(clickPos.x, clickPos.y))

		if (closed) {
			let hitIndex = segments.reduce<{ index: number; distance: number } | null>((closest, segment, i) => {
				let dist = distanceToSegment(world, segment.a, segment.b)
				if (dist > SEGMENT_HIT_THRESHOLD) return closest
				if (!closest || dist < closest.distance) return { index: i, distance: dist }
				return closest
			}, null)
			onSelectSegment(hitIndex ? hitIndex.index : null)
			return
		}

		if (points.length >= 3 && distance(world, points[0]) < CLOSE_THRESHOLD) {
			onCloseShape()
			return
		}

		onAddPoint(snapPoint(world))
	}

	// segments to show tooltips for
	let tooltipSegements: Segment[] = []
	if (!closed && points.length > 0 && pointer) {
		let a = points[points.length - 1]
		let b = snapPoint(screenToWorld(pointer))
		tooltipSegements = [{ a, b, length: distance(a, b) }]
	} else if (draggingIndex !== null) {
		let n = points.length
		let prev = segments[(draggingIndex - 1 + n) % n]
		let next = segments[draggingIndex]
		tooltipSegements = [prev, next].filter((s): s is Segment => s !== undefined)
	}

	return (
		<Stage
			ref={stageRef}
			width={VIEW_SIZE}
			height={VIEW_SIZE}
			style={{ width: "100%", height: "100%", cursor: "crosshair" }}
			onClick={handleStageClick}
			onMouseMove={handlePointerMove}
			onMouseLeave={() => setPointer(null)}
		>
			<Grid />

			<Layer>
				{closed && segments.map((segment, i) => {
					let a = worldToScreen(segment.a)
					let b = worldToScreen(segment.b)
					let selected = selectedSegment === i
					return (
						<Line
							key={i}
							points={[a.x, a.y, b.x, b.y]}
							stroke={selected ? "#3366ff" : "#333"}
							strokeWidth={selected ? 4 : 2}
							hitStrokeWidth={16}
							onClick={(e) => {
								e.cancelBubble = true
								onSelectSegment(i)
							}}
						/>
					)
				})}

				{!closed && points.length >= 2 &&
					points.slice(0, -1).map((point, i) => {
						let a = worldToScreen(point)
						let b = worldToScreen(points[i + 1])
						return <Line key={i} points={[a.x, a.y, b.x, b.y]} stroke="#333" strokeWidth={2} />
					})}

				{points.map((p, i) => {
					let screen = worldToScreen(p)
					return (
						<Circle
							key={i}
							x={screen.x}
							y={screen.y}
							radius={5}
							fill={i === 0 ? "#c33" : "#333"}
							draggable={closed}
							onDragStart={() => setDraggingIndex(i)}
							onDragMove={(e) => {
								let node = e.target
								let worldPos = snapPoint(screenToWorld(screenPoint(node.x(), node.y())))
								let snapped = worldToScreen(worldPos)
								node.position(snapped)
								onMoveVertex(i, worldPos)
							}}
							onDragEnd={() => setDraggingIndex(null)}
						/>
					)
				})}
			</Layer>

			<Layer listening={false}>
				{/* dashed line when creating shape before closed */}
				{!closed && points.length > 0 && pointer && (() => {
					let last = worldToScreen(points[points.length - 1])
					let cursor = worldToScreen(snapPoint(screenToWorld(pointer)))
					return <Line points={[last.x, last.y, cursor.x, cursor.y]} stroke="#999" strokeWidth={2} dash={[4, 4]} />
				})()}

				{tooltipSegements.map((segment, i) => {
					let a = worldToScreen(segment.a)
					let b = worldToScreen(segment.b)
					let mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
					return (
						<Label key={i} x={mid.x} y={mid.y - 12}>
							<Tag fill="rgba(0,0,0,0.75)" pointerDirection="down" pointerWidth={8} pointerHeight={6} cornerRadius={4} />
							<Text text={`${segment.length.toFixed(1)} ft`} fontSize={11} padding={5} fill="#fff" />
						</Label>
					)
				})}
			</Layer>
		</Stage>
	)
}
