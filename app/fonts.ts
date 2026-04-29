// app/fonts.ts
// Offline-safe font handles.
// `next/font/google` requires network access during `next build`, so CBJ keeps
// stable CSS variable exports and resolves actual stacks in `app/globals.css`.

type FontHandle = {
  variable: string;
};

export const interTight: FontHandle = { variable: "" };
export const notoSansJp: FontHandle = { variable: "" };
export const jetBrainsMono: FontHandle = { variable: "" };

// Backward-compatible aliases used by older imports.
export const inter = interTight;

export const fontVariables = "";
