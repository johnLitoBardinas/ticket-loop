from datetime import datetime

from pydantic import BaseModel, EmailStr

from models import TicketStatus


class ContactCreate(BaseModel):
    full_name: str
    email: EmailStr


class ContactResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketCreate(BaseModel):
    full_name: str
    email: EmailStr
    issue_description: str


class TicketResponse(BaseModel):
    id: int
    contact_id: int
    issue_description: str
    status: TicketStatus
    created_at: datetime

    model_config = {"from_attributes": True}
