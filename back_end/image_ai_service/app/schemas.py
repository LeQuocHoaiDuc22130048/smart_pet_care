from pydantic import BaseModel


class SearchResult(BaseModel):
    productId: str
    score: float
    productName: str | None = None
    imageUrl: str | None = None


class ImageSearchResponse(BaseModel):
    results: list[SearchResult]
    indexedProducts: int


class ReindexResponse(BaseModel):
    indexedProducts: int
    skippedProducts: int


class HealthResponse(BaseModel):
    status: str
    indexedProducts: int
    model: str
    pretrained: str


class ImageAnalysisResponse(BaseModel):
    summary: str
    observations: list[str]
    careTips: list[str]
    warnings: list[str]
    searchKeywords: list[str]
    confidence: float
    matchedLabel: str
