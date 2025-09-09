import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';

const AdvancedLoadingSpinner = ({ size = 'md', text = '', variant = 'default' }) => {
  const sizeClasses = {
    sm: { width: 32, height: 32, strokeWidth: 3 },
    md: { width: 48, height: 48, strokeWidth: 4 },
    lg: { width: 64, height: 64, strokeWidth: 5 },
    xl: { width: 80, height: 80, strokeWidth: 6 }
  };

  const { width, height, strokeWidth } = sizeClasses[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;

  // Primary spinner animation
  const spinnerSpring = useSpring({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
    config: { duration: 1000 },
    loop: true,
  });

  // Progress circle animation
  const progressSpring = useSpring({
    from: { strokeDashoffset: circumference },
    to: { strokeDashoffset: circumference * 0.25 },
    config: config.slow,
    loop: { reverse: true },
  });

  // Pulsing dots animation
  const dotsSpring = useSpring({
    from: { scale: 0.8, opacity: 0.6 },
    to: { scale: 1.2, opacity: 1 },
    config: config.gentle,
    loop: { reverse: true },
  });

  // Text fade animation
  const textSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle,
    delay: 300,
  });

  const variants = {
    default: (
      <animated.div style={spinnerSpring} className="relative">
        <svg width={width} height={height} className="text-primary">
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.75}
            fill="none"
            className="opacity-25"
          />
          <animated.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={progressSpring}
            fill="none"
            className="text-primary"
          />
        </svg>
      </animated.div>
    ),
    dots: (
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <animated.div
            key={index}
            style={{
              ...dotsSpring,
              animationDelay: `${index * 0.2}s`,
            }}
            className={`w-3 h-3 bg-primary rounded-full ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : ''}`}
          />
        ))}
      </div>
    ),
    pulse: (
      <animated.div
        style={dotsSpring}
        className={`bg-gradient-to-r from-primary to-secondary rounded-full ${
          size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : 'w-20 h-20'
        }`}
      />
    ),
    ripple: (
      <div className="relative">
        {[0, 1, 2].map((index) => (
          <animated.div
            key={index}
            style={{
              ...dotsSpring,
              animationDelay: `${index * 0.4}s`,
            }}
            className={`absolute inset-0 border-2 border-primary rounded-full opacity-25 ${
              size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : 'w-20 h-20'
            }`}
          />
        ))}
      </div>
    ),
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        {variants[variant] || variants.default}
      </div>
      
      {text && (
        <animated.p
          style={textSpring}
          className="text-gray-600 dark:text-gray-400 text-sm font-medium text-center max-w-xs"
        >
          {text}
        </animated.p>
      )}
    </div>
  );
};

export default AdvancedLoadingSpinner;