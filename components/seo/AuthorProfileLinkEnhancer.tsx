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

function markEditorialReviewSections() {
  const reviewLabels = Array.from(document.querySelectorAll("p")).filter(
    (node) => node.textContent?.trim() === "CBJ REVIEW",
  );

  for (const label of reviewLabels) {
    const section = label.closest("section");
    if (!section || !(section instanceof HTMLElement)) continue;
    section.dataset.cbjEditorialReview = "compact";
  }
}

export function AuthorProfileLinkEnhancer() {
  useEffect(() => {
    const enhance = () => {
      markEditorialReviewSections();

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

  return (
    <style jsx global>{`
      [data-cbj-editorial-review="compact"] {
        margin: clamp(22px, 4vw, 34px) 0 !important;
        padding: clamp(18px, 3vw, 26px) !important;
        border: 1px solid rgba(0, 112, 141, 0.16) !important;
        border-radius: 22px !important;
        background:
          linear-gradient(180deg, rgba(244, 249, 250, 0.86), rgba(255, 255, 255, 0.96)) !important;
        box-shadow: 0 18px 42px -32px rgba(13, 18, 22, 0.22) !important;
      }

      [data-cbj-editorial-review="compact"] > p:first-child {
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin: 0 0 10px !important;
        color: #00708d !important;
        font-size: 11px !important;
        line-height: 1.2 !important;
        letter-spacing: 0.16em !important;
      }

      [data-cbj-editorial-review="compact"] > h3 {
        margin: 0 0 12px !important;
        font-size: clamp(18px, 4.8vw, 24px) !important;
        line-height: 1.45 !important;
      }

      [data-cbj-editorial-review="compact"] > h3::before {
        width: 4px !important;
        min-height: 28px !important;
        border-radius: 999px !important;
      }

      [data-cbj-editorial-review="compact"] > p:not(:first-child),
      [data-cbj-editorial-review="compact"] > div:not([data-cbj-ignore]) + p {
        margin: 0 !important;
        color: #2b3338 !important;
        font-size: clamp(13px, 3.55vw, 15px) !important;
        line-height: 1.95 !important;
      }

      [data-cbj-editorial-review="compact"] > div {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;
        margin-top: 18px !important;
      }

      [data-cbj-editorial-review="compact"] > div > article {
        padding: 14px 15px !important;
        border-radius: 16px !important;
        border-color: rgba(13, 18, 22, 0.08) !important;
        background: rgba(255, 255, 255, 0.82) !important;
        box-shadow: none !important;
      }

      [data-cbj-editorial-review="compact"] > div > article > p:first-child {
        margin: 0 0 12px !important;
        color: #8b969d !important;
        font-size: 12px !important;
        line-height: 1 !important;
        letter-spacing: 0.08em !important;
      }

      [data-cbj-editorial-review="compact"] > div > article h4 {
        margin: 0 0 8px !important;
        font-size: clamp(14px, 3.7vw, 16px) !important;
        line-height: 1.55 !important;
      }

      [data-cbj-editorial-review="compact"] > div > article p:not(:first-child) {
        margin: 0 !important;
        color: #39444b !important;
        font-size: clamp(12px, 3.35vw, 13px) !important;
        line-height: 1.85 !important;
      }

      [data-cbj-editorial-review="compact"] > div + p {
        margin-top: 14px !important;
        padding-top: 12px !important;
        border-top: 1px solid rgba(13, 18, 22, 0.08) !important;
        color: #637079 !important;
        font-size: 12px !important;
        line-height: 1.75 !important;
      }

      @media (max-width: 640px) {
        [data-cbj-editorial-review="compact"] {
          margin: 18px 0 24px !important;
          padding: 18px 16px !important;
          border-radius: 18px !important;
        }

        [data-cbj-editorial-review="compact"] > div {
          grid-template-columns: 1fr !important;
          gap: 9px !important;
          margin-top: 16px !important;
        }

        [data-cbj-editorial-review="compact"] > div > article {
          padding: 13px 14px !important;
          border-radius: 14px !important;
        }
      }
    `}</style>
  );
}
