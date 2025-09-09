import React from 'react';
import { animated, useTransition, useSpring, config } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

const EnhancedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  animation = 'scale',
  closeOnBackdrop = true,
  closeOnEscape = true 
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  // Modal backdrop transition
  const backdropTransition = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: config.gentle,
  });

  // Modal content animations
  const getModalAnimation = () => {
    switch (animation) {
      case 'scale':
        return {
          from: { opacity: 0, transform: 'scale(0.8) translateY(20px)' },
          enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
          leave: { opacity: 0, transform: 'scale(0.8) translateY(20px)' },
        };
      case 'slide':
        return {
          from: { opacity: 0, transform: 'translateY(100%)' },
          enter: { opacity: 1, transform: 'translateY(0%)' },
          leave: { opacity: 0, transform: 'translateY(100%)' },
        };
      case 'fade':
        return {
          from: { opacity: 0 },
          enter: { opacity: 1 },
          leave: { opacity: 0 },
        };
      case 'flip':
        return {
          from: { opacity: 0, transform: 'rotateY(90deg) scale(0.8)' },
          enter: { opacity: 1, transform: 'rotateY(0deg) scale(1)' },
          leave: { opacity: 0, transform: 'rotateY(-90deg) scale(0.8)' },
        };
      default:
        return {
          from: { opacity: 0, transform: 'scale(0.9)' },
          enter: { opacity: 1, transform: 'scale(1)' },
          leave: { opacity: 0, transform: 'scale(0.9)' },
        };
    }
  };

  const modalTransition = useTransition(isOpen, {
    ...getModalAnimation(),
    config: config.gentle,
  });

  // Drag gesture for mobile-friendly closing
  const [dragSpring, setDragSpring] = useSpring(() => ({
    transform: 'translateY(0px)',
    config: config.gentle,
  }));

  const bind = useGesture({
    onDrag: ({ down, movement: [, my], cancel }) => {
      if (my < -50) cancel();
      
      setDragSpring.start({
        transform: `translateY(${down ? Math.max(0, my) : 0}px)`,
        immediate: down,
      });

      if (!down && my > 100) {
        onClose?.();
      }
    },
  });

  // Keyboard handling
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  return (
    <>
      {backdropTransition((style, item) =>
        item ? (
          <animated.div
            style={style}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeOnBackdrop ? onClose : undefined}
          >
            {modalTransition((modalStyle, modalItem) =>
              modalItem ? (
                <animated.div
                  {...bind()}
                  style={{ ...modalStyle, ...dragSpring }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drag indicator for mobile */}
                  <div className="flex justify-center py-2 bg-gray-50 dark:bg-gray-700 md:hidden">
                    <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>
                  
                  {/* Modal content */}
                  <div className="overflow-y-auto max-h-[calc(90vh-40px)]">
                    {children}
                  </div>
                </animated.div>
              ) : null
            )}
          </animated.div>
        ) : null
      )}
    </>
  );
};

export default EnhancedModal;