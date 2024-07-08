import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { store } from '../app/App';

import {
  CustomFabricObject,
  ElementDirection,
  ImageUpload,
  ModifyShape,
} from '@/types/type';

export const createRectangle = (pointer: PointerEvent) => {
  const rect = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: '#aabbcc',
    objectId: uuidv4(),
  } as CustomFabricObject<fabric.Rect>);

  return rect;
};

export const createTriangle = (pointer: PointerEvent) => {
  return new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: '#aabbcc',
    objectId: uuidv4(),
  } as CustomFabricObject<fabric.Triangle>);
};

export const createCircle = (pointer: PointerEvent) => {
  return new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 100,
    fill: '#aabbcc',
    objectId: uuidv4(),
  } as any);
};

export const createLine = (pointer: PointerEvent) => {
  return new fabric.Line(
    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
    {
      stroke: '#aabbcc',
      strokeWidth: 2,
      objectId: uuidv4(),
    } as CustomFabricObject<fabric.Line>
  );
};

export const createText = (pointer: PointerEvent, text: string) => {
  return new fabric.IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: '#aabbcc',
    fontFamily: 'Helvetica',
    fontSize: 36,
    fontWeight: '400',
    objectId: uuidv4(),
  } as fabric.ITextOptions);
};

export const createSpecificShape = (
  shapeType: string,
  pointer: PointerEvent
) => {
  switch (shapeType) {
    case 'rectangle':
      return createRectangle(pointer);

    case 'triangle':
      return createTriangle(pointer);

    case 'circle':
      return createCircle(pointer);

    case 'line':
      return createLine(pointer);

    case 'text':
      return createText(pointer, 'Tap to Type');

    default:
      return null;
  }
};

export const handleImageUpload = async ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const storageRef = ref(store, `images/${file.name}`);
      await uploadBytes(storageRef, file);

      const imageUrl = await getDownloadURL(storageRef);
      console.log(imageUrl);

      fabric.Image.fromURL(imageUrl, (fabricImage) => {
        fabricImage.scaleToWidth(200);
        fabricImage.scaleToHeight(200);
        fabricImage.set({
          objectId: uuidv4(),
          imageUrl: imageUrl,
        });

        canvas.current.add(fabricImage);

        shapeRef.current = fabricImage;

        syncShapeInStorage(fabricImage);

        canvas.current.requestRenderAll();
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  reader.onerror = (error) => {
    console.error('Error reading file:', error);
  };

  reader.readAsDataURL(file);
};

export const createShape = (
  canvas: fabric.Canvas,
  pointer: PointerEvent,
  shapeType: string
) => {
  if (shapeType === 'freeform') {
    canvas.isDrawingMode = true;
    return null;
  }

  return createSpecificShape(shapeType, pointer);
};

export const modifyShape = ({
  canvas,
  property,
  value,
  activeObjectRef,
  syncShapeInStorage,
}: ModifyShape) => {
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === 'activeSelection') return;

  if (property === 'width') {
    selectedElement.set('scaleX', 1);
    selectedElement.set('width', value);
  } else if (property === 'height') {
    selectedElement.set('scaleY', 1);
    selectedElement.set('height', value);
  } else {
    if (selectedElement[property as keyof object] === value) return;
    selectedElement.set(property as keyof object, value);
  }

  activeObjectRef.current = selectedElement;

  syncShapeInStorage(selectedElement);
};
