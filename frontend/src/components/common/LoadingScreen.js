import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Cpu, Database } from 'lucide-react';

const LoadingScreen = ({ message = "Loading Atal Idea Generator...", subtitle = "Initializing systems..." }) => {
  const icons = [
    { Icon: Zap, delay: 0, color: "text-blue-500" },
    { Icon: Cpu, delay: 0.2, color: "text-green-500" },
    { Icon: Database, delay: 0.4, color: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Icons */}
        <div className="flex justify-center space-x-4 mb-8">
          {icons.map(({ Icon, delay, color }, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotateY: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotateY: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
              className={`p-4 rounded-full bg-white/10 backdrop-blur-sm ${color}`}
            >
              <Icon className="h-8 w-8" />
            </motion.div>
          ))}
        </div>

        {/* Loading Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-6"
        />

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {message}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-gray-300 mb-8"
        >
          {subtitle}
        </motion.p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-3 h-3 bg-blue-500 rounded-full"
            />
          ))}
        </div>

        {/* Fun Loading Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8"
        >
          <p className="text-sm text-gray-400">
            🔧 Loading components... 🚀 Preparing ideas... ✨ Almost ready!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;