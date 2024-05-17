import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { useStorage } from '@/liveblocks.config';

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

  const handleChange = (e: any) => {
    const newColor = e.target.value;
    setColor(newColor);
    handleBackgroundColorChange(newColor);
  };
  return (
    <div className='flex flex-col gap-3 border-b border-primary-grey-200 p-5'>
      <h3 className='text-[10px] uppercase'>Background Color</h3>
      <div className='flex items-center gap-2 border border-primary-grey-200'>
        <input type='color' value={color} onChange={handleChange} />
        <Label className='flex-1'>{color}</Label>
      </div>
    </div>
  );
};

export default CanvasColor;
