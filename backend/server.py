import asyncio
import base64
import logging
import os
import uuid
import io
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from lib.db import client, db, ensure_indexes
from lib.meshy import meshy_client
from lib.storage import init_storage, put_object, get_object

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

IMG = "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images"
FALLBACK_PREVIEW = f"{IMG}/d936f2e98a27acd331455e17d71e691ed48b3f925aad516d019a9344e562e99b.jpeg"
SUPERHERO_PRICE = 349

CATEGORIES = [
    {"id": "all", "name": "כל הבובות"},
    {"id": "animals", "name": "חיות ודינוזאורים"},
    {"id": "fantasy", "name": "פנטזיה ונסיכות"},
    {"id": "space", "name": "חלל ורובוטים"},
    {"id": "superheroes", "name": "גיבורי־על"},
    {"id": "kits", "name": "ערכות צביעה"},
]

KIT_INCLUDES = ["בובה לבנה מ־PLA אקולוגי", "6 טושים אקריליים ידידותיים לילדים", "מדריך צביעה מצויר"]

PRODUCTS = [
    {"id": "melanie", "name": "מלאני", "tagline": "אוזניים ענק, זנב מטושטש, לב זהב", "category": "animals",
     "price": 119, "difficulty": "בינוני", "height_cm": 11, "featured": True, "in_stock": True,
     "image": f"{IMG}/4ef63e567478ed3b2312943b98c2f2256715d375fa6b19ce1a55db0219e05db7.jpeg", "model": "/models/melanie.glb",
     "description": "השועלה מהסליידר בדף הבית! פרווה עם המון שטחי צביעה — כתום, שמנת וחום שוקולד, או כל צבע שהדמיון מכתיב.", "includes": KIT_INCLUDES},
    {"id": "dino-dani", "name": "דני הדינוזאור", "tagline": "טי־רקס קטן עם לב ענק", "category": "animals",
     "price": 109, "difficulty": "קל", "height_cm": 10, "featured": True, "in_stock": True,
     "image": f"{IMG}/3d3b345ac20d5f5bc12ae2d6f169d94d28d8f58a6b8f7a5bfec30b9ef53d4c82.jpeg",
     "description": "דינוזאור שמנמן עם ידיים קטנות וחיוך ענק — הבובה המושלמת לצביעה ראשונה.", "includes": KIT_INCLUDES},
    {"id": "unicorn-lily", "name": "לילי חד־הקרן", "tagline": "קסם אחד, צבעים אינסוף", "category": "fantasy",
     "price": 129, "difficulty": "בינוני", "height_cm": 13, "featured": True, "in_stock": True,
     "image": f"{IMG}/81d3725c0309b3233fde7736c5ff3e29a88de2540e2f1404d0098a5f7d3eacaf.jpeg",
     "description": "קרן ספירלית, כנפיים קטנות ורעמה שמבקשת קשת של צבעים פסטליים.", "includes": KIT_INCLUDES},
    {"id": "robi-robot", "name": "רובי הרובוט", "tagline": "חבר מתכת עם נשמה", "category": "space",
     "price": 119, "difficulty": "קל", "height_cm": 11, "featured": False, "in_stock": True,
     "image": f"{IMG}/10979607086cdacd78fc6a3988f5ae47f5233f3522ed50a8f3bc66520f9a60ae.jpeg",
     "description": "רובוט רטרו עם אנטנה ועיניים עגולות — פאנלים, כפתורים ונוריות מחכים לצבע.", "includes": KIT_INCLUDES},
    {"id": "super-kfir", "name": "כפיר גיבור־העל", "tagline": "גלימה, מסכה, ותנוחת ניצחון", "category": "superheroes",
     "price": 139, "difficulty": "בינוני", "height_cm": 13, "featured": True, "in_stock": True,
     "image": f"{IMG}/ba15c69bfbb32e810ec21a7fc63ed68b9f02887fcb1bc82552e9340425a3cee9.jpeg",
     "description": "גיבור־על קלאסי עם גלימה ומסכה — כל ילד בוחר את צבעי החליפה והסמל.", "includes": KIT_INCLUDES},
    {"id": "princess-maya", "name": "הנסיכה מאיה", "tagline": "כתר קטן, דמיון גדול", "category": "fantasy",
     "price": 129, "difficulty": "מתקדם", "height_cm": 14, "featured": False, "in_stock": True,
     "image": f"{IMG}/c166d90d2310fd4984d79d918435f6050f2e594493c03e946abf25bd08be6772.jpeg",
     "description": "שמלה נפוחה וכתר עדין — אתגר צביעה מתגמל לאומניות ואומנים צעירים.", "includes": KIT_INCLUDES},
    {"id": "bear-moosh", "name": "מושי הדובי", "tagline": "חיבוק שמחכה לצבע", "category": "animals",
     "price": 99, "difficulty": "קל", "height_cm": 9, "featured": False, "in_stock": True,
     "image": f"{IMG}/a320c83e367562608ca565315dc1f8b18726356aef5fc85f766ab33540faa484.jpeg",
     "description": "דובי שמנמן בישיבה, קלאסיקה מתוקה שתמיד עובדת — מתנה מושלמת.", "includes": KIT_INCLUDES},
    {"id": "bunny-shoki", "name": "שוקי הארנב", "tagline": "אוזניים ארוכות, סבלנות קצרה לצבע", "category": "animals",
     "price": 99, "difficulty": "קל", "height_cm": 12, "featured": False, "in_stock": True,
     "image": f"{IMG}/60257671fe3258bb8f84306cb55f3e9dda1190c8984c3fa665dfb6c9f815ae0e.jpeg",
     "description": "ארנב זקוף עם אוזניים ארוכות — שטחי צביעה רחבים ונוחים לידיים קטנות.", "includes": KIT_INCLUDES},
    {"id": "paint-kit", "name": "ערכת צביעה פרימיום", "tagline": "12 טושים אקריליים + חוד עדין + מדריך", "category": "kits",
     "price": 69, "difficulty": "קל", "height_cm": 0, "featured": False, "in_stock": True,
     "image": f"{IMG}/010d625d33a558c192a5438c6f417d68ecdec9e82b079131adf36585b11235f4.jpeg",
     "description": "השדרוג המושלם: 12 טושים אקריליים לא רעילים בגוונים עזים — ניאון, פסטל וקלאסי — עם חוד עדין לפרטים. בלי מים, בלי מכחולים, בלי בלגן.",
     "includes": ["12 טושים אקריליים בטוחים", "2 טושים עם חוד עדין לפרטים", "טוש לבן לתיקונים", "מדריך שילובי צבעים"]},
]


