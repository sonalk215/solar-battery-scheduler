import { useState } from 'react';
import { FiAlertTriangle, FiCalendar, FiUser } from 'react-icons/fi';
import JobModal from './JobModal';

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
  const [selectedMobileDate, setSelectedMobileDate] = useState(
    TWO_WEEK_DAYS[0]
  );
  const [selectedJob, setSelectedJob] = useState(null); // Modal state

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, installerId, dateStr) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const installer = installers.find((i) => i.installer_id === installerId);

      const existingDayJobs = jobs.filter(
        (j) =>
          j.assigned_installer_id === installerId &&
          j.scheduled_start &&
          j.scheduled_start.startsWith(dateStr)
      );

      let startTime = installer?.shift_start || '08:00:00';
      if (existingDayJobs.length > 0) {
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
    <div className="flex-1 w-full bg-slate-100 p-3 sm:p-5 flex flex-col overflow-hidden relative">
      {/* ================= MOBILE VIEW (< 768px) ================= */}
      <div className="block md:hidden flex-1 flex flex-col space-y-3">
        <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
          {TWO_WEEK_DAYS.map((d) => {
            const atRisk = isWeatherRiskDay(d);
            const isSelected = selectedMobileDate === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedMobileDate(d)}
                className={`px-3 py-2 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : atRisk
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <FiCalendar className="w-3.5 h-3.5" />
                <span>{d}</span>
                {atRisk && (
                  <FiAlertTriangle className="w-3 h-3 text-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        {isWeatherRiskDay(selectedMobileDate) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded-lg flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Weather warning active for {selectedMobileDate} (&gt;40km/h wind
              or &gt;15mm rain).
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {installers.map((inst) => {
            const dayJobs = jobs.filter(
              (j) =>
                j.assigned_installer_id === inst.installer_id &&
                j.scheduled_start &&
                j.scheduled_start.startsWith(selectedMobileDate)
            );

            return (
              <div
                key={inst.installer_id}
                onDragOver={handleDragOver}
                onDrop={(e) =>
                  handleDrop(e, inst.installer_id, selectedMobileDate)
                }
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                      <FiUser className="w-3 h-3 text-slate-400" />
                      {inst.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {inst.state} • {inst.home_base} ({inst.shift_start}–
                      {inst.shift_end})
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {dayJobs.length} job{dayJobs.length === 1 ? '' : 's'}
                  </span>
                </div>

                {inst.leave_start && (
                  <div className="text-[10px] text-amber-700 mb-2 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                    Leave Scheduled: {inst.leave_start}–{inst.leave_end}
                  </div>
                )}

                <div className="space-y-2 min-h-[50px]">
                  {dayJobs.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic text-center py-2 border border-dashed border-slate-200 rounded-lg">
                      No jobs scheduled. Drop jobs here.
                    </div>
                  ) : (
                    dayJobs.map((j) => (
                      <div
                        key={j.job_id}
                        draggable
                        onDragStart={(e) => handleJobDragStart(e, j)}
                        onClick={() => setSelectedJob(j)}
                        className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-lg text-xs shadow-2xs cursor-pointer hover:bg-blue-100 transition"
                      >
                        <div className="font-semibold text-blue-950">
                          {j.customer_name}
                        </div>
                        <div className="text-[11px] text-blue-700 mt-0.5">
                          {j.job_id} • {j.suburb} ({j.duration_blocks}h block)
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= DESKTOP/TABLET GRID VIEW (>= 768px) ================= */}
      <div className="hidden md:flex flex-1 border border-slate-200 rounded-xl bg-white shadow-sm overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 z-20">
              <th className="p-3.5 sticky left-0 bg-slate-50 z-30 border-r border-slate-200 w-44 font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Installer / Base
              </th>
              {TWO_WEEK_DAYS.map((d) => {
                const atRisk = isWeatherRiskDay(d);
                return (
                  <th
                    key={d}
                    className={`p-3.5 min-w-[130px] border-l border-slate-200 font-medium ${
                      atRisk ? 'bg-amber-50 text-amber-800' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{d}</span>
                      {atRisk && (
                        <FiAlertTriangle
                          className="text-amber-500 shrink-0 ml-1"
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
                <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-200 align-top shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
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
                          onClick={() => setSelectedJob(j)}
                          className="bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-md text-[11px] cursor-pointer hover:bg-blue-100 mb-1.5 shadow-2xs transition"
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

      {/* Render the clean separate modal component */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default ScheduleGrid;
