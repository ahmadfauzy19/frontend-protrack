import axios from "axios";

// const API_URL = "http://localhost:8001/api";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("authToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		// Tangani error pada konfigurasi request
		return Promise.reject(error);
	}
);

export default api;
