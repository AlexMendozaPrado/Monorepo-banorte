import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { FINANCIAL_ADVISOR_SYSTEM_PROMPT } from '@/infrastructure/ai/prompts/advisor/system';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Contexto financiero del usuario para enriquecer las respuestas de Norma
 */
interface FinancialContext {
  currentBudget?: {
    totalIncome: number;
    spent: number;
    budget: number;
    categories: Array<{ name: string; spent: number; budget: number }>;
  };
  debts?: Array<{
    creditor: string;
    amount: number;
    rate: number;
    type: string;
  }>;
  savingsGoals?: Array<{
    name: string;
    current: number;
    target: number;
    priority: string;
  }>;
}

interface ChatRequestBody {
  messages: UIMessage[];
  userId?: string;
  context?: FinancialContext;
}

/**
 * Construye el contexto financiero como string para el system prompt
 */
function buildFinancialContext(context?: FinancialContext): string {
  if (!context) return '';

  const parts: string[] = [];

  if (context.currentBudget) {
    const { totalIncome, spent, budget, categories } = context.currentBudget;
    parts.push(`
### Presupuesto Actual del Usuario
- Ingreso mensual: $${totalIncome.toLocaleString('es-MX')}
- Gastado este mes: $${spent.toLocaleString('es-MX')}
- Presupuesto total: $${budget.toLocaleString('es-MX')}
- Restante: $${(budget - spent).toLocaleString('es-MX')}

Desglose por categorías:
${categories.map(c => `- ${c.name}: $${c.spent.toLocaleString('es-MX')} de $${c.budget.toLocaleString('es-MX')} (${Math.round((c.spent / c.budget) * 100)}% usado)`).join('\n')}
`);
  }

  if (context.debts && context.debts.length > 0) {
    const totalDebt = context.debts.reduce((sum, d) => sum + d.amount, 0);
    parts.push(`
### Deudas Activas del Usuario
Deuda total: $${totalDebt.toLocaleString('es-MX')}

${context.debts.map(d => `- ${d.creditor}: $${d.amount.toLocaleString('es-MX')} (${d.rate}% TAE, tipo: ${d.type})`).join('\n')}
`);
  }

  if (context.savingsGoals && context.savingsGoals.length > 0) {
    parts.push(`
### Metas de Ahorro del Usuario
${context.savingsGoals.map(g => {
      const progress = Math.round((g.current / g.target) * 100);
      return `- ${g.name}: $${g.current.toLocaleString('es-MX')} de $${g.target.toLocaleString('es-MX')} (${progress}% completado, prioridad: ${g.priority})`;
    }).join('\n')}
`);
  }

  return parts.length > 0
    ? `\n\n## Contexto Financiero del Usuario\n${parts.join('\n')}`
    : '';
}

/**
 * POST /api/advisor/stream
 *
 * Endpoint de chat con streaming para el asesor financiero Norma.
 * Usa Vercel AI SDK v5 con OpenAI para generar respuestas en tiempo real.
 * Compatible con useChat hook de @ai-sdk/react.
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, context, userId } = body;

    // Validar mensajes
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construir system prompt con contexto financiero
    const financialContext = buildFinancialContext(context);
    const systemPrompt = `${FINANCIAL_ADVISOR_SYSTEM_PROMPT}${financialContext}

IMPORTANTE para esta conversación:
- Responde de forma conversacional y natural
- Usa emojis de forma moderada para hacerla amigable (1-2 por mensaje máximo)
- Si el usuario pregunta sobre sus finanzas, usa el contexto proporcionado arriba
- Mantén respuestas concisas (2-4 párrafos máximo)
- Si no tienes información específica, pregunta al usuario`;

    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[API /advisor/stream] Request:', {
        userId,
        messageCount: messages.length,
        hasContext: !!context,
      });
    }

    // Convertir mensajes al formato del modelo usando AI SDK v5
    const modelMessages = convertToModelMessages(messages);

    // Agregar system message al inicio
    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
      ...modelMessages,
    ];

    // Generar respuesta con streaming usando Vercel AI SDK v5
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: messagesWithSystem,
      temperature: 0.7,
      maxOutputTokens: 1000,
      maxRetries: 2,
      onFinish: ({ text, usage }) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[API /advisor/stream] Stream finished:', {
            textLength: text.length,
            usage,
          });
        }
      },
    });

    // Retornar respuesta compatible con useChat de Vercel AI SDK v5
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[API /advisor/stream] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('API key') ? 401 : 500;

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
