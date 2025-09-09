import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ArrowLeft, Plus, Heart, Trash2, Edit3, 
  BookOpen, BarChart3, Star, Calendar, Eye, Share2 
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DevelopedByFooter from '../components/common/DevelopedByFooter';

const IdeasLibrary = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState(null);

  const { data: ideas = [], isLoading, error } = useQuery(
    'savedIdeas',
    apiService.getSavedIdeas,
    {
      onError: (error) => {
        toast.error('Failed to load ideas');
        console.error('Ideas fetch error:', error);
      }
    }
  );

  const toggleFavoriteMutation = useMutation(
    ({ id, isFavorite }) => apiService.toggleFavorite(id, isFavorite),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savedIdeas');
        toast.success('Favorite status updated');
      },
      onError: () => {
        toast.error('Failed to update favorite status');
      }
    }
  );

  const deleteIdeaMutation = useMutation(
    (id) => apiService.deleteIdea(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('savedIdeas');
        toast.success('Idea deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete idea');
      }
    }
  );

  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Favorites'];

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesFilter = true;
    if (selectedFilter === 'Favorites') {
      matchesFilter = idea.is_favorite;
    } else if (selectedFilter !== 'All') {
      matchesFilter = idea.difficulty === selectedFilter;
    }

    let matchesTab = true;
    if (activeTab === 'favorites') {
      matchesTab = idea.is_favorite;
    }

    return matchesSearch && matchesFilter && matchesTab;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const handleToggleFavorite = (idea) => {
    toggleFavoriteMutation.mutate({ id: idea.id, isFavorite: !idea.is_favorite });
  };

  const handleDeleteIdea = (ideaId) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      deleteIdeaMutation.mutate(ideaId);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const total = ideas.length;
    const favorites = ideas.filter(idea => idea.is_favorite).length;
    const byDifficulty = {
      Beginner: ideas.filter(idea => idea.difficulty === 'Beginner').length,
      Intermediate: ideas.filter(idea => idea.difficulty === 'Intermediate').length,
      Advanced: ideas.filter(idea => idea.difficulty === 'Advanced').length,
    };
    
    return { total, favorites, byDifficulty };
  };

  // Handle back button - Fixed navigation
  const handleBackClick = () => {
    navigate('/generate'); // Fixed: changed from '/ai-generation' to '/generate'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your ideas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Failed to Load Ideas
          </h2>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ideas Library
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {stats.total} ideas saved • {stats.favorites} favorites
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/generate')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Ideas</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Ideas
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Search and Filter */}
          {(activeTab === 'all' || activeTab === 'favorites') && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input-field min-w-32"
              >
                {filters.map(filter => (
                  <option key={filter} value={filter}>{filter}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Ideas</p>
              </div>
              
              <div className="card p-6 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.favorites}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Favorites</p>
              </div>
              
              <div className="card p-6 text-center">
                <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.byDifficulty.Beginner}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Beginner</p>
              </div>
              
              <div className="card p-6 text-center">
                <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.byDifficulty.Advanced}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Advanced</p>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ideas by Difficulty Level
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{difficulty}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            difficulty === 'Beginner' ? 'bg-green-500' :
                            difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ideas List */}
        {(activeTab === 'all' || activeTab === 'favorites') && (
          <>
            {filteredIdeas.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No ideas found' : 
                   activeTab === 'favorites' ? 'No favorite ideas' : 'Your library is empty'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' :
                   activeTab === 'favorites' ? 'Mark ideas as favorites to see them here' :
                   'Start generating and saving project ideas to build your library'}
                </p>
                <button
                  onClick={() => navigate('/generate')}
                  className="btn-primary"
                >
                  Generate Ideas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleToggleFavorite(idea)}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          idea.is_favorite ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${idea.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(idea.difficulty)}`}>
                        {idea.difficulty}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {idea.estimated_cost}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatDate(idea.created_at)}</span>
                        {idea.updated_at !== idea.created_at && (
                          <>
                            <span>•</span>
                            <span>Updated {formatDate(idea.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedIdea(idea)}
                        className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </button>
                      
                      <button
                        onClick={() => handleShareIdea(idea)}
                        className="btn-outline text-sm py-2 px-3"
                      >
                        <Share2 className="h-3 w-3" />
                      </button>
                      
                      <button
                        onClick={() => toast.info('Edit feature coming soon!')}
                        className="btn-outline text-sm py-2 px-3"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="btn-outline text-red-600 border-red-200 hover:bg-red-50 text-sm py-2 px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Idea Detail Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedIdea.title}
                    </h2>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedIdea.difficulty)}`}>
                        {selectedIdea.difficulty}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {selectedIdea.estimated_cost}
                      </span>
                      {selectedIdea.is_favorite && (
                        <span className="text-red-500">
                          <Heart className="h-4 w-4 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedIdea(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedIdea.description}
                    </p>
                  </div>

                  {selectedIdea.problem_statement && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Problem Statement
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedIdea.problem_statement}
                      </p>
                    </div>
                  )}

                  {selectedIdea.working_principle && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Working Principle
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedIdea.working_principle}
                      </p>
                    </div>
                  )}

                  {selectedIdea.components && selectedIdea.components.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Required Components
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedIdea.components.map((component, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                          >
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedIdea.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedIdea.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Notes
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedIdea.notes}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-4">
                    <p>Created: {formatDate(selectedIdea.created_at)}</p>
                    {selectedIdea.updated_at !== selectedIdea.created_at && (
                      <p>Last updated: {formatDate(selectedIdea.updated_at)}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => handleToggleFavorite(selectedIdea)}
                      className={`btn-outline flex items-center space-x-2 ${
                        selectedIdea.is_favorite ? 'text-red-600 border-red-200' : ''
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${selectedIdea.is_favorite ? 'fill-current' : ''}`} />
                      <span>{selectedIdea.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShareIdea(selectedIdea)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={() => toast.info('Edit feature coming soon!')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DevelopedByFooter />
    </div>
  );
};

export default IdeasLibrary;