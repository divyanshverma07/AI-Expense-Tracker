from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Date,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


# ==========================================
# USER MODEL
# ==========================================

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationships
    expenses = relationship(
        "Expense",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    incomes = relationship(
        "Income",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    budgets = relationship(
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    predictions = relationship(
        "Prediction",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# ==========================================
# EXPENSE MODEL
# ==========================================

class Expense(Base):
    __tablename__ = "expenses"

    expense_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    category = Column(
        String(50),
        nullable=True,
        index=True
    )

    payment_method = Column(
        String(30),
        nullable=True
    )

    expense_date = Column(
        Date,
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationship
    user = relationship(
        "User",
        back_populates="expenses"
    )


# ==========================================
# INCOME MODEL
# ==========================================

class Income(Base):
    __tablename__ = "income"

    income_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    source = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    income_date = Column(
        Date,
        nullable=False,
        index=True
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationship
    user = relationship(
        "User",
        back_populates="incomes"
    )


# ==========================================
# BUDGET MODEL
# ==========================================

class Budget(Base):
    __tablename__ = "budget"

    budget_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    category = Column(
        String(50),
        nullable=False
    )

    monthly_limit = Column(
        Numeric(10, 2),
        nullable=False
    )

    month = Column(
        Integer,
        nullable=False
    )

    year = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationship
    user = relationship(
        "User",
        back_populates="budgets"
    )


# ==========================================
# PREDICTION MODEL
# ==========================================

class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    prediction_month = Column(
        Integer,
        nullable=False
    )

    prediction_year = Column(
        Integer,
        nullable=False
    )

    predicted_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationship
    user = relationship(
        "User",
        back_populates="predictions"
    )