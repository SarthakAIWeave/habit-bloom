import React, { createContext, useContext, ReactNode } from 'react';
import { useGamification as useGamificationHook } from '@/hooks/useGamification';

type GamificationContextType = ReturnType<typeof useGamificationHook>;

const GamificationContext = createContext<GamificationContextType | null>(null);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  try {
    const gamification = useGamificationHook();
    
    return (
      <GamificationContext.Provider value={gamification}>
        {children}
      </GamificationContext.Provider>
    );
  } catch (error) {
    console.error('GamificationProvider error:', error);
    // Still render children even if gamification fails
    return <>{children}</>;
  }
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};
