from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import models
import schemas
from database import SessionLocal, engine

# Создаём таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sorevnovania API", version="1.0.0")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ========== Эндпоинты для участников ==========
@app.post("/api/participants", response_model=schemas.ParticipantResponse)
def create_participant(participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    db_participant = models.Participant(**participant.model_dump())
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant

@app.get("/api/participants", response_model=List[schemas.ParticipantResponse])
def get_participants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    participants = db.query(models.Participant).offset(skip).limit(limit).all()
    return participants

@app.get("/api/participants/{participant_id}", response_model=schemas.ParticipantResponse)
def get_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant

@app.put("/api/participants/{participant_id}", response_model=schemas.ParticipantResponse)
def update_participant(participant_id: int, participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    db_participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not db_participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    for key, value in participant.model_dump().items():
        setattr(db_participant, key, value)
    
    db.commit()
    db.refresh(db_participant)
    return db_participant

@app.delete("/api/participants/{participant_id}")
def delete_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    db.delete(participant)
    db.commit()
    return {"message": "Participant deleted successfully"}

# ========== Эндпоинты для соревнований ==========
@app.post("/api/competitions", response_model=schemas.CompetitionResponse)
def create_competition(competition: schemas.CompetitionCreate, db: Session = Depends(get_db)):
    db_competition = models.Competition(**competition.model_dump())
    db.add(db_competition)
    db.commit()
    db.refresh(db_competition)
    return db_competition

@app.get("/api/competitions", response_model=List[schemas.CompetitionResponse])
def get_competitions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    competitions = db.query(models.Competition).offset(skip).limit(limit).all()
    return competitions

@app.get("/api/competitions/{competition_id}", response_model=schemas.CompetitionResponse)
def get_competition(competition_id: int, db: Session = Depends(get_db)):
    competition = db.query(models.Competition).filter(models.Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    return competition

@app.put("/api/competitions/{competition_id}", response_model=schemas.CompetitionResponse)
def update_competition(competition_id: int, competition: schemas.CompetitionCreate, db: Session = Depends(get_db)):
    db_competition = db.query(models.Competition).filter(models.Competition.id == competition_id).first()
    if not db_competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    for key, value in competition.model_dump().items():
        setattr(db_competition, key, value)
    
    db.commit()
    db.refresh(db_competition)
    return db_competition

@app.delete("/api/competitions/{competition_id}")
def delete_competition(competition_id: int, db: Session = Depends(get_db)):
    competition = db.query(models.Competition).filter(models.Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    db.delete(competition)
    db.commit()
    return {"message": "Competition deleted successfully"}

@app.get("/")
def root():
    return {"message": "Sorevnovania API is running", "docs": "/docs", "redoc": "/redoc"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
