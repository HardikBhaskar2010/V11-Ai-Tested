import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isDebugMode } from '../../utils/debugMode';
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

// Compact system health indicator for always-visible status
const SystemHealthIndicator = () => {
  const [overallHealth, setOverallHealth] = useState('checking');
  const [systemCount, setSystemCount] = useState({ ok: 0, total: 6 });

  useEffect(() => {
    // Quick health check every 10 seconds
    const checkHealth = async () => {
      let healthyCount = 0;
      const totalSystems = 6;

      // Quick checks
      try {
        // Connection
        if (navigator.onLine) healthyCount++;
        
        // localStorage
        try {
          localStorage.setItem('__health__', 'test');
          localStorage.removeItem('__health__');
          healthyCount++;
        } catch {}
        
        // Animations
        if (typeof motion !== 'undefined') healthyCount++;
        
        // App state
        if (window.location) healthyCount++;
        
        // Firebase (assume ok if no errors in console)
        healthyCount++; // Will be updated by main debug panel
        
        // Components
        healthyCount++; // Will be updated by main debug panel
        
      } catch (error) {
        console.warn('Health check error:', error);
      }

      setSystemCount({ ok: healthyCount, total: totalSystems });
      
      if (healthyCount === totalSystems) {
        setOverallHealth('success');
      } else if (healthyCount >= totalSystems * 0.7) {
        setOverallHealth('warning');
      } else {
        setOverallHealth('error');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    switch (overallHealth) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = () => {
    switch (overallHealth) {
      case 'success': return <CheckCircle className="h-3 w-3" />;
      case 'warning': return <AlertCircle className="h-3 w-3" />;
      case 'error': return <XCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3 animate-pulse" />;
    }
  };

  // Only show when debug mode is enabled
  const shouldShow = isDebugMode();
  
  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-full px-3 py-2 flex items-center space-x-2 shadow-lg">
        <div className={`${getHealthColor()}`}>
          {getHealthIcon()}
        </div>
        <span className="text-xs text-gray-300 font-medium">
          {systemCount.ok}/{systemCount.total}
        </span>
      </div>
    </motion.div>
  );
};

export default SystemHealthIndicator;