import { type ReactNode, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, X } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  filters?: { label: string; key: keyof T; options: { label: string; value: string }[] }[];
  emptyState?: ReactNode;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T extends object>({
  columns, rows, rowKey, onRowClick, pageSize = 10,
  searchKeys, searchPlaceholder = 'Search...',
  filters, emptyState, actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...rows];

    if (search && searchKeys) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        searchKeys.some(k => String(row[k] || '').toLowerCase().includes(q))
      );
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) {
        result = result.filter(row => String((row as Record<string, unknown>)[key]) === value);
      }
    }

    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      if (col?.sortValue) {
        result.sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sortDir === 'asc' ? -1 : 1;
          if (av > bv) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [rows, search, searchKeys, activeFilters, sortKey, sortDir, columns]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setActiveFilters({});
    setSortKey(null);
    setPage(0);
  };

  const hasActiveFilters = search || Object.values(activeFilters).some(v => v);

  return (
    <div>
      {/* Search & Filters bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-200">
        {searchKeys && (
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="input-base pl-9"
            />
          </div>
        )}
        {filters && filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            <Filter size={16} />
            Filters
            {Object.values(activeFilters).filter(v => v).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-iq-primary text-white text-xs rounded-full" style={{ background: '#0d9488' }}>
                {Object.values(activeFilters).filter(v => v).length}
              </span>
            )}
          </button>
        )}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-ghost text-xs">
            <X size={14} /> Clear
          </button>
        )}
        <div className="ml-auto text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </div>
      </div>

      {/* Filter row */}
      {showFilters && filters && (
        <div className="flex flex-wrap gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 animate-slide-up">
          {filters.map(f => (
            <div key={f.key as string} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{f.label}</label>
              <select
                value={activeFilters[f.key as string] || ''}
                onChange={e => { setActiveFilters(prev => ({ ...prev, [f.key as string]: e.target.value })); setPage(0); }}
                className="input-base text-sm min-w-[140px]"
              >
                <option value="">All</option>
                {f.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {pageRows.length === 0 ? (
          emptyState || (
            <div className="py-12 text-center text-sm text-slate-400">
              No results found
            </div>
          )
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={col.sortable ? 'cursor-pointer hover:bg-slate-50' : ''}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        sortKey === col.key ? (
                          sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} className="text-slate-300" />
                        )
                      )}
                    </span>
                  </th>
                ))}
                {actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map(col => (
                    <td key={col.key} className={col.className}>{col.render(row)}</td>
                  ))}
                  {actions && (
                    <td onClick={e => e.stopPropagation()} className="text-right whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <span className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
