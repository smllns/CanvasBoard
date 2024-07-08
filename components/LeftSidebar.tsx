import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { getShapeInfo } from '@/lib/utils';
import { getObjectById } from '@/lib/canvas';
import './styles.css';
import cross from '../public/assets/cross.svg';
import { LeftSidebarProps } from '@/types/type';

const LeftSidebar = ({
  allShapes,
  fabricRef,
  selectedElement,
  handleActiveElement,
}: LeftSidebarProps) => {
  const deleting = { value: 'delete' };
  const [focusedShape, setFocusedShape] = useState<string | null>(null);
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);

  useEffect(() => {
    setFocusedShape(selectedElement);
  }, [selectedElement]);

  const handleMouseEnter = (shapeId: string) => {
    setHoveredShape(shapeId);
  };

  const handleMouseLeave = () => {
    setHoveredShape(null);
  };

  const memoizedShapes = useMemo(
    () => (
      <section className='flex flex-col bg-primary-graphite text-primary-grey-300 min-w-[188px] sticky ml-[8px] my-2 max-sm:hidden select-none overflow-y-auto rounded-lg'>
        <h3 className='px-8 text-xs font-medium uppercase text-[#9E9E9E] pt-3'>
          Layers
        </h3>
        <div className='flex flex-col'>
          {allShapes?.map((shape: any) => {
            const info = getShapeInfo(shape[1]?.type);
            const shapeId = shape[1]?.objectId;

            const handleClick = () => {
              const objectId = shapeId;
              const fabricObject = getObjectById({
                fabricRef: fabricRef.current,
                objectId,
              });

              if (fabricObject) {
                fabricRef.current.setActiveObject(fabricObject);
                fabricRef.current.requestRenderAll();
              }
              setFocusedShape(shapeId);
            };

            return (
              <div
                key={shapeId}
                className={`normal-border group my-1 flex items-center justify-between gap-2 px-2 border hover:cursor-pointer ${
                  focusedShape === shapeId ? 'focused' : ''
                }`}
                onClick={handleClick}
                onBlur={() => setFocusedShape(null)}
                onMouseEnter={() => handleMouseEnter(shapeId)}
                onMouseLeave={handleMouseLeave}
                tabIndex={0}
              >
                <div className='flex flex-row items-center justify-center'>
                  <Image
                    src={info?.icon}
                    alt='Layer'
                    width={16}
                    height={16}
                    className='pr-2'
                  />
                  <h3 className='text-xs font-normal capitalize pt-0.5 text-white'>
                    {info.name}
                  </h3>
                </div>
                <Image
                  src={cross}
                  alt='cross'
                  width={12}
                  height={12}
                  className={`cross-icon ${
                    focusedShape === shapeId && hoveredShape === shapeId
                      ? 'hovered'
                      : 'default'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (focusedShape === shapeId) {
                      handleActiveElement(deleting);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>
    ),
    [allShapes?.length, focusedShape, hoveredShape, selectedElement]
  );

  return memoizedShapes;
};

export default LeftSidebar;
