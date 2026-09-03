"""
Task management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from typing import List, Optional, Literal
from datetime import datetime

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.task import Task as TaskModel, TaskStatus, TaskPriority

router = APIRouter()


class TaskBase(BaseModel):
    """Base task schema"""
    title: str
    description: str
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Schema for creating tasks"""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating tasks"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None


class Task(TaskBase):
    """Task response schema"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[Task])
@router.get("/", response_model=List[Task])
async def list_tasks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all tasks for the current user.
    Requires authentication.
    """
    tasks = db.query(TaskModel).filter(TaskModel.user_id == current_user.sub).all()
    return tasks


@router.post("", response_model=Task)
@router.post("/", response_model=Task)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new task.
    Requires authentication.
    """
    db_task = TaskModel(
        user_id=current_user.sub,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific task by ID.
    Requires authentication.
    """
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user.sub
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a task.
    Requires authentication.
    """
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user.sub
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields if provided
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a task.
    Requires authentication.
    """
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user.sub
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}