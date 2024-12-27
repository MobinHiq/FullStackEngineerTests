import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Switch,
  Typography,
  Paper,
  Slider,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  Grid,
  ListSubheader,
  FormControl,
  CircularProgress,
} from "@mui/material";
import anime from "animejs";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

// Update KEYBOARD_KEYS to be an array of objects
const KEYBOARD_KEYS = [
  // Letters
  ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((key) => ({
    value: key,
    label: key,
    group: "Letters",
  })),
  // Numbers
  ...Array.from("0123456789").map((key) => ({
    value: key,
    label: key,
    group: "Numbers",
  })),
  // Special Keys
  { value: "SPACE", label: "Spacebar", group: "Special" },
  { value: "SHIFT", label: "Shift", group: "Special" },
  { value: "CTRL", label: "Ctrl", group: "Special" },
  { value: "ALT", label: "Alt", group: "Special" },
  { value: "ENTER", label: "Enter", group: "Special" },
  { value: "ESC", label: "Esc", group: "Special" },
  { value: "TAB", label: "Tab", group: "Special" },
  // Arrow Keys
  { value: "UP", label: "↑ Up", group: "Arrows" },
  { value: "DOWN", label: "↓ Down", group: "Arrows" },
  { value: "LEFT", label: "← Left", group: "Arrows" },
  { value: "RIGHT", label: "→ Right", group: "Arrows" },
  // Function Keys
  ...Array.from({ length: 12 }, (_, i) => ({
    value: `F${i + 1}`,
    label: `F${i + 1}`,
    group: "Function",
  })),
  // Misc Keys
  { value: "BACKSPACE", label: "Backspace", group: "Misc" },
  { value: "DELETE", label: "Delete", group: "Misc" },
  { value: "HOME", label: "Home", group: "Misc" },
  { value: "END", label: "End", group: "Misc" },
  { value: "PAGEUP", label: "Page Up", group: "Misc" },
  { value: "PAGEDOWN", label: "Page Down", group: "Misc" },
  { value: "INSERT", label: "Insert", group: "Misc" },
];

// Group keys by their group
const groupedKeys = KEYBOARD_KEYS.reduce((acc, key) => {
  if (!acc[key.group]) {
    acc[key.group] = [];
  }
  acc[key.group].push(key);
  return acc;
}, {});

// Add switchLabelStyle function before the component
const switchLabelStyle = (isChecked) => ({
  color: "white",
  transition: "color 0.3s ease",
  ...(isChecked && {
    color: "#478bd6",
  }),
});

// Add this function for text effects
const createTextEffect = (element, effect = "default") => {
  if (!element) return;

  switch (effect) {
    case "glow":
      anime({
        targets: element,
        textShadow: [
          "0 0 0px rgba(71, 139, 214, 0)",
          "0 0 10px rgba(71, 139, 214, 0.5)",
          "0 0 0px rgba(71, 139, 214, 0)",
        ],
        duration: 2000,
        easing: "easeInOutQuad",
        direction: "alternate",
        loop: true,
      });
      break;

    case "gradient":
      // Add gradient animation to text
      element.style.backgroundImage =
        "linear-gradient(45deg, #478bd6, #64b5f6)";
      element.style.backgroundSize = "200% 200%";
      element.style.backgroundClip = "text";
      element.style.webkitBackgroundClip = "text";
      element.style.color = "transparent";
      element.style.webkitTextFillColor = "transparent";

      anime({
        targets: element,
        backgroundPosition: ["0% 0%", "200% 200%"],
        duration: 3000,
        easing: "easeInOutQuad",
        direction: "alternate",
        loop: true,
      });
      break;

    case "typing":
      // Typing effect
      const text = element.textContent;
      element.textContent = "";
      element.style.opacity = 1;

      [...text].forEach((char, i) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.opacity = 0;
        element.appendChild(span);

        anime({
          targets: span,
          opacity: [0, 1],
          duration: 100,
          easing: "easeOutQuad",
          delay: i * 50,
        });
      });
      break;

    case "float":
      // Floating animation
      anime({
        targets: element,
        translateY: [-2, 2],
        duration: 2000,
        easing: "easeInOutQuad",
        direction: "alternate",
        loop: true,
      });
      break;

    default:
      // Default hover effect
      element.addEventListener("mouseenter", () => {
        anime({
          targets: element,
          scale: 1.1,
          translateY: -2,
          duration: 400,
          easing: "easeOutElastic(1, .8)",
        });
      });

      element.addEventListener("mouseleave", () => {
        anime({
          targets: element,
          scale: 1,
          translateY: 0,
          duration: 300,
          easing: "easeOutQuad",
        });
      });
  }
};

