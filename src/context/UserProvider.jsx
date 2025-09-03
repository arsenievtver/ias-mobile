import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi.hook';
import UserContext from './UserContext';

const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState(false);

	const api = useApi(); // создаём API клиент с токеном

	const loadUser = useCallback(async () => {
		setIsLoading(true);
		try {
			const { data } = await api.get('/users/me');
			setUser(data);
			setAuthError(false);
		} catch (e) {
			console.error('Не удалось загрузить пользователя', e);
			setUser(null);
			setAuthError(true);
		} finally {
			setIsLoading(false);
		}
	}, [api]);

	useEffect(() => {
		if (localStorage.getItem('jwt_token')) {
			loadUser();
		}
	}, [loadUser]);

	return (
		<UserContext.Provider value={{ user, setUser, loadUser, isLoading, authError }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
