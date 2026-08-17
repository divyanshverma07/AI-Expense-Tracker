from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..auth import get_current_user
from ..models import User


router = APIRouter(
    prefix="/income",
    tags=["Income"]
)


@router.post(
    "/",
    response_model=schemas.IncomeResponse,
    status_code=status.HTTP_201_CREATED
)
def create_income(
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create_income(
        db,
        income,
        current_user.user_id
    )


@router.get(
    "/",
    response_model=list[schemas.IncomeResponse]
)
def get_income(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_incomes(
        db,
        current_user.user_id
    )


@router.get(
    "/{income_id}",
    response_model=schemas.IncomeResponse
)
def get_single_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = crud.get_income(
        db,
        income_id,
        current_user.user_id
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return income


@router.put(
    "/{income_id}",
    response_model=schemas.IncomeResponse
)
def update_income(
    income_id: int,
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_income = crud.get_income(
        db,
        income_id,
        current_user.user_id
    )

    if not db_income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return crud.update_income(
        db,
        db_income,
        income
    )


@router.delete(
    "/{income_id}"
)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_income = crud.get_income(
        db,
        income_id,
        current_user.user_id
    )

    if not db_income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    crud.delete_income(
        db,
        db_income
    )

    return {
        "message": "Income deleted successfully"
    }