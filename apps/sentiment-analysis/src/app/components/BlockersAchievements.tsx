'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Block as BlockerIcon,
  EmojiEvents as AchievementIcon,
  Assignment as ActionIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { SessionMetricsResponse } from '../../shared/types/api';
import { formatDate } from '../../shared/utils/formatters';

interface BlockersAchievementsProps {
  blockers: SessionMetricsResponse['blockers'];
  achievements: SessionMetricsResponse['achievements'];
  actionItems: SessionMetricsResponse['actionItems'];
}

export function BlockersAchievements({ blockers, achievements, actionItems }: BlockersAchievementsProps) {
  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    if (priority === 'high') return '#EB0029'; // primary red
    if (priority === 'medium') return '#FFA400'; // warning orange
    return '#6CC04A'; // success green
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low'): string => {
    if (priority === 'high') return '🔴';
    if (priority === 'medium') return '🟡';
    return '🟢';
  };

  const getImpactIcon = (impact: 'high' | 'medium' | 'low'): string => {
    if (impact === 'high') return '🏆';
    if (impact === 'medium') return '⭐';
    return '✓';
  };

  const getStatusColor = (status: 'active' | 'resolved' | 'pending' | 'in_progress' | 'completed'): string => {
    if (status === 'completed' || status === 'resolved') return '#6CC04A';
    if (status === 'in_progress') return '#FFA400';
    return '#5B6670';
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Blockers Section */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BlockerIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">
                  Blockers ({blockers.length})
                </Typography>
              </Box>

              {blockers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se identificaron blockers en esta sesión
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {blockers.map((blocker, idx) => (
                    <Box key={blocker.id}>
                      {idx > 0 && <Divider sx={{ my: 1 }} />}
                      <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                              {getPriorityIcon(blocker.priority)}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Chip
                                  label={blocker.priority.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: getPriorityColor(blocker.priority),
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Chip
                                  label={blocker.status}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: getStatusColor(blocker.status),
                                    color: getStatusColor(blocker.status),
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {blocker.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Menciones: {blocker.mentions} • Detectado: {formatDate(blocker.firstMentioned)}
                              </Typography>
                              {blocker.context && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                  Contexto: {blocker.context}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements Section */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AchievementIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">
                  Logros ({achievements.length})
                </Typography>
              </Box>

              {achievements.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se identificaron logros en esta sesión
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {achievements.map((achievement, idx) => (
                    <Box key={achievement.id}>
                      {idx > 0 && <Divider sx={{ my: 1 }} />}
                      <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                              {getImpactIcon(achievement.impact)}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Chip
                                  label={`${achievement.impact.toUpperCase()} IMPACTO`}
                                  size="small"
                                  sx={{
                                    bgcolor: getPriorityColor(achievement.impact),
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                  }}
                                />
                                <Chip
                                  label={`Sentiment: ${achievement.sentiment}/7`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: '#6CC04A',
                                    color: '#6CC04A',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {achievement.description}
                              </Typography>
                              {achievement.metric && achievement.value && (
                                <Typography variant="caption" color="text.secondary">
                                  {achievement.metric}: {achievement.value}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Items Section */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ActionIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">
                  Acciones Pendientes ({actionItems.filter(a => a.status === 'pending').length}/{actionItems.length})
                </Typography>
              </Box>

              {actionItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se identificaron acciones pendientes
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {actionItems.map((action) => (
                    <Grid item xs={12} sm={6} md={4} key={action.id}>
                      <Box
                        sx={{
                          p: 2,
                          borderLeft: `4px solid ${getPriorityColor(action.priority)}`,
                          bgcolor: '#f5f5f5',
                          borderRadius: 1,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CircleIcon
                            sx={{
                              fontSize: 12,
                              color: getStatusColor(action.status),
                            }}
                          />
                          <Chip
                            label={action.priority}
                            size="small"
                            sx={{
                              bgcolor: getPriorityColor(action.priority),
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                          <Chip
                            label={action.status}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getStatusColor(action.status),
                              color: getStatusColor(action.status),
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {action.description}
                        </Typography>
                        {action.assignee && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Asignado a: {action.assignee}
                          </Typography>
                        )}
                        {action.deadline && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Fecha límite: {action.deadline}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
