import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Label, Tag, Text } from "react-konva";
import type Konva from "konva";
import { Grid } from "./Grid";
import { Compass } from "./Compass";
import {
  PROXIMITY_THRESHOLD,
  VIEW_SIZE,
  closestPointOnSegment,
  distance,
  screenPoint,
  screenToWorld,
  snapPoint,
  worldToScreen,
  type ScreenPoint,
  type Segment,
  type WorldPoint,
} from "./geometry";

type FloorCanvasProps = {
  points: WorldPoint[];
  closed: boolean;
  shiftHeld: boolean;
  selectedSegment: number | null;
  selectedPoint: number | null;
  segments: Segment[];
  onAddPoint: (p: WorldPoint) => void;
  onCloseShape: () => void;
  onSelectSegment: (i: number | null) => void;
  onSelectPoint: (i: number | null) => void;
  onMoveVertex: (i: number, p: WorldPoint) => void;
  onInsertPoint: (segmentIndex: number, p: WorldPoint) => void;
  onRemovePoint: (i: number) => void;
};

export let FloorCanvas = ({
  points,
  closed,
  shiftHeld,
  selectedSegment,
  selectedPoint,
  segments,
  onAddPoint,
  onCloseShape,
  onSelectSegment,
  onSelectPoint,
  onMoveVertex,
  onInsertPoint,
  onRemovePoint,
}: FloorCanvasProps) => {
  let stageRef = useRef<Konva.Stage>(null);
  let [pointer, setPointer] = useState<ScreenPoint | null>(null);
  let [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Index in `points` of an unconfirmed shift-hover preview point
  let previewIndexRef = useRef<number | null>(null);

  let cancelPreview = () => {
    if (previewIndexRef.current === null) return;
    onRemovePoint(previewIndexRef.current);
    previewIndexRef.current = null;
  };

  let confirmPreview = () => {
    previewIndexRef.current = null;
  };

  // Releasing shift cancels a pending preview even if the pointer never
  // moves again.
  useEffect(() => {
    if (!shiftHeld) cancelPreview();
  }, [shiftHeld]);

  let handlePointerMove = () => {
    let stage = stageRef.current;
    if (!stage) return;
    let pos = stage.getPointerPosition();
    setPointer(pos ? screenPoint(pos.x, pos.y) : null);

    if (!pos || !closed || !shiftHeld) {
      cancelPreview();
      return;
    }

    let world = screenToWorld(screenPoint(pos.x, pos.y));

    if (previewIndexRef.current !== null) {
      // Track the segment's original endpoints, not `segments` (which now
      // includes the preview point itself and would just measure ~0).
      let idx = previewIndexRef.current;
      let n = points.length;
      let a = points[(idx - 1 + n) % n];
      let b = points[(idx + 1) % n];
      let closest = closestPointOnSegment(world, a, b);
      if (distance(world, closest) > PROXIMITY_THRESHOLD) {
        cancelPreview();
      } else {
        onMoveVertex(idx, closest);
      }
      return;
    }

    let hit = segments.reduce<{
      index: number;
      distance: number;
      point: WorldPoint;
    } | null>((closest, segment, i) => {
      let point = closestPointOnSegment(world, segment.a, segment.b);
      let dist = distance(world, point);
      if (dist > PROXIMITY_THRESHOLD) return closest;
      if (!closest || dist < closest.distance)
        return { index: i, distance: dist, point };
      return closest;
    }, null);

    if (hit) {
      previewIndexRef.current = hit.index + 1;
      onInsertPoint(hit.index, hit.point);
    }
  };

  let handleStageClick = () => {
    if (previewIndexRef.current !== null) {
      confirmPreview();
      return;
    }

    let stage = stageRef.current;
    if (!stage) return;
    let clickPos = stage.getPointerPosition();
    if (!clickPos) return;
    let world = screenToWorld(screenPoint(clickPos.x, clickPos.y));

    // A click that reaches here missed every segment's own hit region (those
    // handlers cancelBubble), so on a closed shape it just means "clicked
    // away" — deselect.
    if (closed) {
      onSelectSegment(null);
      onSelectPoint(null);
      return;
    }

    //close enough to first point = close shape
    if (
      points.length >= 3 &&
      distance(world, points[0]) < PROXIMITY_THRESHOLD
    ) {
      onCloseShape();
      return;
    }

    onAddPoint(snapPoint(world));
  };

  // segments to show tooltips for
  let tooltipSegements: Segment[] = [];
  if (!closed && points.length > 0 && pointer) {
    let a = points[points.length - 1];
    let b = snapPoint(screenToWorld(pointer));
    tooltipSegements = [{ a, b, length: distance(a, b) }];
  } else if (draggingIndex !== null) {
    let n = points.length;
    let prev = segments[(draggingIndex - 1 + n) % n];
    let next = segments[draggingIndex];
    tooltipSegements = [prev, next].filter(
      (s): s is Segment => s !== undefined,
    );
  }

  return (
    <Stage
      ref={stageRef}
      width={VIEW_SIZE}
      height={VIEW_SIZE}
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
      onClick={handleStageClick}
      onMouseMove={handlePointerMove}
      onMouseLeave={() => {
        setPointer(null);
        cancelPreview();
      }}
    >
      <Grid />
      <Compass />

      <Layer>
        {closed &&
          segments.map((segment, i) => {
            let a = worldToScreen(segment.a);
            let b = worldToScreen(segment.b);
            let selected = selectedSegment === i;
            return (
              <Line
                key={i}
                points={[a.x, a.y, b.x, b.y]}
                stroke={selected ? "#3366ff" : "#333"}
                strokeWidth={selected ? 4 : 2}
                hitStrokeWidth={16}
                onClick={(e) => {
                  e.cancelBubble = true;
                  if (previewIndexRef.current !== null) {
                    confirmPreview();
                    return;
                  }
                  onSelectSegment(i);
                }}
              />
            );
          })}

        {!closed &&
          points.length >= 2 &&
          points.slice(0, -1).map((point, i) => {
            let a = worldToScreen(point);
            let b = worldToScreen(points[i + 1]);
            return (
              <Line
                key={i}
                points={[a.x, a.y, b.x, b.y]}
                stroke="#333"
                strokeWidth={2}
              />
            );
          })}

        {points.map((p, i) => {
          let screen = worldToScreen(p);
          let selected = selectedPoint === i;
          return (
            <Circle
              key={i}
              x={screen.x}
              y={screen.y}
              radius={selected ? 7 : 5}
              fill={selected ? "#3366ff" : i === 0 ? "#c33" : "#333"}
              draggable={closed}
              onClick={(e) => {
                // While drawing, points aren't selectable yet
                if (!closed) return;

                e.cancelBubble = true;
                if (previewIndexRef.current !== null) {
                  confirmPreview();
                  return;
                }
                onSelectPoint(i);
              }}
              onDragStart={() => {
                setDraggingIndex(i);
                onSelectPoint(i);
              }}
              onDragMove={(e) => {
                let node = e.target;
                let unsnappedWorldPos = screenToWorld(
                  screenPoint(node.x(), node.y()),
                );
                let worldPos = shiftHeld
                  ? snapPoint(unsnappedWorldPos)
                  : unsnappedWorldPos;
                let screenPos = worldToScreen(worldPos);
                node.position(screenPos);
                onMoveVertex(i, worldPos);
              }}
              onDragEnd={() => {
                setDraggingIndex(null);
              }}
            />
          );
        })}
      </Layer>

      <Layer listening={false}>
        {/* dashed line when creating shape before closed */}
        {!closed &&
          points.length > 0 &&
          pointer &&
          (() => {
            let last = worldToScreen(points[points.length - 1]);
            let cursor = worldToScreen(snapPoint(screenToWorld(pointer)));
            return (
              <Line
                points={[last.x, last.y, cursor.x, cursor.y]}
                stroke="#999"
                strokeWidth={2}
                dash={[4, 4]}
              />
            );
          })()}

        {tooltipSegements.map((segment, i) => {
          let a = worldToScreen(segment.a);
          let b = worldToScreen(segment.b);
          let mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          return (
            <Label key={i} x={mid.x} y={mid.y - 12}>
              <Tag
                fill="rgba(0,0,0,0.75)"
                pointerDirection="down"
                pointerWidth={8}
                pointerHeight={6}
                cornerRadius={4}
              />
              <Text
                text={`${segment.length.toFixed(1)} ft`}
                fontSize={11}
                padding={5}
                fill="#fff"
              />
            </Label>
          );
        })}
      </Layer>
    </Stage>
  );
};
