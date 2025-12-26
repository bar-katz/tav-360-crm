"""
Main entry point for the TAV 360 CRM backend API
"""
import os
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
from httpx import AsyncClient
from src.config import settings
from src.routes import auth, entities, upload, automation, whatsapp, integrations, dashboard
from src.utils.auth import get_current_user
from src.models.user import User

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

# PostgREST proxy routes
# These routes proxy entity CRUD operations to PostgREST
# PostgREST handles filtering, pagination, joins, etc. automatically

# Map singular entity names (used by frontend) to plural table names (used by PostgREST)
# PostgREST uses the actual database table names which are plural with underscores
ENTITY_NAME_MAP = {
    "contact": "contacts",
    "property": "properties",
    "client": "clients",
    "meeting": "meetings",
    "task": "tasks",
    "servicecall": "service_calls",  # Note: table uses underscore
    "supplier": "suppliers",
    "project": "projects",
    "marketinglead": "marketing_leads",  # Note: table uses underscore
    "marketinglog": "marketing_logs",  # Note: table uses underscore
    "propertyowner": "property_owners",  # Note: table uses underscore
    "tenant": "tenants",
    "match": "matches",
    "projectlead": "project_leads",  # Note: table uses underscore
    "workorder": "work_orders",  # Note: table uses underscore
    "donotcalllist": "do_not_call_list",  # Note: table uses underscores
    "campaign": "campaigns",
    "campaignmetrics": "campaign_metrics",  # Note: table uses underscore
    "accountingdocuments": "accounting_documents"  # Note: table uses underscore
}

# List of entity names that should be proxied to PostgREST (singular names from frontend)
POSTGREST_ENTITIES = list(ENTITY_NAME_MAP.keys())

@app.api_route("/api/{entity}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy_postgrest_entity(
    entity: str,
    path: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Proxy entity CRUD requests to PostgREST
    Only proxies requests for known entities, keeps custom routes (auth, dashboard, etc.) in FastAPI
    """
    # Don't proxy if it's a custom route (auth, dashboard, etc.)
    if entity in ["auth", "dashboard", "automation", "whatsapp", "integrations", "upload", "rpc"]:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Check if entity should be proxied
    if entity not in POSTGREST_ENTITIES:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Map to PostgREST table name (PostgREST uses plural table names)
    postgrest_entity = ENTITY_NAME_MAP.get(entity, entity)
    
    # Build PostgREST URL
    postgrest_path = f"/{postgrest_entity}"
    if path:
        postgrest_path += f"/{path}"
    
    # Forward query parameters
    query_params = dict(request.query_params)
    
    # Get JWT token from request
    auth_header = request.headers.get("Authorization", "")
    
    # Proxy request to PostgREST
    async with AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=request.method,
                url=f"{settings.POSTGREST_URL}{postgrest_path}",
                headers={
                    "Authorization": auth_header,
                    "Content-Type": request.headers.get("Content-Type", "application/json"),
                    "Prefer": request.headers.get("Prefer", ""),  # For PostgREST preferences
                },
                params=query_params,
                content=await request.body() if request.method in ["POST", "PUT", "PATCH"] else None,
            )
            
            # Return response from PostgREST
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {},
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"PostgREST proxy error: {str(e)}")

# Proxy RPC endpoints (PostgreSQL functions)
@app.api_route("/api/rpc/{function_name}", methods=["GET", "POST"])
async def proxy_postgrest_rpc(
    function_name: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Proxy RPC (PostgreSQL function) requests to PostgREST
    """
    # Build PostgREST URL
    postgrest_path = f"/rpc/{function_name}"
    
    # Forward query parameters
    query_params = dict(request.query_params)
    
    # Get JWT token from request
    auth_header = request.headers.get("Authorization", "")
    
    # Proxy request to PostgREST
    async with AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=request.method,
                url=f"{settings.POSTGREST_URL}{postgrest_path}",
                headers={
                    "Authorization": auth_header,
                    "Content-Type": request.headers.get("Content-Type", "application/json"),
                },
                params=query_params,
                content=await request.body() if request.method == "POST" else None,
            )
            
            # Return response from PostgREST
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {},
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"PostgREST RPC proxy error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

