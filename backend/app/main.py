from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
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
from .routers import financial_profile
from .routers import financial_health
from .routers import receipt
from .routers import expense_prediction
from .routers import goals
from .routers import financial_insights
from .routers import budget_prediction

# ==========================================
# CREATE FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="AI Expense Tracker API",
    description="Backend API for AI-Based Expense Tracker",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-expense-tracker-1-gv1y.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==========================================
# ROUTERS
# ==========================================

app.include_router(users.router)

# Static expense-related routes MUST come before
# /expenses/{expense_id}
app.include_router(expense_prediction.router)
app.include_router(receipt.router)

app.include_router(expenses.router)

app.include_router(income.router)
app.include_router(budget_prediction.router)
app.include_router(budget.router)
app.include_router(dashboard.router)
app.include_router(financial_profile.router)
app.include_router(financial_health.router)
app.include_router(goals.router)
app.include_router(financial_insights.router)

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