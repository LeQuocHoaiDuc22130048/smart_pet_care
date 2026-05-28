import argparse
import csv
import io
import json
import re
import sys
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from xml.etree import ElementTree


SUPPORTED_SPECIES = {
    "cat": {
        "vi": "mèo",
        "prompts": ["cat", "domestic cat", "sick cat"],
        "keywords": ["chăm sóc mèo"],
    },
    "dog": {
        "vi": "chó",
        "prompts": ["dog", "domestic dog", "sick dog"],
        "keywords": ["chăm sóc chó"],
    },
    "rabbit": {
        "vi": "thỏ",
        "prompts": ["rabbit", "pet rabbit", "sick rabbit"],
        "keywords": ["chăm sóc thỏ"],
    },
    "pig": {
        "vi": "heo/lợn",
        "prompts": ["pig", "swine", "sick pig"],
        "keywords": ["chăm sóc heo", "sát trùng chuồng trại"],
    },
    "bird": {
        "vi": "chim",
        "prompts": ["bird", "pet bird", "sick bird"],
        "keywords": ["chăm sóc chim"],
    },
}


CONDITION_TEMPLATES = {
    "digestive": {
        "vi": "vấn đề tiêu hóa",
        "en": "digestive illness",
        "prompts": [
            "{animal} with vomiting, diarrhea or digestive illness",
            "{animal} looking weak with digestive problems",
            "{animal} near feces, vomit, food bowl or signs of stomach upset",
        ],
        "observations": [
            "Ảnh có thể liên quan đến tình trạng tiêu hóa hoặc ăn uống bất thường.",
        ],
        "keywords": ["men tiêu hóa", "thức ăn dễ tiêu", "điện giải"],
    },
    "mobility": {
        "vi": "vấn đề vận động",
        "en": "mobility problem",
        "prompts": [
            "{animal} limping, unable to stand or with mobility problem",
            "{animal} lying down weak, paralyzed or injured",
            "{animal} with leg injury, swelling or abnormal posture",
        ],
        "observations": [
            "Có thể cần quan sát thêm dáng đi, tư thế đứng/nằm và mức độ đau của con vật.",
        ],
        "keywords": ["hỗ trợ vận động", "đệm nằm", "chăm sóc chấn thương"],
    },
    "parasites": {
        "vi": "ký sinh trùng",
        "en": "parasite problem",
        "prompts": [
            "{animal} with fleas, ticks, mites or visible parasites",
            "{animal} scratching skin because of parasites",
            "{animal} with irritated skin, scabs or hair loss from parasites",
        ],
        "observations": [
            "Ảnh có thể liên quan đến ve, bọ chét, ghẻ, giun hoặc ký sinh trùng khác.",
        ],
        "keywords": ["thuốc ký sinh trùng", "xịt ve", "sát trùng", "vệ sinh môi trường"],
    },
    "ear": {
        "vi": "nhiễm trùng tai",
        "en": "ear infection",
        "prompts": [
            "{animal} with ear infection, dirty ear or head shaking",
            "{animal} scratching painful red ears",
            "close up of {animal} ear with discharge, redness or irritation",
        ],
        "observations": [
            "Có thể cần kiểm tra tai, mùi hôi, dịch tiết, đỏ, sưng hoặc hành vi lắc đầu/gãi tai.",
        ],
        "keywords": ["vệ sinh tai", "dung dịch rửa tai", "sát trùng"],
    },
    "skin": {
        "vi": "kích ứng da",
        "en": "skin irritation",
        "prompts": [
            "{animal} with red skin, rash, wound, swelling or lesions",
            "{animal} with hair loss, scabs, irritated skin or skin infection",
            "close up of {animal} skin irritation, sores, redness or rash",
        ],
        "observations": [
            "Có thể cần quan sát kỹ vùng da/lông để kiểm tra đỏ, ngứa, rụng lông, vết loét, mủ hoặc sưng.",
        ],
        "keywords": ["sát trùng", "vệ sinh da lông", "xịt khử khuẩn", "sản phẩm chăm sóc da"],
    },
    "general": {
        "vi": "vấn đề sức khỏe",
        "en": "health problem",
        "prompts": [
            "{animal} that looks sick, weak, injured or needing veterinary care",
            "{animal} with visible illness symptoms",
            "{animal} health problem, veterinary care",
        ],
        "observations": [
            "Ảnh có thể liên quan đến tình trạng sức khỏe cần theo dõi thêm.",
        ],
        "keywords": ["chăm sóc vật nuôi", "dinh dưỡng", "sản phẩm hỗ trợ"],
    },
}


