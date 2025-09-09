import OpenAI from 'openai';

// OpenRouter service using OpenAI SDK
class OpenRouterService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.REACT_APP_OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true
    });
    
    // Validate API key on initialization
    if (!process.env.REACT_APP_OPENROUTER_API_KEY) {
      console.error('🔑 REACT_APP_OPENROUTER_API_KEY is not set in environment variables');
    } else {
      console.log('🔑 OpenRouter API key loaded successfully');
    }
  }

  // Generate project ideas based on components and preferences
  async generateIdeas(components, preferences = {}) {
    try {
      const {
        theme = 'General',
        skillLevel = 'Beginner',
        count = 5,
        duration = '1-2 hours',
        teamSize = 'Individual'
      } = preferences;

      const componentNames = components.map(c => c.name).join(', ');
      
      const prompt = `As an expert in electronics and STEM project development, generate ${count} innovative and practical project ideas using these available components: ${componentNames}.

Project Requirements:
- Theme: ${theme}
- Skill Level: ${skillLevel}
- Expected Duration: ${duration}
- Team Size: ${teamSize}
- Budget: Cost-effective using available components

For each project idea, provide:
1. Title: Creative and descriptive name
2. Description: Brief overview (2-3 sentences)
3. Problem Statement: What real-world problem does it solve?
4. Working Principle: How it works technically
5. Required Components: List from available components
6. Difficulty: ${skillLevel}
7. Estimated Cost: Budget range in ₹
8. Innovation Elements: What makes it unique
9. Scalability Options: How it can be expanded
10. Learning Outcomes: Skills gained from this project

Please respond in valid JSON format as an array of objects with these exact properties:
- title
- description  
- problem_statement
- working_principle
- components (array)
- difficulty
- estimated_cost
- innovation_elements (array)
- scalability_options (array)
- learning_outcomes (array)
- tags (array of relevant keywords)

Ensure each project is feasible, educational, and engaging for ${skillLevel} level makers.`;

      const response = await this.openai.chat.completions.create({
        model: 'deepseek/deepseek-r1', // Using DeepSeek R1 via OpenRouter
        messages: [
          {
            role: 'system',
            content: 'You are an expert electronics engineer and STEM educator specializing in innovative project development. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        // Handle both direct array and object with projects property
        const projects = Array.isArray(parsed) ? parsed : (parsed.projects || []);
        
        // Ensure each project has required fields and proper structure
        return projects.map((project, index) => ({
          id: `generated_${Date.now()}_${index}`,
          title: project.title || `Untitled Project ${index + 1}`,
          description: project.description || 'No description provided',
          problem_statement: project.problem_statement || project.problemStatement || '',
          working_principle: project.working_principle || project.workingPrinciple || '',
          components: Array.isArray(project.components) ? project.components : [],
          difficulty: project.difficulty || skillLevel,
          estimated_cost: project.estimated_cost || project.estimatedCost || '₹500-1000',
          innovation_elements: Array.isArray(project.innovation_elements) ? project.innovation_elements : (project.innovationElements || []),
          scalability_options: Array.isArray(project.scalability_options) ? project.scalability_options : (project.scalabilityOptions || []),
          learning_outcomes: Array.isArray(project.learning_outcomes) ? project.learning_outcomes : (project.learningOutcomes || []),
          tags: Array.isArray(project.tags) ? project.tags : [theme, skillLevel],
          availability: 'Available',
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      } catch (parseError) {
        console.error('Failed to parse OpenRouter response:', parseError);
        console.log('Raw response:', content);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenRouter API key.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 500) {
        throw new Error('OpenRouter service temporarily unavailable. Please try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(`Failed to generate ideas: ${error.message}`);
    }
  }

  // Get available models from OpenRouter
  async getAvailableModels() {
    try {
      // OpenRouter models that work well for idea generation
      return [
        {
          id: 'deepseek/deepseek-r1',
          name: 'DeepSeek R1',
          description: 'Latest reasoning model from DeepSeek, excellent for complex problem solving and creative tasks',
          provider: 'DeepSeek'
        },
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          description: 'Most capable OpenAI model, excellent for creative tasks',
          provider: 'OpenAI'
        },
        {
          id: 'openai/gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Fast and efficient, good for quick idea generation',
          provider: 'OpenAI'
        },
        {
          id: 'anthropic/claude-3.5-sonnet',
          name: 'Claude 3.5 Sonnet',
          description: 'Excellent reasoning and creativity from Anthropic',
          provider: 'Anthropic'
        },
        {
          id: 'google/gemini-pro-1.5',
          name: 'Gemini Pro 1.5',
          description: 'Google\'s latest model with strong analytical capabilities',
          provider: 'Google'
        }
      ];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [
        {
          id: 'deepseek/deepseek-r1',
          name: 'DeepSeek R1',
          description: 'Default reasoning model for idea generation',
          provider: 'DeepSeek'
        }
      ];
    }
  }

  // Test the connection to OpenRouter
  async testConnection() {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with just "Connection successful" to test the API.'
          }
        ],
        max_tokens: 10
      });

      return {
        success: true,
        message: 'OpenRouter connection successful',
        model: 'deepseek/deepseek-r1',
        response: response.choices[0].message.content
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error: error
      };
    }
  }

  // Enhanced idea generation with specific model selection
  async generateIdeasWithModel(components, preferences = {}, modelId = 'deepseek/deepseek-r1') {
    try {
      const {
        theme = 'General',
        skillLevel = 'Beginner',
        count = 5,
        duration = '1-2 hours',
        teamSize = 'Individual'
      } = preferences;

      const componentNames = components.map(c => c.name).join(', ');
      
      const systemPrompt = `You are an expert electronics engineer and innovative STEM educator with deep reasoning capabilities. You specialize in creating practical, educational, and exciting project ideas that solve real-world problems.

Your expertise includes:
- Electronics and embedded systems design
- IoT and smart device development  
- Robotics and automation systems
- Sustainable technology solutions
- Educational project design and pedagogy
- Problem-solving through systematic reasoning

Use your reasoning abilities to analyze the given components and create innovative project ideas that:
1. Make optimal use of available components
2. Address real-world problems effectively
3. Provide clear educational value
4. Are appropriate for the specified skill level
5. Follow sound engineering principles

Always respond with valid JSON only. No additional text, explanations, or reasoning outside the JSON structure.`;

      const userPrompt = `Using your reasoning capabilities, analyze these components and create ${count} innovative electronics project ideas: ${componentNames}

Project Context & Requirements:
- Theme Focus: ${theme}
- Target Skill Level: ${skillLevel}  
- Project Duration: ${duration}
- Team Configuration: ${teamSize}
- Priority: Educational value + practical real-world application

Think through each project systematically:
1. What real problem can these components solve?
2. How do the components work together technically?
3. What makes this project innovative and educational?
4. Is it appropriate for the ${skillLevel} skill level?
5. What can be learned from building this?

Required JSON Response Format:
{
  "projects": [
    {
      "title": "Creative and descriptive project name",
      "description": "Clear 2-3 sentence overview of what the project does",
      "problem_statement": "Specific real-world problem this project addresses",
      "working_principle": "Technical explanation of how the system operates",
      "components": ["Array", "of", "required", "components", "from", "available", "list"],
      "difficulty": "${skillLevel}",
      "estimated_cost": "₹realistic cost range based on components",
      "innovation_elements": ["unique", "creative", "features"],
      "scalability_options": ["ways", "to", "expand", "the", "project"],
      "learning_outcomes": ["specific", "skills", "and", "concepts", "learned"],
      "tags": ["relevant", "technical", "keywords"]
    }
  ]
}

Quality Requirements for Each Project:
✅ Technically feasible with given components
✅ Educationally valuable for ${skillLevel} makers
✅ Solves a genuine real-world problem
✅ Creative and engaging to build
✅ Clear learning progression and outcomes
✅ Appropriate complexity for ${duration} timeframe
✅ Suitable for ${teamSize} work style

Use your reasoning to ensure each project meets all these criteria.`;

      const response = await this.openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      console.log('🔍 OpenRouter Response:', response);
      
      const content = response.choices[0].message.content;
      console.log('📝 Raw API Response Content:', content);
      
      let parsed;
      try {
        parsed = JSON.parse(content);
        console.log('✅ Parsed JSON Response:', parsed);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('📄 Raw content that failed to parse:', content);
        throw new Error('Failed to parse AI response as JSON');
      }
      
      const projects = parsed.projects || [];
      console.log(`💡 Extracted ${projects.length} projects from response`);
      
      if (projects.length === 0) {
        console.warn('⚠️ No projects found in response. Full parsed object:', parsed);
      }

      const mappedProjects = projects.map((project, index) => {
        console.log(`🎯 Mapping project ${index + 1}:`, project.title);
        return {
          id: `generated_${Date.now()}_${index}`,
          title: project.title || `Untitled Project ${index + 1}`,
          description: project.description || 'No description provided',
          problem_statement: project.problem_statement || '',
          working_principle: project.working_principle || '',
          components: project.components || [],
          difficulty: project.difficulty || 'Beginner',
          estimated_cost: project.estimated_cost || '₹500-1000',
          innovation_elements: project.innovation_elements || [],
          scalability_options: project.scalability_options || [],
          learning_outcomes: project.learning_outcomes || [],
          tags: project.tags || [],
          availability: 'Available',
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          generated_by: modelId
        };
      });
      
      console.log(`🚀 Returning ${mappedProjects.length} mapped projects to UI`);
      return mappedProjects;

    } catch (error) {
      console.error('OpenRouter Generation Error:', error);
      throw new Error(`Failed to generate ideas: ${error.message}`);
    }
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();
export default openRouterService;