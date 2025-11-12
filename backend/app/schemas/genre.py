from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class GenreBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class GenreCreate(GenreBase):
    pass

class Genre(GenreBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True