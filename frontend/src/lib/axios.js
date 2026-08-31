import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://encrypta.onrender.com/api", // Added /api
  withCredentials: true,
});