FIRST_AID_TRANSLATIONS = {
    "Keep bird warm and in a quiet cage; avoid stress; contact avian vet immediately.": (
        "Giữ chim ấm trong lồng yên tĩnh, tránh gây căng thẳng và liên hệ bác sĩ thú y chuyên chim ngay."
    ),
    "Keep pig in cool, clean area; encourage drinking; contact vet if no improvement.": (
        "Giữ heo/lợn ở nơi mát, sạch; khuyến khích uống nước và liên hệ thú y nếu không cải thiện."
    ),
    "Keep rabbit warm and quiet; avoid handling too much; consult exotic vet promptly.": (
        "Giữ thỏ ấm và yên tĩnh, hạn chế bế/nắm quá nhiều và sớm hỏi bác sĩ thú y chuyên thú nhỏ."
    ),
    "Keep the cat calm, warm, and contact a veterinarian.": (
        "Giữ mèo bình tĩnh, ấm áp và liên hệ bác sĩ thú y."
    ),
    "Keep the dog calm and safe; observe and contact a veterinarian.": (
        "Giữ chó bình tĩnh, ở nơi an toàn; tiếp tục quan sát và liên hệ bác sĩ thú y."
    ),
    "Prevent licking; clean with mild antiseptic; consult vet if worsens.": (
        "Hạn chế để vật nuôi liếm vùng bất thường; vệ sinh bằng dung dịch sát trùng nhẹ và hỏi thú y nếu nặng hơn."
    ),
    "Stop feeding for 12 hours; provide small water amounts; see vet if persists.": (
        "Tạm ngưng cho ăn khoảng 12 giờ, cho uống từng lượng nước nhỏ và đi thú y nếu tình trạng kéo dài."
    ),
    "Withhold food for 12 hours, offer small water sips; see vet if vomiting persists.": (
        "Tạm ngưng cho ăn khoảng 12 giờ, cho uống từng ngụm nước nhỏ và đi thú y nếu nôn ói tiếp diễn."
    ),
}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert benh.csv/xlsx disease data into image analysis profiles JSON."
    )
    parser.add_argument("input", type=Path, help="Path to benh.csv. XLSX content is supported even if extension is .csv.")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("back_end/image_ai_service/data/analysis_profiles.json"),
        help="Output JSON path.",
    )
    parser.add_argument("--min-rows", type=int, default=3, help="Minimum rows required per species/condition profile.")
    args = parser.parse_args()

    rows = read_table(args.input)
    profiles = build_profiles(rows, args.min_rows)
    if not profiles:
        print("No profiles were generated. Check input columns and --min-rows.", file=sys.stderr)
        return 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(profiles, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(profiles)} profiles to {args.output}")
    return 0


def read_table(path: Path) -> list[dict[str, object]]:
    content = path.read_bytes()
    if content.startswith(b"PK\x03\x04"):
        return read_xlsx_bytes(content)

    text = content.decode("utf-8-sig")
    reader = csv.DictReader(text.splitlines())
    return [row for row in reader]


def read_xlsx_bytes(content: bytes) -> list[dict[str, object]]:
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        shared_strings = read_shared_strings(archive)
        workbook = ElementTree.fromstring(archive.read("xl/workbook.xml"))
        namespace = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        sheet = workbook.find("m:sheets/m:sheet", namespace)
        if sheet is None:
            return []
        sheet_id = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        rels = ElementTree.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_namespace = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
        target = None
        for rel in rels.findall("r:Relationship", rel_namespace):
            if rel.attrib.get("Id") == sheet_id:
                target = rel.attrib["Target"]
                break
        if target is None:
            return []
        sheet_path = "xl/" + target.lstrip("/")
        return read_sheet(archive.read(sheet_path), shared_strings)


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    try:
        root = ElementTree.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    namespace = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    values = []
    for item in root.findall("m:si", namespace):
        values.append("".join(text.text or "" for text in item.findall(".//m:t", namespace)))
    return values


