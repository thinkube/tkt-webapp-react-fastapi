# tests/test_tasks.py
"""Test task management endpoints."""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime


def test_tasks_list_unauthenticated(client: TestClient):
    """Test GET /api/v1/tasks without auth"""
    response = client.get("/api/v1/tasks")
    assert response.status_code == 401


def test_tasks_list_authenticated(client: TestClient, mock_user):
    """Test GET /api/v1/tasks with auth"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    response = client.get("/api/v1/tasks", headers={"Authorization": "Bearer mock_token"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    del client.app.dependency_overrides[get_current_user]


def test_task_create_full(client: TestClient, mock_user):
    """Test POST /api/v1/tasks with all fields"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    task_data = {
        "title": "Complete project proposal",
        "description": "Write and submit the Q4 project proposal",
        "status": "todo",
        "priority": "high",
        "due_date": "2024-12-31T17:00:00"
    }
    
    response = client.post("/api/v1/tasks", 
                          json=task_data,
                          headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["description"] == task_data["description"]
    assert data["status"] == task_data["status"]
    assert data["priority"] == task_data["priority"]
    assert data["due_date"] == task_data["due_date"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    
    del client.app.dependency_overrides[get_current_user]


def test_task_create_minimal(client: TestClient, mock_user):
    """Test POST /api/v1/tasks with minimal fields"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    task_data = {
        "title": "Quick task",
        "description": "A simple task"
    }
    
    response = client.post("/api/v1/tasks", 
                          json=task_data,
                          headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["description"] == task_data["description"]
    assert data["status"] == "todo"  # Default status
    assert data["priority"] == "medium"  # Default priority
    assert data["due_date"] is None  # No due date
    
    del client.app.dependency_overrides[get_current_user]


def test_task_get(client: TestClient, mock_user):
    """Test GET /api/v1/tasks/{task_id}"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    # First create a task
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "in_progress",
        "priority": "low"
    }
    
    create_response = client.post("/api/v1/tasks", 
                                 json=task_data,
                                 headers={"Authorization": "Bearer mock_token"})
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]
    
    # Then get it
    response = client.get(f"/api/v1/tasks/{task_id}", 
                         headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == task_data["title"]
    assert data["description"] == task_data["description"]
    assert data["status"] == task_data["status"]
    assert data["priority"] == task_data["priority"]
    
    del client.app.dependency_overrides[get_current_user]


def test_task_update_status(client: TestClient, mock_user):
    """Test PUT /api/v1/tasks/{task_id} - updating status"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    # First create a task
    create_response = client.post("/api/v1/tasks", 
                                 json={"title": "Task to update", "description": "Will change status"},
                                 headers={"Authorization": "Bearer mock_token"})
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]
    
    # Update status from todo to in_progress
    update_data = {"status": "in_progress"}
    
    response = client.put(f"/api/v1/tasks/{task_id}", 
                         json=update_data,
                         headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"
    assert data["title"] == "Task to update"  # Unchanged
    
    # Update to done
    response = client.put(f"/api/v1/tasks/{task_id}", 
                         json={"status": "done"},
                         headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    assert response.json()["status"] == "done"
    
    del client.app.dependency_overrides[get_current_user]


def test_task_update_all_fields(client: TestClient, mock_user):
    """Test PUT /api/v1/tasks/{task_id} - updating all fields"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Create initial task
    create_response = client.post("/api/v1/tasks", 
                                 json={"title": "Original", "description": "Original desc"},
                                 headers={"Authorization": "Bearer mock_token"})
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]
    
    # Update everything
    update_data = {
        "title": "Updated Task Title",
        "description": "Completely new description",
        "status": "done",
        "priority": "high",
        "due_date": "2024-06-30T12:00:00"
    }
    
    response = client.put(f"/api/v1/tasks/{task_id}", 
                         json=update_data,
                         headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["status"] == update_data["status"]
    assert data["priority"] == update_data["priority"]
    assert data["due_date"] == update_data["due_date"]
    
    del client.app.dependency_overrides[get_current_user]


def test_task_delete(client: TestClient, mock_user):
    """Test DELETE /api/v1/tasks/{task_id}"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    # First create a task
    create_response = client.post("/api/v1/tasks", 
                                 json={"title": "Task to delete", "description": "Will be deleted"},
                                 headers={"Authorization": "Bearer mock_token"})
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]
    
    # Then delete it
    response = client.delete(f"/api/v1/tasks/{task_id}", 
                            headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 200
    assert response.json()["message"] == "Task deleted successfully"
    
    # Verify it's gone
    get_response = client.get(f"/api/v1/tasks/{task_id}", 
                             headers={"Authorization": "Bearer mock_token"})
    assert get_response.status_code == 404
    
    del client.app.dependency_overrides[get_current_user]


def test_task_invalid_status(client: TestClient, mock_user):
    """Test POST /api/v1/tasks with invalid status"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    task_data = {
        "title": "Invalid task",
        "description": "Has invalid status",
        "status": "invalid_status"
    }
    
    response = client.post("/api/v1/tasks", 
                          json=task_data,
                          headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 422  # Validation error
    
    del client.app.dependency_overrides[get_current_user]


def test_task_invalid_priority(client: TestClient, mock_user):
    """Test POST /api/v1/tasks with invalid priority"""
    from app.core.security import get_current_user
    
    async def override_get_current_user():
        return mock_user
    
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    task_data = {
        "title": "Invalid task",
        "description": "Has invalid priority",
        "priority": "urgent"  # Should be low/medium/high
    }
    
    response = client.post("/api/v1/tasks", 
                          json=task_data,
                          headers={"Authorization": "Bearer mock_token"})
    
    assert response.status_code == 422  # Validation error
    
    del client.app.dependency_overrides[get_current_user]