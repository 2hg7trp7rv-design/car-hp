"""Rebuild the committed reference-book display font. Requires scripts/requirements-fonts.txt.

The rounded face is used for headings on every reference surface (home, learn, choose,
glossary), so the subset must cover every character those surfaces can render - source
strings and authored JSON alike. Subsetting only the home page leaves other pages with
missing glyphs that silently fall back to another family mid-sentence.

Body text uses the system Japanese stack, so only one face ships. Builds do not download
fonts or need Python; run this after adding copy, then commit the .woff2 and charset.json.
The Node contract test fails when a rendered character is missing from charset.json.
"""
import json
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
# Every surface that renders inside ReferenceFrame, plus the data those surfaces read.
INPUT_PATTERNS = [
    "app/**/*.tsx",
    "app/**/*.ts",
    "components/**/*.tsx",
    "lib/**/*.ts",
    "data/learning/*.json",
    "data/hubGuides.json",
    "data/articles/guides/*.json",
]
FONTS = ["m-plus-rounded-1c-800.woff2"]
OUTPUT = ROOT / "app/refbook-fonts"

inputs = sorted(
    {
        path.relative_to(ROOT).as_posix()
        for pattern in INPUT_PATTERNS
        for path in ROOT.glob(pattern)
        if path.is_file()
    }
)
characters = sorted(
    {
        character
        for name in inputs
        for character in (ROOT / name).read_text(encoding="utf-8")
        if character not in "\t\r"
    }
)

for name in FONTS:
    source = ROOT / "assets/fonts" / name
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.flavor = "woff2"
    options.recalc_timestamp = False
    options.layout_features = ["*"]
    builder = subset.Subsetter(options=options)
    builder.populate(text="".join(characters))
    builder.subset(font)
    target = OUTPUT / (source.stem + "-subset.woff2")
    font.save(target)
    print(f"{source.name}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes")

(OUTPUT / "charset.json").write_text(
    json.dumps({"inputs": inputs, "characters": characters}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"charset.json: {len(inputs)} inputs, {len(characters)} characters")
