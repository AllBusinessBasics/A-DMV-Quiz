from __future__ import annotations

import io
from pathlib import Path

import fitz
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "Driver-Handbook.pdf"
OUT_DIR = ROOT / "assets" / "handbook"


PAGE_CROPS = [
    {
        "page": 46,
        "name": "school-bus-stop-diagram",
        "bbox": (414.0, 97.9, 567.5, 313.6),
    },
    {
        "page": 55,
        "name": "roundabout-sign",
        "bbox": (211.8, 178.5, 247.1, 212.8),
    },
    {
        "page": 55,
        "name": "traffic-signal-red-yellow-green",
        "bbox": (43.3, 426.0, 84.4, 485.3),
    },
    {
        "page": 56,
        "name": "guide-sign-hospital",
        "bbox": (73.2, 450.6, 130.8, 508.2),
    },
    {
        "page": 56,
        "name": "guide-sign-food",
        "bbox": (175.2, 450.6, 232.8, 508.2),
    },
    {
        "page": 56,
        "name": "guide-sign-gas",
        "bbox": (277.2, 450.6, 334.8, 508.2),
    },
    {
        "page": 56,
        "name": "guide-sign-lodging",
        "bbox": (379.2, 450.6, 436.8, 508.2),
    },
    {
        "page": 56,
        "name": "guide-sign-recreation",
        "bbox": (481.2, 450.6, 538.8, 508.2),
    },
    {
        "page": 56,
        "name": "railroad-warning-sign",
        "bbox": (45.3, 548.3, 84.4, 587.3),
    },
    {
        "page": 56,
        "name": "railroad-crossbuck-sign",
        "bbox": (43.3, 589.2, 86.5, 632.4),
    },
    {
        "page": 56,
        "name": "railroad-track-count-sign",
        "bbox": (43.3, 634.3, 86.5, 677.5),
    },
    {
        "page": 57,
        "name": "no-left-turn-sign",
        "bbox": (169.6, 130.3, 234.4, 195.1),
    },
    {
        "page": 57,
        "name": "no-right-turn-sign",
        "bbox": (239.4, 130.3, 304.2, 195.1),
    },
    {
        "page": 57,
        "name": "no-u-turn-sign",
        "bbox": (309.1, 130.3, 373.9, 195.1),
    },
    {
        "page": 57,
        "name": "left-turn-only-sign",
        "bbox": (378.9, 130.3, 443.7, 195.1),
    },
    {
        "page": 57,
        "name": "do-not-enter-sign",
        "bbox": (169.0, 228.7, 233.8, 293.5),
    },
    {
        "page": 57,
        "name": "straight-or-turn-right-sign",
        "bbox": (239.2, 228.7, 304.0, 293.5),
    },
    {
        "page": 57,
        "name": "speed-limit-65-sign",
        "bbox": (309.5, 228.7, 374.3, 293.5),
    },
    {
        "page": 57,
        "name": "stop-sign",
        "bbox": (379.7, 228.7, 444.5, 293.5),
    },
    {
        "page": 57,
        "name": "interstate-route-sign",
        "bbox": (185.3, 434.7, 250.1, 499.5),
    },
    {
        "page": 57,
        "name": "us-route-sign",
        "bbox": (275.1, 434.7, 339.9, 499.5),
    },
    {
        "page": 57,
        "name": "state-route-sign",
        "bbox": (364.9, 434.7, 429.7, 499.5),
    },
    {
        "page": 57,
        "name": "lane-ends-sign",
        "bbox": (46.8, 588.5, 109.2, 649.8),
    },
    {
        "page": 57,
        "name": "merging-traffic-sign",
        "bbox": (111.6, 588.5, 174.0, 649.8),
    },
    {
        "page": 57,
        "name": "added-lane-sign",
        "bbox": (176.4, 588.5, 238.8, 649.8),
    },
    {
        "page": 57,
        "name": "sharp-curve-ahead-sign",
        "bbox": (241.2, 588.5, 303.6, 649.8),
    },
    {
        "page": 57,
        "name": "curvy-road-ahead-sign",
        "bbox": (306.0, 588.5, 368.4, 649.8),
    },
    {
        "page": 57,
        "name": "right-curve-sign",
        "bbox": (370.8, 588.5, 433.2, 649.8),
    },
    {
        "page": 57,
        "name": "divided-highway-begins-sign",
        "bbox": (435.6, 588.5, 498.0, 649.8),
    },
    {
        "page": 57,
        "name": "divided-highway-ends-sign",
        "bbox": (500.4, 588.5, 562.8, 649.8),
    },
    {
        "page": 58,
        "name": "intersection-ahead-sign",
        "bbox": (39.5, 36.0, 97.8, 94.3),
    },
    {
        "page": 58,
        "name": "side-road-ahead-sign",
        "bbox": (106.2, 36.0, 164.5, 94.3),
    },
    {
        "page": 58,
        "name": "t-intersection-ahead-sign",
        "bbox": (172.9, 36.0, 231.2, 94.3),
    },
    {
        "page": 58,
        "name": "no-passing-zone-sign",
        "bbox": (239.6, 36.0, 297.9, 94.3),
    },
    {
        "page": 58,
        "name": "stop-sign-ahead-sign",
        "bbox": (306.3, 36.0, 364.6, 94.3),
    },
    {
        "page": 58,
        "name": "traffic-signal-ahead-sign",
        "bbox": (373.0, 36.0, 431.3, 94.3),
    },
    {
        "page": 58,
        "name": "advisory-speed-curve-sign",
        "bbox": (439.8, 36.0, 498.0, 94.3),
    },
    {
        "page": 58,
        "name": "school-crossing-sign",
        "bbox": (506.5, 36.0, 564.8, 94.3),
    },
    {
        "page": 58,
        "name": "pedestrian-crossing-sign",
        "bbox": (117.5, 147.4, 182.3, 212.2),
    },
    {
        "page": 58,
        "name": "share-the-road-bicycles-sign",
        "bbox": (214.2, 146.5, 279.0, 211.3),
    },
    {
        "page": 58,
        "name": "bicycle-crossing-sign",
        "bbox": (314.0, 146.5, 378.8, 211.3),
    },
    {
        "page": 58,
        "name": "slippery-when-wet-sign",
        "bbox": (414.3, 146.5, 479.1, 211.3),
    },
    {
        "page": 58,
        "name": "yield-sign",
        "bbox": (43.3, 266.1, 93.7, 316.5),
    },
    {
        "page": 58,
        "name": "center-lane-only-sign",
        "bbox": (43.3, 316.5, 93.7, 366.9),
    },
    {
        "page": 58,
        "name": "one-way-sign",
        "bbox": (43.3, 366.9, 93.7, 417.3),
    },
    {
        "page": 58,
        "name": "flagger-ahead-sign",
        "bbox": (310.1, 453.0, 374.9, 517.8),
    },
    {
        "page": 58,
        "name": "workers-ahead-sign",
        "bbox": (374.9, 453.0, 439.7, 517.8),
    },
    {
        "page": 58,
        "name": "road-construction-ahead-sign",
        "bbox": (436.3, 453.0, 501.1, 517.8),
    },
    {
        "page": 58,
        "name": "one-lane-road-ahead-sign",
        "bbox": (500.4, 453.0, 565.2, 517.8),
    },
    {
        "page": 58,
        "name": "detour-sign",
        "bbox": (312.9, 563.4, 375.2, 620.9),
    },
    {
        "page": 58,
        "name": "flagger-person",
        "bbox": (408.9, 563.4, 471.2, 620.9),
    },
    {
        "page": 58,
        "name": "worker-person",
        "bbox": (467.7, 563.4, 530.0, 620.9),
    },
    {
        "page": 58,
        "name": "construction-barrel",
        "bbox": (117.5, 668.7, 196.7, 747.8),
    },
    {
        "page": 58,
        "name": "construction-cone",
        "bbox": (192.6, 691.8, 232.7, 747.8),
    },
    {
        "page": 58,
        "name": "road-closed-barricade",
        "bbox": (413.5, 683.0, 494.5, 747.8),
    },
    {
        "page": 97,
        "name": "bicycle-share-the-road-photo",
        "bbox": (46.1, 224.1, 103.1, 281.1),
    },
]


def crop_page_image(page: fitz.Page, bbox: tuple[float, float, float, float]) -> Image.Image:
    rect = fitz.Rect(*bbox)
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=rect, alpha=True)
    return Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGBA")


def trim_transparency(img: Image.Image, padding: int = 12) -> Image.Image:
    alpha = img.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        return img

    left, top, right, bottom = bounds
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF_PATH)

    for spec in PAGE_CROPS:
        page = doc[spec["page"] - 1]
        image = crop_page_image(page, spec["bbox"])
        image = trim_transparency(image)
        target = OUT_DIR / f"{spec['name']}.png"
        image.save(target)
        print(target.relative_to(ROOT))


if __name__ == "__main__":
    main()
