"use client";

import { useEffect } from "react";

const AUTHOR_PROFILE_PATH = "/legal/about";

function findAuthorCards(): HTMLElement[] {
  const cards: HTMLElement[] = [];
  const authorNames = Array.from(document.querySelectorAll("b")).filter(
    (node) => node.textContent?.trim() === "山田太郎",
  );

  for (const nameNode of authorNames) {
    const card = nameNode.closest("div")?.parentElement;
    if (!card || !(card instanceof HTMLElement)) continue;
    if (card.dataset.authorProfileLink === "true") continue;

    const small = card.querySelector("small");
    const credential = small?.textContent ?? "";
    if (!credential.includes("CAR BOUTIQUE JOURNAL")) continue;

    cards.push(card);
  }

  return cards;
}

export function AuthorProfileLinkEnhancer() {
  useEffect(() => {
    const enhance = () => {
      for (const card of findAuthorCards()) {
        card.dataset.authorProfileLink = "true";
        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", "山田太郎の運営者情報を見る");
        card.style.cursor = "pointer";

        const openProfile = () => {
          window.location.href = AUTHOR_PROFILE_PATH;
        };

        card.addEventListener("click", openProfile);
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProfile();
          }
        });
      }
    };

    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
