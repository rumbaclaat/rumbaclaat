import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostForm from "@/components/admin/blogpost-form";
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
      <div className="admin-page-head">
        <h1>Edit post</h1>
      </div>
      <BlogPostForm action={updatePost} post={post} submitLabel="Save changes" />
    </>
  );
}