def read_sheet(content: bytes, shared_strings: list[str]) -> list[dict[str, object]]:
    root = ElementTree.fromstring(content)
    namespace = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    records: list[list[object]] = []
    for row in root.findall(".//m:sheetData/m:row", namespace):
        values: list[object] = []
        current_col = 0
        for cell in row.findall("m:c", namespace):
            column = column_index(cell.attrib.get("r", "A1"))
            while current_col < column:
                values.append(None)
                current_col += 1
            values.append(cell_value(cell, shared_strings, namespace))
            current_col += 1
        records.append(values)

    if not records:
        return []
    headers = [str(value or "").strip() for value in records[0]]
    return [dict(zip(headers, record)) for record in records[1:] if any(value not in (None, "") for value in record)]


def column_index(cell_ref: str) -> int:
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    index = 0
    for letter in letters:
        index = index * 26 + (ord(letter) - ord("A") + 1)
    return max(0, index - 1)


def cell_value(cell: ElementTree.Element, shared_strings: list[str], namespace: dict[str, str]) -> object:
    value = cell.find("m:v", namespace)
    if value is None:
        inline = cell.find("m:is", namespace)
        if inline is None:
            return None
        return "".join(text.text or "" for text in inline.findall(".//m:t", namespace)).strip()

    raw = value.text or ""
    cell_type = cell.attrib.get("t")
    if cell_type == "s":
        return shared_strings[int(raw)]
    if cell_type == "b":
        return raw == "1"
    try:
        number = float(raw)
        return int(number) if number.is_integer() else number
    except ValueError:
        return raw


def build_profiles(rows: list[dict[str, object]], min_rows: int) -> list[dict[str, object]]:
    grouped: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for row in rows:
        species = normalize_species(row.get("Likely Species"))
        condition = normalize_condition(row.get("condition"))
        if species not in SUPPORTED_SPECIES:
            continue
        grouped[(species, condition)].append(row)

    profiles = []
    for (species, condition), items in sorted(grouped.items()):
        if len(items) < min_rows:
            continue
        profiles.append(build_profile(species, condition, items))
    profiles.extend(build_visual_feature_profiles())
    return profiles


