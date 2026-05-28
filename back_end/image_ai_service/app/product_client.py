from dataclasses import dataclass

import requests

from app.config import get_settings


@dataclass(frozen=True)
class ProductImageItem:
    product_id: str
    product_name: str
    image_url: str


def fetch_active_product_images() -> list[ProductImageItem]:
    settings = get_settings()
    response = requests.get(
        f"{settings.product_service_url}/products",
        timeout=settings.request_timeout_seconds,
    )
    response.raise_for_status()

    products = response.json().get("result", [])
    items: list[ProductImageItem] = []
    for product in products:
        if str(product.get("status", "")).upper() != "ACTIVE":
            continue

        image_url = _select_image_url(product.get("images") or [])
        if not image_url:
            continue

        items.append(
            ProductImageItem(
                product_id=str(product.get("id")),
                product_name=str(product.get("productName") or ""),
                image_url=image_url,
            )
        )
    return items


def download_image(url: str) -> bytes:
    settings = get_settings()
    response = requests.get(url, timeout=settings.request_timeout_seconds)
    response.raise_for_status()
    return response.content


def _select_image_url(images: list[dict]) -> str | None:
    if not images:
        return None

    for image in images:
        if image.get("isPrimary") and image.get("imageUrl"):
            return str(image["imageUrl"])

    for image in images:
        if image.get("imageUrl"):
            return str(image["imageUrl"])

    return None
