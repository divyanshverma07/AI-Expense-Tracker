from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post(
    "/",
    response_model=schemas.ExpenseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_expense(
    user_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return crud.create_expense(
        db,
        expense,
        user_id
    )


@router.get(
    "/",
    response_model=list[schemas.ExpenseResponse]
)
def get_expenses(
    user_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_expenses(
        db,
        user_id
    )


@router.get(
    "/{expense_id}",
    response_model=schemas.ExpenseResponse
)
def get_expense(
    expense_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    expense = crud.get_expense(
        db,
        expense_id,
        user_id
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@router.put(
    "/{expense_id}",
    response_model=schemas.ExpenseResponse
)
def update_expense(
    expense_id: int,
    user_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):
    db_expense = crud.get_expense(
        db,
        expense_id,
        user_id
    )

    if not db_expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return crud.update_expense(
        db,
        db_expense,
        expense
    )


@router.delete(
    "/{expense_id}"
)
def delete_expense(
    expense_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    db_expense = crud.get_expense(
        db,
        expense_id,
        user_id
    )

    if not db_expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    crud.delete_expense(
        db,
        db_expense
    )

    return {
        "message": "Expense deleted successfully"
    }