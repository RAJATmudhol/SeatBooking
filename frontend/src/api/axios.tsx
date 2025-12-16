import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api/seats",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "API Error";

    return Promise.reject(new Error(message));
  }
);
