import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://10.238.141.178:4000";

console.log("🌐 Conectando al backend en:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;

