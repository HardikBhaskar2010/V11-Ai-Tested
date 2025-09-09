import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Skip Firebase API calls for now to prevent hanging
      console.log("💡 Skipping Firebase API calls - using local storage only");
      
      // Load from localStorage instead
      const savedPreferences = localStorage.getItem('userPreferences');
      const savedStats = localStorage.getItem('userStats');
      
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      } else {
        // Set default preferences
        const defaultPrefs = {
          skill_level: 'Beginner',
          selected_themes: [],
          preferred_duration: '1-2 hours',
          team_size: 'Individual',
          interests: []
        };
        setUserPreferences(defaultPrefs);
        localStorage.setItem('userPreferences', JSON.stringify(defaultPrefs));
      }
      
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // Set default stats  
        const defaultStats = {
          ideas_generated: 0,
          components_selected: 0,
          projects_completed: 0
        };
        setUserStats(defaultStats);
        localStorage.setItem('userStats', JSON.stringify(defaultStats));
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPreferences = async (newPreferences) => {
    try {
      const updated = await apiService.saveUserPreferences(newPreferences);
      setUserPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const updateSelectedComponents = (components) => {
    setSelectedComponents(components);
    localStorage.setItem('selectedComponents', JSON.stringify(components));
  };

  const incrementStat = async (statKey, increment = 1) => {
    try {
      // Optimistic update
      setUserStats(prev => ({
        ...prev,
        [statKey]: (prev[statKey] || 0) + increment,
        last_active_date: new Date().toISOString()
      }));
      
      // Update on server would happen here
      // For now, we'll just update locally
    } catch (error) {
      console.error('Error updating stat:', error);
    }
  };

  const value = {
    userPreferences,
    userStats,
    selectedComponents,
    loading,
    updateUserPreferences,
    updateSelectedComponents,
    incrementStat,
    refreshUserData: loadUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};