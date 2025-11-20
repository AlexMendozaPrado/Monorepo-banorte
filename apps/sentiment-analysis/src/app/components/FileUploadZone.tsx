'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatFileSize } from '../../shared/utils/formatters';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export function FileUploadZone({ onFileSelect, selectedFile, disabled }: FileUploadZoneProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          setUploadError('El archivo es demasiado grande. Máximo 10MB permitido.');
        } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
          setUploadError('Tipo de archivo no válido. Solo se permiten archivos PDF.');
        } else {
          setUploadError('Error al cargar el archivo. Inténtalo de nuevo.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled,
  });

  const handleRemoveFile = () => {
    setUploadError(null);
    onFileSelect(null as any);
  };

  return (
    <Box>
      {!selectedFile ? (
        <Paper
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main',
              backgroundColor: disabled ? 'background.paper' : 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: isDragActive ? 'primary.main' : 'grey.400',
              mb: 2,
            }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? 'Suelta el archivo aquí'
              : 'Arrastra un archivo PDF aquí o haz clic para seleccionar'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Archivos PDF únicamente, máximo 10MB
          </Typography>
          <Button variant="outlined" disabled={disabled}>
            Seleccionar Archivo
          </Button>
        </Paper>
      ) : (
        <Paper
          sx={{
            border: '1px solid',
            borderColor: 'success.main',
            borderRadius: 2,
            p: 3,
            backgroundColor: 'success.50',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <PdfIcon sx={{ color: 'error.main', mr: 2, fontSize: 32 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {selectedFile.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={formatFileSize(selectedFile.size)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="PDF"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              Remover
            </Button>
          </Box>
        </Paper>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}
    </Box>
  );
}
