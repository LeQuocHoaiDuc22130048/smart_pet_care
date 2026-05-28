import json
from pathlib import Path
from threading import Lock

import faiss
import numpy as np

from app.config import get_settings
from app.schemas import SearchResult


class ProductVectorIndex:
    def __init__(self) -> None:
        settings = get_settings()
        self.index_path = settings.data_dir / "product_index.faiss"
        self.meta_path = settings.data_dir / "product_meta.json"
        self.lock = Lock()
        self.index: faiss.IndexFlatIP | None = None
        self.metadata: list[dict] = []
        self._load()

    @property
    def size(self) -> int:
        return len(self.metadata)

    def rebuild(self, embeddings: list[np.ndarray], metadata: list[dict]) -> int:
        with self.lock:
            if not embeddings:
                self.index = None
                self.metadata = []
                self._save()
                return 0

            matrix = np.vstack(embeddings).astype("float32")
            index = faiss.IndexFlatIP(matrix.shape[1])
            index.add(matrix)

            self.index = index
            self.metadata = metadata
            self._save()
            return len(metadata)

    def search(self, query_embedding: np.ndarray, top_k: int, threshold: float) -> list[SearchResult]:
        with self.lock:
            if self.index is None or not self.metadata:
                return []

            query = query_embedding.reshape(1, -1).astype("float32")
            limit = min(max(top_k, 1), len(self.metadata))
            scores, positions = self.index.search(query, limit)

            results: list[SearchResult] = []
            for score, position in zip(scores[0], positions[0]):
                if position < 0 or float(score) < threshold:
                    continue
                meta = self.metadata[int(position)]
                results.append(
                    SearchResult(
                        productId=meta["productId"],
                        score=round(float(score), 4),
                        productName=meta.get("productName"),
                        imageUrl=meta.get("imageUrl"),
                    )
                )
            return results

    def _load(self) -> None:
        if not self.index_path.exists() or not self.meta_path.exists():
            return

        try:
            self.index = faiss.read_index(str(self.index_path))
            self.metadata = json.loads(self.meta_path.read_text(encoding="utf-8"))
        except Exception:
            self.index = None
            self.metadata = []

    def _save(self) -> None:
        if self.index is not None:
            faiss.write_index(self.index, str(self.index_path))
        elif self.index_path.exists():
            self.index_path.unlink()

        self.meta_path.write_text(
            json.dumps(self.metadata, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


product_index = ProductVectorIndex()
