import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

import { CustomFabricObject } from '@/types/type';

export const handleCopy = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    localStorage.setItem('clipboard', JSON.stringify(serializedObjects));
  }
  console.log(activeObjects);
  return activeObjects;
};

export const handlePaste = (
  canvas: fabric.Canvas,
  syncShapeInStorage: (shape: fabric.Object) => void
) => {
  if (!canvas || !(canvas instanceof fabric.Canvas)) {
    console.error('Invalid canvas object. Aborting paste operation.');
    return;
  }

  const clipboardData = localStorage.getItem('clipboard');
  console.log(clipboardData);
  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      fabric.util.enlivenObjects(
        parsedObjects,
        (enlivenedObjects: fabric.Object[]) => {
          const newObjects = enlivenedObjects.map((obj) => {
            obj.set({
              left: (obj.left || 0) + 20,
              top: (obj.top || 0) + 20,
              objectId: uuidv4(),
              fill: '#aabbcc',
            } as CustomFabricObject<any>);
            return obj;
          });

          newObjects.forEach((newObj) => {
            canvas.add(newObj);
            syncShapeInStorage(newObj);
          });

          canvas.renderAll();
        },
        'fabric'
      );
    } catch (error) {
      console.error('Error parsing clipboard data:', error);
    }
  }
};

export const handleDelete = (
  canvas: fabric.Canvas,
  deleteShapeFromStorage: (id: string) => void
) => {
  const activeObjects = canvas.getActiveObjects();

  if (!activeObjects || activeObjects.length === 0) return;
  if (
    activeObjects[0]?.type === 'i-text' &&
    activeObjects[0]?.isEditing === true
  )
    return;

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj: CustomFabricObject<any>) => {
      if (!obj.objectId) return;
      canvas.remove(obj);
      deleteShapeFromStorage(obj.objectId);
    });
  }

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

export const handleKeyDown = ({
  e,
  canvas,
  undo,
  redo,
  syncShapeInStorage,
  deleteShapeFromStorage,
}: {
  e: KeyboardEvent;
  canvas: fabric.Canvas | any;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: fabric.Object) => void;
  deleteShapeFromStorage: (id: string) => void;
}) => {
  const focusedElementType = document.activeElement?.tagName.toLowerCase();
  const isInputFocused = focusedElementType === 'input';

  if (isInputFocused) {
    return;
  }
  //ctrl/cmd + c (copy)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 67) {
    handleCopy(canvas);
  }

  // ctrl/cmd + v (paste)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 86) {
    handlePaste(canvas, syncShapeInStorage);
  }

  //  delete/backspace (delete)
  if (e.keyCode === 8 || e.keyCode === 46) {
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // ctrl/cmd + x (cut)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  //  ctrl/cmd + z (undo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 90) {
    undo();
  }

  //  ctrl/cmd + y (redo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 89) {
    redo();
  }

  //forward slash
  if (e.keyCode === 191 && !e.shiftKey) {
    e.preventDefault();
  }
};
