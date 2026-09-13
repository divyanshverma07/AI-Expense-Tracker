from datetime import date
from sqlalchemy import func, extract


from sqlalchemy.orm import Session

from . import models, schemas


# ==========================================
# USER CRUD
# ==========================================

def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


def get_user(db: Session, user_id: int):
    return (
        db.query(models.User)
        .filter(models.User.user_id == user_id)
        .first()
    )


def create_user(
    db: Session,
    user: schemas.UserCreate,
    password_hash: str
):
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        password_hash=password_hash
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# ==========================================
# EXPENSE CRUD
# ==========================================

def create_expense(
    db: Session,
    expense: schemas.ExpenseCreate,
    user_id: int,
    category: str | None = None
):
    db_expense = models.Expense(
        user_id=user_id,
        amount=expense.amount,
        description=expense.description,
        category=category,
        payment_method=expense.payment_method,
        expense_date=expense.expense_date
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense


def get_expenses(
    db: Session,
    user_id: int
):
    return (
        db.query(models.Expense)
        .filter(models.Expense.user_id == user_id)
        .order_by(models.Expense.expense_date.desc())
        .all()
    )


def get_expense(
    db: Session,
    expense_id: int,
    user_id: int
):
    return (
        db.query(models.Expense)
        .filter(
            models.Expense.expense_id == expense_id,
            models.Expense.user_id == user_id
        )
        .first()
    )


def update_expense(
    db: Session,
    db_expense: models.Expense,
    expense: schemas.ExpenseCreate,
    category: str | None = None
):
    db_expense.amount = expense.amount
    db_expense.description = expense.description
    db_expense.category = category
    db_expense.payment_method = expense.payment_method
    db_expense.expense_date = expense.expense_date

    db.commit()
    db.refresh(db_expense)

    return db_expense


def delete_expense(
    db: Session,
    db_expense: models.Expense
):
    db.delete(db_expense)
    db.commit()

    return True


# ==========================================
# INCOME CRUD
# ==========================================

def create_income(
    db: Session,
    income: schemas.IncomeCreate,
    user_id: int
):
    db_income = models.Income(
        user_id=user_id,
        source=income.source,
        amount=income.amount,
        income_date=income.income_date,
        description=income.description
    )

    db.add(db_income)
    db.commit()
    db.refresh(db_income)

    return db_income


def get_incomes(
    db: Session,
    user_id: int
):
    return (
        db.query(models.Income)
        .filter(models.Income.user_id == user_id)
        .order_by(models.Income.income_date.desc())
        .all()
    )


def get_income(
    db: Session,
    income_id: int,
    user_id: int
):
    return (
        db.query(models.Income)
        .filter(
            models.Income.income_id == income_id,
            models.Income.user_id == user_id
        )
        .first()
    )


def update_income(
    db: Session,
    db_income: models.Income,
    income: schemas.IncomeCreate
):
    db_income.source = income.source
    db_income.amount = income.amount
    db_income.income_date = income.income_date
    db_income.description = income.description

    db.commit()
    db.refresh(db_income)

    return db_income


def delete_income(
    db: Session,
    db_income: models.Income
):
    db.delete(db_income)
    db.commit()

    return True


# ==========================================
# BUDGET CRUD
# ==========================================

def create_budget(
    db: Session,
    budget: schemas.BudgetCreate,
    user_id: int
):
    db_budget = models.Budget(
        user_id=user_id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        month=budget.month,
        year=budget.year
    )

    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)

    return db_budget


def get_budgets(
    db: Session,
    user_id: int
):
    return (
        db.query(models.Budget)
        .filter(models.Budget.user_id == user_id)
        .order_by(
            models.Budget.year.desc(),
            models.Budget.month.desc()
        )
        .all()
    )


def get_budget(
    db: Session,
    budget_id: int,
    user_id: int
):
    return (
        db.query(models.Budget)
        .filter(
            models.Budget.budget_id == budget_id,
            models.Budget.user_id == user_id
        )
        .first()
    )


def update_budget(
    db: Session,
    db_budget: models.Budget,
    budget: schemas.BudgetCreate
):
    db_budget.category = budget.category
    db_budget.monthly_limit = budget.monthly_limit
    db_budget.month = budget.month
    db_budget.year = budget.year

    db.commit()
    db.refresh(db_budget)

    return db_budget


def delete_budget(
    db: Session,
    db_budget: models.Budget
):
    db.delete(db_budget)
    db.commit()

    return True

