import { Label } from '../ui/label';
import '../styles.css'; // Import your CSS file

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: Props) => (
  <div className='flex flex-col gap-3 p-3'>
    <h3 className=' px-3 text-xs font-medium uppercase text-[#9E9E9E]'>
      {placeholder}
    </h3>
    <div
      className='flex items-center gap-2 border input-border'
      onClick={() => inputRef.current.click()}
    >
      <input
        type='color'
        className='color-input'
        value={attribute}
        ref={inputRef}
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
      />
      <Label className='flex-1 text-s font-normal capitalize pt-0.5 text-white cursor-pointer'>
        {attribute}
      </Label>
    </div>
  </div>
);

export default Color;
