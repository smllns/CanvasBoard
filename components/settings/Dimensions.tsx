import { Label } from '../ui/label';
import { Input } from '../ui/input';
import '../styles.css';
import { dimensionsOptions } from '@/constants';

type Props = {
  width: string;
  height: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const Dimensions = ({
  width,
  height,
  isEditingRef,
  handleInputChange,
}: Props) => {
  const handleInputFocus = (property: string) => {
    isEditingRef.current = true;
  };

  const handleInputBlur = () => {
    isEditingRef.current = false;
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.classList.add('hovered');
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.classList.remove('hovered');
  };

  const handleFocus = (e) => {
    e.currentTarget.classList.add('focused');
  };

  const handleBlur = (e) => {
    e.currentTarget.classList.remove('focused');
  };
  return (
    <section className='flex flex-col '>
      <h3 className=' px-5 text-xs font-medium uppercase text-[#9E9E9E]'>
        Sizes
      </h3>
      <div className='flex flex-row gap-1 px-1 py-2 '>
        {dimensionsOptions.map((item) => (
          <div
            key={item.label}
            className='flex flex-1 items-center gap-3 rounded-sm input-border px-3 h-8'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <Label
              htmlFor={item.property}
              className='text-xs font-medium uppercase text-[#9E9E9E]'
            >
              {item.label}
            </Label>
            <Input
              type='number'
              id={item.property}
              placeholder='100'
              value={item.property === 'width' ? width : height}
              className='p-0 bg-transparent border-none text-gray-300 input-custom'
              min={10}
              onChange={(e) => handleInputChange(item.property, e.target.value)}
              onFocus={() => handleInputFocus(item.property)}
              onBlur={handleInputBlur}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dimensions;
