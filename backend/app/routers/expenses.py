from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..auth import get_current_user
from ..models import User

from ..services.expense_classifier import predict_expense_category


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
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ------------------------------------------
    # AI EXPENSE CATEGORY PREDICTION
    # ------------------------------------------

    predicted_category = predict_expense_category(
        expense.description
    )

    # ------------------------------------------
    # SAVE EXPENSE
    # ------------------------------------------

    return crud.create_expense(
        db,
        expense,
        current_user.user_id,
        predicted_category
    )


@router.get(
    "/",
    response_model=list[schemas.ExpenseResponse]
)
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_expenses(
        db,
        current_user.user_id
    )


@router.get(
    "/{expense_id}",
    response_model=schemas.ExpenseResponse
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = crud.get_expense(
        db,
        expense_id,
        current_user.user_id
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
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense = crud.get_expense(
        db,
        expense_id,
        current_user.user_id
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense = crud.get_expense(
        db,
        expense_id,
        current_user.user_id
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