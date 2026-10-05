from fastapi import APIRouter

from app.core.shipping import SHIPPING_OPTIONS
from app.schemas.shipping import ShippingOptionRead

router = APIRouter(prefix="/shipping", tags=["shipping"])


@router.get("/options", response_model=list[ShippingOptionRead])
def shipping_options() -> list[ShippingOptionRead]:
    return [ShippingOptionRead.model_validate(option) for option in SHIPPING_OPTIONS]
