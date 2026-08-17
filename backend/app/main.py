from fastapi import FastAPI, Depends
from sqlalchemy import text

from .database import engine
from . import models
from .auth import get_current_user
from .models import User

from .routers import users
from .routers import expenses
from .routers import income
from .routers import budget
from .routers import dashboard


# ==========================================
# CREATE FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="AI Expense Tracker API",
    description="Backend API for AI-Based Expense Tracker",
    version="1.0.0"
)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(budget.router)
app.include_router(dashboard.router)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "AI Expense Tracker API is running"
    }


# ==========================================
# DATABASE TEST
# ==========================================

@app.get("/test-db")
def test_database():

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "PostgreSQL database connected successfully"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


# ==========================================
# CURRENT USER TEST
# ==========================================

@app.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "user_id": current_user.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }