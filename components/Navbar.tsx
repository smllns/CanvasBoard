'use client';

import Image from 'next/image';
import { memo } from 'react';
import { headNavElements } from '@/constants';
import { ActiveElement, NavbarProps } from '@/types/type';
import { Button } from './ui/button';
import ShapesMenu from './ShapesMenu';
import ActiveUsers from './users/ActiveUsers';
import { NewThread } from './comments/NewThread';

const Navbar = ({
  activeElement,
  imageInputRef,
  handleImageUpload,
  handleActiveElement,
}: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));

  return (
    <nav className='flex select-none items-center justify-between gap-4 bg-primary-graphite px-9  text-white h-[48px] '>
      <div className='flex items-center gap-[77px] h-[48px]'>
        <Image
          src='/assets/logo.svg'
          alt='CanvasBoard Logo'
          width={131.79}
          height={29}
        />
        <ul className='flex flex-row h-full items-center overflow-hidden px-0 m-0 max-sm:hidden'>
          {headNavElements.map((item: ActiveElement | any) => (
            <li
              key={item.name}
              onClick={() => {
                if (Array.isArray(item.value)) return;
                handleActiveElement(item);
              }}
              className={`h-full group
               px-2.5 
               flex justify-center items-center 
              ${
                isActive(item.value)
                  ? 'bg-primary-gradient'
                  : 'hover:bg-primary-grey-200'
              }
              `}
            >
              {/* If value is an array it's a dropdown */}
              {Array.isArray(item.value) ? (
                <ShapesMenu
                  item={item}
                  activeElement={activeElement}
                  handleActiveElement={handleActiveElement}
                />
              ) : item?.value === 'comments' ? (
                <NewThread>
                  <Button className='relative w-5 h-5 object-contain bg-transparent border-none hover:bg-transparent'>
                    <Image
                      src={item.icon}
                      alt={item.name}
                      className={isActive(item.value) ? 'invert' : ''}
                      height={18}
                      width={18}
                    />
                  </Button>
                </NewThread>
              ) : (
                <Button className='relative w-5 h-5 object-contain bg-transparent border-none hover:bg-transparent'>
                  <Image
                    src={item.icon}
                    alt={item.name}
                    className={isActive(item.value) ? 'invert' : ''}
                    height={18}
                    width={18}
                  />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <input
        type='file'
        className='hidden'
        ref={imageInputRef}
        accept='image/*'
        onChange={handleImageUpload}
      />
      <ActiveUsers />
    </nav>
  );
};

export default memo(
  Navbar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
