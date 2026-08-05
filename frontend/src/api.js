import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pfis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, cold_start_option = 'demo', selected_persona = 'Working Professional') =>
    api.post('/auth/register', { name, email, password, cold_start_option, selected_persona }),
  getMe: () => api.get('/auth/me'),
};

export const transactionAPI = {
  getExpenses: (params) => api.get('/expense', { params }),
  addExpense: (expenseData) => api.post('/expense', expenseData),
  updateExpense: (id, expenseData) => api.put(`/expense/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/expense/${id}`),

  getIncomes: (params) => api.get('/income', { params }),
  addIncome: (incomeData) => api.post('/income', incomeData),
  updateIncome: (id, incomeData) => api.put(`/income/${id}`, incomeData),
  deleteIncome: (id) => api.delete(`/income/${id}`),
};

export const autoDetectionAPI = {
  parseSMS: (sms_text) => api.post('/auto-detection/parse-sms', { sms_text }),
  getPending: () => api.get('/auto-detection/pending'),
  confirmTransaction: (id) => api.post(`/auto-detection/${id}/confirm`),
  editConfirmTransaction: (id, editData) => api.post(`/auto-detection/${id}/edit-confirm`, editData),
  ignoreTransaction: (id) => api.post(`/auto-detection/${id}/ignore`),
  getHistory: () => api.get('/auto-detection/history'),
  simulateBankAPI: (bankData) => api.post('/auto-detection/simulate-bank-api', bankData),
};

export const voiceAPI = {
  processCommand: (command_text) => api.post('/voice/process-command', { command_text }),
};

export const budgetAPI = {
  getBudgets: () => api.get('/budgets'),
  createBudget: (budgetData) => api.post('/budgets', budgetData),
  updateBudget: (id, budgetData) => api.put(`/budgets/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
};

export const reportsAPI = {
  getSummary: () => api.get('/reports/summary'),
  downloadPdf: () => api.get('/reports/download-pdf', { responseType: 'blob' }),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  updatePassword: (passwordData) => api.put('/user/password', passwordData),
  getAuditLogs: () => api.get('/user/audit-logs'),
};

export const aiAPI = {
  getAnalytics: () => api.get('/ai/analytics'),
  getPredictions: () => api.get('/ai/predict'),
  getFraudAlerts: () => api.get('/ai/fraud-alerts'),
  resolveFraudAlert: (id, status) => api.post(`/ai/fraud-alerts/${id}/resolve?status_update=${status}`),
  getRecommendations: () => api.get('/ai/recommendations'),
};

export default api;
