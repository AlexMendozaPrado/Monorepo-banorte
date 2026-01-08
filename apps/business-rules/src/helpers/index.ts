/**
 * @file Helpers de validación y utilidades
 * @description Funciones auxiliares para validación de formularios y operaciones comunes
 */

// ============ INTERFACES ============

export interface PasswordValidationResult {
  isValid: boolean;
  message: string;
}

export interface UsernameValidationResult {
  isValid: boolean;
  message: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  userId?: number;
  user?: { email: string; name: string };
}

// ============ VALIDATION HELPERS ============

export const validationHelpers = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: (email: string): boolean => validationHelpers.email.regex.test(email),
    message: 'Por favor ingresa un email válido'
  },

  password: {
    minLength: 8,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    validate: (password: string): PasswordValidationResult => {
      if (password.length < validationHelpers.password.minLength) {
        return {
          isValid: false,
          message: `La contraseña debe tener al menos ${validationHelpers.password.minLength} caracteres`
        };
      }
      if (!validationHelpers.password.regex.test(password)) {
        return {
          isValid: false,
          message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
        };
      }
      return { isValid: true, message: '' };
    }
  },

  required: {
    validate: (value: string): boolean => Boolean(value && value.trim().length > 0),
    message: 'Este campo es requerido'
  },

  username: {
    minLength: 3,
    maxLength: 20,
    regex: /^[a-zA-Z0-9_]+$/,
    validate: (username: string): UsernameValidationResult => {
      if (!username || username.length < validationHelpers.username.minLength) {
        return {
          isValid: false,
          message: `El nombre de usuario debe tener al menos ${validationHelpers.username.minLength} caracteres`
        };
      }
      if (username.length > validationHelpers.username.maxLength) {
        return {
          isValid: false,
          message: `El nombre de usuario no puede tener más de ${validationHelpers.username.maxLength} caracteres`
        };
      }
      if (!validationHelpers.username.regex.test(username)) {
        return {
          isValid: false,
          message: 'El nombre de usuario solo puede contener letras, números y guiones bajos'
        };
      }
      return { isValid: true, message: '' };
    }
  }
};

// ============ FORM HELPERS ============

export interface RegistrationFormData {
  email: string;
  password: string;
  username: string;
  country: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const formHelpers = {
  // Simulate API call for registration
  submitRegistration: async (formData: RegistrationFormData): Promise<FormSubmissionResult> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the data (in real app, this would be sent to backend)
      console.log('Datos de registro enviados:', formData);

      // Simulate success response
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        userId: Date.now() // Simulated user ID
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: 'Error al registrar usuario: ' + err.message
      };
    }
  },

  // Simulate API call for password reset
  submitPasswordReset: async (email: string): Promise<FormSubmissionResult> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Solicitud de restablecimiento enviada para:', email);

      return {
        success: true,
        message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico'
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: 'Error al enviar solicitud: ' + err.message
      };
    }
  },

  // Simulate API call for login
  submitLogin: async (credentials: LoginCredentials): Promise<FormSubmissionResult> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      console.log('Intento de login:', credentials);

      // Simple validation for demo
      if (credentials.email === 'test@banorte.com' && credentials.password === 'Test123!') {
        return {
          success: true,
          message: 'Login exitoso',
          user: { email: credentials.email, name: 'Usuario Test' }
        };
      } else {
        return {
          success: false,
          message: 'Credenciales incorrectas'
        };
      }
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: 'Error de conexión: ' + err.message
      };
    }
  }
};

// ============ UTILITY HELPERS ============

export const utilityHelpers = {
  // Format date for display
  formatDate: (date: string | Date): string => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Generate random ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  },

  // Clean form data
  cleanFormData: <T extends Record<string, unknown>>(data: T): T => {
    const cleaned = {} as T;
    Object.keys(data).forEach(key => {
      const typedKey = key as keyof T;
      if (typeof data[typedKey] === 'string') {
        (cleaned as Record<string, unknown>)[key] = (data[typedKey] as string).trim();
      } else {
        cleaned[typedKey] = data[typedKey];
      }
    });
    return cleaned;
  }
};

// ============ CONSTANTS ============

export const constants = {
  ROUTES: {
    LOGIN: '/',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard'
  },

  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  } as const,

  FORM_FIELDS: {
    EMAIL: 'email',
    PASSWORD: 'password',
    USERNAME: 'username',
    COUNTRY: 'country'
  } as const,

  COUNTRIES: [
    'México',
    'Estados Unidos',
    'Canadá',
    'España',
    'Argentina',
    'Colombia',
    'Chile',
    'Perú'
  ] as const
};

// ============ TYPE EXPORTS ============

export type NotificationType = typeof constants.NOTIFICATION_TYPES[keyof typeof constants.NOTIFICATION_TYPES];
export type Country = typeof constants.COUNTRIES[number];
