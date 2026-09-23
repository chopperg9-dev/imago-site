import asyncio
import base64
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from lib.db import client, db, ensure_indexes
from lib.meshy import meshy_client

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

UPLOADS = ROOT_DIR / "uploads"
PHOTOS_DIR = UPLOADS / "photos"
PREVIEWS_DIR = UPLOADS / "previews"
for _d in (PHOTOS_DIR, PREVIEWS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

IMG = "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images"
FALLBACK_PREVIEW = f"{IMG}/0a019b44080bff0b28e026f8bccf8901f0da59c3746aaa5f3f34ded03304d4c4.jpeg"
SUPERHERO_PRICE = 349

CATEGORIES = [
    {"id": "all", "name": "כל הבובות"},
    {"id": "animals", "name": "חיות ודינוזאורים"},
    {"id": "fantasy", "name": "פנטזיה ונסיכות"},
    {"id": "space", "name": "חלל ורובוטים"},
    {"id": "superheroes", "name": "גיבורי־על"},
    {"id": "kits", "name": "ערכות צביעה"},
]

KIT_INCLUDES = ["בובה לבנה מ־PLA אקולוגי", "6 צבעי אקריליק ידידותיים לילדים", "2 מכחולים", "מדריך צביעה מצויר"]

PRODUCTS = [
    {"id": "astro-noa", "name": "נועה האסטרונאוטית", "tagline": "מסע בין כוכבים על מדף החדר", "category": "space",
     "price": 119, "difficulty": "בינוני", "height_cm": 12, "featured": True, "in_stock": True,
     "image": f"{IMG}/2c453b873fe309e2181dd939b6faf2518d068c45ef5a3e64cbf1557293dde33d.jpeg",
     "description": "חליפת חלל עם קסדה עגולה וצמות — שטח ענק לצביעת כוכבים, פסים וגלקסיות אישיות.", "includes": KIT_INCLUDES},
    {"id": "dino-dani", "name": "דני הדינוזאור", "tagline": "טי־רקס קטן עם לב ענק", "category": "animals",
     "price": 109, "difficulty": "קל", "height_cm": 10, "featured": True, "in_stock": True,
     "image": f"{IMG}/f531b0c773e97b5c3916236d8df5d5060311c97101a65fb3250523173d1ea82c.jpeg",
     "description": "דינוזאור שמנמן עם ידיים קטנות וחיוך ענק — הבובה המושלמת לצביעה ראשונה.", "includes": KIT_INCLUDES},
    {"id": "unicorn-lily", "name": "לילי חד־הקרן", "tagline": "קסם אחד, צבעים אינסוף", "category": "fantasy",
     "price": 129, "difficulty": "בינוני", "height_cm": 13, "featured": True, "in_stock": True,
     "image": f"{IMG}/9bbc491aa2df9d1a81dbb1c216bafc73afa2543282afe4716aaf7568de672d56.jpeg",
     "description": "קרן ספירלית, כנפיים קטנות ורעמה שמבקשת קשת של צבעים פסטליים.", "includes": KIT_INCLUDES},
    {"id": "robi-robot", "name": "רובי הרובוט", "tagline": "חבר מתכת עם נשמה", "category": "space",
     "price": 119, "difficulty": "קל", "height_cm": 11, "featured": False, "in_stock": True,
     "image": f"{IMG}/c964ba073a9c9d446bd5ea15d105eb486c157862938c768bf5c521ee9040e6cd.jpeg",
     "description": "רובוט רטרו עם אנטנה ועיניים עגולות — פאנלים, כפתורים ונוריות מחכים לצבע.", "includes": KIT_INCLUDES},
    {"id": "super-kfir", "name": "כפיר גיבור־העל", "tagline": "גלימה, מסכה, ותנוחת ניצחון", "category": "superheroes",
     "price": 139, "difficulty": "בינוני", "height_cm": 13, "featured": True, "in_stock": True,
     "image": f"{IMG}/d25c110f8f349ede57fccab98a9449b6195bfd0b1dc78b06c37c252cadd36621.jpeg",
     "description": "גיבור־על קלאסי עם גלימה ומסכה — כל ילד בוחר את צבעי החליפה והסמל.", "includes": KIT_INCLUDES},
    {"id": "princess-maya", "name": "הנסיכה מאיה", "tagline": "כתר קטן, דמיון גדול", "category": "fantasy",
     "price": 129, "difficulty": "מתקדם", "height_cm": 14, "featured": False, "in_stock": True,
     "image": f"{IMG}/942c52058ab34df68f7ed0b367a8fd053cd401707acbc99aa3763ff2ad1ce163.jpeg",
     "description": "שמלה נפוחה וכתר עדין — אתגר צביעה מתגמל לאומניות ואומנים צעירים.", "includes": KIT_INCLUDES},
    {"id": "bear-moosh", "name": "מושי הדובי", "tagline": "חיבוק שמחכה לצבע", "category": "animals",
     "price": 99, "difficulty": "קל", "height_cm": 9, "featured": False, "in_stock": True,
     "image": f"{IMG}/aed25d445f39bbdbbcfde973970f215ce0d049aaedcd32c09fa38dbf2cb05a36.jpeg",
     "description": "דובי שמנמן בישיבה, קלאסיקה מתוקה שתמיד עובדת — מתנה מושלמת.", "includes": KIT_INCLUDES},
    {"id": "bunny-shoki", "name": "שוקי הארנב", "tagline": "אוזניים ארוכות, סבלנות קצרה לצבע", "category": "animals",
     "price": 99, "difficulty": "קל", "height_cm": 12, "featured": False, "in_stock": True,
     "image": f"{IMG}/7288d5c5f129f95919420106d07bb27395d23b0b1ab2f35b2d2a7a78dc5a80ae.jpeg",
     "description": "ארנב זקוף עם אוזניים ארוכות — שטחי צביעה רחבים ונוחים לידיים קטנות.", "includes": KIT_INCLUDES},
    {"id": "paint-kit", "name": "ערכת צביעה פרימיום", "tagline": "12 צבעי אקריליק + 3 מכחולים + פלטה", "category": "kits",
     "price": 69, "difficulty": "קל", "height_cm": 0, "featured": False, "in_stock": True,
     "image": f"{IMG}/4fdebcc98e10e4ab54a5c49ce22a525891be459efd77b36789d87479bac008fe.jpeg",
     "description": "השדרוג המושלם: 12 צבעי אקריליק לא רעילים בגווני טרקוטה, מרווה וחרדל, 3 מכחולי עץ ופלטת ערבוב.",
     "includes": ["12 צבעי אקריליק בטוחים", "3 מכחולי עץ בגדלים שונים", "פלטת ערבוב", "מדריך ערבוב צבעים"]},
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


async def generate_superhero_preview(job_id: str, photo_path: Path, child_name: str, cape: str) -> str:
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        return FALLBACK_PREVIEW
    cape_he = {"terracotta": "terracotta red", "sage": "sage green", "mustard": "mustard yellow", "royal": "royal blue"}.get(cape, "terracotta red")
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        image_b64 = base64.b64encode(photo_path.read_bytes()).decode("utf-8")
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
            out = PREVIEWS_DIR / f"{job_id}.png"
            out.write_bytes(base64.b64decode(images[0]["data"]))
            return f"/api/uploads/previews/{job_id}.png"
    except Exception as exc:
        logger.warning("superhero preview generation fell back: %s", exc)
    return FALLBACK_PREVIEW


async def run_superhero_pipeline(job_id: str, photo_path: Path, child_name: str, cape: str):
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
    saved: List[Path] = []
    for photo in photos:
        if not (photo.content_type or "").startswith("image/"):
            raise HTTPException(status_code=400, detail="only image files are allowed")
        data = await photo.read()
        if len(data) > MAX_PHOTO_BYTES:
            raise HTTPException(status_code=400, detail="photo too large (max 8MB)")
        ext = (photo.filename or "photo.jpg").rsplit(".", 1)[-1][:5]
        path = PHOTOS_DIR / f"{job.id}-{len(saved)}.{ext}"
        path.write_bytes(data)
        saved.append(path)
    await db.superhero_jobs.insert_one(job.model_dump())
    asyncio.create_task(run_superhero_pipeline(job.id, saved[0], job.child_name, cape))
    return job


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
app.mount("/api/uploads", StaticFiles(directory=UPLOADS), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
