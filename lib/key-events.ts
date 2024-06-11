import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

import { CustomFabricObject } from '@/types/type';

export const handleCopy = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    // Serialize the selected objects
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    // Store the serialized objects in the clipboard
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

  // Retrieve serialized objects from the clipboard
  const clipboardData = localStorage.getItem('clipboard');
  console.log(clipboardData);
  if (clipboardData) {
    try {
      const parsedObjects = JSON.parse(clipboardData);
      fabric.util.enlivenObjects(
        parsedObjects,
        (enlivenedObjects: fabric.Object[]) => {
          const newObjects = enlivenedObjects.map((obj) => {
            // Offset the pasted objects to avoid overlap with existing objects
            obj.set({
              left: (obj.left || 0) + 20,
              top: (obj.top || 0) + 20,
              objectId: uuidv4(),
              fill: '#aabbcc',
            } as CustomFabricObject<any>);
            return obj;
          });

          // Add the new objects to the canvas only once
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

// create a handleKeyDown function that listen to different keydown events
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
  // Check if the key pressed is ctrl/cmd + c (copy)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 67) {
    handleCopy(canvas);
  }

  // Check if the key pressed is ctrl/cmd + v (paste)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 86) {
    handlePaste(canvas, syncShapeInStorage);
  }

  // Check if the key pressed is delete/backspace (delete)
  if (e.keyCode === 8 || e.keyCode === 46) {
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // check if the key pressed is ctrl/cmd + x (cut)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // check if the key pressed is ctrl/cmd + z (undo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 90) {
    undo();
  }

  // check if the key pressed is ctrl/cmd + y (redo)
  if ((e?.ctrlKey || e?.metaKey) && e.keyCode === 89) {
    redo();
  }

  if (e.keyCode === 191 && !e.shiftKey) {
    e.preventDefault();
  }
};
