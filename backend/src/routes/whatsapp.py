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
from src.models.do_not_call_list import DoNotCallList
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
    # Check Do Not Call List
    dnc_entry = db.query(DoNotCallList).filter(
        DoNotCallList.phone_number == request.phone_number
    ).first()
    
    if dnc_entry:
        db.rollback()  # Rollback any pending transaction
        raise HTTPException(
            status_code=403,
            detail=f"Phone number {request.phone_number} is on the Do Not Call List"
        )
    
    # Also check normalized version for flexible matching
    import re
    if not dnc_entry:
        normalized_phone = re.sub(r'[\s\-\(\)]', '', request.phone_number)
        dnc_entries = db.query(DoNotCallList).all()
        for dnc in dnc_entries:
            if dnc.phone_number:
                dnc_normalized = re.sub(r'[\s\-\(\)]', '', dnc.phone_number)
                if normalized_phone == dnc_normalized:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Phone number {request.phone_number} is on the Do Not Call List"
                    )
    
    # Check if lead has opted out
    if request.lead_id:
        lead = db.query(MarketingLead).filter(MarketingLead.id == request.lead_id).first()
        if lead:
            # Handle both boolean and string values for opt_out_whatsapp
            opt_out_value = lead.opt_out_whatsapp
            if isinstance(opt_out_value, str):
                opt_out_value = opt_out_value.lower() in ['true', 'כן', 'yes', '1']
            if opt_out_value is True:
                raise HTTPException(
                    status_code=403,
                    detail="Lead has opted out of WhatsApp messages"
                )
    
    # Format phone number (remove non-digits, add country code if needed)
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
        
        # Check Do Not Call List (normalize phone number for comparison)
        import re
        if not lead.phone_number:
            results.append({"lead_id": lead_id, "status": "failed", "error": "Lead has no phone number"})
            continue
            
        normalized_lead_phone = re.sub(r'[\s\-\(\)]', '', lead.phone_number)
        dnc_entry = db.query(DoNotCallList).filter(
            DoNotCallList.phone_number == lead.phone_number
        ).first()
        
        # Also check normalized version if exact match not found
        if not dnc_entry:
            dnc_entries = db.query(DoNotCallList).all()
            for dnc in dnc_entries:
                if dnc.phone_number:
                    dnc_normalized = re.sub(r'[\s\-\(\)]', '', dnc.phone_number)
                    if normalized_lead_phone == dnc_normalized:
                        dnc_entry = dnc
                        break
        
        if dnc_entry:
            results.append({
                "lead_id": lead_id,
                "status": "failed",
                "error": "Phone number is on the Do Not Call List"
            })
            continue
        
        # Check opt-out preference
        # Refresh the lead to ensure we have the latest data
        db.refresh(lead)
        # Handle both boolean and string values for opt_out_whatsapp
        opt_out_value = lead.opt_out_whatsapp
        if isinstance(opt_out_value, str):
            opt_out_value = opt_out_value.lower() in ['true', 'כן', 'yes', '1']
        if opt_out_value is True:
            results.append({
                "lead_id": lead_id,
                "status": "failed",
                "error": "Lead has opted out of WhatsApp messages"
            })
            continue
        
        # Personalize message
        message = request.message_template
        message = message.replace("{first_name}", lead.first_name or "")
        message = message.replace("{last_name}", lead.last_name or "")
        message = message.replace("{neighborhood}", lead.neighborhood or "")
        # Format budget without decimals if it's a whole number
        if lead.budget:
            # Check if budget is a whole number by comparing with its integer conversion
            budget_float = float(lead.budget)
            budget_str = str(int(budget_float)) if budget_float == int(budget_float) else str(lead.budget)
            message = message.replace("{budget}", budget_str)
        else:
            message = message.replace("{budget}", "")
        
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

