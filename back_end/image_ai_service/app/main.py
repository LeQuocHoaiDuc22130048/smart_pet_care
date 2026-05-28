import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.clip_model import embedding_model
from app.config import get_settings
from app.image_analysis import analyze_image
from app.index_store import product_index
from app.product_client import download_image, fetch_active_product_images
from app.schemas import HealthResponse, ImageAnalysisResponse, ImageSearchResponse, ReindexResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("image_ai_service")

app = FastAPI(
    title="PetCare Image AI Service",
    description="CLIP image embedding service for product similarity search.",
    version="1.0.0",
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="UP",
        indexedProducts=product_index.size,
        model=settings.model_name,
        pretrained=settings.pretrained,
    )


@app.post("/image-ai/reindex-products", response_model=ReindexResponse)
def reindex_products() -> ReindexResponse:
    return _reindex_products()


@app.post("/image-ai/search", response_model=ImageSearchResponse)
async def search_by_image(
    image: UploadFile = File(...),
    topK: int = Form(5),
) -> ImageSearchResponse:
    settings = get_settings()
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    if product_index.size == 0 and settings.auto_reindex_on_empty:
        _reindex_products()

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    query_embedding = embedding_model.embed_image_bytes(content)
    results = product_index.search(
        query_embedding=query_embedding,
        top_k=topK,
        threshold=settings.similarity_threshold,
    )
    return ImageSearchResponse(results=results, indexedProducts=product_index.size)


@app.post("/image-ai/analyze", response_model=ImageAnalysisResponse)
async def analyze_uploaded_image(image: UploadFile = File(...)) -> ImageAnalysisResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    return analyze_image(content)


def _reindex_products() -> ReindexResponse:
    products = fetch_active_product_images()
    embeddings = []
    metadata = []
    skipped = 0

    for product in products:
        try:
            content = download_image(product.image_url)
            embeddings.append(embedding_model.embed_image_bytes(content))
            metadata.append(
                {
                    "productId": product.product_id,
                    "productName": product.product_name,
                    "imageUrl": product.image_url,
                }
            )
        except Exception as exc:
            skipped += 1
            logger.warning("Skipping product %s: %s", product.product_id, exc)

    indexed = product_index.rebuild(embeddings, metadata)
    return ReindexResponse(indexedProducts=indexed, skippedProducts=skipped)
