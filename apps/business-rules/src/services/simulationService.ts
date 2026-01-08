/**
 * @file Simulation Service
 * @description Dedicated service for rule simulation with Gemini AI
 */

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface SimulationResult {
  success: boolean;
  result: unknown;
  timestamp: string;
  ruleId: number;
}

export interface SimulationHistoryEntry {
  id: number;
  rule_id: number;
  input_type: 'text' | 'file';
  input_data: string;
  file_name?: string;
  ai_response: unknown;
  created_at: string;
}

export interface SaveSimulationData {
  ruleId: number;
  inputType: 'text' | 'file';
  inputData: string;
  fileName?: string;
  aiResponse: unknown;
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

export const simulationService = {
  /**
   * Simulate rule with text input
   */
  async simulateWithText(ruleId: number, textInput: string): Promise<SimulationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule_id: ruleId,
          test_data: textInput
        }),
      });
      return await handleResponse<SimulationResult>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  /**
   * Simulate rule with file upload
   */
  async simulateWithFile(ruleId: number, file: File): Promise<SimulationResult> {
    try {
      const formData = new FormData();
      formData.append('rule_id', ruleId.toString());
      formData.append('test_file', file);

      const response = await fetch(`${API_BASE_URL}/simulation/file`, {
        method: 'POST',
        body: formData,
      });

      return await handleResponse<SimulationResult>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  /**
   * Get simulation history
   */
  async getSimulationHistory(ruleId: number): Promise<SimulationHistoryEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/history/${ruleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<SimulationHistoryEntry[]>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  /**
   * Get simulation results details
   */
  async getSimulationDetails(simulationId: number): Promise<SimulationHistoryEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/details/${simulationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse<SimulationHistoryEntry>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  /**
   * Save simulation (persist AI response returned to frontend)
   */
  async saveSimulation(data: SaveSimulationData): Promise<{ success: boolean; id: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulation/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_id: data.ruleId,
          input_type: data.inputType,
          input_data: data.inputData,
          file_name: data.fileName,
          ai_response: data.aiResponse
        })
      });
      return await handleResponse<{ success: boolean; id: number }>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  }
};

export default simulationService;
