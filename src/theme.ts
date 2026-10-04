import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f6feb',
      light: '#62a0ff',
      dark: '#114da8',
    },
    secondary: {
      main: '#21b37b',
      light: '#4fd1a1',
    },
    background: {
      default: '#eef3f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2433',
      secondary: '#516074',
    },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 52,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 12px 32px rgba(28, 54, 98, 0.12)',
          border: '1px solid rgba(27, 60, 96, 0.08)',
        },
      },
    },
  },
});
