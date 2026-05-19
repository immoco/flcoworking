import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const fetchAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const fetchAdminBookings = async (filters = {}) => {
  const response = await api.get('/admin/bookings', { params: filters });
  return response.data;
};

export const fetchBranches = async () => {
  const response = await api.get('/branches');
  return response.data;
};

export const createBranch = async (payload) => {
  const response = await api.post('/branches', payload);
  return response.data;
};

export const updateBranch = async (id, payload) => {
  const response = await api.put(`/branches/${id}`, payload);
  return response.data;
};

export const disableBranch = async (id) => {
  const response = await api.delete(`/branches/${id}`);
  return response.data;
};

export const fetchSpaces = async (filters = {}) => {
  const response = await api.get('/spaces', { params: filters });
  return response.data;
};

export const createSpace = async (payload) => {
  const response = await api.post('/spaces', payload);
  return response.data;
};

export const updateSpace = async (id, payload) => {
  const response = await api.put(`/spaces/${id}`, payload);
  return response.data;
};

export const fetchAdminCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export const fetchAdminRevenue = async () => {
  const response = await api.get('/admin/revenue');
  return response.data;
};

export const fetchPaymentsForBooking = async (bookingId) => {
  const response = await api.get(`/payments/booking/${bookingId}`);
  return response.data;
};

export const createPayment = async (payload) => {
  const response = await api.post('/payments', payload);
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.patch(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

export const fetchDocumentsForBooking = async (bookingId) => {
  const response = await api.get(`/documents/booking/${bookingId}`);
  return response.data;
};

export const verifyDocument = async (id) => {
  const response = await api.patch(`/documents/${id}/verify`);
  return response.data;
};

export const createNocRequest = async (payload) => {
  const response = await api.post('/noc/request', payload);
  return response.data;
};

export const fetchNocRequestForBooking = async (bookingId) => {
  const response = await api.get(`/noc/booking/${bookingId}`);
  return response.data;
};

export const generateNocPdf = async (id) => {
  const response = await api.post(`/noc/${id}/generate`);
  return response.data;
};

export const downloadNocPdf = async (id) => {
  const response = await api.get(`/noc/${id}/download`, { responseType: 'blob' });
  return response.data;
};

export const fetchBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export default api;
