import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { Plus, X } from 'lucide-react';

const FloatingActionButton = ({ 
  actions = [], 
  mainIcon: MainIcon = Plus,
  size = 'lg',
  position = 'bottom-right',
  color = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8'
  };

  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
    secondary: 'bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70',
    accent: 'bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70'
  };

  // Main button spring animation
  const [mainButtonSpring, setMainButtonSpring] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: { tension: 300, friction: 10 }
  }));

  // Backdrop spring animation
  const [backdropSpring] = useSpring(() => ({
    opacity: isOpen ? 0.3 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    config: { tension: 300, friction: 30 }
  }));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setMainButtonSpring.start({
      rotate: !isOpen ? 45 : 0,
      scale: !isOpen ? 1.1 : 1
    });
  };

  const handleActionClick = (action) => {
    action.onClick();
    setIsOpen(false);
    setMainButtonSpring.start({
      rotate: 0,
      scale: 1
    });
  };

  return (
    <>
      {/* Backdrop */}
      <animated.div
        style={backdropSpring}
        className="fixed inset-0 bg-black z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* FAB Container */}
      <div className={`fixed ${positionClasses[position]} z-50`}>
        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col-reverse items-center space-y-reverse space-y-3 mb-4">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    y: 20,
                    transition: { delay: (actions.length - index - 1) * 0.05 }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleActionClick(action)}
                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
                  title={action.label}
                >
                  <action.icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {action.label}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <animated.button
          style={mainButtonSpring}
          onClick={toggleMenu}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${sizeClasses[size]} ${colorClasses[color]} text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 group relative overflow-hidden`}
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 group-active:animate-ping rounded-full" />
          
          {/* Icon */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MainIcon className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 border-2 border-white rounded-full"
          />
        </animated.button>
      </div>
    </>
  );
};

export default FloatingActionButton;