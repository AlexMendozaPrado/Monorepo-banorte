"use client";

import { Box, Typography, CircularProgress, LinearProgress, Skeleton } from "@mui/material";
import CloudUpload from "@mui/icons-material/CloudUpload";
import TextFields from "@mui/icons-material/TextFields";
import Psychology from "@mui/icons-material/Psychology";

export type LoadingStage = 'uploading' | 'extracting' | 'analyzing' | 'complete';

interface LoadingStatesProps {
  stage: LoadingStage;
  progress?: number;
}

const stageConfig = {
  uploading: {
    icon: CloudUpload,
    title: "Subiendo archivo...",
    description: "Preparando documento para análisis",
    step: 1,
    total: 3
  },
  extracting: {
    icon: TextFields,
    title: "Extrayendo texto...",
    description: "Procesando contenido del PDF",
    step: 2,
    total: 3
  },
  analyzing: {
    icon: Psychology,
    title: "Analizando con IA...",
    description: "Generando palabras clave inteligentes",
    step: 3,
    total: 3
  },
  complete: {
    icon: Psychology,
    title: "Análisis completado",
    description: "Palabras clave generadas exitosamente",
    step: 3,
    total: 3
  }
};

export function LoadingProgress({ stage, progress }: LoadingStatesProps) {
  const config = stageConfig[stage];
  const IconComponent = config.icon;
  const progressValue = progress ?? (config.step / config.total) * 100;

  return (
    <Box className="flex flex-col items-center gap-4 p-6">
      {/* Icon with pulse animation */}
      <Box className="relative">
        <Box 
          className="absolute inset-0 rounded-full bg-surface1 animate-pulse"
          sx={{ opacity: 0.3 }}
        />
        <Box 
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface1"
          sx={{ color: 'textPrimary' }}
        >
          <IconComponent sx={{ fontSize: 32 }} />
        </Box>
      </Box>

      {/* Progress bar */}
      <Box className="w-full max-w-xs">
        <LinearProgress 
          variant="determinate" 
          value={progressValue}
          sx={{ 
            height: 6,
            borderRadius: '9999px',
            backgroundColor: 'surface1',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'textPrimary',
              borderRadius: '9999px'
            }
          }} 
        />
      </Box>

      {/* Text */}
      <Box className="text-center">
        <Typography 
          variant="h6" 
          className="text-textPrimary font-bold mb-1"
        >
          {config.title}
        </Typography>
        <Typography 
          variant="body2" 
          className="text-textSecondary"
        >
          {config.description}
        </Typography>
        <Typography 
          variant="caption" 
          className="text-textSecondary mt-2 block"
        >
          Paso {config.step} de {config.total}
        </Typography>
      </Box>
    </Box>
  );
}

export function KeywordsSkeleton() {
  return (
    <Box className="flex flex-wrap gap-3 p-4">
      {[...Array(12)].map((_, i) => (
        <Skeleton 
          key={i}
          variant="rounded" 
          width={Math.random() * 80 + 60} 
          height={32}
          sx={{ 
            borderRadius: '9999px', 
            bgcolor: 'surface1',
            opacity: 0.6
          }}
          animation="wave"
        />
      ))}
    </Box>
  );
}

export function UploadingOverlay() {
  return (
    <Box 
      className="absolute inset-0 bg-primary bg-opacity-80 flex items-center justify-center rounded-xl"
      sx={{ backdropFilter: 'blur(4px)' }}
    >
      <Box className="flex flex-col items-center gap-3">
        <CircularProgress 
          size={48} 
          sx={{ color: 'textPrimary' }} 
        />
        <Typography 
          variant="body1" 
          className="text-textPrimary font-medium"
        >
          Procesando archivo...
        </Typography>
      </Box>
    </Box>
  );
}
