"use client";

import React from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface UploadBarProps {
  onFileSelect: (file: File) => void;
  loading: boolean;
}

export default function UploadBar({ onFileSelect, loading }: UploadBarProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 4,
        border: "2px dashed #ccc",
        borderRadius: 2,
        backgroundColor: "#fafafa",
        minHeight: 200,
        justifyContent: "center"
      }}
    >
      {loading ? (
        <>
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Analizando documento...
          </Typography>
        </>
      ) : (
        <>
          <CloudUpload sx={{ fontSize: 48, color: "text.secondary" }} />
          <Typography variant="h6" color="text.secondary">
            Arrastra y suelta un PDF aquí
          </Typography>
          <Typography variant="body2" color="text.secondary">
            o
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
          >
            Seleccionar un archivo
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            Formatos de archivo admitidos: PDF
          </Typography>
        </>
      )}
    </Box>
  );
}
