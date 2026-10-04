"""Private object storage; original child photos have no public download route."""
import asyncio
import os
import requests

STORAGE_URL = os.environ["INTEGRATION_PROXY_URL"].rstrip("/") + "/objstore/api/v1/storage"
_storage_key = None
_lock = asyncio.Lock()


def _init():
    response = requests.post(
        f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30
    )
    response.raise_for_status()
    return response.json()["storage_key"]


async def init_storage():
    global _storage_key
    async with _lock:
        if _storage_key is None:
            _storage_key = await asyncio.to_thread(_init)
    return _storage_key


async def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = await init_storage()
    response = await asyncio.to_thread(
        requests.put, f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120,
    )
    response.raise_for_status()
    return response.json()


async def get_object(path: str) -> tuple[bytes, str]:
    key = await init_storage()
    response = await asyncio.to_thread(
        requests.get, f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60,
    )
    response.raise_for_status()
    return response.content, response.headers.get("Content-Type", "application/octet-stream")