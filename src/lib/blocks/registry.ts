/**
 * Block registry: the single source of truth for content-block types.
 * Used by the admin editor (to render field forms) and the storefront
 * renderer (to render the block). Add a type here + a case in BlockRenderer.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext" // HTML (rendered as-is)
  | "number"
  | "image"
  | "url"
  | "lines" // one item per line
  | "pairs"; // "left | right" per line

export type BlockField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
};

export type BlockDef = {
  label: string;
  description: string;
  fields: BlockField[];
  defaults: Record<string, unknown>;
  /** true if the block pulls its items from the database (products, posts…) */
  dataDriven?: boolean;
};

export const BLOCKS: Record<string, BlockDef> = {
  hero_banner: {
    label: "Hero banner",
    description: "Full-width hero with heading, lede and up to two CTAs.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "lede", label: "Lede", type: "textarea" },
      { key: "backgroundImage", label: "Background image URL", type: "image" },
      { key: "ctaLabel", label: "Primary CTA label", type: "text" },
      { key: "ctaUrl", label: "Primary CTA URL", type: "url" },
      { key: "cta2Label", label: "Secondary CTA label", type: "text" },
      { key: "cta2Url", label: "Secondary CTA URL", type: "url" },
    ],
    defaults: { heading: "New heading" },
  },
  parallax_callout: {
    label: "Parallax callout",
    description: "Background image band with overlaid copy.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "backgroundImage", label: "Background image URL", type: "image" },
    ],
    defaults: { heading: "Patience is the secret ingredient" },
  },
  rich_text: {
    label: "Rich text",
    description: "Free HTML content (headings, paragraphs, lists).",
    fields: [{ key: "html", label: "Content (HTML)", type: "richtext" }],
    defaults: { html: "<p>Write something…</p>" },
  },
  trust_bar: {
    label: "Trust bar",
    description: "Single row of short trust statements.",
    fields: [
      { key: "items", label: "Items (one per line)", type: "lines" },
    ],
    defaults: { items: "12+ Year Aged\nFree UK Shipping over £50\n50,000+ Members" },
  },
  stat_block: {
    label: "Stat block",
    description: "Row of big numbers with labels.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "stats", label: "Stats (value | label per line)", type: "pairs" },
    ],
    defaults: { stats: "50K+ | Members\n4 | Tiers\n3× | Max points" },
  },
  two_col: {
    label: "Two column (text + image)",
    description: "Text on one side, image on the other.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body (HTML)", type: "richtext" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "imageSide", label: "Image side (left/right)", type: "text" },
    ],
    defaults: { heading: "Our story", imageSide: "right" },
  },
  card_grid: {
    label: "Card grid",
    description: "Grid of simple cards.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "cards", label: "Cards (title | body per line)", type: "pairs" },
    ],
    defaults: { cards: "Heritage | From the canefields of Jamaica\nCraft | Aged in American oak" },
  },
  faq_accordion: {
    label: "FAQ accordion",
    description: "Expandable question/answer list.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "items", label: "Items (question | answer per line)", type: "pairs" },
    ],
    defaults: { heading: "Questions answered", items: "Is Bronze free? | Yes — always free." },
  },
  cta_band: {
    label: "CTA band",
    description: "Centred call to action.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      { key: "ctaUrl", label: "CTA URL", type: "url" },
    ],
    defaults: { heading: "Join RPM", ctaLabel: "Join free", ctaUrl: "/join" },
  },
  newsletter: {
    label: "Newsletter signup",
    description: "Email capture block.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    defaults: { heading: "Join the Rumbaclaat list" },
  },
  membership_tiers: {
    label: "Membership tiers (from DB)",
    description: "Renders the live membership tiers.",
    fields: [{ key: "heading", label: "Heading", type: "text" }],
    defaults: { heading: "RPM" },
    dataDriven: true,
  },
  featured_products: {
    label: "Featured products (from DB)",
    description: "Grid of published products.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "limit", label: "How many", type: "number" },
    ],
    defaults: { heading: "Signature collection", limit: 3 },
    dataDriven: true,
  },
};

export const BLOCK_TYPES = Object.keys(BLOCKS);

export function blockLabel(type: string): string {
  return BLOCKS[type]?.label ?? type;
}

/** Parse a "lines" field into a string array. */
export function parseLines(v: unknown): string[] {
  return String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse a "pairs" field into {a,b} objects. */
export function parsePairs(v: unknown, sep = "|"): { a: string; b: string }[] {
  return parseLines(v).map((line) => {
    const idx = line.indexOf(sep);
    if (idx === -1) return { a: line, b: "" };
    return { a: line.slice(0, idx).trim(), b: line.slice(idx + 1).trim() };
  });
}
