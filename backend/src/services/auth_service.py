from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ..models.user import User
from ..api.v1.auth.schemas import UserCreate, UserLogin
from ..core.security import get_password_hash, verify_password

class AuthService:
    def create_user(self, db: Session, user_data: UserCreate) -> User:
        db_user = db.query(User).filter(User.email == user_data.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        db_user = db.query(User).filter(User.username == user_data.username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def get_user_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def authenticate_user(self, db: Session, user_data: UserLogin) -> User | None:
        user = self.get_user_by_email(db, user_data.email)
        if not user or not verify_password(user_data.password, user.password_hash):
            return None
        return user
