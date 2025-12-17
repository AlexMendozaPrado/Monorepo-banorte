/**
 * @file Reports Service - Backend Connected Version
 * @description Service for reports and statistics API calls
 */

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface RulesStats {
  Activa?: number;
  Inactiva?: number;
  [key: string]: number | undefined;
}

export interface UsersStats {
  totalUsers: number;
  activeUsers: number;
}

export interface SimulationStats {
  totalSimulations: number;
  textSimulations: number;
  fileSimulations: number;
  rulesWithSimulations: number;
}

export interface RecentActivity {
  lastCreated: {
    id: string;
    createdDate: string;
    details: string;
  };
  lastModified: {
    id: string;
    modifiedDate: string;
    details: string;
  };
}

export interface MostSuccessfulRule {
  id: string;
  createdDate: string;
  publishedDate: string;
  affectedUsers: string;
  successRate: string;
}

export interface DashboardData {
  recentActivity: RecentActivity | null;
  mostSuccessfulRule: MostSuccessfulRule | null;
  mostUsedRuleId: string;
  leastUsedRuleId: string;
}

export interface ReportsData {
  activeRules: number;
  inactiveRules: number;
  simulationRules: number;
  totalUsers: number;
  activeUsers: number;
  totalSimulations: number;
  textSimulations: number;
  fileSimulations: number;
  recentActivity: RecentActivity | null;
  mostSuccessfulRule: MostSuccessfulRule | null;
  mostUsedRuleId: string;
  leastUsedRuleId: string;
}

export interface RuleDetail {
  id_regla: number;
  nombre: string;
  descripcion: string;
  status: string;
  fecha_creacion: string;
  total_executions?: number;
  successful_executions?: number;
}

