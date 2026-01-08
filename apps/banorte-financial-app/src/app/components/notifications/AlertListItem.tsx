'use client';

import React from 'react';
import {
  CreditCard,
  Landmark,
  Car,
  GraduationCap,
  ShoppingBag,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { PaymentAlertDTO, AlertPriority, AlertStatus } from '@/core/domain/entities/payment/PaymentAlert';
import { DebtType } from '@/core/domain/entities/debt/Debt';

type Variant = 'default' | 'compact' | 'minimal';

interface AlertListItemProps {
  alert: PaymentAlertDTO;
  variant?: Variant;
  isRead?: boolean;
  onMarkAsRead?: () => void;
  onDismiss?: () => void;
  onPayClick?: () => void;
  onViewClick?: () => void;
}

const debtTypeIcons: Record<DebtType, typeof CreditCard> = {
  [DebtType.CREDIT_CARD]: CreditCard,
  [DebtType.PERSONAL_LOAN]: Landmark,
  [DebtType.MORTGAGE]: Landmark,
  [DebtType.AUTO_LOAN]: Car,
  [DebtType.STUDENT_LOAN]: GraduationCap,
  [DebtType.STORE_CREDIT]: ShoppingBag,
  [DebtType.OTHER]: AlertCircle,
};

const priorityStyles: Record<AlertPriority, { bg: string; text: string; border: string; badgeText: string }> = {
  CRITICAL: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-l-red-600',
    badgeText: 'URGENTE',
  },
  HIGH: {
    bg: 'bg-orange-50',
    text: 'text-orange-500',
    border: 'border-l-orange-500',
    badgeText: 'IMPORTANTE',
  },
  MEDIUM: {
    bg: 'bg-blue-50',
    text: 'text-blue-500',
    border: 'border-l-blue-500',
    badgeText: 'PRÓXIMO',
  },
};

const statusLabels: Record<AlertStatus, string> = {
  overdue: 'Vencido',
  urgent: 'Urgente',
  upcoming: 'Próximo',
};

export function AlertListItem({
  alert,
  variant = 'default',
  isRead = false,
  onMarkAsRead,
  onDismiss,
  onPayClick,
  onViewClick,
}: AlertListItemProps) {
  const Icon = debtTypeIcons[alert.debtType] || AlertCircle;
  const priority = priorityStyles[alert.priority];

  if (variant === 'minimal') {
    return (
      <div
        className={`
          flex items-center gap-3 p-2 rounded-lg cursor-pointer
          transition-colors hover:bg-gray-50
          ${!isRead ? 'bg-blue-50/50' : ''}
        `}
        onClick={onMarkAsRead}
      >
        <div className={`p-1.5 rounded-full ${priority.bg}`}>
          <Icon size={14} className={priority.text} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{alert.debtName}</p>
          <p className="text-xs text-gray-500">{alert.timeDescription}</p>
        </div>
        <span className="text-sm font-semibold text-gray-900">{alert.formattedAmount}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`
          flex items-start gap-3 p-3 rounded-xl border-l-4
          transition-colors ${priority.bg} ${priority.border}
          ${!isRead ? 'shadow-sm' : 'opacity-80'}
        `}
      >
        <div className={`p-2 bg-white rounded-lg shadow-sm ${priority.text} flex-shrink-0`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-800">{alert.debtName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{alert.timeDescription}</p>
            </div>
            <div className="flex items-center gap-1">
              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  aria-label="Descartar"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text} border border-current/20`}>
              {priority.badgeText}
            </span>
            <span className="text-sm font-bold text-gray-800">{alert.formattedAmount}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`
        rounded-xl ${priority.bg} border-l-4 ${priority.border} overflow-hidden shadow-sm
        ${!isRead ? '' : 'opacity-80'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={`p-2 bg-white rounded-lg shadow-sm ${priority.text} flex-shrink-0`}>
              <Icon size={18} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-gray-800">{alert.debtName}</h4>
                {alert.priority === 'CRITICAL' && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                    {priority.badgeText}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{alert.timeDescription}</p>
            </div>
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              aria-label="Descartar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Impact section */}
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pago mínimo</p>
              <p className="text-lg font-bold text-gray-800">{alert.formattedAmount}</p>
            </div>
            <div className="flex items-center gap-2">
              {onViewClick && (
                <button
                  onClick={onViewClick}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} />
                  Ver
                </button>
              )}
              {onPayClick && (
                <button
                  onClick={onPayClick}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-banorte-red hover:bg-banorte-red/90 rounded-lg transition-colors"
                >
                  Pagar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
