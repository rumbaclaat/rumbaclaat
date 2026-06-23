import { prisma } from "@/lib/prisma";

/** Injects admin-configured brand colours as CSS variable overrides, so the
 *  site can be re-branded from Admin → Appearance without code. */
export default async function BrandingStyle() {
  let b: Record<string, string> = {};
  try {
    const s = await prisma.settings.findUnique({ where: { id: "default" }, select: { branding: true } });
    b = (s?.branding ?? {}) as Record<string, string>;
  } catch {
    return null;
  }
  const rules: string[] = [];
  if (b.gold) rules.push(`--gold:${b.gold}`);
  if (b.goldHi) rules.push(`--gold-hi:${b.goldHi}`);
  if (b.bg) rules.push(`--bg:${b.bg}`);
  if (!rules.length) return null;
  return <style dangerouslySetInnerHTML={{ __html: `:root,[data-bs-theme="dark"]{${rules.join(";")}}` }} />;
}
