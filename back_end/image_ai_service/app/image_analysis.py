import json
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from app.clip_model import embedding_model
from app.config import get_settings
from app.schemas import ImageAnalysisResponse

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AnalysisProfile:
    label: str
    prompts: list[str]
    score_bias: float
    summary: str
    observations: list[str]
    care_tips: list[str]
    warnings: list[str]
    search_keywords: list[str]
    source_rows: int | None = None


LOW_CONFIDENCE_THRESHOLD = 0.58
LOW_MARGIN_THRESHOLD = 0.015


GENERAL_PROFILE = AnalysisProfile(
    label="general_animal_or_product",
    prompts=[],
    score_bias=0.0,
    summary=(
        "Mình chưa đủ chắc chắn để nhận định chi tiết từ ảnh này. "
        "Ảnh có thể liên quan đến vật nuôi, tình trạng chăm sóc hoặc sản phẩm hỗ trợ, "
        "nên bạn hãy dùng kết quả này như thông tin tham khảo ban đầu."
    ),
    observations=[
        "Ảnh chưa khớp rõ với một nhóm tình huống cụ thể trong bộ phân tích nhanh.",
    ],
    care_tips=[
        "Chụp lại ảnh rõ hơn, đủ sáng và tập trung vào vùng cần kiểm tra hoặc sản phẩm cần tìm.",
        "Nếu vật nuôi có dấu hiệu bất thường, hãy theo dõi ăn uống, vận động, thân nhiệt, da/lông và chất thải.",
        "Giữ khu vực chăm sóc sạch, khô; tránh tự dùng thuốc khi chưa rõ nguyên nhân.",
    ],
    warnings=[
        "Nếu vật nuôi đau nhiều, bỏ ăn, sốt, khó thở, chảy máu, tiêu chảy kéo dài hoặc nghi bệnh truyền nhiễm, nên liên hệ thú y sớm.",
    ],
    search_keywords=["chăm sóc vật nuôi", "vệ sinh", "dinh dưỡng", "sản phẩm hỗ trợ"],
)


