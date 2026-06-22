import { redirect } from "next/navigation";

const DESIGN_PREVIEW_PATH =
  "/column/modern-car-custom-regret-reason-column";

export default function Home() {
  redirect(DESIGN_PREVIEW_PATH);
}
