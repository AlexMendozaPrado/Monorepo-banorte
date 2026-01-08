'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert, FormControlLabel, Checkbox } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';
import { useNavigation } from '@/hooks/useNavigation';
import { useNotification } from '@/hooks/useNotification';
import authService from '@/services/authService';

const COUNTRIES = [
  'México', 'Estados Unidos', 'España', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Otro'
];

// Password validation regex patterns
const PASSWORD_RULES = {
  minLength: /.{8,}/,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/,
  noWhitespace: /^\S*$/
};

const RegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { goToLogin } = useNavigation();
  const { notification, showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    country: '',
    acceptPromotions: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (!PASSWORD_RULES.minLength.test(password)) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!PASSWORD_RULES.hasUppercase.test(password)) {
      return 'La contraseña debe incluir al menos una letra mayúscula';
    }
    if (!PASSWORD_RULES.hasLowercase.test(password)) {
      return 'La contraseña debe incluir al menos una letra minúscula';
    }
    if (!PASSWORD_RULES.hasNumber.test(password)) {
      return 'La contraseña debe incluir al menos un número';
    }
    if (!PASSWORD_RULES.hasSpecial.test(password)) {
      return 'La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)';
    }
    if (!PASSWORD_RULES.noWhitespace.test(password)) {
      return 'La contraseña no debe contener espacios en blanco';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    // Password validation with full rules
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'El país es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        setFormData({ email: '', password: '', username: '', country: '', acceptPromotions: false });

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
              <Typography sx={{ fontSize: '12px', color: '#666', lineHeight: '1.4', marginBottom: '15px' }}>
                La contraseña debe contener al menos 8 caracteres, incluir una letra mayúscula,
                una letra minúscula, un número y un carácter especial. No debe contener espacios en blanco.
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
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
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

            {/* Promotions Checkbox */}
            <Box sx={{ textAlign: 'left', marginBottom: '25px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="acceptPromotions"
                    checked={formData.acceptPromotions}
                    onChange={handleInputChange}
                    sx={{
                      color: '#EB0029',
                      '&.Mui-checked': { color: '#EB0029' }
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    Deseo recibir información sobre promociones, ofertas y novedades de Banorte
                    por correo electrónico y otros medios digitales.
                  </Typography>
                }
                sx={{ alignItems: 'flex-start', margin: 0 }}
              />
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
