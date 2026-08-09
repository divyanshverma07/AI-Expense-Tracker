from fastapi import FastAPI
from sqlalchemy import text

from .database import engine
from . import models

from .routers import users
from .routers import expenses
from .routers import income
from .routers import budget


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