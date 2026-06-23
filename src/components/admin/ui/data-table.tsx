"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Filter = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
};

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export default function DataTable({
  searchPlaceholder = "Search…",
  searchParam = "q",
  pageParam = "page",
  filters = [],
  total,
  pageSize,
  resultsLabel = "results",
  emptyTitle = "Nothing here yet",
  emptyMessage,
  emptyAction,
  children,
}: {
  searchPlaceholder?: string;
  searchParam?: string;
  pageParam?: string;
  filters?: Filter[];
  total: number;
  pageSize: number;
  resultsLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const currentQ = sp.get(searchParam) ?? "";
  const [term, setTerm] = useState(currentQ);
  useEffect(() => {
    setTerm(currentQ);
  }, [currentQ]);

  const page = Math.max(1, parseInt(sp.get(pageParam) ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushWith(mut: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    pushWith((p) => {
      if (term) p.set(searchParam, term);
      else p.delete(searchParam);
      p.delete(pageParam);
    });
  }

  function onFilter(name: string, value: string) {
    pushWith((p) => {
      if (value) p.set(name, value);
      else p.delete(name);
      p.delete(pageParam);
    });
  }

  function goPage(n: number) {
    pushWith((p) => {
      if (n <= 1) p.delete(pageParam);
      else p.set(pageParam, String(n));
    });
  }

  const hasQuery = Boolean(currentQ) || filters.some((f) => sp.get(f.name));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="admin-card p-0" style={{ overflow: "hidden" }}>
      <div className="admin-toolbar">
        <form className="admin-toolbar-search input-group input-group-sm" role="search" onSubmit={onSearch}>
          <span className="input-group-text" aria-hidden="true">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control"
            type="search"
            value={term}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(e) => setTerm(e.target.value)}
          />
        </form>

        {filters.map((f) => (
          <select
            key={f.name}
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            aria-label={f.label}
            value={sp.get(f.name) ?? ""}
            onChange={(e) => onFilter(f.name, e.target.value)}
          >
            <option value="">{f.label}: all</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        <span className="admin-toolbar-count">
          {total} {resultsLabel}
        </span>
      </div>

      {total === 0 ? (
        <div className="admin-empty">
          <i className="bi bi-inbox" aria-hidden="true" />
          <div className="admin-empty-title">{hasQuery ? "No matches" : emptyTitle}</div>
          <div>{hasQuery ? "Try a different search or filter." : emptyMessage}</div>
          {!hasQuery && emptyAction}
        </div>
      ) : (
        <>
          <div className="table-responsive">{children}</div>
          {totalPages > 1 && (
            <div className="admin-pager">
              <span className="admin-pager-info">
                Showing {from}–{to} of {total}
              </span>
              <nav aria-label="Pagination">
                <ul className="pagination pagination-sm">
                  <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      type="button"
                      onClick={() => goPage(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                    >
                      ‹
                    </button>
                  </li>
                  {pageWindow(page, totalPages).map((n, i) =>
                    n === "…" ? (
                      <li key={`e${i}`} className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    ) : (
                      <li key={n} className={`page-item ${n === page ? "active" : ""}`}>
                        <button
                          className="page-link"
                          type="button"
                          onClick={() => goPage(n)}
                          aria-current={n === page ? "page" : undefined}
                        >
                          {n}
                        </button>
                      </li>
                    )
                  )}
                  <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      type="button"
                      onClick={() => goPage(page + 1)}
                      disabled={page >= totalPages}
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
