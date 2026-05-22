from functools import lru_cache
from pathlib import Path
from pydantic import BaseModel
import os


class Settings(BaseModel):
    product_service_url: str = os.getenv(
        "PRODUCT_SERVICE_URL",
        "http://product-service:8081/pet_care_product",
    )
    data_dir: Path = Path(os.getenv("IMAGE_AI_DATA_DIR", "/app/data"))
    model_name: str = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
    pretrained: str = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")
    similarity_threshold: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.2"))
    request_timeout_seconds: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "20"))
    auto_reindex_on_empty: bool = os.getenv("AUTO_REINDEX_ON_EMPTY", "true").lower() == "true"
    include_builtin_analysis_profiles: bool = os.getenv(
        "IMAGE_ANALYSIS_INCLUDE_BUILT_INS",
        "false",
    ).lower() == "true"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    return settings
