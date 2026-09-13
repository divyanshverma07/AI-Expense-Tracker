from fastapi import APIRouter, Depends, HTTPException

from ..database import get_db
from ..auth import get_current_user
from .. import crud

from ..services.financial_insights import (
    generate_financial_insights
)


router = APIRouter(
    prefix="/financial-insights",
    tags=["Financial Insights"]
)


@router.get("/")
def get_financial_insights(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        data = crud.get_financial_insights_data(
            db,
            current_user.user_id
        )

        return generate_financial_insights(data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Financial insights failed: {str(e)}"
        )