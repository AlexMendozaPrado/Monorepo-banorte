// API Base Configuration - Uses Next.js env variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface RegisterData {
  usuario: string;
  correo: string;
  contrasena: string;
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface GenerateRuleData {
  usuario_id?: number;
  nombre?: string;
  descripcion?: string;
  prompt_texto?: string;
  archivo?: File | null;
}

export interface GenerateMappedRuleData {
  usuario_id: number;
  descripcion: string;
  fileContent: string;
  fileType: 'txt' | 'xml';
  fileName: string;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }
  return await response.json();
};

// Helper function to handle network errors
const handleNetworkError = (error: any): never => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
  }
  throw error;
};

// Authentication Services
export const authService = {
  async register(userData: RegisterData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};

// Business Rules Services
export const rulesService = {
  // Generate business rule with AI (supports text prompt and file upload)
  async generateRule(data: GenerateRuleData) {
    try {
      const formData = new FormData();

      // Add text data
      if (data.usuario_id) formData.append('usuario_id', data.usuario_id.toString());
      if (data.nombre) formData.append('nombre', data.nombre);
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      if (data.prompt_texto) formData.append('prompt_texto', data.prompt_texto);

      // Add file if provided
      if (data.archivo) {
        formData.append('archivo', data.archivo);
      }

      const response = await fetch(`${API_BASE_URL}/rules/generate`, {
        method: 'POST',
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Generate mapped payment (TXT/XML -> JSON envelope with pain001_xml) and store it
  async generateMappedRule(data: GenerateMappedRuleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/generate-mapped`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get user's business rules
  async getUserRules(usuarioId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/user/${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get recent movements for dashboard
  async getUserMovements(usuarioId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/movements/${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Refine existing rule with AI
  async refineRule(ruleId: number, feedback: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update rule status
  async updateRuleStatus(ruleId: number, estado: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get all business rules for management
  async getAllRules(userId: number | null = null) {
    try {
      const url = userId
        ? `${API_BASE_URL}/rules/list?user_id=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/rules/list`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update business rule
  async updateRule(ruleId: number, ruleData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Delete business rule
  async deleteRule(ruleId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Validate data against a business rule
  async validateDataWithRule(ruleId: number, data: any, tipoOperacion: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/validate-with-rule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule_id: ruleId,
          data: data,
          tipo_operacion: tipoOperacion
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get relevant rules for operation type
  async getRelevantRules(tipoOperacion: string, userId: number) {
    try {
      const url = `${API_BASE_URL}/rules/relevant?tipo_operacion=${encodeURIComponent(tipoOperacion)}&user_id=${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error obteniendo reglas relevantes:', error);
      return handleNetworkError(error);
    }
  },
};

// AI Services
export const aiService = {
  // Continue conversation with Gemini
  async continueConversation(message: string, conversationHistory: any[] = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/continue-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Process generic TXT/XML content with mapping rules
  async processPaymentMapping(data: { fileContent: string; fileType: string; fileName: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/process-payment-mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Test Gemini AI connection
  async testGemini(prompt: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/test-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Gemini AI info
  async getGeminiInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/gemini-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};

// Health Check Service
export const healthService = {
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};

// Export all services
export default {
  auth: authService,
  rules: rulesService,
  ai: aiService,
  health: healthService,
};
