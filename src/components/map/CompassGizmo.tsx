import { useGizmoContext } from "@react-three/drei"
import type { ThreeEvent } from "@react-three/fiber"
import { useMemo, useState } from "react"
import { CanvasTexture } from "three"
import { axisColors } from "../../constants"

// N/S/E/W compass gizmo (drop-in replacement for drei's GizmoViewport, which
// only labels the +X/+Y/+Z heads).
//  North is -z, East is +x — see MapCanvas's floor coordinate mapping.

let AXES: { label: string; position: [number, number, number]; color: string }[] = [
	{ label: "N", position: [0, 0, -1], color: axisColors.z },
	{ label: "S", position: [0, 0, 1], color: axisColors.z },
	{ label: "U", position: [0, 1, 0], color: axisColors.y },
	{ label: "D", position: [0, -1, 0], color: axisColors.y },
	{ label: "E", position: [1, 0, 0], color: axisColors.x },
	{ label: "W", position: [-1, 0, 0], color: axisColors.x },
]

let Axis = ({ color, rotation }: { color: string; rotation: [number, number, number] }) => (
	<group rotation={rotation}>
		<mesh position={[0.4, 0, 0]}>
			<boxGeometry args={[0.8, 0.05, 0.05]} />
			<meshBasicMaterial color={color} toneMapped={false} />
		</mesh>
	</group>
)

let AxisHead = ({ position, label, color }: { position: [number, number, number]; label: string; color: string }) => {
	let { tweenCamera } = useGizmoContext()
	let [active, setActive] = useState(false)

	let texture = useMemo(() => {
		let canvas = document.createElement("canvas")
		canvas.width = 64
		canvas.height = 64
		let context = canvas.getContext("2d")!
		context.beginPath()
		context.arc(32, 32, 16, 0, 2 * Math.PI)
		context.closePath()
		context.fillStyle = color
		context.fill()
		context.font = "18px Inter var, Arial, sans-serif"
		context.textAlign = "center"
		context.fillStyle = "#000"
		context.fillText(label, 32, 41)
		return new CanvasTexture(canvas)
	}, [color, label])

	let handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation()
		setActive(true)
	}
	let handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation()
		setActive(false)
	}
	let handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation()
		tweenCamera(e.object.position)
	}

	return (
		<sprite
			position={position}
			scale={active ? 1.2 : 1}
			onPointerOver={handlePointerOver}
			onPointerOut={handlePointerOut}
			onPointerDown={handlePointerDown}
		>
			<spriteMaterial map={texture} />
		</sprite>
	)
}

export let CompassGizmo = () => (
	<group scale={40}>
		<Axis color={axisColors.z} rotation={[0, -Math.PI / 2, 0]} />
		<Axis color={axisColors.y} rotation={[0, 0, Math.PI / 2]} />
		<Axis color={axisColors.x} rotation={[0, 0, 0]} />
		{AXES.map((axis) => (
			<AxisHead key={axis.label} {...axis} />
		))}
	</group>
)
