//main controller of the app: holds important canvas event listeners and renders other components

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
import { ActiveElement, Attributes, SelectedElement } from '@/types/type';
import { useMutation, useRedo, useStorage, useUndo } from '@/liveblocks.config';
import { defaultNavElement } from '@/constants';
import { handleDelete, handleKeyDown } from '@/lib/key-events';
import { handleImageUpload } from '@/lib/shapes';
import { initializeApp } from 'firebase/app';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import Popup from '@/components/Popup';

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
  const [bgColor, setBgColor] = useState('#1f2731');
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
  const [showPopup, setShowPopup] = useState(false);

  //canvas background color functions
  const syncBackgroundColor = useMutation(({ storage }, color) => {
    storage.set('bgColor', color);
  }, []);

  const handleBackgroundColorChange = (color) => {
    setBgColor(color);
    syncBackgroundColor(color);
  };
  //function for synchronizing canvas objects to all users
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
  const [selectedElement, setSelectedElement] = useState<SelectedElement>({
    elementId: '',
  });

  //functions for deleting objects from canvas/storage
  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get('canvasObjects');
    if (!canvasObjects || canvasObjects.size === 0) return true;
    for (const [objectId, object] of canvasObjects.entries()) {
      if (object.src) {
        const storageRef = ref(store, object.src);
        deleteObject(storageRef);
      }
      canvasObjects.delete(objectId);
    }
    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get('canvasObjects');
    const imageUrl = canvasObjects.get(objectId)?.src;
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

  //event listeners for most of the events on canvas
  useEffect(() => {
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
        setSelectedElement,
      });
    });
    canvas.on('selection:updated', (options: any) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
        setSelectedElement,
      });
    });

    canvas.on('selection:cleared', () => {
      setSelectedElement(null);
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

  const [color, setColor] = useState('#1f2731');
  const backCol = useStorage((root) => root.bgColor);

  useEffect(() => {
    if (!backCol) return;
    if (backCol !== color) {
      setColor(backCol);
    }
  }, [backCol, color]);

  //showing popup window on smaller screens
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    };

    handleResize(); // Call it initially
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
      <section
        className='flex h-full flex-row'
        style={{ backgroundColor: color }}
      >
        {showPopup && <Popup onClose={handleClosePopup} />}
        <LeftSidebar
          allShapes={Array.from(canvasObjects)}
          fabricRef={fabricRef}
          selectedElement={selectedElement}
          handleActiveElement={handleActiveElement}
        />
        <Live
          canvasRef={canvasRef}
          undo={undo}
          redo={redo}
          backgroundColor={bgColor}
          handleActiveElement={handleActiveElement}
        />
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          setSelectedElement={setSelectedElement}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
          handleBackgroundColorChange={handleBackgroundColorChange}
        />
      </section>
    </main>
  );
}
