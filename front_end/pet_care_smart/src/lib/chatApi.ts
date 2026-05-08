/**
 * Chat API Client — PetCareSmart
 * Gemini trả về JSON structured: { text, suggestions }
 * Frontend render card có ảnh + link cho sản phẩm/dịch vụ.
 */

import { apiRequest } from './api';
import type { ApiResponse } from './api';
import { productApi } from './productApi';
import { bookingApi } from './bookingApi';
import type { Product } from './productApi';
import type { ServicePackage } from './bookingApi';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface UserContext {
    userName?: string;
    petNames?: string[];
    totalOrders?: number;
    lastOrderStatus?: string;
}

export interface ChatRequestPayload {
    message: string;
    history?: ChatMessage[];
    userContext?: UserContext;
}

/** Card gợi ý sản phẩm hoặc dịch vụ */
export interface SuggestionCard {
    type: 'product' | 'service';
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    link: string;           // route để navigate
    description?: string;
    durationMinutes?: number; // chỉ cho service
}

/** Kết quả parse từ Gemini */
export interface BotReply {
    text: string;
    suggestions?: SuggestionCard[];
}

export interface ChatResponseData {
    reply: string;          // raw text (dùng cho history)
    parsed: BotReply;       // structured để render
}

// ─── Gemini config ────────────────────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyBc3tjs1DV08PoAUNqSHumpenBpApeI1nA';

// Danh sách model fallback theo thứ tự ưu tiên
const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
];

function geminiUrl(model: string) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

// ─── Cache dữ liệu (5 phút) ───────────────────────────────────────────────────
let cachedProducts: Product[] = [];
let cachedServices: ServicePackage[] = [];
let cacheExpiry = 0;

async function loadCatalog(): Promise<void> {
    if (Date.now() < cacheExpiry) return;
    try {
        const [pRes, sRes] = await Promise.all([
            productApi.getAll(),
            bookingApi.getServicePackages(),
        ]);
        cachedProducts = (pRes.result ?? []).filter(p => p.status === 'ACTIVE');
        cachedServices = (sRes.result ?? []).filter(s => s.active);
        cacheExpiry = Date.now() + 5 * 60 * 1000;
    } catch {
        // giữ cache cũ nếu fetch lỗi
    }
}

// ─── Build system prompt ──────────────────────────────────────────────────────
function buildSystemPrompt(userContext?: UserContext): string {
    const productLines = cachedProducts.slice(0, 30).map(p => {
        const cats = p.category?.map(c => c.categoryName).join(', ') ?? '';
        const img = p.images?.find(i => i.isPrimary)?.imageUrl ?? p.images?.[0]?.imageUrl ?? '';
        return `ID:${p.id}|${p.productName}|${p.price}|${cats}|${img}`;
    });

    const serviceLines = cachedServices.map(s => {
        return `ID:${s.id}|${s.name}|${s.price}|${s.durationMinutes}min|${s.category}|${s.imageUrl ?? ''}`;
    });

    let prompt = `Bạn là trợ lý AI của PetCare Smart — nền tảng thương mại điện tử chuyên về thú cưng tại Việt Nam.

THÔNG TIN:
- Hotline: (84) 702 500 551 — 7:00–18:00 hàng ngày
- Thanh toán: VNPay, COD. Miễn phí ship đơn từ 300.000đ

NGUYÊN TẮC:
1. Trả lời tiếng Việt, thân thiện, xưng "mình", gọi khách là "bạn"
2. Dùng emoji phù hợp 🐾
3. Câu ngoài chủ đề thú cưng/PetCare thì lịch sự từ chối

QUAN TRỌNG — ĐỊNH DẠNG TRẢ LỜI:
Luôn trả về JSON hợp lệ theo đúng schema sau, KHÔNG thêm markdown code block, KHÔNG thêm text ngoài JSON:
{
  "text": "<câu trả lời thân thiện>",
  "suggestions": [
    {
      "type": "product",
      "id": "<ID từ danh sách>",
      "name": "<tên sản phẩm>",
      "price": <số nguyên>,
      "imageUrl": "<url hoặc chuỗi rỗng>",
      "description": "<mô tả ngắn>"
    }
  ]
}

Ví dụ khi không có gợi ý:
{"text":"Xin chào bạn! 🐾 Mình có thể giúp gì?","suggestions":[]}

Ví dụ khi có gợi ý sản phẩm:
{"text":"Mình gợi ý một số sản phẩm phù hợp nhé! 🛒","suggestions":[{"type":"product","id":"abc123","name":"Thức ăn Royal Canin","price":250000,"imageUrl":"https://...","description":"Dành cho chó trưởng thành"}]}

- "suggestions" là [] nếu không có gợi ý
- Chỉ gợi ý tối đa 4 items
- Chỉ dùng ID và thông tin từ danh sách bên dưới, KHÔNG bịa ID

DANH SÁCH SẢN PHẨM (format: ID|Tên|Giá|DanhMục|UrlẢnh):
${productLines.length > 0 ? productLines.join('\n') : '(chưa có sản phẩm)'}

DANH SÁCH DỊCH VỤ (format: ID|Tên|Giá|ThoiGian|LoaiDichVu|UrlẢnh):
${serviceLines.length > 0 ? serviceLines.join('\n') : '(chưa có dịch vụ)'}`;

    if (userContext?.userName) {
        prompt += `\n\nKHÁCH HÀNG: ${userContext.userName}`;
    }
    if (userContext?.petNames?.length) {
        prompt += `\nThú cưng: ${userContext.petNames.join(', ')}`;
    }

    return prompt;
}

