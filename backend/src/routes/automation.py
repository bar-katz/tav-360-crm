"""
CRM Automation routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.user import User
from src.models.property import Property
from src.models.client import Client
from src.utils.auth import get_current_user

router = APIRouter()

@router.post("/generate-matches")
async def generate_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate matches between properties and clients
    Simple implementation - can be enhanced with ML/matching algorithms
    """
    # Get all properties and clients
    properties = db.query(Property).all()
    clients = db.query(Client).all()
    
    matches = []
    
    # Simple matching logic based on budget and property type
    for client in clients:
        for property in properties:
            # Basic matching criteria
            match_score = 0
            
            # Budget matching (if client has budget and property has price)
            if client.budget and property.price:
                price_diff = abs(float(client.budget) - float(property.price))
                if price_diff < float(client.budget) * 0.2:  # Within 20%
                    match_score += 50
            
            # Property type matching
            if client.preferred_property_type and property.property_type:
                if client.preferred_property_type == property.property_type:
                    match_score += 30
            
            # City matching
            if client.city and property.city:
                if client.city == property.city:
                    match_score += 20
            
            if match_score > 50:  # Threshold for a match
                matches.append({
                    "property_id": property.id,
                    "client_id": client.id,
                    "match_score": match_score
                })
    
    return {
        "matches_generated": len(matches),
        "matches": matches
    }

