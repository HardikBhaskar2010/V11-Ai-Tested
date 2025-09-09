import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Heart, Share2, Eye, Bookmark, Lightbulb, Zap, AlertCircle, Settings, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveIdea as saveIdeaToFirebase } from '../services/firebaseService';
import { llmService } from '../services/llmService';

const AIIdeaGeneration = () => {
  const navigate = useNavigate();
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1');
  const [availableModels, setAvailableModels] = useState([]);
  const [generationPreferences, setGenerationPreferences] = useState({
    theme: 'General',
    skillLevel: 'Beginner',
    count: 5,
    duration: '1-2 hours',
    teamSize: 'Individual'
  });
  
  // Get selected components from localStorage with proper reactivity
  const [selectedComponents, setSelectedComponents] = useState([]);

  // Load selected components on mount and when localStorage changes
  useEffect(() => {
    const loadSelectedComponents = () => {
      try {
        const saved = localStorage.getItem('selectedComponents');
        const components = saved ? JSON.parse(saved) : [];
        setSelectedComponents(components);
        console.log('📦 Loaded selected components:', components.length);
      } catch (error) {
        console.error('Error loading selected components:', error);
        setSelectedComponents([]);
      }
    };

    // Load initially
    loadSelectedComponents();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      loadSelectedComponents();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage changed in same tab
    const interval = setInterval(loadSelectedComponents, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Load user preferences from localStorage
  useEffect(() => {
    try {
      const userPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      setGenerationPreferences(prev => ({
        ...prev,
        skillLevel: userPrefs.skill_level || 'Beginner',
        theme: userPrefs.selected_themes?.[0] || 'General',
        duration: userPrefs.preferred_duration || '1-2 hours',
        teamSize: userPrefs.team_size || 'Individual'
      }));
    } catch (error) {
      console.warn('Could not load user preferences:', error);
    }
  }, []);

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await llmService.getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };
    loadModels();
  }, []);



  // Replace useMutation with OpenRouter integration
  const generateIdeas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have components to work with
      if (selectedComponents.length === 0) {
        toast.error('Please select some components first!');
        navigate('/components');
        return;
      }

      console.log('🚀 Starting idea generation with components:', selectedComponents);
      toast.loading('Generating ideas with Emergent LLM...', { id: 'generate-ideas' });
      
      // Use LLM service to generate ideas
      const ideas = await llmService.generateIdeasWithModel(
        selectedComponents,
        generationPreferences,
        selectedModel
      );
      
      console.log('✅ Received ideas from OpenRouter service:', ideas);
      console.log(`📊 Number of ideas received: ${ideas.length}`);
      
      if (ideas && ideas.length > 0) {
        setGeneratedIdeas(ideas);
        console.log('✅ Ideas set in component state');
        toast.success(`Generated ${ideas.length} ideas using ${selectedModel}!`, { id: 'generate-ideas' });
      } else {
        console.warn('⚠️ No ideas received from service');
        setError('No ideas were generated. Please try again.');
        toast.error('No ideas generated. Please try again.', { id: 'generate-ideas' });
      }
      
      // Update stats in localStorage
      try {
        const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
        stats.ideas_generated = (stats.ideas_generated || 0) + ideas.length;
        localStorage.setItem('userStats', JSON.stringify(stats));
        console.log('📈 Updated user stats');
      } catch (e) {
        console.warn('Could not update stats:', e);
      }
    } catch (error) {
      console.error('❌ Generate ideas error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      setError(error.message || 'Failed to generate ideas. Please try again.');
      toast.error(error.message || 'Failed to generate ideas', { id: 'generate-ideas' });
    } finally {
      setIsLoading(false);
      console.log('🏁 Idea generation process completed');
    }
  };

  // Test LLM connection
  const testConnection = async () => {
    try {
      toast.loading('Testing Emergent LLM connection...', { id: 'test-connection' });
      const result = await llmService.testConnection();
      
      if (result.success) {
        toast.success('Emergent LLM connection successful!', { id: 'test-connection' });
      } else {
        toast.error(`Connection failed: ${result.message}`, { id: 'test-connection' });
      }
    } catch (error) {
      toast.error('Connection test failed', { id: 'test-connection' });
    }
  };

  const saveIdea = async (idea) => {
    try {
      toast.loading('Saving idea to library...', { id: 'save-idea' });
      
      const ideaToSave = {
        ...idea,
        savedAt: new Date().toISOString(),
        components: idea.components || selectedComponents.map(comp => comp.name),
        is_favorite: false,
        tags: [idea.difficulty, 'Generated'],
        estimated_cost: idea.estimated_cost || 'N/A'
      };
      
      // Save to Firebase
      const savedIdea = await saveIdeaToFirebase(ideaToSave);
      
      // Also save to localStorage as backup
      const savedIdeasList = JSON.parse(localStorage.getItem('savedIdeas') || '[]');
      savedIdeasList.push(savedIdea);
      localStorage.setItem('savedIdeas', JSON.stringify(savedIdeasList));
      
      setSavedIdeas(prev => new Set([...prev, idea.id]));
      toast.success('Idea saved to your Firebase library! 🎉', { id: 'save-idea' });
    } catch (error) {
      toast.error('Failed to save to Firebase. Saved locally instead.', { id: 'save-idea' });
      console.error('Save idea error:', error);
      
      // Fallback to localStorage only
      const savedIdeasList = JSON.parse(localStorage.getItem('savedIdeas') || '[]');
      const ideaToSave = {
        ...idea,
        savedAt: new Date().toISOString(),
        components: idea.components || selectedComponents.map(comp => comp.name)
      };
      savedIdeasList.push(ideaToSave);
      localStorage.setItem('savedIdeas', JSON.stringify(savedIdeasList));
      
      setSavedIdeas(prev => new Set([...prev, idea.id]));
    }
  };

  useEffect(() => {
    // Don't auto-generate on mount - let user click the button
    // This prevents unwanted API calls
  }, []);

  const handleSaveIdea = (idea) => {
    saveIdea(idea);
  };

  const handleShareIdea = (idea) => {
    const shareText = `Check out this project idea: ${idea.title}\n\n${idea.description}`;
    
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Idea copied to clipboard!');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Partially Available': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default: return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/components')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AI Idea Generation
                </h1>
                <p className="text-gray-400">
                  {generatedIdeas.length > 0 
                    ? `${generatedIdeas.length} ideas generated based on your selections`
                    : 'Generating personalized project ideas...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Model Selection Button */}
              <button
                onClick={() => setShowModelSelection(!showModelSelection)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Cpu className="h-4 w-4" />
                <span>AI Model</span>
              </button>

              <button
                onClick={() => navigate('/library')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                <Bookmark className="h-4 w-4" />
                <span>Library</span>
              </button>
              
              <button
                onClick={generateIdeas}
                disabled={isLoading || selectedComponents.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{generatedIdeas.length > 0 ? 'Generate More' : 'Generate Ideas'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Model Selection Panel */}
        {showModelSelection && (
          <div className="bg-gray-800 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.provider}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {availableModels.find(m => m.id === selectedModel)?.description}
                  </p>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Theme
                  </label>
                  <select
                    value={generationPreferences.theme}
                    onChange={(e) => setGenerationPreferences(prev => ({...prev, theme: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="IoT">Internet of Things</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Home Automation">Home Automation</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Environment">Environment</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skill Level
                  </label>
                  <select
                    value={generationPreferences.skillLevel}
                    onChange={(e) => setGenerationPreferences(prev => ({...prev, skillLevel: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Number of Ideas */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Ideas
                  </label>
                  <select
                    value={generationPreferences.count}
                    onChange={(e) => setGenerationPreferences(prev => ({...prev, count: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={3}>3 Ideas</option>
                    <option value={5}>5 Ideas</option>
                    <option value={7}>7 Ideas</option>
                    <option value={10}>10 Ideas</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Duration
                  </label>
                  <select
                    value={generationPreferences.duration}
                    onChange={(e) => setGenerationPreferences(prev => ({...prev, duration: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="1-2 hours">1-2 hours</option>
                    <option value="Half day">Half day</option>
                    <option value="Full day">Full day</option>
                    <option value="Weekend">Weekend</option>
                    <option value="1 week">1 week</option>
                  </select>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Size
                  </label>
                  <select
                    value={generationPreferences.teamSize}
                    onChange={(e) => setGenerationPreferences(prev => ({...prev, teamSize: e.target.value}))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Individual">Individual</option>
                    <option value="2-3 people">2-3 people</option>
                    <option value="Small team (4-6)">Small team (4-6)</option>
                    <option value="Large team (7+)">Large team (7+)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={testConnection}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Test Connection
                </button>
                <div className="text-xs text-gray-400">
                  Using OpenRouter with model: {availableModels.find(m => m.id === selectedModel)?.name}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                Generating Ideas...
              </h3>
              <p className="text-gray-400">
                Our AI is creating personalized project ideas based on your components
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Generation Failed
            </h3>
            <p className="text-gray-400 mb-6">
              {error}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigate('/components')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Change Components
              </button>
              <button
                onClick={generateIdeas}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Generated Ideas */}
        {generatedIdeas.length > 0 && !isLoading && (
          <div>
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-white">
                  Generated Ideas
                </h2>
              </div>
              
              {/* Selected Components Summary */}
              {selectedComponents.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-white mb-2">
                    Based on your selected components:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedComponents.map((component) => (
                      <span
                        key={component.id}
                        className="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-gray-300 border border-gray-600"
                      >
                        {component.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedIdeas.map((idea, index) => (
                <div
                  key={idea.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {idea.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {idea.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      idea.difficulty === 'Beginner' ? 'bg-green-900/20 text-green-300 border-green-500/30' :
                      idea.difficulty === 'Intermediate' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30' :
                      'bg-red-900/20 text-red-300 border-red-500/30'
                    } border`}>
                      {idea.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border-green-500/30 border">
                      {idea.availability}
                    </span>
                    <span className="text-sm font-medium text-blue-400">
                      {idea.estimated_cost}
                    </span>
                    {idea.generated_by && (
                      <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/30">
                        {availableModels.find(m => m.id === idea.generated_by)?.name || idea.generated_by}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2 text-sm">
                      Required Components:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {idea.components?.slice(0, 3).map((component, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400"
                        >
                          {component}
                        </span>
                      ))}
                      {idea.components?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                          +{idea.components.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedIdea(idea)}
                      className="flex-1 py-2 px-4 rounded-lg font-medium text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleSaveIdea(idea)}
                      disabled={savedIdeas.has(idea.id)}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                        savedIdeas.has(idea.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      <Heart className={`h-3 w-3 ${savedIdeas.has(idea.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleShareIdea(idea)}
                      className="py-2 px-3 rounded-lg font-medium text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && generatedIdeas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Zap className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Ready to Generate Ideas
            </h3>
            <p className="text-gray-400 mb-6">
              Click the button below to start generating personalized project ideas
            </p>
            <button
              onClick={generateIdeas}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Generate Ideas
            </button>
          </div>
        )}
      </div>

      {/* Simple Modal for Idea Details */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedIdea.title}
                </h2>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedIdea.difficulty === 'Beginner' ? 'bg-green-900/20 text-green-300 border-green-500/30' :
                    selectedIdea.difficulty === 'Intermediate' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30' :
                    'bg-red-900/20 text-red-300 border-red-500/30'
                  } border`}>
                    {selectedIdea.difficulty}
                  </span>
                  <span className="text-sm font-medium text-blue-400">
                    {selectedIdea.estimated_cost}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIdea(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Problem Statement
                </h3>
                <p className="text-gray-400">
                  {selectedIdea.problem_statement}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">
                  Working Principle
                </h3>
                <p className="text-gray-400">
                  {selectedIdea.working_principle}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">
                  Required Components
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedIdea.components?.map((component, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gray-700 rounded-lg text-sm text-gray-300"
                    >
                      {component}
                    </span>
                  ))}
                </div>
              </div>

              {selectedIdea.innovation_elements && selectedIdea.innovation_elements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Innovation Elements
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    {selectedIdea.innovation_elements.map((element, index) => (
                      <li key={index}>{element}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-600">
                <button
                  onClick={() => {
                    handleSaveIdea(selectedIdea);
                    setSelectedIdea(null);
                  }}
                  disabled={savedIdeas.has(selectedIdea.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    savedIdeas.has(selectedIdea.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white flex items-center space-x-2`}
                >
                  <Heart className={`h-4 w-4 ${savedIdeas.has(selectedIdea.id) ? 'fill-current' : ''}`} />
                  <span>{savedIdeas.has(selectedIdea.id) ? 'Saved' : 'Save Idea'}</span>
                </button>
                
                <button
                  onClick={() => handleShareIdea(selectedIdea)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIIdeaGeneration;