#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime
import time

class EscapeRoomAPITester:
    def __init__(self, base_url="https://cryptquest-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.room_id = None
        self.player_id = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, str(e))
            return False

    def test_create_room(self):
        """Test room creation"""
        try:
            payload = {"player_name": "TestPlayer1"}
            response = requests.post(f"{self.api_url}/rooms/create", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "room_id" in data and "player_id" in data:
                    self.room_id = data["room_id"]
                    self.player_id = data["player_id"]
                    self.log_test("Create Room", True, f"Room ID: {self.room_id}")
                    return True
                else:
                    self.log_test("Create Room", False, "Missing room_id or player_id in response")
                    return False
            else:
                self.log_test("Create Room", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Create Room", False, str(e))
            return False

    def test_get_room(self):
        """Test getting room details"""
        if not self.room_id:
            self.log_test("Get Room", False, "No room_id available")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/rooms/{self.room_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["room_id", "host_id", "players", "status"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Get Room", True, f"Status: {data.get('status')}")
                    return True
                else:
                    self.log_test("Get Room", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Get Room", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Room", False, str(e))
            return False

    def test_join_room(self):
        """Test joining an existing room"""
        if not self.room_id:
            self.log_test("Join Room", False, "No room_id available")
            return False
        
        try:
            payload = {
                "player_name": "TestPlayer2",
                "room_id": self.room_id
            }
            response = requests.post(f"{self.api_url}/rooms/join", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "room_id" in data and "player_id" in data:
                    self.log_test("Join Room", True, f"Player ID: {data['player_id']}")
                    return True
                else:
                    self.log_test("Join Room", False, "Missing room_id or player_id in response")
                    return False
            else:
                self.log_test("Join Room", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Join Room", False, str(e))
            return False

    def test_join_nonexistent_room(self):
        """Test joining a non-existent room"""
        try:
            payload = {
                "player_name": "TestPlayer3",
                "room_id": "nonexistent"
            }
            response = requests.post(f"{self.api_url}/rooms/join", json=payload, timeout=10)
            
            # Should return 404 for non-existent room
            if response.status_code == 404:
                self.log_test("Join Nonexistent Room", True, "Correctly returned 404")
                return True
            else:
                self.log_test("Join Nonexistent Room", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Join Nonexistent Room", False, str(e))
            return False

    def test_get_nonexistent_room(self):
        """Test getting details of non-existent room"""
        try:
            response = requests.get(f"{self.api_url}/rooms/nonexistent", timeout=10)
            
            # Should return 404 for non-existent room
            if response.status_code == 404:
                self.log_test("Get Nonexistent Room", True, "Correctly returned 404")
                return True
            else:
                self.log_test("Get Nonexistent Room", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Nonexistent Room", False, str(e))
            return False

    def test_socket_endpoint(self):
        """Test if Socket.IO endpoint is accessible"""
        try:
            # Test Socket.IO handshake endpoint
            response = requests.get(f"{self.base_url}/socket.io/?EIO=4&transport=polling", timeout=10)
            
            if response.status_code == 200:
                # Check if response contains Socket.IO handshake data
                if "sid" in response.text or "0{" in response.text:
                    self.log_test("Socket.IO Endpoint", True, "Socket.IO handshake successful")
                    return True
                else:
                    self.log_test("Socket.IO Endpoint", False, "Invalid Socket.IO response")
                    return False
            else:
                self.log_test("Socket.IO Endpoint", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Socket.IO Endpoint", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting The Locked Study API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test room creation and management
        self.test_create_room()
        self.test_get_room()
        self.test_join_room()
        
        # Test error handling
        self.test_join_nonexistent_room()
        self.test_get_nonexistent_room()
        
        # Test Socket.IO
        self.test_socket_endpoint()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_details": self.test_results,
            "room_created": self.room_id,
            "timestamp": datetime.now().isoformat()
        }

def main():
    tester = EscapeRoomAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = tester.get_test_results()
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())