BUILT_IN_PROFILES = [
    AnalysisProfile(
        label="swine_african_swine_fever_like",
        prompts=[
            "a sick pig with red purple blotches and hemorrhagic skin lesions",
            "a pig lying on its side with widespread red skin discoloration",
            "african swine fever symptoms in pig, red skin patches and hemorrhages",
            "swine disease with purple red skin lesions on ears belly and body",
            "a dead or severely sick pig with red rash and bruising on the skin",
        ],
        score_bias=0.065,
        summary=(
            "Ảnh có vẻ là heo/lợn có mảng đỏ hoặc xuất huyết trên da. "
            "Dấu hiệu này có thể liên quan đến bệnh truyền nhiễm nghiêm trọng ở heo, "
            "trong đó có nhóm bệnh như dịch tả heo châu Phi, nên cần báo thú y/cơ quan chuyên môn để kiểm tra sớm."
        ),
        observations=[
            "Có thể thấy vùng da đỏ lan rộng hoặc mảng xuất huyết trên thân, tai hoặc chân của heo.",
            "Các dấu hiệu dạng này ở heo cần xử lý theo hướng bệnh truyền nhiễm cho đến khi được kiểm tra chuyên môn.",
        ],
        care_tips=[
            "Cách ly ngay heo có dấu hiệu bất thường và hạn chế người, dụng cụ, phương tiện ra vào khu nuôi.",
            "Không bán chạy, vận chuyển, giết mổ hoặc dùng thịt từ con nghi bệnh.",
            "Vệ sinh, sát trùng chuồng trại, dụng cụ, nền chuồng và khu vực xung quanh; kiểm soát nguồn thức ăn, nước uống và chất thải.",
            "Theo dõi sốt cao, bỏ ăn, lừ đừ, tím đỏ da, xuất huyết, tiêu chảy, nôn hoặc chết nhanh trong đàn.",
            "Liên hệ thú y địa phương/cơ quan chăn nuôi để được lấy mẫu, xác minh và hướng dẫn xử lý đàn đúng quy định.",
        ],
        warnings=[
            "Không tự kết luận bệnh chỉ từ ảnh, nhưng nếu nghi dịch tả heo châu Phi hoặc bệnh truyền nhiễm nguy hiểm thì cần báo thú y ngay.",
            "Không tự điều trị hoặc di chuyển heo nghi bệnh vì có thể làm lây lan mầm bệnh.",
        ],
        search_keywords=["sát trùng chuồng trại", "iodine", "thuốc sát trùng", "vitamin heo", "điện giải heo"],
    ),
    AnalysisProfile(
        label="cattle_skin_nodules",
        prompts=[
            "a cow or cattle with many raised skin nodules on the body",
            "cattle lumpy skin disease, nodules and bumps on cow skin",
            "a sick cow with widespread lumps, lesions or bumps on the skin",
            "cow veterinary skin disease with nodular lesions",
        ],
        score_bias=0.025,
        summary=(
            "Ảnh có vẻ là bò hoặc gia súc có nhiều nốt sần/cục nổi trên da. "
            "Dấu hiệu này có thể liên quan đến bệnh da truyền nhiễm hoặc viêm da nặng, "
            "cần được thú y kiểm tra sớm."
        ),
        observations=[
            "Có thể thấy nhiều nốt/cục nổi rải rác trên vùng da thân, cổ hoặc lưng của gia súc.",
            "Các dấu hiệu dạng này cần được xử lý thận trọng vì có thể lây lan trong đàn.",
        ],
        care_tips=[
            "Cách ly con có dấu hiệu bất thường khỏi đàn để hạn chế nguy cơ lây nhiễm.",
            "Giữ chuồng trại sạch, khô; phun khử trùng và kiểm soát côn trùng chích hút như ruồi, muỗi, ve, mòng.",
            "Theo dõi sốt, bỏ ăn, giảm sữa, sưng chân, chảy nước mũi/mắt hoặc nốt bị loét.",
            "Liên hệ cán bộ thú y địa phương để được khám, hướng dẫn điều trị triệu chứng và tiêm phòng cho đàn nếu cần.",
        ],
        warnings=[
            "Không tự kết luận bệnh chỉ từ ảnh, nhưng nếu nghi bệnh truyền nhiễm trên gia súc thì nên báo thú y ngay.",
            "Không dùng chung dụng cụ chăm sóc giữa con bệnh và con khỏe khi chưa khử trùng.",
        ],
        search_keywords=["sát trùng chuồng trại", "thuốc diệt côn trùng", "iodine", "vitamin gia súc"],
    ),
    AnalysisProfile(
        label="livestock_general_health",
        prompts=[
            "a cow, buffalo, goat, pig or livestock animal that may be sick or injured",
            "farm animal health problem, livestock veterinary care",
            "livestock in a barn or farm needing veterinary attention",
            "cattle, buffalo, goat or pig with visible illness symptoms",
        ],
        score_bias=0.01,
        summary=(
            "Ảnh có vẻ liên quan đến gia súc hoặc vật nuôi trang trại. "
            "Nếu con vật có biểu hiện bất thường, nên ưu tiên theo dõi triệu chứng toàn thân "
            "và liên hệ thú y để được kiểm tra đúng tình trạng."
        ),
        observations=[
            "Nội dung ảnh có thể liên quan đến sức khỏe, môi trường nuôi hoặc chăm sóc gia súc.",
            "Với gia súc, các dấu hiệu như sốt, bỏ ăn, sưng, loét, yếu chân hoặc nổi nốt cần được xử lý sớm.",
        ],
        care_tips=[
            "Tách riêng con có dấu hiệu bất thường để tiện theo dõi và giảm nguy cơ lây lan nếu là bệnh truyền nhiễm.",
            "Giữ chuồng trại sạch, khô, thoáng; vệ sinh máng ăn, máng uống và khu vực nằm.",
            "Ghi lại thời điểm phát hiện, biểu hiện chính và mức độ ăn uống/vận động để báo cho thú y.",
            "Bổ sung nước sạch, khẩu phần dễ tiêu và tránh tự tiêm/cho uống thuốc khi chưa có hướng dẫn chuyên môn.",
        ],
        warnings=[
            "Cần gọi thú y sớm nếu gia súc sốt cao, bỏ ăn, nằm nhiều, khó thở, tiêu chảy, sưng phù, loét da hoặc nghi bệnh lây lan trong đàn.",
        ],
        search_keywords=["sát trùng chuồng trại", "vitamin gia súc", "dinh dưỡng gia súc", "thuốc diệt côn trùng"],
    ),
    AnalysisProfile(
        label="animal_general_health",
        prompts=[
            "a pet or domestic animal that looks sick, injured or needs care",
            "dog, cat or animal health concern, veterinary care",
            "animal wound, weakness, pain, swelling, eye or ear problem",
            "domestic animal with abnormal posture or visible health issue",
        ],
        score_bias=-0.005,
        summary=(
            "Ảnh có vẻ liên quan đến tình trạng sức khỏe hoặc chăm sóc của vật nuôi. "
            "Từ ảnh chỉ có thể đưa ra nhận định tham khảo, nên cần kết hợp thêm biểu hiện thực tế của con vật."
        ),
        observations=[
            "Có thể cần kiểm tra thêm hành vi, mức ăn uống, vận động, da/lông, mắt, tai và chất thải của vật nuôi.",
        ],
        care_tips=[
            "Giữ vật nuôi ở nơi sạch, yên tĩnh, đủ nước và hạn chế để liếm/gãi vùng bất thường.",
            "Theo dõi các dấu hiệu như bỏ ăn, lừ đừ, nôn, tiêu chảy, ho, khó thở, đau hoặc thay đổi dáng đi.",
            "Chụp thêm ảnh gần vùng bất thường và ghi lại thời gian xuất hiện triệu chứng để hỗ trợ bác sĩ thú y.",
        ],
        warnings=[
            "Nếu dấu hiệu nặng lên, kéo dài hoặc vật nuôi đau rõ rệt, nên đi thú y thay vì tự xử lý tại nhà.",
        ],
        search_keywords=["chăm sóc thú cưng", "vệ sinh", "dinh dưỡng", "sản phẩm hỗ trợ"],
    ),
    AnalysisProfile(
        label="dog_or_cat_eating",
        prompts=[
            "a dog or cat next to pet food, kibble or a food bowl",
            "a pet eating dry food from a bowl",
            "a dog or cat refusing food near a bowl",
            "pet nutrition, pet food, kibble, pate and feeding",
        ],
        score_bias=0.0,
        summary="Ảnh có vẻ liên quan đến thú cưng và thức ăn, có thể là bữa ăn hoặc tình trạng thú cưng chưa hứng thú với đồ ăn.",
        observations=[
            "Có thể thấy thú cưng ở gần bát hoặc khu vực có thức ăn.",
            "Nội dung phù hợp để tham khảo về ăn uống, khẩu phần và lựa chọn thức ăn.",
        ],
        care_tips=[
            "Kiểm tra khẩu phần theo cân nặng, độ tuổi và mức vận động của thú cưng.",
            "Nếu đổi thức ăn, nên trộn thức ăn mới với thức ăn cũ từ từ trong vài ngày.",
            "Theo dõi dấu hiệu bỏ ăn, nôn, tiêu chảy hoặc mệt mỏi sau bữa ăn.",
        ],
        warnings=[
            "Nếu thú cưng bỏ ăn hơn 24 giờ, nôn/tiêu chảy liên tục hoặc lừ đừ, nên đưa đi thú y.",
        ],
        search_keywords=["thức ăn hạt", "pate", "dinh dưỡng", "men tiêu hóa", "bát ăn"],
    ),
    AnalysisProfile(
        label="cat_toilet_or_defecating",
        prompts=[
            "rear view of an orange cat squatting outdoors with its tail raised",
            "a cat pooping on the ground outside",
            "a cat defecating outdoors, rear view",
            "a cat using the toilet posture with raised tail",
            "cat litter, cat toilet, pet waste, diarrhea or constipation concern",
        ],
        score_bias=0.025,
        summary="Ảnh có vẻ liên quan đến mèo đang đi vệ sinh hoặc vấn đề chất thải/tiêu hóa.",
        observations=[
            "Có thể thấy tư thế hoặc bối cảnh giống hành vi đi vệ sinh của mèo.",
            "Thông tin phù hợp để tham khảo về khay vệ sinh, cát vệ sinh và theo dõi tiêu hóa.",
        ],
        care_tips=[
            "Dọn chất thải và vệ sinh khu vực đi vệ sinh để giảm mùi và vi khuẩn.",
            "Theo dõi phân của mèo: quá lỏng, có máu, táo bón hoặc đi nhiều lần bất thường cần chú ý.",
            "Chuẩn bị khay vệ sinh sạch và loại cát phù hợp để mèo đi đúng chỗ.",
        ],
        warnings=[
            "Nếu mèo tiêu chảy kéo dài, rặn không ra phân, có máu trong phân hoặc bỏ ăn, nên đưa đi thú y.",
        ],
        search_keywords=["cát vệ sinh", "khay vệ sinh", "xịt khử mùi", "men tiêu hóa", "thức ăn tiêu hóa"],
    ),
    AnalysisProfile(
        label="skin_or_fur_care",
        prompts=[
            "close up of irritated pet skin, redness, rash or wound",
            "dog or cat fur loss, bald patch, itching or fleas",
            "animal skin problem, wound, scab, rash, swelling or hair loss",
            "livestock or pet with skin irritation, sores or parasites",
            "pet grooming bath shampoo and coat cleaning product",
        ],
        score_bias=-0.015,
        summary="Ảnh có vẻ liên quan đến da, lông, ký sinh trùng, vết thương hoặc vệ sinh cơ thể của vật nuôi.",
        observations=[
            "Có thể cần quan sát kỹ vùng da/lông để kiểm tra ngứa, đỏ, rụng lông, nốt sưng, vết loét, mủ hoặc ký sinh trùng.",
        ],
        care_tips=[
            "Giữ vùng da/lông sạch và khô, tránh để vật nuôi liếm/gãi quá nhiều.",
            "Không bôi thuốc mạnh hoặc tắm bằng hóa chất khi có vết thương hở, chảy máu, mủ hoặc vùng da đau.",
            "Nếu chỉ là bẩn/mùi nhẹ, có thể dùng sản phẩm vệ sinh phù hợp với loài vật và theo dõi phản ứng sau đó.",
        ],
        warnings=[
            "Nếu có mủ, chảy máu, mùi hôi nặng, lan rộng, sốt, nổi nhiều nốt hoặc vật nuôi đau nhiều, nên đi thú y.",
        ],
        search_keywords=["sữa tắm", "vệ sinh da lông", "sát trùng", "xịt khử mùi", "sản phẩm chăm sóc lông"],
    ),
    AnalysisProfile(
        label="pet_accessory_or_toy",
        prompts=[
            "pet accessory, leash, collar, pet toy or carrier",
            "pet supplies product such as bowl, bed, toy or harness",
        ],
        score_bias=0.0,
        summary="Ảnh có vẻ liên quan đến sản phẩm/phụ kiện dành cho thú cưng.",
        observations=[
            "Nội dung phù hợp để tham khảo và tìm sản phẩm tương tự hoặc sản phẩm hỗ trợ trong cửa hàng.",
        ],
        care_tips=[
            "Chọn phụ kiện đúng kích thước, chất liệu an toàn và phù hợp với thói quen của thú cưng.",
        ],
        warnings=[
            "Không dùng sản phẩm bị hỏng, sắc cạnh hoặc quá nhỏ khiến thú cưng có thể nuốt phải.",
        ],
        search_keywords=["phụ kiện", "đồ chơi", "vòng cổ", "dây dắt", "bát ăn"],
    ),
]


