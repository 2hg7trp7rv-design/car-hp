export type Speaker = "shuna" | "rina";

export const CHARACTERS: Record<
  Speaker,
  { name: string; image: string; role: string; intro: string; color: "sun" | "sky" }
> = {
  shuna: {
    name: "シュナ",
    image: "/images/characters/shuna.webp",
    role: "クルマ初心者",
    intro: "免許をとったばかり。わからないことは、すぐ聞いちゃうタイプ。",
    color: "sun",
  },
  rina: {
    name: "莉奈",
    image: "/images/characters/rina.webp",
    role: "クルマにくわしいお姉さん",
    intro: "むずかしい話を、図でわかりやすく説明するのが得意。",
    color: "sky",
  },
};
