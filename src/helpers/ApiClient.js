import axios from 'axios';
import { PREFIX, JWT_STORAGE_KEY } from './constants';

export function createApi(navigate) {
	const api = axios.create({
		baseURL: `${PREFIX}`,
		withCredentials: true
	});

	// Добавляем токен в заголовки, если он есть
	api.interceptors.request.use((cfg) => {
		const token = localStorage.getItem(JWT_STORAGE_KEY);
		if (token) {
			cfg.headers.Authorization = `Bearer ${token}`;
		}
		return cfg;
	});

	// Если 401 → выкидываем на страницу логина
	api.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response?.status === 401) {
				localStorage.removeItem(JWT_STORAGE_KEY);
				navigate('/');
			}
			return Promise.reject(error);
		}
	);

	return api;
}