def analyze_image(content: bytes) -> ImageAnalysisResponse:
    profiles = get_analysis_profiles()
    prompt_to_profile: list[int] = []
    prompts: list[str] = []
    for profile_index, profile in enumerate(profiles):
        for prompt in profile.prompts:
            prompts.append(prompt)
            prompt_to_profile.append(profile_index)

    if not prompts:
        return _build_response(GENERAL_PROFILE, 0.0, 0.0)

    prompt_scores = embedding_model.score_image_labels(content, prompts)
    profile_scores = [-1.0 for _ in profiles]
    for prompt_score, profile_index in zip(prompt_scores, prompt_to_profile):
        profile = profiles[profile_index]
        profile_scores[profile_index] = max(
            profile_scores[profile_index],
            prompt_score + profile.score_bias,
        )

    ranked_indexes = sorted(range(len(profile_scores)), key=lambda index: profile_scores[index], reverse=True)
    best_index = ranked_indexes[0]
    second_score = profile_scores[ranked_indexes[1]] if len(ranked_indexes) > 1 else -1.0
    best_score = profile_scores[best_index]
    confidence = _normalize_confidence(best_score)
    margin = best_score - second_score

    selected_profile = profiles[best_index]
    selected_profile = _refine_species_profile(content, selected_profile)

    if confidence < LOW_CONFIDENCE_THRESHOLD or margin < LOW_MARGIN_THRESHOLD:
        return _build_response(GENERAL_PROFILE, confidence, margin)

    return _build_response(selected_profile, confidence, margin)


