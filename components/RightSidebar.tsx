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

  handleBackgroundColorChange,
}: RightSidebarProps) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true;
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
  };
  return (
    <section className='flex flex-col  bg-primary-graphite text-primary-grey-300 min-w-[200px] max-w-[200px] sticky right-[8px]  my-2 max-sm:hidden select-none rounded-lg'>
      {/* <h3 className='px-5 pt-4 text-xs uppercase'>design</h3>
      <span className='text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-grey-200 pb-4'>
        Make changes to canvas as you like
      </span> */}
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
