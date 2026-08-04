import type { Dispatch, RefObject, SetStateAction } from "react"
import { gridSnap } from "../../constants"
import type { Item, TransformMode } from "../../types"

export type MapKeyboardEventListenerParams = {
	editing: boolean
	items: Item[]
	selectedId: number | null
	setItems: Dispatch<SetStateAction<Item[]>>
	setSelectedId: Dispatch<SetStateAction<number | null>>
	setMode: Dispatch<SetStateAction<TransformMode>>
	setEditing: Dispatch<SetStateAction<boolean>>
	clipboardRef: RefObject<Omit<Item, "id"> | null>
	getNextId: () => number
}

export let mapKeyboardEventListener = (e: KeyboardEvent, { editing, items, selectedId, setItems, setSelectedId, setMode, clipboardRef, getNextId, setEditing }: MapKeyboardEventListenerParams) => {
	if (!editing) return

	if (e.key === "Delete" || e.key === "Backspace") {
		setItems((prev) => prev.filter((item) => item.id !== selectedId))
		return
	}
	if (e.key === "Escape") {
		e.preventDefault()
		setEditing(false)
	}


	let isModifierHeld = e.metaKey || e.ctrlKey
	if (!isModifierHeld) return

	if (e.key.toLowerCase() === "c") {
		let selectedItem = items.find((item) => item.id === selectedId)
		if (!selectedItem) return
		e.preventDefault()
		clipboardRef.current = {
			type: selectedItem.type,
			position: [...selectedItem.position],
			scale: [...selectedItem.scale],
		}
	} else if (e.key.toLowerCase() === "v") {
		let copied = clipboardRef.current
		if (!copied) return
		e.preventDefault()
		let id = getNextId()
		let [x, y, z] = copied.position
		setItems((prev) => [
			...prev,
			{ type: copied.type, id, position: [x + gridSnap, y, z + gridSnap], scale: [...copied.scale] },
		])
		setSelectedId(id)
		setMode("translate")
	} else if (e.key.toLowerCase() === "s") {
		e.preventDefault()
		setEditing(false)
	}
}
