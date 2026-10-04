"""Public API regression tests for IMAGO commerce + superhero object storage flows."""

import io
import os
import time
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from PIL import Image
from pymongo import MongoClient


def _load_public_base_url() -> str:
    """Use configured public URL only; never fallback to localhost/defaults."""
    env_url = os.environ.get("REACT_APP_BACKEND_URL", "").strip()
    if env_url:
        return env_url.rstrip("/")

    env_file = Path("/app/frontend/.env")
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                value = line.split("=", 1)[1].strip()
                if value:
                    return value.rstrip("/")
    raise RuntimeError("REACT_APP_BACKEND_URL is required for public endpoint testing")


BASE_URL = _load_public_base_url()
API_URL = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


@pytest.fixture(scope="session")
def mongo_db():
    """DB verification fixture for persistence checks on superhero storage metadata."""
    load_dotenv("/app/backend/.env")
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not mongo_url or not db_name:
        pytest.skip("MONGO_URL/DB_NAME unavailable for storage persistence checks")
    client = MongoClient(mongo_url)
    db = client[db_name]
    yield db
    client.close()


def _tiny_png_bytes(color=(245, 120, 60)) -> bytes:
    image = Image.new("RGB", (16, 16), color=color)
    buff = io.BytesIO()
    image.save(buff, format="PNG")
    return buff.getvalue()


def test_products_and_categories_basics(session):
    """Catalog module: categories and product list should be available and populated."""
    cat_res = session.get(f"{API_URL}/categories", timeout=30)
    assert cat_res.status_code == 200
    categories = cat_res.json()
    assert isinstance(categories, list)
    assert any(c["id"] == "all" for c in categories)

    prod_res = session.get(f"{API_URL}/products", timeout=30)
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert len(products) == 9
    assert all(p.get("image") for p in products)


def test_products_filter_and_single_product(session):
    """Catalog module: category filtering and product fetch behavior."""
    animals_res = session.get(f"{API_URL}/products?category=animals", timeout=30)
    assert animals_res.status_code == 200
    animals = animals_res.json()
    assert len(animals) >= 1
    assert all(p["category"] == "animals" for p in animals)

    melanie_res = session.get(f"{API_URL}/products/melanie", timeout=30)
    assert melanie_res.status_code == 200
    melanie = melanie_res.json()
    assert melanie["name"] == "מלאני"
    assert melanie["price"] == 119


def test_product_missing_returns_404(session):
    """Catalog module: missing product should return 404 + clear detail."""
    res = session.get(f"{API_URL}/products/not-a-real-product", timeout=30)
    assert res.status_code == 404
    assert "detail" in res.json()


def test_create_order_shipping_rules(session):
    """Order module: shipping fee rules for courier under/over free shipping threshold."""
    low_payload = {
        "customer": {"name": "TEST Redesign", "email": "test@example.com", "phone": "0503331809"},
        "shipping": {"address": "הדקל 8", "city": "תל אביב", "method": "courier", "notes": "qa"},
        "items": [{"key": "melanie", "name": "מלאני", "price": 119, "qty": 1, "image": "https://example.com/melanie.png"}],
    }
    low = session.post(f"{API_URL}/orders", json=low_payload, timeout=30)
    assert low.status_code == 200
    low_data = low.json()
    assert low_data["shipping_cost"] == 25
    assert low_data["status"] == "awaiting_payment"
    assert low_data["payment_method"] == "bit"

    high_payload = {
        "customer": {"name": "TEST Redesign", "email": "test@example.com", "phone": "0503331809"},
        "shipping": {"address": "הדקל 8", "city": "תל אביב", "method": "courier", "notes": "qa"},
        "items": [{"key": "bulk", "name": "כפול מלאני", "price": 119, "qty": 2, "image": "https://example.com/melanie.png"}],
    }
    high = session.post(f"{API_URL}/orders", json=high_payload, timeout=30)
    assert high.status_code == 200
    high_data = high.json()
    assert high_data["shipping_cost"] == 0
    assert high_data["total"] == 238


def test_contact_submission(session):
    """Contact module: valid contact message should persist and echo payload."""
    payload = {
        "name": "TEST Redesign",
        "email": "test@example.com",
        "phone": "0503331809",
        "message": "בדיקת עיצוב מחדש",
    }
    res = session.post(f"{API_URL}/contact", json=payload, timeout=30)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["message"] == payload["message"]


