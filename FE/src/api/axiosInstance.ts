// src/api/axiosInstance.ts
import axios, { AxiosRequestConfig } from "axios";

const apiInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// אפשרות להוסיף Interceptor לטוקן בעתיד
// apiInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// פונקציות עזר ל-HTTP Methods
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiInstance.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiInstance.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiInstance.put<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiInstance.delete<T>(url, config).then((res) => res.data),
};

export default api;
