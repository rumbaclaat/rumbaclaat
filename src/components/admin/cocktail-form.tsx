import type { Cocktail, Product } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import ImageField from "@/components/admin/media/image-field";
import { TextField, TextareaField, SelectField } from "@/components/admin/ui/field";

function lines(v: unknown): string {
  return Array.isArray(v) ? v.join("\n") : "";
}
function pairs(v: unknown): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k} | ${val}`)
      .join("\n");
  }
  return "";
}

export default function CocktailForm({
  action,
  cocktail,
  products,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  cocktail?: Cocktail;
  products: Product[];
  submitLabel: string;
}) {
  return (
    <form action={action}>
      {cocktail && <input type="hidden" name="id" value={cocktail.id} />}

      <div className="admin-product-grid">
        {/* Main column */}
        <div className="admin-product-main">
          <FormSection title="Overview" description="The headline and intro shown at the top of the recipe.">
            <TextField name="name" label="Name" defaultValue={cocktail?.name ?? ""} required col="col-md-8" />
            <TextField name="eyebrow" label="Eyebrow" defaultValue={cocktail?.eyebrow ?? ""} col="col-md-4" placeholder="Long & refreshing" />
            <TextField name="occasion" label="Occasion" defaultValue={cocktail?.occasion ?? ""} col="col-md-6" placeholder="Party / Summer" />
            <TextareaField name="lede" label="Lede" defaultValue={cocktail?.lede ?? ""} rows={3} placeholder="A one-line description of the serve." />
            <TextareaField name="tags" label="Tags" defaultValue={(cocktail?.tags ?? []).join("\n")} rows={3} col="col-md-6" hint="One tag per line." placeholder={"Citrus\nClassic"} />
          </FormSection>

          <FormSection title="Recipe" description="One item per line. Order matters — it renders top to bottom.">
            <TextareaField name="ingredients" label="Ingredients" defaultValue={lines(cocktail?.ingredients)} rows={10} col="col-md-6" placeholder={"50ml Spiced Gold\n150ml ginger beer\n15ml fresh lime juice"} />
            <TextareaField name="method" label="Method steps" defaultValue={lines(cocktail?.method)} rows={10} col="col-md-6" placeholder={"Fill a copper mug with ice\nAdd Spiced Gold and lime\nTop with ginger beer"} />
          </FormSection>

          <FormSection title="Service notes & tips">
            <TextareaField name="serviceNotes" label="Service notes (key | value per line)" defaultValue={pairs(cocktail?.serviceNotes)} rows={6} col="col-md-6" placeholder={"Glassware | Copper mug\nGarnish | Lime & mint\nTotal time | 3 mins"} />
            <TextareaField name="bartenderTip" label="Bartender tip" defaultValue={cocktail?.bartenderTip ?? ""} rows={6} col="col-md-6" placeholder="Use a fiery ginger beer for the best contrast with the spice." />
          </FormSection>

          <FormSection title="Image">
            <ImageField name="image" label="Hero image" value={cocktail?.image ?? ""} col="col-12" hint="Upload a file or choose from the media library." />
          </FormSection>
        </div>

        {/* Persistent rail */}
        <div className="admin-product-rail">
          <FormSection title="Publish">
            <SelectField name="status" label="Status" options={["draft", "published", "archived"]} defaultValue={cocktail?.status ?? "draft"} col="col-12" />
            <SelectField name="difficulty" label="Difficulty" options={["Easy", "Medium", "Hard"]} defaultValue={cocktail?.difficulty ?? ""} blankLabel="— none —" col="col-md-6" />
            <TextField name="timeMins" label="Time (mins)" type="number" defaultValue={cocktail?.timeMins ?? ""} col="col-md-6" />
            <TextField name="slug" label="Slug" defaultValue={cocktail?.slug ?? ""} col="col-12" hint="Leave blank to auto-generate." />
          </FormSection>

          <FormSection title="Featured & ratings">
            <SelectField
              name="featuredProductId"
              label="Featured rum"
              options={products.map((p) => ({ value: p.id, label: p.name }))}
              defaultValue={cocktail?.featuredProductId ?? ""}
              blankLabel="— none —"
              col="col-12"
            />
            <TextField name="ratingAvg" label="Rating (0–5)" type="number" step="0.1" defaultValue={cocktail?.ratingAvg != null ? String(cocktail.ratingAvg) : ""} col="col-md-6" />
            <TextField name="ratingCount" label="Rating count" type="number" defaultValue={cocktail?.ratingCount ?? 0} col="col-md-6" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/cocktails" />
    </form>
  );
}
