'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onCreate?: () => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  title?: string;
  itemsPerPage?: number;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onCreate,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found',
  title,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = String((a as Record<string, unknown>)[sortKey]);
    const bValue = String((b as Record<string, unknown>)[sortKey]);
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          {title && <h2 className="text-2xl font-bold text-[#0c282d]">{title}</h2>}
          <p className="text-[#527d85] text-sm mt-1 font-medium">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#527d85]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#B9E7E6] text-[#0c282d] placeholder:text-[#527d85] focus:outline-none focus:border-[#6FD4E1] shadow-sm font-medium transition-all"
            />
          </div>

          {/* Create Button */}
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#B9E7E6] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#B9E7E6] bg-[#E2F4F3]/60">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                    className={`px-6 py-4 text-left text-sm font-bold text-[#0c282d] ${
                      column.sortable ? 'cursor-pointer hover:text-[#0891b2] transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortKey === column.key && (
                        <span className="text-[#0891b2]">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#0c282d]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-12 text-center text-[#527d85] font-medium"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <motion.tr
                    key={`${item.id || 'unknown'}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#B9E7E6]/40 hover:bg-[#E2F4F3]/30 transition-colors"
                  >
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-6 py-4 text-[#1e4a52] font-medium">
                        {column.render
                          ? column.render(item)
                          : String((item as Record<string, unknown>)[column.key as string])}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="p-2 rounded-lg text-[#527d85] hover:text-[#0891b2] hover:bg-[#E2F4F3] transition-all"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="p-2 rounded-lg text-[#527d85] hover:text-[#0891b2] hover:bg-[#E2F4F3] transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="p-2 rounded-lg text-[#527d85] hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#B9E7E6] bg-white">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2F4F3]/60 hover:bg-[#E2F4F3] text-[#0c282d] font-bold border border-[#B9E7E6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === currentPage
                      ? 'bg-[#6FD4E1] text-[#0c282d] shadow-sm'
                      : 'bg-white hover:bg-[#E2F4F3] text-[#527d85] border border-[#B9E7E6]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2F4F3]/60 hover:bg-[#E2F4F3] text-[#0c282d] font-bold border border-[#B9E7E6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
