import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Database Connection URL
# We use os.getenv to check if a production DATABASE_URL exists (like a Postgres URL).
# If it doesn't exist, we fall back to a local SQLite database named 'cmms_dev.db'.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./cmms_dev.db"
)

# 2. The Engine
# The engine is the core interface to the database. 
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # SQLite-specific argument: By default, SQLite only allows one thread to communicate 
    # with it. FastAPI handles multiple requests concurrently (multi-threading). 
    # 'check_same_thread': False disables this restriction so FastAPI doesn't crash.
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL doesn't need the thread restriction workaround
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. The Session Factory
# SessionLocal is a factory that creates new database sessions. 
# We set autocommit and autoflush to False so we have explicit control over 
# when data is actually saved to the database (using db.commit() in our CRUD files).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=naming_convention)

# Pass the metadata into your Base class
Base = declarative_base(metadata=metadata)