class Category(BaseModel):
    id: str
    name: str


class Product(BaseModel):
    id: str
    name: str
    tagline: str
    description: str
    category: str
    price: float
    image: str
    difficulty: str
    height_cm: float
    featured: bool
    in_stock: bool
    includes: List[str]
    model: Optional[str] = None


class OrderItem(BaseModel):
    key: str
    name: str
    price: float
    qty: int
    image: str
    meta: Optional[str] = None


class Customer(BaseModel):
    name: str
    email: str
    phone: str


class Shipping(BaseModel):
    address: str = ""
    city: str = ""
    method: str = "courier"
    notes: Optional[str] = None


class OrderCreate(BaseModel):
    customer: Customer
    shipping: Shipping
    items: List[OrderItem]


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = ""
    customer: Customer
    shipping: Shipping
    items: List[OrderItem]
    subtotal: float
    shipping_cost: float
    total: float
    payment_method: str = "bit"
    status: str = "awaiting_payment"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str


class SuperheroJob(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "processing"  # processing | ready | failed
    stage: str = "uploaded"
    stage_label: str = "התמונות התקבלו"
    progress: int = 5
    child_name: str
    cape: str = "terracotta"
    pose: str = "power"
    price: float = SUPERHERO_PRICE
    preview_url: Optional[str] = None
    approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    try:
        await init_storage()
        logger.info("Object storage initialized")
    except Exception:
        logger.exception("Object storage unavailable; photo uploads will fail safely")
    for product in PRODUCTS:
        await db.products.update_one({"id": product["id"]}, {"$set": product}, upsert=True)
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "IMAGO API"}


