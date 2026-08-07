import type { Segment, WorldPoint } from "./geometry";

type SidebarProps = {
  points: WorldPoint[];
  closed: boolean;
  segments: Segment[];
  selectedSegment: number | null;
  lengthInput: string;
  onSelectSegment: (i: number) => void;
  onUndo: () => void;
  onCloseShape: () => void;
  onClear: () => void;
  onExport: () => void;
  onLengthInputChange: (v: string) => void;
  onApplyLength: () => void;
};

export let Sidebar = ({
  points,
  closed,
  segments,
  selectedSegment,
  lengthInput,
  onSelectSegment,
  onUndo,
  onCloseShape,
  onClear,
  onExport,
  onLengthInputChange,
  onApplyLength,
}: SidebarProps) => {
  return (
    <div
      style={{ width: 220, padding: 10, background: "#eee", overflowY: "auto" }}
    >
      <h3 style={{ marginTop: 0 }}>Floor Editor</h3>
      <p style={{ fontSize: 12, color: "#555" }}>
        {closed
          ? "Click a segment to edit its length, click a vertex to select it (press Delete to remove), drag a vertex to reshape, or hold shift near a line and click to add a point on it."
          : "Click to place points. Click the first point again (or press Close Shape) to finish."}
      </p>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}
      >
        <button onClick={onUndo} disabled={closed || points.length === 0}>
          Undo Point
        </button>
        <button onClick={onCloseShape} disabled={closed || points.length < 3}>
          Close Shape
        </button>
        <button onClick={onClear} disabled={points.length === 0}>
          Clear
        </button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={onExport} disabled={points.length < 3}>
          Export SVG
        </button>
      </div>

      {segments.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>
            Segments
          </div>
          {segments.map((segment, i) => (
            <div
              key={i}
              onClick={() => onSelectSegment(i)}
              style={{
                padding: "4px 6px",
                marginBottom: 2,
                borderRadius: 4,
                cursor: "pointer",
                background: selectedSegment === i ? "#cde" : "transparent",
                fontSize: 13,
              }}
            >
              Segment {i + 1}: {segment.length.toFixed(1)} ft
            </div>
          ))}
        </div>
      )}

      {selectedSegment !== null && segments[selectedSegment] && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            Length for segment {selectedSegment + 1}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <input
              value={lengthInput}
              onChange={(e) => onLengthInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onApplyLength()}
              style={{ width: 70 }}
            />
            <button onClick={onApplyLength}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};
