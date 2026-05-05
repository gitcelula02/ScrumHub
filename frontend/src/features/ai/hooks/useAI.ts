import { useQuery, useMutation } from '@tanstack/react-query';
import { aiService } from '../services/aiService';

/**
 * @hook useAIInsights
 * Fetches AI-generated insights and risk analysis for a specific project.
 */
export function useAIInsights(projectId: string) {
  return useQuery({
    queryKey: ['ai-insights', projectId],
    queryFn: () => aiService.getInsights(projectId),
    enabled: !!projectId,
  });
}

/**
 * @hook useAIPrompt
 * Mutation for processing natural language prompts via AI.
 */
export function useAIPrompt() {
  return useMutation({
    mutationFn: (prompt: string) => aiService.parsePrompt(prompt),
  });
}
