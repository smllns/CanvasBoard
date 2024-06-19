import React, { useRef } from 'react';
import Dimensions from './settings/Dimensions';
import Text from './settings/Text';
import Color from './settings/Color';
import { RightSidebarProps } from '@/types/type';
import { modifyShape } from '@/lib/shapes';
import CanvasColor from './settings/CanvasColor';

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  isEditingRef,
  activeObjectRef,
  syncShapeInStorage,
  setSelectedElement,
  handleBackgroundColorChange,
}: RightSidebarProps) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;
    isEditingRef.current = true;
    setElementAttributes((prev) => ({
      ...prev,
      [property]: value,
    }));
    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    });
    const activeObject = fabricRef.current?.getActiveObject();

    if (activeObject) {
      setSelectedElement({
        elementId: activeObject.objectId, // or any other identifier
      });
    }
    isEditingRef.current = false;
  };

  return (
    <section className='flex flex-col  bg-primary-graphite text-primary-grey-300 min-w-[200px] max-w-[200px] sticky right-[8px]  my-2 max-sm:hidden select-none rounded-lg'>
      <CanvasColor handleBackgroundColorChange={handleBackgroundColorChange} />
      <Dimensions
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
      />
      <Text
        fontFamily={elementAttributes.fontFamily}
        fontSize={elementAttributes.fontSize}
        fontWeight={elementAttributes.fontWeight}
        handleInputChange={handleInputChange}
      />
      <Color
        inputRef={colorInputRef}
        attribute={elementAttributes.fill}
        placeholder='color'
        attributeType='fill'
        handleInputChange={handleInputChange}
      />
      <Color
        inputRef={strokeInputRef}
        attribute={elementAttributes.stroke}
        placeholder='stroke'
        attributeType='stroke'
        handleInputChange={handleInputChange}
      />
    </section>
  );
};

export default RightSidebar;
