import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from "react";
import * as fabric from "fabric";
import BilowCardView from "./BilowCardView";
import { BilowCard } from "../types";
import { 
  Square, 
  Circle, 
  Type, 
  MousePointer2, 
  Undo, 
  Redo, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  Minus,
  Pencil,
  Copy,
  Clipboard,
  CopyPlus,
  Maximize,
  Triangle as TriangleIcon,
  Eraser,
  PaintBucket,
  Palette,
  Layers,
  MoveUp,
  MoveDown,
  Activity,
  Star,
  Zap,
  Moon,
  ArrowRight,
  Heart,
  Pentagon as PentagonIcon,
  RectangleHorizontal,
  Spline,
  Hash,
  FlipHorizontal,
  FlipVertical,
  Group,
  Ungroup,
  RotateCw,
  PieChart,
  RefreshCw,
} from "lucide-react";

// Override fabric.Circle rendering to turn fractional circles with startAngle/endAngle 
// into solid, closed pizza pie sector shapes (so borders and fills are closed and draw back to the center).
if (!(fabric.Circle.prototype as any).__isOverridden) {
  const originalCircleRender = (fabric.Circle.prototype as any)._render;
  (fabric.Circle.prototype as any).__originalRender = originalCircleRender;
  (fabric.Circle.prototype as any).__isOverridden = true;

  (fabric.Circle.prototype as any)._render = function (ctx: CanvasRenderingContext2D) {
    const startAngle = this.startAngle ?? 0;
    const endAngle = this.endAngle ?? 360;
    const angleSpan = Math.abs(endAngle - startAngle);

    if (angleSpan >= 360) {
      const orig = (fabric.Circle.prototype as any).__originalRender;
      if (orig) {
        orig.call(this, ctx);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        this._renderPaintInOrder(ctx);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(
        0,
        0,
        this.radius,
        fabric.util.degreesToRadians(startAngle),
        fabric.util.degreesToRadians(endAngle),
        false
      );
      ctx.lineTo(0, 0);
      ctx.closePath();
      this._renderPaintInOrder(ctx);
    }
  };
}

type Tool = "select" | "rect" | "circle" | "triangle" | "text" | "line" | "draw" | "eraser" | "polyline";

export interface DrawingCanvasRef {
  exportToImage: () => string | undefined;
}

interface DrawingBoardProps {
  onSaveImage: (dataUrl: string) => void;
  initialDataUrl?: string;
  kingdomColor?: string;
  card?: BilowCard;
  isEditing?: boolean;
  onCardChange?: (updatedCard: Partial<BilowCard>) => void;
}

const DrawingBoard = React.forwardRef<DrawingCanvasRef, DrawingBoardProps>(({ 
  onSaveImage, 
  initialDataUrl,
  card,
  isEditing = true,
  onCardChange
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const isDisposingRef = useRef(false);

  // Helper function to export canvas as base64 PNG
  const getExportDataUrl = useCallback(() => {
    if (!fabricCanvasRef.current) return undefined;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    
    // Temporarily hide handles and selection border for a clean PNG export
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.renderAll();
    
    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      multiplier: 1, 
    });

    // Restore active object selection
    if (activeObject) {
      fabricCanvasRef.current.setActiveObject(activeObject);
      fabricCanvasRef.current.renderAll();
    }
    
    return dataUrl;
  }, []);

  useImperativeHandle(ref, () => ({
    exportToImage: () => {
      return getExportDataUrl();
    }
  }));

  const [activeTool, setActiveTool] = useState<Tool>("select");
  
  // Use refs for stack to avoid effect re-runs
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  
  // State for UI updates only
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isHistoryProcessing = useRef(false);
  
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const clipboardRef = useRef<any>(null);

  const [activeCircleObject, setActiveCircleObject] = useState<fabric.Circle | null>(null);
  const [startAngle, setStartAngle] = useState(0);
  const [endAngle, setEndAngle] = useState(360);

  const polylinePointsRef = useRef<{ x: number; y: number }[]>([]);
  const tempPolylineObjRef = useRef<fabric.Polyline | null>(null);
  const isDrawingPolylineRef = useRef<boolean>(false);

  const activeToolRef = useRef<Tool>("select");
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const fillColorRef = useRef(fillColor);

  const initialDataUrlRef = useRef(initialDataUrl);
  const initialUrlLoadedRef = useRef(false);

  const onSaveImageRef = useRef(onSaveImage);
  useEffect(() => {
    onSaveImageRef.current = onSaveImage;
  }, [onSaveImage]);

  // Trigger reactive updates to parent and local history track
  const saveHistory = useCallback(() => {
    if (!fabricCanvasRef.current || isHistoryProcessing.current || isDisposingRef.current) return;
    const json = JSON.stringify(fabricCanvasRef.current.toObject());
    
    const newHistory = [...historyRef.current.slice(0, historyIndexRef.current + 1), json];
    historyRef.current = newHistory.slice(-50);
    historyIndexRef.current = historyRef.current.length - 1;
    
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);

    // Call save image callback to sync the card artwork instantly
    const dataUrl = getExportDataUrl();
    if (dataUrl) {
      onSaveImageRef.current(dataUrl);
    }
  }, [getExportDataUrl]);

  const saveHistoryRef = useRef(saveHistory);
  useEffect(() => {
    saveHistoryRef.current = saveHistory;
  }, [saveHistory]);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { fillColorRef.current = fillColor; }, [fillColor]);

  const setTool = useCallback((tool: Tool) => {
    setActiveTool(tool);
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.isDrawingMode = (tool === 'draw' || tool === 'eraser');
    canvas.selection = tool === 'select';
    
    if (tool === 'draw') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    } else if (tool === 'eraser') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = strokeWidth * 4;
      canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
    }

    if (tool !== 'polyline') {
      if (isDrawingPolylineRef.current && tempPolylineObjRef.current) {
        finalizePolylineRef.current(false, tool);
        return;
      }
    } else {
      if (isDrawingPolylineRef.current && tempPolylineObjRef.current) {
        finalizePolylineRef.current(false, 'polyline');
        return;
      } else {
        // Guarantee clean state with no stale data from any interrupt
        isDrawingPolylineRef.current = false;
        tempPolylineObjRef.current = null;
        polylinePointsRef.current = [];
      }
    }

    // Discard any active selection to prevent conflicts when switching out of select mode
    if (tool !== 'select') {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }

    // Toggle selectability & event handling of existing objects to prevent click hijacking during active drawing session
    const isInteractive = (tool === 'select');
    canvas.forEachObject((obj: any) => {
      // Don't make the card background template image interactive or selectable under any circumstances
      if (obj.isCardBackground || obj.type === 'image') {
        obj.set({ selectable: false, evented: false });
        return;
      }
      obj.set({
        selectable: isInteractive,
        evented: isInteractive,
      });
    });

    canvas.requestRenderAll();
  }, [strokeColor, strokeWidth]);

  const cancelPolyline = useCallback(() => {
    if (tempPolylineObjRef.current && fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(tempPolylineObjRef.current);
    }
    isDrawingPolylineRef.current = false;
    tempPolylineObjRef.current = null;
    polylinePointsRef.current = [];
    fabricCanvasRef.current?.requestRenderAll();
    setTool('select');
  }, [setTool]);

  const finalizePolyline = useCallback((forceClosed: boolean = false, nextTool: Tool = 'select') => {
    if (!isDrawingPolylineRef.current || !tempPolylineObjRef.current || !fabricCanvasRef.current) return;
    
    const pts = [...polylinePointsRef.current];
    if (pts.length > 2) {
      pts.pop(); // remove moving guide point
      
      // Filter out duplicate consecutive points (e.g. from rapid double clicking)
      const cleanPts = [];
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) {
          cleanPts.push(pts[i]);
        } else {
          const last = cleanPts[cleanPts.length - 1];
          const curr = pts[i];
          if (Math.hypot(curr.x - last.x, curr.y - last.y) >= 4) {
            cleanPts.push(curr);
          }
        }
      }

      if (cleanPts.length >= 2) {
        fabricCanvasRef.current.remove(tempPolylineObjRef.current);
        
        // Use explicitly passed forceClosed to determine if it is a closed loop polygon
        const isClosed = forceClosed && cleanPts.length >= 3;

        const minX = Math.min(...cleanPts.map(p => p.x));
        const minY = Math.min(...cleanPts.map(p => p.y));
        const relativePts = cleanPts.map(p => ({ x: p.x - minX, y: p.y - minY }));
        
        let finalShape;
        if (isClosed) {
          finalShape = new fabric.Polygon(relativePts, {
            left: minX,
            top: minY,
            stroke: strokeColorRef.current,
            strokeWidth: strokeWidthRef.current,
            fill: fillColorRef.current === 'transparent' ? '#cbd5e1' : fillColorRef.current,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
          });
        } else {
          finalShape = new fabric.Polyline(relativePts, {
            left: minX,
            top: minY,
            stroke: strokeColorRef.current,
            strokeWidth: strokeWidthRef.current,
            fill: 'transparent', // STRICTLY transparent/no-fill for open paths (polylines)
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
          });
        }

        fabricCanvasRef.current.add(finalShape);
        fabricCanvasRef.current.setActiveObject(finalShape);
      } else {
        fabricCanvasRef.current.remove(tempPolylineObjRef.current);
      }
    } else {
      fabricCanvasRef.current.remove(tempPolylineObjRef.current);
    }
    
    isDrawingPolylineRef.current = false;
    tempPolylineObjRef.current = null;
    polylinePointsRef.current = [];
    
    fabricCanvasRef.current.requestRenderAll();
    saveHistory();
    setTool(nextTool);
  }, [saveHistory, setTool]);

  const finalizePolylineRef = useRef(finalizePolyline);
  const cancelPolylineRef = useRef(cancelPolyline);
  
  useEffect(() => { finalizePolylineRef.current = finalizePolyline; }, [finalizePolyline]);
  useEffect(() => { cancelPolylineRef.current = cancelPolyline; }, [cancelPolyline]);

  const handleUpdateSector = (type: 'start' | 'end', value: number) => {
    if (!activeCircleObject) return;
    
    if (type === 'start') {
      setStartAngle(value);
      activeCircleObject.set('startAngle', value);
    } else {
      setEndAngle(value);
      activeCircleObject.set('endAngle', value);
    }
    fabricCanvasRef.current?.renderAll();
    saveHistory();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const isCardMode = !!card;
    const canvasWidth = isCardMode ? 400 : 1000;
    const canvasHeight = isCardMode ? 245 : 400;

    const canvasEl = canvasRef.current;

    // Use transparent background for high quality drawing overlays on card
    const canvas = new fabric.Canvas(canvasEl, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "transparent",
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
    });

    fabricCanvasRef.current = canvas;

    // Native dblclick handler for total resilience on empty space/transparent cards
    if (canvas.upperCanvasEl) {
      canvas.upperCanvasEl.addEventListener("dblclick", (e) => {
        if (activeToolRef.current === "polyline" && isDrawingPolylineRef.current) {
          e.preventDefault();
          e.stopPropagation();
          finalizePolylineRef.current();
        }
      });
    }

    // Load initial background/illustration image if edited card exists exactly once
    const initialUrl = initialDataUrlRef.current;
    if (initialUrl && !initialUrlLoadedRef.current) {
      initialUrlLoadedRef.current = true;
      fabric.Image.fromURL(initialUrl, { crossOrigin: 'anonymous' }).then((img) => {
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          selectable: false,
          evented: false,
        });
        (img as any).isCardBackground = true;
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();

        const initialJson = JSON.stringify(canvas.toObject());
        historyRef.current = [initialJson];
        historyIndexRef.current = 0;
      }).catch((err) => {
        console.error("Erro ao carregar imagem original", err);
        const initialJson = JSON.stringify(canvas.toObject());
        historyRef.current = [initialJson];
        historyIndexRef.current = 0;
      });
    } else {
      const initialJson = JSON.stringify(canvas.toObject());
      historyRef.current = [initialJson];
      historyIndexRef.current = 0;
    }

    setCanUndo(false);
    setCanRedo(false);

    canvas.on("object:modified", () => saveHistoryRef.current());
    canvas.on("object:added", (e) => {
      if (!(e as any).isHistoryAction) {
        saveHistoryRef.current();
      }
    });
    canvas.on("object:removed", () => saveHistoryRef.current());

    canvas.on("selection:created", (e) => {
      const active = e.selected?.[0];
      if (active) {
        if (active.fill && typeof active.fill === 'string') setFillColor(active.fill);
        if (active.stroke && typeof active.stroke === 'string') setStrokeColor(active.stroke);
        if (active.strokeWidth) setStrokeWidth(active.strokeWidth);
        if ((active as any).fontSize) setFontSize((active as any).fontSize);
        if ((active as any).fontFamily) setFontFamily((active as any).fontFamily);

        if (active.type === 'circle') {
          setActiveCircleObject(active as fabric.Circle);
          setStartAngle((active as any).startAngle ?? 0);
          setEndAngle((active as any).endAngle ?? 360);
        } else {
          setActiveCircleObject(null);
        }
      }
    });

    canvas.on("selection:updated", (e) => {
      const active = e.selected?.[0];
      if (active) {
        if (active.fill && typeof active.fill === 'string') setFillColor(active.fill);
        if (active.stroke && typeof active.stroke === 'string') setStrokeColor(active.stroke);
        if (active.strokeWidth) setStrokeWidth(active.strokeWidth);
        if ((active as any).fontSize) setFontSize((active as any).fontSize);
        if ((active as any).fontFamily) setFontFamily((active as any).fontFamily);

        if (active.type === 'circle') {
          setActiveCircleObject(active as fabric.Circle);
          setStartAngle((active as any).startAngle ?? 0);
          setEndAngle((active as any).endAngle ?? 360);
        } else {
          setActiveCircleObject(null);
        }
      }
    });

    canvas.on("selection:cleared", () => {
      setActiveCircleObject(null);
    });

    canvas.on("mouse:down", (opt) => {
      if (activeToolRef.current !== "polyline") return;

      // Handle right-click to immediately finalize polyline
      const ev = opt.e as any;
      const isRightClick = (opt as any).button === 3 || (ev && (ev.button === 2 || ev.which === 3 || ev.buttons === 2));
      if (isRightClick) {
        if (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        if (isDrawingPolylineRef.current) {
          finalizePolylineRef.current();
        }
        return;
      }
      
      const pointer = canvas.getScenePoint(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      if (!isDrawingPolylineRef.current || !polylinePointsRef.current || polylinePointsRef.current.length < 2 || !tempPolylineObjRef.current) {
        isDrawingPolylineRef.current = true;
        polylinePointsRef.current = [{ x, y }, { x, y }];
        
        const poly = new fabric.Polyline([{ x, y }, { x, y }], {
          stroke: strokeColorRef.current,
          strokeWidth: strokeWidthRef.current,
          fill: fillColorRef.current === 'transparent' ? 'transparent' : fillColorRef.current,
          selectable: false,
          evented: false,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        });
        canvas.add(poly);
        tempPolylineObjRef.current = poly;
      } else {
        const pts = [...polylinePointsRef.current];
        const firstPt = pts[0] || { x, y };
        const distToStart = Math.hypot(x - firstPt.x, y - firstPt.y);

        if (distToStart < 20 && pts.length >= 3) {
          // Close the figure by snapping the last point to the start point and finalizing
          pts[pts.length - 1] = { x: firstPt.x, y: firstPt.y };
          polylinePointsRef.current = pts;
          finalizePolylineRef.current(true);
          return;
        }

        // Tap or click on the same spot as the last vertex to finalize drawing
        if (pts.length >= 3) {
          const lastPlaced = pts[pts.length - 2];
          if (lastPlaced) {
            const distToLast = Math.hypot(x - lastPlaced.x, y - lastPlaced.y);
            if (distToLast < 10) {
              finalizePolylineRef.current();
              return;
            }
          }
        }

        pts[pts.length - 1] = { x, y };
        pts.push({ x, y });
        polylinePointsRef.current = pts;
        
        if (tempPolylineObjRef.current) {
          tempPolylineObjRef.current.set({ points: pts });
          tempPolylineObjRef.current.dirty = true;
          tempPolylineObjRef.current.setCoords();
        }
        canvas.requestRenderAll();
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (activeToolRef.current !== "polyline" || !isDrawingPolylineRef.current || !tempPolylineObjRef.current) return;
      
      const pointer = canvas.getScenePoint(opt.e);
      const x = pointer.x;
      const y = pointer.y;
      
      const pts = [...polylinePointsRef.current];
      if (pts.length >= 2) {
        pts[pts.length - 1] = { x, y };
        polylinePointsRef.current = pts;
        
        tempPolylineObjRef.current.set({ points: pts });
        tempPolylineObjRef.current.dirty = true;
        tempPolylineObjRef.current.setCoords();
        canvas.requestRenderAll();
      }
    });

    canvas.on("mouse:dblclick", () => {
      if (activeToolRef.current !== "polyline" || !isDrawingPolylineRef.current) return;
      finalizePolylineRef.current();
    });

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (activeToolRef.current === 'polyline') {
        if (e.key === 'Enter') {
          e.preventDefault();
          finalizePolylineRef.current();
          return;
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelPolylineRef.current();
          return;
        }
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl && e.key === 'z') { e.preventDefault(); undo(); }
      if (isCtrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active && !(active as any).isEditing) deleteSelected();
      }
      if (isCtrl && e.key === 'c') copy();
      if (isCtrl && e.key === 'v') paste();
      
      if (e.key === 'v') setTool('select');
      if (e.key === 't') addText();
      if (e.key === 'r') addRect();
      if (e.key === 'o') addCircle();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const active = canvas.getActiveObject();
        if (active) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          switch (e.key) {
            case 'ArrowUp': active.top! -= step; break;
            case 'ArrowDown': active.top! += step; break;
            case 'ArrowLeft': active.left! -= step; break;
            case 'ArrowRight': active.left! += step; break;
          }
          active.setCoords();
          canvas.renderAll();
          saveHistoryRef.current();
        }
      }
    };

    const handleWindowMouseUp = (e: MouseEvent | TouchEvent) => {
      try {
        const fc = canvas as any;
        const target = e.target as HTMLElement | null;
        if (target && (target.closest('.canvas-container') || target === canvasEl)) {
          return;
        }
        if (typeof fc._onMouseUp === 'function') fc._onMouseUp(e);
        if (typeof fc.onMouseUp === 'function') fc.onMouseUp(e);
        if (fc.pointerHandler && typeof fc.pointerHandler.onMouseUp === 'function') {
          fc.pointerHandler.onMouseUp(e);
        }
      } catch (err) {
        // ignore errors
      }
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchend', handleWindowMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isDisposingRef.current = true;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchend', handleWindowMouseUp);
      
      // Unbind all events BEFORE disposing to prevent lifecycle loop
      canvas.off();
      canvas.dispose().then(() => {
        // Disposed canvas successfully
      }).catch(err => {
        console.error("Disposal error ignored on unmount", err);
      });
      fabricCanvasRef.current = null;

      // Synchronously unwrap the canvas element from .canvas-container wrapper 
      // to resolve any async dispose race condition under React Strict Mode
      if (canvasEl) {
        const wrapper = canvasEl.parentNode;
        if (wrapper && (wrapper as HTMLElement).classList.contains('canvas-container')) {
          const container = wrapper.parentNode;
          if (container) {
            container.insertBefore(canvasEl, wrapper);
            container.removeChild(wrapper);
          }
        }
      }
    };
  }, []);

  const undo = () => {
    if (historyIndexRef.current > 0) {
      const nextIndex = historyIndexRef.current - 1;
      const state = historyRef.current[nextIndex];
      isHistoryProcessing.current = true;
      fabricCanvasRef.current?.loadFromJSON(state).then(() => {
        fabricCanvasRef.current?.renderAll();
        isHistoryProcessing.current = false;
        historyIndexRef.current = nextIndex;
        setCanUndo(nextIndex > 0);
        setCanRedo(true);

        const dataUrl = getExportDataUrl();
        if (dataUrl) onSaveImage(dataUrl);
      });
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const nextIndex = historyIndexRef.current + 1;
      const state = historyRef.current[nextIndex];
      isHistoryProcessing.current = true;
      fabricCanvasRef.current?.loadFromJSON(state).then(() => {
        fabricCanvasRef.current?.renderAll();
        isHistoryProcessing.current = false;
        historyIndexRef.current = nextIndex;
        setCanUndo(true);
        setCanRedo(nextIndex < historyRef.current.length - 1);

        const dataUrl = getExportDataUrl();
        if (dataUrl) onSaveImage(dataUrl);
      });
    }
  };

  const getSpawnCoords = (defaultX: number, defaultY: number, cardX: number, cardY: number) => {
    return card ? { left: cardX, top: cardY } : { left: defaultX, top: defaultY };
  };

  const addRect = () => {
    const rect = new fabric.Rect({
      ...getSpawnCoords(100, 100, 120, 50),
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      width: 150,
      height: 100,
    });
    fabricCanvasRef.current?.add(rect);
    setTool('select');
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      ...getSpawnCoords(150, 150, 150, 70),
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      radius: 50,
    });
    fabricCanvasRef.current?.add(circle);
    fabricCanvasRef.current?.setActiveObject(circle);
    fabricCanvasRef.current?.renderAll();
    setTool('select');
  };

  const addTriangle = () => {
    const tri = new fabric.Triangle({
      ...getSpawnCoords(200, 200, 150, 70),
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      width: 100,
      height: 100,
    });
    fabricCanvasRef.current?.add(tri);
    setTool('select');
  };

  const addPentagon = () => {
    const pent = new fabric.Polygon([
      { x: 50, y: 0 }, { x: 100, y: 38 }, { x: 81, y: 100 }, { x: 19, y: 100 }, { x: 0, y: 38 }
    ], {
      ...getSpawnCoords(200, 200, 150, 70), width: 100, height: 100,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(pent);
    setTool('select');
  };

  const addStar5 = () => {
    const star = new fabric.Polygon([
      { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 },
      { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 },
      { x: 2, y: 35 }, { x: 39, y: 35 }
    ], {
      ...getSpawnCoords(200, 200, 150, 70), width: 100, height: 100,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(star);
    setTool('select');
  };

  const addStar6 = () => {
    const star = new fabric.Polygon([
      { x: 50, y: 0 }, { x: 65, y: 25 }, { x: 95, y: 25 }, { x: 80, y: 50 },
      { x: 95, y: 75 }, { x: 65, y: 75 }, { x: 50, y: 100 }, { x: 35, y: 75 },
      { x: 5, y: 75 }, { x: 20, y: 50 }, { x: 5, y: 25 }, { x: 35, y: 25 }
    ], {
      ...getSpawnCoords(200, 200, 150, 70), width: 100, height: 100,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(star);
    setTool('select');
  };

  const addTrapezoid = () => {
    const trap = new fabric.Polygon([
      { x: 20, y: 0 }, { x: 80, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }
    ], {
      ...getSpawnCoords(200, 200, 150, 70), width: 100, height: 100,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(trap);
    setTool('select');
  };

  const addRoundedRect = () => {
    const rect = new fabric.Rect({
      ...getSpawnCoords(100, 100, 125, 50), width: 150, height: 100, rx: 20, ry: 20,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(rect);
    setTool('select');
  };

  const addHeart = () => {
    const heart = new fabric.Path("M 272 238 C 206 238 152 292 152 358 C 152 493 288 528 381 662 C 468 529 609 489 609 358 C 609 292 556 238 489 238 C 441 238 400 267 381 307 C 362 267 320 238 272 238 z", {
      ...getSpawnCoords(200, 200, 150, 45), scaleX: 0.15, scaleY: 0.15,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: 10, // Higher stroke for path
    });
    fabricCanvasRef.current?.add(heart);
    setTool('select');
  };

  const addLightning = () => {
    const zap = new fabric.Polygon([
      { x: 40, y: 0 }, { x: 0, y: 60 }, { x: 30, y: 60 }, { x: 20, y: 100 }, { x: 60, y: 40 }, { x: 30, y: 40 }
    ], {
      ...getSpawnCoords(200, 200, 170, 70), width: 60, height: 100,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(zap);
    setTool('select');
  };

  const addMoon = () => {
    const moon = new fabric.Path("M 50 0 A 50 50 0 1 0 50 100 A 40 40 0 1 1 50 0 Z", {
      ...getSpawnCoords(200, 200, 150, 70), scaleX: 1, scaleY: 1,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(moon);
    setTool('select');
  };

  const addArrow = () => {
    const arrow = new fabric.Polygon([
      { x: 0, y: 40 }, { x: 60, y: 40 }, { x: 60, y: 20 }, { x: 100, y: 50 }, { x: 60, y: 80 }, { x: 60, y: 60 }, { x: 0, y: 60 }
    ], {
      ...getSpawnCoords(200, 200, 150, 70), width: 100, height: 100,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
    });
    fabricCanvasRef.current?.add(arrow);
    setTool('select');
  };

  const addLine = () => {
    const line = new fabric.Line([0, 0, 150, 0], {
      ...getSpawnCoords(200, 200, 125, 120),
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeLineCap: 'round'
    });
    fabricCanvasRef.current?.add(line);
    setTool('select');
  };

  const addText = () => {
    const text = new fabric.IText("Digite aqui...", {
      ...getSpawnCoords(250, 250, 120, 100),
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: strokeColor
    });
    fabricCanvasRef.current?.add(text);
    setTool('select');
  };

  const handleUpdateStyle = (type: 'fill' | 'stroke' | 'width' | 'fontSize' | 'fontFamily', value: string | number) => {
    if (type === 'fill') setFillColor(value as string);
    if (type === 'stroke') setStrokeColor(value as string);
    if (type === 'width') setStrokeWidth(value as number);
    if (type === 'fontSize') setFontSize(value as number);
    if (type === 'fontFamily') setFontFamily(value as string);

    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      if (type === 'fill') active.set('fill', value === 'transparent' ? 'transparent' : value);
      if (type === 'stroke') active.set('stroke', value);
      if (type === 'width') active.set('strokeWidth', value);
      if (type === 'fontSize') active.set('fontSize', value as number);
      if (type === 'fontFamily') active.set('fontFamily', value as string);
      fabricCanvasRef.current?.renderAll();
      saveHistory();
    }

    // Update drawing brush if active
    if (fabricCanvasRef.current?.isDrawingMode && fabricCanvasRef.current.freeDrawingBrush) {
      if (type === 'stroke') fabricCanvasRef.current.freeDrawingBrush.color = value as string;
      if (type === 'width') fabricCanvasRef.current.freeDrawingBrush.width = value as number;
    }
  };

  const copy = async () => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      const cloned = await active.clone();
      clipboardRef.current = cloned;
    }
  };

  const duplicate = async () => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      const cloned = await active.clone();
      fabricCanvasRef.current?.discardActiveObject();
      cloned.set({
        left: cloned.left! + 15,
        top: cloned.top! + 15,
        evented: true,
      });
      if (cloned instanceof fabric.ActiveSelection) {
        cloned.canvas = fabricCanvasRef.current!;
        cloned.forEachObject((obj: any) => fabricCanvasRef.current?.add(obj));
        cloned.setCoords();
      } else {
        fabricCanvasRef.current?.add(cloned);
      }
      fabricCanvasRef.current?.setActiveObject(cloned);
      fabricCanvasRef.current?.requestRenderAll();
      saveHistory();
    }
  };

  const groupObjects = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (active && active.type === 'activeSelection') {
      const group = active.toGroup();
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const ungroupObjects = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (active && active.type === 'group') {
      const selection = active.toActiveSelection();
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const flip = (axis: 'x' | 'y') => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      if (axis === 'x') active.set('flipX', !active.flipX);
      else active.set('flipY', !active.flipY);
      fabricCanvasRef.current?.renderAll();
      saveHistory();
    }
  };

  const rotate = (angle: number) => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      active.set('angle', (active.angle || 0) + angle);
      fabricCanvasRef.current?.renderAll();
      saveHistory();
    }
  };

  const addFractionalCircle = () => {
    const circle = new fabric.Circle({
      left: 150, top: 150, radius: 50,
      fill: fillColor === 'transparent' ? 'transparent' : fillColor,
      stroke: strokeColor, strokeWidth: strokeWidth,
      startAngle: 0,
      endAngle: 270, // 3/4 circle by default
    });
    fabricCanvasRef.current?.add(circle);
    fabricCanvasRef.current?.setActiveObject(circle);
    fabricCanvasRef.current?.renderAll();
    setTool('select');
  };

  const paste = async () => {
    if (!clipboardRef.current) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const clonedObj = await clipboardRef.current.clone();
    canvas.discardActiveObject();
    clonedObj.set({
      left: clonedObj.left! + 20,
      top: clonedObj.top! + 20,
      evented: true,
    });
    if (clonedObj instanceof fabric.ActiveSelection) {
      clonedObj.canvas = canvas;
      clonedObj.forEachObject((obj: any) => canvas.add(obj));
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }
    clipboardRef.current.top! += 20;
    clipboardRef.current.left! += 20;
    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
    saveHistory();
  };

  const bringToFront = () => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      fabricCanvasRef.current?.bringObjectToFront(active);
      saveHistory();
    }
  };

  const sendToBack = () => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      fabricCanvasRef.current?.sendObjectToBack(active);
      saveHistory();
    }
  };

  const moveForward = () => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      fabricCanvasRef.current?.bringObjectForward(active);
      saveHistory();
    }
  };

  const moveBackward = () => {
    const active = fabricCanvasRef.current?.getActiveObject();
    if (active) {
      fabricCanvasRef.current?.sendObjectBackwards(active);
      saveHistory();
    }
  };

  const deleteSelected = () => {
    const activeObjects = fabricCanvasRef.current?.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      fabricCanvasRef.current?.discardActiveObject();
      activeObjects.forEach((obj) => fabricCanvasRef.current?.remove(obj));
      saveHistory();
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#1e293b] w-full max-w-4xl min-h-[520px] rounded-3xl overflow-hidden border border-white/10 select-none text-gray-800">
      {/* PROFESSIONAL TOOLBAR */}
      <div style={{ marginTop: '-16px' }} className="w-full bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-2 shadow-sm sticky top-0 z-20 text-gray-850">
        <div className="flex items-center space-x-1 border-r pr-2 shadow-[inset_-1px_0_0_0_#eee]">
          <ToolButton 
            active={activeTool === 'select'} 
            onClick={() => setTool('select')} 
            icon={<MousePointer2 className="w-5 h-5" />} 
            title="Selecionar (V)" 
          />
          <ToolButton 
            active={activeTool === 'draw'} 
            onClick={() => setTool('draw')} 
            icon={<Pencil className="w-4 h-4" />} 
            title="Lápis" 
          />
          <ToolButton 
            active={activeTool === 'eraser'} 
            onClick={() => setTool('eraser')} 
            icon={<Eraser className="w-4 h-4" />} 
            title="Borracha" 
          />
        </div>

        <div className="flex items-center space-x-1 border-r pr-2 text-gray-500">
          <ToolButton onClick={addRect} icon={<Square className="w-4 h-4" />} title="Retângulo" />
          <ToolButton onClick={addCircle} icon={<Circle className="w-4 h-4" />} title="Círculo" />
          <ToolButton onClick={addTriangle} icon={<TriangleIcon className="w-4 h-4" />} title="Triângulo" />
          <div className="flex items-center space-x-0.5 px-1 bg-gray-50 rounded-md border border-gray-100">
            <ToolButton active={activeTool === 'line'} onClick={() => { setTool('line'); addLine(); }} icon={<Minus className="w-4 h-4" />} title="Linha Reta" />
            <ToolButton active={activeTool === 'polyline'} onClick={() => setTool('polyline')} icon={<Spline className="w-4 h-4" />} title="Polilinha Interativa" />
          </div>
          <ToolButton onClick={addText} icon={<Type className="w-4 h-4" />} title="Texto (T)" />
        </div>

        {/* SPECIAL SHAPES GROUP */}
        <div className="flex items-center space-x-1 border-r pr-2 text-gray-405 overflow-x-auto max-w-[280px] scrollbar-hide py-1">
          <ToolButton onClick={addRoundedRect} icon={<RectangleHorizontal className="w-4 h-4" />} title="Caixa Arredondada" />
          <ToolButton onClick={addFractionalCircle} icon={<PieChart className="w-4 h-4" />} title="Forma de Pizza / Setor (Editável)" />
          <ToolButton onClick={addPentagon} icon={<PentagonIcon className="w-4 h-4" />} title="Pentágono" />
          <ToolButton onClick={addStar5} icon={<Star className="w-4 h-4" />} title="Estrela 5 Pontas" />
          <ToolButton onClick={addStar6} icon={<Star className="w-4 h-4 text-yellow-500" />} title="Estrela 6 Pontas" />
          <ToolButton onClick={addTrapezoid} icon={<Square className="w-4 h-4 transform skew-x-12" />} title="Trapézio" />
          <ToolButton onClick={addHeart} icon={<Heart className="w-4 h-4 text-red-500" />} title="Coração" />
          <ToolButton onClick={addLightning} icon={<Zap className="w-4 h-4 text-yellow-500" />} title="Raio" />
          <ToolButton onClick={addMoon} icon={<Moon className="w-4 h-4 text-indigo-400" />} title="Meia Lua" />
          <ToolButton onClick={addArrow} icon={<ArrowRight className="w-4 h-4 text-blue-450" />} title="Seta" />
        </div>

        {/* STYLE CONTROLS */}
        <div className="flex items-center space-x-3 border-r pr-2 ml-2">
          <label className="flex items-center space-x-1 cursor-pointer group" title="Cor de Preenchimento">
            <PaintBucket 
              className="w-4 h-4 transition-colors group-hover:text-black" 
              style={{ color: fillColor === 'transparent' ? '#cbd5e1' : fillColor }}
            />
            <input 
              type="color" 
              className="w-0 h-0 opacity-0 absolute"
              value={fillColor === 'transparent' ? '#ffffff' : fillColor}
              onChange={(e) => handleUpdateStyle('fill', e.target.value)}
            />
            <div 
              className="w-5 h-5 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: fillColor === 'transparent' ? 'white' : fillColor, backgroundImage: fillColor === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }}
            />
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStyle('fill', 'transparent');
              }} 
              className="text-[9px] font-bold text-gray-400 hover:text-red-500 ml-0.5"
              title="Remover Preenchimento"
            >
              X
            </button>
          </label>

          <label className="flex items-center space-x-1 cursor-pointer group" title="Cor da Linha / Texto">
            <Palette 
              className="w-4 h-4 transition-colors group-hover:text-black" 
              style={{ color: strokeColor }}
            />
            <input 
              type="color" 
              className="w-0 h-0 opacity-0 absolute"
              value={strokeColor}
              onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
            />
            <div 
              className="w-5 h-5 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: strokeColor }}
            />
          </label>

          <div className="flex items-center space-x-1 border-l pl-2" title="Espessura da Linha">
            <Hash className="w-3 h-3 text-gray-400" />
            <select 
              className="text-[10px] font-bold bg-transparent hover:bg-gray-50 rounded border border-gray-200 px-0.5 cursor-pointer outline-none"
              value={strokeWidth}
              onChange={(e) => handleUpdateStyle('width', parseInt(e.target.value))}
            >
              {[0, 1, 2, 4, 8, 12, 16, 24, 32].map(w => (
                <option key={w} value={w}>{w === 0 ? "SEM" : `${w}px`}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-1" title="Tamanho da Fonte">
            <Type className="w-4 h-4 text-gray-400" />
            <select 
              className="text-xs font-bold bg-gray-50 rounded border px-1 text-gray-800"
              value={fontSize}
              onChange={(e) => handleUpdateStyle('fontSize', parseInt(e.target.value))}
            >
              {[12, 16, 20, 24, 32, 40, 48, 64, 72, 96, 128].map(s => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-1" title="Fonte">
            <select 
              className="text-[10px] font-bold bg-gray-50 rounded border px-1 w-20 text-gray-850"
              value={fontFamily}
              onChange={(e) => handleUpdateStyle('fontFamily', e.target.value)}
            >
              {['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Impact', 'Comic Sans MS'].map(f => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PIZZA / SLICE CONTROLS */}
        {activeCircleObject && (
          <div className="flex items-center space-x-3 border-r pr-2 bg-amber-50 px-3 py-1 rounded-2xl border border-amber-200 shrink-0">
            <span className="text-[10px] font-black text-amber-850 uppercase flex items-center space-x-1 shrink-0">
              <PieChart className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              <span>Ajustar Pizza:</span>
            </span>
            <div className="flex items-center space-x-1.5" title="Ângulo Inicial">
              <span className="text-[9px] font-bold text-amber-700 select-none">Início:</span>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={startAngle} 
                onChange={(e) => handleUpdateSector('start', parseInt(e.target.value))}
                className="w-16 h-1 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[9px] font-mono text-amber-700 w-6">{startAngle}°</span>
            </div>
            <div className="flex items-center space-x-1.5" title="Ângulo Final">
              <span className="text-[9px] font-bold text-amber-700 select-none">Fim:</span>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={endAngle} 
                onChange={(e) => handleUpdateSector('end', parseInt(e.target.value))}
                className="w-16 h-1 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[9px] font-mono text-amber-700 w-6">{endAngle}°</span>
            </div>
            <div className="flex items-center space-x-1 pl-1 border-l border-amber-200">
              <button 
                onClick={() => {
                  handleUpdateSector('start', 0);
                  handleUpdateSector('end', 360);
                }}
                className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[8px] font-black uppercase transition-colors"
                title="Círculo Completo"
              >
                Cheia
              </button>
              <button 
                onClick={() => {
                  handleUpdateSector('start', 0);
                  handleUpdateSector('end', 180);
                }}
                className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[8px] font-black uppercase transition-colors"
                title="Meia Lua"
              >
                Meia
              </button>
              <button 
                onClick={() => {
                  handleUpdateSector('start', 0);
                  handleUpdateSector('end', 90);
                }}
                className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[8px] font-black uppercase transition-colors"
                title="Fatia"
              >
                Fatia
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-1 border-r pr-2">
          <ToolButton onClick={undo} disabled={!canUndo} icon={<Undo className="w-4 h-4" />} title="Voltar (Ctrl+Z)" />
          <ToolButton onClick={redo} disabled={!canRedo} icon={<Redo className="w-4 h-4" />} title="Avançar (Ctrl+Y)" />
        </div>

        <div className="flex items-center space-x-1 border-r pr-2">
          <ToolButton onClick={copy} icon={<Copy className="w-4 h-4" />} title="Copiar (Ctrl+C)" />
          <ToolButton onClick={paste} icon={<Clipboard className="w-4 h-4" />} title="Colar (Ctrl+V)" />
          <ToolButton onClick={duplicate} icon={<CopyPlus className="w-4 h-4" />} title="Duplicar" />
        </div>

        <div className="flex items-center space-x-1 border-r pr-2">
          <ToolButton onClick={groupObjects} icon={<Group className="w-4 h-4" />} title="Agrupar" />
          <ToolButton onClick={ungroupObjects} icon={<Ungroup className="w-4 h-4" />} title="Desagrupar" />
        </div>

        <div className="flex items-center space-x-1 border-r pr-2">
          <ToolButton onClick={() => flip('x')} icon={<FlipHorizontal className="w-4 h-4" />} title="Inverter Horizontal" />
          <ToolButton onClick={() => flip('y')} icon={<FlipVertical className="w-4 h-4" />} title="Inverter Vertical" />
          <ToolButton onClick={() => rotate(45)} icon={<RotateCw className="w-4 h-4" />} title="Girar 45°" />
          <ToolButton onClick={() => rotate(90)} icon={<RefreshCw className="w-4 h-4" />} title="Girar 90°" />
        </div>

        <div className="flex items-center space-x-1 border-r pr-2">
          <ToolButton onClick={moveForward} icon={<MoveUp className="w-4 h-4" />} title="Trazer um Nível" />
          <ToolButton onClick={moveBackward} icon={<MoveDown className="w-4 h-4" />} title="Recuar um Nível" />
          <ToolButton onClick={bringToFront} icon={<ChevronUp className="w-4 h-4" />} title="Trazer para Frente" />
          <ToolButton onClick={sendToBack} icon={<ChevronDown className="w-4 h-4" />} title="Enviar para Trás" />
        </div>

        <div className="ml-auto flex items-center space-x-1">
          <ToolButton onClick={deleteSelected} danger icon={<Trash2 className="w-5 h-5" />} title="Excluir (Del)" />
        </div>
      </div>

      <div className="flex-grow w-full flex flex-col items-center justify-center p-4 overflow-auto bg-[#121214] relative border border-white/5 rounded-2xl my-2">
        {activeTool === 'polyline' && (
          <div className="mb-4 bg-[#fbfb00] text-black px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center space-x-3 z-30 transition-all select-none border border-black/10">
            <span>📐 Modo Polilinha: Clique no quadro para posicionar vértices.</span>
            <button 
              onClick={() => finalizePolyline()}
              className="bg-black text-white px-3 py-1 rounded-xl text-[8px] hover:bg-slate-800 transition font-bold uppercase"
            >
              Concluir polilinha (Enter)
            </button>
            <button 
              onClick={() => cancelPolyline()}
              className="bg-red-600 text-white px-2.5 py-1 rounded-xl text-[8px] hover:bg-red-700 transition font-bold uppercase"
              title="Cancelar"
            >
              Cancelar (Esc)
            </button>
          </div>
        )}

        {card ? (
          <div className="relative inline-block scale-95 md:scale-100 transition-all">
            <BilowCardView 
              card={card}
              isEditing={isEditing}
              onCardChange={onCardChange}
              innerStyle={{ marginTop: '-22px', marginLeft: '0px' }}
              canvasElement={
                <div ref={containerRef} className="relative w-[400px] h-[245px] overflow-hidden">
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                       style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                  <canvas ref={canvasRef} width={400} height={245} className="absolute inset-0 z-10" />
                </div>
              }
            />
          </div>
        ) : (
          <div ref={containerRef} className="bg-[#1e293b] shadow-2xl border border-white/10 relative inline-block rounded-xl overflow-hidden min-w-[400px] min-h-[245px]">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.1]" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            <canvas ref={canvasRef} className="relative z-10" />
          </div>
        )}
      </div>
      
      <div className="w-full bg-white border-t border-gray-200 py-1.5 px-4 text-[8px] text-gray-500 flex justify-between uppercase font-bold italic">
        <span>V: Seleção | T: Texto | R: Retâng. | O: Círculo | CTRL+C/V: Copiar/Colar</span>
        <span className="text-red-500">PLATAFORMA CARDS DESIGN PRO 3.0</span>
      </div>
    </div>
  );
});

export default DrawingBoard;

function ToolButton({ 
  icon, 
  onClick, 
  active = false, 
  disabled = false, 
  title,
  danger = false
}: { 
  icon: React.ReactNode; 
  onClick: () => void; 
  active?: boolean;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      className={`p-1.5 rounded-md transition-all cursor-pointer ${
        disabled ? 'opacity-20 cursor-not-allowed' : 
        active ? 'bg-[#fbfb00] text-black shadow-inner translate-y-0.5' : 
        danger ? 'hover:bg-red-50 text-red-500' :
        'hover:bg-gray-100 text-gray-700'
      }`}
    >
      {icon}
    </button>
  );
}
