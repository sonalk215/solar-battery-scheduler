const axios = require('axios');

const getWeatherRisk = async (req, res) => {
  try {
    const { lat = -37.8136, lon = 144.9631 } = req.query;
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,wind_speed_10m_max&timezone=auto`
    );

    res.json({
      forecast: response.data.daily,
      atRiskRuleThreshold: { maxWindKmh: 40, maxRainMm: 15 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getWeatherRisk };
