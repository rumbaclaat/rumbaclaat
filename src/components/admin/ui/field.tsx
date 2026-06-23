import type { ReactNode } from "react";

type Opt = string | { value: string; label: string };

function normalize(options: Opt[]): { value: string; label: string }[] {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
}

/** Generic labelled field wrapper (column + label + control + hint). */
export function Field({
  label,
  htmlFor,
  hint,
  required,
  col = "col-12",
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  required?: boolean;
  col?: string;
  children: ReactNode;
}) {
  return (
    <div className={col}>
      <label className="form-label" htmlFor={htmlFor}>
        {label} {required && <span style={{ color: "var(--gold-hi)" }}>*</span>}
      </label>
      {children}
      {hint && <div className="form-text" style={{ color: "var(--text-dim)" }}>{hint}</div>}
    </div>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  step,
  placeholder,
  required,
  col,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  step?: string;
  placeholder?: string;
  required?: boolean;
  col?: string;
  hint?: ReactNode;
}) {
  return (
    <Field label={label} htmlFor={name} required={required} col={col} hint={hint}>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        className="form-control"
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}

export function TextareaField({
  name,
  label,
  defaultValue,
  rows = 3,
  placeholder,
  required,
  col = "col-12",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  col?: string;
  hint?: ReactNode;
}) {
  return (
    <Field label={label} htmlFor={name} required={required} col={col} hint={hint}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className="form-control"
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  blankLabel,
  required,
  col,
  hint,
}: {
  name: string;
  label: string;
  options: Opt[];
  defaultValue?: string;
  blankLabel?: string;
  required?: boolean;
  col?: string;
  hint?: ReactNode;
}) {
  return (
    <Field label={label} htmlFor={name} required={required} col={col} hint={hint}>
      <select
        id={name}
        name={name}
        className="form-select"
        defaultValue={defaultValue ?? (blankLabel ? "" : undefined)}
      >
        {blankLabel && <option value="">{blankLabel}</option>}
        {normalize(options).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked,
  col = "col-12",
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  col?: string;
}) {
  return (
    <div className={`${col} d-flex align-items-end`}>
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id={name}
          name={name}
          defaultChecked={defaultChecked ?? false}
        />
        <label className="form-check-label" htmlFor={name}>
          {label}
        </label>
      </div>
    </div>
  );
}
