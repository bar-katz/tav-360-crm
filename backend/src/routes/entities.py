"""
Entity routes - generic CRUD operations
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List, Any
from src.database import get_db
from src.models import User
from src.utils.auth import get_current_user

router = APIRouter()

def create_entity_router(entity_name: str, model_class: Any):
    """Create generic CRUD routes for an entity"""
    # Use singular form to match frontend API calls
    entity_router = APIRouter(prefix=f"/{entity_name.lower()}", tags=[entity_name])
    
    @entity_router.get("")
    async def list_entities(
        order_by: Optional[str] = Query(None, alias="order_by", description="Order by field (prefix with - for descending)"),
        limit: Optional[int] = Query(100, description="Limit results"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """List all entities"""
        query = db.query(model_class)
        
        if order_by:
            if order_by.startswith("-"):
                field_name = order_by[1:]
                if hasattr(model_class, field_name):
                    query = query.order_by(desc(getattr(model_class, field_name)))
            else:
                if hasattr(model_class, order_by):
                    query = query.order_by(asc(getattr(model_class, order_by)))
        
        if limit:
            query = query.limit(limit)
        
        # Convert SQLAlchemy models to dicts for JSON serialization
        results = query.all()
        return [
            {c.name: getattr(item, c.name) for c in item.__table__.columns}
            for item in results
        ]
    
    @entity_router.get("/{entity_id}")
    async def get_entity(
        entity_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Get entity by ID"""
        entity = db.query(model_class).filter(model_class.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{entity_name} not found")
        return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}
    
    @entity_router.post("")
    async def create_entity(
        data: dict,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Create new entity"""
        try:
            # Filter data to only include fields that exist in the model
            model_columns = {c.name for c in model_class.__table__.columns}
            filtered_data = {k: v for k, v in data.items() if k in model_columns}
            
            entity = model_class(**filtered_data)
            db.add(entity)
            db.commit()
            db.refresh(entity)
            return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating {entity_name}: {str(e)}")
    
    @entity_router.put("/{entity_id}")
    async def update_entity(
        entity_id: int,
        data: dict,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Update entity"""
        entity = db.query(model_class).filter(model_class.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{entity_name} not found")
        
        for key, value in data.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        
        db.commit()
        db.refresh(entity)
        return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}
    
    @entity_router.delete("/{entity_id}")
    async def delete_entity(
        entity_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):
        """Delete entity"""
        entity = db.query(model_class).filter(model_class.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{entity_name} not found")
        db.delete(entity)
        db.commit()
        return {"message": f"{entity_name} deleted successfully"}
    
    return entity_router

# Import models and create routes
from src.models.contact import Contact
from src.models.property import Property
from src.models.client import Client
from src.models.meeting import Meeting
from src.models.task import Task
from src.models.service_call import ServiceCall
from src.models.supplier import Supplier
from src.models.project import Project
from src.models.marketing_lead import MarketingLead
from src.models.marketing_log import MarketingLog
from src.models.property_owner import PropertyOwner
from src.models.tenant import Tenant
from src.models.match import Match
from src.models.project_lead import ProjectLead
from src.models.work_order import WorkOrder
from src.models.do_not_call_list import DoNotCallList
from src.models.campaign import Campaign
from src.models.campaign_metrics import CampaignMetrics
from src.models.accounting_document import AccountingDocument

router.include_router(create_entity_router("contact", Contact))
router.include_router(create_entity_router("property", Property))
router.include_router(create_entity_router("client", Client))
router.include_router(create_entity_router("meeting", Meeting))
router.include_router(create_entity_router("task", Task))
router.include_router(create_entity_router("servicecall", ServiceCall))
router.include_router(create_entity_router("supplier", Supplier))
router.include_router(create_entity_router("project", Project))
router.include_router(create_entity_router("marketinglead", MarketingLead))
router.include_router(create_entity_router("marketinglog", MarketingLog))
router.include_router(create_entity_router("propertyowner", PropertyOwner))
# Tenant router with date validation
from src.models.tenant import Tenant as TenantModel
from datetime import datetime

tenant_router = APIRouter(prefix="/tenant", tags=["Tenant"])

@tenant_router.post("")
async def create_tenant(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new tenant with date validation"""
    # Validate lease dates
    if "lease_start_date" in data and "lease_end_date" in data:
        start_date = data["lease_start_date"]
        end_date = data["lease_end_date"]
        
        # Parse dates if they're strings
        if isinstance(start_date, str):
            try:
                # Try ISO format first
                if 'T' in start_date or 'Z' in start_date:
                    start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
                else:
                    # Try YYYY-MM-DD format
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid lease_start_date format")
        
        if isinstance(end_date, str):
            try:
                # Try ISO format first
                if 'T' in end_date or 'Z' in end_date:
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
                else:
                    # Try YYYY-MM-DD format
                    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid lease_end_date format")
        
        if end_date <= start_date:
            raise HTTPException(
                status_code=400,
                detail="lease_end_date must be after lease_start_date"
            )
    
    entity = TenantModel(**data)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}

@tenant_router.get("")
async def list_tenants(
    order_by: Optional[str] = Query(None, alias="order_by"),
    limit: Optional[int] = Query(100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tenants"""
    query = db.query(TenantModel)
    if order_by:
        if order_by.startswith("-"):
            field_name = order_by[1:]
            if hasattr(TenantModel, field_name):
                query = query.order_by(desc(getattr(TenantModel, field_name)))
        else:
            if hasattr(TenantModel, order_by):
                query = query.order_by(asc(getattr(TenantModel, order_by)))
    if limit:
        query = query.limit(limit)
    results = query.all()
    return [{c.name: getattr(item, c.name) for c in item.__table__.columns} for item in results]

@tenant_router.get("/{entity_id}")
async def get_tenant(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tenant by ID"""
    entity = db.query(TenantModel).filter(TenantModel.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}

@tenant_router.put("/{entity_id}")
async def update_tenant(
    entity_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update tenant with date validation"""
    entity = db.query(TenantModel).filter(TenantModel.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Validate lease dates if being updated
    if "lease_start_date" in data or "lease_end_date" in data:
        start_date = data.get("lease_start_date", entity.lease_start_date)
        end_date = data.get("lease_end_date", entity.lease_end_date)
        
        if isinstance(start_date, str):
            try:
                if 'T' in start_date or 'Z' in start_date:
                    start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
                else:
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid lease_start_date format")
        
        if isinstance(end_date, str):
            try:
                if 'T' in end_date or 'Z' in end_date:
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
                else:
                    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid lease_end_date format")
        
        if end_date <= start_date:
            raise HTTPException(
                status_code=400,
                detail="lease_end_date must be after lease_start_date"
            )
    
    for key, value in data.items():
        if hasattr(entity, key):
            setattr(entity, key, value)
    
    db.commit()
    db.refresh(entity)
    return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}

@tenant_router.delete("/{entity_id}")
async def delete_tenant(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete tenant"""
    entity = db.query(TenantModel).filter(TenantModel.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db.delete(entity)
    db.commit()
    return {"message": "Tenant deleted successfully"}

router.include_router(tenant_router)
router.include_router(create_entity_router("match", Match))
router.include_router(create_entity_router("projectlead", ProjectLead))
router.include_router(create_entity_router("workorder", WorkOrder))
router.include_router(create_entity_router("donotcalllist", DoNotCallList))
router.include_router(create_entity_router("campaign", Campaign))
router.include_router(create_entity_router("campaignmetrics", CampaignMetrics))
router.include_router(create_entity_router("accountingdocuments", AccountingDocument))

