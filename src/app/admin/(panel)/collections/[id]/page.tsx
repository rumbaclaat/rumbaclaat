import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import CollectionForm from "@/components/admin/collections/collection-form";
import { updateCollection } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection) notFound();
  return (
    <>
      <PageHeader title="Edit collection" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Collections", href: "/admin/collections" }, { label: collection.name }]} />
      <CollectionForm action={updateCollection} collection={collection} submitLabel="Save changes" />
    </>
  );
}
