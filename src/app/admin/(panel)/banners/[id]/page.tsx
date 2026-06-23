import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import BannerForm from "@/components/admin/banners/banner-form";
import { updateBanner } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBanner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();
  return (
    <>
      <PageHeader title="Edit banner" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Banners", href: "/admin/banners" }, { label: banner.message.slice(0, 32) }]} />
      <BannerForm action={updateBanner} banner={banner} submitLabel="Save changes" />
    </>
  );
}
