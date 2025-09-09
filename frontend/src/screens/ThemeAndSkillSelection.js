import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Users, Clock, Target, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import { useUser } from '../contexts/UserContext';
import DevelopedByFooter from '../components/common/DevelopedByFooter';

const ThemeAndSkillSelection = () => {
  const navigate = useNavigate();
  const { userPreferences, updateUserPreferences } = useUser();
  
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [preferredDuration, setPreferredDuration] = useState('1-2 hours');
  const [teamSize, setTeamSize] = useState('Individual');
  const [interests, setInterests] = useState([]);

  const themes = [
    { id: 'robotics', name: 'Robotics', color: 'bg-blue-500', description: 'Automated systems and mechanical engineering' },
    { id: 'iot', name: 'IoT & Smart Home', color: 'bg-green-500', description: 'Internet of Things and connected devices' },
    { id: 'ai', name: 'Artificial Intelligence', color: 'bg-purple-500', description: 'Machine learning and intelligent systems' },
    { id: 'environmental', name: 'Environmental Tech', color: 'bg-emerald-500', description: 'Sustainability and eco-friendly solutions' },
    { id: 'health', name: 'Health & Medical', color: 'bg-red-500', description: 'Healthcare technology and monitoring' },
    { id: 'agriculture', name: 'Smart Agriculture', color: 'bg-yellow-500', description: 'Modern farming and crop monitoring' },
    { id: 'education', name: 'Educational Tools', color: 'bg-indigo-500', description: 'Learning aids and teaching technology' },
    { id: 'security', name: 'Security & Safety', color: 'bg-orange-500', description: 'Protection and monitoring systems' },
  ];

  const skillLevels = [
    { value: 'Beginner', label: 'Beginner', description: 'New to electronics and programming' },
    { value: 'Intermediate', label: 'Intermediate', description: 'Some experience with basic projects' },
    { value: 'Advanced', label: 'Advanced', description: 'Experienced with complex implementations' },
  ];

  const durations = [
    '30 minutes - 1 hour',
    '1-2 hours',
    '2-4 hours',
    '4-8 hours',
    '1-2 days',
    '1 week+',
  ];

  const teamSizes = [
    'Individual',
    '2-3 people',
    '4-6 people',
    '7+ people',
  ];

  const interestAreas = [
    'Programming', 'Hardware Design', 'Data Analysis', 'User Interface',
    'Mobile Development', 'Web Development', '3D Printing', 'Circuit Design',
    'Machine Learning', 'Computer Vision', 'Sensors', 'Automation',
  ];

  useEffect(() => {
    if (userPreferences) {
      setSelectedThemes(userPreferences.selected_themes || []);
      setSkillLevel(userPreferences.skill_level || 'Beginner');
      setPreferredDuration(userPreferences.preferred_duration || '1-2 hours');
      setTeamSize(userPreferences.team_size || 'Individual');
      setInterests(userPreferences.interests || []);
    }
  }, [userPreferences]);

  const toggleTheme = (themeId) => {
    setSelectedThemes(prev => 
      prev.includes(themeId)
        ? prev.filter(t => t !== themeId)
        : [...prev, themeId]
    );
  };

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSaveAndContinue = async () => {
    if (selectedThemes.length === 0) {
      toast.error('Please select at least one theme');
      return;
    }

    const preferences = {
      selected_themes: selectedThemes,
      skill_level: skillLevel,
      preferred_duration: preferredDuration,
      team_size: teamSize,
      interests: interests,
      notifications_enabled: userPreferences?.notifications_enabled ?? true,
      dark_mode_enabled: userPreferences?.dark_mode_enabled ?? false,
    };

    try {
      await updateUserPreferences(preferences);
      toast.success('Preferences saved successfully!');
      navigate('/generate');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Save preferences error:', error);
    }
  };

  const handleBack = () => {
    navigate('/components');
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Customize Your Experience
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about your preferences to get personalized project ideas
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </button>
              
              <button
                onClick={handleSaveAndContinue}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Project Themes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Project Themes
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select the themes that interest you most (choose multiple)
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedThemes.includes(theme.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
                onClick={() => toggleTheme(theme.id)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {theme.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {theme.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Skill Level */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Skill Level
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {skillLevels.map((level) => (
              <div
                key={level.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  skillLevel === level.value
                    ? 'border-secondary bg-secondary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-secondary/50'
                }`}
                onClick={() => setSkillLevel(level.value)}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {level.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {level.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Project Duration & Team Size */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Preferred Duration
              </h2>
            </div>
            
            <div className="space-y-2">
              {durations.map((duration) => (
                <label
                  key={duration}
                  className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={duration}
                    checked={preferredDuration === duration}
                    onChange={(e) => setPreferredDuration(e.target.value)}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">
                    {duration}
                  </span>
                </label>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Size
              </h2>
            </div>
            
            <div className="space-y-2">
              {teamSizes.map((size) => (
                <label
                  key={size}
                  className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    name="teamSize"
                    value={size}
                    checked={teamSize === size}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Interest Areas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Areas of Interest (Optional)
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {interestAreas.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  interests.includes(interest)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Summary */}
        {selectedThemes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Preferences Summary
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Themes:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedThemes.length} selected
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Skill Level:</span>
                <p className="text-gray-600 dark:text-gray-400">{skillLevel}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                <p className="text-gray-600 dark:text-gray-400">{preferredDuration}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Team Size:</span>
                <p className="text-gray-600 dark:text-gray-400">{teamSize}</p>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      <DevelopedByFooter />
    </div>
  );
};

export default ThemeAndSkillSelection;