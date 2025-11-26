'use client';

import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';
import { SessionTrendsResponse } from '../../shared/types/api';

// Dynamically import SessionTrends with no SSR
const SessionTrends = dynamic(
  () => import('./SessionTrends').then((mod) => ({ default: mod.SessionTrends })),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    ),
  }
);

interface SessionTrendsDynamicProps {
  trends: SessionTrendsResponse;
}

export function SessionTrendsDynamic({ trends }: SessionTrendsDynamicProps) {
  return <SessionTrends trends={trends} />;
}

