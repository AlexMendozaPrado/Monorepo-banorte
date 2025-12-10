'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';
import { useNavigation } from '@/hooks/useNavigation';
import { useNotification } from '@/hooks/useNotification';
import authService from '@/services/authService';

const COUNTRIES = [
  'México', 'Estados Unidos', 'España', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Otro'
];

const RegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { goToLogin } = useNavigation();
  const { notification, showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    country: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.username) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!formData.country) {
      newErrors.country = 'El país es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.register(formData);

      if (result.success) {
        showSuccess(result.message);
        setFormData({ email: '', password: '', username: '', country: '' });

        setTimeout(() => {
          goToLogin();
        }, 2000);
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Error inesperado al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{
        backgroundImage: 'url(/images/HeaderBanorte.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '55px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/images/LogoBanorte.svg"
            alt="Banorte"
            width={100}
            height={25}
            onClick={goToLogin}
            style={{ filter: 'brightness(0) invert(1)', cursor: 'pointer' }}
          />
        </Box>
        <SearchIcon sx={{ color: 'white', fontSize: '32px', cursor: 'pointer' }} />
      </Box>

      {/* Separator */}
      <Box sx={{
        height: '2px',
        width: '100%',
        background: 'linear-gradient(90deg, #E0E0E0 0%, #BDBDBD 50%, #E0E0E0 100%)',
        opacity: 0.6
      }} />

      {/* Main Content */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#ffffff',
        minHeight: 'calc(100vh - 66px)',
        overflowY: 'auto'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '450px',
          textAlign: 'center',
          padding: '30px'
        }}>
          {notification.show && (
            <Alert severity={notification.type as any} sx={{ marginBottom: '20px' }}>
              {notification.message}
            </Alert>
          )}

          <Typography variant="h4" component="h1" sx={{
            marginBottom: '30px',
            fontWeight: '400',
            color: '#333333',
            fontSize: '28px'
          }}>
            Registro
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                Correo electrónico*
              </Typography>
              <TextField
                fullWidth
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#D3D3D3',
                    borderRadius: '6px',
                    height: '50px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: '2px solid #EB0029' }
                  }
                }}
              />
            </Box>

            {/* Password */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                Contraseña*
              </Typography>
              <TextField
                fullWidth
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{
                  marginBottom: '10px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#D3D3D3',
                    borderRadius: '6px',
                    height: '50px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: '2px solid #EB0029' }
                  }
                }}
              />
              <Typography sx={{ fontSize: '12px', color: '#666', lineHeight: '1.3', marginBottom: '15px' }}>
                Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial.
              </Typography>
            </Box>

            {/* Username */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                Usuario*
              </Typography>
              <TextField
                fullWidth
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#D3D3D3',
                    borderRadius: '6px',
                    height: '50px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: '2px solid #EB0029' }
                  }
                }}
              />
            </Box>

            {/* Country */}
            <Box sx={{ textAlign: 'left', marginBottom: '30px' }}>
              <Typography sx={{ marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                País*
              </Typography>
              <TextField
                fullWidth
                select
                name="country"
                placeholder="Selecciona tu país"
                value={formData.country}
                onChange={handleInputChange}
                error={!!errors.country}
                helperText={errors.country}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#D3D3D3',
                    borderRadius: '6px',
                    height: '50px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: '2px solid #EB0029' }
                  }
                }}
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#EB0029',
                color: 'white',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '20px',
                '&:hover': { backgroundColor: '#d4002a' },
                '&:disabled': { backgroundColor: '#ccc' }
              }}
            >
              {isSubmitting ? 'Registrando...' : 'REGISTRARME'}
            </Button>

            {/* Login Link */}
            <Typography sx={{ fontSize: '14px', color: '#666' }}>
              ¿Ya tienes cuenta?{' '}
              <Box
                component="span"
                onClick={goToLogin}
                sx={{ color: '#EB0029', fontWeight: '600', cursor: 'pointer' }}
              >
                Inicia sesión aquí
              </Box>
            </Typography>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
