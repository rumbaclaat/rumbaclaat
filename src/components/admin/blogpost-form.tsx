import type { BlogPost } from "@/generated/prisma/client";
import RichTextEditor from "@/components/admin/rich-text-editor";
import ImageField from "@/components/admin/media/image-field";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, TextareaField, SelectField, CheckField, Field } from "@/components/admin/ui/field";

function dateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function BlogPostForm({
  action,
  post,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  post?: BlogPost;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="admin-product-grid">
        {/* Main column */}
        <div className="admin-product-main">
          <FormSection title="Content">
            <TextField name="title" label="Title" defaultValue={post?.title ?? ""} required col="col-12" />
            <TextareaField name="excerpt" label="Excerpt" defaultValue={post?.excerpt ?? ""} rows={3} hint="The short summary shown on the blog index and in search results." />
            <Field label="Body" col="col-12">
              <RichTextEditor name="body" defaultValue={post?.body ?? ""} />
            </Field>
          </FormSection>

          <FormSection title="Search engine (SEO)" description="How this post appears in search and when shared.">
            <TextField name="seoTitle" label="SEO title" defaultValue={post?.seoTitle ?? ""} col="col-12" />
            <TextareaField name="seoDescription" label="Meta description" defaultValue={post?.seoDescription ?? ""} rows={3} />
          </FormSection>
        </div>

        {/* Persistent rail */}
        <div className="admin-product-rail">
          <FormSection title="Publish">
            <SelectField name="status" label="Status" options={["draft", "published", "archived"]} defaultValue={post?.status ?? "draft"} col="col-12" />
            <TextField name="publishDate" label="Publish date" type="date" defaultValue={dateInput(post?.publishDate)} col="col-md-6" />
            <CheckField name="featured" label="Featured" defaultChecked={post?.featured ?? false} col="col-md-6" />
            <TextField name="slug" label="Slug" defaultValue={post?.slug ?? ""} col="col-12" hint="Leave blank to auto-generate." />
          </FormSection>

          <FormSection title="Organisation">
            <TextField name="category" label="Category" defaultValue={post?.category ?? ""} col="col-md-6" placeholder="Heritage" />
            <TextField name="readTime" label="Read time" defaultValue={post?.readTime ?? ""} col="col-md-6" placeholder="6 min read" />
          </FormSection>

          <FormSection title="Hero image">
            <ImageField name="heroImage" label="Hero image" value={post?.heroImage ?? ""} col="col-12" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/blog" />
    </form>
  );
}
