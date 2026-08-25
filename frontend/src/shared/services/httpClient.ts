import axios from "axios";
import { getAccessToken } from "./accessToken";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  // El token sale de quien provee la sesión, no de localStorage: esta
  // aplicación ya no inicia sesión ni la guarda — la recibe del host, o del
  // simulador en desarrollo.
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
