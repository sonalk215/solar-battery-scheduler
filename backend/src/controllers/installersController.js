const { prisma } = require('../db');

exports.getInstallers = async (req, res) => {
  try {
    const data = await prisma.installer.findMany({ orderBy: { name: 'asc' } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
