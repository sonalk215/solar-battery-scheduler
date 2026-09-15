import { FiBattery, FiMapPin, FiClock } from 'react-icons/fi';

const UnscheduledDrawer = ({ jobs }) => {
  const unscheduled = jobs.filter((j) => j.status === 'unscheduled');

  const handleDragStart = (e, job) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        job_id: job.job_id,
        duration_blocks: job.duration_blocks,
      })
    );
  };

  return (
    <aside className="w-85 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 shadow-sm">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50">
        <span className="flex items-center gap-1.5">
          <FiBattery className="text-amber-500 text-base" /> Unscheduled Queue
        </span>
        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {unscheduled.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
        {unscheduled.length === 0 ? (
          <p className="text-xs text-slate-400 text-center mt-8 italic">
            All jobs booked!
          </p>
        ) : (
          unscheduled.map((job) => (
            <div
              key={job.job_id}
              draggable
              onDragStart={(e) => handleDragStart(e, job)}
              className="bg-white border border-slate-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition shadow-2xs"
            >
              <div className="flex justify-between items-start font-semibold text-xs text-slate-900 mb-1">
                <span className="truncate pr-2">{job.customer_name}</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] shrink-0 border border-slate-200">
                  {job.state}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                <FiMapPin className="shrink-0 text-slate-400" />{' '}
                <span className="truncate">
                  {job.suburb}, {job.postcode}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[11px]">
                <span className="text-emerald-600 font-semibold">
                  {job.battery_model}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <FiClock /> {job.duration_blocks}h
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default UnscheduledDrawer;
