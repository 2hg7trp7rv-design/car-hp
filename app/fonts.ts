// app/fonts.ts
// Offline-safe font handles.
// The original repository used `next/font/google`, which requires network access
// during `next build`. This fallback preserves the same exported surface and
// relies on CSS font stacks declared in `app/globals.css`.

type FontHandle = {
  variable: string;
};

export const inter: FontHandle = { variable: "" };
export const notoSansJp: FontHandle = { variable: "" };
export const cormorantGaramond: FontHandle = { variable: "" };
export const notoSerifJp: FontHandle = { variable: "" };

export const fontVariables = "";
