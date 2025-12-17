'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { AccountCircle, BusinessCenter, Assessment } from '@mui/icons-material';

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        backgroundImage: 'url(/images/HeaderBanorte.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '63px',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 6 }
      }}>
        <Image
          src="/images/LogoBanorte.svg"
          alt="Banorte"
          width={140}
          height={32}
          priority
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </Box>

      {/* Hero Section */}
      <Box sx={{
        flex: 1,
        background: 'linear-gradient(135deg, #EB0029 0%, #C00020 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h2" component="h1" sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}>
              Business Rules Generator
            </Typography>
            <Typography variant="h5" sx={{
              mb: 6,
              opacity: 0.95,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}>
              Genera reglas de negocio automáticamente con IA para cumplimiento bancario y regulaciones
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                component={Link}
                href="/login"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#EB0029',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Iniciar Sesión
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Registrarse
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ mb: 8, fontWeight: 700, color: '#333' }}>
            Características Principales
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
            <Box sx={{ flex: 1, textAlign: 'center', px: 3 }}>
              <AccountCircle sx={{ fontSize: 80, color: '#EB0029', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                IA Conversacional
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Dialoga con Gemini AI para refinar tus reglas de negocio de forma iterativa y precisa
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center', px: 3 }}>
              <BusinessCenter sx={{ fontSize: 80, color: '#EB0029', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Mapeo ISO 20022
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Procesamiento automático de archivos XML/TXT con estándares bancarios internacionales
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center', px: 3 }}>
              <Assessment sx={{ fontSize: 80, color: '#EB0029', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Simulador de Reglas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Prueba y simula tus reglas antes de implementarlas en producción
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#333', color: 'white', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">
          © 2025 Banorte. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}