export function SettingsStyleEditor({
  config,
  onUpdate,
  onSave,
  onCancel,
  isNewConfig = false,
  isSaving = false,
  sectionRefs,
  onSectionHover,
  onSuccess,
}) {
  const [localSettings, setLocalSettings] = useState(
    config?.jsonConfig ? JSON.parse(config.jsonConfig) : {}
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const switchRefs = useRef({});
  const sliderRefs = useRef({});

  // Update local settings when config changes
  useEffect(() => {
    if (config?.jsonConfig) {
      setLocalSettings(
        typeof config.jsonConfig === "string"
          ? JSON.parse(config.jsonConfig)
          : config.jsonConfig
      );
    }
  }, [config]);

  if (!config || !config.jsonConfig) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleChange = (path, value) => {
    const newSettings = { ...localSettings };
    let current = newSettings;
    const parts = path.split(".");

    // Create nested objects if they don't exist
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleGameTitleChange = (event) => {
    const newSettings = {
      ...localSettings,
      game: {
        ...localSettings.game,
        title: event.target.value,
      },
    };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const checkServerStatus = async () => {
    setIsCheckingServer(true);
    try {
      try {
        const healthCheck = await fetchWithTimeout("/api/configuration/test");

        if (!healthCheck.ok) {
          onCancel();
          return false;
        }
        return true;
      } catch (error) {
        if (error.message === "Request timed out") {
          console.log("Server check timed out");
        }
        onCancel();
        return false;
      }
    } catch (error) {
      onCancel();
      return false;
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleApply = async () => {
    if (!hasChanges || isSaving) return;

    if (!(await checkServerStatus())) return;

    const updatedConfig = {
      ...config,
      jsonConfig: JSON.stringify(localSettings),
    };

    try {
      await onUpdate(updatedConfig, false);
      setHasChanges(false);

      // Success animation
      onSuccess();

      // Celebrate animation on sections
      anime({
        targets: ".config-section",
        scale: [1, 1.05, 1],
        duration: 400,
        easing: "easeInOutQuad",
      });
    } catch (error) {
      // Error shake animation
      anime({
        targets: ".config-section",
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 400,
        easing: "easeInOutQuad",
      });
    }
  };

  const handleOK = async () => {
    if (isSaving) return;

    if (!(await checkServerStatus())) return;

    try {
      if (hasChanges) {
        const updatedConfig = {
          ...config,
          jsonConfig: JSON.stringify(localSettings),
        };
        await onUpdate(updatedConfig, true);
      } else {
        await onSave();
      }
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleSwitchChange = (path, checked) => {
    const switchRef = switchRefs.current[path];
    if (!switchRef) return;

    if (checked) {
      // Turn on animation
      anime({
        targets: switchRef,
        rotateY: [0, 360],
        scale: [1, 1.2, 1],
        duration: 600,
        easing: "easeOutExpo",
      });

      // Create and animate particles
      const particles = Array.from({ length: 8 }, () => {
        const particle = document.createElement("div");
        particle.style.position = "absolute";
        particle.style.width = "4px";
        particle.style.height = "4px";
        particle.style.backgroundColor = "#478bd6";
        particle.style.borderRadius = "50%";
        particle.style.pointerEvents = "none";
        switchRef.appendChild(particle);
        return particle;
      });

      anime({
        targets: particles,
        translateX: () => anime.random(-50, 50),
        translateY: () => anime.random(-50, 50),
        opacity: [1, 0],
        scale: [1.5, 0],
        duration: 1000,
        easing: "easeOutExpo",
        complete: () => particles.forEach((p) => p.remove()),
      });
    } else {
      // Turn off animation
      anime({
        targets: switchRef,
        rotateY: [0, -360],
        scale: [1, 0.8, 1],
        duration: 600,
        easing: "easeOutExpo",
      });
    }

    handleChange(path, checked);
  };

  const handleSliderAnimation = (path, value, isStart = false) => {
    const sliderRef = sliderRefs.current[path];
    if (!sliderRef) return;

    // Glowing trail effect
    const createGlowTrail = () => {
      const trail = document.createElement("div");
      trail.style.cssText = `
        position: absolute;
        height: 4px;
        background: linear-gradient(90deg, 
          rgba(71, 139, 214, 0), 
          rgba(71, 139, 214, 0.6), 
          rgba(71, 139, 214, 0)
        );
        filter: blur(2px);
        pointer-events: none;
        z-index: 0;
      `;

      const track = sliderRef.querySelector(".MuiSlider-track");
      const rect = track.getBoundingClientRect();
      trail.style.width = `${rect.width * 1.5}px`;
      trail.style.left = `${rect.left - rect.width * 0.25}px`;
      trail.style.top = `${rect.top}px`;
      document.body.appendChild(trail);

      anime({
        targets: trail,
        translateX: [0, rect.width * 0.5],
        opacity: [0.8, 0],
        duration: 1000,
        easing: "easeOutQuad",
        complete: () => trail.remove(),
      });
    };

    // Thumb pulse effect
    const createPulse = () => {
      const pulse = document.createElement("div");
      pulse.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(71, 139, 214, 0.2);
        border: 2px solid rgba(71, 139, 214, 0.4);
        border-radius: 50%;
        pointer-events: none;
      `;

      const thumb = sliderRef.querySelector(".MuiSlider-thumb");
      const rect = thumb.getBoundingClientRect();
      pulse.style.left = `${rect.left}px`;
      pulse.style.top = `${rect.top}px`;
      document.body.appendChild(pulse);

      anime({
        targets: pulse,
        scale: [1, 2],
        opacity: [1, 0],
        duration: 600,
        easing: "easeOutExpo",
        complete: () => pulse.remove(),
      });
    };

    if (isStart) {
      createPulse();
    }
    createGlowTrail();

    // Smooth thumb animation
    anime({
      targets: sliderRef.querySelector(".MuiSlider-thumb"),
      scale: [1, 1.2, 1],
      duration: 400,
      easing: "easeOutElastic(1, .5)",
    });

    // Value label animation
    const valueLabel = sliderRef.querySelector(".MuiSlider-valueLabel");
    if (valueLabel) {
      anime({
        targets: valueLabel,
        scale: [1, 1.1, 1],
        duration: 300,
        easing: "easeOutQuad",
      });
    }
  };

  // Update the Paper and section styles to be more glassy
  const sectionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(12px)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    marginBottom: "16px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.12)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
  };

  // Update the renderUISettings function to include Show FPS
  const renderUISettings = () => (
    <Box sx={sectionStyle}>
      <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
        UI Settings
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Box
              ref={(el) => (switchRefs.current["game.ui.showScore"] = el)}
              sx={{ transform: "perspective(400px)" }}
            >
              <Switch
                checked={localSettings.game?.ui?.showScore ?? true}
                onChange={(e) =>
                  handleSwitchChange("game.ui.showScore", e.target.checked)
                }
                sx={switchStyle}
              />
            </Box>
          }
          label={
            <Typography
              sx={switchLabelStyle(localSettings.game?.ui?.showScore)}
            >
              Show Score
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Box
              ref={(el) => (switchRefs.current["game.ui.showLives"] = el)}
              sx={{ transform: "perspective(400px)" }}
            >
              <Switch
                checked={localSettings.game?.ui?.showLives ?? true}
                onChange={(e) =>
                  handleSwitchChange("game.ui.showLives", e.target.checked)
                }
                sx={switchStyle}
              />
            </Box>
          }
          label={
            <Typography
              sx={switchLabelStyle(localSettings.game?.ui?.showLives)}
            >
              Show Lives
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Box
              ref={(el) => (switchRefs.current["game.ui.showFPS"] = el)}
              sx={{ transform: "perspective(400px)" }}
            >
              <Switch
                checked={localSettings.game?.ui?.showFPS ?? false}
                onChange={(e) =>
                  handleSwitchChange("game.ui.showFPS", e.target.checked)
                }
                sx={switchStyle}
              />
            </Box>
          }
          label={
            <Typography sx={switchLabelStyle(localSettings.game?.ui?.showFPS)}>
              Show FPS
            </Typography>
          }
        />
      </Stack>
    </Box>
  );

  // Add audio settings section
  const renderAudioSettings = () => (
    <Box sx={sectionStyle}>
      <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
        Audio Settings
      </Typography>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Background Music Volume
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Slider
              ref={(el) =>
                (sliderRefs.current["game.audio.backgroundMusicVolume"] = el)
              }
              value={localSettings.game?.audio?.backgroundMusicVolume || 0.8}
              onChange={(_, value) => {
                handleChange("game.audio.backgroundMusicVolume", value);
                handleSliderAnimation(
                  "game.audio.backgroundMusicVolume",
                  value
                );
              }}
              onMouseDown={() =>
                handleSliderAnimation(
                  "game.audio.backgroundMusicVolume",
                  localSettings.game?.audio?.backgroundMusicVolume || 0.8,
                  true
                )
              }
              min={0}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              sx={sliderStyle}
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Sound Effects Volume
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Slider
              ref={(el) =>
                (sliderRefs.current["game.audio.soundEffectsVolume"] = el)
              }
              value={localSettings.game?.audio?.soundEffectsVolume || 0.7}
              onChange={(_, value) => {
                handleChange("game.audio.soundEffectsVolume", value);
                handleSliderAnimation("game.audio.soundEffectsVolume", value);
              }}
              onMouseDown={() =>
                handleSliderAnimation(
                  "game.audio.soundEffectsVolume",
                  localSettings.game?.audio?.soundEffectsVolume || 0.7,
                  true
                )
              }
              min={0}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              sx={sliderStyle}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  // Add this function to handle dropdown animations
  const handleDropdownAnimation = (event, isOpening) => {
    const select = event.target;
    const menu = select.parentElement.querySelector(".MuiSelect-popper");

    if (!menu) return;

    if (isOpening) {
      // Opening animation
      anime({
        targets: menu,
        translateY: [-10, 0],
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        easing: "easeOutElastic(1, .8)",
        begin: () => {
          // Create sparkle effect
          const sparkles = Array.from({ length: 6 }, () => {
            const sparkle = document.createElement("div");
            sparkle.style.cssText = `
              position: absolute;
              width: 4px;
              height: 4px;
              background: #478bd6;
              border-radius: 50%;
              pointer-events: none;
              z-index: 1000;
            `;
            document.body.appendChild(sparkle);
            return sparkle;
          });

          const rect = select.getBoundingClientRect();
          sparkles.forEach((sparkle) => {
            sparkle.style.left = `${rect.left + rect.width / 2}px`;
            sparkle.style.top = `${rect.top + rect.height}px`;
          });

          anime({
            targets: sparkles,
            translateX: () => anime.random(-30, 30),
            translateY: () => anime.random(-20, 20),
            scale: [1, 0],
            opacity: [1, 0],
            duration: 800,
            easing: "easeOutExpo",
            complete: () => sparkles.forEach((s) => s.remove()),
          });
        },
      });

      // Animate menu items stagger
      anime({
        targets: menu.querySelectorAll(".MuiMenuItem-root"),
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 400,
        easing: "easeOutQuad",
      });
    } else {
      // Closing animation
      anime({
        targets: menu,
        translateY: [0, -10],
        opacity: [1, 0],
        scale: [1, 0.95],
        duration: 250,
        easing: "easeOutQuad",
      });
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const isConfirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!isConfirmed) return;
    }
    onCancel();
  };

  return (
    <Paper
      sx={{
        p: 4,
        bgcolor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        color: "white",
        maxWidth: 800,
        mx: "auto",
        boxShadow: "none",
        "& .config-section": sectionStyle,
        "& .MuiInputBase-input.Mui-disabled": {
          color: "rgba(255, 255, 255, 0.7)",
          WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          padding: "8px 12px",
          borderRadius: 1,
        },
      }}
    >
      {/* Game Settings */}
      <Box sx={sectionStyle}>
        <Stack spacing={2}>
          <TextField
            label="Game Title"
            value={localSettings.game?.title || ""}
            onChange={handleGameTitleChange}
            fullWidth
            margin="normal"
            sx={{
              mb: 3,
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#478bd6" },
              },
            }}
          />

          <TextField
            label="Version"
            value={localSettings.game?.version || ""}
            onChange={(e) => {
              const versionRegex = /^\d+\.\d+\.\d+$/;
              if (versionRegex.test(e.target.value) || e.target.value === "") {
                handleChange("game.version", e.target.value);
              }
            }}
            size="small"
            helperText="Format: x.y.z (e.g., 1.0.0)"
            sx={{
              ...textFieldStyle,
              "& .MuiFormHelperText-root": {
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Screen Settings
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Width"
                type="number"
                value={localSettings.game?.screen?.width || 1024}
                onChange={(e) =>
                  handleChange("game.screen.width", Number(e.target.value))
                }
                size="small"
                sx={{ ...textFieldStyle, width: 120 }}
                disabled={localSettings.game?.screen?.fullscreen}
              />
              <TextField
                label="Height"
                type="number"
                value={localSettings.game?.screen?.height || 768}
                onChange={(e) =>
                  handleChange("game.screen.height", Number(e.target.value))
                }
                size="small"
                sx={{ ...textFieldStyle, width: 120 }}
                disabled={localSettings.game?.screen?.fullscreen}
              />
              <FormControlLabel
                control={
                  <Box
                    ref={(el) =>
                      (switchRefs.current["game.screen.fullscreen"] = el)
                    }
                    sx={{ transform: "perspective(400px)" }}
                  >
                    <Switch
                      checked={localSettings.game?.screen?.fullscreen || false}
                      onChange={(e) =>
                        handleSwitchChange(
                          "game.screen.fullscreen",
                          e.target.checked
                        )
                      }
                      sx={{
                        "& .MuiSwitch-switchBase": {
                          "&.Mui-checked": {
                            "& + .MuiSwitch-track": {
                              backgroundColor: "#478bd6 !important",
                              opacity: 0.8,
                            },
                            "& .MuiSwitch-thumb": {
                              backgroundColor: "#fff",
                            },
                          },
                        },
                        "& .MuiSwitch-track": {
                          backgroundColor:
                            "rgba(255, 255, 255, 0.2) !important",
                        },
                        "& .MuiSwitch-thumb": {
                          boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
                        },
                      }}
                    />
                  </Box>
                }
                label={
                  <Typography
                    sx={{
                      color: "white",
                      transition: "color 0.3s ease",
                      ...(localSettings.game?.screen?.fullscreen && {
                        color: "#478bd6",
                      }),
                    }}
                  >
                    Fullscreen
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(71, 139, 214, 0.2)",
          my: 3,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Audio Settings */}
      {renderAudioSettings()}

      <Divider
        sx={{
          borderColor: "rgba(71, 139, 214, 0.2)",
          my: 3,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Difficulty Settings */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
          Difficulty
        </Typography>
        <Select
          value={localSettings.difficulty?.current || "medium"}
          onChange={(e) => {
            // Update current difficulty
            handleChange("difficulty.current", e.target.value);

            // Update related settings based on difficulty
            const difficultySettings =
              localSettings.difficulty?.[e.target.value] || {};
            handleChange(
              "asteroids.speedMultiplier",
              difficultySettings.asteroidSpeedMultiplier || 1.0
            );
            handleChange(
              "game.enemySpawnRate",
              difficultySettings.enemySpawnRate || 1.0
            );
            handleChange("player.lives", difficultySettings.playerLives || 3);
          }}
          size="small"
          fullWidth
          sx={{
            color: "white",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
        >
          <MenuItem value="easy">
            Easy
            <Typography
              variant="caption"
              sx={{ ml: 1, color: "rgba(255, 255, 255, 0.5)" }}
            >
              (More Lives, Slower Asteroids)
            </Typography>
          </MenuItem>
          <MenuItem value="medium">
            Medium
            <Typography
              variant="caption"
              sx={{ ml: 1, color: "rgba(255, 255, 255, 0.5)" }}
            >
              (Standard Settings)
            </Typography>
          </MenuItem>
          <MenuItem value="hard">
            Hard
            <Typography
              variant="caption"
              sx={{ ml: 1, color: "rgba(255, 255, 255, 0.5)" }}
            >
              (Fewer Lives, Faster Asteroids)
            </Typography>
          </MenuItem>
        </Select>

        {/* Show current difficulty settings */}
        {localSettings.difficulty?.current && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Current Difficulty Settings:
            </Typography>
            <Stack spacing={1} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              <Typography variant="body2">
                Asteroid Speed: x
                {localSettings.difficulty?.[localSettings.difficulty.current]
                  ?.asteroidSpeedMultiplier || 1.0}
              </Typography>
              <Typography variant="body2">
                Enemy Spawn Rate: x
                {localSettings.difficulty?.[localSettings.difficulty.current]
                  ?.enemySpawnRate || 1.0}
              </Typography>
              <Typography variant="body2">
                Player Lives:{" "}
                {localSettings.difficulty?.[localSettings.difficulty.current]
                  ?.playerLives || 3}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(71, 139, 214, 0.2)",
          my: 3,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Player Settings */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
          Player Settings
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Lives
            </Typography>
            <TextField
              type="number"
              value={localSettings.player?.lives || 3}
              onChange={(e) =>
                handleChange("player.lives", Number(e.target.value))
              }
              size="small"
              sx={{ ...textFieldStyle, width: 120 }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ship Speed
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                ref={(el) => (sliderRefs.current["player.shipSpeed"] = el)}
                value={localSettings.player?.shipSpeed || 5.0}
                onChange={(_, value) => {
                  handleChange("player.shipSpeed", value);
                  handleSliderAnimation("player.shipSpeed", value / 10);
                }}
                onMouseDown={() =>
                  handleSliderAnimation(
                    "player.shipSpeed",
                    (localSettings.player?.shipSpeed || 5.0) / 10,
                    true
                  )
                }
                min={1}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
                sx={sliderStyle}
              />
              <TextField
                value={localSettings.player?.shipSpeed || 5.0}
                onChange={(e) =>
                  handleChange("player.shipSpeed", Number(e.target.value))
                }
                type="number"
                size="small"
                sx={{ ...textFieldStyle, width: 100 }}
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Fire Rate
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                ref={(el) => (sliderRefs.current["player.fireRate"] = el)}
                value={localSettings.player?.fireRate || 0.5}
                onChange={(_, value) => {
                  handleChange("player.fireRate", value);
                  handleSliderAnimation("player.fireRate", value / 2);
                }}
                onMouseDown={() =>
                  handleSliderAnimation(
                    "player.fireRate",
                    (localSettings.player?.fireRate || 0.5) / 2,
                    true
                  )
                }
                min={0.1}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
                sx={sliderStyle}
              />
              <TextField
                value={localSettings.player?.fireRate || 0.5}
                type="number"
                size="small"
                sx={{ ...textFieldStyle, width: 100 }}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(71, 139, 214, 0.2)",
          my: 3,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Asteroids Settings */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
          Asteroids Settings
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Spawn Rate
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                ref={(el) => (sliderRefs.current["asteroids.spawnRate"] = el)}
                value={localSettings.asteroids?.spawnRate || 1.5}
                onChange={(_, value) => {
                  handleChange("asteroids.spawnRate", value);
                  handleSliderAnimation("asteroids.spawnRate", value / 5); // normalize value to 0-1
                }}
                onMouseDown={() =>
                  handleSliderAnimation(
                    "asteroids.spawnRate",
                    (localSettings.asteroids?.spawnRate || 1.5) / 5,
                    true
                  )
                }
                min={0.5}
                max={5}
                step={0.1}
                valueLabelDisplay="auto"
                sx={sliderStyle}
              />
              <TextField
                value={localSettings.asteroids?.spawnRate || 1.5}
                type="number"
                size="small"
                sx={{ ...textFieldStyle, width: 100 }}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Min Size"
              type="number"
              value={localSettings.asteroids?.minSize || 20}
              onChange={(e) =>
                handleChange("asteroids.minSize", Number(e.target.value))
              }
              size="small"
              sx={{ ...textFieldStyle, width: 120 }}
            />
            <TextField
              label="Max Size"
              type="number"
              value={localSettings.asteroids?.maxSize || 100}
              onChange={(e) =>
                handleChange("asteroids.maxSize", Number(e.target.value))
              }
              size="small"
              sx={{ ...textFieldStyle, width: 120 }}
            />
          </Stack>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Speed Range
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Min Speed"
                type="number"
                value={localSettings.asteroids?.speed?.minSpeed || 1.0}
                onChange={(e) =>
                  handleChange(
                    "asteroids.speed.minSpeed",
                    Number(e.target.value)
                  )
                }
                size="small"
                sx={{ ...textFieldStyle, width: 120 }}
              />
              <TextField
                label="Max Speed"
                type="number"
                value={localSettings.asteroids?.speed?.maxSpeed || 5.0}
                onChange={(e) =>
                  handleChange(
                    "asteroids.speed.maxSpeed",
                    Number(e.target.value)
                  )
                }
                size="small"
                sx={{ ...textFieldStyle, width: 120 }}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(71, 139, 214, 0.2)",
          my: 3,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Controls Settings */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
          Controls
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(localSettings.controls || {}).map(([key, value]) => (
            <Grid item xs={6} key={key}>
              <FormControl fullWidth size="small">
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </Typography>
                <Select
                  value={value}
                  onChange={(e) =>
                    handleChange(`controls.${key}`, e.target.value)
                  }
                  onOpen={(e) => handleDropdownAnimation(e, true)}
                  onClose={(e) => handleDropdownAnimation(e, false)}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "rgba(13, 17, 23, 0.95)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                        ".MuiMenuItem-root": {
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(71, 139, 214, 0.2)",
                          },
                          "&.Mui-selected": {
                            bgcolor: "rgba(71, 139, 214, 0.3)",
                            "&:hover": {
                              bgcolor: "rgba(71, 139, 214, 0.4)",
                            },
                          },
                        },
                        ".MuiListSubheader-root": {
                          bgcolor: "rgba(0, 0, 0, 0.4)",
                          color: "rgba(255, 255, 255, 0.7)",
                          backdropFilter: "blur(5px)",
                        },
                      },
                    },
                  }}
                >
                  {Object.entries(groupedKeys).map(([group, keys]) => [
                    <ListSubheader key={group}>{group}</ListSubheader>,
                    ...keys.map((key) => (
                      <MenuItem
                        key={key.value}
                        value={key.value}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        {key.label}
                      </MenuItem>
                    )),
                  ])}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add UI Settings section */}
      {renderUISettings()}

      {/* Buttons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ mt: 4 }}
      >
        {isCheckingServer && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 2,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Checking server status...</Typography>
          </Box>
        )}
        <Button
          variant="outlined"
          sx={buttonStyle}
          onClick={handleOK}
          disabled={isSaving || isCheckingServer}
        >
          OK
        </Button>
        <Button
          variant="outlined"
          sx={buttonStyle}
          onClick={() => handleCancel()}
          disabled={isSaving || isCheckingServer}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          sx={{
            ...buttonStyle,
            ...((!hasChanges || isSaving || isCheckingServer) && {
              color: "rgba(255, 255, 255, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              cursor: "not-allowed",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }),
          }}
          onClick={handleApply}
          disabled={!hasChanges || isSaving || isCheckingServer}
        >
          Apply
        </Button>
      </Stack>

      {/* Add the styles */}
      <style>{additionalStyles}</style>
    </Paper>
  );
}

const textFieldStyle = {
  "& .MuiInputBase-input": { color: "white" },
  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
  },
};

const sliderStyle = {
  color: "#478bd6",
  height: 8,
  "& .MuiSlider-rail": {
    backgroundColor: "rgba(71, 139, 214, 0.2)",
    opacity: 1,
  },
  "& .MuiSlider-track": {
    backgroundColor: "#478bd6",
    border: "none",
    backgroundImage: "linear-gradient(90deg, rgba(71, 139, 214, 0.8), #478bd6)",
  },
  "& .MuiSlider-thumb": {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    boxShadow: "0 0 0 2px #478bd6",
    "&:hover": {
      boxShadow: "0 0 0 8px rgba(71, 139, 214, 0.1)",
    },
    "&.Mui-active": {
      boxShadow: "0 0 0 12px rgba(71, 139, 214, 0.2)",
    },
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: "#478bd6",
    fontSize: "0.875rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    "&:before": {
      borderBottom: "6px solid #478bd6",
    },
  },
};

const buttonStyle = {
  color: "white",
  borderColor: "rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(5px)",
  backgroundColor: "rgba(71, 139, 214, 0.1)",
  "&:hover": {
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(71, 139, 214, 0.2)",
  },
  "&:disabled": {
    color: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
};

// Add switch style
const switchStyle = {
  "& .MuiSwitch-switchBase": {
    "&.Mui-checked": {
      "& + .MuiSwitch-track": {
        backgroundColor: "#478bd6 !important",
        opacity: 0.8,
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: "#fff",
      },
    },
  },
  "& .MuiSwitch-track": {
    backgroundColor: "rgba(255, 255, 255, 0.2) !important",
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
  },
};

const additionalStyles = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(2.5); opacity: 0; }
    100% { transform: scale(1); opacity: 0.3; }
  }
`;