# ==========================================
# DASHBOARD CRUD
# ==========================================




def get_dashboard_data(
    db: Session,
    user_id: int
):
    today = date.today()

    current_month = today.month
    current_year = today.year

    # ------------------------------------------
    # TOTAL INCOME
    # ------------------------------------------

    total_income = (
        db.query(func.coalesce(func.sum(models.Income.amount), 0))
        .filter(
            models.Income.user_id == user_id
        )
        .scalar()
    )

    # ------------------------------------------
    # TOTAL EXPENSES
    # ------------------------------------------

    total_expenses = (
        db.query(func.coalesce(func.sum(models.Expense.amount), 0))
        .filter(
            models.Expense.user_id == user_id
        )
        .scalar()
    )

    # ------------------------------------------
    # TOTAL SAVINGS
    # ------------------------------------------

    total_savings = total_income - total_expenses

    # ------------------------------------------
    # MONTHLY INCOME
    # ------------------------------------------

    monthly_income = (
        db.query(func.coalesce(func.sum(models.Income.amount), 0))
        .filter(
            models.Income.user_id == user_id,
            func.extract(
                "month",
                models.Income.income_date
            ) == current_month,
            func.extract(
                "year",
                models.Income.income_date
            ) == current_year
        )
        .scalar()
    )

    # ------------------------------------------
    # MONTHLY EXPENSES
    # ------------------------------------------

    monthly_expenses = (
        db.query(func.coalesce(func.sum(models.Expense.amount), 0))
        .filter(
            models.Expense.user_id == user_id,
            func.extract(
                "month",
                models.Expense.expense_date
            ) == current_month,
            func.extract(
                "year",
                models.Expense.expense_date
            ) == current_year
        )
        .scalar()
    )

    # ------------------------------------------
    # CATEGORY-WISE EXPENSES
    # ------------------------------------------

    category_data = (
        db.query(
            models.Expense.category,
            func.sum(models.Expense.amount)
        )
        .filter(
            models.Expense.user_id == user_id,
            func.extract(
                "month",
                models.Expense.expense_date
            ) == current_month,
            func.extract(
                "year",
                models.Expense.expense_date
            ) == current_year
        )
        .group_by(
            models.Expense.category
        )
        .all()
    )

    category_wise_expenses = []

    for category, amount in category_data:
        category_wise_expenses.append(
            {
                "category": category or "Others",
                "amount": amount
            }
        )

    # ------------------------------------------
    # MONTHLY BUDGET
    # ------------------------------------------

    monthly_budget = (
        db.query(
            func.coalesce(
                func.sum(models.Budget.monthly_limit),
                0
            )
        )
        .filter(
            models.Budget.user_id == user_id,
            models.Budget.month == current_month,
            models.Budget.year == current_year
        )
        .scalar()
    )

    # ------------------------------------------
    # BUDGET USED
    # ------------------------------------------

    budget_used = monthly_expenses

    # ------------------------------------------
    # BUDGET USAGE %
    # ------------------------------------------

    if monthly_budget > 0:
        budget_usage_percentage = float(
            (budget_used / monthly_budget) * 100
        )
    else:
        budget_usage_percentage = 0.0

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_savings": total_savings,

        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,

        "category_wise_expenses": category_wise_expenses,

        "monthly_budget": monthly_budget,
        "budget_used": budget_used,
        "budget_usage_percentage": budget_usage_percentage
    }
    
    
# ==========================================
# FINANCIAL PROFILE CRUD
# ==========================================

def get_financial_profile(
    db: Session,
    user_id: int
):
    return (
        db.query(models.FinancialProfile)
        .filter(
            models.FinancialProfile.user_id == user_id
        )
        .first()
    )


def create_financial_profile(
    db: Session,
    profile: schemas.FinancialProfileCreate,
    user_id: int
):
    # Check if profile already exists
    existing_profile = get_financial_profile(
        db,
        user_id
    )

    if existing_profile:
        return None

    db_profile = models.FinancialProfile(
        user_id=user_id,
        age=profile.age,
        dependents=profile.dependents,
        occupation=profile.occupation,
        city_tier=profile.city_tier,
        desired_savings_percentage=profile.desired_savings_percentage,
        desired_savings=profile.desired_savings
    )

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return db_profile


