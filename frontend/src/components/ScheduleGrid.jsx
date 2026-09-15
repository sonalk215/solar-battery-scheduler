import { FiAlertTriangle } from 'react-icons/fi';

const TWO_WEEK_DAYS = [
  '2026-09-28',
  '2026-09-29',
  '2026-09-30',
  '2026-10-01',
  '2026-10-02',
  '2026-10-05',
  '2026-10-06',
  '2026-10-07',
  '2026-10-08',
  '2026-10-09',
];

const ScheduleGrid = ({ installers, jobs, weatherRisk, onDropJob }) => {
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, installerId, dateStr) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const installer = installers.find((i) => i.installer_id === installerId);

      // Find all existing jobs for this installer on this specific date
      const existingDayJobs = jobs.filter(
        (j) =>
          j.assigned_installer_id === installerId &&
          j.scheduled_start &&
          j.scheduled_start.startsWith(dateStr)
      );

      // Determine the start time: default to shift start, or the end time of the latest job on that day
      let startTime = installer?.shift_start || '08:00:00';
      if (existingDayJobs.length > 0) {
        // Find the latest end time among existing jobs on this day
        let latestEndMinutes = 0;
        existingDayJobs.forEach((j) => {
          const jStart = new Date(j.scheduled_start);
          const jEndMinutes =
            jStart.getUTCHours() * 60 +
            jStart.getUTCMinutes() +
            j.duration_blocks * 60;
          if (jEndMinutes > latestEndMinutes) {
            latestEndMinutes = jEndMinutes;
          }
        });

        const endHour = Math.floor(latestEndMinutes / 60)
          .toString()
          .padStart(2, '0');
        const endMin = (latestEndMinutes % 60).toString().padStart(2, '0');
        startTime = `${endHour}:${endMin}:00`;
      }

      onDropJob({
        job_id: data.job_id,
        installer_id: installerId,
        scheduled_start: new Date(`${dateStr}T${startTime}Z`).toISOString(),
        duration_blocks: data.duration_blocks || 1,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleJobDragStart = (e, job) => {
    console.log('drag start', job.job_id, job);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        job_id: job.job_id,
        duration_blocks: job.duration_blocks,
      })
    );
  };

  const isWeatherRiskDay = (dateStr) => {
    if (!weatherRisk?.time) return false;
    const idx = weatherRisk.time.indexOf(dateStr);
    if (idx === -1) return false;
    const wind = weatherRisk.wind_speed_10m_max?.[idx] || 0;
    const rain = weatherRisk.precipitation_sum?.[idx] || 0;
    return wind > 40 || rain > 15;
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-5">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 z-20">
              <th className="p-3.5 sticky left-0 bg-slate-50 z-30 border-r border-slate-200 w-48 font-semibold">
                Installer / Base
              </th>
              {TWO_WEEK_DAYS.map((d) => {
                const atRisk = isWeatherRiskDay(d);
                return (
                  <th
                    key={d}
                    className={`p-3.5 min-w-[140px] border-l border-slate-200 font-medium ${
                      atRisk ? 'bg-amber-50 text-amber-800' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{d}</span>
                      {atRisk && (
                        <FiAlertTriangle
                          className="text-amber-500"
                          title="Weather risk threshold exceeded (>40km/h / >15mm)"
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {installers.map((inst) => (
              <tr
                key={inst.installer_id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-200 align-top">
                  <div className="font-semibold text-slate-900 text-xs">
                    {inst.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {inst.state} • {inst.home_base}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {inst.shift_start}–{inst.shift_end}
                  </div>
                  {inst.leave_start && (
                    <div className="text-[10px] text-amber-700 mt-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Leave: {inst.leave_start}–{inst.leave_end}
                    </div>
                  )}
                </td>

                {TWO_WEEK_DAYS.map((dateStr) => {
                  const dayJobs = jobs.filter(
                    (j) =>
                      j.assigned_installer_id === inst.installer_id &&
                      j.scheduled_start &&
                      j.scheduled_start.startsWith(dateStr)
                  );

                  return (
                    <td
                      key={dateStr}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, inst.installer_id, dateStr)}
                      className="p-1.5 border-l border-slate-200 align-top min-h-[85px] bg-slate-50/30 transition-colors hover:bg-slate-100/50"
                    >
                      {dayJobs.map((j) => (
                        <div
                          key={j.job_id}
                          draggable
                          onDragStart={(e) => handleJobDragStart(e, j)}
                          className="bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-md text-[11px] cursor-grab active:cursor-grabbing hover:bg-blue-100 mb-1.5 shadow-2xs transition"
                        >
                          <div className="font-semibold truncate text-blue-950">
                            {j.customer_name}
                          </div>
                          <div className="text-[10px] text-blue-700/80 truncate mt-0.5">
                            {j.job_id} • {j.suburb} ({j.duration_blocks}h)
                          </div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleGrid;
