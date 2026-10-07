import { forwardRef, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const Table = forwardRef(({ 
  columns = [], 
  data = [], 
  keyField = 'id',
  onRowClick,
  sortable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = 'No data available',
  loading = false,
  className = '',
  ...props 
}, ref) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)

  const sortedData = sortable && sortConfig.key
    ? [...data].sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    : data

  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key) => {
    if (!sortable) return
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row)
    }
    return row[column.key]
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    } else if (e.key === 'ArrowLeft' && currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full" role="grid" aria-busy="true">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-slate-100 animate-pulse">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const tableContent = (
    <div className={`overflow-x-auto ${className}`} ref={ref} onKeyDown={handleKeyDown} tabIndex={0}>
      <table className="w-full" role="grid" {...props}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => {
              const isSortable = sortable && column.sortable !== false;

              return (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${column.align === 'text-center' ? 'text-center' : column.align === 'text-right' ? 'text-right' : 'text-left'} ${isSortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                onClick={() => handleSort(column.key)}
                aria-sort={isSortable ? (sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
              >
                <div
                  className={`flex items-center gap-1.5 ${
                    column.align === 'text-center'
                      ? 'justify-center'
                      : column.align === 'text-right'
                        ? 'justify-end'
                        : 'justify-start'
                  }`}
                >
                  {column.header}
                  {isSortable && sortConfig.key === column.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-blue-600" aria-hidden="true" />
                  )}
                </div>
              </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <tr
                key={row[keyField] || index}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick?.(row) } }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                aria-label={onRowClick ? `View ${row.name || row[keyField] || 'details'}` : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    className={`px-4 py-3 align-middle ${column.align === 'text-center' ? 'text-center' : column.align === 'text-right' ? 'text-right' : 'text-left'} ${column.nowrap === false ? '' : 'whitespace-nowrap'}`}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-700 w-20 text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return tableContent
})

Table.displayName = 'Table'

export default Table