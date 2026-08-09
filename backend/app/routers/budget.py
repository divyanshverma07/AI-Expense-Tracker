from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db


router = APIRouter(
    prefix="/budget",
    tags=["Budget"]
)


@router.post(
    "/",
    response_model=schemas.BudgetResponse,
    status_code=status.HTTP_201_CREATED
)
def create_budget(
    user_id: int,
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return crud.create_budget(
        db,
        budget,
        user_id
    )


@router.get(
    "/",
    response_model=list[schemas.BudgetResponse]
)
def get_budgets(
    user_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_budgets(
        db,
        user_id
    )


@router.get(
    "/{budget_id}",
    response_model=schemas.BudgetResponse
)
def get_single_budget(
    budget_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    budget = crud.get_budget(
        db,
        budget_id,
        user_id
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    return budget


@router.put(
    "/{budget_id}",
    response_model=schemas.BudgetResponse
)
def update_budget(
    budget_id: int,
    user_id: int,
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db)
):
    db_budget = crud.get_budget(
        db,
        budget_id,
        user_id
    )

    if not db_budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    return crud.update_budget(
        db,
        db_budget,
        budget
    )


@router.delete(
    "/{budget_id}"
)
def delete_budget(
    budget_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    db_budget = crud.get_budget(
        db,
        budget_id,
        user_id
    )

    if not db_budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    crud.delete_budget(
        db,
        db_budget
    )

    return {
        "message": "Budget deleted successfully"
    }