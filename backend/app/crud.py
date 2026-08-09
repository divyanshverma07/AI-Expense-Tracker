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
    expense: schemas.ExpenseCreate
):
    db_expense.amount = expense.amount
    db_expense.description = expense.description
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