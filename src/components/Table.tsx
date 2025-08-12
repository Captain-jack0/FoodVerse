import React, { useMemo, useState } from "react";
import "../styles/Table.css";

export type Align = "left" | "center" | "right";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  width?: number | string;
  align?: Align;
  sortable?: boolean;
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string | number;
  className?: string;
  size?: "sm" | "md" | "lg";
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  emptyText?: string;
  pagination?: { pageSize?: number };
  defaultSort?: { key: string; direction: "asc" | "desc" };
  onSortChange?: (key: string, direction: "asc" | "desc") => void; // dış kontrol istersen
  center?: boolean;
  summary?: string;
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function get(obj: any, path: string | keyof any) {
  if (typeof path !== "string") return obj[path as any];
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  className,
  size = "md",
  striped = true,
  hoverable = true,
  stickyHeader,
  emptyText = "Kayıt bulunamadı",
  pagination,
  defaultSort,
  summary,
  onSortChange,
}: TableProps<T>) {
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const pageSize = pagination?.pageSize ?? data.length; // varsayılan: sayfalama yok

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const { key, direction } = sort;
    const sign = direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const va = get(a as any, key);
      const vb = get(b as any, key);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * sign;
      if (vb == null) return 1 * sign;
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * sign;
      return String(va).localeCompare(String(vb)) * sign;
    });
  }, [data, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    if (pageSize >= sortedData.length) return sortedData;
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    const key = String(col.key);
    setPage(1);
    setSort((prev) => {
      const next: { key: string; direction: "asc" | "desc" } =
        prev?.key === key
          ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
          : { key, direction: "asc" };
      onSortChange?.(next.key, next.direction);
      return next;
    });
  };

  return (
    <div className={cx("table-wrapper", className)}>
      <table
        className={cx(
          "my-table",
          `table-${size}`,
          striped && "table-striped",
          hoverable && "table-hover",
          stickyHeader && "table-sticky"
        )}
      >
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === String(c.key);
              const dir = active ? sort?.direction : undefined;
              return (
                <th
                  key={String(c.key)}
                  style={{ width: c.width }}
                  className={cx(
                    c.align && `cell-${c.align}`,
                    c.sortable && "th-sortable",
                    active && `th-sort-${dir}`
                  )}
                  onClick={() => handleSort(c)}
                  title={c.sortable ? "Sırala" : undefined}
                >
                  <span className="th-content">
                    {c.header}
                    {c.sortable && (
                      <span className="th-caret" aria-hidden>
                        ▴▾
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td className="table-empty" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            <>
              {pageData.map((row, rIdx) => (
                <tr key={String(rowKey ? rowKey(row, rIdx) : rIdx)}>
                  {columns.map((c) => (
                    <td
                      key={String(c.key)}
                      className={c.align && `cell-${c.align}`}
                    >
                      {c.render
                        ? c.render(row, rIdx)
                        : String(get(row as any, c.key))}
                    </td>
                  ))}
                </tr>
              ))}
              {summary /* 👈 burada, son satır olarak */}
            </>
          )}
        </tbody>
      </table>

      {pageSize < sortedData.length && (
        <div className="table-pagination">
          <button
            type="button"
            className="tp-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            ←
          </button>
          <span className="tp-info">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className="tp-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
