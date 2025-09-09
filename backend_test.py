#!/usr/bin/env python3
"""
Backend API Test Suite for Atal Idea Generator
Tests actual backend endpoints: health, components, AI generation, and LLM connection
"""

import requests
import json
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
                required_fields = ["status", "timestamp", "emergent_llm_available", "version"]
                
                if all(field in data for field in required_fields) and data["status"] == "healthy":
                    emergent_status = data.get("emergent_llm_available", False)
                    self.log_test("Health Check", True, 
                                f"Health endpoint working correctly. Emergent LLM: {'Available' if emergent_status else 'Not Available'}", 
                                {"status_code": response.status_code, "response": data})
                else:
                    self.log_test("Health Check", False, "Missing required fields in health response", 
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
                if isinstance(components, list) and len(components) > 0:
                    # Verify component structure
                    first_component = components[0]
                    required_fields = ["id", "name", "category", "description"]
                    
                    if all(field in first_component for field in required_fields):
                        self.log_test("Get All Components", True, f"Retrieved {len(components)} components with correct structure",
                                    {"count": len(components), "sample": components[:2]})
                        
                        # Test GET component by ID if components exist
                        component_id = first_component.get("id")
                        if component_id:
                            self.test_get_component_by_id(component_id)
                        
                        # Test GET components by category
                        category = first_component.get("category")
                        if category:
                            self.test_get_components_by_category(category)
                    else:
                        self.log_test("Get All Components", False, "Components missing required fields",
                                    {"required_fields": required_fields, "sample": first_component})
                else:
                    self.log_test("Get All Components", False, "Response is not a list or is empty",
                                {"response_type": type(components).__name__, "length": len(components) if isinstance(components, list) else "N/A"})
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
    
    def test_llm_connection(self):
        """Test /api/test-llm endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/test-llm", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data:
                    if data["success"]:
                        self.log_test("LLM Connection Test", True, "LLM connection successful",
                                    {"model": data.get("model"), "response": data.get("response")})
                    else:
                        self.log_test("LLM Connection Test", False, f"LLM connection failed: {data.get('message')}",
                                    {"error": data.get("error")})
                else:
                    self.log_test("LLM Connection Test", False, "Invalid response format",
                                {"response": data})
            else:
                self.log_test("LLM Connection Test", False, f"Unexpected status code: {response.status_code}",
                            {"status_code": response.status_code, "response": response.text})
                
        except requests.exceptions.RequestException as e:
            self.log_test("LLM Connection Test", False, f"Connection error: {str(e)}")
    
    def test_ai_idea_generation(self):
        """Test /api/generate-ideas endpoint - the main AI feature"""
        try:
            # Test with realistic components and preferences
            generation_request = {
                "selected_components": [
                    {"id": "arduino_uno", "name": "Arduino Uno", "category": "Microcontrollers"},
                    {"id": "led", "name": "LED", "category": "Display"},
                    {"id": "ultrasonic_sensor", "name": "Ultrasonic Sensor", "category": "Sensors"}
                ],
                "preferences": {
                    "theme": "Smart Home",
                    "skillLevel": "Beginner",
                    "count": 3,
                    "duration": "2-3 hours",
                    "teamSize": "Individual"
                },
                "model_id": "gpt-4o-mini"
            }
            
            print("🤖 Testing AI idea generation with realistic components...")
            response = self.session.post(f"{API_BASE}/generate-ideas", 
                                       json=generation_request, timeout=30)
            
            if response.status_code == 200:
                generated_ideas = response.json()
                if isinstance(generated_ideas, list) and len(generated_ideas) > 0:
                    first_idea = generated_ideas[0]
                    required_fields = ["id", "title", "description", "components", "difficulty", "estimated_cost"]
                    
                    if all(field in first_idea for field in required_fields):
                        self.log_test("AI Idea Generation", True, 
                                    f"Generated {len(generated_ideas)} ideas successfully",
                                    {"ideas_count": len(generated_ideas), 
                                     "sample_title": first_idea.get("title"),
                                     "sample_difficulty": first_idea.get("difficulty")})
                    else:
                        missing_fields = [field for field in required_fields if field not in first_idea]
                        self.log_test("AI Idea Generation", False, "Generated ideas missing required fields",
                                    {"missing_fields": missing_fields, "sample_idea": first_idea})
                else:
                    self.log_test("AI Idea Generation", False, "No ideas generated or invalid format",
                                {"response_type": type(generated_ideas).__name__, 
                                 "response_length": len(generated_ideas) if isinstance(generated_ideas, list) else "N/A"})
            elif response.status_code == 500:
                error_data = response.json() if response.headers.get('content-type') == 'application/json' else {"detail": response.text}
                self.log_test("AI Idea Generation", False, f"Server error: {error_data.get('detail', 'Unknown error')}",
                            {"status_code": response.status_code, "error": error_data})
            else:
                self.log_test("AI Idea Generation", False, f"Unexpected status code: {response.status_code}",
                            {"status_code": response.status_code, "response": response.text})
                
        except requests.exceptions.RequestException as e:
            self.log_test("AI Idea Generation", False, f"Connection error: {str(e)}")
    
    def test_ai_generation_edge_cases(self):
        """Test AI generation with edge cases"""
        
        # Test with empty components
        try:
            empty_request = {
                "selected_components": [],
                "preferences": {"theme": "General", "skillLevel": "Beginner", "count": 1}
            }
            
            response = self.session.post(f"{API_BASE}/generate-ideas", 
                                       json=empty_request, timeout=15)
            
            if response.status_code in [400, 422]:
                self.log_test("AI Generation - Empty Components", True, "Proper error handling for empty components")
            elif response.status_code == 200:
                self.log_test("AI Generation - Empty Components", True, "Handled empty components gracefully")
            else:
                self.log_test("AI Generation - Empty Components", False, f"Unexpected response: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("AI Generation - Empty Components", False, f"Connection error: {str(e)}")
        
        # Test with invalid request format
        try:
            invalid_request = {"invalid_field": "test"}
            
            response = self.session.post(f"{API_BASE}/generate-ideas", 
                                       json=invalid_request, timeout=15)
            
            if response.status_code in [400, 422]:
                self.log_test("AI Generation - Invalid Request", True, "Proper validation for invalid request format")
            else:
                self.log_test("AI Generation - Invalid Request", False, f"Should reject invalid request: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("AI Generation - Invalid Request", False, f"Connection error: {str(e)}")
    
    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("🚀 Starting Atal Idea Generator Backend API Tests")
        print("=" * 60)
        
        # Test all actual endpoints
        self.test_health_check()
        self.test_components_api()
        self.test_llm_connection()
        self.test_ai_idea_generation()
        self.test_ai_generation_edge_cases()
        
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