'use client';
import { fabric } from 'fabric';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import Live from '@/components/Live';
import Navbar from '@/components/Navbar';
import { useEffect, useRef, useState } from 'react';
import {
  handleCanvasGrabDown,
  handleCanvasGrabUp,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handleMoving,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from '@/lib/canvas';
import { ActiveElement, Attributes } from '@/types/type';
import { useMutation, useRedo, useStorage, useUndo } from '@/liveblocks.config';
import { defaultNavElement } from '@/constants';
import { handleDelete, handleKeyDown } from '@/lib/key-events';
import { handleImageUpload } from '@/lib/shapes';
import { initializeApp } from 'firebase/app';
import { deleteObject, getStorage, ref } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
export const store = getStorage(app);

export default function Page() {
  const undo = useUndo();
  const redo = useRedo();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);
  const [bgColor, setBgColor] = useState('#1f2731'); // Initial background color

  const canvasObjects = useStorage((root) => root.canvasObjects);
  const isGrabbing = useRef(false);
  const lastPosX = useRef(0);
  const lastPosY = useRef(0);

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: '',
    height: '',
    fontSize: '',
    fontFamily: '',
    fontWeight: '',
    fill: '#aabbcc',
    stroke: '#aabbcc',
  });

  const syncBackgroundColor = useMutation(({ storage }, color) => {
    storage.set('bgColor', color);
  }, []);

  // Update background color and sync with Liveblocks
  const handleBackgroundColorChange = (color) => {
    setBgColor(color);
    syncBackgroundColor(color);
  };

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    const { objectId, zIndex } = object;
    const shapeData = object.toJSON();

    shapeData.objectId = objectId;
    shapeData.zIndex = zIndex;
    const canvasObjects = storage.get('canvasObjects');
    canvasObjects.set(objectId, shapeData);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: '',
    value: '',
    icon: '',
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get('canvasObjects');
    if (!canvasObjects || canvasObjects.size === 0) return true;

    // for (const [key, value] of canvasObjects.entries()) {
    //   canvasObjects.delete(key);
    // }
    for (const [objectId, object] of canvasObjects.entries()) {
      console.log(object);
      // Check if the object has an image URL
      if (object.src) {
        // Create a reference to the corresponding file in Firebase Storage
        const storageRef = ref(store, object.src);
        // Delete the file from Firebase Storage
        deleteObject(storageRef);
      }
      // Delete the object from canvasObjects
      canvasObjects.delete(objectId);
    }
    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get('canvasObjects');
    const imageUrl = canvasObjects.get(objectId)?.src;

    // Delete the file from Firebase Storage if the image URL exists
    if (imageUrl) {
      const storageRef = ref(store, imageUrl);
      deleteObject(storageRef);
    }
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);
    selectedShapeRef.current = elem?.value as string;
    switch (elem?.value) {
      case 'reset':
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      case 'delete':
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
      case 'image':
        imageInputRef.current?.click();
        isDrawing.current = false;
        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // console.log(isGrabbing);
    const canvas = initializeFabric({
      canvasRef,
      fabricRef,
    });

    canvas.on('mouse:down', (options: any) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    });
    canvas.on('mouse:down', (options: any) => {
      handleCanvasGrabDown({
        options,
        canvas,
        isGrabbing,
        lastPosX,
        lastPosY,
      });
    });

    canvas.on('mouse:up', () => {
      handleCanvasGrabUp({
        isGrabbing,
      });
    });

    // canvas.on('mouse:move', (options: any) => {
    //   handleCanvaseMouseMove({
    //     options,
    //     canvas,
    //     isDrawing,
    //     selectedShapeRef,
    //     shapeRef,
    //     syncShapeInStorage,
    //   });
    // });
    canvas.on('mouse:move', (options: any) => {
      handleMoving({
        options,
        canvas,
        isGrabbing,
        lastPosX,
        lastPosY,
        isDrawing,
        selectedShapeRef,
        shapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on('mouse:up', () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });

    canvas.on('object:modified', (options: any) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on('object:moving', (options: any) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on('selection:created', (options: any) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on('object:scaling', (options: any) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on('path:created', (options: any) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });
    canvas.on('mouse:wheel', (options: any) => {
      handleCanvasZoom({
        options,
        canvas,
      });
    });

    window.addEventListener('resize', () => {
      handleResize({ fabricRef });
    });

    window.addEventListener('keydown', (e: any) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

  return (
    <main className='h-screen overflow-hidden'>
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage,
          });
        }}
      />
      <section className='flex h-full flex-row'>
        <LeftSidebar
          allShapes={Array.from(canvasObjects)}
          fabricRef={fabricRef}
          syncShapeInStorage={syncShapeInStorage}
        />
        <Live
          canvasRef={canvasRef}
          undo={undo}
          redo={redo}
          backgroundColor={bgColor}
        />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
          // setBgColor={setBgColor}
          handleBackgroundColorChange={handleBackgroundColorChange}
        />
      </section>
    </main>
  );
}