from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Database Analyzer & Visualization Tool Backend",
    description="API for managing user authentication, database connections, schema introspection, and data visualization.",
    version="1.0.0",
)

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"), # Allow frontend URL from environment variable or default
    "http://localhost:8000", # For Swagger UI/ReDoc
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "Welcome to the Database Analyzer & Visualization Tool API!"}

# Placeholder for API routers
# from .api.v1.auth import routes as auth_routes
# app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["Authentication"])

# from .api.v1.connections import routes as connection_routes
# app.include_router(connection_routes.router, prefix="/api/v1/connections", tags=["Database Connections"])

# from .api.v1.data import routes as data_routes
# app.include_router(data_routes.router, prefix="/api/v1/data", tags=["Data Analysis"])

# from .api.v1.visualizations import routes as viz_routes
# app.include_router(viz_routes.router, prefix="/api/v1/visualizations", tags=["Visualization Configurations"])