def update_financial_profile(
    db: Session,
    db_profile: models.FinancialProfile,
    profile: schemas.FinancialProfileCreate
):
    db_profile.age = profile.age
    db_profile.dependents = profile.dependents
    db_profile.occupation = profile.occupation
    db_profile.city_tier = profile.city_tier
    db_profile.desired_savings_percentage = (
        profile.desired_savings_percentage
    )
    db_profile.desired_savings = profile.desired_savings

    db.commit()
    db.refresh(db_profile)

    return db_profile      

# ==========================================
# FINANCIAL HEALTH DATA
# ==========================================

def get_financial_health_data(
    db: Session,
    user_id: int
):
    from datetime import date

    today = date.today()

    current_month = today.month
    current_year = today.year

    # --------------------------------------
    # Get financial profile
    # --------------------------------------

    profile = (
        db.query(models.FinancialProfile)
        .filter(
            models.FinancialProfile.user_id == user_id
        )
        .first()
    )

    if profile is None:
        return None, "Financial profile not found"

    # --------------------------------------
    # Calculate current month income
    # --------------------------------------

    income_result = (
        db.query(
            func.coalesce(
                func.sum(models.Income.amount),
                0
            )
        )
        .filter(
            models.Income.user_id == user_id,
            extract(
                "month",
                models.Income.income_date
            ) == current_month,
            extract(
                "year",
                models.Income.income_date
            ) == current_year
        )
        .scalar()
    )

    income = float(income_result or 0)

    if income <= 0:
        return None, "No income found for the current month"

    # --------------------------------------
    # Get current month expenses
    # --------------------------------------

    expenses = (
        db.query(models.Expense)
        .filter(
            models.Expense.user_id == user_id,
            extract(
                "month",
                models.Expense.expense_date
            ) == current_month,
            extract(
                "year",
                models.Expense.expense_date
            ) == current_year
        )
        .all()
    )

    # --------------------------------------
    # Initialize ML categories
    # --------------------------------------

    financial_data = {
        "Income": income,
        "Age": profile.age,
        "Dependents": profile.dependents,
        "Occupation": profile.occupation,
        "City_Tier": profile.city_tier,

        "Rent": 0,
        "Loan_Repayment": 0,
        "Insurance": 0,
        "Groceries": 0,
        "Transport": 0,
        "Eating_Out": 0,
        "Entertainment": 0,
        "Utilities": 0,
        "Healthcare": 0,
        "Education": 0,
        "Miscellaneous": 0,

        "Desired_Savings_Percentage": float(
            profile.desired_savings_percentage
        ),

        "Desired_Savings": float(
            profile.desired_savings
        )
    }

    # --------------------------------------
    # Expense category mapping
    # --------------------------------------

    category_mapping = {
        "Food": "Eating_Out",
        "Groceries": "Groceries",
        "Rent": "Rent",
        "EMI": "Loan_Repayment",
        "Insurance": "Insurance",
        "Transport": "Transport",
        "Entertainment": "Entertainment",
        "Utilities": "Utilities",
        "Healthcare": "Healthcare",
        "Education": "Education",
        "Miscellaneous": "Miscellaneous"
    }

    # --------------------------------------
    # Add expenses to ML features
    # --------------------------------------

    for expense in expenses:

        category = expense.category
        amount = float(expense.amount or 0)

        if category in category_mapping:

            feature_name = category_mapping[category]

            financial_data[feature_name] += amount

    return financial_data, None   

def get_expense_forecasting_data(db, user_id):
    return db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).order_by(
        models.Expense.expense_date.asc()
    ).all()
    
# ==========================================
# FINANCIAL GOAL CRUD
# ==========================================

def create_financial_goal(db, goal, user_id):
    db_goal = models.FinancialGoal(
        user_id=user_id,
        goal_name=goal.goal_name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        priority=goal.priority,
        status="Active"
    )

    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    return db_goal
def get_financial_goals(db, user_id):
    return db.query(models.FinancialGoal).filter(
        models.FinancialGoal.user_id == user_id
    ).order_by(
        models.FinancialGoal.target_date.asc()
    ).all()
    
def get_financial_goal(db, goal_id, user_id):
    return db.query(models.FinancialGoal).filter(
        models.FinancialGoal.goal_id == goal_id,
        models.FinancialGoal.user_id == user_id
    ).first()
    
