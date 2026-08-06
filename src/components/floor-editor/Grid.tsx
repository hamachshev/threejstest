import { useMemo } from "react";
import { Layer, Line } from "react-konva";
import { CENTER, MAJOR_GRID_INTERVAL, UNIT_SIZE, VIEW_SIZE } from "./geometry";

export let Grid = () => {
  let lines = useMemo(() => {
    let lines: { points: number[]; major: boolean }[] = [];
    let unitsAcross = VIEW_SIZE / UNIT_SIZE;
    let half = Math.ceil(unitsAcross / 2);
    // the reason for -half and cal pos from the origin is bc we want a line at the orgin no matter what and otherwise if not divisible will be off at the origin
    for (let u = -half; u <= half; u++) {
      let major = u % MAJOR_GRID_INTERVAL === 0;
      let pos = CENTER + u * UNIT_SIZE;
      lines.push({ points: [pos, 0, pos, VIEW_SIZE], major });
      lines.push({ points: [0, pos, VIEW_SIZE, pos], major });
    }
    return lines;
  }, []);

  return (
    <Layer listening={false}>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          stroke={line.major ? "#ccc" : "#e5e5e5"}
          strokeWidth={line.major ? 1 : 0.5}
        />
      ))}
    </Layer>
  );
};
