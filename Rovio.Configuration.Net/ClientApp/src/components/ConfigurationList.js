import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useConfiguration } from "../contexts/ConfigurationContext";
import anime from "animejs";
import { toast } from "react-hot-toast";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { ErrorPage } from "./ErrorPage";

function ConfigurationList() {
  const { configurations, loading, refreshConfigurations } = useConfiguration();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [showErrorPage, setShowErrorPage] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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

        await refreshConfigurations();
      } catch (err) {
        if (err.message === "Request timed out") {
          setShowErrorPage(true);
          return;
        }
        setError(err.message);
        console.error("Error fetching configurations:", err);
      }
    };
    fetchData();
  }, [refreshConfigurations]);

  useEffect(() => {
    if (!loading && configurations?.length > 0) {
      anime({
        targets: ".config-card",
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: "easeOutElastic(1, .8)",
      });
    }
  }, [loading, configurations]);

  const handleDelete = async (configId, configName) => {
    if (window.confirm(`Are you sure you want to delete "${configName}"?`)) {
      setIsCheckingServer(true);
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

        const response = await fetchWithTimeout(
          `/api/configuration/${configId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete configuration");
        }

        toast.success("Configuration deleted successfully");
        refreshConfigurations();
      } catch (error) {
        if (error.message === "Request timed out") {
          setShowErrorPage(true);
          return;
        }
        toast.error("Error deleting configuration");
        console.error("Error:", error);
      } finally {
        setIsCheckingServer(false);
      }
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const found = configList.find((config) =>
        config.name.toLowerCase().includes(query)
      );
      if (found) {
        setHighlightedId(found.id);
        // Animate the found card
        anime({
          targets: `#config-${found.id}`,
          boxShadow: ["8px 8px 0 #000", "0 0 25px #FFD700", "8px 8px 0 #000"],
          duration: 1500,
          easing: "easeInOutQuad",
        });
      }
    } else {
      setHighlightedId(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #1B2735 0%, #090A0F 100%)",
        }}
      >
        <CircularProgress
          data-testid="loading-spinner"
          sx={{ color: "#FFD700" }}
        />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #1B2735 0%, #090A0F 100%)",
        }}
      >
        <Typography
          className="cartoon-title"
          variant="h4"
          sx={{ mb: 2, color: "#FF4136" }}
        >
          Oops! Something went wrong
        </Typography>
        <Typography sx={{ color: "white", mb: 3 }}>{error}</Typography>
        <Button
          className="cartoon-button"
          onClick={() => window.location.reload()}
          variant="contained"
          color="primary"
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // Ensure configurations is an array
  const configList = Array.isArray(configurations) ? configurations : [];

  if (showErrorPage) {
    return <ErrorPage message="Unable to connect to the server" />;
  }

  return (
    <Box sx={{ minHeight: "100vh", pt: 8, pb: 4, px: 3 }}>
      <Container maxWidth="lg">
        {/* Header section with Create New button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontFamily: "'Lilita One', cursive",
              fontWeight: 400,
              letterSpacing: "0.5px",
            }}
          >
            Game Configurations
          </Typography>
          <Button
            component={Link}
            to="/create"
            variant="contained"
            startIcon={<PlusIcon className="h-6 w-6" />}
            sx={{
              backgroundColor: "#4CAF50",
              fontFamily: "'VT323', monospace",
              fontSize: "1.4rem",
              letterSpacing: "0.5px",
              padding: "8px 24px",
              borderRadius: "12px",
              border: "3px solid #000",
              boxShadow: "4px 4px 0 #000",
              transition: "all 0.2s ease",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#45a049",
                transform: "translate(-2px, -2px)",
                boxShadow: "6px 6px 0 #000",
              },
              "&:active": {
                transform: "translate(0, 0)",
                boxShadow: "2px 2px 0 #000",
              },
            }}
          >
            Create New
          </Button>
        </Box>

        {/* Search bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search configurations..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "3px solid #000",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "3px solid #000",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "3px solid #000",
                },
                "& input": {
                  color: "white",
                  fontFamily: "'VT323', monospace",
                  fontSize: "1.4rem",
                  letterSpacing: "0.5px",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily: "'VT323', monospace",
                    fontSize: "1.4rem",
                    letterSpacing: "0.5px",
                    opacity: 1,
                    textTransform: "none",
                  },
                },
              },
            }}
          />
        </Box>

        {/* Grid of Configurations */}
        {configList.length > 0 ? (
          <Grid container spacing={3}>
            {configList
              .filter((config) =>
                config.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((config) => (
                <Grid item xs={12} sm={6} lg={4} key={config.id}>
                  <Card
                    id={`config-${config.id}`}
                    className="config-card"
                    sx={{
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(8px)",
                      border: "4px solid #000",
                      boxShadow: "8px 8px 0 #000",
                      borderRadius: "16px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "12px 12px 0 #000",
                      },
                      ...(highlightedId === config.id && {
                        border: "4px solid #FFD700",
                      }),
                    }}
                  >
                    <Box sx={{ p: 2.5 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 1.5,
                          color: "#FFD700",
                          fontSize: "1.5rem",
                          fontFamily: "'Lilita One', cursive",
                          textShadow: "2px 2px 0 rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        {config.name}
                      </Typography>
                      <Typography
                        sx={{
                          mb: 2,
                          color: "rgba(255, 255, 255, 0.8)",
                          fontFamily: "'VT323', monospace",
                          fontSize: "1.1rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Last modified:{" "}
                        {config.updatedAt
                          ? new Date(config.updatedAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Not modified"}
                      </Typography>
                    </Box>

                    {/* Action buttons */}
                    <Box
                      sx={{
                        p: 2.5,
                        pt: 0,
                        display: "flex",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component={Link}
                        to={`/edit/${config.id}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 45,
                          height: 45,
                          backgroundColor: "#478bd6",
                          color: "white",
                          border: "3px solid #000",
                          boxShadow: "0 4px 0 #000",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 0 #000",
                            backgroundColor: "#64b5f6",
                          },
                          "&:active": {
                            transform: "translateY(0)",
                            boxShadow: "0 2px 0 #000",
                          },
                        }}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Box>

                      <Box
                        data-testid="delete-button"
                        onClick={() => handleDelete(config.id, config.name)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 45,
                          height: 45,
                          backgroundColor: "#FF4136",
                          color: "white",
                          cursor: "pointer",
                          border: "3px solid #000",
                          boxShadow: "0 4px 0 #000",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 0 #000",
                            backgroundColor: "#FF6B6B",
                          },
                          "&:active": {
                            transform: "translateY(0)",
                            boxShadow: "0 2px 0 #000",
                          },
                        }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              mt: 8,
              p: 4,
              border: "4px dashed rgba(255, 255, 255, 0.1)",
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontFamily: "'Lilita One', cursive",
                fontSize: "1.5rem",
                fontWeight: 400,
                letterSpacing: "0.5px",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              No configurations yet
            </Typography>
            <Typography
              sx={{
                mb: 3,
                fontFamily: "'VT323', monospace",
                fontSize: "1.1rem",
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "0.5px",
              }}
            >
              Create your first game configuration to get started!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export { ConfigurationList };
