"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Keyword } from "@/core/domain/documents/Keyword";

interface KeywordsPaneProps {
  keywords: Keyword[];
}

export default function KeywordsPane({ keywords }: KeywordsPaneProps) {
  const [formValues, setFormValues] = useState<Record<number, string>>({});

  useEffect(() => {
    const initialValues: Record<number, string> = {};
    keywords.forEach((keyword, index) => {
      initialValues[index] = keyword.phrase;
    });
    setFormValues(initialValues);
  }, [keywords]);

  const handleChange = (index: number, value: string) => {
    setFormValues((prev) => ({ ...prev, [index]: value }));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SearchIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Palabras Clave
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Edita las palabras clave extraídas del documento
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Los campos son editables para permitir ajustes manuales.
        </Typography>
      </Box>

      {/* Keywords Content */}
      <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
        {keywords.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              gap: 2
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: "text.disabled" }} />
            <Typography variant="h6" color="text.secondary">
              No hay palabras clave
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sube un documento PDF para comenzar el análisis
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="text.primary">
                Palabras Clave Extraídas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {keywords.length} palabra{keywords.length !== 1 ? 's' : ''} encontrada{keywords.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              {keywords.map((keyword, index) => (
                <TextField
                  key={index}
                  label={keyword.kind ?? `Palabra Clave ${index + 1}`}
                  value={formValues[index] ?? ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Ingresa ${keyword.kind?.toLowerCase() ?? 'palabra clave'}...`}
                  fullWidth
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}
