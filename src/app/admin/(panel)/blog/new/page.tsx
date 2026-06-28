import BlogPostForm from "@/components/admin/blogpost-form";
import PageHeader from "@/components/admin/ui/page-header";
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <>
      <PageHeader
        title="New post"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Blog", href: "/admin/blog" }, { label: "New" }]}
      />
      <BlogPostForm action={createPost} submitLabel="Create post" />
    </>
  );
}
