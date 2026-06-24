/**
 * Section images for the hand-built storefront pages.
 *
 * The home/shop/join/cocktails pages are static JSX (not DB block pages), so
 * their hero/parallax background images were hardcoded. This manifest lists each
 * page's sections IN ORDER — the editable image slots plus read-only "locked"
 * markers for the bespoke sections — so the admin can surface and replace just
 * the images while leaving the layout untouched.
 *
 * Overrides live in `Settings.sectionImages` ({ slot: url }). A page renders the
 * override if present, else the coded default below (which equals the original
 * hardcoded URL — so with no override the output is unchanged).
 */
import { prisma } from "@/lib/prisma";

export type Section =
  | { kind: "image"; slot: string; label: string; defaultUrl: string }
  | { kind: "locked"; label: string };

export type ManagedPage = {
  key: string;
  title: string;
  slug: string; // storefront path (for View ↗ + revalidation)
  note?: string;
  sections: Section[];
};

/** Build the exact Unsplash URL the pages already used. */
const UN = (id: string, w: number, q = false) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}${q ? "&q=80" : ""}`;

export const MANAGED_PAGES: ManagedPage[] = [
  {
    key: "home",
    title: "Home",
    slug: "/",
    note: "These images are used by the built-in homepage layout — shown when no custom homepage blocks are published.",
    sections: [
      { kind: "image", slot: "home.hero", label: "Hero banner", defaultUrl: UN("photo-1758871993077-e084cc7eca86", 1800) },
      { kind: "locked", label: "Announcement ticker" },
      { kind: "locked", label: "Trust bar" },
      { kind: "image", slot: "home.oak", label: "Oak parallax band — “Patience is the Secret Ingredient”", defaultUrl: UN("photo-1765989427988-248c7d48cb56", 1800) },
      { kind: "locked", label: "Featured products" },
      { kind: "locked", label: "Membership tiers strip" },
      { kind: "locked", label: "Cocktails preview" },
      { kind: "locked", label: "Blog preview" },
      { kind: "locked", label: "Newsletter" },
      { kind: "locked", label: "Socials" },
    ],
  },
  {
    key: "shop",
    title: "Shop",
    slug: "/shop",
    sections: [
      { kind: "locked", label: "Page header" },
      { kind: "locked", label: "Sale strip" },
      { kind: "locked", label: "Category grid" },
      { kind: "locked", label: "Members banner" },
      { kind: "locked", label: "Gift cards advert" },
      { kind: "image", slot: "shop.parallax", label: "Parallax band — “Crafted for Those Who Demand More”", defaultUrl: UN("photo-1764065340249-ee8bec50d2f7", 1800) },
    ],
  },
  {
    key: "join",
    title: "Membership (Join)",
    slug: "/join",
    sections: [
      { kind: "image", slot: "join.hero", label: "Hero banner", defaultUrl: UN("photo-1579042952429-66db7c5cc528", 1800, true) },
      { kind: "locked", label: "Stats bar" },
      { kind: "locked", label: "How it works (steps)" },
      { kind: "image", slot: "join.parallax", label: "Parallax band — “Some Things Improve with Patience”", defaultUrl: UN("photo-1635771747900-a19e5c866031", 1800, true) },
      { kind: "locked", label: "Membership tiers" },
      { kind: "locked", label: "FAQ" },
      { kind: "locked", label: "Join CTA" },
    ],
  },
  {
    key: "cocktails",
    title: "Cocktails",
    slug: "/cocktails",
    sections: [
      { kind: "image", slot: "cocktails.hero", label: "Hero parallax — “The Art of the Perfect Serve”", defaultUrl: UN("photo-1767745455688-49391131f751", 1800, true) },
      { kind: "locked", label: "Filter / search bar" },
      { kind: "locked", label: "Cocktail grid" },
      { kind: "image", slot: "cocktails.cta", label: "CTA parallax — “Shop the Collection”", defaultUrl: UN("photo-1744730850457-8795330490df", 1800, true) },
    ],
  },
];

/** slot -> coded default URL, derived from the manifest. */
export const SLOT_DEFAULTS: Record<string, string> = Object.fromEntries(
  MANAGED_PAGES.flatMap((p) => p.sections)
    .filter((s): s is Extract<Section, { kind: "image" }> => s.kind === "image")
    .map((s) => [s.slot, s.defaultUrl]),
);

export function managedPage(key: string): ManagedPage | undefined {
  return MANAGED_PAGES.find((p) => p.key === key);
}

/** Read the override map from the Settings singleton (one query). */
export async function getSectionImageMap(): Promise<Record<string, string>> {
  const s = await prisma.settings.findUnique({ where: { id: "default" } });
  const raw = (s?.sectionImages ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string" && v) out[k] = v;
  return out;
}

/** Resolve a slot to its override URL, falling back to the coded default. */
export function sectionImage(map: Record<string, string>, slot: string): string {
  return map[slot] || SLOT_DEFAULTS[slot] || "";
}