def build_visual_feature_profiles() -> list[dict[str, object]]:
    return [
        {
            "label": "dog_demodex_mange",
            "prompts": [
                "dog with demodectic mange, patchy hair loss and red crusty skin",
                "white dog with severe mange, scabs, hair loss and irritated skin",
                "sick dog with demodex mites, bald patches, crusts and inflamed skin",
                "dog with widespread crusty skin lesions on face, legs and body",
                "dog skin disease with mange, not pig, not cat, not rabbit",
            ],
            "scoreBias": 0.09,
            "summary": "Ảnh có thể liên quan đến chó bị ghẻ/demodex, viêm da hoặc tổn thương da nặng. Kết quả chỉ là nhận định tham khảo từ ảnh và cần được thú y kiểm tra để xác định nguyên nhân.",
            "observations": [
                "Có thể thấy rụng lông, da đỏ, vảy/đóng mài hoặc tổn thương lan rộng trên mặt, chân hoặc thân chó.",
                "Các dấu hiệu này có thể gặp trong ghẻ, viêm da, nhiễm khuẩn/nấm hoặc dị ứng nặng.",
            ],
            "careTips": [
                "Cách ly tương đối chó bệnh với vật nuôi khác, giữ khu vực nằm sạch và khô.",
                "Hạn chế để chó liếm/gãi vùng tổn thương; có thể dùng vòng chống liếm nếu cần.",
                "Không tự bôi thuốc mạnh hoặc dùng thuốc trị ghẻ khi chưa có hướng dẫn thú y.",
                "Liên hệ thú y để soi da, kiểm tra ký sinh trùng/nấm/vi khuẩn và chọn phác đồ phù hợp.",
            ],
            "warnings": [
                "Nếu da có mủ, mùi hôi, chảy máu, lan nhanh, chó đau nhiều, bỏ ăn hoặc lừ đừ, nên đi thú y sớm.",
                "Một số bệnh da có thể lây cho vật nuôi khác hoặc gây kích ứng tạm thời cho người, nên vệ sinh tay và dụng cụ chăm sóc.",
            ],
            "searchKeywords": ["chăm sóc chó", "sát trùng", "vệ sinh da lông", "xịt khử khuẩn", "sản phẩm chăm sóc da"],
            "sourceRows": 0,
        },
        {
            "label": "pig_african_swine_fever_like",
            "prompts": [
                "pig with purple red skin blotches and hemorrhagic lesions",
                "sick pig lying down with widespread red skin discoloration",
                "african swine fever like symptoms in pig with skin hemorrhage",
                "swine with red purple patches on ears belly legs and body",
                "dead or severely sick pig with red rash and bruising on skin",
            ],
            "scoreBias": 0.08,
            "summary": "Ảnh có thể liên quan đến heo/lợn có mảng đỏ tím hoặc xuất huyết trên da. Đây có thể là dấu hiệu bệnh truyền nhiễm nghiêm trọng ở heo, cần báo thú y/cơ quan chuyên môn để kiểm tra.",
            "observations": [
                "Có thể thấy mảng đỏ, tím đỏ hoặc xuất huyết trên thân, tai, bụng hoặc chân heo.",
                "Nếu trong đàn có sốt cao, bỏ ăn, chết nhanh hoặc nhiều con cùng bệnh thì cần xử lý theo hướng bệnh truyền nhiễm nguy hiểm.",
            ],
            "careTips": [
                "Cách ly ngay heo nghi bệnh và hạn chế người, dụng cụ, phương tiện ra vào khu nuôi.",
                "Không bán chạy, vận chuyển, giết mổ hoặc sử dụng thịt từ heo nghi bệnh.",
                "Sát trùng chuồng trại, dụng cụ, nền chuồng và khu vực xung quanh.",
                "Liên hệ thú y địa phương/cơ quan chăn nuôi để được lấy mẫu và hướng dẫn xử lý đúng quy định.",
            ],
            "warnings": [
                "Không tự kết luận bệnh chỉ từ ảnh, nhưng nếu nghi dịch tả heo châu Phi hoặc bệnh truyền nhiễm nguy hiểm thì cần báo thú y ngay.",
                "Không tự điều trị hoặc di chuyển heo nghi bệnh vì có thể làm lây lan mầm bệnh.",
            ],
            "searchKeywords": ["sát trùng chuồng trại", "iodine", "thuốc sát trùng", "vitamin heo", "điện giải heo"],
            "sourceRows": 0,
        },
        {
            "label": "cat_ear_mites_or_infection",
            "prompts": [
                "cat ear with dark wax, ear mites, redness or discharge",
                "cat scratching ear with dirty black ear debris",
                "close up of infected cat ear with discharge and irritation",
                "cat head shaking because of ear mites or ear infection",
            ],
            "scoreBias": 0.05,
            "summary": "Ảnh có thể liên quan đến mèo bị viêm tai, ve tai hoặc tích tụ ráy tai bất thường. Cần kiểm tra thêm mùi, dịch tiết và mức độ đau/ngứa.",
            "observations": [
                "Có thể thấy tai bẩn, đỏ, dịch tiết, ráy đen hoặc dấu hiệu mèo gãi/lắc đầu.",
            ],
            "careTips": [
                "Giữ mèo bình tĩnh, tránh ngoáy sâu vào tai.",
                "Chỉ vệ sinh nhẹ vùng ngoài tai nếu có dung dịch phù hợp cho thú cưng.",
                "Liên hệ thú y để kiểm tra ve tai, viêm tai do nấm/vi khuẩn hoặc dị vật.",
            ],
            "warnings": [
                "Nếu tai sưng đau, có mủ/mùi hôi, mèo nghiêng đầu, mất thăng bằng hoặc đau rõ, nên đi thú y sớm.",
            ],
            "searchKeywords": ["chăm sóc mèo", "vệ sinh tai", "dung dịch rửa tai", "sát trùng"],
            "sourceRows": 0,
        },
        {
            "label": "dog_ear_infection",
            "prompts": [
                "dog ear infection with redness, swelling, discharge or dirty ear",
                "dog scratching painful ear or shaking head",
                "close up of dog ear with brown discharge and irritation",
            ],
            "scoreBias": 0.05,
            "summary": "Ảnh có thể liên quan đến chó bị viêm tai hoặc kích ứng tai. Cần đối chiếu thêm mùi hôi, dịch tiết, đỏ/sưng và hành vi gãi tai/lắc đầu.",
            "observations": [
                "Có thể cần kiểm tra vùng tai xem có đỏ, sưng, ráy nhiều, dịch tiết hoặc mùi hôi hay không.",
            ],
            "careTips": [
                "Giữ tai khô, tránh tự ngoáy sâu hoặc nhỏ thuốc khi chưa rõ nguyên nhân.",
                "Có thể vệ sinh nhẹ vành tai bằng sản phẩm phù hợp cho chó nếu không có đau nhiều/chảy máu.",
                "Liên hệ thú y nếu dấu hiệu kéo dài hoặc tái phát.",
            ],
            "warnings": [
                "Nếu chó đau nhiều, tai có mủ/mùi hôi nặng, nghiêng đầu hoặc mất thăng bằng, nên đi thú y sớm.",
            ],
            "searchKeywords": ["chăm sóc chó", "vệ sinh tai", "dung dịch rửa tai", "sát trùng"],
            "sourceRows": 0,
        },
        {
            "label": "rabbit_mange_or_skin_crusts",
            "prompts": [
                "rabbit with crusty skin, mange, hair loss and scabs",
                "rabbit ear crusts, mites and irritated skin",
                "sick rabbit with flaky skin, bald patches and severe itching",
                "rabbit skin disease, not dog, not pig, not cat",
            ],
            "scoreBias": 0.06,
            "summary": "Ảnh có thể liên quan đến thỏ bị ghẻ, ký sinh trùng hoặc kích ứng da có đóng vảy. Cần kiểm tra thêm tai, vùng rụng lông và mức độ ngứa.",
            "observations": [
                "Có thể thấy vùng da đóng vảy, rụng lông, bong tróc hoặc tổn thương quanh tai/mặt/thân.",
            ],
            "careTips": [
                "Giữ thỏ ấm, khô, yên tĩnh và hạn chế bế/nắm quá nhiều.",
                "Vệ sinh khu vực nuôi, thay lót chuồng sạch và tránh dùng thuốc chó/mèo cho thỏ nếu chưa có hướng dẫn.",
                "Liên hệ thú y chuyên thú nhỏ để kiểm tra ký sinh trùng hoặc nấm da.",
            ],
            "warnings": [
                "Thỏ yếu nhanh, bỏ ăn, tiêu chảy, tổn thương lan rộng hoặc ngứa dữ dội cần được khám sớm.",
            ],
            "searchKeywords": ["chăm sóc thỏ", "sát trùng", "vệ sinh môi trường", "sản phẩm chăm sóc da"],
            "sourceRows": 0,
        },
        {
            "label": "dog_flea_tick_infestation",
            "prompts": [
                "dog with fleas or ticks visible on skin and fur",
                "dog scratching because of flea infestation",
                "dog skin irritation from ticks, fleas or parasites",
                "dog with small brown insects in fur",
            ],
            "scoreBias": 0.05,
            "summary": "Ảnh có thể liên quan đến chó bị ve, bọ chét hoặc ký sinh trùng ngoài da. Cần kiểm tra lông, da, tai và nơi chó nằm.",
            "observations": [
                "Có thể thấy dấu hiệu ngứa, gãi nhiều, kích ứng da hoặc ký sinh trùng bám trên lông/da.",
            ],
            "careTips": [
                "Tách chó khỏi khu vực ngủ chung nếu có nhiều ve/bọ chét và vệ sinh nơi nằm.",
                "Dùng sản phẩm trị ve/bọ chét phù hợp cân nặng và độ tuổi theo hướng dẫn.",
                "Giặt/vệ sinh chăn nệm, ổ nằm và kiểm tra các vật nuôi khác trong nhà.",
            ],
            "warnings": [
                "Nếu chó thiếu máu, lừ đừ, sốt, vết cắn viêm mủ hoặc ký sinh trùng quá nhiều, nên liên hệ thú y.",
            ],
            "searchKeywords": ["chăm sóc chó", "thuốc ký sinh trùng", "xịt ve", "vệ sinh môi trường"],
            "sourceRows": 0,
        },
    ]


