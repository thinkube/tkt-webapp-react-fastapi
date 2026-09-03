# app/api/router.py
from fastapi import APIRouter
from app.api import auth, tasks, tokens

api_router = APIRouter()

# Include the routes from the different modules
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(tokens.router, prefix="/tokens", tags=["api-tokens"])
