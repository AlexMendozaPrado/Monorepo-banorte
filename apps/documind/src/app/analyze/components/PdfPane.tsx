"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js";
}

interface PdfPaneProps {
  fileUrl: string | null;
}

export default function PdfPane({ fileUrl }: PdfPaneProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (fileUrl) {
      setPageNumber(1);
      setLoading(true);
    }
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  if (!fileUrl) {
    return null;
  }

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
      {/* PDF Navigation */}
      {numPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            borderBottom: 1,
            borderColor: "divider",
            gap: 2
          }}
        >
          <IconButton
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
          <Typography variant="body2">
            Página {pageNumber} de {numPages}
          </Typography>
          <IconButton
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            size="small"
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* PDF Viewer */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 2,
          backgroundColor: "#f5f5f5"
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <Typography variant="body2" color="text.secondary">
              Cargando PDF...
            </Typography>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={600}
            loading={
              <Typography variant="body2" color="text.secondary">
                Cargando página...
              </Typography>
            }
          />
        </Document>
      </Box>
    </Paper>
  );
}
