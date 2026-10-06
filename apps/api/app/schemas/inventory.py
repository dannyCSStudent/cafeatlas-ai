from pydantic import BaseModel, Field


class InventoryUpdate(BaseModel):
    inventory_units: int = Field(ge=0, le=1_000_000)
