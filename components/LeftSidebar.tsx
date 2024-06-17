'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import { getShapeInfo } from '@/lib/utils';
import { getObjectById } from '@/lib/canvas';
import './styles.css'; // Import your CSS file

const LeftSidebar = ({
  allShapes,
  fabricRef,
  syncShapeInStorage,
}: {
  allShapes: Array<any>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
  syncShapeInStorage: (obj: any) => void;
}) => {
  // memoize the result of this function so that it doesn't change on every render but only when there are new shapes

  const memoizedShapes = useMemo(
    () => (
      <section className='flex flex-col  bg-primary-graphite text-primary-grey-300 min-w-[188px] sticky ml-[8px] my-2 max-sm:hidden select-none overflow-y-auto  rounded-lg'>
        <h3 className=' px-8 text-xs font-medium uppercase text-[#9E9E9E] pt-3'>
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
                className=' normal-border group  my-1 flex items-center justify-between gap-2 px-2  border hover:cursor-pointer '
                onClick={handleClick}
              >
                <div className='flex flex-row items-center justify-center'>
                  <Image
                    src={info?.icon}
                    alt='Layer'
                    width={16}
                    height={16}
                    className='pr-2 '
                  />
                  <h3 className='text-xs font-normal capitalize pt-0.5 text-white'>
                    {info.name}
                  </h3>
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
