import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import ReviewsGrid, { type ReviewRow } from "@/components/admin/reviews/reviews-grid";
import { bulkReviewStatus, deleteReview } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, include: { product: { select: { name: true } } } });
  const rows: ReviewRow[] = reviews.map((r) => ({
    id: r.id, product: r.product.name, author: r.authorName, rating: r.rating, title: r.title ?? "—",
    status: r.status, featured: r.featured ? "★" : "", created: r.createdAt.toISOString(),
  }));
  return (
    <>
      <PageHeader title="Reviews" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Reviews" }]} subtitle="Select rows to approve or reject." />
      <ReviewsGrid rows={rows} bulkStatus={bulkReviewStatus} deleteAction={deleteReview} />
    </>
  );
}
