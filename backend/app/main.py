from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import users, auth, work_orders, ptw, moc

app = FastAPI(
    title="CMMS Pro API",
    description="Backend API for Plant Operations and Maintenance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(work_orders.router)
app.include_router(ptw.router)
app.include_router(moc.router)

@app.get("/")
def root():
    return {"message": "Welcome to the CMMS Pro API"}