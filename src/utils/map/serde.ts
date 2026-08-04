import { GLTFExporter, GLTFLoader } from "three/examples/jsm/Addons.js"
import type { Scene, Shape } from "three"
import type { RefObject } from "react"
import { itemTypes } from "../../types"
import type { FloorPoint, Item, ItemType } from "../../types"
import { shapeFromFloorPolygon } from "./floorSvg"

let isItemType = (value: unknown): value is ItemType => itemTypes.includes(value as ItemType)

let isFloorPolygon = (value: unknown): value is FloorPoint[] =>
	Array.isArray(value) && value.every((p) => typeof p?.x === "number" && typeof p?.z === "number")

export let onExport = async (sceneRef: RefObject<Scene | null>) => {
	let scene = sceneRef.current
	if (!scene) return false
	try {
		let exporter = new GLTFExporter()
		// floor is not a type of item we track but we want it to be exported
		let taggedObjects = scene.children.filter((child) => isItemType(child.userData.type) || child.userData.type === "floor")
		let data = await exporter.parseAsync(taggedObjects, { binary: true }) as ArrayBuffer
		let blob = new Blob([data], { type: "application/octet-stream" })
		let url = URL.createObjectURL(blob)
		let link = document.createElement("a")
		link.href = url
		link.download = "scene.glb"
		link.click()
		URL.revokeObjectURL(url)
		return true
	} catch (error) {
		console.error(error)
		return false
	}
}

type ImportResult = { items: Omit<Item, "id">[]; floorShape: Shape | null }

export let onImport = async (file: File): Promise<ImportResult | null> => {
	try {
		let loader = new GLTFLoader()
		let url = URL.createObjectURL(file)
		let gltf = await loader.loadAsync(url)
		URL.revokeObjectURL(url)

		let children = gltf.scene.children
		let floorChild = children.find((child) => child.userData.type === "floor")
		if (floorChild && !isFloorPolygon(floorChild.userData.floorPolygon)) return null

		let itemChildren = children.filter((child) => child !== floorChild)
		if (!itemChildren.every((child) => isItemType(child.userData.type))) return null

		return {
			items: itemChildren.map((child) => ({
				type: child.userData.type as ItemType,
				position: child.position.toArray(),
			})),
			floorShape: floorChild ? shapeFromFloorPolygon(floorChild.userData.floorPolygon) : null,
		}
	} catch (error) {
		console.error(error)
		return null
	}
}