def update_financial_goal(db, db_goal, goal):
    if goal.goal_name is not None:
        db_goal.goal_name = goal.goal_name

    if goal.target_amount is not None:
        db_goal.target_amount = goal.target_amount

    if goal.current_amount is not None:
        db_goal.current_amount = goal.current_amount

    if goal.target_date is not None:
        db_goal.target_date = goal.target_date

    if goal.priority is not None:
        db_goal.priority = goal.priority

    if goal.status is not None:
        db_goal.status = goal.status

    # Automatically mark goal as completed
    # when current amount reaches target amount.
    if db_goal.current_amount >= db_goal.target_amount:
        db_goal.status = "Completed"

    db.commit()
    db.refresh(db_goal)

    return db_goal

def delete_financial_goal(db, db_goal):
    db.delete(db_goal)
    db.commit()

    return True

def get_goal_plan(db, goal, user_id):
    today = date.today()

    # Remaining amount
    remaining_amount = max(
        float(goal.target_amount) - float(goal.current_amount),
        0
    )

    # Calculate months remaining
    months_remaining = (
        (goal.target_date.year - today.year) * 12
        + (goal.target_date.month - today.month)
    )

    # If target date is already reached
    if goal.target_date <= today:
        months_remaining = 0

    # Required monthly saving
    if remaining_amount <= 0:
        required_monthly_saving = 0
    elif months_remaining > 0:
        required_monthly_saving = (
            remaining_amount / months_remaining
        )
    else:
        required_monthly_saving = remaining_amount

    # ------------------------------------------
    # Estimate user's monthly saving capacity
    # ------------------------------------------

    current_month = today.month
    current_year = today.year

    monthly_income = db.query(
        func.coalesce(func.sum(models.Income.amount), 0)
    ).filter(
        models.Income.user_id == user_id,
        extract("month", models.Income.income_date) == current_month,
        extract("year", models.Income.income_date) == current_year
    ).scalar()

    monthly_expenses = db.query(
        func.coalesce(func.sum(models.Expense.amount), 0)
    ).filter(
        models.Expense.user_id == user_id,
        extract("month", models.Expense.expense_date) == current_month,
        extract("year", models.Expense.expense_date) == current_year
    ).scalar()

    monthly_income = float(monthly_income or 0)
    monthly_expenses = float(monthly_expenses or 0)

    estimated_monthly_saving = max(
        monthly_income - monthly_expenses,
        0
    )

    feasible = (
        estimated_monthly_saving >= required_monthly_saving
    )

    return {
        "goal_id": goal.goal_id,
        "goal_name": goal.goal_name,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "remaining_amount": round(remaining_amount, 2),
        "target_date": goal.target_date,
        "months_remaining": months_remaining,
        "required_monthly_saving": round(
            required_monthly_saving,
            2
        ),
        "estimated_monthly_saving": round(
            estimated_monthly_saving,
            2
        ),
        "feasible": feasible,
        "status": goal.status
    }
    
# ==========================================
# FINANCIAL INSIGHTS DATA
# ==========================================

