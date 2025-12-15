'use client';

import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { ProgressBar } from './components/ui/ProgressBar';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
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
                  <CardTitle>Componentes UI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-status-success">
                    <CheckCircle size={20} />
                    <span className="font-medium">6 Componentes</span>
                  </div>
                  <p className="mt-2 text-sm text-banorte-gray">
                    Button, Card, Input, ProgressBar, Modal, Stepper
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Value Objects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-status-success">
                    <CheckCircle size={20} />
                    <span className="font-medium">7 Value Objects</span>
                  </div>
                  <p className="mt-2 text-sm text-banorte-gray">
                    Money, Percentage, InterestRate, CreditScore y más
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
                    <ProgressBar value={100} color="success" size="sm" showPercentage={false} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Application Layer</span>
                      <span className="text-sm text-status-success">Completado</span>
                    </div>
                    <ProgressBar value={100} color="success" size="sm" showPercentage={false} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Infrastructure Layer</span>
                      <span className="text-sm text-status-success">Completado</span>
                    </div>
                    <ProgressBar value={100} color="success" size="sm" showPercentage={false} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Presentation Layer</span>
                      <span className="text-sm text-status-success">Completado</span>
                    </div>
                    <ProgressBar value={100} color="success" size="sm" showPercentage={false} />
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
                    <AlertCircle className="text-status-warning mt-0.5" size={20} />
                    <div>
                      <p className="font-medium">Configurar variables de entorno</p>
                      <p className="text-sm text-banorte-gray">
                        Copia .env.example a .env.local y configura tus API keys
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-status-warning mt-0.5" size={20} />
                    <div>
                      <p className="font-medium">Implementar Use Cases</p>
                      <p className="text-sm text-banorte-gray">
                        Continúa con el Prompt 2 para agregar la lógica de negocio
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 animate-in">
              <Button variant="primary">Comenzar Tutorial</Button>
              <Button variant="outline">Ver Documentación</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
