import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import { Shape } from "three"

// Recenters the shape on its own bounding-box center, so downstream code
// (grid, extrusion, floor polygon) can all assume the floor sits at the origin.
let centerShape = (shape: Shape) => {
	let points = shape.getPoints()
	let xs = points.map((p) => p.x)
	let ys = points.map((p) => p.y)
	let centerX = (Math.min(...xs) + Math.max(...xs)) / 2
	let centerY = (Math.min(...ys) + Math.max(...ys)) / 2

	let centered = new Shape()
	points.forEach((p, i) => {
		let x = p.x - centerX
		let y = p.y - centerY
		if (i === 0) centered.moveTo(x, y)
		else centered.lineTo(x, y)
	})
	centered.closePath()
	return centered
}

export let parseFloorSvg = (svgText: string): Shape | null => {
	let data = new SVGLoader().parse(svgText)
	let shapes = data.paths.flatMap((path) => path.toShapes())
	let shape = shapes[0]
	return shape ? centerShape(shape) : null
}

export let readFloorSvgFile = async (file: File): Promise<Shape | null> => {
	let text = await file.text()
	return parseFloorSvg(text)
}
