from fastapi import FastAPI
from sqlalchemy import text

from .database import engine

app = FastAPI(
    title="AI Expense Tracker API",
    description="Backend API for AI-Based Expense Tracker",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Expense Tracker API is running"
    }


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