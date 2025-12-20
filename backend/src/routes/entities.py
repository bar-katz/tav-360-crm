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
    entity_router = APIRouter(prefix=f"/{entity_name.lower()}s", tags=[entity_name])
    
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
        entity = model_class(**data)
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return {c.name: getattr(entity, c.name) for c in entity.__table__.columns}
    
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
router.include_router(create_entity_router("tenant", Tenant))
router.include_router(create_entity_router("match", Match))
router.include_router(create_entity_router("projectlead", ProjectLead))
router.include_router(create_entity_router("workorder", WorkOrder))
router.include_router(create_entity_router("donotcalllist", DoNotCallList))
router.include_router(create_entity_router("campaign", Campaign))
router.include_router(create_entity_router("campaignmetrics", CampaignMetrics))
router.include_router(create_entity_router("accountingdocuments", AccountingDocument))

