import PageHeader from "@/components/admin/ui/page-header";
import CollectionForm from "@/components/admin/collections/collection-form";
import { createCollection } from "../actions";

export default function NewCollectionPage() {
  return (
    <>
      <PageHeader title="New collection" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Collections", href: "/admin/collections" }, { label: "New" }]} />
      <CollectionForm action={createCollection} submitLabel="Create collection" />
    </>
  );
}
