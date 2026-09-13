from fastapi import APIRouter, Depends, HTTPException

from ..database import get_db
from ..auth import get_current_user
from .. import crud
from ..schemas import (
    FinancialGoalCreate,
    FinancialGoalUpdate,
    FinancialGoalResponse,
    FinancialGoalPlanResponse
)


router = APIRouter(
    prefix="/goals",
    tags=["Goal Management"]
)


# ==========================================
# CREATE GOAL
# ==========================================

@router.post(
    "/",
    response_model=FinancialGoalResponse
)
def create_goal(
    goal: FinancialGoalCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Validate current amount
    if goal.current_amount > goal.target_amount:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot be greater than target amount."
        )

    # Create goal
    return crud.create_financial_goal(
        db,
        goal,
        current_user.user_id
    )


# ==========================================
# GET ALL GOALS
# ==========================================

@router.get(
    "/",
    response_model=list[FinancialGoalResponse]
)
def get_goals(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_financial_goals(
        db,
        current_user.user_id
    )


# ==========================================
# GET SINGLE GOAL
# ==========================================

@router.get(
    "/{goal_id}",
    response_model=FinancialGoalResponse
)
def get_goal(
    goal_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = crud.get_financial_goal(
        db,
        goal_id,
        current_user.user_id
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Financial goal not found."
        )

    return goal


# ==========================================
# UPDATE GOAL
# ==========================================

@router.put(
    "/{goal_id}",
    response_model=FinancialGoalResponse
)
def update_goal(
    goal_id: int,
    goal: FinancialGoalUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_goal = crud.get_financial_goal(
        db,
        goal_id,
        current_user.user_id
    )

    if not db_goal:
        raise HTTPException(
            status_code=404,
            detail="Financial goal not found."
        )

    # Validate target/current amount
    target_amount = (
        goal.target_amount
        if goal.target_amount is not None
        else db_goal.target_amount
    )

    current_amount = (
        goal.current_amount
        if goal.current_amount is not None
        else db_goal.current_amount
    )

    if current_amount > target_amount:
        raise HTTPException(
            status_code=400,
            detail="Current amount cannot be greater than target amount."
        )

    return crud.update_financial_goal(
        db,
        db_goal,
        goal
    )


# ==========================================
# DELETE GOAL
# ==========================================

@router.delete(
    "/{goal_id}"
)
def delete_goal(
    goal_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = crud.get_financial_goal(
        db,
        goal_id,
        current_user.user_id
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Financial goal not found."
        )

    crud.delete_financial_goal(
        db,
        goal
    )

    return {
        "message": "Financial goal deleted successfully."
    }


# ==========================================
# GOAL SAVING PLAN
# ==========================================

@router.get(
    "/{goal_id}/plan",
    response_model=FinancialGoalPlanResponse
)
def get_goal_plan(
    goal_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = crud.get_financial_goal(
        db,
        goal_id,
        current_user.user_id
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Financial goal not found."
        )

    return crud.get_goal_plan(
        db,
        goal,
        current_user.user_id
    )