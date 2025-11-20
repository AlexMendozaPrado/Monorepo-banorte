"use client";

import React from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";

export default function LoadingState() {
  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        textAlign: "center"
      }}
    >
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Analizando documento...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Extrayendo texto y generando palabras clave
      </Typography>
    </Paper>
  );
}
