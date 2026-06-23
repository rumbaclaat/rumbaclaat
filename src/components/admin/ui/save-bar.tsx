import Link from "next/link";

export default function SaveBar({
  submitLabel,
  cancelHref,
  note,
}: {
  submitLabel: string;
  cancelHref?: string;
  note?: string;
}) {
  return (
    <div className="admin-savebar">
      {note && <span className="admin-savebar-note">{note}</span>}
      {cancelHref && (
        <Link href={cancelHref} className="btn btn-ghost">
          Cancel
        </Link>
      )}
      <button type="submit" className="btn btn-gold">
        {submitLabel}
      </button>
    </div>
  );
}
