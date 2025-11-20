import { createTheme } from "@mui/material/styles";

const theme = createTheme({
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
          ...(ownerState.variant === 'outlined' && {
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.action.selected,
              borderColor: theme.palette.primary.dark,
            },
          }),
          ...(ownerState.variant === 'text' && {
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.action.selected,
            },
          }),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "16px",
          backgroundColor: "#F8F9FA",
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: "#F1F3F4",
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "12px",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 1px 3px 0 rgba(50, 62, 72, 0.1), 0 1px 2px 0 rgba(50, 62, 72, 0.06)",
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontFamily: theme.typography.fontFamily,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D1D5DB',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9CA3AF',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
          },
          '&.Mui-disabled': {
            backgroundColor: '#F9FAFB',
            color: theme.palette.text.disabled,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E5E7EB',
            },
          },
        }),
        input: ({ theme }) => ({
          '&::placeholder': {
            color: theme.palette.text.disabled,
            opacity: 1,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily,
          fontWeight: 500,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
          '&.Mui-error': {
            color: theme.palette.error.main,
          },
          '&.Mui-disabled': {
            color: theme.palette.text.disabled,
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.disabled,
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
          marginTop: '4px',
          '&.Mui-error': {
            color: theme.palette.error.main,
          },
          '&.Mui-disabled': {
            color: theme.palette.text.disabled,
          },
        }),
      },
    },
  },
});

export default theme;

