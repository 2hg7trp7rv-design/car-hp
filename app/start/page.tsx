// app/start/page.tsx
import { permanentRedirect } from "next/navigation";

export default function StartPage() {
  permanentRedirect("/site-map");
}
