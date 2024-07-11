import {
  fontFamilyOptions,
  fontSizeOptions,
  fontWeightOptions,
} from '@/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SelectProps, TextProps } from '@/types/type';

const selectConfigs = [
  {
    property: 'fontFamily',
    placeholder: 'Choose a font',
    options: fontFamilyOptions,
  },
  {
    property: 'fontWeight',
    placeholder: 'Semibold',
    options: fontWeightOptions,
  },
  { property: 'fontSize', placeholder: '30', options: fontSizeOptions },
];

const Text = ({
  fontFamily,
  fontSize,
  fontWeight,
  handleInputChange,
}: TextProps) => (
  <div className='flex flex-col gap-3  px-5 py-3'>
    <h3 className='  text-xs font-medium uppercase text-[#9E9E9E]'>Text</h3>

    <div className='flex flex-col gap-3'>
      {RenderSelect({
        config: selectConfigs[0],
        fontSize,
        fontWeight,
        fontFamily,
        handleInputChange,
      })}
      <div className='flex gap-2'>
        {selectConfigs.slice(1).map((config) =>
          RenderSelect({
            config,
            fontSize,
            fontWeight,
            fontFamily,
            handleInputChange,
          })
        )}
      </div>
    </div>
  </div>
);

const RenderSelect = ({
  config,
  fontSize,
  fontWeight,
  fontFamily,
  handleInputChange,
}: SelectProps) => (
  <Select
    key={config.property}
    onValueChange={(value) => handleInputChange(config.property, value)}
    value={
      config.property === 'fontFamily'
        ? fontFamily
        : config.property === 'fontSize'
        ? fontSize
        : fontWeight
    }
  >
    <SelectTrigger className='no-ring w-full rounded-sm border'>
      <SelectValue
        placeholder={
          config.property === 'fontFamily'
            ? 'Choose a font'
            : config.property === 'fontSize'
            ? '30'
            : 'Semibold'
        }
      />
    </SelectTrigger>
    <SelectContent className=' bg-black text-white'>
      {config.options.map((option) => (
        <SelectItem
          key={option.value}
          value={option.value}
          className=' hover:bg-primary-verygrey hover:text-white'
        >
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default Text;
