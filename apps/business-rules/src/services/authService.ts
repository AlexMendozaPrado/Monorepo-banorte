// Authentication service for handling login and registration
// Adapted for Next.js with TypeScript

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface User {
  id: number;
  usuario: string;
  correo: string;
  fecha_registro?: string;
  pais_region?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  country: string;
}

export interface LoginCredentials {
  usuario: string;
  contrasenia: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof window !== 'undefined') {
      console.log('🔧 AuthService initialized with API URL:', this.baseURL);
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Frontend register attempt:', {
        correo: userData.email,
        usuario: userData.username,
        contrasenia: '***',
        pais_region: userData.country
      });
      console.log('🌐 API URL:', `${this.baseURL}/auth/register`);

      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: userData.email,
          usuario: userData.username,
          contrasenia: userData.password,
          pais_region: userData.country
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      return {
        success: true,
        message: data.message || 'Usuario registrado exitosamente',
        user: data.user
      };
    } catch (error: any) {
      console.error('❌ Register error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Frontend login attempt:', { usuario: credentials.usuario, contrasenia: '***' });
      console.log('🌐 API URL:', `${this.baseURL}/auth/login`);

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: credentials.usuario,
          contrasenia: credentials.contrasenia
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // Store user data in localStorage for persistent session
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
      }

      return {
        success: true,
        message: data.message || 'Login exitoso',
        user: data.user
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  // Logout user
  logout(): AuthResponse {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    }
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (isLoggedIn === 'true' && user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('user') !== null;
  }

  // Change password for current user
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('🔐 Frontend change password attempt for user:', currentUser.id);
      console.log('🌐 API URL:', `${this.baseURL}/auth/change-password`);

      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: currentPassword,
          newPassword: newPassword
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      return {
        success: true,
        message: data.message || 'Contraseña cambiada exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
