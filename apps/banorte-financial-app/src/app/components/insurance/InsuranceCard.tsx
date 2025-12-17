'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, FileText, Phone, AlertCircle } from 'lucide-react';

interface InsuranceCardProps {
  type: string;
  insurer: string;
  policyNumber: string;
  premium: number;
  sumInsured: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
  icon: React.ReactNode;
}

export function InsuranceCard({
  type,
  insurer,
  policyNumber,
  premium,
  sumInsured,
  expiryDate,
  status,
  icon,
}: InsuranceCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    expiring: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    expired: 'bg-red-100 text-red-700 border-red-200',
  };
  const statusLabels = {
    active: 'Vigente',
    expiring: 'Por vencer',
    expired: 'Vencido',
  };

  return (
    <Card hoverEffect className="relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg text-banorte-gray border border-gray-100">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-banorte-dark text-sm">{type}</h3>
            <p className="text-xs text-gray-500">{insurer}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded border ${statusColors[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Póliza</span>
          <span className="font-medium text-banorte-dark">{policyNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Suma Asegurada</span>
          <span className="font-medium text-banorte-dark">{sumInsured}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Vigencia</span>
          <span className="font-medium text-banorte-dark">{expiryDate}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="text-gray-500">Prima Anual</span>
          <span className="font-bold text-banorte-dark">
            ${premium.toLocaleString()}
          </span>
        </div>
      </div>

      {status === 'expiring' && (
        <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-4">
          <AlertCircle size={14} />
          <span>Renueva antes del {expiryDate}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" className="px-2 text-xs">
          <FileText size={14} className="mr-1" />
          Póliza
        </Button>
        <Button variant="outline" size="sm" className="px-2 text-xs">
          <Shield size={14} className="mr-1" />
          Reportar
        </Button>
        <Button variant="outline" size="sm" className="px-2 text-xs">
          <Phone size={14} className="mr-1" />
          Contacto
        </Button>
      </div>
    </Card>
  );
}

