import { Grid, GizmoHelper, OrbitControls } from "@react-three/drei";
import { CompassGizmo } from "./CompassGizmo";
import { Canvas } from "@react-three/fiber";
import { AlwaysStencilFunc, DoubleSide, ReplaceStencilOp } from "three";
import type { Mesh, Scene, Shape } from "three";
import { useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { Cube } from "./Cube";
import { Bin } from "./Bin";
import GridStencilMask from "./GridStencilMask";
import { floorThickness, gridSnap } from "../../constants";
import type { FloorBounds } from "../../utils/map/floorSvg";
import type {
  Item,
  ItemProps,
  ItemUpdate,
  Polygon,
  TransformMode,
} from "../../types";

type MapCanvasProps = {
  items: Item[];
  setItems: Dispatch<SetStateAction<Item[]>>;
  selectedId: number | null;
  setSelectedId: Dispatch<SetStateAction<number | null>>;
  mode: TransformMode;
  setMode: Dispatch<SetStateAction<TransformMode>>;
  setEditing: Dispatch<SetStateAction<boolean>>;
  editing: boolean;
  floorShape: Shape;
  floorPolygon: Polygon;
  floorBounds: FloorBounds;
  sceneRef: RefObject<Scene | null>;
  pushHistory: () => void;
};

let MapCanvas = ({
  items,
  setItems,
  selectedId,
  setSelectedId,
  mode,
  setMode,
  editing,
  floorShape,
  floorPolygon,
  floorBounds,
  sceneRef,
  setEditing,
  pushHistory,
}: MapCanvasProps) => {
  let gridRef = useRef<Mesh>(null);
  let [transforming, setTransforming] = useState(false);

  let selectItem = (id: number) => {
    setSelectedId(id);
    setMode("translate");
  };

  let doubleClickItem = (id: number) => {
    setSelectedId(id);
    setMode("scale");
  };

  let updateItem = (id: number, changes: ItemUpdate) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      gl={{ stencil: true }}
      onCreated={(state) => {
        sceneRef.current = state.scene;
      }}
      onPointerMissed={() => {
        setEditing(false);
        setSelectedId(null);
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      {items.map((item) => {
        let props: ItemProps = {
          id: item.id,
          position: item.position,
          scale: item.scale,
          selected: item.id === selectedId,
          mode,
          editing,
          setEditing,
          floorPolygon,
          onSelect: selectItem,
          onDoubleClick: doubleClickItem,
          setTransforming: (b) => {
            //only push history on start transforming and not on end
            if (b) pushHistory();
            setTransforming(b);
          },
          onUpdateItem: updateItem,
        };
        return item.type === "cube" ? (
          <Cube key={item.id} {...props} />
        ) : (
          <Bin key={item.id} {...props} />
        );
      })}
      <color attach="background" args={["white"]} />
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        userData={{ type: "floor", floorPolygon }}
      >
        <extrudeGeometry
          args={[floorShape, { depth: floorThickness, bevelEnabled: false }]}
        />
        <meshPhongMaterial
          color={"gray"}
          side={DoubleSide}
          stencilWrite
          stencilRef={1}
          stencilFunc={AlwaysStencilFunc}
          stencilZPass={ReplaceStencilOp}
        />
      </mesh>
      <Grid
        ref={gridRef}
        position={[0, 0.001, 0]}
        args={[floorBounds.width, floorBounds.depth]}
        cellSize={gridSnap}
      />
      <GridStencilMask gridRef={gridRef} />
      <OrbitControls enabled={!transforming} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <CompassGizmo />
      </GizmoHelper>
    </Canvas>
  );
};

export default MapCanvas;
