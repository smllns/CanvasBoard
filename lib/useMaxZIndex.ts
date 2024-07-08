import { useMemo } from 'react';

import { useThreads } from '@/liveblocks.config';

// Returns the highest z-index of all threads
export const useMaxZIndex = () => {
  const { threads } = useThreads();

  return useMemo(() => {
    let max = 0;
    for (const thread of threads) {
      // @ts-ignore
      if (thread.metadata.zIndex > max) {
        // @ts-ignore
        max = thread.metadata.zIndex;
      }
    }
    return max;
  }, [threads]);
};
