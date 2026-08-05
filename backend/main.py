from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import (
    auth_router,
    income_router,
    expense_router,
    ai_router,
    budget_router,
    reports_router,
    user_router,
    auto_detection_router,
    voice_router
)
from seed_data import seed_database

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal Finance Intelligence System (PFIS) API",
    description="Production-Ready AI-Powered Financial Intelligence Platform delivering AI Voice Copilot Assistant, Smart Auto Expense Detection, Expense Prediction, Fraud Defense, Budgeting, and Reports.",
    version="1.0.0"
)

# Enable CORS for frontend development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-powered-personal-finance-intelligence-vrcz.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

# Mount API routers
app.include_router(auth_router.router)
app.include_router(income_router.router)
app.include_router(expense_router.router)
app.include_router(budget_router.router)
app.include_router(auto_detection_router.router)
app.include_router(voice_router.router)
app.include_router(ai_router.router)
app.include_router(reports_router.router)
app.include_router(user_router.router)

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Personal Finance Intelligence System (PFIS)",
        "version": "1.0.0",
        "tagline": "We are not building a simple expense tracker. We are building an AI-powered financial decision support system."
    }
