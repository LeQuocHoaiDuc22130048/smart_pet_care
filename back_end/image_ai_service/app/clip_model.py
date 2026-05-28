from io import BytesIO

import numpy as np
import open_clip
import torch
from PIL import Image

from app.config import get_settings


class ClipEmbeddingModel:
    def __init__(self) -> None:
        settings = get_settings()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            settings.model_name,
            pretrained=settings.pretrained,
        )
        self.model = self.model.to(self.device)
        self.model.eval()

    def embed_image_bytes(self, content: bytes) -> np.ndarray:
        image = Image.open(BytesIO(content)).convert("RGB")
        return self.embed_image(image)

    def embed_image(self, image: Image.Image) -> np.ndarray:
        image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            features = self.model.encode_image(image_tensor)
            features = features / features.norm(dim=-1, keepdim=True)
        return features.cpu().numpy().astype("float32")[0]

    def classify_image_bytes(self, content: bytes, labels: list[str]) -> tuple[int, float]:
        scores = self.score_image_labels(content, labels)
        probabilities = torch.softmax(torch.tensor(scores), dim=-1)
        confidence, index = probabilities.max(dim=0)
        return int(index.item()), float(confidence.item())

    def score_image_labels(self, content: bytes, labels: list[str]) -> list[float]:
        image = Image.open(BytesIO(content)).convert("RGB")
        image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
        text_tokens = open_clip.tokenize(labels).to(self.device)

        with torch.no_grad():
            image_features = self.model.encode_image(image_tensor)
            text_features = self.model.encode_text(text_tokens)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            similarities = image_features @ text_features.T

        return similarities[0].cpu().tolist()


embedding_model = ClipEmbeddingModel()
