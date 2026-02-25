import enum
from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    RESOLVED = "resolved"


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    tickets: Mapped[list["Ticket"]] = relationship(back_populates="contact")


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)
    contact_id: Mapped[int] = mapped_column(ForeignKey("contacts.id"))
    issue_description: Mapped[str] = mapped_column(Text)
    status: Mapped[TicketStatus] = mapped_column(default=TicketStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    contact: Mapped["Contact"] = relationship(back_populates="tickets")
