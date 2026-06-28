import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostForm from "@/components/admin/blogpost-form";
import PageHeader from "@/components/admin/ui/page-header";
import { updatePost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <>
      <PageHeader
        title="Edit post"
        subtitle={post.title}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Blog", href: "/admin/blog" }, { label: post.title }]}
      />
      <BlogPostForm action={updatePost} post={post} submitLabel="Save changes" />
    </>
  );
}
