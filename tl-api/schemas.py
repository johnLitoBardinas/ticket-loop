from datetime import datetime

from html import escape

from pydantic import BaseModel, EmailStr, field_validator

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

    @field_validator("full_name", "issue_description")
    @classmethod
    def sanitize_string(cls, v: str) -> str:
        return escape(v.strip())

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return escape(v.strip().lower())


class TicketResponse(BaseModel):
    id: int
    contact_id: int
    issue_description: str
    status: TicketStatus
    created_at: datetime
    contact: ContactResponse

    model_config = {"from_attributes": True}
