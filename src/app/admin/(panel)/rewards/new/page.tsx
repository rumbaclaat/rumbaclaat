import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createReward } from "../actions";

export default function NewReward() {
  return (
    <>
      <PageHeader title="New reward" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Rewards", href: "/admin/rewards" }, { label: "New" }]} />
      <form action={createReward} style={{ maxWidth: 760 }}>
        <FormSection title="Reward">
          <div className="col-md-6"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="pointsCost">Points</label><input id="pointsCost" name="pointsCost" type="number" className="form-control" defaultValue="500" /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="value">Value</label><input id="value" name="value" className="form-control" placeholder="£10" /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="type">Type</label><select id="type" name="type" className="form-select"><option value="credit">credit</option><option value="item">item</option><option value="access">access</option><option value="discount">discount</option><option value="experience">experience</option></select></div>
          <div className="col-md-4"><label className="form-label" htmlFor="availability">Availability</label><select id="availability" name="availability" className="form-select"><option value="available">available</option><option value="coming_soon">coming soon</option><option value="disabled">disabled</option></select></div>
          <div className="col-12"><label className="form-label" htmlFor="description">Description</label><textarea id="description" name="description" rows={2} className="form-control" /></div>
        </FormSection>
        <SaveBar submitLabel="Create reward" cancelHref="/admin/rewards" />
      </form>
    </>
  );
}
