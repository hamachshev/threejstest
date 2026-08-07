import { useEffect, useMemo, useState } from "react";
import { FloorCanvas } from "../components/floor-editor/FloorCanvas";
import { Sidebar } from "../components/floor-editor/Sidebar";
import {
  computeSegments,
  downloadSvg,
  resizeSegment,
  type WorldPoint,
} from "../components/floor-editor/geometry";

let FloorEditor = () => {
  let [points, setPoints] = useState<WorldPoint[]>([]);
  let [closed, setClosed] = useState(false);
  let [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  let [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  let [lengthInput, setLengthInput] = useState("");
  let [shiftHeld, setShiftHeld] = useState(false);

  useEffect(() => {
    let handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
    };
    let handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  let segments = useMemo(
    () => computeSegments(points, closed),
    [points, closed],
  );

  let selectSegment = (i: number) => {
    setSelectedSegment(i);
    setSelectedPoint(null);
    setLengthInput(segments[i].length.toFixed(1));
  };

  let selectPoint = (i: number) => {
    setSelectedPoint(i);
    setSelectedSegment(null);
  };

  let addPoint = (p: WorldPoint) => setPoints((prev) => [...prev, p]);

  let closeShape = () => {
    if (points.length < 3) return;
    setClosed(true);
  };

  let undoPoint = () => setPoints((prev) => prev.slice(0, -1));

  let clearAll = () => {
    setPoints([]);
    setClosed(false);
    setSelectedSegment(null);
    setSelectedPoint(null);
  };

  // A polygon needs at least 3 points, so refuse to delete below that.
  let deletePoint = (i: number) => {
    if (points.length <= 3) return;
    setPoints((prev) => prev.filter((_, idx) => idx !== i));
    setSelectedPoint(null);
    setSelectedSegment(null);
  };

  useEffect(() => {
    let handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedPoint === null) return;
        // Don't hijack Backspace while the user is typing in the sidebar.
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        e.preventDefault();
        deletePoint(selectedPoint);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPoint, points]);

  let moveVertex = (i: number, p: WorldPoint) => {
    setPoints((prev) =>
      prev.map((existing, idx) => (idx === i ? p : existing)),
    );
  };

  let insertPoint = (segmentIndex: number, p: WorldPoint) => {
    setPoints((prev) => [
      ...prev.slice(0, segmentIndex + 1),
      p,
      ...prev.slice(segmentIndex + 1),
    ]);
    setSelectedSegment(null);
    setSelectedPoint(null);
  };

  // Undoes a still-unconfirmed preview point (shift-hover) that the user
  // moved away from or released shift on without clicking.
  let removePoint = (i: number) => {
    setPoints((prev) => prev.filter((_, idx) => idx !== i));
    setSelectedPoint(null);
    setSelectedSegment(null);
  };

  let applyLength = () => {
    if (selectedSegment === null) return;
    let updated = resizeSegment(
      points,
      selectedSegment,
      parseFloat(lengthInput),
    );
    if (updated) setPoints(updated);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <Sidebar
        points={points}
        closed={closed}
        segments={segments}
        selectedSegment={selectedSegment}
        selectedPoint={selectedPoint}
        lengthInput={lengthInput}
        onSelectSegment={selectSegment}
        onSelectPoint={selectPoint}
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
          shiftHeld={shiftHeld}
          selectedSegment={selectedSegment}
          selectedPoint={selectedPoint}
          segments={segments}
          onAddPoint={addPoint}
          onCloseShape={closeShape}
          onSelectSegment={(i) =>
            i === null ? setSelectedSegment(null) : selectSegment(i)
          }
          onSelectPoint={(i) =>
            i === null ? setSelectedPoint(null) : selectPoint(i)
          }
          onMoveVertex={moveVertex}
          onInsertPoint={insertPoint}
          onRemovePoint={removePoint}
        />
      </div>
    </div>
  );
};

export default FloorEditor;