def _refine_species_profile(content: bytes, profile: AnalysisProfile) -> AnalysisProfile:
    if profile.label != "pig_skin":
        return profile

    labels = [
        "a dog with severe mange, crusty skin, hair loss and irritated red skin",
        "a pig with red skin rash, bruising or skin lesions",
    ]
    scores = embedding_model.score_image_labels(content, labels)
    if scores[0] > scores[1] + 0.015:
        dog_skin = _find_profile("dog_skin")
        if dog_skin is not None:
            return dog_skin
    return profile


def _find_profile(label: str) -> AnalysisProfile | None:
    for profile in get_analysis_profiles():
        if profile.label == label:
            return profile
    return None


@lru_cache
def get_analysis_profiles() -> list[AnalysisProfile]:
    settings = get_settings()
    data_profiles = _load_data_profiles()
    if not data_profiles:
        return BUILT_IN_PROFILES

    if not settings.include_builtin_analysis_profiles:
        return data_profiles

    merged: dict[str, AnalysisProfile] = {profile.label: profile for profile in BUILT_IN_PROFILES}
    for profile in data_profiles:
        merged[profile.label] = profile
    return list(merged.values())


def _load_data_profiles() -> list[AnalysisProfile]:
    settings = get_settings()
    candidates = [
        settings.data_dir / "analysis_profiles.json",
        Path(__file__).resolve().parents[1] / "data" / "analysis_profiles.json",
        Path(__file__).resolve().parents[1] / "seed_data" / "analysis_profiles.json",
    ]

    for path in candidates:
        if not path.exists():
            continue
        try:
            raw_profiles = json.loads(path.read_text(encoding="utf-8"))
            profiles = [_profile_from_dict(item) for item in raw_profiles]
            profiles = [profile for profile in profiles if profile.prompts]
            logger.info("Loaded %s image analysis profiles from %s", len(profiles), path)
            return profiles
        except Exception as exc:
            logger.warning("Cannot load analysis profiles from %s: %s", path, exc)
    return []


