"use client";

import { useEffect } from 'react';

export const useScrollLock = (lock: boolean) => {
  useEffect(() => {
    if (lock) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [lock]);
};
