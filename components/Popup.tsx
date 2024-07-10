import React from 'react';

type Props = {
  onClose: () => void;
};

const Popup = ({ onClose }: Props) => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-primary-graphite bg-opacity-50 z-50'>
      <div className='bg-primary-graphite p-6 rounded shadow-md max-w-sm'>
        <h2 className=' text-primary-grey-500 font-black text-lg mb-4'>
          WARNING
        </h2>
        <p className='mb-4 text-white font-normal text-base'>
          You can only view the board via mobile.
          <br />
          To edit, please visit us via Desktop.
        </p>
        <button
          className='bg-primary-aqua  text-black w-[171px] h-[41px] border-none font-bold py-2 px-4 rounded'
          onClick={onClose}
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default Popup;
