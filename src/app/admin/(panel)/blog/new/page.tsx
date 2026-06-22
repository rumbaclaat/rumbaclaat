import BlogPostForm from "@/components/admin/blogpost-form";
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <>
      <div className="admin-page-head">
        <h1>New post</h1>
      </div>
      <BlogPostForm action={createPost} submitLabel="Create post" />
    </>
  );
}
