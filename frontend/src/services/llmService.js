/**
 * LLM Service - Emergent LLM Integration
 * Replaces OpenRouter with backend API calls to Emergent LLM
 */

const API_BASE_URL = 'http://localhost:8001/api';

class LLMService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Generate project ideas using backend LLM service
   */
  async generateIdeas(components, preferences = {}) {
    try {
      console.log('🚀 Calling backend LLM service for idea generation');
      console.log('Components:', components);
      console.log('Preferences:', preferences);

      const response = await fetch(`${this.baseURL}/generate-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_components: components,
          preferences: preferences,
          model_id: 'gpt-4o-mini'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const ideas = await response.json();
      console.log('✅ Received ideas from backend:', ideas);
      
      return ideas.map((idea, index) => ({
        ...idea,
        id: idea.id || `generated_${Date.now()}_${index}`,
        availability: 'Available',
        is_favorite: false,
        created_at: idea.created_at || new Date().toISOString(),
        updated_at: idea.updated_at || new Date().toISOString()
      }));

    } catch (error) {
      console.error('❌ LLM Service Error:', error);
      throw new Error(`Failed to generate ideas: ${error.message}`);
    }
  }

  /**
   * Enhanced idea generation with specific model selection
   */
  async generateIdeasWithModel(components, preferences = {}, modelId = 'gpt-4o-mini') {
    // For now, we use the same method since backend handles model selection
    return this.generateIdeas(components, { ...preferences, model: modelId });
  }

  /**
   * Test the backend LLM connection
   */
  async testConnection() {
    try {
      console.log('🔍 Testing backend LLM connection');
      
      const response = await fetch(`${this.baseURL}/test-llm`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Connection test result:', result);
      
      return result;

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Get available models (simplified for backend integration)
   */
  async getAvailableModels() {
    return [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and efficient OpenAI model, excellent for idea generation',
        provider: 'OpenAI'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable OpenAI model, excellent for creative tasks',
        provider: 'OpenAI'
      },
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        description: 'Excellent reasoning and creativity from Anthropic',
        provider: 'Anthropic'
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast and efficient Google model',
        provider: 'Google'
      }
    ];
  }

  /**
   * Health check for backend service
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const llmService = new LLMService();
export default llmService;