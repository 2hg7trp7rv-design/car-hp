import type { GuideItem } from "@/lib/content-types";

/** Topic membership is editorial data; counts and destinations come from published guides. */
export const HOME_TOPICS = [
  { id: "exhaust", title: "排気系・マフラー", body: "マフラーの役割から排気ガスの流れまで、図で学ぼう。", icon: "exhaust-muffler", tone: "topicPink", slugs: [] },
  { id: "turbo", title: "ターボ・過給機", body: "「空気を詰め込むと、なぜ速くなる？」過給の仕組みを学ぼう。", icon: "turbocharger", tone: "topicBlue", slugs: [] },
  { id: "suspension", title: "足回り・サスペンション", body: "乗り心地の仕組みから、車高調と電子制御の注意点まで。", icon: "suspension", tone: "topicYellow", slugs: ["car-suspension-hard-soft-merit-demerit", "electronic-damper-coilover-risk-guide", "adas-lowered-car-aiming-risk-guide"] },
  { id: "engine", title: "エンジンの基礎", body: "エンジンって何してるの？動力を生む仕組みを学ぼう。", icon: "engine-basics", tone: "topicGreen", slugs: [] },
  { id: "inspection", title: "車検・制度", body: "車検は何を見てるの？車の基準と制度を学ぼう。", icon: "vehicle-inspection", tone: "topicPurple", slugs: [] },
  { id: "cost", title: "維持費・お金", body: "税金、保険、燃料、整備。乗り続けるためのお金を学ぼう。", icon: "ownership-cost", tone: "topicOrange", slugs: [] },
] as const;

export function getHomeTopics(guides: readonly GuideItem[]) {
  const published = new Map(guides.filter((g) => g.status === "published" && g.publicState !== "draft" && g.publicState !== "redirect").map((g) => [g.slug, g]));
  return HOME_TOPICS.map((topic) => ({
    ...topic,
    lessons: topic.slugs.flatMap((slug) => {
      const guide = published.get(slug);
      return guide ? [{ title: guide.title, href: `/guide/${guide.slug}` }] : [];
    }),
  }));
}
