import React from 'react';
import { emojis } from '@/constants';

type Props = {
  setReaction: (reaction: string) => void;
};

export default function ReactionSelector({ setReaction }: Props) {
  return (
    <div
      className='absolute bottom-40 left-0 right-0 mx-auto w-fit  transform rounded-full bg-primary-graphite px-2'
      onPointerMove={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <ReactionButton key={emoji} reaction={emoji} onSelect={setReaction} />
      ))}
    </div>
  );
}

function ReactionButton({
  reaction,
  onSelect,
}: {
  reaction: string;
  onSelect: (reaction: string) => void;
}) {
  return (
    <button
      className='transform select-none p-2 text-xl hover:text-3xl focus:text-3xl transition-transform hover:scale-150 focus:scale-150 focus:outline-none bg-transparent border-none'
      onPointerDown={() => onSelect(reaction)}
    >
      {reaction}
    </button>
  );
}
