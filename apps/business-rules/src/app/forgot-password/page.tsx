'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link as MuiLink,
  InputAdornment
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';

import authService from '../../services/authService';

// Type definitions
interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();

  // State
  const [formData, setFormData] = useState<FormData>({ email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    setApiError(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un correo electrónico válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      await authService.forgotPassword(formData.email);
      setSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setApiError(
        error instanceof Error
          ? error.message
          : 'Error al enviar el correo de recuperación. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigate back to login
  const handleBackToLogin = (): void => {
    router.push('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 3 }}>
            <Image
              src="/images/banorte-logo.png"
              alt="Banorte Logo"
              width={200}
              height={60}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>

          {/* Title */}
          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}
          >
            Recuperar Contraseña
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </Typography>

          {/* Success Message */}
          {success ? (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Se ha enviado un correo con las instrucciones para restablecer tu contraseña.
                Por favor revisa tu bandeja de entrada.
              </Alert>

              <Button
                fullWidth
                variant="contained"
                onClick={handleBackToLogin}
                startIcon={<ArrowBackIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#ec0029',
                  '&:hover': {
                    backgroundColor: '#c4001f'
                  }
                }}
              >
                Volver al Inicio de Sesión
              </Button>
            </Box>
          ) : (
            <>
              {/* API Error */}
              {apiError && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {apiError}
                </Alert>
              )}

              {/* Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: '100%' }}
                noValidate
              >
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{
                    py: 1.5,
                    backgroundColor: '#ec0029',
                    '&:hover': {
                      backgroundColor: '#c4001f'
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc'
                    }
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <MuiLink
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleBackToLogin}
                    sx={{
                      color: '#ec0029',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                    Volver al Inicio de Sesión
                  </MuiLink>
                </Box>
              </Box>
            </>
          )}

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 4, textAlign: 'center' }}
          >
            © {new Date().getFullYear()} Banorte. Todos los derechos reservados.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
