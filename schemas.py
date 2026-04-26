from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ParticipantBase(BaseModel):
    name: str
    team: str
    score: float = 0.0

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CompetitionBase(BaseModel):
    title: str
    date: datetime
    status: str = "active"

class CompetitionCreate(CompetitionBase):
    pass

class CompetitionResponse(CompetitionBase):
    id: int

    class Config:
        from_attributes = True