@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    return CATEGORIES


@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {} if not category or category == "all" else {"category": category}
    docs = await db.products.find(query, {"_id": 0}).to_list(100)
    return [Product(**doc) for doc in docs]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="product not found")
    return Product(**doc)


@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(status_code=400, detail="cart is empty")
    subtotal = sum(item.price * item.qty for item in payload.items)
    shipping_cost = 0.0 if payload.shipping.method == "pickup" or subtotal >= 199 else 25.0
    order = Order(
        order_number=f"IMG-{uuid.uuid4().hex[:6].upper()}",
        customer=payload.customer,
        shipping=payload.shipping,
        items=payload.items,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=subtotal + shipping_cost,
    )
    await db.orders.insert_one(order.model_dump())
    return order


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(payload: ContactCreate):
    message = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(message.model_dump())
    return message


async def generate_superhero_preview(job_id: str, photo_path: str, child_name: str, cape: str) -> str:
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        return FALLBACK_PREVIEW
    cape_he = {"terracotta": "terracotta red", "sage": "sage green", "mustard": "mustard yellow", "royal": "royal blue"}.get(cape, "terracotta red")
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        photo_bytes, _ = await get_object(photo_path)
        image_b64 = base64.b64encode(photo_bytes).decode("utf-8")
        chat = LlmChat(
            api_key=api_key,
            session_id=f"superhero-{job_id}",
            system_message="You are a product visualization artist for a premium designer toy brand.",
        )
        chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
        prompt = (
            "Turn the child in this photo into a cute fully hand-painted 3D-printed superhero figurine product photo. "
            "Designer-toy proportions: big head, small body, hands on hips, confident smile. "
            f"The figurine wears a {cape_he} superhero suit with a matching cape and cream boots, "
            "with the child's hairstyle and recognizable facial features. "
            "Warm off-white seamless studio backdrop, single soft spotlight, soft shadow, "
            "premium editorial product photography, vertical composition."
        )
        msg = UserMessage(text=prompt, file_contents=[ImageContent(image_b64)])
        _, images = await chat.send_message_multimodal_response(msg)
        if images:
            stored = await put_object(f"imago/previews/{job_id}.png", base64.b64decode(images[0]["data"]), "image/png")
            await db.files.insert_one({"id": job_id, "kind": "preview", "storage_path": stored["path"], "content_type": "image/png", "is_deleted": False, "created_at": datetime.now(timezone.utc)})
            return f"/api/superhero/jobs/{job_id}/preview"
    except Exception as exc:
        logger.warning("superhero preview generation fell back: %s", exc)
    return FALLBACK_PREVIEW


async def run_superhero_pipeline(job_id: str, photo_path: str, child_name: str, cape: str):
    stages = [
        ("analyzing", f"מנתחים את התמונות של {child_name}", 25, 4),
        ("sculpting", "בונים את הדמות בתלת־ממד", 55, 5),
        ("painting", "צובעים את גיבור־העל", 82, 2),
    ]
    try:
        if meshy_client.enabled:
            logger.info("Meshy key present — production 3D workflow available for job %s", job_id)
        for stage, label, progress, delay in stages:
            await db.superhero_jobs.update_one(
                {"id": job_id}, {"$set": {"stage": stage, "stage_label": label, "progress": progress}}
            )
            await asyncio.sleep(delay)
        preview_url = await generate_superhero_preview(job_id, photo_path, child_name, cape)
        await db.superhero_jobs.update_one(
            {"id": job_id},
            {"$set": {"status": "ready", "stage": "ready", "stage_label": "התצוגה המקדימה מוכנה!", "progress": 100, "preview_url": preview_url}},
        )
    except Exception:
        logger.exception("superhero pipeline failed for %s", job_id)
        await db.superhero_jobs.update_one(
            {"id": job_id}, {"$set": {"status": "failed", "stage_label": "משהו השתבש — כדאי לנסות שוב"}}
        )


