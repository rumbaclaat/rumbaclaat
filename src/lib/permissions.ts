import type { StaffRole, StaffUser } from "@/generated/prisma/client";

/** Permission catalogue, grouped for the staff editor UI. key → human label. */
export const PERMISSION_GROUPS: { group: string; keys: [string, string][] }[] = [
  { group: "General", keys: [
    ["dashboard.view", "View dashboard"],
    ["analytics.view", "View analytics"],
  ] },
  { group: "Orders & customers", keys: [
    ["orders.view", "View orders"],
    ["orders.edit", "Edit orders / fulfilment"],
    ["orders.refund", "Refund orders"],
    ["orders.create", "Create orders"],
    ["customers.view", "View customers"],
    ["customers.edit", "Edit customers"],
    ["customers.delete", "Delete / GDPR erase"],
    ["enquiries.view", "View enquiries"],
    ["enquiries.reply", "Reply to enquiries"],
  ] },
  { group: "Trade", keys: [
    ["trade.view", "View trade accounts"],
    ["trade.manage", "Manage trade accounts"],
  ] },
  { group: "Catalogue", keys: [
    ["products.view", "View products"],
    ["products.edit", "Edit products"],
    ["products.delete", "Delete products"],
    ["catalog.manage", "Categories / collections / classes / inventory"],
    ["promotions.edit", "Promotions & coupons"],
    ["reviews.moderate", "Moderate reviews"],
  ] },
  { group: "Content", keys: [
    ["content.edit", "Pages / blog / cocktails / FAQ / media / nav / banners"],
  ] },
  { group: "Loyalty & marketing", keys: [
    ["loyalty.manage", "Membership / points / rewards"],
    ["newsletter.manage", "Newsletter"],
  ] },
  { group: "Admin", keys: [
    ["settings.edit", "Edit settings"],
    ["staff.manage", "Manage staff & roles"],
    ["audit.view", "View audit log"],
  ] },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_GROUPS.flatMap((g) => g.keys.map((k) => k[0]));

export const ROLE_DEFAULTS: Record<StaffRole, string[]> = {
  super_admin: ["*"],
  content_editor: ["dashboard.view", "content.edit"],
  catalogue_manager: ["dashboard.view", "products.view", "products.edit", "products.delete", "catalog.manage", "promotions.edit", "reviews.moderate"],
  order_manager: ["dashboard.view", "orders.view", "orders.edit", "orders.refund", "orders.create", "customers.view", "customers.edit", "enquiries.view", "enquiries.reply"],
  membership_manager: ["dashboard.view", "loyalty.manage", "customers.view"],
  trade_manager: ["dashboard.view", "trade.view", "trade.manage", "enquiries.view", "enquiries.reply"],
  marketing_manager: ["dashboard.view", "analytics.view", "newsletter.manage", "promotions.edit", "content.edit"],
};

/** Effective permissions for a staff member: explicit overrides, else role defaults. */
export function resolvePermissions(staff: Pick<StaffUser, "role" | "permissions">): string[] {
  const custom = staff.permissions;
  if (Array.isArray(custom) && custom.length > 0) return custom as string[];
  return ROLE_DEFAULTS[staff.role] ?? [];
}

export function can(perms: string[], key: string): boolean {
  return perms.includes("*") || perms.includes(key);
}
