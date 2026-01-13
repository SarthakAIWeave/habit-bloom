import React, { createContext, useContext, ReactNode } from 'react';
import { useGamification as useGamificationHook } from '@/hooks/useGamification';

const GamificationContext = createContext<ReturnType<typeof useGamificationHook> | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const gamification = useGamificationHook();
  
  return (
    <GamificationContext.Provider value={gamification}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};
