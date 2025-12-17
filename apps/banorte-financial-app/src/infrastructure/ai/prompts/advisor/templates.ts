import { FinancialContext } from '@/core/domain/ports/ai-services/IFinancialAdvisorPort';
import { Message } from '@/core/domain/entities/advisor/Message';

export function buildConversationContext(context: FinancialContext): string {
  const parts: string[] = [];

  if (context.monthlyIncome) {
    parts.push(`Ingreso mensual: $${context.monthlyIncome.toLocaleString('es-MX')}`);
  }

  if (context.monthlyExpenses) {
    parts.push(`Gastos mensuales: $${context.monthlyExpenses.toLocaleString('es-MX')}`);
  }

  if (context.totalDebt) {
    parts.push(`Deuda total: $${context.totalDebt.toLocaleString('es-MX')}`);
  }

  if (context.totalSavings) {
    parts.push(`Ahorros totales: $${context.totalSavings.toLocaleString('es-MX')}`);
  }

  if (parts.length === 0) {
    return 'Contexto financiero: No disponible (primera interacción)';
  }

  return `Contexto financiero del usuario:\n${parts.join('\n')}`;
}

export function buildConversationHistory(messages: Message[]): string {
  if (messages.length <= 1) return '';

  const history = messages
    .slice(-6) // últimos 6 mensajes (3 intercambios)
    .map(m => `${m.role === 'USER' ? 'Usuario' : 'Norma'}: ${m.content}`)
    .join('\n\n');

  return `\n\nConversación reciente:\n${history}`;
}
