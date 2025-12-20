"""
Dashboard statistics routes
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from src.database import get_db
from src.models import (
    User, Contact, Property, Client, Meeting, Task, ServiceCall,
    Supplier, Project, PropertyOwner, Tenant, Match, ProjectLead,
    MarketingLead, WorkOrder
)
from src.utils.auth import get_current_user

router = APIRouter()

def calculate_percentage_change(current: int, previous: int) -> str:
    """Calculate percentage change between two values"""
    if previous == 0:
        return "+100%" if current > 0 else "0%"
    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.0f}%"

@router.get("/stats/main")
async def get_main_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get main dashboard statistics"""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    
    # Properties
    total_properties = db.query(func.count(Property.id)).scalar() or 0
    properties_last_week = db.query(func.count(Property.id)).filter(
        Property.created_date >= week_ago
    ).scalar() or 0
    properties_prev_week = db.query(func.count(Property.id)).filter(
        and_(
            Property.created_date >= two_weeks_ago,
            Property.created_date < week_ago
        )
    ).scalar() or 0
    
    # Buyers/Clients
    total_buyers = db.query(func.count(Client.id)).scalar() or 0
    buyers_last_week = db.query(func.count(Client.id)).filter(
        Client.created_date >= week_ago
    ).scalar() or 0
    buyers_prev_week = db.query(func.count(Client.id)).filter(
        and_(
            Client.created_date >= two_weeks_ago,
            Client.created_date < week_ago
        )
    ).scalar() or 0
    
    # Open service calls (using enum values)
    from src.models.service_call import ServiceCallStatus
    open_service_calls = db.query(func.count(ServiceCall.id)).filter(
        ServiceCall.status != ServiceCallStatus.CLOSED
    ).scalar() or 0
    new_service_calls = db.query(func.count(ServiceCall.id)).filter(
        ServiceCall.status == ServiceCallStatus.OPEN
    ).scalar() or 0
    
    # Meetings this week
    week_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=7)
    meetings_this_week = db.query(func.count(Meeting.id)).filter(
        and_(
            Meeting.start_date >= week_start,
            Meeting.start_date < week_end
        )
    ).scalar() or 0
    
    
    return {
        "properties": {
            "total": total_properties,
            "change": calculate_percentage_change(properties_last_week, properties_prev_week)
        },
        "buyers": {
            "total": total_buyers,
            "change": calculate_percentage_change(buyers_last_week, buyers_prev_week)
        },
        "meetings": {
            "this_week": meetings_this_week,
            "change": str(meetings_this_week) + " השבוע"
        },
        "service_calls": {
            "open": open_service_calls,
            "new": new_service_calls,
            "change": f"{new_service_calls} חדשות"
        }
    }

@router.get("/stats/brokerage")
async def get_brokerage_dashboard_stats(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get brokerage dashboard statistics"""
    # Base queries
    properties_query = db.query(Property)
    buyers_query = db.query(Client)
    matches_query = db.query(Match)
    marketing_leads_query = db.query(MarketingLead)
    
    # Filter by category if provided
    if category == "מגורים":
        properties_query = properties_query.filter(
            or_(
                Property.property_type == "דירה",
                Property.property_type == "בית פרטי"
            )
        )
        buyers_query = buyers_query.filter(
            or_(
                Client.preferred_property_type == "דירה",
                Client.preferred_property_type == "בית פרטי"
            )
        )
    elif category == "משרדים":
        properties_query = properties_query.filter(
            or_(
                Property.category == "מסחרי",
                Property.property_type == "משרד"
            )
        )
        buyers_query = buyers_query.filter(
            Client.preferred_property_type == "משרד"
        )
    
    # Counts
    properties_count = properties_query.count()
    buyers_count = buyers_query.count()
    matches_count = matches_query.count()
    marketing_leads_count = marketing_leads_query.count()
    
    return {
        "properties": properties_count,
        "buyers": buyers_count,
        "matches": matches_count,
        "marketing_leads": marketing_leads_count
    }

@router.get("/stats/projects")
async def get_projects_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get projects dashboard statistics"""
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    active_projects = db.query(func.count(Project.id)).filter(
        Project.status == "פתוח לדיירים"
    ).scalar() or 0
    total_project_leads = db.query(func.count(ProjectLead.id)).scalar() or 0
    total_marketing_leads = db.query(func.count(MarketingLead.id)).scalar() or 0
    
    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "total_project_leads": total_project_leads,
        "total_marketing_leads": total_marketing_leads
    }

