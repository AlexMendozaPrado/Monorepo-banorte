// Centralized Material-UI Theme for Business Rules Application
// Banorte brand colors and styling

'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#EB0029', // Banorte Red
      light: '#ff3d5a',
      dark: '#b30020',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5B6670', // Banorte Gray
      light: '#8a949e',
      dark: '#3d454d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#EBF0F2', // Banorte Light Gray
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    info: {
      main: '#2196f3',
      light: '#6ec6ff',
      dark: '#0069c0',
    },
    text: {
      primary: '#333333',
      secondary: '#5B6670',
    },
  },
  typography: {
    fontFamily: 'Gotham, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

// Export theme colors for use in sx props
export const banorteColors = {
  red: '#EB0029',
  gray: '#5B6670',
  lightGray: '#EBF0F2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

export default theme;
