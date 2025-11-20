"use client";

import React, { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";

interface SimplePDFViewerProps {
  fileUrl: string | null;
  fileName?: string;
}

export default function SimplePDFViewer({ fileUrl, fileName }: SimplePDFViewerProps) {
  if (!fileUrl) {
    return (
      <Paper 
        className="h-full flex items-center justify-center"
        sx={{ backgroundColor: 'surface1', minHeight: 400 }}
      >
        <Typography variant="body1" className="text-textSecondary">
          Selecciona un PDF para visualizar
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      className="h-full flex flex-col overflow-hidden"
      sx={{ backgroundColor: 'surface1' }}
    >
      {/* Header */}
      <Box 
        className="flex items-center justify-between p-3 border-b"
        sx={{ borderColor: 'surface2', backgroundColor: 'surface2' }}
      >
        <Typography variant="h6" className="text-textPrimary">
          {fileName || 'Documento PDF'}
        </Typography>
        <Typography variant="caption" className="text-textSecondary">
          Vista previa
        </Typography>
      </Box>

      {/* PDF Embed */}
      <Box className="flex-1 overflow-hidden">
        <iframe
          src={fileUrl}
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '500px' }}
          title="PDF Viewer"
        />
      </Box>
    </Paper>
  );
}
