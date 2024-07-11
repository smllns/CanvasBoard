import { BaseUserMeta, User } from '@liveblocks/client';
import { Gradient, Pattern } from 'fabric/fabric-impl';

export enum CursorMode {
  Hidden,
  Chat,
  ReactionSelector,
  Reaction,
}

export type CursorState =
  | {
      mode: CursorMode.Hidden;
    }
  | {
      mode: CursorMode.Chat;
      message: string;
      previousMessage: string | null;
    }
  | {
      mode: CursorMode.ReactionSelector;
    }
  | {
      mode: CursorMode.Reaction;
      reaction: string;
      isPressed: boolean;
    };

export type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
};

export type ReactionEvent = {
  x: number;
  y: number;
  value: string;
};

export type ShapeData = {
  type: string;
  width: number;
  height: number;
  fill: string | Pattern | Gradient;
  left: number;
  top: number;
  objectId: string | undefined;
};

export type Attributes = {
  width: string;
  height: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  fill: string;
  stroke: string;
};

export type ActiveElement = {
  name: string;
  value: string;
  icon: string;
} | null;
export type SelectedElement = {
  elementId: string;
} | null;

export interface CustomFabricObject<T extends fabric.Object>
  extends fabric.Object {
  objectId?: string;
}

export type ModifyShape = {
  canvas: fabric.Canvas;
  property: string;
  value: any;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  syncShapeInStorage: (shape: fabric.Object) => void;
};

export type ElementDirection = {
  canvas: fabric.Canvas;
  direction: string;
  syncShapeInStorage: (shape: fabric.Object) => void;
};

export type ImageUpload = {
  file: File;
  canvas: React.MutableRefObject<fabric.Canvas>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  syncShapeInStorage: (shape: fabric.Object) => void;
};

export type RightSidebarProps = {
  elementAttributes: Attributes;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  activeObjectRef: React.RefObject<fabric.Object | null>;
  isEditingRef: React.MutableRefObject<boolean>;
  syncShapeInStorage: (obj: any) => void;
  setSelectedElement: React.Dispatch<React.SetStateAction<Attributes>>;
  handleBackgroundColorChange: (obj: any) => void;
};
export type LeftSidebarProps = {
  allShapes: Array<ActiveElement>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  selectedElement: SelectedElement;
  handleActiveElement: (obj: any) => void;
};

export type NavbarProps = {
  activeElement: ActiveElement;
  imageInputRef: React.MutableRefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleActiveElement: (element: ActiveElement) => void;
};

export type ShapesMenuProps = {
  item: {
    name: string;
    icon: string;
    value: Array<ActiveElement>;
  };
  activeElement: any;
  handleActiveElement: any;
  handleImageUpload: any;
  imageInputRef: any;
};

export type CanvasMouseDown = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  selectedShapeRef: any;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
};

export type CanvasMouseMove = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  selectedShapeRef: any;
  shapeRef: any;
  syncShapeInStorage: (shape: fabric.Object) => void;
};

export type CanvasMouseUp = {
  canvas: fabric.Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: any;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  selectedShapeRef: any;
  syncShapeInStorage: (shape: fabric.Object) => void;
  setActiveElement: any;
};

export type CanvasObjectModified = {
  options: fabric.IEvent;
  syncShapeInStorage: (shape: fabric.Object) => void;
};

export type CanvasPathCreated = {
  options: (fabric.IEvent & { path: CustomFabricObject<fabric.Path> }) | any;
  syncShapeInStorage: (shape: fabric.Object) => void;
};

export type CanvasSelectionCreated = {
  options: fabric.IEvent;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  isEditingRef: React.MutableRefObject<boolean>;
  setSelectedElement: React.Dispatch<React.SetStateAction<Attributes>>;
};

export type CanvasObjectScaling = {
  options: fabric.IEvent;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
};
export type CanvasResize = {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
};
export type CanvasZoom = {
  options: fabric.IEvent & { e: WheelEvent };
  canvas: fabric.Canvas | null;
};
export type CanvasMoving = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  isGrabbing: React.MutableRefObject<boolean>;
  lastPosX: React.MutableRefObject<number>;
  lastPosY: React.MutableRefObject<number>;
  isDrawing: React.MutableRefObject<boolean>;
  selectedShapeRef: any;
  shapeRef: any;
  syncShapeInStorage: (shape: fabric.Object) => void;
};
export type CanvasGrabDown = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  isGrabbing: React.MutableRefObject<boolean>;
  lastPosX: React.MutableRefObject<number>;
  lastPosY: React.MutableRefObject<number>;
};
export type CanvasGrabMove = {
  e: fabric.IEvent;
  canvas: fabric.Canvas;
  isGrabbing: React.MutableRefObject<boolean>;
  lastPosX: React.MutableRefObject<number>;
  lastPosY: React.MutableRefObject<number>;
};
export type HandlingKeyDown = {
  e: KeyboardEvent;
  canvas: fabric.Canvas | any;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: fabric.Object) => void;
  deleteShapeFromStorage: (id: string) => void;
};
export type ColorProps = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};
export type DimensionsProps = {
  width: string;
  height: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

export type TextProps = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  handleInputChange: (property: string, value: string) => void;
};

export type SelectProps = {
  config: {
    property: string;
    placeholder: string;
    options: { label: string; value: string }[];
  };
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  handleInputChange: (property: string, value: string) => void;
};

export type LiveProps = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
  backgroundColor: string;
  handleActiveElement: (element: ActiveElement) => void;
};

export type RenderCanvas = {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasObjects: any;
  activeObjectRef: any;
};

export type CursorChatProps = {
  cursor: { x: number; y: number };
  cursorState: CursorState;
  setCursorState: (cursorState: CursorState) => void;
  updateMyPresence: (
    presence: Partial<{
      cursor: { x: number; y: number };
      cursorColor: string;
      message: string;
    }>
  ) => void;
};
