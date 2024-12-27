import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const ErrorPage = ({ message = "Something went wrong" }) => {
  const navigate = useNavigate();

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
      <Typography sx={{ color: "white", mb: 3 }}>{message}</Typography>
      <Button
        className="cartoon-button"
        onClick={() => navigate("/configurations")}
        variant="contained"
        color="primary"
      >
        Back to Configurations
      </Button>
    </Box>
  );
};
