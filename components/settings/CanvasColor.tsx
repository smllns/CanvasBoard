import React, { useEffect, useRef, useState } from 'react';
import { Label } from '../ui/label';
import { useStorage } from '@/liveblocks.config';
import '../styles.css';

type Props = {
  handleBackgroundColorChange: (obj: any) => void;
};

const CanvasColor = ({ handleBackgroundColorChange }: Props) => {
  const [color, setColor] = useState('#1f2731');
  const backCol = useStorage((root) => root.bgColor);

  useEffect(() => {
    if (!backCol) return;
    if (backCol !== color) {
      setColor(backCol);
    }
  }, [backCol, color]);

  const colorInputRef = useRef(null);

  const handleLabelClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleChange = (e: any) => {
    const newColor = e.target.value;
    setColor(newColor);
    handleBackgroundColorChange(newColor);
  };
  return (
    <div className='flex flex-col gap-3 p-3'>
      <h3 className=' px-3 text-xs font-medium uppercase text-[#9E9E9E]'>
        Background Color
      </h3>
      <div className='flex items-center gap-2 border input-border'>
        <input
          type='color'
          className='color-input'
          value={color}
          onChange={handleChange}
          ref={colorInputRef}
        />
        <Label
          className='flex-1 text-s font-normal capitalize pt-0.5 text-white cursor-pointer'
          onClick={handleLabelClick}
        >
          {color}
        </Label>
      </div>
    </div>
  );
};

export default CanvasColor;
