// src/hooks/useInfiniteScroll.ts
import { useEffect, useState } from 'react';

export const useInfiniteScroll = (callback: () => void) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        !== document.documentElement.offsetHeight || 
        isFetching
      )
        return;
      setIsFetching(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    callback(); // Gọi hàm tải thêm dữ liệu
  }, [isFetching, callback]);

  return [isFetching, setIsFetching] as const;
};