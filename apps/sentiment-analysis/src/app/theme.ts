'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#EB0029",
      dark: "#E30028",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#323E48",
    },
    background: {
      default: "#EBF0F2",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#323E48",
      secondary: "#5B6670",
      disabled: "#7B868C",
    },
    error: {
      main: "#FF671B",
    },
    warning: {
      main: "#FFA400",
    },
    success: {
      main: "#6CC04A",
    },
    divider: "#D1D5DB",
    action: {
      hover: "#E30028",
      selected: "rgba(235, 0, 41, 0.08)",
      disabled: "#7B868C",
      disabledBackground: "#F3F4F6",
    },
  },
  typography: {
    fontFamily: '"Gotham","Spline Sans","Noto Sans",sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          ...(ownerState.variant === 'contained' && ownerState.color === 'primary' && {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }),
        }),
      },
    },
  },
});
