import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowLeft, Eye, ShoppingCart, Bookmark, ExternalLink, Cpu, Zap, Gauge, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';

import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DevelopedByFooter from '../components/common/DevelopedByFooter';

const ComponentDatabaseBrowser = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  const { data: components = [], isLoading, error } = useQuery(
    'components',
    apiService.getComponents,
    {
      onError: (error) => {
        toast.error('Failed to load components');
        console.error('Components fetch error:', error);
      }
    }
  );

  const categories = ['All', ...new Set(components.map(comp => comp.category))];

  const filteredAndSortedComponents = components
    .filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'price':
          return a.price_range.localeCompare(b.price_range);
        default:
          return 0;
      }
    });

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'microcontrollers': return Cpu;
      case 'sensors': return Gauge;
      case 'actuators': return Zap;
      case 'communication': return Wifi;
      default: return Cpu;
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Partially Available':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Not Available':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  const handleAddToProject = (component) => {
    // Add component to current selection
    const currentSelection = JSON.parse(localStorage.getItem('selectedComponents') || '[]');
    const exists = currentSelection.find(comp => comp.id === component.id);
    
    if (!exists) {
      const newSelection = [...currentSelection, component];
      localStorage.setItem('selectedComponents', JSON.stringify(newSelection));
      toast.success(`Added ${component.name} to your project`);
    } else {
      toast.info(`${component.name} is already in your project`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading component database..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Failed to Load Components
          </h2>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/component-selection')}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Component Database
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse and explore available electronic components
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field min-w-32"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-32"
              >
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedComponents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No components found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedComponents.map((component, index) => {
              const CategoryIcon = getCategoryIcon(component.category);
              
              return (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleComponentClick(component)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <CategoryIcon className="h-6 w-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(component.availability)}`}>
                      {component.availability}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {component.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {component.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-primary">
                      {component.price_range}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {component.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToProject(component);
                      }}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Project
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComponentClick(component);
                      }}
                      className="btn-outline text-sm py-2 px-3"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {React.createElement(getCategoryIcon(selectedComponent.category), {
                      className: "h-8 w-8 text-primary"
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedComponent.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedComponent.category}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedComponent(null)}
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
                    {selectedComponent.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Price Range
                    </h3>
                    <span className="text-lg font-medium text-primary">
                      {selectedComponent.price_range}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Availability
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(selectedComponent.availability)}`}>
                      {selectedComponent.availability}
                    </span>
                  </div>
                </div>

                {selectedComponent.specifications && Object.keys(selectedComponent.specifications).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Specifications
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {Object.entries(selectedComponent.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => {
                      handleAddToProject(selectedComponent);
                      setSelectedComponent(null);
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Project</span>
                  </button>
                  
                  <button
                    onClick={() => toast.info('Bookmark feature coming soon!')}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmark</span>
                  </button>
                  
                  <button
                    onClick={() => toast.info('External link feature coming soon!')}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Learn More</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <DevelopedByFooter />
    </div>
  );
};

export default ComponentDatabaseBrowser;