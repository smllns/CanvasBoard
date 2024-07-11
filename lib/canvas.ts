//functions working with event listeners mostly from App.tsx

import { fabric } from 'fabric';
import { v4 as uuid4 } from 'uuid';
import {
  CanvasGrabDown,
  CanvasGrabMove,
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasMoving,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasResize,
  CanvasSelectionCreated,
  CanvasZoom,
  RenderCanvas,
} from '@/types/type';
import { defaultNavElement } from '@/constants';
import { createSpecificShape } from './shapes';

export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  const canvasElement = document.getElementById('canvas');
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
    preserveObjectStacking: true,
    selection: false,
  });
  fabricRef.current = canvas;
  return canvas;
};

export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  const pointer = canvas.getPointer(options.e);
  const target = canvas.findTarget(options.e, false);
  canvas.isDrawingMode = false;
  if (selectedShapeRef.current === 'freeform') {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    return;
  }
  canvas.isDrawingMode = false;
  if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === 'activeSelection')
  ) {
    isDrawing.current = false;
    canvas.setActiveObject(target);
    target.setCoords();
  } else {
    isDrawing.current = true;
    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer as any
    );
    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
};

export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === 'freeform') return;
  canvas.isDrawingMode = false;
  const pointer = canvas.getPointer(options.e);
  switch (selectedShapeRef?.current) {
    case 'rectangle':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case 'circle':
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;
    case 'triangle':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case 'line':
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;
    case 'image':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
    default:
      break;
  }
  canvas.renderAll();
  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
};

export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === 'freeform') return;
  syncShapeInStorage(shapeRef.current);
  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;
  if (!canvas.isDrawingMode) {
    setTimeout(() => {
      setActiveElement(defaultNavElement);
    }, 700);
  }
};

export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;
  if (target.type === 'activeSelection' && target.canvas) {
    const objects = target.getObjects();
    objects.forEach((obj) => {
      obj.on('moving', () => {
        syncShapeInStorage(obj);
      });
      syncShapeInStorage(obj);
    });
  } else {
    target.on('moving', () => {
      syncShapeInStorage(target);
    });
    syncShapeInStorage(target);
  }
};

export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: CanvasPathCreated) => {
  const path = options.path;
  if (!path) return;
  path.set({
    objectId: uuid4(),
  });
  syncShapeInStorage(path);
};

export const handleCanvasObjectMoving = ({
  options,
}: {
  options: fabric.IEvent;
}) => {
  const target = options.target as fabric.Object;
  const canvas = target.canvas as fabric.Canvas;
  target.setCoords();
  if (target && target.left) {
    target.left = Math.max(
      0,
      Math.min(
        target.left,
        (canvas.width || 0) - (target.getScaledWidth() || target.width || 0)
      )
    );
  }
  if (target && target.top) {
    target.top = Math.max(
      0,
      Math.min(
        target.top,
        (canvas.height || 0) - (target.getScaledHeight() || target.height || 0)
      )
    );
  }
};

export const handleCanvasSelectionCreated = ({
  options,
  isEditingRef,
  setElementAttributes,
  setSelectedElement,
}: CanvasSelectionCreated) => {
  if (isEditingRef.current) return;
  if (!options?.selected) {
    return;
  }
  const selectedElement = options?.selected[0] as fabric.Object;
  setSelectedElement(selectedElement.objectId);
  if (selectedElement && options.selected.length === 1) {
    const scaledWidth = selectedElement?.scaleX
      ? selectedElement?.width! * selectedElement?.scaleX
      : selectedElement?.width;
    const scaledHeight = selectedElement?.scaleY
      ? selectedElement?.height! * selectedElement?.scaleY
      : selectedElement?.height;
    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || '',
      height: scaledHeight?.toFixed(0).toString() || '',
      fill: selectedElement?.fill?.toString() || '',
      stroke: selectedElement?.stroke || '',
      // @ts-ignore
      fontSize: selectedElement?.fontSize || '',
      // @ts-ignore
      fontFamily: selectedElement?.fontFamily || '',
      // @ts-ignore
      fontWeight: selectedElement?.fontWeight || '',
    });
  }
};

