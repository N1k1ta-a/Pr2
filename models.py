from sqlalchemy import Column, Integer, String, DateTime, Float
from database import Base
from datetime import datetime

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Competition(Base):
    __tablename__ = "competitions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(DateTime)
    status = Column(String, default="active")
