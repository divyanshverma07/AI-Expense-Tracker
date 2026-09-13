from decimal import Decimal


def generate_financial_insights(data):
    """
    Generate financial insights from aggregated user data.
    """

    insights = []

    income = float(data.get("monthly_income", 0))
    expenses = float(data.get("monthly_expenses", 0))
    savings = float(data.get("monthly_savings", 0))

    savings_rate = (
        (savings / income) * 100
        if income > 0
        else 0
    )

    # ==========================================
    # SAVINGS INSIGHT
    # ==========================================

    if income <= 0:
        insights.append({
            "type": "warning",
            "title": "No Income Recorded",
            "message": (
                "Add your income information to receive "
                "personalized financial insights."
            )
        })

    elif savings < 0:
        insights.append({
            "type": "warning",
            "title": "Overspending Alert",
            "message": (
                "Your expenses are higher than your income. "
                "Consider reducing non-essential spending."
            )
        })

    elif savings_rate < 10:
        insights.append({
            "type": "saving",
            "title": "Low Savings Rate",
            "message": (
                f"You are currently saving approximately "
                f"{savings_rate:.1f}% of your income. "
                "Try to gradually increase your savings."
            )
        })

    elif savings_rate < 20:
        insights.append({
            "type": "saving",
            "title": "Savings Can Improve",
            "message": (
                f"You are saving approximately "
                f"{savings_rate:.1f}% of your income. "
                "Consider working toward a 20% savings rate."
            )
        })

    else:
        insights.append({
            "type": "saving",
            "title": "Healthy Savings",
            "message": (
                f"You are saving approximately "
                f"{savings_rate:.1f}% of your income. "
                "Your savings rate is healthy."
            )
        })

    # ==========================================
    # EXPENSE INSIGHT
    # ==========================================

    if income > 0:

        expense_rate = (expenses / income) * 100

        if expense_rate > 80:
            insights.append({
                "type": "spending",
                "title": "High Expense Ratio",
                "message": (
                    f"Your expenses are approximately "
                    f"{expense_rate:.1f}% of your income. "
                    "Try to reduce unnecessary expenses."
                )
            })

        elif expense_rate > 50:
            insights.append({
                "type": "spending",
                "title": "Moderate Spending",
                "message": (
                    f"Your expenses are approximately "
                    f"{expense_rate:.1f}% of your income."
                )
            })

        else:
            insights.append({
                "type": "spending",
                "title": "Controlled Spending",
                "message": (
                    f"Your expenses are approximately "
                    f"{expense_rate:.1f}% of your income. "
                    "Your spending is currently well controlled."
                )
            })

    # ==========================================
    # CATEGORY INSIGHT
    # ==========================================

    category_expenses = data.get(
        "category_expenses",
        {}
    )

    if category_expenses:

        highest_category = max(
            category_expenses,
            key=category_expenses.get
        )

        highest_amount = float(
            category_expenses[highest_category]
        )

        insights.append({
            "type": "category",
            "title": "Highest Spending Category",
            "message": (
                f"{highest_category} is currently your "
                f"highest spending category at "
                f"₹{highest_amount:,.2f}."
            )
        })

    # ==========================================
    # FINANCIAL HEALTH INSIGHT
    # ==========================================

    health_score = data.get(
        "financial_health_score"
    )

    health_category = data.get(
        "financial_health"
    )

    if health_score is not None:

        if health_category == "Good":

            insights.append({
                "type": "health",
                "title": "Good Financial Health",
                "message": (
                    f"Your financial health score is "
                    f"{float(health_score):.1f}/100. "
                    "Keep maintaining your current habits."
                )
            })

        elif health_category == "Average":

            insights.append({
                "type": "health",
                "title": "Financial Health Can Improve",
                "message": (
                    f"Your financial health score is "
                    f"{float(health_score):.1f}/100. "
                    "Focus on improving savings and controlling expenses."
                )
            })

        elif health_category == "Poor":

            insights.append({
                "type": "health",
                "title": "Financial Health Needs Attention",
                "message": (
                    f"Your financial health score is "
                    f"{float(health_score):.1f}/100. "
                    "Consider reducing expenses and improving savings."
                )
            })

    # ==========================================
    # GOAL INSIGHTS
    # ==========================================

    goals = data.get("goals", [])

    for goal in goals:

        goal_name = goal.get("goal_name")
        required_saving = float(
            goal.get("required_monthly_saving", 0)
        )
        estimated_saving = float(
            goal.get("estimated_monthly_saving", 0)
        )

        if goal.get("status") == "Completed":

            insights.append({
                "type": "goal",
                "title": "Goal Completed",
                "message": (
                    f"Congratulations! You have completed "
                    f"your '{goal_name}' goal."
                )
            })

        elif goal.get("feasible"):

            insights.append({
                "type": "goal",
                "title": "Goal Is Achievable",
                "message": (
                    f"Your '{goal_name}' goal requires about "
                    f"₹{required_saving:,.2f} per month. "
                    f"Your estimated saving capacity is "
                    f"₹{estimated_saving:,.2f} per month."
                )
            })

        else:

            insights.append({
                "type": "goal",
                "title": "Goal Needs Adjustment",
                "message": (
                    f"Your '{goal_name}' goal currently requires "
                    f"₹{required_saving:,.2f} per month. "
                    "Consider increasing the target date or "
                    "reducing the target amount."
                )
            })

    # ==========================================
    # GENERAL RECOMMENDATION
    # ==========================================

    if savings_rate >= 20:

        recommendation = (
            "Maintain your current savings habits and "
            "continue working toward your financial goals."
        )

    elif savings_rate > 0:

        recommendation = (
            "Try to gradually increase your monthly savings "
            "while keeping essential expenses under control."
        )

    else:

        recommendation = (
            "Focus on controlling expenses and creating "
            "a positive monthly savings balance."
        )

    return {
        "monthly_income": round(income, 2),
        "monthly_expenses": round(expenses, 2),
        "monthly_savings": round(savings, 2),
        "savings_rate": round(savings_rate, 2),
        "insights": insights,
        "recommendation": recommendation
    }