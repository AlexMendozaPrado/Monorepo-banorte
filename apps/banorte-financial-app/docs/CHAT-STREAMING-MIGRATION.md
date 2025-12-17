# Plan: Migración del Chat de Norma a Vercel AI SDK con Streaming

> **Fecha:** 2025-12-16
> **Autor:** Claude Code
> **Estado:** En implementación

## Resumen

Migrar el chat del asesor financiero (Norma) en `/asesor` de un sistema con fetch tradicional a Vercel AI SDK con streaming en tiempo real para resolver:
- Errores de API / no responde
- Respuestas lentas (sin streaming)
- Mejor experiencia de usuario

## Archivos a Modificar/Crear

| Acción | Archivo |
|--------|---------|
| MODIFICAR | `package.json` |
| CREAR | `src/app/api/advisor/stream/route.ts` |
| CREAR | `src/app/hooks/useAdvisorChat.ts` |
| MODIFICAR | `src/app/pages/AdvisorModule.tsx` |
| MODIFICAR | `src/app/api/advisor/chat/route.ts` (deprecation) |

## Arquitectura

### Antes (Sin Streaming)
```
AdvisorModule.tsx
    │
    ▼
useAdvisor.ts (fetch tradicional)
    │
    ▼
/api/advisor/chat (POST → espera respuesta completa)
    │
    ▼
SendMessageUseCase → OpenAIFinancialAdvisor
    │
    ▼
Respuesta JSON completa → UI actualiza al final
```

### Después (Con Streaming)
```
AdvisorModule.tsx
    │
    ▼
useAdvisorChat.ts (useChat de Vercel AI SDK)
    │
    ▼
/api/advisor/stream (POST con streaming)
    │
    ▼
streamText() + openai('gpt-4o-mini')
    │
    ▼
Streaming response → UI actualiza en tiempo real
```

## Dependencias Nuevas

```json
{
  "ai": "^5.0.82",
  "@ai-sdk/openai": "^2.0.57",
  "@ai-sdk/react": "^2.0.82"
}
```

## Implementación

### 1. Ruta API con Streaming (`/api/advisor/stream/route.ts`)

Características:
- Usa `streamText` de `ai` para generar respuestas
- Usa `openai('gpt-4o-mini')` de `@ai-sdk/openai`
- Retorna `result.toUIMessageStreamResponse()` para compatibilidad con useChat
- Incluye contexto financiero en el system prompt
- Reutiliza `FINANCIAL_ADVISOR_SYSTEM_PROMPT` existente

### 2. Hook con useChat (`useAdvisorChat.ts`)

Características:
- Usa `useChat` de `@ai-sdk/react`
- Configura endpoint `/api/advisor/stream`
- Incluye mensaje de bienvenida como `initialMessages`
- Expone: `messages`, `sendMessage`, `isLoading`, `isStreaming`, `error`, `clearConversation`

### 3. Actualización de AdvisorModule.tsx

Cambios:
- Reemplaza `useAdvisor` por `useAdvisorChat`
- Elimina estado duplicado (`localMessages` vs `apiMessages`)
- Convierte formato de mensajes de AI SDK a formato de componentes
- Muestra indicador visual cuando `isStreaming` está activo

## Beneficios

1. **UX mejorada**: Respuestas aparecen palabra por palabra
2. **Menos errores**: useChat maneja estado/errores automáticamente
3. **Código más simple**: Elimina lógica custom de fetch
4. **Consistencia**: Mismo patrón que otras apps del monorepo

## Consideraciones

- **Backward compatibility**: Ruta `/api/advisor/chat` sigue funcionando (deprecated)
- **Sin persistencia DB**: Conversaciones en memoria (OK para MVP)
- **Contexto mockado**: Se mantiene hardcodeado, mejora futura conectar a APIs reales
- **System prompt**: Reutiliza `FINANCIAL_ADVISOR_SYSTEM_PROMPT` existente

## Testing

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Ir a http://localhost:3004/asesor
# Enviar mensaje y verificar que aparece con streaming
```

## Referencia

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [useChat Hook Reference](https://sdk.vercel.ai/docs/reference/ai-sdk-react/use-chat)
- [streamText Reference](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
