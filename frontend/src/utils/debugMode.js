// Debug mode utility
export const isDebugMode = () => {
  // Show debug panel in development mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Show debug panel if ?debug=true in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') {
    return true;
  }
  
  // Show debug panel if localStorage debug flag is set
  try {
    if (localStorage.getItem('debug_mode') === 'enabled') {
      return true;
    }
  } catch (error) {
    // localStorage not available
  }
  
  return false;
};

// Enable debug mode programmatically
export const enableDebugMode = () => {
  try {
    localStorage.setItem('debug_mode', 'enabled');
    window.location.reload();
  } catch (error) {
    console.warn('Could not enable debug mode:', error);
  }
};

// Disable debug mode
export const disableDebugMode = () => {
  try {
    localStorage.removeItem('debug_mode');
    window.location.reload();
  } catch (error) {
    console.warn('Could not disable debug mode:', error);
  }
};

// Toggle debug mode
export const toggleDebugMode = () => {
  if (isDebugMode()) {
    disableDebugMode();
  } else {
    enableDebugMode();
  }
};

// Add global debug functions for console access
if (typeof window !== 'undefined') {
  window.enableDebug = enableDebugMode;
  window.disableDebug = disableDebugMode;
  window.toggleDebug = toggleDebugMode;
}