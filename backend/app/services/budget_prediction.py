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