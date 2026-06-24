"use client";

import { useState } from "react";

const TYPES = [
  { value: "rum", label: "Rum" },
  { value: "apparel", label: "Clothing" },
  { value: "cap", label: "Cap / accessory" },
  { value: "gift_card", label: "Gift card" },
];

/** Type-aware attribute editor: the fields shown change with the product type
 *  (rum attributes vs clothing attributes), matching the storefront. */
export default function ProductAttributes({ initialType, d }: { initialType: string; d: Record<string, string> }) {
  const [type, setType] = useState(initialType || "rum");
  const isRum = type === "rum";
  const isApparel = type === "apparel" || type === "cap";

  return (
    <section className="admin-form-section">
      <div className="admin-form-section-head">
        <h2 className="admin-form-section-title">Type &amp; attributes</h2>
        <p className="admin-form-section-desc">Choose the product type — the attributes below adapt to match.</p>
      </div>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label" htmlFor="type">Product type</label>
          <select id="type" name="type" className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {isRum && (
          <>
            <div className="col-md-4"><label className="form-label" htmlFor="abv">ABV (%)</label><input id="abv" name="abv" type="number" step="0.1" className="form-control" defaultValue={d.abv} placeholder="40" /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="volume">Volume</label><input id="volume" name="volume" className="form-control" defaultValue={d.volume} placeholder="70cl" /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="origin">Origin</label><input id="origin" name="origin" className="form-control" defaultValue={d.origin} placeholder="Jamaica" /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="ageStatement">Age statement</label><input id="ageStatement" name="ageStatement" className="form-control" defaultValue={d.ageStatement} placeholder="8 years" /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="caskType">Cask type</label><input id="caskType" name="caskType" className="form-control" defaultValue={d.caskType} placeholder="American oak" /></div>
            <div className="col-12"><label className="form-label" htmlFor="tastingNotes">Tasting notes</label><textarea id="tastingNotes" name="tastingNotes" rows={2} className="form-control" defaultValue={d.tastingNotes} placeholder="Nose: vanilla & oak · Palate: spiced toffee · Finish: long, warming" /></div>
          </>
        )}

        {isApparel && (
          <>
            <div className="col-md-4"><label className="form-label" htmlFor="material">Material</label><input id="material" name="material" className="form-control" defaultValue={d.material} placeholder="100% organic cotton" /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="gsm">Weight (GSM)</label><input id="gsm" name="gsm" className="form-control" defaultValue={d.gsm} placeholder="220 GSM" /></div>
            <div className="col-md-4"><label className="form-label" htmlFor="fit">Fit</label><input id="fit" name="fit" className="form-control" defaultValue={d.fit} placeholder="Regular / Oversized" /></div>
            <div className="col-12"><label className="form-label" htmlFor="careInstructions">Care instructions</label><input id="careInstructions" name="careInstructions" className="form-control" defaultValue={d.careInstructions} placeholder="Machine wash 30°, do not tumble dry" /></div>
            <p className="td-muted col-12 mb-0" style={{ fontSize: ".8rem" }}>Sizes &amp; colours are managed as Variants below.</p>
          </>
        )}

        {type === "gift_card" && (
          <div className="col-12"><p className="td-muted mb-0">Gift cards use the base price as the amount — no physical attributes.</p></div>
        )}
      </div>
    </section>
  );
}
