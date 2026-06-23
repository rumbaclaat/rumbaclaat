Rumbaclaat brand logos
======================

Drop the logo files in THIS folder (public/brand/) with these exact names.
Each appears automatically once present; until then a text fallback shows.
Use the WHITE / light versions — they sit on the dark header, hero and footer.
Transparent PNG (or SVG renamed to .png won't work — use .png/.webp) recommended.

  wordmark.png               Horizontal "RUMBACLAAT" wordmark (white).
                             Used in: site header + footer brand.
                             Keep it short/wide — header height is ~26px.

  logo.png                   Main "RUMBACLAAT RUM" logo with the ornaments
                             (white). Used in: the homepage hero banner
                             (rendered ~340px wide, so a tall logo is fine here).

  intl-drinks-specialist.png International Drinks Specialists accreditation
                             badge. Used in: footer (partners strip).

Optional / spare brand marks (not yet wired — tell me where you want them):
  logo-alt-1.png
  logo-alt-2.png

After adding files, just refresh — no rebuild needed in dev. In production they
ship on the next git push (they're committed from public/).
