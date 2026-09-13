from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..database import get_db
from .. import crud

from ..services.expense_forecasting import (
    predict_next_month_expenses
)


router = APIRouter(
    prefix="/expenses",
    tags=["Expense Prediction"]
)


@router.get("/prediction")
def expense_prediction(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):

    expenses = crud.get_expense_forecasting_data(
        db,
        current_user.user_id
    )

    try:
        result = predict_next_month_expenses(expenses)

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Expense prediction failed: {str(e)}"
        )