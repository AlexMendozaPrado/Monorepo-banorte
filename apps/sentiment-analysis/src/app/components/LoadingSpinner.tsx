'use client';

import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Card,
  CardContent,
} from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({ 
  message = 'Cargando...', 
  size = 40, 
  fullScreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={true}
      >
        <Card>
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </Backdrop>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

interface AnalysisLoadingProps {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'processing';
}

export function AnalysisLoading({ stage }: AnalysisLoadingProps) {
  const getStageMessage = () => {
    switch (stage) {
      case 'uploading':
        return 'Subiendo archivo...';
      case 'extracting':
        return 'Extrayendo texto del PDF...';
      case 'analyzing':
        return 'Analizando sentimientos con IA...';
      case 'processing':
        return 'Procesando resultados...';
      default:
        return 'Procesando...';
    }
  };

  const getStageProgress = () => {
    switch (stage) {
      case 'uploading':
        return 25;
      case 'extracting':
        return 50;
      case 'analyzing':
        return 75;
      case 'processing':
        return 90;
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress 
            variant="determinate" 
            value={getStageProgress()} 
            size={60}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            {getStageMessage()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Este proceso puede tomar unos momentos...
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
