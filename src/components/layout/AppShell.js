'use client';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Sidebar, { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppContext } from '@/components/ThemeRegistry';

export default function AppShell({ children }) {
  const { sidebarOpen } = useAppContext();
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          p: 3,
          pt: 0,
        }}
      >
        <Toolbar />
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
