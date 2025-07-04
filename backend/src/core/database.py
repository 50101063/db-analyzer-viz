from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings

settings = get_settings()

# SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL
)

# SessionLocal class to create database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

def create_db_and_tables():
    Base.metadata.create_all(engine)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