// ─── Parse Gemini response → BotReply ────────────────────────────────────────
function parseGeminiText(raw: string, products: Product[], services: ServicePackage[]): BotReply {
    // Thử parse JSON — xử lý nhiều trường hợp Gemini trả về
    try {
        // Bỏ markdown code block nếu có
        let cleaned = raw.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/,'').trim();

        // Gemini đôi khi trả về JSON bị cắt — thử tìm object đầu tiên hợp lệ
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(cleaned);

        if (typeof parsed.text === 'string') {
            const suggestions: SuggestionCard[] = (parsed.suggestions ?? []).map((s: {
                type: string; id: string; name: string; price: number;
                imageUrl?: string; description?: string; durationMinutes?: number;
            }) => {
                if (s.type === 'product') {
                    const product = products.find(p => p.id === s.id);
                    return {
                        type: 'product' as const,
                        id: s.id,
                        name: s.name,
                        price: s.price,
                        imageUrl: product?.images?.find(i => i.isPrimary)?.imageUrl
                            ?? product?.images?.[0]?.imageUrl
                            ?? s.imageUrl,
                        link: `/products/${s.id}`,
                        description: s.description,
                    };
                } else {
                    return {
                        type: 'service' as const,
                        id: s.id,
                        name: s.name,
                        price: s.price,
                        imageUrl: services.find(sv => sv.id === s.id)?.imageUrl ?? s.imageUrl,
                        link: `/booking`,
                        description: s.description,
                        durationMinutes: s.durationMinutes,
                    };
                }
            });
            return { text: parsed.text, suggestions };
        }
    } catch {
        // không parse được JSON → trả về text thuần (bỏ JSON nếu lẫn vào)
    }

    // Fallback: nếu raw chứa JSON lẫn text, cố trích text field
    const textMatch = raw.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (textMatch) {
        return { text: textMatch[1].replace(/\\n/g, '\n'), suggestions: [] };
    }

    return { text: raw, suggestions: [] };
}

// ─── Gemini call với retry + model fallback ───────────────────────────────────
async function callGeminiFallback(payload: ChatRequestPayload): Promise<BotReply> {
    await loadCatalog();

    const contents: object[] = [];
    if (payload.history?.length) {
        for (const msg of payload.history.slice(-10)) {
            contents.push({ role: msg.role, parts: [{ text: msg.text }] });
        }
    }
    contents.push({ role: 'user', parts: [{ text: payload.message }] });

    const body = {
        contents,
        systemInstruction: { parts: [{ text: buildSystemPrompt(payload.userContext) }] },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.9,
        },
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Thử từng model, mỗi model retry 2 lần nếu 503/429
    for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const res = await fetch(geminiUrl(model), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (res.status === 503 || res.status === 429) {
                    // Server overloaded hoặc rate limit — đợi rồi thử lại
                    await sleep(1500 * (attempt + 1));
                    continue;
                }

                if (!res.ok) {
                    // Lỗi khác (404, 400...) → thử model tiếp theo
                    break;
                }

                const data = await res.json();
                const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                console.log('[ChatBot] raw Gemini response:', raw);
                const result = parseGeminiText(raw, cachedProducts, cachedServices);
                console.log('[ChatBot] parsed result:', result);
                console.log('[ChatBot] cachedProducts count:', cachedProducts.length);
                return result;

            } catch {
                // Network error → thử lại
                await sleep(1000);
            }
        }
    }

    // Tất cả model đều fail
    throw new Error('Gemini unavailable');
}

// ─── Main export ──────────────────────────────────────────────────────────────

const USE_BACKEND = false;

export async function sendChatMessage(
    payload: ChatRequestPayload
): Promise<ApiResponse<ChatResponseData>> {
    if (USE_BACKEND) {
        try {
            return await apiRequest<ChatResponseData>('/pet_care_chat/chat/message', {
                method: 'POST',
                body: payload,
            });
        } catch {
            // fallthrough
        }
    }

    const parsed = await callGeminiFallback(payload);
    return {
        code: 200,
        message: null,
        result: { reply: parsed.text, parsed },
    };
}
