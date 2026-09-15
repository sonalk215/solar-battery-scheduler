import axios from 'axios';
const API_BASE = 'http://localhost:4000/api';

export const apiClient = {
  getInstallers: () => axios.get(`${API_BASE}/installers`),
  getJobs: () => axios.get(`${API_BASE}/jobs`),
  assignJob: (payload) => axios.post(`${API_BASE}/jobs/assign`, payload),
  getWeatherRisk: () => axios.get(`${API_BASE}/weather/risk`),
};
