interface PaginationProps {
  number: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  disabled?: boolean;
  onPageChange: (nextPage: number) => void;
  onSizeChange: (nextSize: number) => void;
}

const pageSizeOptions = [5, 10, 20, 50];

export function Pagination({
  number,
  totalPages,
  first,
  last,
  size,
  disabled = false,
  onPageChange,
  onSizeChange,
}: PaginationProps) {
  const safeTotalPages = totalPages > 0 ? totalPages : 1;
  const safeCurrentPage = totalPages > 0 ? number + 1 : 1;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Trang {safeCurrentPage}/{safeTotalPages}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Số dòng</span>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            disabled={disabled}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            value={size}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || first}
            onClick={() => onPageChange(number - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || last}
            onClick={() => onPageChange(number + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
