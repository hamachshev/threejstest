import { Layer, Text } from "react-konva"
import type Konva from "konva"
import { CENTER, VIEW_SIZE } from "./geometry"


// N/S/E/W indicators, each sitting a fixed distance in from its side,
// centered along that side.
let EDGE_MARGIN = 24

let DIRECTIONS: { text: string; x: number; y: number }[] = [
	{ text: "N", x: CENTER, y: EDGE_MARGIN },
	{ text: "S", x: CENTER, y: VIEW_SIZE - EDGE_MARGIN },
	{ text: "E", x: VIEW_SIZE - EDGE_MARGIN, y: CENTER },
	{ text: "W", x: EDGE_MARGIN, y: CENTER },
]

// centers the text on its x/y by offsetting by half its size, normally origin is top left
let centerOnPoint = (node: Konva.Text | null) => {
	if (node) {
		node.offsetX(node.width() / 2)
		node.offsetY(node.height() / 2)
	}
}

export let Compass = () => (
	<Layer listening={false}>
		{DIRECTIONS.map((d) => (
			<Text key={d.text} ref={centerOnPoint} x={d.x} y={d.y} text={d.text} fontSize={18} fontStyle="bold" fill="#333" />
		))}
	</Layer>
)
