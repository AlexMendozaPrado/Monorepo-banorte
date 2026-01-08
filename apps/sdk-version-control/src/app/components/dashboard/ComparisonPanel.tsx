'use client';

import React from 'react';
import { X, Download, FileText, Check, AlertTriangle, AlertCircle, Calendar, Building2, Home, CheckCircle2 } from 'lucide-react';
import { ComparisonDTO } from '@/core/application/dtos/ComparisonDTO';
import { VersionStatus } from '@/core/domain/value-objects/VersionStatus';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/core/domain/value-objects/ProjectStatus';
import { ENTITY_TYPE_LABELS, ENTITY_TYPE_COLORS } from '@/core/domain/value-objects/EntityType';

interface ComparisonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: ComparisonDTO | null;
  loading?: boolean;
}

const statusStyles: Record<VersionStatus, { bg: string; text: string; icon: typeof Check }> = {
  current: { bg: 'bg-[#6CC04A]/15', text: 'text-[#2E7D32]', icon: Check },
  warning: { bg: 'bg-[#FFA400]/15', text: 'text-[#E65100]', icon: AlertTriangle },
  outdated: { bg: 'bg-[#FF671B]/15', text: 'text-[#C62828]', icon: AlertTriangle },
  critical: { bg: 'bg-[#EB0029]/15', text: 'text-[#C62828]', icon: AlertCircle },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-500', icon: AlertTriangle },
};

function StatusCell({ status }: { status: VersionStatus }) {
  const style = statusStyles[status] || statusStyles.unknown;
  const Icon = style.icon;

  const labels: Record<VersionStatus, string> = {
    current: 'Al día',
    warning: 'Pendiente',
    outdated: 'Desactualizado',
    critical: 'Crítico',
    unknown: 'Desconocido',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}
    >
      <Icon size={12} />
      {labels[status]}
    </div>
  );
}

export function ComparisonPanel({
  isOpen,
  onClose,
  comparison,
  loading,
}: ComparisonPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-banorte-dark">
            Comparación de Servicios
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-banorte-dark hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banorte-red"></div>
            </div>
          ) : comparison ? (
            <div className="min-w-[800px] p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-48 p-4 text-left bg-gray-50 rounded-tl-lg border-b border-gray-200"></th>
                    {comparison.services.map((service) => (
                      <th
                        key={service.id}
                        className="p-4 text-left border-b border-gray-200 min-w-[200px]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                            {service.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-banorte-dark">
                              {service.name}
                            </div>
                            <div className="text-xs font-medium text-banorte-gray bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                              {service.category}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* PROJECT INFORMATION SECTION */}
                  <tr className="bg-gray-50">
                    <td
                      className="p-3 font-bold text-banorte-dark border-b-2 border-gray-300 uppercase tracking-wide"
                      colSpan={comparison.services.length + 1}
                    >
                      Informacion del Proyecto
                    </td>
                  </tr>
                  {/* Project Status */}
                  <tr>
                    <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                      Estado del Proyecto
                    </td>
                    {comparison.services.map((service) => (
                      <td key={service.id} className="p-4 border-b border-gray-100">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: PROJECT_STATUS_COLORS[service.projectStatus] }}
                        >
                          {PROJECT_STATUS_LABELS[service.projectStatus]}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Entity */}
                  <tr>
                    <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                      Entidad
                    </td>
                    {comparison.services.map((service) => (
                      <td key={service.id} className="p-4 border-b border-gray-100">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: ENTITY_TYPE_COLORS[service.entity] }}
                        >
                          {service.entity === 'banco' ? <Building2 size={10} /> : <Home size={10} />}
                          {ENTITY_TYPE_LABELS[service.entity]}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* ASM */}
                  <tr>
                    <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                      ASM
                    </td>
                    {comparison.services.map((service) => (
                      <td key={service.id} className="p-4 border-b border-gray-100">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            service.hasASM ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {service.hasASM && <CheckCircle2 size={10} />}
                          {service.hasASM ? 'Si' : 'No'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Implementation Date */}
                  <tr>
                    <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                      Fecha Implementacion
                    </td>
                    {comparison.services.map((service) => (
                      <td key={service.id} className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-1 text-banorte-dark">
                          <Calendar size={12} />
                          <span className="font-medium">
                            {service.formattedImplementationDate || 'Por confirmar'}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  {/* Responsibles */}
                  <tr>
                    <td className="p-4 font-medium text-banorte-gray border-b-2 border-gray-300">
                      Responsables
                    </td>
                    {comparison.services.map((service) => (
                      <td key={service.id} className="p-4 border-b-2 border-gray-300">
                        <div className="space-y-1 text-xs">
                          {service.responsibles?.map((person, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-bold text-banorte-gray uppercase w-12">
                                {person.role}:
                              </span>
                              <span className="text-banorte-dark truncate">
                                {person.name || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* PLATFORM SECTIONS */}
                  {comparison.matrix.map((row) => (
                    <React.Fragment key={row.platform}>
                      {/* Platform Header */}
                      <tr className="bg-gray-50/50">
                        <td
                          className="p-3 font-bold text-banorte-dark border-b border-gray-100 uppercase"
                          colSpan={comparison.services.length + 1}
                        >
                          {row.platform}
                        </td>
                      </tr>
                      {/* Current Version */}
                      <tr className={row.hasDiscrepancies ? 'bg-yellow-50/50' : ''}>
                        <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                          Versión Actual
                        </td>
                        {row.versions.map((v) => (
                          <td key={v.serviceId} className="p-4 border-b border-gray-100">
                            <div className="font-bold text-banorte-dark">
                              {v.currentVersion}
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Latest Version */}
                      <tr className={row.hasDiscrepancies ? 'bg-yellow-50/50' : ''}>
                        <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                          Última Disponible
                        </td>
                        {row.versions.map((v) => (
                          <td
                            key={v.serviceId}
                            className="p-4 border-b border-gray-100 text-banorte-gray"
                          >
                            {v.latestVersion || '-'}
                          </td>
                        ))}
                      </tr>
                      {/* Status */}
                      <tr className={row.hasDiscrepancies ? 'bg-yellow-50/50' : ''}>
                        <td className="p-4 font-medium text-banorte-gray border-b border-gray-100">
                          Estado
                        </td>
                        {row.versions.map((v) => (
                          <td key={v.serviceId} className="p-4 border-b border-gray-100">
                            <StatusCell status={v.status} />
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Insights */}
              {comparison.insights.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-bold text-banorte-dark">Insights</h3>
                  {comparison.insights.map((insight, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm ${
                        insight.type === 'critical'
                          ? 'bg-red-50 text-red-800'
                          : insight.type === 'warning'
                          ? 'bg-orange-50 text-orange-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {insight.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos de comparación
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between items-center">
          <button className="flex items-center gap-2 text-banorte-gray hover:text-banorte-dark font-medium">
            <Download size={18} />
            Exportar Comparación
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-banorte-red hover:bg-banorte-red-hover text-white rounded-md font-medium transition-colors shadow-sm">
            <FileText size={18} />
            Ver Plan de Homologación
          </button>
        </div>
      </div>
    </div>
  );
}
