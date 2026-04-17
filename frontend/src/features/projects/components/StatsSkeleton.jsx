/**
 * @component StatsSkeleton
 * @description Loading placeholder for the project stats dashboard.
 * Matches the layout of StatCard rows during data fetch.
 */
export function StatsSkeleton() {
  return (
    <div className="animate-in">
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm p-3 placeholder-glow">
              <span className="placeholder col-6 rounded mb-2" />
              <span className="placeholder col-4 rounded" style={{ height: '2rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}