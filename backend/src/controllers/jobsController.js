const { prisma } = require('../db');
const { validateAssignment } = require('../services/rules');

const getJobs = async (req, res) => {
  try {
    const data = await prisma.job.findMany({
      include: { installer: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignJob = async (req, res) => {
  const { job_id, installer_id, scheduled_start, duration_blocks } = req.body;
  console.log(
    '11111come for post',
    job_id,
    installer_id,
    scheduled_start,
    duration_blocks
  );

  try {
    // Run validation rules (state, shift bounds, leave, overlap)
    await validateAssignment(
      job_id,
      installer_id,
      scheduled_start,
      duration_blocks || 1
    );

    const updated = await prisma.job.update({
      where: { job_id },
      data: {
        assigned_installer_id: installer_id,
        scheduled_start: new Date(scheduled_start),
        duration_blocks: duration_blocks
          ? parseInt(duration_blocks)
          : undefined,
        status: 'scheduled',
      },
    });

    res.json({
      message: 'Job assigned/rescheduled successfully',
      job: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getJobs, assignJob };
