"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Button, Alert, Paper } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

export default function AnalyzePage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setLoading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "generic");

      // Call API
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error analyzing document");
      }

      setKeywords(data.keywords || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error analyzing document");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#121212", p: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" color="white" gutterBottom>
          Banorte - Análisis de Documentos
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Upload Section */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Subir Documento PDF
          </Typography>
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
              disabled={loading}
              size="large"
            >
              {loading ? "Analizando..." : "Seleccionar PDF"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </Button>
          </Box>
        </Paper>

        {/* Keywords Section */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Palabras Clave Extraídas
          </Typography>
          {keywords.length === 0 ? (
            <Typography color="text.secondary">
              No hay palabras clave. Sube un PDF para comenzar el análisis.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {keywords.map((keyword, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: "primary.main",
                    color: "white",
                    borderRadius: 1,
                    fontSize: "0.875rem"
                  }}
                >
                  {keyword.phrase} ({keyword.kind || "other"})
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
