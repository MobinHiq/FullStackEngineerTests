import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Stack,
  Alert,
  Switch,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { DEFAULT_GAME_SETTINGS } from "../utils/defaultGameSettings";
import anime from "animejs";
import { KEYBOARD_KEYS } from "../utils/keyboardKeys";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { ErrorPage } from "./ErrorPage";

export function ConfigurationCreate() {
  const [name, setName] = useState("");
  const [configValues, setConfigValues] = useState(DEFAULT_GAME_SETTINGS);
  const [error, setError] = useState("");
  const [showErrorPage, setShowErrorPage] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Title entrance animation
    anime({
      targets: titleRef.current,
      translateY: [-30, 0],
      opacity: [0, 1],
      duration: 1200,
      easing: "easeOutExpo",
    });

    // Form container entrance
    anime({
      targets: formRef.current,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 800,
      easing: "easeOutQuad",
    });

    // Sections and fields staggered entrance
    anime({
      targets: [".config-section", ".config-field"],
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(50),
      duration: 800,
      easing: "easeOutQuad",
      begin: () => {
        // Make all elements visible before animation
        document
          .querySelectorAll(".config-section, .config-field")
          .forEach((el) => {
            el.style.visibility = "visible";
          });
      },
    });
  }, []);

  const handleValueChange = (path, value) => {
    const newValues = { ...configValues };
    const parts = path.split(".");
    let current = newValues;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;

    setConfigValues(newValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsCheckingServer(true);

    // Animate button press
    anime({
      targets: e.currentTarget.querySelector('button[type="submit"]'),
      scale: [1, 0.95, 1],
      duration: 150,
      easing: "easeInOutQuad",
    });

    try {
      // Check server status first
      try {
        const healthCheck = await fetchWithTimeout("/api/configuration/test");
        if (!healthCheck.ok) {
          setShowErrorPage(true);
          return;
        }
      } catch (error) {
        setShowErrorPage(true);
        return;
      }

      const response = await fetchWithTimeout("/api/configuration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          jsonConfig: JSON.stringify(configValues),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create configuration");
      }

      toast.success("Configuration created successfully!");
      navigate("/configurations");
    } catch (error) {
      if (error.message === "Request timed out") {
        setShowErrorPage(true);
        return;
      }
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsCheckingServer(false);
    }
  };

  const renderConfigurationEditor = (config, path = "") => {
    return Object.entries(config).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        if (key === "screen") {
          return (
            <Box
              key={currentPath}
              className="config-section"
              sx={{
                mb: 3,
                visibility: "hidden",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                padding: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "& .MuiTypography-root": {
                  visibility: "visible",
                  opacity: 1,
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#FFD700",
                  mb: 2,
                  textTransform: "capitalize",
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {key}
              </Typography>
              <Box
                sx={{
                  pl: 3,
                  borderLeft: "2px solid rgba(71, 139, 214, 0.5)",
                  py: 1,
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                      Fullscreen:
                    </Typography>
                    <Switch
                      checked={value.fullscreen}
                      onChange={(e) => {
                        const isFullscreen = e.target.checked;
                        if (isFullscreen) {
                          // Get actual screen dimensions
                          const screenWidth = window.screen.width;
                          const screenHeight = window.screen.height;

                          handleValueChange(`${currentPath}`, {
                            ...value,
                            fullscreen: true,
                            width: screenWidth,
                            height: screenHeight,
                            // Store previous dimensions
                            windowedDimensions: {
                              width: value.width,
                              height: value.height,
                            },
                          });
                        } else {
                          // Restore previous dimensions
                          const previousDimensions =
                            value.windowedDimensions || {
                              width: 1024,
                              height: 768,
                            };

                          handleValueChange(`${currentPath}`, {
                            ...value,
                            fullscreen: false,
                            width: previousDimensions.width,
                            height: previousDimensions.height,
                            windowedDimensions: undefined,
                          });
                        }
                      }}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#478bd6",
                        },
                      }}
                    />
                  </Box>

                  <TextField
                    type="number"
                    value={value.width}
                    onChange={(e) =>
                      handleValueChange(
                        `${currentPath}.width`,
                        Number(e.target.value)
                      )
                    }
                    label="Width"
                    disabled={value.fullscreen}
                    sx={textFieldStyle}
                  />

                  <TextField
                    type="number"
                    value={value.height}
                    onChange={(e) =>
                      handleValueChange(
                        `${currentPath}.height`,
                        Number(e.target.value)
                      )
                    }
                    label="Height"
                    disabled={value.fullscreen}
                    sx={textFieldStyle}
                  />
                </Stack>
              </Box>
            </Box>
          );
        }

        if (key === "controls") {
          return (
            <Box
              key={currentPath}
              className="config-section"
              sx={{
                mb: 3,
                visibility: "hidden",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                padding: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "& .MuiTypography-root": {
                  visibility: "visible",
                  opacity: 1,
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#FFD700",
                  mb: 2,
                  textTransform: "capitalize",
                  fontFamily: "'Roboto Condensed', sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {key}
              </Typography>
              <Box
                sx={{
                  pl: 3,
                  borderLeft: "2px solid rgba(71, 139, 214, 0.5)",
                  py: 1,
                }}
              >
                {Object.entries(value).map(([controlKey, controlValue]) => (
                  <Box
                    key={`${currentPath}.${controlKey}`}
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.9)",
                        width: "200px",
                        textTransform: "capitalize",
                      }}
                    >
                      {controlKey}:
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        value={controlValue}
                        onChange={(e) =>
                          handleValueChange(
                            `${currentPath}.${controlKey}`,
                            e.target.value
                          )
                        }
                        sx={{
                          color: "white",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(71, 139, 214, 0.4)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(71, 139, 214, 0.6)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#478bd6",
                          },
                          "& .MuiSelect-icon": {
                            color: "white",
                          },
                        }}
                      >
                        {KEYBOARD_KEYS.map((key) => (
                          <MenuItem key={key.value} value={key.value}>
                            {key.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        }

        return (
          <Box
            key={currentPath}
            className="config-section"
            sx={{
              mb: 3,
              visibility: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              padding: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "& .MuiTypography-root": {
                visibility: "visible",
                opacity: 1,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#FFD700",
                mb: 2,
                textTransform: "capitalize",
                fontFamily: "'Roboto Condensed', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              {key}
            </Typography>
            <Box
              sx={{
                pl: 3,
                borderLeft: "2px solid rgba(71, 139, 214, 0.5)",
                py: 1,
              }}
            >
              {renderConfigurationEditor(value, currentPath)}
            </Box>
          </Box>
        );
      }

      return (
        <Box
          key={currentPath}
          className="config-field"
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            visibility: "hidden",
            p: 1.5,
            borderRadius: 1,
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
            "& .MuiTypography-root, & .MuiTextField-root": {
              visibility: "visible",
              opacity: 1,
            },
          }}
        >
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              width: "200px",
              textTransform: "capitalize",
              fontFamily: "'Roboto Condensed', sans-serif",
              fontWeight: 500,
            }}
          >
            {key}:
          </Typography>
          {typeof value === "boolean" ? (
            <Switch
              checked={value}
              onChange={(e) => handleValueChange(currentPath, e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#478bd6",
                },
              }}
            />
          ) : (
            <TextField
              type={typeof value === "number" ? "number" : "text"}
              value={value}
              onChange={(e) =>
                handleValueChange(
                  currentPath,
                  typeof value === "number"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              size="small"
              sx={textFieldStyle}
            />
          )}
        </Box>
      );
    });
  };

  if (showErrorPage) {
    return <ErrorPage message="Unable to connect to the server" />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
          url('/game-background.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Toaster position="top-right" />

        <Button
          onClick={() => {
            // Back button animation
            anime({
              targets: ".back-button",
              translateX: [0, -5, 0],
              duration: 300,
              easing: "easeOutQuad",
            });
            navigate("/configurations");
          }}
          className="back-button"
          startIcon={<ArrowLeftIcon />}
          sx={{
            color: "white",
            mb: 4,
            visibility: "visible",
            opacity: 1,
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
        >
          Back to Configurations
        </Button>

        <Paper
          ref={formRef}
          sx={{
            p: 4,
            bgcolor: "rgba(13, 17, 23, 0.85)",
            backdropFilter: "blur(12px)",
            color: "white",
            border: "1px solid rgba(71, 139, 214, 0.4)",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            visibility: "hidden",
            "& .MuiTypography-root, & .MuiTextField-root, & .MuiButton-root": {
              visibility: "visible",
              opacity: 1,
            },
          }}
        >
          <Typography
            ref={titleRef}
            variant="h4"
            sx={{
              mb: 4,
              fontFamily: "'Roboto Condensed', sans-serif",
              fontWeight: 600,
              textAlign: "center",
              color: "#FFD700",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              letterSpacing: "0.05em",
              visibility: "hidden",
            }}
          >
            Create Configuration
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Configuration Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              sx={{
                mb: 4,
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": { borderColor: "#478bd6" },
                },
              }}
            />

            <Box
              sx={{
                p: 3,
                bgcolor: "rgba(0, 0, 0, 0.3)",
                borderRadius: 1,
                border: "1px solid rgba(71, 139, 214, 0.2)",
                mb: 3,
              }}
            >
              {renderConfigurationEditor(configValues)}
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: "rgba(211, 47, 47, 0.1)",
                  color: "#ff4444",
                  mb: 3,
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                px: 3,
              }}
            >
              {isCheckingServer && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Checking server status...
                  </Typography>
                </Box>
              )}
              <Button
                type="submit"
                variant="outlined"
                sx={buttonStyle}
                disabled={!name || isCheckingServer}
              >
                Create Configuration
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/configurations")}
                sx={buttonStyle}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

const textFieldStyle = {
  "& .MuiInputBase-input": {
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 1,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(71, 139, 214, 0.4)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(71, 139, 214, 0.6)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#478bd6",
    },
  },
};

const buttonStyle = {
  color: "white",
  borderColor: "rgba(71, 139, 214, 0.4)",
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(71, 139, 214, 0.1)",
  "&:hover": {
    borderColor: "rgba(71, 139, 214, 0.6)",
    backgroundColor: "rgba(71, 139, 214, 0.2)",
  },
};
