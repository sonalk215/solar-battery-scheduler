require('dotenv').config();

const express = require('express');
const cors = require('cors');

const installerRoute = require('./src/routes/installers');
const jobsRouter = require('./src/routes/jobs');
const weatherRouter = require('./src/routes/weather');
const paymentRoutes = require('./src/routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/installers', installerRoute);
app.use('/api/jobs', jobsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Modular Prisma backend running on port ${PORT}`)
);
