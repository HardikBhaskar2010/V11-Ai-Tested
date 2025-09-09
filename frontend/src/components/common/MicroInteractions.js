import React from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

// Hover scale component
export const HoverScale = ({ children, scale = 1.05, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Magnetic button component
export const MagneticButton = ({ children, strength = 0.3, className = '', ...props }) => {
  const [magneticSpring, setMagneticSpring] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 300, friction: 40 }
  }));

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setMagneticSpring.start({
      x: x * strength,
      y: y * strength
    });
  };

  const handleMouseLeave = () => {
    setMagneticSpring.start({ x: 0, y: 0 });
  };

  return (
    <animated.button
      style={magneticSpring}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </animated.button>
  );
};

// Ripple effect component
export const RippleButton = ({ children, className = '', ...props }) => {
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 10, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </button>
  );
};

// Tilt card component
export const TiltCard = ({ children, className = '', maxTilt = 10 }) => {
  const [tiltSpring, setTiltSpring] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { tension: 300, friction: 40 }
  }));

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    
    setTiltSpring.start({
      rotateX,
      rotateY,
      scale: 1.02
    });
  };

  const handleMouseLeave = () => {
    setTiltSpring.start({
      rotateX: 0,
      rotateY: 0,
      scale: 1
    });
  };

  return (
    <animated.div
      style={{
        transform: tiltSpring.rotateX.to(x => 
          tiltSpring.rotateY.to(y => 
            tiltSpring.scale.to(s => 
              `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`
            )
          )
        )
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </animated.div>
  );
};

// Smooth reveal component
export const SmoothReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.6,
  className = '' 
}) => {
  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration, 
        delay,
        ease: [0.6, -0.05, 0.01, 0.99]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger children component
export const StaggerChildren = ({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Morphing icon component
export const MorphingIcon = ({ 
  icons, 
  currentIndex = 0, 
  size = 'w-6 h-6',
  className = '' 
}) => {
  return (
    <div className={`relative ${size} ${className}`}>
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 0.8,
            rotate: index === currentIndex ? 0 : 180
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Icon className={size} />
        </motion.div>
      ))}
    </div>
  );
};