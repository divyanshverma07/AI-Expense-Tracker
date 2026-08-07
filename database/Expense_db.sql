-- ======================================
-- AI Expense Tracker Database Schema
-- PostgreSQL
-- ======================================

-- Create Database
CREATE DATABASE ai_expense_tracker;

-- Connect to the database
-- \c ai_expense_tracker

-- ======================================
-- USERS TABLE
-- ======================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- EXPENSES TABLE
-- ======================================

CREATE TABLE expenses (
    expense_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(50),

    payment_method VARCHAR(30),

    expense_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ======================================
-- BUDGET TABLE
-- ======================================

CREATE TABLE budget (
    budget_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    category VARCHAR(50) NOT NULL,

    monthly_limit DECIMAL(10,2) NOT NULL,

    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),

    year INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ======================================
-- PREDICTIONS TABLE
-- ======================================

CREATE TABLE predictions (
    prediction_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    prediction_month INTEGER NOT NULL CHECK (prediction_month BETWEEN 1 AND 12),

    prediction_year INTEGER NOT NULL,

    predicted_amount DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prediction_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE income (
    income_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    source VARCHAR(100) NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    income_date DATE NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_income_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ======================================
-- INDEXES
-- ======================================

CREATE INDEX idx_expense_user
ON expenses(user_id);

CREATE INDEX idx_expense_category
ON expenses(category);

CREATE INDEX idx_budget_user
ON budget(user_id);

CREATE INDEX idx_prediction_user
ON predictions(user_id);

CREATE INDEX idx_income_user
ON income(user_id);

CREATE INDEX idx_income_date
ON income(income_date);

CREATE INDEX idx_income_source
ON income(source);