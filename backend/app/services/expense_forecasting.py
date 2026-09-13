from collections import defaultdict
from datetime import date

import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_next_month_expenses(expenses):
    """
    Predict next month's total and category-wise expenses
    using historical monthly expense data.
    """

    if not expenses:
        raise ValueError("No expense history available for prediction.")

    # --------------------------------------------------
    # 1. Convert database expenses into monthly data
    # --------------------------------------------------

    monthly_data = defaultdict(float)

    for expense in expenses:
        month_key = expense.expense_date.strftime("%Y-%m")
        monthly_data[month_key] += float(expense.amount)

    if len(monthly_data) < 2:
        raise ValueError(
            "At least 2 months of expense history are required "
            "for expense prediction."
        )

    # Sort months
    sorted_months = sorted(monthly_data.keys())

    values = [
        monthly_data[month]
        for month in sorted_months
    ]

    # --------------------------------------------------
    # 2. Create ML training data
    # --------------------------------------------------

    X = pd.DataFrame({
        "month_index": range(len(values))
    })

    y = values

    # --------------------------------------------------
    # 3. Train Linear Regression model
    # --------------------------------------------------

    model = LinearRegression()
    model.fit(X, y)

    next_month_index = len(values)

    predicted_total = model.predict(
        [[next_month_index]]
    )[0]

    predicted_total = max(0, round(float(predicted_total), 2))

    # --------------------------------------------------
    # 4. Category-wise prediction
    # --------------------------------------------------

    category_monthly = defaultdict(lambda: defaultdict(float))

    for expense in expenses:
        category = expense.category or "Miscellaneous"
        month_key = expense.expense_date.strftime("%Y-%m")

        category_monthly[category][month_key] += float(
            expense.amount
        )

    category_predictions = {}

    for category, monthly_values in category_monthly.items():

        category_values = [
            monthly_values.get(month, 0)
            for month in sorted_months
        ]

        # If category has enough historical data,
        # use Linear Regression.
        if len(category_values) >= 2:

            category_model = LinearRegression()

            category_X = pd.DataFrame({
                "month_index": range(len(category_values))
            })

            category_model.fit(
                category_X,
                category_values
            )

            prediction = category_model.predict(
                [[next_month_index]]
            )[0]

        else:
            # Fallback for a category with insufficient history
            prediction = category_values[-1]

        category_predictions[category] = max(
            0,
            round(float(prediction), 2)
        )

    # --------------------------------------------------
    # 5. Determine next month
    # --------------------------------------------------

    last_month = pd.Period(
        sorted_months[-1],
        freq="M"
    )

    next_month = last_month + 1

    return {
        "forecast_month": str(next_month),
        "historical_months": len(sorted_months),
        "predicted_total": predicted_total,
        "category_predictions": category_predictions
    }