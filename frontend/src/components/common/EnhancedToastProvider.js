import React from 'react';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const EnhancedToastProvider = () => {
  return (
    <Toaster
      position="bottom-center" 
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        success: {
          iconTheme: {
            primary: '#4CAF50',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#F44336', 
            secondary: '#fff',
          },
        },
        loading: {
          iconTheme: {
            primary: '#2196F3',
            secondary: '#fff',
          },
        },
      }}
    >
      {(t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ 
            opacity: t.visible ? 1 : 0,
            y: t.visible ? 0 : 50,
            scale: t.visible ? 1 : 0.3
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            ${t.visible ? 'animate-enter' : 'animate-leave'}
            max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden
          `}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {t.type === 'success' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
                
                {t.type === 'error' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                    className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
                
                {t.type === 'loading' && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                  >
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                  </motion.div>
                )}
              </div>
              
              <div className="ml-3 flex-1">
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t.message}
                </motion.p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: t.duration / 1000, ease: "linear" }}
            className="h-1 bg-gradient-to-r from-primary to-secondary absolute bottom-0 left-0"
          />
        </motion.div>
      )}
    </Toaster>
  );
};

export default EnhancedToastProvider;