export const handleCanvasObjectScaling = ({
  options,
  setElementAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;
  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;
  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;
  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || '',
    height: scaledHeight?.toFixed(0).toString() || '',
  }));
};

export const renderCanvas = ({
  fabricRef,
  canvasObjects,
  activeObjectRef,
}: RenderCanvas) => {
  fabricRef.current?.clear();
  Array.from(canvasObjects, ([objectId, objectData]) => {
    fabric.util.enlivenObjects(
      [objectData],
      (enlivenedObjects: fabric.Object[]) => {
        enlivenedObjects.forEach((enlivenedObj) => {
          if (activeObjectRef.current?.objectId === objectId) {
            fabricRef.current?.setActiveObject(enlivenedObj);
          }
          fabricRef.current?.add(enlivenedObj);
        });
      },
      'fabric'
    );
  });

  fabricRef.current?.renderAll();
};

export const handleResize = ({ fabricRef }: CanvasResize) => {
  const canvasElement = document.getElementById('canvas');
  const canvas = fabricRef.current;
  if (!canvasElement || !canvas) return;
  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

export const handleCanvasZoom = ({ options, canvas }: CanvasZoom) => {
  const delta = options.e?.deltaY;
  let zoom = canvas?.getZoom() ?? 1;
  const minZoom = 0.2;
  const maxZoom = 2;
  const zoomStep = 0.1;
  const zoomDirection = delta && delta > 0 ? -1 : 1;
  zoom = Math.min(Math.max(minZoom, zoom + zoomDirection * zoomStep), maxZoom);
  const zoomPoint = new fabric.Point(options.e.offsetX, options.e.offsetY);
  if (canvas) {
    canvas.zoomToPoint(zoomPoint, zoom);
  }
  options.e.preventDefault();
  options.e.stopPropagation();
};

export const handleMoving = ({
  options,
  canvas,
  isGrabbing,
  lastPosX,
  lastPosY,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMoving) => {
  if (selectedShapeRef.current !== null)
    handleCanvaseMouseMove({
      options,
      canvas,
      isDrawing,
      selectedShapeRef,
      shapeRef,
      syncShapeInStorage,
    });
  if (selectedShapeRef.current === null)
    handleCanvasGrabMove({
      e: options,
      canvas,
      isGrabbing,
      lastPosX,
      lastPosY,
    });
};

export const handleCanvasGrabDown = ({
  options,
  canvas,
  isGrabbing,
  lastPosX,
  lastPosY,
}: CanvasGrabDown) => {
  if (options.target) return;
  isGrabbing.current = true;
  const pointer = canvas.getPointer(options.e);
  lastPosX.current = pointer.x;
  lastPosY.current = pointer.y;
};
export const handleCanvasGrabMove = ({
  e,
  canvas,
  isGrabbing,
  lastPosX,
  lastPosY,
}: CanvasGrabMove) => {
  if (!isGrabbing.current) return;
  const pointer = canvas.getPointer(e.e);
  const zoom = canvas.getZoom();
  const deltaX = (pointer.x - lastPosX.current) * zoom;
  const deltaY = (pointer.y - lastPosY.current) * zoom;
  const delta = new fabric.Point(deltaX, deltaY);
  canvas.relativePan(delta);
  lastPosX.current = pointer.x;
  lastPosY.current = pointer.y;
};

export const handleCanvasGrabUp = ({
  isGrabbing,
}: {
  isGrabbing: React.MutableRefObject<boolean>;
}) => {
  isGrabbing.current = false;
};
export const getObjectById = ({
  fabricRef,
  objectId,
}: {
  fabricRef: fabric.Canvas | null;
  objectId: string;
}) => {
  if (!fabricRef) return null;
  const objects = fabricRef.getObjects();
  for (const obj of objects) {
    if (obj.objectId === objectId) {
      return obj;
    }
  }
  return null;
};
