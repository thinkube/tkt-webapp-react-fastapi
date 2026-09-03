"""Database models for the application"""
# Import models to ensure they're registered with SQLAlchemy
from app.models.task import Task

__all__ = ["Task"]