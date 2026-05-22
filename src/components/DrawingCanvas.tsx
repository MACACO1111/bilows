import React from "react";
import DrawingBoard, { DrawingCanvasRef as BoardRef } from "./DrawingBoard";

export type DrawingCanvasRef = BoardRef;

const DrawingCanvas = React.forwardRef<DrawingCanvasRef, any>((props, ref) => {
  return (
    <DrawingBoard
      ref={ref}
      onSaveImage={props.onSaveImage || (() => {})}
      initialDataUrl={props.initialDataUrl}
      kingdomColor={props.kingdomColor}
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
