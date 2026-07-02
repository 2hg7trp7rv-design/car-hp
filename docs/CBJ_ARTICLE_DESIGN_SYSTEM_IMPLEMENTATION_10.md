# CBJ article design system implementation 10

## Scope

Mobile viewport correction for `modern-car-custom-regret-reason-column` using the `column-renewal-v1` layout preset.

## Changes

- Removed the Kimi-specific `word-break: keep-all` behavior that forced Japanese sentences outside the viewport.
- Constrained dialogue rows, bubbles, article blocks, figures, tables, cards, and end sections to the viewport.
- Added natural Japanese wrapping and `min-width: 0` to flex/grid children.
- Added explicit layouts for 320-560px widths and safe-area padding.
- Converted Kimi-style comparison tables into labelled stacked cards below 560px so every column remains readable without horizontal clipping.
- Disabled transform-based wide-block animation on this article where it displaced figures from the viewport centre.
- Kept the existing non-mock blocks and their content unchanged.

## Verification targets

- 320px, 360px, 375px, 390px, 414px, and 430px viewport widths.
- No document-level horizontal scrolling.
- Tables become labelled stacked cards and remain fully readable without horizontal scrolling.
- Dialogue bubbles remain fully visible.
