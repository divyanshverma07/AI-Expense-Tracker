from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, ConfigDict, Field


# ==========================================
# USER SCHEMAS
# ==========================================

class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# LOGIN SCHEMA
# ==========================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ==========================================
# INCOME SCHEMAS
# ==========================================

class IncomeCreate(BaseModel):
    source: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(gt=0)
    income_date: date
    description: str | None = None


class IncomeResponse(BaseModel):
    income_id: int
    user_id: int
    source: str
    amount: Decimal
    income_date: date
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# EXPENSE SCHEMAS
# ==========================================

class ExpenseCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1)
    payment_method: str | None = None
    expense_date: date


class ExpenseResponse(BaseModel):
    expense_id: int
    user_id: int
    amount: Decimal
    description: str
    category: str | None
    payment_method: str | None
    expense_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# BUDGET SCHEMAS
# ==========================================

class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    monthly_limit: Decimal = Field(gt=0)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2020)


class BudgetResponse(BaseModel):
    budget_id: int
    user_id: int
    category: str
    monthly_limit: Decimal
    month: int
    year: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# PREDICTION SCHEMAS
# ==========================================

class PredictionResponse(BaseModel):
    prediction_id: int
    user_id: int
    prediction_month: int
    prediction_year: int
    predicted_amount: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
    