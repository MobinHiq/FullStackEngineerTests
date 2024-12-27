import { createTheme } from "@mui/material";

// Separate the rest of the styles
const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    background: linear-gradient(135deg, #1B2735 0%, #090A0F 100%);
  }

  .config-title {
    font-family: 'Lilita One', cursive !important;
    font-size: 3.5rem !important;
    color: #FFD700 !important;
    -webkit-text-stroke: 2px #000;
    text-stroke: 2px #000;
    text-shadow: 
      4px 4px 0px #000,
      -4px 4px 0px #000,
      -4px -4px 0px #000,
      4px -4px 0px #000,
      0px 6px 0px #000;
    letter-spacing: 2px !important;
  }

  .cartoon-card {
    border: 4px solid #000 !important;
    box-shadow: 8px 8px 0 #000 !important;
    background: rgba(0, 0, 0, 0.8) !important;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease !important;
  }

  .cartoon-card:hover {
    transform: translateY(-5px) !important;
    box-shadow: 12px 12px 0 #000 !important;
  }

  .cartoon-button {
    font-family: 'Fredoka One', cursive !important;
    border: 3px solid #000 !important;
    box-shadow: 4px 4px 0 #000 !important;
    transition: all 0.2s ease !important;
  }

  .cartoon-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 6px 6px 0 #000 !important;
  }

  .cartoon-button:active {
    transform: translateY(2px) !important;
    box-shadow: 2px 2px 0 #000 !important;
  }

  .cartoon-input {
    font-family: 'VT323', monospace !important;
    border: 3px solid #000 !important;
    box-shadow: 4px 4px 0 #000 !important;
    background: rgba(0, 0, 0, 0.3) !important;
  }
`;

// Create MUI theme
const cartoonTheme = createTheme({
  typography: {
    fontFamily: "'Fredoka One', cursive",
    h1: {
      fontFamily: "'Lilita One', cursive",
      letterSpacing: 2,
    },
    h2: {
      fontFamily: "'Lilita One', cursive",
      letterSpacing: 1.5,
    },
    h3: {
      fontFamily: "'Lilita One', cursive",
      letterSpacing: 1.2,
    },
    h4: {
      fontFamily: "'Lilita One', cursive",
      letterSpacing: 1,
    },
    button: {
      fontFamily: "'Fredoka One', cursive",
      letterSpacing: 1,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: globalStyles,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "10px 20px",
          fontSize: "1.1rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: 24,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#478bd6",
      light: "#64b5f6",
      dark: "#2c5282",
    },
    secondary: {
      main: "#FFD700",
      light: "#FFE44D",
      dark: "#B39700",
    },
    background: {
      default: "#1B2735",
      paper: "rgba(0, 0, 0, 0.8)",
    },
  },
});

export default cartoonTheme;
