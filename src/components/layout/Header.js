'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useAppContext } from '@/components/ThemeRegistry';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from '@/components/layout/Sidebar';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projetos',
  '/scopes': 'Escopos de Teste',
  '/kanban': 'Kanban Board',
  '/terminal': 'Terminal',
};

function getBreadcrumbs(pathname) {
  if (pathname === '/') return [{ label: 'Dashboard', href: '/' }];

  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label =
      PAGE_TITLES['/' + segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });
}

export default function Header() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const breadcrumbs = getBreadcrumbs(pathname);
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  const pageTitle =
    PAGE_TITLES[pathname] ||
    pathname
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      ?.replace(/\b\w/g, (l) => l.toUpperCase()) ||
    '';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: alpha('#0A0E1A', 0.8),
        backdropFilter: 'blur(20px)',
        borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={{
            '&:hover': {
              background: (t) => alpha(t.palette.primary.main, 0.08),
            },
          }}
        >
          {sidebarOpen ? (
            <MenuOpenRoundedIcon />
          ) : (
            <MenuRoundedIcon />
          )}
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ mb: 0.25 }}>
            {pageTitle}
          </Typography>
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ '& .MuiBreadcrumbs-li': { fontSize: '0.75rem' } }}
          >
            {breadcrumbs.map((crumb, idx) => (
              <Link
                key={crumb.href}
                component={NextLink}
                href={crumb.href}
                underline="hover"
                color={
                  idx === breadcrumbs.length - 1
                    ? 'primary.main'
                    : 'text.secondary'
                }
                sx={{ fontSize: '0.75rem' }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
