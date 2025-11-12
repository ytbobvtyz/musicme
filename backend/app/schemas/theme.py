from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ThemeBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class ThemeCreate(ThemeBase):
    pass

class Theme(ThemeBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True