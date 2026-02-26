from contextlib import asynccontextmanager
from typing import List
import logging

import httpx
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

WEBHOOK_URL = "http://host.docker.internal:9999/api/webhook/ticket-created"

from database import engine, get_db
from models import Base, Contact, Ticket, TicketStatus
from schemas import TicketCreate, TicketResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def health():
    return "Hello World!!!"

# GET /api/v1/tickets
@app.get("/api/v1/tickets", response_model=List[TicketResponse])
async def get_tickets(db: AsyncSession = Depends(get_db)):
    query = select(Ticket).options(selectinload(Ticket.contact))

    results = await db.execute(query)

    tickets = results.scalars().all()

    return tickets

# POST /api/v1/tickets
@app.post("/api/v1/tickets", response_model=TicketResponse)
async def create_ticket(data: TicketCreate, db: AsyncSession = Depends(get_db)):
    query = select(Contact).where(Contact.email == data.email)

    result = await db.execute(query)

    contact = result.scalar_one_or_none()

    if contact is None:
        contact = Contact(full_name=data.full_name,email=data.email)
        db.add(contact)
        await db.flush()

    ticket = Ticket(contact_id=contact.id, issue_description=data.issue_description)

    db.add(ticket)

    await db.commit()

    await db.refresh(ticket, attribute_names=["contact"])

    ticket_data = TicketResponse.model_validate(ticket).model_dump(mode="json")

    try:
        async with httpx.AsyncClient() as client:
            await client.post(WEBHOOK_URL, json=ticket_data, timeout=10.0)
    except httpx.RequestError as e:
        logger.error(f"Webhook notification failed: {e}")

    return ticket

# PATCH /api/v1/tickets/{ticket_id}/resolve
@app.patch("/api/v1/tickets/{ticket_id}/resolve", response_model=TicketResponse)
async def resolve_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Ticket).options(selectinload(Ticket.contact)).where(Ticket.id == ticket_id)

    result = await db.execute(query)

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = TicketStatus.RESOLVED

    await db.commit()

    await db.refresh(ticket, attribute_names=["contact"])
    return ticket
