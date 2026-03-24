import { NextResponse } from 'next/server';

/**
 * Endpoint de verificación de salud
 *
 * Utilizado por OpenShift/Kubernetes para:
 * - Sonda de vivacidad: ¿Está la aplicación ejecutándose?
 * - Sonda de disponibilidad: ¿Está la aplicación lista para aceptar tráfico?
 * - Sonda de inicio: ¿Ha terminado la aplicación de iniciar?
 *
 * Este endpoint siempre debe responder rápidamente y no depender de servicios externos.
 */
export async function GET() {
  try {
    // Verificación básica de salud - solo verificar que la aplicación está ejecutándose
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      service: 'sentiment-analysis',
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    // Si no podemos ni retornar una respuesta básica, algo está seriamente mal
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 } // Servicio No Disponible
    );
  }
}

// Soportar solicitudes HEAD (algunos balanceadores de carga las prefieren)
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