def build_profile(species: str, condition: str, rows: list[dict[str, object]]) -> dict[str, object]:
    species_info = SUPPORTED_SPECIES[species]
    condition_info = CONDITION_TEMPLATES.get(condition, CONDITION_TEMPLATES["general"])
    animal_prompt = species_info["prompts"][0]
    prompts = [template.format(animal=animal_prompt) for template in condition_info["prompts"]]
    prompts.extend(f"{animal} with {condition_info['en']}" for animal in species_info["prompts"][1:])
    prompts.extend(species_disambiguation_prompts(species, condition))

    first_aid_values = most_common_text(rows, "First Aid at Home", limit=4)
    if not first_aid_values:
        first_aid_values = most_common_text(rows, "First Aid at Home (for Cats)", limit=4)
    care_tips = first_aid_values or [
        f"Theo dõi biểu hiện của {species_info['vi']} và liên hệ bác sĩ thú y nếu dấu hiệu kéo dài hoặc nặng lên.",
    ]

    return {
        "label": f"{species}_{condition}",
        "prompts": unique(prompts),
        "scoreBias": default_score_bias(species, condition),
        "summary": f"Ảnh có thể liên quan đến {species_info['vi']} với {condition_info['vi']}. Kết quả chỉ là nhận định tham khảo từ ảnh và cần đối chiếu thêm triệu chứng thực tế.",
        "observations": condition_info["observations"],
        "careTips": care_tips,
        "warnings": [
            f"Nếu {species_info['vi']} đau nhiều, bỏ ăn, sốt, khó thở, chảy máu, tiêu chảy kéo dài hoặc yếu nhanh, nên liên hệ thú y sớm.",
            "Không tự dùng thuốc khi chưa rõ nguyên nhân hoặc chưa có hướng dẫn chuyên môn.",
        ],
        "searchKeywords": unique(species_info["keywords"] + condition_info["keywords"]),
        "sourceRows": len(rows),
    }


