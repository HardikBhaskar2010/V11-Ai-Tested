import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDebugMode } from '../../utils/debugMode';
import { 
  Wifi, 
  Database, 
  Sparkles, 
  HardDrive, 
  Cpu, 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const DebugPanel = () => {
  // Only show when debug mode is enabled
  const shouldShow = isDebugMode();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    connection: { status: 'checking', message: 'Checking...' },
    firebase: { status: 'checking', message: 'Checking...' },
    animations: { status: 'checking', message: 'Checking...' },
    localStorage: { status: 'checking', message: 'Checking...' },
    components: { status: 'checking', message: 'Checking...' },
    appState: { status: 'checking', message: 'Checking...' }
  });

  // Test connection
  const testConnection = async () => {
    try {
      const response = await fetch('https://api.github.com', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return { status: 'success', message: 'Online' };
    } catch (error) {
      try {
        // Fallback test
        await fetch('https://www.google.com', { 
          method: 'HEAD', 
          mode: 'no-cors'
        });
        return { status: 'success', message: 'Online' };
      } catch (fallbackError) {
        return { status: 'error', message: 'Offline' };
      }
    }
  };

  // Test Firebase
  const testFirebase = async () => {
    try {
      // Test Firestore connection
      const snapshot = await getDocs(collection(db, 'components'));
      return { 
        status: 'success', 
        message: `Connected (${snapshot.size} docs)` 
      };
    } catch (error) {
      console.warn('Firebase test failed:', error.message);
      return { 
        status: 'warning', 
        message: 'Fallback mode' 
      };
    }
  };

  // Test localStorage
  const testLocalStorage = () => {
    try {
      const testKey = '__debug_test__';
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === 'test') {
        return { status: 'success', message: 'Working' };
      } else {
        return { status: 'error', message: 'Failed' };
      }
    } catch (error) {
      return { status: 'error', message: 'Blocked' };
    }
  };

  // Test animations
  const testAnimations = () => {
    try {
      // Check if CSS animations are supported
      const testEl = document.createElement('div');
      const prefixes = ['animation', 'webkitAnimation', 'MozAnimation'];
      const supported = prefixes.some(prefix => testEl.style[prefix] !== undefined);
      
      // Check if Framer Motion is available
      const framerMotionLoaded = typeof motion !== 'undefined';
      
      if (supported && framerMotionLoaded) {
        return { status: 'success', message: 'Enabled' };
      } else if (supported) {
        return { status: 'warning', message: 'CSS only' };
      } else {
        return { status: 'error', message: 'Disabled' };
      }
    } catch (error) {
      return { status: 'error', message: 'Error' };
    }
  };

  // Test components
  const testComponents = () => {
    try {
      const componentsData = localStorage.getItem('selectedComponents');
      const userPrefs = localStorage.getItem('userPreferences');
      
      let componentCount = 0;
      if (componentsData) {
        componentCount = JSON.parse(componentsData).length;
      }
      
      const prefsLoaded = userPrefs !== null;
      
      return { 
        status: 'success', 
        message: `${componentCount} selected, ${prefsLoaded ? 'prefs loaded' : 'no prefs'}` 
      };
    } catch (error) {
      return { status: 'error', message: 'Error loading' };
    }
  };

  // Test app state
  const testAppState = () => {
    try {
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      const currentUrl = window.location.pathname;
      const userStats = localStorage.getItem('userStats');
      
      let statsData = {};
      if (userStats) {
        statsData = JSON.parse(userStats);
      }
      
      return { 
        status: 'success', 
        message: `${currentUrl}, ${onboardingComplete ? 'onboarded' : 'new user'}, ${statsData.ideas_generated || 0} ideas` 
      };
    } catch (error) {
      return { status: 'error', message: 'State error' };
    }
  };

  // Run all tests
  const runSystemTests = async () => {
    setSystemStatus(prev => ({
      ...prev,
      connection: { status: 'checking', message: 'Testing...' },
      firebase: { status: 'checking', message: 'Testing...' },
      animations: { status: 'checking', message: 'Testing...' },
      localStorage: { status: 'checking', message: 'Testing...' },
      components: { status: 'checking', message: 'Testing...' },
      appState: { status: 'checking', message: 'Testing...' }
    }));

    // Run tests with delays to show checking states
    setTimeout(async () => {
      const connectionResult = await testConnection();
      setSystemStatus(prev => ({ ...prev, connection: connectionResult }));
    }, 500);

    setTimeout(async () => {
      const firebaseResult = await testFirebase();
      setSystemStatus(prev => ({ ...prev, firebase: firebaseResult }));
    }, 1000);

    setTimeout(() => {
      const animationsResult = testAnimations();
      setSystemStatus(prev => ({ ...prev, animations: animationsResult }));
    }, 1500);

    setTimeout(() => {
      const localStorageResult = testLocalStorage();
      setSystemStatus(prev => ({ ...prev, localStorage: localStorageResult }));
    }, 2000);

    setTimeout(() => {
      const componentsResult = testComponents();
      setSystemStatus(prev => ({ ...prev, components: componentsResult }));
    }, 2500);

    setTimeout(() => {
      const appStateResult = testAppState();
      setSystemStatus(prev => ({ ...prev, appState: appStateResult }));
    }, 3000);
  };

  useEffect(() => {
    runSystemTests();
    
    // Re-run tests every 30 seconds
    const interval = setInterval(runSystemTests, 30000);
    
    // Add keyboard shortcut (Ctrl/Cmd + D) to toggle debug panel
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full animate-pulse" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const systemChecks = [
    { key: 'connection', icon: Wifi, label: 'Connection' },
    { key: 'firebase', icon: Database, label: 'Firebase' },
    { key: 'animations', icon: Sparkles, label: 'Animations' },
    { key: 'localStorage', icon: HardDrive, label: 'Storage' },
    { key: 'components', icon: Cpu, label: 'Components' },
    { key: 'appState', icon: Bug, label: 'App State' }
  ];

  const overallStatus = Object.values(systemStatus).every(s => s.status === 'success') 
    ? 'success' 
    : Object.values(systemStatus).some(s => s.status === 'error') 
    ? 'error' 
    : 'warning';

  // Don't render if not in debug mode
  if (!shouldShow) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-white">Debug</span>
            {getStatusIcon(overallStatus)}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-700"
            >
              <div className="p-3 space-y-2">
                {systemChecks.map(({ key, icon: Icon, label }) => {
                  const status = systemStatus[key];
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-300">{label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${getStatusColor(status.status)}`}>
                          {status.message}
                        </span>
                        {getStatusIcon(status.status)}
                      </div>
                    </div>
                  );
                })}
                
                {/* Refresh Button */}
                <div className="pt-2 border-t border-gray-700">
                  <button
                    onClick={runSystemTests}
                    className="w-full py-1 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors"
                  >
                    Refresh Status
                  </button>
                </div>
                
                {/* Timestamp */}
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    Last check: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DebugPanel;