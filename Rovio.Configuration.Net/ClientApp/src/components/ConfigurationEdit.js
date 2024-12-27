import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckIcon as SaveIcon,
  XMarkIcon as CloseIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useConfiguration } from "../contexts/ConfigurationContext";
import { SettingsStyleEditor } from "./SettingsStyleEditor";
import {
  Box,
  Container,
  CircularProgress,
  Paper,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import anime from "animejs";
import "../Styles/styles.css";
import { ErrorPage } from "./ErrorPage";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

export const ConfigurationEdit = () => {
  const [config, setConfig] = useState(null);
  const [configName, setConfigName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorPage, setShowErrorPage] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { refreshConfigurations } = useConfiguration();

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const backButtonRef = useRef(null);
  const sectionRefs = useRef([]);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const fetchConfiguration = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(`/api/configuration/${id}`);
      if (!response.ok) {
        if (response.status >= 500) {
          setShowErrorPage(true);
          return;
        }
        throw new Error("Configuration not found");
      }
      const data = await response.json();
      setConfig(data);
      setConfigName(data.name);

      // First make the container visible
      anime({
        targets: ".editor-container",
        opacity: [0, 1],
        duration: 600,
        easing: "easeOutQuad",
      });

      // Then animate the sections
      anime({
        targets: [".config-section", ".config-field"],
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 800,
        easing: "easeOutQuad",
      });
    } catch (error) {
      if (error.message === "Failed to fetch") {
        setShowErrorPage(true);
      } else {
        toast.error(error.message);
        anime({
          targets: containerRef.current,
          translateX: [0, -10, 10, -10, 10, 0],
          duration: 400,
          easing: "easeInOutQuad",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      // Main entrance animation timeline with slower timing
      anime
        .timeline({
          easing: "easeOutExpo",
        })
        .add({
          targets: ".editor-container",
          opacity: [0, 1],
          translateY: [60, 0],
          duration: 2000,
          easing: "easeOutQuart",
        })
        .add(
          {
            targets: backButtonRef.current,
            opacity: [0, 1],
            translateX: [-40, 0],
            duration: 1500,
          },
          "-=1600"
        )
        .add(
          {
            targets: ".config-title",
            opacity: [0, 1],
            translateY: [-40, 0],
            duration: 1500,
          },
          "-=1400"
        )
        .add(
          {
            targets: ".config-section",
            opacity: [0, 1],
            translateY: [40, 0],
            delay: anime.stagger(200),
            duration: 1500,
          },
          "-=1200"
        );
    }
  }, [loading]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  const handleConfigUpdate = async (updatedConfig, shouldNavigate = false) => {
    try {
      setIsSaving(true);
      const response = await fetchWithTimeout(`/api/configuration/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) {
        throw new Error("Failed to update configuration");
      }

      await refreshConfigurations();
      setConfig(updatedConfig);
      toast.success("Configuration updated successfully");

      if (shouldNavigate) {
        await anime({
          targets: [containerRef.current, backButtonRef.current],
          translateX: [0, -20],
          opacity: [1, 0],
          duration: 400,
          easing: "easeInQuad",
        }).finished;

        navigate("/configurations");
      }
    } catch (error) {
      toast.error(error.message);
      anime({
        targets: editorRef.current,
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 400,
        easing: "easeInOutQuad",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    await handleConfigUpdate(config, true);
  };

  const handleCancel = async () => {
    await anime({
      targets: [containerRef.current, backButtonRef.current],
      translateX: [0, -20],
      opacity: [1, 0],
      duration: 400,
      easing: "easeInQuad",
    }).finished;

    navigate("/configurations");
  };

  const handleNameUpdate = async () => {
    try {
      const response = await fetchWithTimeout(`/api/configuration/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...config,
          name: configName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update configuration name");
      }

      setIsEditingName(false);
      toast.success("Configuration name updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add hover animation for sections
  const handleSectionHover = (index, isEntering) => {
    anime({
      targets: sectionRefs.current[index],
      scale: isEntering ? 1.02 : 1,
      boxShadow: isEntering
        ? "0 8px 32px rgba(71, 139, 214, 0.2)"
        : "0 8px 32px rgba(0, 0, 0, 0.2)",
      duration: 300,
      easing: "easeOutQuad",
    });
  };

  // Add success animation
  const handleSuccessAnimation = () => {
    // Create success particles
    const particles = Array.from({ length: 20 }, () => {
      const particle = document.createElement("div");
      particle.style.position = "fixed";
      particle.style.width = "8px";
      particle.style.height = "8px";
      particle.style.backgroundColor = "#478bd6";
      particle.style.borderRadius = "50%";
      particle.style.zIndex = "1000";
      document.body.appendChild(particle);
      return particle;
    });

    // Animate success particles
    anime({
      targets: particles,
      translateX: () => anime.random(-200, 200),
      translateY: () => anime.random(-200, 200),
      scale: [1, 0],
      opacity: [1, 0],
      duration: 1000,
      easing: "easeOutExpo",
      complete: () => particles.forEach((p) => p.remove()),
    });
  };

  // Add scroll button visibility handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollButton(scrollY > 300);

      // Quick visibility animation
      anime({
        targets: ".scroll-top-button",
        opacity: scrollY > 300 ? [0, 1] : [1, 0],
        translateY: scrollY > 300 ? [20, 0] : [0, 20],
        duration: 200, // Faster fade
        easing: "easeOutQuad",
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add smooth scroll handler
  const handleScrollToTop = () => {
    // Quick button press animation
    anime({
      targets: ".scroll-top-button",
      scale: [1, 0.9, 1],
      duration: 150, // Even faster button press
      easing: "easeOutQuad",
    });

    // Very quick scroll animation
    anime({
      targets: [document.documentElement, document.body],
      scrollTop: 0,
      duration: 300, // Much faster scroll
      easing: "easeOutCubic", // Changed easing for quick start, smooth end
    });
  };

  if (showErrorPage) {
    return <ErrorPage message="Unable to connect to the server" />;
  }

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: `
            radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%),
            linear-gradient(
              to bottom,
              rgba(255, 0, 255, 0.2) 0%,
              rgba(37, 37, 179, 0.2) 50%,
              rgba(0, 0, 0, 0.5) 100%
            )
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        pb: 4,
      }}
    >
      <Container ref={containerRef} maxWidth="lg">
        <button
          ref={backButtonRef}
          onClick={handleCancel}
          className="back-button inline-flex items-center"
          onMouseEnter={(e) => {
            anime({
              targets: e.currentTarget,
              translateX: -5,
              duration: 300,
              easing: "spring(1, 80, 10, 0)",
            });
          }}
          onMouseLeave={(e) => {
            anime({
              targets: e.currentTarget,
              translateX: 0,
              duration: 300,
              easing: "spring(1, 80, 10, 0)",
            });
          }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Configurations
        </button>

        <Paper
          className="editor-container cartoon-border"
          sx={{
            p: 4,
            bgcolor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            color: "white",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background:
                "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96c93d)",
              borderRadius: "18px",
              zIndex: -1,
              animation: "borderRotate 4s linear infinite",
            },
            "& .MuiInputBase-input": {
              color: "white",
              "&.Mui-disabled": {
                color: "rgba(255, 255, 255, 0.7)",
                WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-disabled": {
                color: "rgba(255, 255, 255, 0.5)",
              },
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-disabled": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.15)",
                },
              },
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#478bd6",
              },
            },
            "& .MuiSwitch-root": {
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              "& .MuiSwitch-thumb": {
                backgroundColor: "white",
              },
            },
            "& .MuiTypography-root": {
              color: "rgba(255, 255, 255, 0.9)",
            },
            "& .MuiButton-root": {
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            },
            "& .config-section": {
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 1,
              padding: 2,
              marginBottom: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: -100,
                width: 50,
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                transform: "skewX(-15deg)",
                transition: "all 0.5s",
                animation: "shimmer 3s infinite",
              },
            },
            "& .config-field": {
              padding: "8px 16px",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              },
            },
            "@keyframes shimmer": {
              "0%": { left: -100 },
              "100%": { left: "200%" },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              position: "relative",
            }}
          >
            {isEditingName ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TextField
                  className="input-field"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  autoFocus
                  size="small"
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "white",
                      fontSize: "1.5rem",
                      textAlign: "center",
                      fontFamily: "'Roboto Condensed', sans-serif",
                      fontWeight: 600,
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                      },
                      "&.Mui-focused fieldset": { borderColor: "#478bd6" },
                    },
                  }}
                  aria-label="Game Title"
                />
                <IconButton
                  onClick={handleNameUpdate}
                  sx={{
                    color: "#478bd6",
                    "&:hover": { backgroundColor: "rgba(71, 139, 214, 0.1)" },
                  }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setIsEditingName(false);
                    setConfigName(config.name);
                  }}
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <Typography
                className="config-title"
                variant="h4"
                onClick={() => setIsEditingName(true)}
                sx={{
                  color: "white",
                  cursor: "pointer",
                  fontFamily: "'Lilita One', cursive",
                  fontWeight: 400,
                  textAlign: "center",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                  mb: 2,
                  fontSize: "2.5rem",
                  letterSpacing: "0.5px",
                }}
              >
                {configName}
              </Typography>
            )}
          </Box>

          <div ref={editorRef}>
            {config ? (
              <SettingsStyleEditor
                config={config}
                onUpdate={handleConfigUpdate}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
                sectionRefs={sectionRefs}
                onSectionHover={handleSectionHover}
                onSuccess={handleSuccessAnimation}
              />
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </div>
        </Paper>
      </Container>

      {/* Add scroll to top button */}
      <Box
        className="scroll-top-button"
        onClick={handleScrollToTop}
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          zIndex: 10,
          opacity: 0,
          visibility: showScrollButton ? "visible" : "hidden",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: "rgba(71, 139, 214, 0.9)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(71, 139, 214, 1)",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        }}
      >
        <KeyboardArrowUp
          sx={{
            color: "white",
            fontSize: 30,
            animation: "float 2s ease-in-out infinite",
          }}
        />
      </Box>

      {/* Add keyframes for floating animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}
      </style>

      {/* Add this to your styles */}
      <style>
        {`
          @keyframes borderRotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .comic-button {
            transition: all 0.3s ease;
            &:hover {
              transform: scale(1.1) rotate(2deg);
            }
            &:active {
              transform: scale(0.95) rotate(-2deg);
            }
          }
        `}
      </style>

      <style>
        {`
          .MuiPaper-root {
            border: 4px solid #000 !important;
            box-shadow: 8px 8px 0 #000 !important;
          }

          .MuiSlider-thumb {
            border: 3px solid #000 !important;
            box-shadow: 3px 3px 0 #000 !important;
          }

          .MuiSlider-track {
            border: 2px solid #000 !important;
          }

          .MuiSwitch-thumb {
            border: 2px solid #000 !important;
            box-shadow: 2px 2px 0 #000 !important;
          }
        `}
      </style>
    </Box>
  );
};
