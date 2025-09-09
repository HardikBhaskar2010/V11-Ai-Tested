# Atal Idea Generator

An intelligent project idea generation platform that helps students, makers, and innovators create innovative STEM projects based on available electronic components. This comprehensive web application combines AI-powered idea generation with an intuitive user interface to transform hardware components into meaningful learning experiences.

## ✨ Features

- 🤖 **AI-Powered Idea Generation** - Get personalized project suggestions based on your components and skill level
- 🔧 **Component Management** - Browse and select from a comprehensive database of electronic components
- 🎯 **Skill-Based Recommendations** - Projects tailored to Beginner, Intermediate, and Advanced levels
- 📚 **Ideas Library** - Save, organize, and manage your favorite project ideas
- 🌙 **Dark Mode Support** - Beautiful light and dark themes with smooth transitions
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🎨 **Advanced Animations** - Smooth, engaging user interactions with Framer Motion

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Animations
- **State Management**: React Query + Context API
- **Animations**: Framer Motion + React Spring
- **Backend**: FastAPI (Python)
- **Database**: MongoDB with Motor (Async)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Yarn package manager

## 🚀 Quick Start

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

## 📁 Project Structure

```
/app/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── common/         # Shared components
│   │   ├── contexts/           # React Context providers
│   │   │   ├── ThemeContext.js # Theme management
│   │   │   └── UserContext.js  # User state management
│   │   ├── screens/            # Main application screens
│   │   │   ├── OnboardingFlow.js
│   │   │   ├── ComponentSelectionDashboard.js
│   │   │   ├── ThemeAndSkillSelection.js
│   │   │   ├── AIIdeaGeneration.js
│   │   │   ├── IdeasLibrary.js
│   │   │   └── UserProfile.js
│   │   ├── services/           # API service layer
│   │   │   └── apiService.js
│   │   ├── App.js              # Main app component
│   │   └── index.js            # Application entry point
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies and scripts
│   └── tailwind.config.js      # Tailwind configuration
└── backend/                    # FastAPI application
    ├── server.py               # Main FastAPI server
    ├── requirements.txt        # Python dependencies
    └── .env                    # Environment variables
```

## 🎯 Core Workflows

### 1. Onboarding Flow
- Interactive 3-step introduction to app features
- Beautiful animations and smooth transitions
- Skip functionality for returning users

### 2. Component Selection
- Browse comprehensive component database
- Filter by category, availability, and price range
- Grid/List view options with search functionality

### 3. Preference Customization
- Select project themes (Robotics, IoT, AI, etc.)
- Choose skill level and project duration
- Set team size and interest areas

### 4. AI Idea Generation
- Generate 5 personalized project ideas
- View detailed project specifications
- Save favorites to personal library

### 5. Ideas Management
- Comprehensive library with search and filters
- Statistics and analytics dashboard
- Share and export functionality

## 🎨 Design System

### Color Palette
- **Primary**: Green (#2E7D32) - Nature, growth, innovation
- **Secondary**: Blue (#1976D2) - Technology, trust, intelligence  
- **Accent**: Orange (#FF6F00) - Energy, creativity, enthusiasm
- **Surface Light**: (#FAFAFA) - Clean, minimal background
- **Surface Dark**: (#121212) - Elegant dark mode

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive scaling** with fluid typography

### Animation Principles
- **Duration**: 200-500ms for micro-interactions
- **Easing**: Smooth cubic-bezier curves
- **Loading States**: Engaging skeleton screens
- **Hover Effects**: Subtle scale and shadow transforms

## 🔧 API Endpoints

### Components
- `GET /api/components` - List all components
- `GET /api/components/{id}` - Get component details
- `GET /api/components/category/{category}` - Filter by category

### Ideas Management
- `POST /api/generate-ideas` - Generate AI project ideas
- `GET /api/ideas` - Get saved ideas
- `POST /api/ideas` - Save new idea
- `PUT /api/ideas/{id}` - Update idea
- `DELETE /api/ideas/{id}` - Delete idea

### User Preferences
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Save preferences
- `GET /api/stats` - Get user statistics

## 🧪 Testing

Run the test suite:
```bash
# Frontend tests
cd frontend && yarn test

# Backend tests  
cd backend && pytest
```

## 📦 Deployment

### Production Build
```bash
# Frontend
cd frontend && yarn build

# Backend
cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Environment Variables
```bash
# Backend (.env)
MONGO_URL=mongodb://localhost:27017

# Frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🔮 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Integration with online component stores
- [ ] 3D component visualization
- [ ] Project progress tracking
- [ ] Community sharing platform
- [ ] Mobile app (React Native)
- [ ] AR component scanning

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Built with**: React, FastAPI, MongoDB
- **Design Inspiration**: Modern material design principles
- **Icons**: Lucide React icon library
- **Animations**: Framer Motion framework
- **Development Platform**: Emergent platform

---

**Built with ❤️ for the maker community**
