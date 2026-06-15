import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Analytics
export const fetchKpis = () => api.get('/analytics/kpis').then(r => r.data);
export const fetchStatusBreakdown = () => api.get('/analytics/status-breakdown').then(r => r.data);
export const fetchCategoryBreakdown = () => api.get('/analytics/category-breakdown').then(r => r.data);
export const fetchBusinessUnitBreakdown = () => api.get('/analytics/business-unit-breakdown').then(r => r.data);
export const fetchCountryBreakdown = () => api.get('/analytics/country-breakdown').then(r => r.data);
export const fetchEnrollmentTrend = () => api.get('/analytics/enrollment-trend').then(r => r.data);
export const fetchScoreByCategory = () => api.get('/analytics/score-by-category').then(r => r.data);
export const fetchProviderBreakdown = () => api.get('/analytics/provider-breakdown').then(r => r.data);
export const fetchMandatoryBreakdown = () => api.get('/analytics/mandatory-breakdown').then(r => r.data);
export const fetchTopTrainings = () => api.get('/analytics/top-trainings').then(r => r.data);

// Filter options
export const fetchFilterOptions = () => api.get('/trainings/filter-options').then(r => r.data);

// Trainings list
export const fetchTrainings = (params?: Record<string, string>) =>
  api.get('/trainings', { params }).then(r => r.data);

// Chatbot
export const sendChatQuery = (prompt: string) =>
  api.post('/chatbot/query', { prompt }).then(r => r.data);
