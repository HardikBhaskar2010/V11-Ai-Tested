// Import Firebase and OpenRouter services
import * as firebaseService from './firebaseService';
import { openRouterService } from './openRouterService';

// Create a unified API service that uses Firebase directly
export const apiService = {
  // Health check (always returns healthy since we're client-side)
  healthCheck: () => Promise.resolve({ status: "healthy", message: "Frontend services are running" }),

  // Components API (using Firebase)
  getComponents: firebaseService.fetchComponents,
  getComponent: firebaseService.fetchComponentById,
  createComponent: firebaseService.addComponent,
  updateComponent: firebaseService.updateComponent,
  deleteComponent: firebaseService.deleteComponent,
  getComponentsByCategory: firebaseService.fetchComponentsByCategory,

  // User Preferences API (using Firebase)
  getUserPreferences: () => firebaseService.fetchPreferences(),
  saveUserPreferences: (preferences) => firebaseService.savePreferences("default_user", preferences),

  // Saved Ideas API (using Firebase)
  getSavedIdeas: firebaseService.fetchIdeas,
  saveIdea: firebaseService.saveIdea,
  updateIdea: firebaseService.updateIdea,
  deleteIdea: firebaseService.deleteIdea,
  toggleFavorite: (id, isFavorite) => firebaseService.toggleIdeaFavorite(id, isFavorite),
  searchIdeas: firebaseService.searchIdeas,

  // AI Idea Generation (using OpenAI)
  generateIdeas: (request) => openaiService.generateProjectIdeas(request),
  enhanceIdea: openaiService.enhanceProjectIdea,
  getProjectSuggestions: openaiService.getProjectSuggestions,

  // User Stats (using Firebase)
  getUserStats: firebaseService.fetchStats,

  // Initialize sample data
  initializeSampleComponents: firebaseService.initializeSampleComponents
};

export default apiService;