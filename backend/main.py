import os
import shutil
from jose import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Header, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

from database import engine, SessionLocal, Base, get_db
from models import DBLocation
from schemas import Location
from initial_data import INITIAL_DATA

# --- НАСТРОЙКИ БЕЗОПАСНОСТИ ---
SECRET_KEY = "super_secret_leti_key_2026"
ALGORITHM = "HS256"
ADMIN_PASSWORD = "admin" # Смени на свой!

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- СТРУКТУРА ВУЗА ---
LETI_STRUCTURE = {
    "1_2": [1, 2, 3, 4],
    "3": [1, 2, 3, 4],
    "4": [1, 2, 3, 4, 5],
    "5": [1, 2, 3, 4, 5, 6],
    "7": [1, 2, 3, 4]
}

app = FastAPI(title="LETI Tour API", version="6.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем папку для загрузок
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Раздаем файлы из папки uploads по адресу /media
app.mount("/media", StaticFiles(directory=UPLOAD_DIR), name="media")

# --- СЕРВИСНЫЕ ФУНКЦИИ ---
def verify_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Доступ запрещен")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Сессия истекла, войдите снова")

def validate_location(location: Location):
    if location.corpus not in LETI_STRUCTURE:
        raise HTTPException(status_code=400, detail=f"Корпус {location.corpus} не существует")
    if location.floor not in LETI_STRUCTURE[location.corpus]:
        raise HTTPException(status_code=400, detail=f"В корпусе {location.corpus} нет этажа {location.floor}")

# --- ЭНДПОИНТЫ ---

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(DBLocation).first() is None:
        for loc_data in INITIAL_DATA:
            db.add(DBLocation(**loc_data))
        db.commit()
    db.close()

@app.post("/api/login")
def login(data: dict = Body(...)):
    if data.get("password") == ADMIN_PASSWORD:
        token = jwt.encode(
            {"role": "admin", "exp": datetime.utcnow() + timedelta(hours=12)},
            SECRET_KEY, algorithm=ALGORITHM
        )
        return {"access_token": token}
    raise HTTPException(status_code=401, detail="Неверный пароль")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(verify_admin)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Возвращаем путь БЕЗ домена
    return {"url": f"/media/{file.filename}"}

@app.get("/api/locations", response_model=List[Location])
def get_all_locations(db: Session = Depends(get_db)):
    return db.query(DBLocation).all()

@app.post("/api/locations", response_model=Location)
def create_location(location: Location, db: Session = Depends(get_db), admin=Depends(verify_admin)):
    validate_location(location)
    if db.query(DBLocation).filter(DBLocation.id == location.id).first():
        raise HTTPException(status_code=400, detail="ID уже занят")
    db_loc = DBLocation(**location.model_dump())
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc

@app.put("/api/locations/{location_id}", response_model=Location)
def update_location(location_id: str, updated_location: Location, db: Session = Depends(get_db), admin=Depends(verify_admin)):
    validate_location(updated_location)
    db_loc = db.query(DBLocation).filter(DBLocation.id == location_id).first()
    if not db_loc: raise HTTPException(status_code=404)
    for key, value in updated_location.model_dump().items():
        setattr(db_loc, key, value)
    db.commit()
    return db_loc

@app.delete("/api/locations/{location_id}", status_code=204)
def delete_location(location_id: str, db: Session = Depends(get_db), admin=Depends(verify_admin)):
    db_loc = db.query(DBLocation).filter(DBLocation.id == location_id).first()
    if not db_loc: raise HTTPException(status_code=404)
    db.delete(db_loc)
    db.commit()
    return None