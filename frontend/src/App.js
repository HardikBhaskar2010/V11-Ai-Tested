import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

// Screens
import OnboardingFlow from './screens/OnboardingFlow';
import TestComponentsScreen from './screens/TestComponentsScreen';
import ComponentSelectionDashboard from './screens/ComponentSelectionDashboard';
import ComponentDatabaseBrowser from './screens/ComponentDatabaseBrowser';
import ThemeAndSkillSelection from './screens/ThemeAndSkillSelection';
import AIIdeaGeneration from './screens/AIIdeaGeneration';
import IdeasLibrary from './screens/IdeasLibrary';
import UserProfile from './screens/UserProfile';

// Services
import { apiService } from './services/apiService';

// Components
import DebugPanel from './components/common/DebugPanel';
import SystemHealthIndicator from './components/common/SystemHealthIndicator';
import SmoothScrollWrapper from './components/SmoothScrollWrapper';
import AnimatedBackground from './components/AnimatedBackground';

// Import styles
import './index.css';

// Main App Component
function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check if user has completed onboarding
        const onboardingComplete = localStorage.getItem('onboarding_complete');
        if (onboardingComplete === 'true') {
          setHasCompletedOnboarding(true);
          setCurrentScreen('components');
        }

        // Skip Firebase initialization for now to avoid hanging
        console.log("🔧 App initialized in testing mode");
        
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setHasCompletedOnboarding(true);
    setCurrentScreen('components');
  };

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Atal Idea Generator...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing Firebase & Components</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <SmoothScrollWrapper>
          <div className="App relative">
            {/* Animated Background */}
            <AnimatedBackground />
            
            <Router>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    !hasCompletedOnboarding ? (
                      <OnboardingFlow onComplete={handleOnboardingComplete} />
                    ) : (
                      <Navigate to="/components" replace />
                    )
                  } 
                />
                <Route 
                  path="/components" 
                  element={
                    <TestComponentsScreen 
                      onNavigate={handleScreenChange}
                    />
                  } 
                />
                <Route 
                  path="/components/browser" 
                  element={
                    <ComponentDatabaseBrowser 
                      onNavigate={handleScreenChange}
                    />
                  } 
                />
                <Route 
                  path="/preferences" 
                  element={
                    <ThemeAndSkillSelection 
                      onNavigate={handleScreenChange}
                    />
                  } 
                />
                <Route 
                  path="/generate" 
                  element={
                    <AIIdeaGeneration 
                      onNavigate={handleScreenChange}
                    />
                  } 
                />
                <Route 
                  path="/library" 
                  element={
                    <IdeasLibrary 
                      onNavigate={handleScreenChange}
                    />
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <UserProfile 
                      onNavigate={handleScreenChange}
                    />
                  } 
                />
              </Routes>
              
              {/* Debug Panel - Shows detailed system status in development */}
              <DebugPanel />
              
              {/* System Health Indicator - Compact always-visible status */}
              <SystemHealthIndicator />
              
              {/* Toast notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: '#4aed88',
                    },
                  },
                }}
              />
            </Router>
          </div>
        </SmoothScrollWrapper>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;