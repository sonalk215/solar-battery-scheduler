const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { prisma } = require('./db');

const seedData = async () => {
  try {
    await prisma.job.deleteMany();
    await prisma.installer.deleteMany();

    const installers = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../installers.csv'))
        .pipe(csv())
        .on('data', (row) => installers.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of installers) {
      await prisma.installer.create({
        data: {
          installer_id: row.installer_id,
          name: row.name,
          phone: row.phone,
          state: row.state,
          home_base: row.home_base,
          working_days: row.working_days,
          shift_start: row.shift_start,
          shift_end: row.shift_end,
          leave_start: row.leave_start ? new Date(row.leave_start) : null,
          leave_end: row.leave_end ? new Date(row.leave_end) : null,
        },
      });
    }

    const jobs = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../jobs.csv'))
        .pipe(csv())
        .on('data', (row) => jobs.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of jobs) {
      await prisma.job.create({
        data: {
          job_id: row.job_id,
          customer_name: row.customer_name,
          customer_phone: row.customer_phone,
          customer_email: row.customer_email,
          site_address: row.site_address,
          suburb: row.suburb,
          state: row.state,
          postcode: row.postcode,
          job_type: row.job_type,
          battery_model: row.battery_model,
          scheduled_start: row.scheduled_start
            ? new Date(row.scheduled_start)
            : null,
          duration_blocks: row.duration_blocks
            ? parseInt(row.duration_blocks)
            : 1,
          status: row.status || 'unscheduled',
          assigned_installer_id: row.assigned_installer_id || null,
          notes: row.notes || '',
        },
      });
    }

    console.log('Seeded via Prisma successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Prisma seed error:', err);
    process.exit(1);
  }
};

seedData();
