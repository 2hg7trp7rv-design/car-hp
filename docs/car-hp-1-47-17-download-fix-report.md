# car-hp-1-47-17 download fix report

## Purpose

The previous full repository ZIP was too large for reliable download in this chat environment. This package keeps the repository root structure unchanged and preserves the car image assignments, while reducing the ZIP size.

## Changed

- Hash-locked accepted car KV images were not modified.
- Generated car JPEG images were re-encoded for smaller file size.
- Pixel dimensions were preserved for generated JPEG files.
- Repository structure remains root-direct.
- No JSON image path changes were made.

## Image checks

- Car image files: 94
- Largest car image: CBJ_KV_Mitsubishi_Lancer_Evolution_IX_GSR_accepted.png (2.75 MB)
- Every car image is under 100 MB.
- Generated JPEG dimensions remain unchanged after re-encoding.

## Verification passed

- generate-public-assets
- verify-public-asset-references
- verify-car-kv-targets
- verify-internal-links
- generate-sitemaps
- verify-sitemaps
- generate-robots
- verify-robots
- verify-indexing-surface
