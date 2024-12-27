import React from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  FormControl,
  FormLabel,
} from "@mui/material";

export function JsonConfigEditor({ config, onUpdate }) {
  if (!config) return null;

  const jsonData =
    typeof config.jsonConfig === "string"
      ? JSON.parse(config.jsonConfig)
      : config.jsonConfig;

  const renderField = (key, value, path = []) => {
    const currentPath = [...path, key];
    const handleChange = (newValue) => {
      let updatedJson = { ...jsonData };
      let current = updatedJson;

      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      current[key] = newValue;

      onUpdate({
        ...config,
        jsonConfig: JSON.stringify(updatedJson),
      });
    };

    if (typeof value === "object" && value !== null) {
      return (
        <Box key={key} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "medium" }}>
            {key}
          </Typography>
          <Box sx={{ pl: 2 }}>
            {Object.entries(value).map(([k, v]) =>
              renderField(k, v, currentPath)
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box key={key} sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <FormLabel sx={{ mb: 1 }}>{key}</FormLabel>
          <TextField
            value={value}
            onChange={(e) =>
              handleChange(
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value
              )
            }
            size="small"
            type={typeof value === "number" ? "number" : "text"}
          />
        </FormControl>
      </Box>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {Object.entries(jsonData).map(([key, value]) => renderField(key, value))}
    </Paper>
  );
}
