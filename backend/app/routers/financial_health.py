from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..services.financial_health import (
    predict_financial_health
)


router = APIRouter(
    prefix="/financial-health",
    tags=["Financial Health"]
)


# ==========================================
# GET FINANCIAL HEALTH
# ==========================================

@router.get("/")
def get_financial_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    financial_data, error = (
        crud.get_financial_health_data(
            db,
            current_user.user_id
        )
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    try:

        result = predict_financial_health(
            financial_data
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )