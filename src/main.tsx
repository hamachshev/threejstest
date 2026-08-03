import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import FloorEditor from './pages/FloorEditor.tsx'

let nav = () => (
	<div style={{ position: 'fixed', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 8, fontSize: 12 }}>
		<Link to="/">Builder</Link>
		<Link to="/floor-editor">Floor Editor</Link>
	</div>
)

let root = () => (
	<HashRouter>
		{nav()}
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/floor-editor" element={<FloorEditor />} />
		</Routes>
	</HashRouter>
)

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{root()}
	</StrictMode>,
)
