'use client';

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BudgetModule } from './pages/BudgetModule';
import { Button, Card, CardHeader, CardTitle, CardContent, ProgressBar } from '@banorte/ui';
import { CheckCircle, AlertCircle } from 'lucide-react';

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <div className="max-w-2xl mx-auto">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-banorte-dark mb-2">{title}</h2>
      <p className="text-banorte-gray">Esta sección estará disponible próximamente</p>
    </div>
  </div>
);

const DashboardView = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Welcome Section */}
    <div className="animate-in">
      <h1 className="text-3xl font-bold text-banorte-dark mb-2">
        Bienvenido a Banorte Financial Advisor
      </h1>
      <p className="text-banorte-gray">
        Tu asistente financiero inteligente está listo para ayudarte
      </p>
    </div>

    {/* Status Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in">
      <Card>
        <CardHeader>
          <CardTitle>Clean Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-status-success">
            <CheckCircle size={20} />
            <span className="font-medium">Implementada</span>
          </div>
          <p className="mt-2 text-sm text-banorte-gray">
            Domain, Application e Infrastructure layers configuradas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Módulo de Presupuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-status-success">
            <CheckCircle size={20} />
            <span className="font-medium">Completado</span>
          </div>
          <p className="mt-2 text-sm text-banorte-gray">
            Backend, API Routes, Hooks y UI Components listos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Componentes UI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-status-success">
            <CheckCircle size={20} />
            <span className="font-medium">12+ Componentes</span>
          </div>
          <p className="mt-2 text-sm text-banorte-gray">
            Button, Card, Input, ProgressBar, Modal y más
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Architecture Overview */}
    <Card className="animate-in">
      <CardHeader>
        <CardTitle>Arquitectura del Proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Domain Layer</span>
              <span className="text-sm text-status-success">Completado</span>
            </div>
            <ProgressBar value={100} color="success" height="sm" showLabel={false} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Application Layer</span>
              <span className="text-sm text-status-success">Completado</span>
            </div>
            <ProgressBar value={100} color="success" height="sm" showLabel={false} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Infrastructure Layer</span>
              <span className="text-sm text-status-success">Completado</span>
            </div>
            <ProgressBar value={100} color="success" height="sm" showLabel={false} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Presentation Layer</span>
              <span className="text-sm text-status-success">Completado</span>
            </div>
            <ProgressBar value={100} color="success" height="sm" showLabel={false} />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Next Steps */}
    <Card className="animate-in">
      <CardHeader>
        <CardTitle>Próximos Pasos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-status-success mt-0.5" size={20} />
            <div>
              <p className="font-medium">Módulo de Presupuestos</p>
              <p className="text-sm text-banorte-gray">
                ✅ Completado - Navega a "Presupuestos" para probarlo
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-status-warning mt-0.5" size={20} />
            <div>
              <p className="font-medium">Configurar OpenAI (Opcional)</p>
              <p className="text-sm text-banorte-gray">
                Agrega OPENAI_API_KEY a .env.local para análisis de gastos hormiga con IA
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'presupuestos':
        return <BudgetModule />;
      case 'investments':
        return <PlaceholderView title="Inversiones" />;
      case 'credit':
        return <PlaceholderView title="Créditos" />;
      case 'goals':
        return <PlaceholderView title="Metas" />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

