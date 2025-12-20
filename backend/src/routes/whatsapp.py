"""
WhatsApp integration routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from src.database import get_db
from src.models import User
from src.models.marketing_lead import MarketingLead
from src.models.marketing_log import MarketingLog
from src.utils.auth import get_current_user

router = APIRouter()

class WhatsAppMessageRequest(BaseModel):
    phone_number: str
    message: str
    lead_id: Optional[int] = None

class BulkWhatsAppRequest(BaseModel):
    lead_ids: List[int]
    message_template: str

@router.post("/send")
async def send_whatsapp_message(
    request: WhatsAppMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send WhatsApp message to a lead
    Note: This is a placeholder. Integrate with actual WhatsApp Business API
    """
    # Format phone number (remove non-digits, add country code if needed)
    import re
    phone = re.sub(r'\D', '', request.phone_number)
    if phone.startswith('0'):
        phone = '972' + phone[1:]
    
    # TODO: Integrate with WhatsApp Business API
    # For now, just log the message
    try:
        log_entry = MarketingLog(
            lead_id=request.lead_id,
            phone_number=request.phone_number,
            message_sent=request.message,
            status='sent',  # or 'failed' if API call fails
            sent_by=current_user.id
        )
        db.add(log_entry)
        db.commit()
        
        return {
            "success": True,
            "message_id": f"whatsapp_{log_entry.id}",
            "status": "sent"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.post("/send-bulk")
async def send_bulk_whatsapp(
    request: BulkWhatsAppRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send bulk WhatsApp messages
    """
    results = []
    
    for lead_id in request.lead_ids:
        lead = db.query(MarketingLead).filter(MarketingLead.id == lead_id).first()
        if not lead:
            results.append({"lead_id": lead_id, "status": "failed", "error": "Lead not found"})
            continue
        
        # Personalize message
        message = request.message_template
        message = message.replace("{first_name}", lead.first_name or "")
        message = message.replace("{last_name}", lead.last_name or "")
        message = message.replace("{neighborhood}", lead.neighborhood or "")
        message = message.replace("{budget}", str(lead.budget) if lead.budget else "")
        
        try:
            # Send message (placeholder)
            log_entry = MarketingLog(
                lead_id=lead_id,
                phone_number=lead.phone_number,
                message_sent=message,
                status='sent',
                sent_by=current_user.id
            )
            db.add(log_entry)
            results.append({"lead_id": lead_id, "status": "sent", "message_id": log_entry.id})
        except Exception as e:
            results.append({"lead_id": lead_id, "status": "failed", "error": str(e)})
    
    db.commit()
    
    return {
        "total": len(request.lead_ids),
        "sent": len([r for r in results if r["status"] == "sent"]),
        "failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    }

