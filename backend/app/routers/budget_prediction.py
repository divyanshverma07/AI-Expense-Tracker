from fastapi import APIRouter, Depends, HTTPException

from ..database import get_db
from ..auth import get_current_user
from .. import crud

from ..services.budget_prediction import (
    predict_budget
)


router = APIRouter(
    prefix="/budget",
    tags=["Budget Prediction"]
)


@router.get("/prediction")
def budget_prediction(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):

    expenses = crud.get_budget_prediction_data(
        db,
        current_user.user_id
    )

    try:

        return predict_budget(expenses)

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Budget prediction failed: {str(e)}"
        )