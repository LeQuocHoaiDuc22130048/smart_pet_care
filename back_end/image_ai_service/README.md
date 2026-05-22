# PetCare Image AI Service

FastAPI service dùng OpenCLIP pretrained để tạo embedding ảnh và FAISS để tìm sản phẩm tương tự.

## Endpoints

- `GET /health`
- `POST /image-ai/reindex-products`: tải ảnh sản phẩm từ `product_service`, tạo vector và lưu FAISS index.
- `POST /image-ai/search`: nhận `multipart/form-data` với field `image`, trả về `productId` và `score`.

## Ghi chú

Lần chạy đầu tiên OpenCLIP cần tải pretrained weights. Khi demo, nên chạy `POST /image-ai/reindex-products` sau khi `product_service` đã có dữ liệu sản phẩm và ảnh.

Nếu Docker log hiện cảnh báo `You are sending unauthenticated requests to the HF Hub`, service vẫn chạy được nhưng Hugging Face có thể tải model chậm hoặc bị rate limit. Tạo token tại https://huggingface.co/settings/tokens rồi thêm vào file `back_end/.env`:

```env
HF_TOKEN=hf_xxx
```

Sau đó restart container:

```bash
docker compose up -d --force-recreate image-ai-service
```

Dockerfile cài `torch` và `torchvision` bằng CPU-only wheel từ PyTorch index để tránh tải các gói CUDA rất nặng. Nếu chạy local không dùng Docker, nên cài trước:

```bash
pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1+cpu torchvision==0.20.1+cpu
pip install -r requirements.txt
```
