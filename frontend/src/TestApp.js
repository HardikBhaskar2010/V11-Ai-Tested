import React from 'react';
import TestComponentsScreen from './screens/TestComponentsScreen';
import './index.css';

// Simple test app that directly shows components
function TestApp() {
  return (
    <div className="TestApp">
      <TestComponentsScreen />
    </div>
  );
}

export default TestApp;