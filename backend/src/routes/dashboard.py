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
    """Get brokerage dashboard statistics
    
    Filtering logic matches frontend:
    - Properties: filtered by category
    - Buyers: filtered by preferred_property_type matching category
    - Matches: filtered by property category AND buyer property type AND transaction type match
    """
    # Base queries
    properties_query = db.query(Property)
    buyers_query = db.query(Client)
    matches_query = db.query(Match).join(Property).join(Client)
    marketing_leads_query = db.query(MarketingLead)
    
    # Filter by category if provided
    if category == "מגורים":
        properties_query = properties_query.filter(
            Property.category == "מגורים"
        )
        buyers_query = buyers_query.filter(
            or_(
                Client.preferred_property_type == "דירה",
                Client.preferred_property_type == "בית פרטי",
                Client.preferred_property_type == "בית"  # Legacy value for backward compatibility
            )
        )
        # Filter matches: property category AND buyer property type AND transaction type match
        matches_query = matches_query.filter(
            and_(
                Property.category == "מגורים",
                or_(
                    Client.preferred_property_type == "דירה",
                    Client.preferred_property_type == "בית פרטי",
                    Client.preferred_property_type == "בית"  # Legacy value for backward compatibility
                ),
                # Transaction type match: property listing_type should match client request_type
                # Handle both Hebrew variations: מכירה/השכרה vs קנייה/שכירות
                or_(
                    Property.listing_type == Client.request_type,
                    and_(
                        Property.listing_type == "מכירה",
                        Client.request_type == "קנייה"
                    ),
                    and_(
                        Property.listing_type == "השכרה",
                        Client.request_type == "שכירות"
                    )
                )
            )
        )
    elif category == "משרדים":
        properties_query = properties_query.filter(
            Property.category == "משרדים"
        )
        buyers_query = buyers_query.filter(
            or_(
                Client.preferred_property_type == "משרד",
                Client.preferred_property_type == "מסחרי"
            )
        )
        # Filter matches: property category AND buyer property type AND transaction type match
        matches_query = matches_query.filter(
            and_(
                Property.category == "משרדים",
                or_(
                    Client.preferred_property_type == "משרד",
                    Client.preferred_property_type == "מסחרי"
                ),
                # Transaction type match
                or_(
                    Property.listing_type == Client.request_type,
                    and_(
                        Property.listing_type == "מכירה",
                        Client.request_type == "קנייה"
                    ),
                    and_(
                        Property.listing_type == "השכרה",
                        Client.request_type == "שכירות"
                    )
                )
            )
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

@router.get("/alerts")
async def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get alerts - complex business logic for dashboard alerts panel"""
    now = datetime.utcnow()
    four_hours_ago = now - timedelta(hours=4)
    one_day_ago = now - timedelta(days=1)
    tomorrow = now + timedelta(days=1)
    
    # Untreated leads (buyers with status="קונה חדש" created >4 hours ago)
    untreated_leads = db.query(Client).join(Contact).filter(
        and_(
            Client.status == "קונה חדש",
            Client.created_date <= four_hours_ago
        )
    ).all()
    
    untreated_leads_data = []
    for buyer in untreated_leads:
        contact = db.query(Contact).filter(Contact.id == buyer.contact_id).first()
        hours_ago = int((now - buyer.created_date).total_seconds() / 3600)
        untreated_leads_data.append({
            "id": buyer.id,
            "contact": {
                "id": contact.id if contact else None,
                "full_name": contact.full_name if contact else None
            },
            "created_date": buyer.created_date.isoformat() if buyer.created_date else None,
            "hours_ago": hours_ago,
            "desired_property_type": buyer.preferred_property_type,
            "request_category": buyer.request_type,
            "budget": float(buyer.budget) if buyer.budget else None
        })
    
    # Recent matches (created in last 24 hours)
    recent_matches = db.query(Match).filter(
        Match.created_date >= one_day_ago
    ).order_by(Match.created_date.desc()).limit(5).all()
    
    recent_matches_data = []
    for match in recent_matches:
        recent_matches_data.append({
            "id": match.id,
            "match_score": match.match_score,
            "created_date": match.created_date.isoformat() if match.created_date else None
        })
    
    # Urgent service calls (urgency="דחוף" or "גבוהה")
    from src.models.service_call import ServiceCallStatus
    urgent_service_calls = db.query(ServiceCall).filter(
        or_(
            ServiceCall.urgency == "דחוף",
            ServiceCall.urgency == "גבוהה"
        )
    ).order_by(ServiceCall.created_date.desc()).limit(10).all()
    
    urgent_service_calls_data = []
    for call in urgent_service_calls:
        call_number = getattr(call, 'call_number', None) or str(call.id)[-4:]
        urgent_service_calls_data.append({
            "id": call.id,
            "call_number": call_number,
            "urgency": call.urgency,
            "description": call.description,
            "status": call.status.value if hasattr(call.status, 'value') else str(call.status)
        })
    
    # Urgent meetings (within 24 hours)
    urgent_meetings = db.query(Meeting).filter(
        and_(
            Meeting.start_date >= now,
            Meeting.start_date <= tomorrow
        )
    ).order_by(Meeting.start_date.asc()).limit(10).all()
    
    urgent_meetings_data = []
    for meeting in urgent_meetings:
        urgent_meetings_data.append({
            "id": meeting.id,
            "title": meeting.title,
            "meeting_type": getattr(meeting, 'meeting_type', None),
            "start_date": meeting.start_date.isoformat() if meeting.start_date else None
        })
    
    return {
        "untreated_leads": untreated_leads_data,
        "recent_matches": recent_matches_data,
        "urgent_service_calls": urgent_service_calls_data,
        "urgent_meetings": urgent_meetings_data,
        "total_alerts": len(untreated_leads_data) + len(urgent_service_calls_data) + len(urgent_meetings_data)
    }

