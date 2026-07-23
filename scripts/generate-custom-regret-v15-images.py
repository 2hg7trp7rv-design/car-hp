#!/usr/bin/env python3
"""public/images/cbj/custom-regret-v15/*.avif の暫定プレースホルダー生成スクリプト。

custom-regret-v15 コラム（components/column/detail/column-v15-*.tsx）が参照する
8枚のAVIF画像をブランド調（#080b0d / #f6f1e9 / #00708d / クレイ）で生成する。
正式な画像ができたらこのスクリプトの成果物を差し替えること。

使い方:
    pip install pillow
    python scripts/generate-custom-regret-v15-images.py
"""

import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "images", "cbj", "custom-regret-v15")

INK = (8, 11, 13)
CREAM = (246, 241, 233)
TEAL = (0, 112, 141)
CLAY = (192, 124, 89)


def font(size):
    for path in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def make(name, size, bg, fg, text, sub=None):
    w, h = size
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    d.polygon(
        [(w * 0.55, 0), (w, 0), (w, h), (w * 0.75, h)],
        fill=tuple(min(255, c + 18) for c in bg),
    )
    f = font(int(w * 0.09))
    tb = d.textbbox((0, 0), text, font=f)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    d.text(((w - tw) / 2, (h - th) / 2 - (h * 0.04)), text, font=f, fill=fg)
    if sub:
        f2 = font(int(w * 0.035))
        tb = d.textbbox((0, 0), sub, font=f2)
        d.text(((w - (tb[2] - tb[0])) / 2, (h + th) / 2 + (h * 0.03)), sub, font=f2, fill=fg)
    img.save(os.path.join(ROOT, name), quality=70)


def avatar(name, bg, letter):
    img = Image.new("RGB", (240, 240), bg)
    d = ImageDraw.Draw(img)
    d.ellipse([16, 16, 224, 224], outline=CREAM, width=6)
    f = font(120)
    tb = d.textbbox((0, 0), letter, font=f)
    d.text(
        ((240 - (tb[2] - tb[0])) / 2, (240 - (tb[3] - tb[1])) / 2 - tb[1]),
        letter,
        font=f,
        fill=CREAM,
    )
    img.save(os.path.join(ROOT, name), quality=70)


def main():
    os.makedirs(ROOT, exist_ok=True)
    avatar("char-juna-avatar.avif", CLAY, "J")
    avatar("char-rina-avatar.avif", TEAL, "R")
    make("car-illustration.avif", (480, 320), INK, CREAM, "CAR", "custom regret lesson")
    make("ch1-system-map.avif", (960, 540), INK, CREAM, "CH1", "system map")
    make("ch2-airflow.avif", (960, 540), TEAL, CREAM, "CH2", "airflow")
    make("ch3-suspension.avif", (960, 540), INK, CREAM, "CH3", "suspension")
    make("ch4-can-network.avif", (960, 540), CLAY, CREAM, "CH4", "can network")
    make("ch5-steps.avif", (960, 540), INK, CREAM, "CH5", "steps")
    print("generated 8 avif placeholders ->", ROOT)


if __name__ == "__main__":
    main()
