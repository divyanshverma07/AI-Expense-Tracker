from app.services.financial_health import predict_financial_health


financial_data = {
    "Income": 50000,
    "Age": 22,
    "Dependents": 1,
    "Occupation": "Private",
    "City_Tier": "Tier_1",
    "Rent": 12000,
    "Loan_Repayment": 5000,
    "Insurance": 1500,
    "Groceries": 5000,
    "Transport": 2500,
    "Eating_Out": 2000,
    "Entertainment": 1500,
    "Utilities": 2500,
    "Healthcare": 1000,
    "Education": 2000,
    "Miscellaneous": 1500,
    "Desired_Savings_Percentage": 20,
    "Desired_Savings": 10000
}


result = predict_financial_health(financial_data)

print(result)
