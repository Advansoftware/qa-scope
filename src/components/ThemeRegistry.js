'use client';

import { useState, useMemo, createContext, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';

const AppContext = createContext({});

export function useAppContext() {
  return useContext(AppContext);
}

export default function ThemeRegistry({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const contextValue = useMemo(() => ({
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
  }), [sidebarOpen]);

  return (
    <AppContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppContext.Provider>
  );
}
