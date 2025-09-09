#!/usr/bin/env python3
"""
Atal Idea Generator - Single Startup Script
Starts both backend and frontend servers
"""

import subprocess
import sys
import os
import time
import signal
from threading import Thread

class ServerManager:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = False

    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting Backend Server on http://localhost:8001")
        try:
            # Change to backend directory
            os.chdir('/app/backend')
            
            # Install requirements if needed
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                         check=True, capture_output=True)
            
            # Start the backend server
            self.backend_process = subprocess.Popen([
                sys.executable, '-m', 'uvicorn', 'server:app', 
                '--host', '0.0.0.0', '--port', '8001', '--reload'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            print("✅ Backend server started successfully")
            
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False
        return True

    def start_frontend(self):
        """Start the React frontend server"""
        print("🚀 Starting Frontend Server on http://localhost:3000")
        try:
            # Change to frontend directory
            os.chdir('/app/frontend')
            
            # Install dependencies if needed
            if not os.path.exists('node_modules'):
                print("📦 Installing frontend dependencies...")
                subprocess.run(['yarn', 'install'], check=True)
            
            # Start the frontend server
            self.frontend_process = subprocess.Popen([
                'yarn', 'start'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            print("✅ Frontend server started successfully")
            
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False
        return True

    def stop_servers(self):
        """Stop both servers"""
        print("\n🛑 Stopping servers...")
        self.running = False
        
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process.wait()
            print("✅ Backend server stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            self.frontend_process.wait()
            print("✅ Frontend server stopped")

    def signal_handler(self, signum, frame):
        """Handle Ctrl+C"""
        print("\n🛑 Received interrupt signal. Shutting down...")
        self.stop_servers()
        sys.exit(0)

    def start_all(self):
        """Start both servers"""
        print("🌟 Atal Idea Generator - Starting Application")
        print("=" * 50)
        
        # Set up signal handler for Ctrl+C
        signal.signal(signal.SIGINT, self.signal_handler)
        
        # Start backend
        if not self.start_backend():
            return False
        
        # Wait a bit for backend to start
        time.sleep(3)
        
        # Start frontend
        if not self.start_frontend():
            self.stop_servers()
            return False
        
        self.running = True
        
        print("\n" + "=" * 50)
        print("🎉 Application Started Successfully!")
        print("📱 Frontend: http://localhost:3000")
        print("🔧 Backend API: http://localhost:8001")
        print("📚 API Docs: http://localhost:8001/docs")
        print("\n💡 Press Ctrl+C to stop both servers")
        print("=" * 50)
        
        # Keep the main thread alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    manager = ServerManager()
    manager.start_all()