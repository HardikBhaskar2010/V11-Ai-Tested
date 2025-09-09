import React, { useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

const AnimatedCard = ({ 
  children, 
  className = '', 
  hover3D = true, 
  clickAnimation = true,
  glowEffect = false,
  parallaxStrength = 0.1,
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Main card animation spring
  const [cardSpring, setCardSpring] = useSpring(() => ({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    config: config.gentle,
  }));

  // Glow effect spring
  const [glowSpring, setGlowSpring] = useSpring(() => ({
    opacity: 0,
    config: config.gentle,
  }));

  // Content animation spring
  const [contentSpring, setContentSpring] = useSpring(() => ({
    transform: 'translateZ(0px)',
    config: config.gentle,
  }));

  // Gesture handlers for 3D hover effect
  const bind = useGesture({
    onMove: ({ xy, hovering, event }) => {
      if (!hover3D || !hovering) return;
      
      const rect = event.target.getBoundingClientRect();
      const x = xy[0] - rect.left - rect.width / 2;
      const y = xy[1] - rect.top - rect.height / 2;
      
      const rotateX = (y / rect.height) * -20 * parallaxStrength;
      const rotateY = (x / rect.width) * 20 * parallaxStrength;
      
      setCardSpring.start({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isPressed ? 0.95 : 1.05})`,
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      });

      setContentSpring.start({
        transform: `translateZ(${isHovered ? '20px' : '0px'})`,
      });
    },
    onHover: ({ hovering }) => {
      setIsHovered(hovering);
      
      if (!hovering) {
        setCardSpring.start({
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        });
        setContentSpring.start({
          transform: 'translateZ(0px)',
        });
      }

      if (glowEffect) {
        setGlowSpring.start({
          opacity: hovering ? 1 : 0,
        });
      }
    },
    onMouseDown: () => {
      if (!clickAnimation) return;
      setIsPressed(true);
      setCardSpring.start({
        transform: `${cardSpring.transform.get()} scale(0.95)`,
        config: { ...config.gentle, tension: 300 },
      });
    },
    onMouseUp: () => {
      if (!clickAnimation) return;
      setIsPressed(false);
      setCardSpring.start({
        transform: cardSpring.transform.get().replace('scale(0.95)', 'scale(1.05)'),
        config: { ...config.gentle, tension: 300 },
      });
    },
  });

  return (
    <div className="relative" {...props}>
      {/* Glow effect */}
      {glowEffect && (
        <animated.div
          style={glowSpring}
          className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl blur-sm -z-10"
        />
      )}
      
      {/* Main card */}
      <animated.div
        {...bind()}
        style={cardSpring}
        className={`card cursor-pointer transition-colors duration-200 relative overflow-hidden ${className}`}
        onClick={onClick}
      >
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20" />
        </div>
        
        {/* Content */}
        <animated.div style={contentSpring} className="relative z-10">
          {children}
        </animated.div>
        
        {/* Shine effect on hover */}
        <div 
          className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : ''
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full hover:translate-x-[-100%] transition-transform duration-1000" />
        </div>
      </animated.div>
    </div>
  );
};

export default AnimatedCard;