import { apiClient } from "@/services/apiClient";
import type { Task } from "@/types";

interface AIInsight {
  id: string;
  type: string;
  content: string;
}

/**
 * @service AIService
 * Provides AI-driven features like natural language parsing and risk analysis.
 */
export const aiService = {
  /**
   * Parses natural language input into task data.
   */
  parsePrompt: async (prompt: string): Promise<Partial<Task>> => {
    return apiClient.post<Partial<Task>>("/ai/parse", { prompt });
  },

  /**
   * Generates smart insights for the current project context.
   */
  getInsights: async (projectId: string): Promise<AIInsight[]> => {
    return apiClient.get<AIInsight[]>(`/ai/insights/${projectId}`);
  },
};
