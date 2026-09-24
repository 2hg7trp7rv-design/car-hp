"""Rebuild committed home-page fonts. Requires scripts/requirements-fonts.txt.

Builds do not download fonts or need Python. Run this after changing home-page copy;
the Node regression test checks that new characters have been considered.
"""
import json
import hashlib
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
INPUTS = ["app/page.tsx", "lib/learning.ts", "components/learning/ReferenceFrame.tsx", "components/learning/AirFilterFigure.tsx", "components/analytics/CookieSettingsButton.tsx"]
characters = sorted(set("".join((ROOT / name).read_text() for name in INPUTS)))
output = ROOT / "app/refbook-fonts"
font_records = {}

for source in sorted((ROOT / "assets/fonts").glob("*.woff2")):
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.flavor = "woff2"
    options.recalc_timestamp = False
    options.layout_features = ["*"]
    builder = subset.Subsetter(options=options)
    builder.populate(text="".join(characters))
    builder.subset(font)
    target = output / (source.stem + "-subset.woff2")
    font.save(target)
    # Inspect the saved font, not the requested subset, to record actual coverage.
    saved = TTFont(target)
    codepoints = sorted(saved.getBestCmap())
    font_records[target.name] = {"sha256": hashlib.sha256(target.read_bytes()).hexdigest(), "codepoints": codepoints}
    print(f"{source.name}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes")

(output / "charset.json").write_text(json.dumps({"inputs": INPUTS, "characters": characters, "fonts": font_records}, ensure_ascii=False, indent=2) + "\n")
