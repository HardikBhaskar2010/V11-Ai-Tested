import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated, config } from '@react-spring/web';
import { QrCode, Brain, FolderHeart, ChevronRight, SkipForward, Sparkles } from 'lucide-react';
import DevelopedByFooter from '../components/common/DevelopedByFooter';
import ParticleBackground from '../components/common/ParticleBackground';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Enhanced background animation
  const [backgroundSpring] = useSpring(() => ({
    from: { 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    to: async (next) => {
      while (true) {
        await next({ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        });
        await next({ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
        });
        await next({ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
        });
        await next({ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
        });
        await next({ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
        });
      }
    },
    config: { duration: 8000 },
  }));

  // Floating elements animation
  const [floatingSpring] = useSpring(() => ({
    from: { transform: 'translateY(0px)' },
    to: { transform: 'translateY(-20px)' },
    config: config.slow,
    loop: { reverse: true },
  }));

  const onboardingData = [
    {
      title: 'Scan Components',
      description: 'Use your camera to scan QR codes and barcodes on electronic components. Instantly identify parts and add them to your project inventory.',
      icon: QrCode,
      color: 'text-primary',
      bgColor: 'bg-gradient-to-br from-primary/10 to-primary/20',
      particleColor: 'rgba(46, 125, 50, 0.3)',
    },
    {
      title: 'AI-Powered Ideas',
      description: 'Get creative project suggestions based on your available components. Our AI generates unique, feasible ideas tailored to your skill level.',
      icon: Brain,
      color: 'text-accent',
      bgColor: 'bg-gradient-to-br from-accent/10 to-accent/20',
      particleColor: 'rgba(255, 111, 0, 0.3)',
    },
    {
      title: 'Build Your Library',
      description: 'Save your favorite project ideas, export detailed reports, and share innovations with your team. Track your STEM learning journey.',
      icon: FolderHeart,
      color: 'text-secondary',
      bgColor: 'bg-gradient-to-br from-secondary/10 to-secondary/20',
      particleColor: 'rgba(25, 118, 210, 0.3)',
    },
  ];

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_complete');
    if (hasCompletedOnboarding === 'true') {
      navigate('/components');
    }
  }, [navigate]);

  const nextPage = () => {
    if (currentPage < onboardingData.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const skipOnboarding = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(onboardingData.length - 1);
      setIsAnimating(false);
    }, 150);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/components');
  };

  const currentData = onboardingData[currentPage];
  const Icon = currentData.icon;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <animated.div 
        style={backgroundSpring}
        className="absolute inset-0 opacity-20 dark:opacity-10"
      />
      
      {/* Particle Background */}
      <ParticleBackground 
        particleCount={30}
        color={onboardingData[currentPage].particleColor}
        size={3}
        speed={0.3}
        connectDistance={120}
        showConnections={true}
        interactive={true}
      />
      
      {/* Floating decorative elements */}
      <animated.div 
        style={floatingSpring}
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"
      />
      <animated.div 
        style={{
          ...floatingSpring,
          animationDelay: '2s',
        }}
        className="absolute top-40 right-16 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl"
      />
      <animated.div 
        style={{
          ...floatingSpring,
          animationDelay: '4s',
        }}
        className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-xl"
      />
      
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-surface-light/80 to-gray-50/80 dark:from-surface-dark/80 dark:to-gray-900/80 backdrop-blur-sm flex flex-col">
        {/* Skip button */}
        {currentPage < onboardingData.length - 1 && (
          <div className="flex justify-end pt-6 pr-6">
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipOnboarding}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
            >
              <span className="font-medium">Skip</span>
              <SkipForward className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center max-w-md mx-auto"
            >
              {/* Enhanced Icon with multiple animation layers */}
              <div className="relative mb-8">
                {/* Pulsing background rings */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`absolute inset-0 w-32 h-32 mx-auto rounded-full ${currentData.bgColor} blur-md`}
                />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.05, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className={`absolute inset-0 w-32 h-32 mx-auto rounded-full ${currentData.bgColor} blur-lg`}
                />
                
                {/* Main icon container */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.2, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                  className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full ${currentData.bgColor} backdrop-blur-sm border border-white/20 shadow-xl`}
                >
                  <Icon className={`h-12 w-12 ${currentData.color} drop-shadow-sm`} />
                  
                  {/* Sparkle effects */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                    className="absolute -top-2 -right-2 text-accent"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Title with typing effect */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              >
                {currentData.title}
              </motion.h1>

              {/* Description with staggered word animation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-12"
              >
                {currentData.description.split(' ').map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className="inline-block mr-1"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced page indicators */}
          <div className="flex space-x-3 mb-8">
            {onboardingData.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                className={`relative h-3 rounded-full transition-all duration-500 cursor-pointer ${
                  index === currentPage
                    ? 'w-8 bg-gradient-to-r from-primary to-secondary shadow-lg'
                    : index < currentPage
                    ? 'w-3 bg-gradient-to-r from-primary/60 to-secondary/60'
                    : 'w-3 bg-gray-300 dark:bg-gray-600'
                }`}
                onClick={() => setCurrentPage(index)}
              >
                {index === currentPage && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-white/30 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Enhanced navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full max-w-sm"
          >
            {currentPage < onboardingData.length - 1 ? (
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={nextPage}
                disabled={isAnimating}
                className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 relative overflow-hidden group"
              >
                <span className="relative z-10">Next</span>
                <ChevronRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={completeOnboarding}
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white flex items-center justify-center space-x-2 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <ChevronRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Rainbow shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <DevelopedByFooter />
      </div>
    </div>
  );
};

export default OnboardingFlow;