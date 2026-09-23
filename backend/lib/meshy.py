"""Meshy API client — image-to-3D workflow for the personalized superhero line.

Active only when MESHY_API_KEY is set in backend/.env. Until then the
superhero pipeline runs in mock mode (simulated stages + AI preview render).
Docs: https://docs.meshy.ai
"""
import os
import httpx


class MeshyClient:
    def __init__(self) -> None:
        self.api_key = os.environ.get("MESHY_API_KEY", "")
        self.base_url = "https://api.meshy.ai/openapi/v2"

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.api_key}"}

    async def create_image_to_3d_task(self, image_url: str) -> str:
        """Submit an image-to-3D task; returns the Meshy task id."""
        async with httpx.AsyncClient(timeout=30) as http:
            res = await http.post(
                f"{self.base_url}/image-to-3d",
                headers=self._headers(),
                json={
                    "image_url": image_url,
                    "enable_pbr": True,
                    "should_remesh": True,
                    "topology": "quad",
                    "target_polycount": 30000,
                },
            )
            res.raise_for_status()
            return res.json()["result"]

    async def get_task(self, task_id: str) -> dict:
        """Poll a task: status is PENDING/IN_PROGRESS/SUCCEEDED/FAILED."""
        async with httpx.AsyncClient(timeout=30) as http:
            res = await http.get(
                f"{self.base_url}/image-to-3d/{task_id}", headers=self._headers()
            )
            res.raise_for_status()
            return res.json()


meshy_client = MeshyClient()
