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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
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
    
    # ==========================================
# DASHBOARD SCHEMAS
# ==========================================

class CategoryExpense(BaseModel):
    category: str
    amount: Decimal


class DashboardResponse(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    total_savings: Decimal

    monthly_income: Decimal
    monthly_expenses: Decimal

    category_wise_expenses: list[CategoryExpense]

    monthly_budget: Decimal
    budget_used: Decimal
    budget_usage_percentage: float
  
# ==========================================
# FINANCIAL PROFILE SCHEMAS
# ==========================================

class FinancialProfileCreate(BaseModel):
    age: int = Field(ge=18, le=100)
    dependents: int = Field(ge=0, le=20)
    occupation: str = Field(min_length=1, max_length=50)
    city_tier: str = Field(min_length=1, max_length=20)
    desired_savings_percentage: Decimal = Field(
        ge=0,
        le=100
    )
    desired_savings: Decimal = Field(
        ge=0
    )


class FinancialProfileResponse(BaseModel):
    profile_id: int
    user_id: int
    age: int
    dependents: int
    occupation: str
    city_tier: str
    desired_savings_percentage: Decimal
    desired_savings: Decimal
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

# ==========================================
# FINANCIAL GOAL SCHEMAS
# ==========================================

class FinancialGoalCreate(BaseModel):
    goal_name: str = Field(
        min_length=1,
        max_length=100
    )

    target_amount: Decimal = Field(
        gt=0
    )

    current_amount: Decimal = Field(
        ge=0
    )

    target_date: date

    priority: str = Field(
        default="Medium",
        min_length=1,
        max_length=20
    )


class FinancialGoalUpdate(BaseModel):
    goal_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    target_amount: Decimal | None = Field(
        default=None,
        gt=0
    )

    current_amount: Decimal | None = Field(
        default=None,
        ge=0
    )

    target_date: date | None = None

    priority: str | None = Field(
        default=None,
        min_length=1,
        max_length=20
    )

    status: str | None = Field(
        default=None,
        min_length=1,
        max_length=20
    )


class FinancialGoalResponse(BaseModel):
    goal_id: int
    user_id: int
    goal_name: str
    target_amount: Decimal
    current_amount: Decimal
    target_date: date
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True
    )


class FinancialGoalPlanResponse(BaseModel):
    goal_id: int
    goal_name: str
    target_amount: Decimal
    current_amount: Decimal
    remaining_amount: Decimal
    target_date: date
    months_remaining: int
    required_monthly_saving: Decimal
    estimated_monthly_saving: Decimal
    feasible: bool
    status: str