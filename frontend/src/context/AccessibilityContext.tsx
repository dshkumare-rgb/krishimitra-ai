import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  useEffect(() => {
    // Load cached values
    const cachedFont = localStorage.getItem('km-accessibility-font') as FontSize;
    const cachedContrast = localStorage.getItem('km-accessibility-contrast') === 'true';

    if (cachedFont) {
      setFontSizeState(cachedFont);
      applyFontSizeClass(cachedFont);
    }
    if (cachedContrast) {
      setHighContrastState(cachedContrast);
      applyContrastClass(cachedContrast);
    }
  }, []);

  const applyFontSizeClass = (size: FontSize) => {
    const root = document.documentElement;
    root.classList.remove('accessibility-font-large', 'accessibility-font-xlarge');
    if (size === 'large') {
      root.classList.add('accessibility-font-large');
    } else if (size === 'xlarge') {
      root.classList.add('accessibility-font-xlarge');
    }
  };

  const applyContrastClass = (active: boolean) => {
    const root = document.documentElement;
    if (active) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    applyFontSizeClass(size);
    localStorage.setItem('km-accessibility-font', size);
  };

  const setHighContrast = (active: boolean) => {
    setHighContrastState(active);
    applyContrastClass(active);
    localStorage.setItem('km-accessibility-contrast', String(active));
  };

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
