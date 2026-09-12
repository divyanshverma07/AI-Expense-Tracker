from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..auth import get_current_user
from ..models import User


router = APIRouter(
    prefix="/financial-profile",
    tags=["Financial Profile"]
)


# ==========================================
# CREATE FINANCIAL PROFILE
# ==========================================

@router.post(
    "/",
    response_model=schemas.FinancialProfileResponse,
    status_code=status.HTTP_201_CREATED
)
def create_profile(
    profile: schemas.FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = crud.create_financial_profile(
        db,
        profile,
        current_user.user_id
    )

    if db_profile is None:
        raise HTTPException(
            status_code=400,
            detail="Financial profile already exists"
        )

    return db_profile


# ==========================================
# GET FINANCIAL PROFILE
# ==========================================

@router.get(
    "/",
    response_model=schemas.FinancialProfileResponse
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = crud.get_financial_profile(
        db,
        current_user.user_id
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Financial profile not found"
        )

    return profile


# ==========================================
# UPDATE FINANCIAL PROFILE
# ==========================================

@router.put(
    "/",
    response_model=schemas.FinancialProfileResponse
)
def update_profile(
    profile: schemas.FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = crud.get_financial_profile(
        db,
        current_user.user_id
    )

    if db_profile is None:
        raise HTTPException(
            status_code=404,
            detail="Financial profile not found"
        )

    return crud.update_financial_profile(
        db,
        db_profile,
        profile
    )