'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SessionMetricsResponse } from '../../shared/types/api';

interface EmotionalTimelineProps {
  timeline: SessionMetricsResponse['emotionalTimeline'];
}

export function EmotionalTimeline({ timeline }: EmotionalTimelineProps) {
  // Transform timeline data for recharts
  const chartData = timeline.map((point) => ({
    timestamp: `${point.timestamp}%`,
    sentiment: point.sentiment,
    event: point.event,
    context: point.context,
  }));

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 6) return '#6CC04A'; // green
    if (sentiment >= 5) return '#FFA400'; // orange
    if (sentiment >= 4) return '#FFD54F'; // yellow
    if (sentiment >= 3) return '#FF671B'; // red-orange
    return '#EB0029'; // red
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Timeline Emocional de la Sesión
          </Typography>
        </Box>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              label={{ value: 'Progreso de la Sesión', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              domain={[0, 7]}
              ticks={[1, 2, 3, 4, 5, 6, 7]}
              label={{ value: 'Sentimiento (1-7)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Box
                      sx={{
                        bgcolor: 'white',
                        p: 2,
                        border: '1px solid #D1D5DB',
                        borderRadius: 1,
                        boxShadow: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {data.event}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.context}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: getSentimentColor(data.sentiment) }}>
                        Sentimiento: {data.sentiment}/7
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#EB0029"
              strokeWidth={3}
              dot={{ r: 6, fill: '#EB0029' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Timeline Points */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Eventos Clave:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            {timeline.map((point, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 1.5,
                  borderLeft: `4px solid ${getSentimentColor(point.sentiment)}`,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    minWidth: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: getSentimentColor(point.sentiment),
                    color: 'white',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    fontWeight: 'bold',
                  }}
                >
                  {point.sentiment}/7
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {point.event}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {point.context}
                  </Typography>
                  {point.participants && point.participants.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Participantes: {point.participants.join(', ')}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
