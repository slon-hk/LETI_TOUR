from fastapi import APIRouter, Depends, File, UploadFile

from app.core.dependencies import require_role
from app.models.user import RoleEnum, User
from app.services.upload import save_upload

router = APIRouter(tags=["uploads"])

_editor_or_above = require_role(RoleEnum.superadmin, RoleEnum.editor)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    _user: User = Depends(_editor_or_above),
):
    url = await save_upload(file)
    return {"url": url}
