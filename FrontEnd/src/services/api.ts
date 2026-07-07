import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@senai:token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