def test_superhero_rejects_invalid_type(session):
    """Superhero upload module: reject non-image content types."""
    files = [("photos", ("bad.txt", b"not-an-image", "text/plain"))]
    data = {"child_name": "TEST Child", "cape": "terracotta", "pose": "power"}
    res = session.post(f"{API_URL}/superhero/jobs", files=files, data=data, timeout=60)
    assert res.status_code == 400
    assert "image" in res.json().get("detail", "")


def test_superhero_rejects_invalid_image_bytes(session):
    """Superhero upload module: reject bad image bytes even if image content-type is sent."""
    files = [("photos", ("fake.jpg", b"12345-not-a-real-jpeg", "image/jpeg"))]
    data = {"child_name": "TEST Child", "cape": "terracotta", "pose": "power"}
    res = session.post(f"{API_URL}/superhero/jobs", files=files, data=data, timeout=60)
    assert res.status_code == 400
    assert "invalid" in res.json().get("detail", "")


def test_superhero_rejects_oversized_file(session):
    """Superhero upload module: reject >8MB uploads."""
    too_large = b"x" * (8 * 1024 * 1024 + 5)
    files = [("photos", ("large.png", too_large, "image/png"))]
    data = {"child_name": "TEST Child", "cape": "terracotta", "pose": "power"}
    res = session.post(f"{API_URL}/superhero/jobs", files=files, data=data, timeout=120)
    assert res.status_code == 400
    assert "8MB" in res.json().get("detail", "")


def test_superhero_rejects_more_than_4_photos(session):
    """Superhero upload module: reject request with more than 4 photos."""
    tiny = _tiny_png_bytes()
    files = [("photos", (f"p{i}.png", tiny, "image/png")) for i in range(5)]
    data = {"child_name": "TEST Child", "cape": "terracotta", "pose": "power"}
    res = session.post(f"{API_URL}/superhero/jobs", files=files, data=data, timeout=60)
    assert res.status_code == 400
    assert "up to 4 photos" in res.json().get("detail", "")


def test_superhero_upload_persistence_poll_preview_and_approve(session, mongo_db):
    """Superhero module: accepted upload stores metadata, becomes ready, preview usable, approve works."""
    tiny = _tiny_png_bytes((130, 160, 210))
    files = [("photos", ("ok.png", tiny, "image/png"))]
    data = {"child_name": "TEST Redesign", "cape": "sage", "pose": "power"}
    create = session.post(f"{API_URL}/superhero/jobs", files=files, data=data, timeout=120)
    assert create.status_code == 200
    job = create.json()
    assert job["status"] == "processing"
    job_id = job["id"]

    db_job = mongo_db.superhero_jobs.find_one({"id": job_id})
    assert db_job is not None
    assert isinstance(db_job.get("photo_paths"), list)
    assert len(db_job.get("photo_paths")) == 1

    source_file = mongo_db.files.find_one({"job_id": job_id, "kind": "source", "is_deleted": False})
    assert source_file is not None
    assert source_file.get("storage_path", "").startswith("imago/photos/")

    deadline = time.time() + 55
    final = None
    while time.time() < deadline:
        status_res = session.get(f"{API_URL}/superhero/jobs/{job_id}", timeout=30)
        assert status_res.status_code == 200
        final = status_res.json()
        if final["status"] in {"ready", "failed"}:
            break
        time.sleep(2)

    assert final is not None
    assert final["status"] == "ready"
    assert isinstance(final.get("photo_paths"), list) is False  # response model intentionally hides internal paths

    preview_url = final.get("preview_url")
    assert preview_url
    if str(preview_url).startswith("/api/superhero/jobs/"):
        preview_res = session.get(f"{BASE_URL}{preview_url}", timeout=60)
        assert preview_res.status_code == 200
        assert preview_res.headers.get("content-type", "").startswith("image/")
    else:
        external_preview = session.get(preview_url, timeout=60)
        assert external_preview.status_code == 200

    approve = session.post(f"{API_URL}/superhero/jobs/{job_id}/approve", timeout=30)
    assert approve.status_code == 200
    approved = approve.json()
    assert approved["approved"] is True


def test_source_photo_routes_not_exposed(session):
    """Security module: no source-photo route should be exposed in OpenAPI."""
    # Common historical/private route guesses must not be publicly exposed.
    guessed_paths = [
        f"{API_URL}/superhero/jobs/fake-job-id/source",
        f"{API_URL}/superhero/source/fake-job-id",
        f"{API_URL}/superhero/jobs/fake-job-id/photos/0",
    ]
    statuses = [session.get(url, timeout=30).status_code for url in guessed_paths]
    assert all(code in {404, 405} for code in statuses)
