export default function AnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-200 rounded-xl h-48" />
        <div className="bg-gray-200 rounded-xl h-48" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-200 rounded-xl h-40" />
        <div className="bg-gray-200 rounded-xl h-40" />
      </div>

      {/* Bottom */}
      <div className="bg-gray-200 rounded-xl h-56" />

      <div className="text-center text-gray-500 text-sm pt-2">
        Analyzing repository + running AI... this takes ~10 seconds
      </div>
    </div>
  );
}