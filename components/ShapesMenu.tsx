'use client';

import Image from 'next/image';

import { ShapesMenuProps } from '@/types/type';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
}: ShapesMenuProps) => {
  const isDropdownElem = item.value.some(
    (elem) => elem?.value === activeElement.value
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className='no-ring relative'>
          <Button
            className='relative h-5 w-5 object-contain bg-transparent border-none hover:bg-transparent'
            onClick={() => handleActiveElement(item)}
          >
            <Image
              src={isDropdownElem ? activeElement.icon : item.icon}
              alt={item.name}
              className={isDropdownElem ? 'invert' : ''}
              className='relative pb-1'
              height={18}
              width={18}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='mt-4 ml-[100px] flex flex-col  border-none bg-black py-2 px-0 text-white'>
          {item.value.map((elem) => (
            <Button
              key={elem?.name}
              onClick={() => {
                handleActiveElement(elem);
              }}
              className={`flex h-[24px] justify-between gap-10 rounded-none px-4  focus:border-none bg-transparent border-none  ${
                activeElement.value === elem?.value
                  ? 'bg-primary-gradient'
                  : 'hover:bg-primary-verygrey'
              }`}
            >
              <div className='group flex items-center gap-2'>
                <Image
                  src={elem?.icon as string}
                  alt={elem?.name as string}
                  width={20}
                  height={20}
                  className={
                    activeElement.value === elem?.value ? 'invert' : ''
                  }
                />
                <p
                  className={`text-sm  ${
                    activeElement.value === elem?.value
                      ? 'text-primary-black'
                      : 'text-white'
                  }`}
                >
                  {elem?.name}
                </p>
              </div>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ShapesMenu;
