/**
 * @file Historial Service - Backend Connected Version
 * @description Service for handling all historial-related API calls
 */

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface HistorialEntry {
  id: string;
  id_regla: number;
  status: string;
  createdAt: string;
  summary: string;
  nombre?: string;
  descripcion?: string;
  fecha_creacion?: string;
}

export interface HistorialStats {
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  simulationRules: number;
  recentRules: number;
}

export interface FilteredHistorialRequest {
  searchTerm: string;
  filterBy: string;
  user_id?: number;
}

export interface User {
  id: number;
  correo?: string;
  nombre?: string;
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }
  return await response.json();
};

// Helper function to handle network errors
const handleNetworkError = (error: unknown): never => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
  }
  throw error;
};

// Helper function to get current user from localStorage
const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

class HistorialService {
  /**
   * Get all historial data
   */
  async getHistorialData(): Promise<HistorialEntry[]> {
    try {
      const currentUser = getCurrentUser();
      const userIdQuery = currentUser?.id ? `?user_id=${encodeURIComponent(currentUser.id)}` : '';
      const response = await fetch(`${API_BASE_URL}/historial${userIdQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<HistorialEntry[]>(response);
    } catch (error) {
      console.error('Error fetching historial data:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get filtered historial data
   */
  async getFilteredHistorial(searchTerm: string = '', filterBy: string = 'all'): Promise<HistorialEntry[]> {
    try {
      const currentUser = getCurrentUser();
      const body: FilteredHistorialRequest = { searchTerm, filterBy };
      if (currentUser?.id) {
        body.user_id = currentUser.id;
      }
      const response = await fetch(`${API_BASE_URL}/historial/filtered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return await handleResponse<HistorialEntry[]>(response);
    } catch (error) {
      console.error('Error fetching filtered historial data:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get historial statistics
   */
  async getHistorialStats(): Promise<HistorialStats> {
    try {
      const currentUser = getCurrentUser();
      const userIdQuery = currentUser?.id ? `?user_id=${encodeURIComponent(currentUser.id)}` : '';
      const response = await fetch(`${API_BASE_URL}/historial/stats${userIdQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<HistorialStats>(response);
    } catch (error) {
      console.error('Error fetching historial stats:', error);
      return handleNetworkError(error);
    }
  }
}

const historialService = new HistorialService();
export default historialService;
