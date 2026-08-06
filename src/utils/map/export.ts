import { GLTFExporter } from "three/examples/jsm/Addons.js";
import type { Scene } from "three";
import type { RefObject } from "react";

export let onExport = async (sceneRef: RefObject<Scene | null>) => {
  let scene = sceneRef.current;
  if (!scene) return false;
  try {
    let exporter = new GLTFExporter();
    let data = (await exporter.parseAsync(scene, {
      binary: true,
    })) as ArrayBuffer;
    let blob = new Blob([data], { type: "application/octet-stream" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "scene.glb";
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
