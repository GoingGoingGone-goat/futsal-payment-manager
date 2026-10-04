export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse duration-700">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 bg-slate-800/80 rounded-xl" />
                <div className="h-4 w-72 bg-slate-800/50 rounded-lg" />
            </div>

            {/* Quick Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-5 rounded-xl border border-[hsl(var(--border))] space-y-3">
                        <div className="h-4 w-24 bg-slate-800/60 rounded" />
                        <div className="h-8 w-16 bg-slate-800/80 rounded-lg" />
                        <div className="h-3 w-32 bg-slate-800/40 rounded" />
                    </div>
                ))}
            </div>

            {/* Content Table / Main Skeleton */}
            <div className="glass-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4">
                <div className="h-10 w-full bg-slate-800/50 rounded-xl mb-6" />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 w-full bg-slate-800/40 rounded-xl flex items-center px-4 justify-between">
                        <div className="h-4 w-32 bg-slate-800/60 rounded" />
                        <div className="h-4 w-24 bg-slate-800/60 rounded" />
                        <div className="h-4 w-16 bg-slate-800/60 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
