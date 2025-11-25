'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Description as SummaryIcon,
  Warning as RiskIcon,
  Lightbulb as OpportunityIcon,
  Assignment as ActionIcon,
  Insights as InsightsIcon,
  Groups as TeamIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { SessionConclusionResponse } from '../../shared/types/api';

interface SessionConclusionProps {
  conclusion: SessionConclusionResponse;
}

export function SessionConclusion({ conclusion }: SessionConclusionProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#6CC04A';
    if (score >= 60) return '#FFA400';
    return '#FF671B';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    if (priority === 'high') return '#EB0029';
    if (priority === 'medium') return '#FFA400';
    return '#6CC04A';
  };

  const getRiskLevelColor = (level: 'high' | 'medium' | 'low'): string => {
    if (level === 'high') return '#EB0029';
    if (level === 'medium') return '#FFA400';
    return '#6CC04A';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SummaryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h5" component="h3">
          Conclusión Ejecutiva
        </Typography>
      </Box>

      {/* Executive Summary */}
      <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Resumen Ejecutivo
          </Typography>
          <Typography variant="body1" paragraph>
            {conclusion.executiveSummary}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Score General de Sesión
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: getScoreColor(conclusion.overallScore) }}>
              {conclusion.overallScore}/100
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={conclusion.overallScore}
            sx={{
              mt: 2,
              height: 10,
              borderRadius: 5,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor(conclusion.overallScore),
              },
            }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nivel de Satisfacción: {conclusion.satisfactionScore}/100
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Risks */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RiskIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">
                  Riesgos Identificados ({conclusion.risks.length})
                </Typography>
              </Box>

              {conclusion.risks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se identificaron riesgos significativos
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {conclusion.risks.map((risk) => (
                    <Box
                      key={risk.id}
                      sx={{
                        p: 2,
                        borderLeft: `4px solid ${getRiskLevelColor(risk.level)}`,
                        bgcolor: risk.level === 'high' ? '#ffebee' : risk.level === 'medium' ? '#fff3e0' : '#e8f5e9',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={risk.level.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getRiskLevelColor(risk.level),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {risk.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Impacto:</strong> {risk.impact}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        <strong>Recomendación:</strong> {risk.recommendation}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Opportunities */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <OpportunityIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">
                  Oportunidades ({conclusion.opportunities.length})
                </Typography>
              </Box>

              {conclusion.opportunities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se identificaron oportunidades
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {conclusion.opportunities.map((opportunity) => (
                    <Box
                      key={opportunity.id}
                      sx={{
                        p: 2,
                        borderLeft: `4px solid ${getPriorityColor(opportunity.priority)}`,
                        bgcolor: '#e8f5e9',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`${opportunity.priority.toUpperCase()} PRIORIDAD`}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(opportunity.priority),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Chip
                          label={`${opportunity.effort.toUpperCase()} ESFUERZO`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#6CC04A',
                            color: '#6CC04A',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {opportunity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Valor Potencial:</strong> {opportunity.potentialValue}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Plan */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ActionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Plan de Acción
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Immediate Actions */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#EB0029' }}>
                      Inmediato (24-48h)
                    </Typography>
                    {conclusion.actionPlan.immediate.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Sin acciones inmediatas
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {conclusion.actionPlan.immediate.map((action) => (
                          <Box key={action.id}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              • {action.description}
                            </Typography>
                            <Chip
                              label={action.priority}
                              size="small"
                              sx={{
                                bgcolor: getPriorityColor(action.priority),
                                color: 'white',
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Short Term Actions */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#FFA400' }}>
                      Corto Plazo (1 semana)
                    </Typography>
                    {conclusion.actionPlan.shortTerm.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Sin acciones a corto plazo
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {conclusion.actionPlan.shortTerm.map((action) => (
                          <Box key={action.id}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              • {action.description}
                            </Typography>
                            <Chip
                              label={action.priority}
                              size="small"
                              sx={{
                                bgcolor: getPriorityColor(action.priority),
                                color: 'white',
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Continuous Actions */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#6CC04A' }}>
                      Continuo
                    </Typography>
                    {conclusion.actionPlan.continuous.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Sin acciones continuas
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {conclusion.actionPlan.continuous.map((action) => (
                          <Box key={action.id}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              • {action.description}
                            </Typography>
                            <Chip
                              label={action.priority}
                              size="small"
                              sx={{
                                bgcolor: getPriorityColor(action.priority),
                                color: 'white',
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InsightsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">
                  Insights por Stakeholder
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 'bold' }}>Para Account Manager</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {conclusion.insights.forAccountManager.map((insight, idx) => (
                          <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                            {insight}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 'bold' }}>Para Equipo Técnico</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {conclusion.insights.forTechnicalTeam.map((insight, idx) => (
                          <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                            {insight}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 'bold' }}>Para Management</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {conclusion.insights.forManagement.map((insight, idx) => (
                          <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                            {insight}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Climate */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TeamIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">
                  Clima del Equipo
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Moral
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={conclusion.teamClimate.moral}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(conclusion.teamClimate.moral),
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '50px' }}>
                      {conclusion.teamClimate.moral}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Colaboración
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={conclusion.teamClimate.collaboration}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(conclusion.teamClimate.collaboration),
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '50px' }}>
                      {conclusion.teamClimate.collaboration}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Proactividad
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={conclusion.teamClimate.proactivity}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(conclusion.teamClimate.proactivity),
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '50px' }}>
                      {conclusion.teamClimate.proactivity}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>General</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={conclusion.teamClimate.overall}
                      sx={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(conclusion.teamClimate.overall),
                        },
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', minWidth: '50px', color: getScoreColor(conclusion.teamClimate.overall) }}>
                      {conclusion.teamClimate.overall}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations & Next Steps */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">
                  Recomendaciones y Próximos Pasos
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Recomendaciones:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0, mb: 2 }}>
                {conclusion.recommendations.map((rec, idx) => (
                  <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                    {rec}
                  </Typography>
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Próximos Pasos:
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                {conclusion.nextSteps.map((step, idx) => (
                  <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                    {step}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
