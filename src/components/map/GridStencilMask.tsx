import { useLayoutEffect } from "react";
import { EqualStencilFunc, type Mesh } from "three";

// Sets the grid's stencil test once its mesh exists. Must be rendered inside
// <Canvas> - r3f mounts on its own reconciler tick, so an effect in the outer
// component would run before gridRef.current is populated.
let GridStencilMask = ({
  gridRef,
}: {
  gridRef: React.RefObject<Mesh | null>;
}) => {
  useLayoutEffect(() => {
    let material = gridRef.current?.material;
    if (!material || Array.isArray(material)) return;
    material.stencilWrite = true;
    material.stencilFunc = EqualStencilFunc;
    material.stencilRef = 1;
  });
  return null;
};

export default GridStencilMask;
