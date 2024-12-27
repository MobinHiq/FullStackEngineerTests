import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Container, Grid, Paper } from "@mui/material";
import { CogIcon, PlusIcon } from "@heroicons/react/24/outline";
import anime from "animejs";

const Dashboard = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    // Cards entrance animation
    anime({
      targets: ".dashboard-card",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(150),
      duration: 600,
      easing: "easeOutQuad",
    });
  }, []);

  const cards = [
    {
      title: "View Configurations",
      description: "Browse and manage existing game configurations",
      icon: <CogIcon className="h-8 w-8" />,
      link: "/configurations",
      color: "#478bd6",
    },
    {
      title: "Create Configuration",
      description: "Set up a new game configuration",
      icon: <PlusIcon className="h-8 w-8" />,
      link: "/create",
      color: "#64b5f6",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 12,
        pb: 4,
        px: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Title Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            className="config-title"
            variant="h4"
            sx={{
              color: "white",
              fontFamily: "'Lilita One', cursive",
              fontWeight: 400,
              fontSize: "2.5rem",
              letterSpacing: "0.5px",
              padding: "10px 30px",
              background: "linear-gradient(45deg, #FF4136, #FF851B)",
              borderRadius: "15px",
              border: "4px solid #000",
              boxShadow: "0 8px 0 #000, 0 15px 20px rgba(0, 0, 0, 0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              textShadow: "2px 2px 0 #000",
              display: "inline-block",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 0 #000, 0 20px 25px rgba(0, 0, 0, 0.4)",
              },
            }}
          >
            Game Configuration
          </Typography>
        </Box>

        {/* Main Cards */}
        <Grid container spacing={4} justifyContent="center">
          {cards.map((card, index) => (
            <Grid item xs={12} md={6} key={card.title}>
              <Paper
                ref={(el) => (cardsRef.current[index] = el)}
                component={Link}
                to={card.link}
                className="dashboard-card cartoon-card"
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(8px)",
                  border: "4px solid #000",
                  boxShadow: "8px 8px 0 #000",
                  borderRadius: "16px",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "12px 12px 0 #000",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#478bd6",
                    color: "white",
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0 #000",
                    transform: "rotate(-2deg)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "rotate(-2deg) translateY(-2px)",
                      boxShadow: "6px 6px 0 #000",
                    },
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: "#64b5f6",
                    fontSize: "1.5rem",
                    fontWeight: 400,
                    letterSpacing: "0.5px",
                    fontFamily: "'Lilita One', cursive",
                    textShadow: "2px 2px 0 rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontFamily: "'VT323', monospace",
                    fontSize: "1.1rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  {card.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
