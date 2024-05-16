'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import { getShapeInfo } from '@/lib/utils';
import { getObjectById } from '@/lib/canvas';
import { GoMoveToTop, GoMoveToBottom } from 'react-icons/go';
import { bringElement } from '@/lib/shapes';

const LeftSidebar = ({
  allShapes,
  fabricRef,
  syncShapeInStorage,
}: {
  allShapes: Array<any>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  syncShapeInStorage: (obj: any) => void;
}) => {
  const handleMoveToTop = () => {
    const direction = 'front';
    bringElement({
      canvas: fabricRef.current as fabric.Canvas,
      direction,
      syncShapeInStorage,
    });
  };
  const handleMoveToBottom = () => {
    const direction = 'back';
    bringElement({
      canvas: fabricRef.current as fabric.Canvas,
      direction,
      syncShapeInStorage,
    });
  };
  // memoize the result of this function so that it doesn't change on every render but only when there are new shapes
  const memoizedShapes = useMemo(
    () => (
      <section className='flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20'>
        <h3 className='border border-primary-grey-200 px-5 py-4 text-xs uppercase'>
          Layers
        </h3>
        <div className='flex flex-col'>
          {allShapes?.map((shape: any) => {
            const info = getShapeInfo(shape[1]?.type);
            const handleClick = () => {
              // Find the corresponding object on the canvas
              const objectId = shape[1]?.objectId;
              const fabricObject = getObjectById({
                fabricRef: fabricRef.current,
                objectId,
              });

              // Select the object on the canvas
              if (fabricObject) {
                fabricRef.current.setActiveObject(fabricObject);

                fabricRef.current.requestRenderAll();
              }
            };

            return (
              <div
                key={shape[1]?.objectId}
                className='group my-1 flex items-center justify-between gap-2 px-5 py-2.5 hover:cursor-pointer hover:bg-primary-green hover:text-primary-black'
                onClick={handleClick}
              >
                <div className='flex flex-row items-center'>
                  <Image
                    src={info?.icon}
                    alt='Layer'
                    width={16}
                    height={16}
                    className='group-hover:invert pr-3'
                  />
                  <h3 className='text-sm font-semibold capitalize'>
                    {info.name}
                  </h3>
                </div>
                <div className='flex flex-row items-center gap-3'>
                  <GoMoveToTop onClick={handleMoveToTop} />
                  <GoMoveToBottom onClick={handleMoveToBottom} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    ),
    [allShapes?.length]
  );

  return memoizedShapes;
};

export default LeftSidebar;