def _profile_from_dict(item: dict) -> AnalysisProfile:
    return AnalysisProfile(
        label=str(item["label"]),
        prompts=[str(value) for value in item.get("prompts", []) if str(value).strip()],
        score_bias=float(item.get("scoreBias", item.get("score_bias", 0.0))),
        summary=str(item.get("summary") or GENERAL_PROFILE.summary),
        observations=[str(value) for value in item.get("observations", [])],
        care_tips=[str(value) for value in item.get("careTips", item.get("care_tips", []))],
        warnings=[str(value) for value in item.get("warnings", [])],
        search_keywords=[str(value) for value in item.get("searchKeywords", item.get("search_keywords", []))],
        source_rows=item.get("sourceRows"),
    )


def _build_response(profile: AnalysisProfile, confidence: float, margin: float) -> ImageAnalysisResponse:
    observations = list(profile.observations)
    if margin < LOW_MARGIN_THRESHOLD:
        observations.append("Kết quả phân loại chưa thật rõ, nên cần đối chiếu thêm biểu hiện thực tế thay vì kết luận chỉ từ ảnh.")

    return ImageAnalysisResponse(
        summary=profile.summary,
        observations=observations,
        careTips=profile.care_tips,
        warnings=profile.warnings,
        searchKeywords=profile.search_keywords,
        confidence=confidence,
        matchedLabel=profile.label,
    )


def _normalize_confidence(score: float) -> float:
    return round(max(0.0, min(1.0, (score + 1.0) / 2.0)), 4)
