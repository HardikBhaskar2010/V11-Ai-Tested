#!/usr/bin/env python3
"""
Atal Idea Generator Backend Server
FastAPI backend with Emergent LLM integration for AI idea generation
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import asyncio
import uuid
from datetime import datetime
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Emergent LLM integration
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False
    print("❌ emergentintegrations not available. Installing...")

app = FastAPI(title="Atal Idea Generator API", version="1.0.0")

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Component(BaseModel):
    id: str
    name: str
    category: str
    description: str = ""

class GenerationRequest(BaseModel):
    selected_components: List[Dict[str, Any]]
    preferences: Dict[str, Any] = {}
    model_id: str = "gpt-4o-mini"

class IdeaResponse(BaseModel):
    id: str
    title: str
    description: str
    problem_statement: str = ""
    working_principle: str = ""
    components: List[str] = []
    difficulty: str = "Beginner"
    estimated_cost: str = "₹500-1000"
    innovation_elements: List[str] = []
    scalability_options: List[str] = []
    learning_outcomes: List[str] = []
    tags: List[str] = []
    availability: str = "Available"
    is_favorite: bool = False
    created_at: str
    updated_at: str
    generated_by: str = "gpt-4o-mini"

# Sample components data
SAMPLE_COMPONENTS = [
    {"id": "arduino_uno", "name": "Arduino Uno", "category": "Microcontrollers", "description": "Popular microcontroller board"},
    {"id": "esp32", "name": "ESP32", "category": "Microcontrollers", "description": "WiFi and Bluetooth enabled microcontroller"},
    {"id": "led", "name": "LED", "category": "Display", "description": "Light Emitting Diode"},
    {"id": "servo_motor", "name": "Servo Motor", "category": "Actuators", "description": "Precise position control motor"},
    {"id": "ultrasonic_sensor", "name": "Ultrasonic Sensor", "category": "Sensors", "description": "Distance measurement sensor"},
    {"id": "temp_humidity", "name": "Temperature & Humidity Sensor", "category": "Sensors", "description": "DHT22 sensor for environmental monitoring"},
    {"id": "pir_sensor", "name": "PIR Motion Sensor", "category": "Sensors", "description": "Passive infrared motion detector"},
    {"id": "buzzer", "name": "Buzzer", "category": "Audio", "description": "Sound generating component"},
    {"id": "relay", "name": "Relay Module", "category": "Control", "description": "Switch for controlling high power devices"},
    {"id": "lcd_display", "name": "LCD Display", "category": "Display", "description": "16x2 character display"},
]

# LLM Chat instance
llm_chat = None

def get_llm_chat():
    """Get or create LLM chat instance"""
    global llm_chat
    if llm_chat is None:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not found in environment")
        
        llm_chat = LlmChat(
            api_key=api_key,
            session_id="atal_idea_generator",
            system_message="""You are an expert electronics engineer and innovative STEM educator with deep reasoning capabilities. 
You specialize in creating practical, educational, and exciting project ideas that solve real-world problems.

Your expertise includes:
- Electronics and embedded systems design
- IoT and smart device development  
- Robotics and automation systems
- Sustainable technology solutions
- Educational project design and pedagogy
- Problem-solving through systematic reasoning

Always respond with valid JSON only. No additional text, explanations, or reasoning outside the JSON structure."""
        ).with_model("openai", "gpt-4o-mini")
    
    return llm_chat

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "emergent_llm_available": EMERGENT_AVAILABLE,
        "version": "1.0.0"
    }

@app.get("/api/components")
async def get_components():
    """Get all available components"""
    return SAMPLE_COMPONENTS

@app.get("/api/components/{component_id}")
async def get_component(component_id: str):
    """Get component by ID"""
    component = next((c for c in SAMPLE_COMPONENTS if c["id"] == component_id), None)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@app.get("/api/components/category/{category}")
async def get_components_by_category(category: str):
    """Get components by category"""
    components = [c for c in SAMPLE_COMPONENTS if c["category"].lower() == category.lower()]
    return components

@app.post("/api/generate-ideas")
async def generate_ideas(request: GenerationRequest):
    """Generate project ideas using Emergent LLM"""
    try:
        if not EMERGENT_AVAILABLE:
            raise HTTPException(status_code=500, detail="Emergent LLM integration not available")
        
        # Extract preferences
        preferences = request.preferences
        theme = preferences.get('theme', 'General')
        skill_level = preferences.get('skillLevel', 'Beginner')
        count = preferences.get('count', 5)
        duration = preferences.get('duration', '1-2 hours')
        team_size = preferences.get('teamSize', 'Individual')
        
        # Extract component names
        component_names = [comp.get('name', str(comp)) for comp in request.selected_components]
        components_str = ", ".join(component_names)
        
        # Create the prompt
        user_prompt = f"""Using your reasoning capabilities, analyze these components and create {count} innovative electronics project ideas: {components_str}

