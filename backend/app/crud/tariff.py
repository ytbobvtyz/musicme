from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from app.models.tariff import Tariff
from app.schemas.tariff import TariffCreate, TariffUpdate

class CRUDTariff:
    async def get(self, db: AsyncSession, id: UUID) -> Optional[Tariff]:
        result = await db.execute(select(Tariff).where(Tariff.id == id))
        return result.scalar_one_or_none()

    async def get_by_code(self, db: AsyncSession, code: str) -> Optional[Tariff]:
        result = await db.execute(select(Tariff).where(Tariff.code == code))
        return result.scalar_one_or_none()

    async def get_active(self, db: AsyncSession) -> List[Tariff]:
        result = await db.execute(
            select(Tariff)
            .where(Tariff.is_active == True)
            .order_by(Tariff.sort_order)
        )
        return result.scalars().all()

    async def get_all(self, db: AsyncSession) -> List[Tariff]:
        result = await db.execute(select(Tariff).order_by(Tariff.sort_order))
        return result.scalars().all()

    async def create(self, db: AsyncSession, tariff_in: TariffCreate) -> Tariff:
        tariff = Tariff(**tariff_in.dict())
        db.add(tariff)
        await db.commit()
        await db.refresh(tariff)
        return tariff

    async def update(
        self, db: AsyncSession, db_tariff: Tariff, tariff_in: TariffUpdate
    ) -> Tariff:
        update_data = tariff_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(db_tariff, field, update_data[field])
        
        db.add(db_tariff)
        await db.commit()
        await db.refresh(db_tariff)
        return db_tariff

    async def delete(self, db: AsyncSession, id: UUID) -> bool:
        result = await db.execute(select(Tariff).where(Tariff.id == id))
        tariff = result.scalar_one_or_none()
        if tariff:
            await db.delete(tariff)
            await db.commit()
            return True
        return False

crud_tariff = CRUDTariff()