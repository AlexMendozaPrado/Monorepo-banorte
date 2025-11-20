'use client';

import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { AnalyzePage } from '../components/AnalyzePage';
import { HistoryPage } from '../components/HistoryPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AppPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="bg-surface1 rounded-lg p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-textPrimary mb-4">
          Análisis de Sentimientos
        </h1>
        <p className="text-textSecondary mb-6">
          Analiza documentos PDF para obtener insights sobre el sentimiento y emociones de tus clientes
        </p>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface1 rounded-lg p-6 shadow-sm border border-borderLight text-center">
            <UploadIcon sx={{ fontSize: 40, color: '#EB0029', mb: 1 }} />
            <h3 className="text-lg font-semibold text-textPrimary mb-2">
              Carga Documentos
            </h3>
            <p className="text-sm text-textSecondary">
              Sube archivos PDF para análisis automático
            </p>
          </div>

          <div className="bg-surface1 rounded-lg p-6 shadow-sm border border-borderLight text-center">
            <AnalyticsIcon sx={{ fontSize: 40, color: '#6CC04A', mb: 1 }} />
            <h3 className="text-lg font-semibold text-textPrimary mb-2">
              Análisis IA
            </h3>
            <p className="text-sm text-textSecondary">
              Powered by OpenAI GPT-4 para máxima precisión
            </p>
          </div>

          <div className="bg-surface1 rounded-lg p-6 shadow-sm border border-borderLight text-center">
            <AssessmentIcon sx={{ fontSize: 40, color: '#FFA400', mb: 1 }} />
            <h3 className="text-lg font-semibold text-textPrimary mb-2">
              Métricas Detalladas
            </h3>
            <p className="text-sm text-textSecondary">
              Sentimientos, emociones y métricas de texto
            </p>
          </div>

          <div className="bg-surface1 rounded-lg p-6 shadow-sm border border-borderLight text-center">
            <HistoryIcon sx={{ fontSize: 40, color: '#323E48', mb: 1 }} />
            <h3 className="text-lg font-semibold text-textPrimary mb-2">
              Historial
            </h3>
            <p className="text-sm text-textSecondary">
              Consulta y exporta análisis previos
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-borderDashed">
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="navigation tabs">
            <Tab
              label="Analizar Documento"
              icon={<UploadIcon />}
              iconPosition="start"
              id="simple-tab-0"
              aria-controls="simple-tabpanel-0"
            />
            <Tab
              label="Historial de Análisis"
              icon={<HistoryIcon />}
              iconPosition="start"
              id="simple-tab-1"
              aria-controls="simple-tabpanel-1"
            />
          </Tabs>
        </div>
      </div>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <AnalyzePage />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <HistoryPage />
      </TabPanel>
    </div>
  );
}
