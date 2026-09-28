from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.repositories.checkout import prepare_checkout_lines
from app.schemas.checkout import CheckoutPrepareRead, CheckoutPrepareRequest

router = APIRouter(tags=["checkout"])


@router.post("/checkout/prepare", response_model=CheckoutPrepareRead)
def prepare_checkout(
    payload: CheckoutPrepareRequest,
    session: Session = Depends(get_db_session),
) -> CheckoutPrepareRead:
    lines = prepare_checkout_lines(session, payload.items)
    subtotal_cents = sum(line.line_total_cents for line in lines)
    return CheckoutPrepareRead(
        items=lines,
        subtotal_cents=subtotal_cents,
        shipping_cents=0,
        tax_cents=0,
        total_cents=subtotal_cents,
        currency_code="USD",
        checkout_ready=False,
    )
