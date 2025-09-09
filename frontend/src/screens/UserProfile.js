import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Settings, BarChart3, Download, Trash2, 
  Moon, Sun, Bell, BellOff, Edit3, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DevelopedByFooter from '../components/common/DevelopedByFooter';

const UserProfile = () => {
  const navigate = useNavigate();
  const { userPreferences, userStats, updateUserPreferences, loading } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState(userPreferences || {});

  const handleSavePreferences = async () => {
    try {
      await updateUserPreferences(editedPreferences);
      setIsEditing(false);
      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handleExportData = () => {
    toast.info('Export feature coming soon!');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      toast.info('Clear data feature coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/ideas-library')}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  User Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your preferences and view statistics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'statistics'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      STEM Innovator
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Level: {userPreferences?.skill_level || 'Beginner'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedPreferences(userPreferences || {});
                  }}
                  className={`btn-outline flex items-center space-x-2 ${
                    isEditing ? 'text-red-600 border-red-200' : ''
                  }`}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skill Level
                  </label>
                  {isEditing ? (
                    <select
                      value={editedPreferences.skill_level || 'Beginner'}
                      onChange={(e) => setEditedPreferences({
                        ...editedPreferences,
                        skill_level: e.target.value
                      })}
                      className="input-field"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {userPreferences?.skill_level || 'Beginner'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Duration
                  </label>
                  {isEditing ? (
                    <select
                      value={editedPreferences.preferred_duration || '1-2 hours'}
                      onChange={(e) => setEditedPreferences({
                        ...editedPreferences,
                        preferred_duration: e.target.value
                      })}
                      className="input-field"
                    >
                      <option value="30 minutes - 1 hour">30 minutes - 1 hour</option>
                      <option value="1-2 hours">1-2 hours</option>
                      <option value="2-4 hours">2-4 hours</option>
                      <option value="4-8 hours">4-8 hours</option>
                      <option value="1-2 days">1-2 days</option>
                      <option value="1 week+">1 week+</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {userPreferences?.preferred_duration || '1-2 hours'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size
                  </label>
                  {isEditing ? (
                    <select
                      value={editedPreferences.team_size || 'Individual'}
                      onChange={(e) => setEditedPreferences({
                        ...editedPreferences,
                        team_size: e.target.value
                      })}
                      className="input-field"
                    >
                      <option value="Individual">Individual</option>
                      <option value="2-3 people">2-3 people</option>
                      <option value="4-6 people">4-6 people</option>
                      <option value="7+ people">7+ people</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {userPreferences?.team_size || 'Individual'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Themes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(userPreferences?.selected_themes || []).map((theme, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {theme}
                      </span>
                    ))}
                    {(!userPreferences?.selected_themes || userPreferences.selected_themes.length === 0) && (
                      <span className="text-gray-400">No themes selected</span>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleSavePreferences}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Areas of Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                {(userPreferences?.interests || []).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
                {(!userPreferences?.interests || userPreferences.interests.length === 0) && (
                  <span className="text-gray-400">No interests selected</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.ideas_generated || 0}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Ideas Generated</p>
              </div>
              
              <div className="card p-6 text-center">
                <User className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.projects_completed || 0}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Projects Completed</p>
              </div>
              
              <div className="card p-6 text-center">
                <Settings className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.components_scanned || 0}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Components Scanned</p>
              </div>
              
              <div className="card p-6 text-center">
                <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.days_active || 0}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Days Active</p>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Active</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {userStats?.last_active_date 
                      ? new Date(userStats.last_active_date).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications about new features and updates
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info('Notification settings coming soon!')}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Management
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleExportData}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export All Data</span>
                </button>
                
                <button
                  onClick={handleClearAllData}
                  className="w-full btn-outline text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DevelopedByFooter />
    </div>
  );
};

export default UserProfile;