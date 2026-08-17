from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from .. import crud, schemas
from ..auth import (
    hash_password,
    verify_password,
    create_access_token
)
from ..database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ==========================================
# REGISTER
# ==========================================

@router.post(
    "/",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = crud.get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user.password
    )

    return crud.create_user(
        db,
        user,
        hashed_password
    )


# ==========================================
# LOGIN
# ==========================================

@router.post(
    "/login",
    response_model=schemas.TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(
        db,
        form_data.username
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    password_correct = verify_password(
        form_data.password,
        user.password_hash
    )

    if not password_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    access_token = create_access_token(
        user.user_id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ==========================================
# GET USER
# ==========================================

@router.get(
    "/{user_id}",
    response_model=schemas.UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = crud.get_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user