@router.get("/stats/property-management")
async def get_property_management_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get property management dashboard statistics"""
    total_owners = db.query(func.count(PropertyOwner.id)).scalar() or 0
    total_tenants = db.query(func.count(Tenant.id)).scalar() or 0
    from src.models.service_call import ServiceCallStatus
    active_calls = db.query(func.count(ServiceCall.id)).filter(
        or_(
            ServiceCall.status == ServiceCallStatus.OPEN,
            ServiceCall.status == ServiceCallStatus.IN_PROGRESS
        )
    ).scalar() or 0
    total_suppliers = db.query(func.count(Supplier.id)).scalar() or 0
    
    return {
        "total_owners": total_owners,
        "total_tenants": total_tenants,
        "active_calls": active_calls,
        "total_suppliers": total_suppliers
    }

@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent activity across all entities"""
    activities = []
    now = datetime.utcnow()
    
    # Recent properties
    recent_properties = db.query(Property).order_by(
        Property.created_date.desc()
    ).limit(3).all()
    for prop in recent_properties:
        activities.append({
            "type": "property",
            "id": prop.id,
            "title": f"נכס חדש: {prop.property_type or 'לא מוגדר'} ב{prop.city or 'לא מוגדר'}",
            "subtitle": f"{prop.rooms or 0} חדרים • {prop.price or 0:,.0f} ₪" if prop.price else f"{prop.rooms or 0} חדרים",
            "status": getattr(prop, 'status', None) or "נכס חדש",
            "time": prop.created_date.isoformat() if prop.created_date else None
        })
    
    # Recent buyers
    recent_buyers = db.query(Client).order_by(
        Client.created_date.desc()
    ).limit(3).all()
    for buyer in recent_buyers:
        activities.append({
            "type": "buyer",
            "id": buyer.id,
            "title": "קונה חדש מעוניין",
            "subtitle": f"{buyer.preferred_property_type or 'לא מוגדר'} • תקציב: {buyer.budget or 0:,.0f} ₪" if buyer.budget else f"{buyer.preferred_property_type or 'לא מוגדר'}",
            "status": getattr(buyer, 'status', None) or "קונה חדש",
            "time": buyer.created_date.isoformat() if buyer.created_date else None
        })
    
    # Recent meetings
    recent_meetings = db.query(Meeting).order_by(
        Meeting.created_date.desc()
    ).limit(3).all()
    for meeting in recent_meetings:
        activities.append({
            "type": "meeting",
            "id": meeting.id,
            "title": f"פגישה: {meeting.title or 'לא מוגדר'}",
            "subtitle": meeting.start_date.strftime("%d/%m/%Y %H:%M") if meeting.start_date else "תאריך לא מוגדר",
            "status": getattr(meeting, 'status', None) or "נקבעה",
            "time": meeting.created_date.isoformat() if meeting.created_date else None
        })
    
    # Recent service calls
    recent_calls = db.query(ServiceCall).order_by(
        ServiceCall.created_date.desc()
    ).limit(3).all()
    for call in recent_calls:
        call_number = getattr(call, 'call_number', None) or str(call.id)[-4:]
        activities.append({
            "type": "service",
            "id": call.id,
            "title": f"קריאת שירות #{call_number}",
            "subtitle": (call.description[:50] + "...") if call.description and len(call.description) > 50 else (call.description or "אין תיאור"),
            "status": call.status.value if hasattr(call.status, 'value') else str(call.status),
            "time": call.created_date.isoformat() if call.created_date else None
        })
    
    # Sort by time and limit
    activities.sort(key=lambda x: x["time"] or "", reverse=True)
    return activities[:limit]

