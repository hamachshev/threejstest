import { useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Item } from "../types"

const MAX_HISTORY = 50

// pushHistory() must be called right before a mutation happens, capturing
// the pre-mutation snapshot. Continuous changes (e.g. a drag) should only
// push once, at the start of the gesture, not on every intermediate frame.
export function useHistory<T>(state: T, setState: Dispatch<SetStateAction<T>>) {
	let historyRef = useRef<T[]>([])
	let redoRef = useRef<T[]>([])

	let pushHistory = () => {
		historyRef.current.push(state)
		if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
		redoRef.current = []
	}

	let undo = () => {
		let previous = historyRef.current.pop()
		if (!previous) return
		redoRef.current.push(state)
		setState(previous)
	}

	let redo = () => {
		let next = redoRef.current.pop()
		if (!next) return
		historyRef.current.push(state)
		if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
		setState(next)
	}

	return { pushHistory, undo, redo }
}

export let useClipboard = () => {
	let clipboardRef = useRef<Omit<Item, "id"> | null>(null)

	let copy = (item: Item) => {
		let { id, ...rest } = item
		clipboardRef.current = structuredClone(rest)
	}

	return { clipboardRef, copy }
}
