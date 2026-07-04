import type {
  ArticleDesignDialogue,
  ArticleDesignSpec,
  GuideDetailBlock,
} from "@/lib/content-types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asDialogueArray(value: unknown): ArticleDesignDialogue[] | null {
  if (!Array.isArray(value)) return null;
  const items: ArticleDesignDialogue[] = [];
  for (const entry of value) {
    const record = asRecord(entry);
    const character = record ? asString(record.character) : null;
    const text = record ? asString(record.text) : null;
    if ((character !== "juna" && character !== "rina") || !text) continue;
    const variant = record ? asString(record.variant) : null;
    const motion = record ? asString(record.motion) : null;
    items.push({
      character,
      text,
      variant:
        variant === "bubble" || variant === "lead" || variant === "aside" || variant === "compact"
          ? variant
          : null,
      image: record ? asString(record.image) : null,
      label: record ? asString(record.label) : null,
      motion:
        motion === "none" ||
        motion === "fade-up" ||
        motion === "fade-left" ||
        motion === "fade-right" ||
        motion === "scale-in"
          ? motion
          : null,
    });
  }
  return items.length ? items : null;
}

export function coerceArticleDesign(value: unknown): ArticleDesignSpec | null {
  const record = asRecord(value);
  if (!record) return null;

  const version = asString(record.version);
  if (!version) return null;

  const lessonNumber =
    typeof record.lessonNumber === "number" && Number.isFinite(record.lessonNumber)
      ? record.lessonNumber
      : null;

  const heroGradient = Array.isArray(record.heroGradient)
    ? record.heroGradient.map(asString).filter((entry): entry is string => Boolean(entry)).slice(0, 2)
    : [];

  const sectionPalette = Array.isArray(record.sectionPalette)
    ? record.sectionPalette.map(asString).filter((entry): entry is string => Boolean(entry))
    : [];

  const sectionDialoguesRecord = asRecord(record.sectionDialogues);
  const sectionDialogues: Record<string, ArticleDesignDialogue[]> = {};
  if (sectionDialoguesRecord) {
    for (const [key, dialogues] of Object.entries(sectionDialoguesRecord)) {
      const parsed = asDialogueArray(dialogues);
      if (parsed) sectionDialogues[key] = parsed;
    }
  }

  return {
    version,
    layoutPreset: asString(record.layoutPreset),
    lessonNumber,
    difficulty: asString(record.difficulty),
    heroGradient: heroGradient.length === 2 ? [heroGradient[0], heroGradient[1]] : null,
    heroTitle: asString(record.heroTitle),
    heroLead: asString(record.heroLead),
    heroPromise: asString(record.heroPromise),
    heroCenterImage: asString(record.heroCenterImage),
    sectionPalette: sectionPalette.length ? sectionPalette : null,
    introDialogue: asDialogueArray(record.introDialogue),
    sectionDialogues: Object.keys(sectionDialogues).length ? sectionDialogues : null,
    closingDialogue: asDialogueArray(record.closingDialogue),
    closingBlocks: Array.isArray(record.closingBlocks)
      ? (record.closingBlocks as GuideDetailBlock[])
      : null,
  };
}