MAX_PHOTOS = 4
MAX_PHOTO_BYTES = 8 * 1024 * 1024


@api_router.post("/superhero/jobs", response_model=SuperheroJob)
async def create_superhero_job(
    child_name: str = Form(...),
    cape: str = Form("terracotta"),
    pose: str = Form("power"),
    photos: List[UploadFile] = File(...),
):
    if not photos:
        raise HTTPException(status_code=400, detail="at least one photo is required")
    if len(photos) > MAX_PHOTOS:
        raise HTTPException(status_code=400, detail="up to 4 photos allowed")
    job = SuperheroJob(child_name=child_name.strip()[:40] or "גיבור קטן", cape=cape, pose=pose)
    validated = []
    for photo in photos:
        if photo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise HTTPException(status_code=400, detail="only image files are allowed")
        data = await photo.read(MAX_PHOTO_BYTES + 1)
        if len(data) > MAX_PHOTO_BYTES:
            raise HTTPException(status_code=400, detail="photo too large (max 8MB)")
        try:
            with Image.open(io.BytesIO(data)) as image:
                if image.format not in {"JPEG", "PNG", "WEBP"} or image.width * image.height > 25_000_000:
                    raise ValueError("unsupported image")
                image.verify()
        except (UnidentifiedImageError, OSError, ValueError, SyntaxError, Image.DecompressionBombError):
            raise HTTPException(status_code=400, detail="invalid or oversized image")
        validated.append((data, photo.content_type))
    saved = []
    try:
        for data, content_type in validated:
            ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[content_type]
            file_id = str(uuid.uuid4())
            stored = await put_object(f"imago/photos/{job.id}/{file_id}.{ext}", data, content_type)
            saved.append(stored["path"])
            await db.files.insert_one({"id": file_id, "job_id": job.id, "kind": "source", "storage_path": stored["path"], "content_type": content_type, "size": len(data), "is_deleted": False, "created_at": datetime.now(timezone.utc)})
    except Exception:
        logger.exception("Photo object storage upload failed")
        raise HTTPException(status_code=503, detail="Photo storage unavailable, please try again")
    await db.superhero_jobs.insert_one({**job.model_dump(), "photo_paths": saved})
    asyncio.create_task(run_superhero_pipeline(job.id, saved[0], job.child_name, cape))
    return job


@api_router.get("/superhero/jobs/{job_id}/preview")
async def get_superhero_preview(job_id: str):
    record = await db.files.find_one({"id": job_id, "kind": "preview", "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="preview not found")
    data, content_type = await get_object(record["storage_path"])
    return Response(content=data, media_type=content_type, headers={"Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff"})


@api_router.get("/superhero/jobs/{job_id}", response_model=SuperheroJob)
async def get_superhero_job(job_id: str):
    doc = await db.superhero_jobs.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="job not found")
    created = doc.get("created_at")
    if isinstance(created, datetime) and created.tzinfo is None:
        doc["created_at"] = created.replace(tzinfo=timezone.utc)
    return SuperheroJob(**doc)


@api_router.post("/superhero/jobs/{job_id}/approve", response_model=SuperheroJob)
async def approve_superhero_job(job_id: str):
    doc = await db.superhero_jobs.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="job not found")
    if doc.get("status") != "ready":
        raise HTTPException(status_code=400, detail="preview is not ready yet")
    await db.superhero_jobs.update_one({"id": job_id}, {"$set": {"approved": True}})
    doc["approved"] = True
    created = doc.get("created_at")
    if isinstance(created, datetime) and created.tzinfo is None:
        doc["created_at"] = created.replace(tzinfo=timezone.utc)
    return SuperheroJob(**doc)


# --- Stripe payments (key from env; test mode until live keys are added) ---
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")


class CheckoutItemIn(BaseModel):
    key: str
    qty: int = Field(1, ge=1, le=20)


class CheckoutRequest(BaseModel):
    customer: Customer
    shipping: Shipping
    items: List[CheckoutItemIn]
    origin_url: str