export interface User {
  id: number;
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

class ReportsService {
  /**
   * Get comprehensive reports data from backend
   */
  async getReportsData(userId: number | null = null): Promise<ReportsData> {
    try {
      const [rulesStats, usersStats, simulationStats, dashboard] = await Promise.all([
        this.getRulesStats(userId).catch(err => {
          console.warn('Rules stats failed:', err);
          return {} as RulesStats;
        }),
        this.getUsersStats().catch(err => {
          console.warn('Users stats failed:', err);
          return {} as UsersStats;
        }),
        this.getSimulationStats(userId).catch(err => {
          console.warn('Simulation stats failed:', err);
          return {} as SimulationStats;
        }),
        this.getDashboardData(userId).catch(err => {
          console.warn('Dashboard data failed:', err);
          return {} as DashboardData;
        })
      ]);

      return {
        activeRules: rulesStats.Activa || 0,
        inactiveRules: rulesStats.Inactiva || 0,
        simulationRules: simulationStats.rulesWithSimulations || 0,
        totalUsers: usersStats.totalUsers || 0,
        activeUsers: usersStats.activeUsers || 0,
        totalSimulations: simulationStats.totalSimulations || 0,
        textSimulations: simulationStats.textSimulations || 0,
        fileSimulations: simulationStats.fileSimulations || 0,
        recentActivity: dashboard.recentActivity || null,
        mostSuccessfulRule: dashboard.mostSuccessfulRule || null,
        mostUsedRuleId: dashboard.mostUsedRuleId || '--',
        leastUsedRuleId: dashboard.leastUsedRuleId || '--'
      };
    } catch (error) {
      console.error('Error fetching reports data:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get rules statistics from backend
   */
  async getRulesStats(userId: number | null = null): Promise<RulesStats> {
    try {
      const url = userId
        ? `${API_BASE_URL}/reports/rules-stats?user_id=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/reports/rules-stats`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<RulesStats>(response);
    } catch (error) {
      console.error('Error fetching rules stats:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get users statistics from backend
   */
  async getUsersStats(): Promise<UsersStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/users-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<UsersStats>(response);
    } catch (error) {
      console.error('Error fetching users stats:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get simulation statistics from backend
   */
  async getSimulationStats(userId: number | null = null): Promise<SimulationStats> {
    try {
      const url = userId
        ? `${API_BASE_URL}/reports/simulation-stats?user_id=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/reports/simulation-stats`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<SimulationStats>(response);
    } catch (error) {
      console.error('Error fetching simulation stats:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get dashboard data (recent activity, most successful rule)
   */
  async getDashboardData(_userId: number | null = null): Promise<DashboardData> {
    try {
      return {
        recentActivity: {
          lastCreated: {
            id: '--',
            createdDate: '--',
            details: 'Información no disponible (requiere tabla historial_reglas)'
          },
          lastModified: {
            id: '--',
            modifiedDate: '--',
            details: 'Información no disponible (requiere tabla historial_reglas)'
          }
        },
        mostSuccessfulRule: {
          id: '--',
          createdDate: '--',
          publishedDate: '--',
          affectedUsers: '--',
          successRate: '--'
        },
        mostUsedRuleId: '--',
        leastUsedRuleId: '--'
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        recentActivity: null,
        mostSuccessfulRule: null,
        mostUsedRuleId: '--',
        leastUsedRuleId: '--'
      };
    }
  }

  /**
   * Export data as PDF from backend
   */
  async exportToPDF(): Promise<Blob> {
    try {
      const currentUser = getCurrentUser();
      const userIdQuery = currentUser?.id ? `?user_id=${encodeURIComponent(currentUser.id)}` : '';
      const response = await fetch(`${API_BASE_URL}/reports/export/pdf${userIdQuery}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.type !== 'application/pdf') {
        return new Blob([blob], { type: 'application/pdf' });
      }

      return blob;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Export data as CSV from backend
   */
  async exportToCSV(): Promise<Blob> {
    try {
      const currentUser = getCurrentUser();
      const userIdQuery = currentUser?.id ? `?user_id=${encodeURIComponent(currentUser.id)}` : '';
      const response = await fetch(`${API_BASE_URL}/reports/export/csv${userIdQuery}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const csvData = await response.text();
      return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Helper method to format data for PDF-like display
   */
  formatDataForPDF(data: RuleDetail[] | null): string {
    const currentDate = new Date().toLocaleDateString('es-MX');
    let content = `Reporte de Reglas de Negocio - ${currentDate}\n\n`;

    if (data && Array.isArray(data) && data.length > 0) {
      content += `Resumen de Reglas:\n`;
      content += `===================\n\n`;

      data.forEach((rule, index) => {
        content += `${index + 1}. ${rule.nombre || 'Sin nombre'}\n`;
        content += `   ID: ${rule.id_regla || 'N/A'}\n`;
        content += `   Descripción: ${rule.descripcion || 'Sin descripción'}\n`;
        content += `   Estado: ${rule.status || 'N/A'}\n`;
        content += `   Fecha de creación: ${rule.fecha_creacion ? new Date(rule.fecha_creacion).toLocaleDateString('es-MX') : 'N/A'}\n`;
        content += `   Total de ejecuciones: ${rule.total_executions || 0}\n`;
        content += `   Ejecuciones exitosas: ${rule.successful_executions || 0}\n`;
        content += `\n`;
      });
    } else {
      content += `No hay datos disponibles para mostrar.\n`;
    }

    return content;
  }

  /**
   * Get filtered reports data from backend
   */
  async getFilteredReports(filters: Record<string, unknown> = {}): Promise<ReportsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/filtered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      return await handleResponse<ReportsData>(response);
    } catch (error) {
      console.error('Error fetching filtered reports:', error);
      return handleNetworkError(error);
    }
  }

  /**
   * Get all rules with detailed information
   */
  async getAllRulesDetails(userId: number | null = null): Promise<RuleDetail[]> {
    try {
      const url = userId
        ? `${API_BASE_URL}/reports/rules-details?user_id=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/reports/rules-details`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse<RuleDetail[]>(response);
    } catch (error) {
      console.error('Error fetching rules details:', error);
      return handleNetworkError(error);
    }
  }
}

const reportsService = new ReportsService();
export default reportsService;
