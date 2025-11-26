'use client';

import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';
import { AnalysisResponse } from '../../shared/types/api';

// Dynamically import AnalysisResults with no SSR
const AnalysisResults = dynamic(
  () => import('./AnalysisResults').then((mod) => ({ default: mod.AnalysisResults })),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    ),
  }
);

interface AnalysisResultsDynamicProps {
  analysis: AnalysisResponse & { extendedAnalysis?: any };
}

export function AnalysisResultsDynamic({ analysis }: AnalysisResultsDynamicProps) {
  return <AnalysisResults analysis={analysis} />;
}

