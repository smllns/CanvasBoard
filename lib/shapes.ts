import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { store } from '../app/App'; // Import the Firebase Storage instance

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

// export const handleImageUpload = ({
//   file,
//   canvas,
//   shapeRef,
//   syncShapeInStorage,
// }: ImageUpload) => {
//   const reader = new FileReader();

//   reader.onload = () => {
//     const img = new Image();
//     img.onload = () => {
//       const fabricImage = new fabric.Image(img);

//       fabricImage.scaleToWidth(200);
//       fabricImage.scaleToHeight(200);

//       canvas.current.add(fabricImage);

//       fabricImage.objectId = uuidv4();

//       shapeRef.current = fabricImage;

//       syncShapeInStorage(fabricImage);
//       canvas.current.requestRenderAll();
//       return fabricImage;
//     };

//     img.onerror = (error) => {
//       console.error('Error loading image:', error);
//     };

//     img.src = reader.result as string;
//     return img;
//   };

//   reader.onerror = (error) => {
//     console.error('Error reading file:', error);
//   };

//   reader.readAsDataURL(file);
// };

export const handleImageUpload = async ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      // Upload the image file to Firebase Storage
      const storageRef = ref(store, `images/${file.name}`);
      await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded image
      const imageUrl = await getDownloadURL(storageRef);
      console.log(imageUrl);

      // Create a fabric.js Image object with the uploaded image URL
      fabric.Image.fromURL(imageUrl, (fabricImage) => {
        // Set desired width and height for the image
        fabricImage.scaleToWidth(200);
        fabricImage.scaleToHeight(200);
        fabricImage.set({
          objectId: uuidv4(), // Generate unique ID
          imageUrl: imageUrl, // Store the image URL
        });

        // Add the image to the fabric.js canvas
        canvas.current.add(fabricImage);

        // Set the fabric.js Image object as the current shape reference
        shapeRef.current = fabricImage;

        // Synchronize the shape in storage (if needed)
        syncShapeInStorage(fabricImage);

        // Request rendering of the fabric.js canvas
        canvas.current.requestRenderAll();
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  reader.onerror = (error) => {
    console.error('Error reading file:', error);
  };

  // Read the file as a data URL
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

  // if  property is width or height, set the scale of the selected element
  if (property === 'width') {
    selectedElement.set('scaleX', 1);
    selectedElement.set('width', value);
  } else if (property === 'height') {
    selectedElement.set('scaleY', 1);
    selectedElement.set('height', value);
  } else if (property === 'front') {
    bringElement({
      canvas: canvas,
      direction: 'front',
      syncShapeInStorage,
    });
    selectedElement.set(property as keyof object, value);
  } else if (property === 'back') {
    bringElement({
      canvas: canvas,
      direction: 'back',
      syncShapeInStorage,
    });
    selectedElement.set(property as keyof object, value);
  } else {
    if (selectedElement[property as keyof object] === value) return;
    selectedElement.set(property as keyof object, value);
  }

  // set selectedElement to activeObjectRef
  activeObjectRef.current = selectedElement;

  syncShapeInStorage(selectedElement);
};

export const bringElement = ({
  canvas,
  direction,
  syncShapeInStorage,
}: ElementDirection) => {
  if (!canvas) return;
  console.log(canvas);
  // get the selected element. If there is no selected element or there are more than one selected element, return
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === 'activeSelection') return;
  // canvas.remove(selectedElement);
  // bring the selected element to the front
  if (direction === 'front') {
    console.log('hi');

    canvas.bringToFront(selectedElement);
  } else if (direction === 'back') {
    console.log('bye');
    canvas.sendToBack(selectedElement);
  }
  canvas.requestRenderAll();
  // canvas.renderAll();
  syncShapeInStorage(selectedElement);

  // re-render all objects on the canvas
};
