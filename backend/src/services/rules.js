const { prisma } = require('../db');

const validateAssignment = async (
  jobId,
  installer_id,
  proposedStartStr,
  durationBlocks = 1
) => {
  const job = await prisma.job.findUnique({ where: { job_id: jobId } });
  const installer = await prisma.installer.findUnique({
    where: { installer_id: installer_id },
  });

  if (!job) throw new Error('Job not found');
  if (!installer) throw new Error('Installer not found');

  // 1. State match rule
  if (job.state !== installer.state) {
    throw new Error(
      `State mismatch: Installer operates in ${installer.state}, job is in ${job.state}`
    );
  }

  const proposedStart = new Date(proposedStartStr);
  const proposedEnd = new Date(
    proposedStart.getTime() + durationBlocks * 3600 * 1000
  );

  // 2. Leave check (inclusive) - ONLY if leave dates exist
  if (installer.leave_start && installer.leave_end) {
    const leaveStart = new Date(installer.leave_start);
    const leaveEnd = new Date(installer.leave_end);
    leaveEnd.setHours(23, 59, 59, 999);

    if (proposedStart <= leaveEnd && proposedEnd >= leaveStart) {
      throw new Error(
        'Proposed time falls within approved installer leave period'
      );
    }
  }

  // 3. Working days check
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const fullDayName = dayNames[proposedStart.getUTCDay()];
  const shortDayName = fullDayName.substring(0, 3).toLowerCase();

  if (installer.working_days) {
    const workingDaysStr = installer.working_days.toLowerCase();
    const worksFull = workingDaysStr.includes(fullDayName.toLowerCase());
    const worksShort = workingDaysStr.includes(shortDayName);

    if (!worksFull && !worksShort) {
      throw new Error(
        `Installer does not work on ${fullDayName} (DB lists: "${installer.working_days}")`
      );
    }
  }

  // 4. Shift bounds check
  const propTimeStr = proposedStart.toISOString().substring(11, 16);
  const propEndTimeStr = proposedEnd.toISOString().substring(11, 16);

  if (
    propTimeStr < installer.shift_start ||
    propEndTimeStr > installer.shift_end
  ) {
    throw new Error(
      `Job window ${propTimeStr}-${propEndTimeStr} exceeds shift bounds ${installer.shift_start}-${installer.shift_end}`
    );
  }

  // 5. Time overlap check & Daily Shift Capacity Check
  const targetDateStr = proposedStart.toISOString().substring(0, 10);

  const existingJobs = await prisma.job.findMany({
    where: {
      assigned_installer_id: installer_id,
      status: { not: 'unscheduled' },
      job_id: { not: jobId },
      scheduled_start: { not: null },
    },
  });

  let dailyTotalHours = durationBlocks;
  const shiftStartHour = parseInt(installer.shift_start.split(':')[0], 10);
  const shiftEndHour = parseInt(installer.shift_end.split(':')[0], 10);
  const maxShiftHours = shiftEndHour - shiftStartHour;

  for (const existing of existingJobs) {
    const exStart = new Date(existing.scheduled_start);
    const exEnd = new Date(
      exStart.getTime() + existing.duration_blocks * 3600 * 1000
    );

    const existingDateStr = exStart.toISOString().substring(0, 10);

    // Check if on the same calendar day
    if (existingDateStr === targetDateStr) {
      dailyTotalHours += existing.duration_blocks;

      // Strict Overlap Check: Two time windows collide only if they overlap
      if (proposedStart < exEnd && proposedEnd > exStart) {
        throw new Error(
          `Time overlap detected: Conflicts with existing job ${
            existing.job_id
          } (${exStart.toISOString().substring(11, 16)} - ${exEnd
            .toISOString()
            .substring(11, 16)})`
        );
      }
    }
  }

  if (dailyTotalHours > maxShiftHours) {
    throw new Error(
      `Shift capacity exceeded: Total booked hours (${dailyTotalHours}h) exceed the installer's ${maxShiftHours}h daily window (${installer.shift_start}-${installer.shift_end}).`
    );
  }

  return { valid: true };
};

module.exports = { validateAssignment };
