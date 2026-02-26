'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import { useAppContext } from '@/components/ThemeRegistry';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: DashboardRoundedIcon,
  },
  {
    label: 'Projetos',
    href: '/projects',
    icon: FolderRoundedIcon,
  },
  {
    label: 'Escopos',
    href: '/scopes',
    icon: PlaylistAddCheckRoundedIcon,
  },
  {
    label: 'Kanban',
    href: '/kanban',
    icon: ViewKanbanRoundedIcon,
  },
  {
    label: 'Terminal',
    href: '/terminal',
    icon: TerminalRoundedIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useAppContext();
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: sidebarOpen ? 2.5 : 0,
          py: 2.5,
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
        }}
      >
        <BugReportRoundedIcon
          sx={{
            fontSize: 32,
            color: 'primary.main',
            filter: 'drop-shadow(0 0 8px rgba(108, 99, 255, 0.4))',
          }}
        />
        {sidebarOpen && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF 0%, #00D9A6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            QA Scope
          </Typography>
        )}
      </Box>

      <Divider sx={{ mx: 1.5, opacity: 0.3 }} />

      <List sx={{ px: 0.5, pt: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          const button = (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={isActive}
              sx={{
                justifyContent: sidebarOpen ? 'initial' : 'center',
                minHeight: 48,
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  minWidth: sidebarOpen ? 40 : 'unset',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              )}
            </ListItemButton>
          );

          return sidebarOpen ? (
            button
          ) : (
            <Tooltip key={item.href} title={item.label} placement="right" arrow>
              {button}
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {sidebarOpen && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
          >
            QA Scope v1.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

export { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED };
