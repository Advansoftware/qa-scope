'use client';

import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#6C63FF',
    light: '#9D97FF',
    dark: '#4A42DB',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00D9A6',
    light: '#33E3BB',
    dark: '#00B388',
    contrastText: '#000000',
  },
  error: {
    main: '#FF5252',
    light: '#FF7B7B',
    dark: '#D43A3A',
  },
  warning: {
    main: '#FFB74D',
    light: '#FFCC80',
    dark: '#F9A825',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0288D1',
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#388E3C',
  },
  background: {
    default: '#0A0E1A',
    paper: '#111827',
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    disabled: '#475569',
  },
  divider: alpha('#94A3B8', 0.12),
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    ...palette,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${alpha('#94A3B8', 0.3)} transparent`,
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 4,
            background: alpha('#94A3B8', 0.3),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: `linear-gradient(135deg, ${alpha('#1E293B', 0.8)} 0%, ${alpha('#111827', 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#94A3B8', 0.08)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            border: `1px solid ${alpha('#6C63FF', 0.3)}`,
            boxShadow: `0 8px 32px ${alpha('#6C63FF', 0.15)}`,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: `0 4px 16px ${alpha('#6C63FF', 0.4)}`,
          },
        },
        outlined: {
          borderColor: alpha('#94A3B8', 0.2),
          '&:hover': {
            borderColor: '#6C63FF',
            background: alpha('#6C63FF', 0.08),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: alpha('#94A3B8', 0.15),
            },
            '&:hover fieldset': {
              borderColor: alpha('#6C63FF', 0.4),
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${alpha('#111827', 0.98)} 0%, ${alpha('#0A0E1A', 0.98)} 100%)`,
          borderRight: `1px solid ${alpha('#94A3B8', 0.08)}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '10px 16px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${alpha('#6C63FF', 0.15)} 0%, ${alpha('#6C63FF', 0.08)} 100%)`,
            color: '#6C63FF',
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha('#6C63FF', 0.2)} 0%, ${alpha('#6C63FF', 0.12)} 100%)`,
            },
          },
          '&:hover': {
            background: alpha('#94A3B8', 0.06),
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: alpha('#1E293B', 0.95),
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          border: `1px solid ${alpha('#94A3B8', 0.1)}`,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(135deg, ${alpha('#1E293B', 0.95)} 0%, ${alpha('#111827', 0.98)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#94A3B8', 0.1)}`,
        },
      },
    },
  },
});

export default theme;
