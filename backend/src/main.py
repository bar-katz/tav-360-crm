"""
Main entry point for the TAV 360 CRM backend API
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.config import settings
from src.routes import auth, entities, upload, automation, whatsapp, integrations, dashboard

app = FastAPI(title="TAV 360 CRM API", version="1.0.0")

# CORS middleware - allows frontend from different origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(entities.router, prefix="/api", tags=["entities"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(automation.router, prefix="/api/automation", tags=["automation"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["whatsapp"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

