import os
import joblib
import pandas as pd


# ==========================================
# MODEL PATH
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(BASE_DIR, "ml_models")

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "financial_health_model.pkl"
)

financial_health_model = joblib.load(MODEL_PATH)


# ==========================================
# REQUIRED ML FEATURES
# ==========================================

REQUIRED_FEATURES = [
    "Income",
    "Age",
    "Dependents",
    "Occupation",
    "City_Tier",
    "Rent",
    "Loan_Repayment",
    "Insurance",
    "Groceries",
    "Transport",
    "Eating_Out",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Education",
    "Miscellaneous",
    "Desired_Savings_Percentage",
    "Desired_Savings"
]


# ==========================================
# FINANCIAL HEALTH SCORE
# ==========================================

def calculate_financial_health_score(
    financial_data: dict
):
    income = float(financial_data["Income"])

    if income <= 0:
        raise ValueError("Income must be greater than zero")

    total_expenses = (
        float(financial_data["Rent"])
        + float(financial_data["Loan_Repayment"])
        + float(financial_data["Insurance"])
        + float(financial_data["Groceries"])
        + float(financial_data["Transport"])
        + float(financial_data["Eating_Out"])
        + float(financial_data["Entertainment"])
        + float(financial_data["Utilities"])
        + float(financial_data["Healthcare"])
        + float(financial_data["Education"])
        + float(financial_data["Miscellaneous"])
    )

    actual_savings = income - total_expenses

    savings_rate = (
        actual_savings / income
    ) * 100

    loan_ratio = (
        float(financial_data["Loan_Repayment"])
        / income
    ) * 100

    expense_ratio = (
        total_expenses / income
    ) * 100

    # Savings Score: maximum 40
    savings_score = (
        max(0, min(savings_rate, 40)) / 40
    ) * 40

    # Debt Score: maximum 30
    debt_score = (
        1 - (
            max(0, min(loan_ratio, 20)) / 20
        )
    ) * 30

    # Expense Score: maximum 30
    expense_score = (
        1 - (
            max(0, min(expense_ratio, 100)) / 100
        )
    ) * 30

    health_score = (
        savings_score
        + debt_score
        + expense_score
    )

    health_score = max(
        0,
        min(health_score, 100)
    )

    return round(health_score, 2)


# ==========================================
# FINANCIAL HEALTH PREDICTION
# ==========================================

def predict_financial_health(
    financial_data: dict
):

    # Check required features
    for feature in REQUIRED_FEATURES:
        if feature not in financial_data:
            raise ValueError(
                f"Missing required feature: {feature}"
            )

    # Prepare model input
    data = {}

    for feature in REQUIRED_FEATURES:
        data[feature] = financial_data[feature]

    input_df = pd.DataFrame(
        [data],
        columns=REQUIRED_FEATURES
    )

    # ML prediction
    prediction = financial_health_model.predict(
        input_df
    )[0]

    probabilities = financial_health_model.predict_proba(
        input_df
    )[0]

    classes = financial_health_model.classes_

    probability_dict = {
        str(cls): round(float(prob), 4)
        for cls, prob in zip(
            classes,
            probabilities
        )
    }

    # Calculate numerical score
    health_score = calculate_financial_health_score(
        financial_data
    )

    return {
        "financial_health_score": health_score,
        "financial_health": str(prediction),
        "probabilities": probability_dict
    }