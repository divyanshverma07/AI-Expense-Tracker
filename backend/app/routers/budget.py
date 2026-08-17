from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..auth import get_current_user
from ..models import User


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
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create_budget(
        db,
        budget,
        current_user.user_id
    )


@router.get(
    "/",
    response_model=list[schemas.BudgetResponse]
)
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_budgets(
        db,
        current_user.user_id
    )


@router.get(
    "/{budget_id}",
    response_model=schemas.BudgetResponse
)
def get_single_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = crud.get_budget(
        db,
        budget_id,
        current_user.user_id
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
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_budget = crud.get_budget(
        db,
        budget_id,
        current_user.user_id
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_budget = crud.get_budget(
        db,
        budget_id,
        current_user.user_id
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