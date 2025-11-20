"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";

export default function EmptyState() {
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
        textAlign: "center",
        backgroundColor: "#fafafa"
      }}
    >
      <PictureAsPdf sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Sube un PDF para visualizar
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Selecciona un archivo PDF para comenzar el análisis
      </Typography>
    </Paper>
  );
}
