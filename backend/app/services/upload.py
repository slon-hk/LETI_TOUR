import uuid
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile

from app.core.config import settings

# Allowed extensions by content type (basic check without libmagic dependency)
ALLOWED_EXTENSIONS: dict[str, str] = {
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".webp": "image",
    ".mp3": "audio",
    ".wav": "audio",
    ".m4a": "audio",
    ".ogg": "audio",
    ".aac": "audio",
    ".opus": "audio",
    ".flac": "audio",
    ".mp4": "video",
    ".glb": "model",
    ".gltf": "model",
    ".obj": "model",
    ".fbx": "model",
    ".stl": "model",
    ".dae": "model",
    ".ply": "model",
    ".usdz": "model",
    ".blend": "model",
}


async def save_upload(file: UploadFile) -> str:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Имя файла отсутствует")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Тип файла не разрешён: {ext}")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    dest = upload_dir / filename

    size = 0
    async with aiofiles.open(dest, "wb") as f:
        while chunk := await file.read(65536):
            size += len(chunk)
            if size > settings.MAX_UPLOAD_BYTES:
                dest.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="Файл слишком большой (макс. 50 МБ)")
            await f.write(chunk)

    return f"/media/{filename}"
