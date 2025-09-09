#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Atal Idea Generator
Tests all API endpoints for functionality, error handling, and data integrity
"""

import requests
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List
import sys
import os

# Get backend URL from environment
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_idea_ids = []  # Track created ideas for cleanup
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check", True, "Health endpoint responding correctly", 
                                {"status_code": response.status_code, "response": data})
                else:
                    self.log_test("Health Check", False, "Invalid health response format", 
                                {"status_code": response.status_code, "response": data})
            else:
                self.log_test("Health Check", False, f"Unexpected status code: {response.status_code}",
                            {"status_code": response.status_code, "response": response.text})
                
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
    
    def test_components_api(self):
        """Test components API endpoints"""
        
        # Test GET all components
        try:
            response = self.session.get(f"{API_BASE}/components", timeout=10)
            
            if response.status_code == 200:
                components = response.json()
                if isinstance(components, list):
                    self.log_test("Get All Components", True, f"Retrieved {len(components)} components",
                                {"count": len(components), "sample": components[:2] if components else []})
                    
                    # Test GET component by ID if components exist
                    if components:
                        component_id = components[0].get("id")
                        if component_id:
                            self.test_get_component_by_id(component_id)
                        
                        # Test GET components by category
                        category = components[0].get("category")
                        if category:
                            self.test_get_components_by_category(category)
                else:
                    self.log_test("Get All Components", False, "Response is not a list",
                                {"response_type": type(components).__name__})
            else:
                self.log_test("Get All Components", False, f"Unexpected status code: {response.status_code}",
                            {"status_code": response.status_code, "response": response.text})
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get All Components", False, f"Connection error: {str(e)}")
    
    def test_get_component_by_id(self, component_id: str):
        """Test GET component by ID"""
        try:
            response = self.session.get(f"{API_BASE}/components/{component_id}", timeout=10)
            
            if response.status_code == 200:
                component = response.json()
                if "id" in component and component["id"] == component_id:
                    self.log_test("Get Component by ID", True, "Component retrieved successfully",
                                {"component_id": component_id, "name": component.get("name")})
                else:
                    self.log_test("Get Component by ID", False, "Component ID mismatch",
                                {"expected_id": component_id, "received_id": component.get("id")})
            elif response.status_code == 404:
                self.log_test("Get Component by ID", True, "Proper 404 handling for non-existent component")
            else:
                self.log_test("Get Component by ID", False, f"Unexpected status code: {response.status_code}",
                            {"status_code": response.status_code})
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get Component by ID", False, f"Connection error: {str(e)}")
    
    def test_get_components_by_category(self, category: str):
        """Test GET components by category"""
        try:
            response = self.session.get(f"{API_BASE}/components/category/{category}", timeout=10)
            
            if response.status_code == 200:
                components = response.json()
                if isinstance(components, list):
                    # Verify all components belong to the requested category
                    valid_category = all(comp.get("category") == category for comp in components)
                    if valid_category:
                        self.log_test("Get Components by Category", True, 
                                    f"Retrieved {len(components)} components for category '{category}'",
                                    {"category": category, "count": len(components)})
                    else:
                        self.log_test("Get Components by Category", False, 
                                    "Some components don't match requested category",
                                    {"category": category, "components": components})
                else:
                    self.log_test("Get Components by Category", False, "Response is not a list")
            else:
                self.log_test("Get Components by Category", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get Components by Category", False, f"Connection error: {str(e)}")
    
    def test_user_preferences(self):
        """Test user preferences GET and POST endpoints"""
        
        # Test GET preferences
        try:
            response = self.session.get(f"{API_BASE}/preferences", timeout=10)
            
            if response.status_code == 200:
                preferences = response.json()
                if "id" in preferences and "skill_level" in preferences:
                    self.log_test("Get User Preferences", True, "Preferences retrieved successfully",
                                {"skill_level": preferences.get("skill_level")})
                    
                    # Test POST preferences (update)
                    self.test_save_user_preferences(preferences)
                else:
                    self.log_test("Get User Preferences", False, "Invalid preferences format",
                                {"response": preferences})
            else:
                self.log_test("Get User Preferences", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get User Preferences", False, f"Connection error: {str(e)}")
    
    def test_save_user_preferences(self, current_prefs: Dict):
        """Test POST user preferences"""
        try:
            # Update some preferences
            updated_prefs = current_prefs.copy()
            updated_prefs["skill_level"] = "Intermediate"
            updated_prefs["selected_themes"] = ["Agriculture", "IoT"]
            updated_prefs["interests"] = ["Automation", "Sensors"]
            updated_prefs["dark_mode_enabled"] = True
            
            response = self.session.post(f"{API_BASE}/preferences", 
                                       json=updated_prefs, timeout=10)
            
            if response.status_code == 200:
                saved_prefs = response.json()
                if (saved_prefs.get("skill_level") == "Intermediate" and 
                    saved_prefs.get("dark_mode_enabled") == True):
                    self.log_test("Save User Preferences", True, "Preferences saved successfully",
                                {"skill_level": saved_prefs.get("skill_level"),
                                 "themes": saved_prefs.get("selected_themes")})
                else:
                    self.log_test("Save User Preferences", False, "Preferences not saved correctly",
                                {"expected": updated_prefs, "received": saved_prefs})
            else:
                self.log_test("Save User Preferences", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Save User Preferences", False, f"Connection error: {str(e)}")
    
    def test_ideas_crud_operations(self):
        """Test CRUD operations for ideas"""
        
        # Test GET all ideas first
        try:
            response = self.session.get(f"{API_BASE}/ideas", timeout=10)
            
            if response.status_code == 200:
                ideas = response.json()
                if isinstance(ideas, list):
                    self.log_test("Get All Ideas", True, f"Retrieved {len(ideas)} saved ideas",
                                {"count": len(ideas)})
                    
                    # Test CREATE idea
                    self.test_create_idea()
                    
                    # Test search ideas
                    self.test_search_ideas()
                    
                else:
                    self.log_test("Get All Ideas", False, "Response is not a list")
            else:
                self.log_test("Get All Ideas", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get All Ideas", False, f"Connection error: {str(e)}")
    
    def test_create_idea(self):
        """Test POST new idea"""
        try:
            new_idea = {
                "id": str(uuid.uuid4()),
                "title": "Smart Home Security System",
                "description": "An IoT-based security system with motion detection and smartphone alerts",
                "problem_statement": "Home security is a major concern for homeowners when they are away",
                "working_principle": "Motion sensors detect movement and send alerts via WiFi to smartphone app",
                "difficulty": "Intermediate",
                "estimated_cost": "₹1,500",
                "components": ["ESP32", "PIR Motion Sensor", "Camera Module", "Buzzer"],
                "innovation_elements": ["Real-time alerts", "Cloud storage", "Mobile app integration"],
                "scalability_options": ["Multiple room monitoring", "AI-powered threat detection"],
                "availability": "Available",
                "is_favorite": False,
                "tags": ["Security", "IoT", "Home Automation"],
                "notes": "Test idea for backend validation"
            }
            
            response = self.session.post(f"{API_BASE}/ideas", json=new_idea, timeout=10)
            
            if response.status_code == 200:
                created_idea = response.json()
                idea_id = created_idea.get("id")
                self.created_idea_ids.append(idea_id)  # Track for cleanup
                
                if created_idea.get("title") == new_idea["title"]:
                    self.log_test("Create New Idea", True, "Idea created successfully",
                                {"idea_id": idea_id, "title": created_idea.get("title")})
                    
                    # Test UPDATE idea
                    self.test_update_idea(idea_id, created_idea)
                    
                    # Test toggle favorite
                    self.test_toggle_favorite(idea_id)
                    
                else:
                    self.log_test("Create New Idea", False, "Created idea doesn't match input")
            else:
                self.log_test("Create New Idea", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Create New Idea", False, f"Connection error: {str(e)}")
    
    def test_update_idea(self, idea_id: str, original_idea: Dict):
        """Test PUT update idea"""
        try:
            updated_idea = original_idea.copy()
            updated_idea["title"] = "Enhanced Smart Home Security System"
            updated_idea["notes"] = "Updated with enhanced features"
            updated_idea["is_favorite"] = True
            
            response = self.session.put(f"{API_BASE}/ideas/{idea_id}", 
                                      json=updated_idea, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if (result.get("title") == "Enhanced Smart Home Security System" and 
                    result.get("is_favorite") == True):
                    self.log_test("Update Idea", True, "Idea updated successfully",
                                {"idea_id": idea_id, "new_title": result.get("title")})
                else:
                    self.log_test("Update Idea", False, "Idea not updated correctly")
            else:
                self.log_test("Update Idea", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Update Idea", False, f"Connection error: {str(e)}")
    
    def test_toggle_favorite(self, idea_id: str):
        """Test PATCH toggle favorite"""
        try:
            response = self.session.patch(f"{API_BASE}/ideas/{idea_id}/favorite?is_favorite=true", 
                                        timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if "message" in result:
                    self.log_test("Toggle Favorite", True, "Favorite status updated successfully",
                                {"idea_id": idea_id, "message": result.get("message")})
                else:
                    self.log_test("Toggle Favorite", False, "Invalid response format")
            else:
                self.log_test("Toggle Favorite", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Toggle Favorite", False, f"Connection error: {str(e)}")
    
    def test_search_ideas(self):
        """Test GET search ideas"""
        try:
            search_query = "Smart"
            response = self.session.get(f"{API_BASE}/ideas/search?query={search_query}", 
                                      timeout=10)
            
            if response.status_code == 200:
                search_results = response.json()
                if isinstance(search_results, list):
                    self.log_test("Search Ideas", True, f"Search returned {len(search_results)} results",
                                {"query": search_query, "results_count": len(search_results)})
                else:
                    self.log_test("Search Ideas", False, "Search results not in list format")
            else:
                self.log_test("Search Ideas", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Search Ideas", False, f"Connection error: {str(e)}")
    
    def test_ai_idea_generation(self):
        """Test /api/generate-ideas endpoint"""
        try:
            generation_request = {
                "selected_components": ["Arduino Uno", "Soil Moisture Sensor", "Water Pump"],
                "theme": "Agriculture",
                "count": 3
            }
            
            response = self.session.post(f"{API_BASE}/generate-ideas", 
                                       json=generation_request, timeout=15)
            
            if response.status_code == 200:
                generated_ideas = response.json()
                if isinstance(generated_ideas, list) and len(generated_ideas) > 0:
                    first_idea = generated_ideas[0]
                    if all(key in first_idea for key in ["title", "description", "components"]):
                        self.log_test("AI Idea Generation", True, 
                                    f"Generated {len(generated_ideas)} ideas successfully",
                                    {"ideas_count": len(generated_ideas), 
                                     "sample_title": first_idea.get("title")})
                    else:
                        self.log_test("AI Idea Generation", False, "Generated ideas missing required fields",
                                    {"sample_idea": first_idea})
                else:
                    self.log_test("AI Idea Generation", False, "No ideas generated or invalid format")
            else:
                self.log_test("AI Idea Generation", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("AI Idea Generation", False, f"Connection error: {str(e)}")
    
    def test_user_stats(self):
        """Test user statistics endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/stats", timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                if "ideas_generated" in stats and "projects_completed" in stats:
                    self.log_test("Get User Stats", True, "User statistics retrieved successfully",
                                {"ideas_generated": stats.get("ideas_generated"),
                                 "projects_completed": stats.get("projects_completed")})
                else:
                    self.log_test("Get User Stats", False, "Invalid stats format")
            else:
                self.log_test("Get User Stats", False, f"Unexpected status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get User Stats", False, f"Connection error: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up test data created during testing"""
        for idea_id in self.created_idea_ids:
            try:
                response = self.session.delete(f"{API_BASE}/ideas/{idea_id}", timeout=10)
                if response.status_code == 200:
                    self.log_test("Cleanup Test Data", True, f"Deleted test idea {idea_id}")
                else:
                    self.log_test("Cleanup Test Data", False, f"Failed to delete test idea {idea_id}")
            except Exception as e:
                self.log_test("Cleanup Test Data", False, f"Error deleting idea {idea_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("🚀 Starting Atal Idea Generator Backend API Tests")
        print("=" * 60)
        
        # Test all endpoints
        self.test_health_check()
        self.test_components_api()
        self.test_user_preferences()
        self.test_ideas_crud_operations()
        self.test_ai_idea_generation()
        self.test_user_stats()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed_tests, failed_tests, self.test_results

def main():
    """Main test execution"""
    tester = BackendTester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()