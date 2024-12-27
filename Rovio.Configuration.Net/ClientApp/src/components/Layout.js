import React from "react";
import { Box, Toolbar } from "@mui/material";
import { NavMenu } from "./NavMenu";
import StarBackground from "./StarBackground";

export function Layout({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        width: "100%",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
            url('/images/space-background.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          opacity: 0.4, // Reduced opacity to blend better with StarBackground
        },
      }}
    >
      <StarBackground />
      <NavMenu />
      <Toolbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 6,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