def normalize_species(value: object) -> str:
    text = normalize_text(value)
    if "cat" in text or "meo" in text:
        return "cat"
    if "dog" in text or "cho" in text:
        return "dog"
    if "rabbit" in text or "tho" in text:
        return "rabbit"
    if "pig" in text or "heo" in text or "lon" in text:
        return "pig"
    if "bird" in text or "chim" in text:
        return "bird"
    return ""


def normalize_condition(value: object) -> str:
    text = normalize_text(value)
    if any(term in text for term in ("digest", "tieu hoa", "vomit", "diarrhea")):
        return "digestive"
    if any(term in text for term in ("mobility", "di chuyen", "van dong", "paraly", "limp")):
        return "mobility"
    if any(term in text for term in ("parasite", "ky sinh", "ki sinh", "flea", "tick", "mite")):
        return "parasites"
    if any(term in text for term in ("ear", "tai")):
        return "ear"
    if any(term in text for term in ("skin", "da", "rash", "irritat", "dermat")):
        return "skin"
    return "general"


def most_common_text(rows: list[dict[str, object]], field: str, limit: int) -> list[str]:
    values = []
    for row in rows:
        value = row.get(field)
        if value in (None, "", 0, "0"):
            continue
        text = str(value).strip()
        if text:
            values.append(translate_first_aid(text))
    return [value for value, _ in Counter(values).most_common(limit)]


def translate_first_aid(value: str) -> str:
    return FIRST_AID_TRANSLATIONS.get(value, value)


def default_score_bias(species: str, condition: str) -> float:
    if species == "dog" and condition == "skin":
        return 0.04
    if species == "pig" and condition == "skin":
        return -0.015
    if condition in {"skin", "parasites"}:
        return 0.01
    return 0.0


def species_disambiguation_prompts(species: str, condition: str) -> list[str]:
    if condition != "skin":
        return []
    if species == "dog":
        return [
            "dog with severe mange, demodex mites, crusty skin and hair loss",
            "white dog with widespread red crusty skin lesions and mange",
            "sick dog with scabies, demodectic mange, bald patches and irritated skin",
            "dog skin disease, not pig, not cat, not rabbit",
        ]
    if species == "cat":
        return [
            "cat with crusty skin lesions, hair loss and irritated skin",
            "sick cat with mange, scabs, rash or skin infection",
            "cat skin disease, not dog, not pig, not rabbit",
        ]
    if species == "pig":
        return [
            "pig with red skin rash, bruising or skin disease",
            "swine with skin lesions, not dog, not cat, not rabbit",
        ]
    if species == "rabbit":
        return [
            "rabbit with crusty skin, mange, hair loss or scabs",
            "rabbit skin disease, not dog, not pig, not cat",
        ]
    return []


def normalize_text(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip().lower()
    replacements = {
        "áàảãạăắằẳẵặâấầẩẫậ": "a",
        "éèẻẽẹêếềểễệ": "e",
        "íìỉĩị": "i",
        "óòỏõọôốồổỗộơớờởỡợ": "o",
        "úùủũụưứừửữự": "u",
        "ýỳỷỹỵ": "y",
        "đ": "d",
    }
    for chars, replacement in replacements.items():
        for char in chars:
            text = text.replace(char, replacement)
    return text


def unique(values: list[str]) -> list[str]:
    seen = set()
    result = []
    for value in values:
        key = value.strip().lower()
        if key and key not in seen:
            seen.add(key)
            result.append(value)
    return result


if __name__ == "__main__":
    raise SystemExit(main())
