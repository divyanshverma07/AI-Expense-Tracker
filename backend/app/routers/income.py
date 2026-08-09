from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db


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
    user_id: int,
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return crud.create_income(
        db,
        income,
        user_id
    )


@router.get(
    "/",
    response_model=list[schemas.IncomeResponse]
)
def get_income(
    user_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_incomes(
        db,
        user_id
    )


@router.get(
    "/{income_id}",
    response_model=schemas.IncomeResponse
)
def get_single_income(
    income_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    income = crud.get_income(
        db,
        income_id,
        user_id
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
    user_id: int,
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db)
):
    db_income = crud.get_income(
        db,
        income_id,
        user_id
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
    user_id: int,
    db: Session = Depends(get_db)
):
    db_income = crud.get_income(
        db,
        income_id,
        user_id
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