Project Context & Requirements:
- Theme Focus: {theme}
- Target Skill Level: {skill_level}  
- Project Duration: {duration}
- Team Configuration: {team_size}
- Priority: Educational value + practical real-world application

Think through each project systematically:
1. What real problem can these components solve?
2. How do the components work together technically?
3. What makes this project innovative and educational?
4. Is it appropriate for the {skill_level} skill level?
5. What can be learned from building this?

Required JSON Response Format:
{{
  "projects": [
    {{
      "title": "Creative and descriptive project name",
      "description": "Clear 2-3 sentence overview of what the project does",
      "problem_statement": "Specific real-world problem this project addresses",
      "working_principle": "Technical explanation of how the system operates",
      "components": ["Array", "of", "required", "components", "from", "available", "list"],
      "difficulty": "{skill_level}",
      "estimated_cost": "₹realistic cost range based on components",
      "innovation_elements": ["unique", "creative", "features"],
      "scalability_options": ["ways", "to", "expand", "the", "project"],
      "learning_outcomes": ["specific", "skills", "and", "concepts", "learned"],
      "tags": ["relevant", "technical", "keywords"]
    }}
  ]
}}

Quality Requirements for Each Project:
✅ Technically feasible with given components
✅ Educationally valuable for {skill_level} makers
✅ Solves a genuine real-world problem
✅ Creative and engaging to build
✅ Clear learning progression and outcomes
✅ Appropriate complexity for {duration} timeframe
✅ Suitable for {team_size} work style

Use your reasoning to ensure each project meets all these criteria."""

        # Get LLM chat instance
        chat = get_llm_chat()
        
        # Create user message
        user_message = UserMessage(text=user_prompt)
        
        # Send message and get response
        response = await chat.send_message(user_message)
        
        # Parse the JSON response
        try:
            parsed_response = json.loads(response)
            projects = parsed_response.get('projects', [])
            
            # Convert to IdeaResponse format
            ideas = []
            for i, project in enumerate(projects):
                idea = IdeaResponse(
                    id=f"generated_{int(datetime.now().timestamp())}_{i}",
                    title=project.get('title', f'Untitled Project {i+1}'),
                    description=project.get('description', 'No description provided'),
                    problem_statement=project.get('problem_statement', ''),
                    working_principle=project.get('working_principle', ''),
                    components=project.get('components', component_names),
                    difficulty=project.get('difficulty', skill_level),
                    estimated_cost=project.get('estimated_cost', '₹500-1000'),
                    innovation_elements=project.get('innovation_elements', []),
                    scalability_options=project.get('scalability_options', []),
                    learning_outcomes=project.get('learning_outcomes', []),
                    tags=project.get('tags', [theme, skill_level]),
                    availability="Available",
                    is_favorite=False,
                    created_at=datetime.now().isoformat(),
                    updated_at=datetime.now().isoformat(),
                    generated_by="gpt-4o-mini"
                )
                ideas.append(idea.dict())
            
            return ideas
            
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Raw response: {response}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
            
    except Exception as e:
        print(f"Generate ideas error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate ideas: {str(e)}")

@app.get("/api/test-llm")
async def test_llm_connection():
    """Test LLM connection"""
    try:
        if not EMERGENT_AVAILABLE:
            return {"success": False, "message": "Emergent LLM integration not available"}
        
        chat = get_llm_chat()
        user_message = UserMessage(text="Say 'Connection successful' and nothing else.")
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "message": "LLM connection successful",
            "response": response,
            "model": "gpt-4o-mini"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Connection failed: {str(e)}",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)