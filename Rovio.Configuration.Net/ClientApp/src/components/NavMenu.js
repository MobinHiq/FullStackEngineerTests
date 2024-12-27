import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import { CogIcon, HomeIcon } from "@heroicons/react/24/outline";
import anime from "animejs";

export function NavMenu() {
  const location = useLocation();
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    // Initial entrance animation
    anime
      .timeline({
        easing: "easeOutExpo",
      })
      .add({
        targets: navRef.current,
        translateY: [-100, 0],
        opacity: [0, 1],
        duration: 1200,
      })
      .add(
        {
          targets: logoRef.current,
          scale: [0.5, 1],
          opacity: [0, 1],
          duration: 800,
        },
        "-=800"
      );
  }, []);

  return (
    <AppBar
      ref={navRef}
      position="fixed"
      sx={{
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "4px solid #000",
        boxShadow: "0 6px 0 #000",
        height: "80px",
        display: "flex",
        alignItems: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(90deg, #478bd6, #64b5f6)",
          opacity: 0.1,
          zIndex: -1,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1600px",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mt: 1,
            px: {
              xs: 2,
              sm: 3,
              md: 4,
              lg: 6,
            },
          }}
        >
          {/* Logo */}
          <Typography
            ref={logoRef}
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "white",
              textDecoration: "none",
              fontFamily: "'Lilita One', cursive",
              fontSize: "1.1rem",
              padding: "8px 16px",
              border: "3px solid #000",
              borderRadius: "8px",
              backgroundColor: "transparent",
              boxShadow: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 0 #000",
                backgroundColor: "#478bd6",
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: "0 2px 0 #000",
              },
            }}
          >
            <CogIcon className="h-5 w-5" />
            ROVIO
          </Typography>

          {/* Navigation Links */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              alignItems: "center",
            }}
          >
            {[
              { to: "/", icon: <HomeIcon className="h-5 w-5" />, text: "Home" },
              {
                to: "/configurations",
                icon: <CogIcon className="h-5 w-5" />,
                text: "Configurations",
              },
            ].map((link, index) => (
              <Box
                key={link.to}
                ref={(el) => (linksRef.current[index] = el)}
                component={Link}
                to={link.to}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  height: "40px",
                  px: 3,
                  borderRadius: "8px",
                  fontFamily: "'Lilita One', cursive",
                  fontSize: "1.1rem",
                  border: "3px solid #000",
                  backgroundColor:
                    location.pathname === link.to ? "#478bd6" : "transparent",
                  boxShadow:
                    location.pathname === link.to ? "0 4px 0 #000" : "none",
                  transform:
                    location.pathname === link.to ? "translateY(-2px)" : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#478bd6",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 0 #000",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                    boxShadow: "0 2px 0 #000",
                  },
                }}
              >
                {link.icon}
                <Typography sx={{ fontFamily: "inherit" }}>
                  {link.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
