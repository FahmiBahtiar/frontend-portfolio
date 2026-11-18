export default function AdminLoading() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#E2F4F3] z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#6FD4E1] via-[#0891b2] to-[#6FD4E1] animate-pulse w-full" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#B9E7E6]">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#E2F4F3]/80 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-[#E2F4F3]/50 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-[#E2F4F3] rounded-xl animate-pulse" />
      </div>

      {/* Content Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-white border border-[#B9E7E6] p-6 space-y-4 shadow-xs animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-[#E2F4F3] rounded-md" />
              <div className="h-6 w-12 bg-[#E2F4F3]/60 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-[#E2F4F3]/50 rounded-md" />
              <div className="h-4 w-4/5 bg-[#E2F4F3]/40 rounded-md" />
              <div className="h-4 w-2/3 bg-[#E2F4F3]/30 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