def get_financial_insights_data(db, user_id):
    from datetime import date

    today = date.today()
    current_month = today.month
    current_year = today.year

    # ------------------------------------------
    # Monthly Income
    # ------------------------------------------

    monthly_income = db.query(
        func.coalesce(
            func.sum(models.Income.amount),
            0
        )
    ).filter(
        models.Income.user_id == user_id,
        extract(
            "month",
            models.Income.income_date
        ) == current_month,
        extract(
            "year",
            models.Income.income_date
        ) == current_year
    ).scalar()

    # ------------------------------------------
    # Monthly Expenses
    # ------------------------------------------

    monthly_expenses = db.query(
        func.coalesce(
            func.sum(models.Expense.amount),
            0
        )
    ).filter(
        models.Expense.user_id == user_id,
        extract(
            "month",
            models.Expense.expense_date
        ) == current_month,
        extract(
            "year",
            models.Expense.expense_date
        ) == current_year
    ).scalar()

    monthly_income = float(monthly_income or 0)
    monthly_expenses = float(monthly_expenses or 0)

    monthly_savings = (
        monthly_income - monthly_expenses
    )

    # ------------------------------------------
    # Category-wise Expenses
    # ------------------------------------------

    expenses = db.query(
        models.Expense
    ).filter(
        models.Expense.user_id == user_id,
        extract(
            "month",
            models.Expense.expense_date
        ) == current_month,
        extract(
            "year",
            models.Expense.expense_date
        ) == current_year
    ).all()

    category_expenses = {}

    for expense in expenses:

        category = (
            expense.category
            or "Miscellaneous"
        )

        category_expenses[category] = (
            category_expenses.get(category, 0)
            + float(expense.amount)
        )

    # ------------------------------------------
    # Financial Health
    # ------------------------------------------

    financial_health_score = None
    financial_health = None

    try:
        financial_health_data, health_error = (
            get_financial_health_data(
                db,
                user_id
            )
        )

        if not health_error:

            from .services.financial_health import (
                predict_financial_health
            )

            health_result = predict_financial_health(
                financial_health_data
            )

            financial_health_score = (
                health_result.get(
                    "financial_health_score"
                )
            )

            financial_health = (
                health_result.get(
                    "financial_health"
                )
            )

    except Exception:
        # Financial insights should still work
        # even if health prediction is unavailable.
        pass

    # ------------------------------------------
    # Goals
    # ------------------------------------------

    goals = get_financial_goals(
        db,
        user_id
    )

    goal_data = []

    for goal in goals:

        try:
            plan = get_goal_plan(
                db,
                goal,
                user_id
            )

            goal_data.append({
                "goal_name": plan["goal_name"],
                "required_monthly_saving": plan[
                    "required_monthly_saving"
                ],
                "estimated_monthly_saving": plan[
                    "estimated_monthly_saving"
                ],
                "feasible": plan["feasible"],
                "status": plan["status"]
            })

        except Exception:
            continue

    return {
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "monthly_savings": monthly_savings,
        "category_expenses": category_expenses,
        "financial_health_score": financial_health_score,
        "financial_health": financial_health,
        "goals": goal_data
    } 
    
from collections import defaultdict
from datetime import date

import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_budget(expenses):
    """
    Predict next month's category-wise expenses
    and recommend a budget for each category.
    """

    if not expenses:
        raise ValueError(
            "No expense history available for budget prediction."
        )

    # --------------------------------------------------
    # 1. Group expenses by month and category
    # --------------------------------------------------

    monthly_category = defaultdict(lambda: defaultdict(float))

    for expense in expenses:
        month = expense.expense_date.strftime("%Y-%m")
        category = expense.category or "Miscellaneous"

        monthly_category[month][category] += float(
            expense.amount
        )

    sorted_months = sorted(monthly_category.keys())

    if len(sorted_months) < 2:
        raise ValueError(
            "At least 2 months of expense history are required "
            "for budget prediction."
        )

    # --------------------------------------------------
    # 2. Get all categories
    # --------------------------------------------------

    categories = set()

    for month in sorted_months:
        categories.update(
            monthly_category[month].keys()
        )

    # --------------------------------------------------
    # 3. Predict each category
    # --------------------------------------------------

    predictions = []

    next_month = (
        pd.Period(sorted_months[-1], freq="M") + 1
    )

    for category in sorted(categories):

        values = [
            monthly_category[month].get(
                category,
                0
            )
            for month in sorted_months
        ]

        X = pd.DataFrame({
            "month_index": range(len(values))
        })

        y = values

        model = LinearRegression()
        model.fit(X, y)

        predicted_expense = model.predict(
            [[len(values)]]
        )[0]

        predicted_expense = max(
            0,
            float(predicted_expense)
        )

        # --------------------------------------------------
        # Recommended budget
        #
        # Add 10% safety buffer so the user has some
        # flexibility if actual spending is slightly higher.
        # --------------------------------------------------

        recommended_budget = predicted_expense * 1.10

        predictions.append({
            "category": category,
            "predicted_expense": round(
                predicted_expense,
                2
            ),
            "recommended_budget": round(
                recommended_budget,
                2
            )
        })

    # --------------------------------------------------
    # 4. Calculate totals
    # --------------------------------------------------

    predicted_total = sum(
        item["predicted_expense"]
        for item in predictions
    )

    recommended_total = sum(
        item["recommended_budget"]
        for item in predictions
    )

    return {
        "forecast_month": str(next_month),
        "historical_months": len(sorted_months),
        "predicted_total": round(
            predicted_total,
            2
        ),
        "recommended_total_budget": round(
            recommended_total,
            2
        ),
        "category_predictions": predictions
    }
    # ==========================================
# BUDGET PREDICTION DATA
# ==========================================

def get_budget_prediction_data(db, user_id):
    return db.query(
        models.Expense
    ).filter(
        models.Expense.user_id == user_id
    ).order_by(
        models.Expense.expense_date.asc()
    ).all()