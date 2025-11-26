'use client';

import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';
import { SessionMetricsResponse } from '../../shared/types/api';

// Dynamically import EmotionalTimeline with no SSR
const EmotionalTimeline = dynamic(
  () => import('./EmotionalTimeline').then((mod) => ({ default: mod.EmotionalTimeline })),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    ),
  }
);

interface EmotionalTimelineDynamicProps {
  timeline: SessionMetricsResponse['emotionalTimeline'];
}

export function EmotionalTimelineDynamic({ timeline }: EmotionalTimelineDynamicProps) {
  return <EmotionalTimeline timeline={timeline} />;
}