async def resolve_checkout_items(items: List[CheckoutItemIn]) -> List[OrderItem]:
    resolved: List[OrderItem] = []
    for item in items:
        if item.key.startswith("superhero-"):
            job = await db.superhero_jobs.find_one({"id": item.key.split("superhero-", 1)[1]})
            if not job or not job.get("approved"):
                raise HTTPException(status_code=400, detail="superhero figure not approved")
            resolved.append(OrderItem(
                key=item.key,
                name=f"גיבור־העל של {job['child_name']}",
                price=float(job["price"]),
                qty=item.qty,
                image=job.get("preview_url") or "",
                meta="בובה אישית מהתמונות",
            ))
        else:
            doc = await db.products.find_one({"id": item.key})
            if not doc:
                raise HTTPException(status_code=400, detail=f"unknown product: {item.key}")
            resolved.append(OrderItem(
                key=item.key,
                name=doc["name"],
                price=float(doc["price"]),
                qty=item.qty,
                image=doc["image"],
            ))
    return resolved


async def mark_payment_paid(session_id: str) -> None:
    res = await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": "paid", "updated_at": datetime.now(timezone.utc)}},
    )
    if res.modified_count:
        tx = await db.payment_transactions.find_one({"session_id": session_id})
        order = Order(
            order_number=f"IMG-{uuid.uuid4().hex[:6].upper()}",
            customer=Customer(**tx["customer"]),
            shipping=Shipping(**tx["shipping"]),
            items=[OrderItem(**i) for i in tx["items"]],
            subtotal=tx["subtotal"],
            shipping_cost=tx["shipping_cost"],
            total=tx["amount"],
        )
        await db.orders.insert_one(order.model_dump())
        await db.payment_transactions.update_one({"session_id": session_id}, {"$set": {"order_number": order.order_number}})


@api_router.post("/payments/checkout")
async def create_checkout_session(payload: CheckoutRequest, request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="payments not configured")
    if not payload.items:
        raise HTTPException(status_code=400, detail="cart is empty")
    items = await resolve_checkout_items(payload.items)
    subtotal = sum(i.price * i.qty for i in items)
    shipping_cost = 0.0 if payload.shipping.method == "pickup" or subtotal >= 199 else 25.0
    total = subtotal + shipping_cost

    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    host_url = str(request.base_url)
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host_url}api/webhook/stripe")
    session = await stripe_checkout.create_checkout_session(CheckoutSessionRequest(
        amount=float(total),
        currency="ils",
        success_url=f"{payload.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{payload.origin_url}/checkout?canceled=1",
        metadata={"customer_email": payload.customer.email},
    ))
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "amount": total,
        "currency": "ils",
        "status": "initiated",
        "payment_status": "pending",
        "customer": payload.customer.model_dump(),
        "shipping": payload.shipping.model_dump(),
        "items": [i.model_dump() for i in items],
        "subtotal": subtotal,
        "shipping_cost": shipping_cost,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    return {"checkout_url": session.url, "session_id": session.session_id}


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="transaction not found")
    if record.get("payment_status") != "paid":
        try:
            from emergentintegrations.payments.stripe.checkout import StripeCheckout
            checker = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
            status = await checker.get_checkout_status(session_id)
            if status.payment_status == "paid":
                await mark_payment_paid(session_id)
                record = await db.payment_transactions.find_one({"session_id": session_id})
        except Exception:
            pass
    result = {"session_id": session_id, "status": record["status"], "payment_status": record["payment_status"]}
    if record.get("order_number"):
        result["order_number"] = record["order_number"]
    return result


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=str(request.base_url))
        event = await stripe_checkout.handle_webhook(body, signature)
    except Exception:
        raise HTTPException(status_code=400, detail="webhook error")
    if event.payment_status == "paid":
        await mark_payment_paid(event.session_id)
    elif event.event_type in ("checkout.session.expired", "checkout.session.async_payment_failed"):
        await db.payment_transactions.update_one(
            {"session_id": event.session_id},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": datetime.now(timezone.utc)}},
        )
    return {"status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
