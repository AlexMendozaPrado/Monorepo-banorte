"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, IconButton, Typography, Paper, Tooltip } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ZoomOut from "@mui/icons-material/ZoomOut";
import Fullscreen from "@mui/icons-material/Fullscreen";
import Download from "@mui/icons-material/Download";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PDFViewerProps {
  fileUrl: string | null;
  fileName?: string;
}

export default function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileUrl) {
      setPageNumber(1);
      setScale(1.0);
      setError(null);
    }
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError("Error al cargar el PDF");
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const downloadPDF = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'documento.pdf';
      link.click();
    }
  };

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
      {/* Toolbar */}
      <Box 
        className="flex items-center justify-between p-2 border-b"
        sx={{ borderColor: 'surface2', backgroundColor: 'surface2' }}
      >
        {/* Navigation */}
        <Box className="flex items-center gap-1">
          <Tooltip title="Página anterior">
            <IconButton
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              size="small"
              sx={{ color: 'textPrimary' }}
            >
              <ChevronLeft />
            </IconButton>
          </Tooltip>
          
          <Typography variant="body2" className="text-textPrimary px-2 min-w-[80px] text-center">
            {numPages > 0 ? `${pageNumber} / ${numPages}` : '--'}
          </Typography>
          
          <Tooltip title="Página siguiente">
            <IconButton
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              size="small"
              sx={{ color: 'textPrimary' }}
            >
              <ChevronRight />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Zoom Controls */}
        <Box className="flex items-center gap-1">
          <Tooltip title="Alejar">
            <IconButton
              onClick={zoomOut}
              disabled={scale <= 0.5}
              size="small"
              sx={{ color: 'textPrimary' }}
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>
          
          <Typography variant="caption" className="text-textSecondary px-2 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </Typography>
          
          <Tooltip title="Acercar">
            <IconButton
              onClick={zoomIn}
              disabled={scale >= 3.0}
              size="small"
              sx={{ color: 'textPrimary' }}
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Actions */}
        <Box className="flex items-center gap-1">
          <Tooltip title="Descargar PDF">
            <IconButton
              onClick={downloadPDF}
              size="small"
              sx={{ color: 'textPrimary' }}
            >
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* PDF Content */}
      <Box 
        className="flex-1 overflow-auto flex justify-center items-start p-4"
        sx={{ backgroundColor: '#f5f5f5' }}
      >
        {error ? (
          <Box className="text-center">
            <Typography variant="body1" color="error" gutterBottom>
              {error}
            </Typography>
            <Typography variant="body2" className="text-textSecondary">
              Verifica que el archivo sea un PDF válido
            </Typography>
          </Box>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <Typography variant="body2" className="text-textSecondary">
                Cargando PDF...
              </Typography>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={
                <Typography variant="body2" className="text-textSecondary">
                  Cargando página...
                </Typography>
              }
              className="shadow-lg"
            />
          </Document>
        )}
      </Box>
    </Paper>
  );
}
