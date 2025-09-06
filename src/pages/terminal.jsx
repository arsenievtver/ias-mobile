import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/button/Button.jsx';
import InputForm from '../components/Input/Input.jsx';
import QRScanner from '../components/QRscanner/QRScanner';
import useApi from '../hooks/useApi.hook';
import useUser from '../context/useUser';
import { JWT_STORAGE_KEY, loginUrl } from '../helpers/constants';
import Keyboard from "react-simple-keyboard";
import "simple-keyboard/build/css/index.css";
import './terminal.css'

const Terminal = () => {
	const api = useApi();
	const navigate = useNavigate();
	const { loadUser } = useUser();

	const [activeMode, setActiveMode] = useState(null); // 'tabNumber' | 'qr'
	const [tabNumber, setTabNumber] = useState('');
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);

	const doLogin = async (login) => {
		if (busy) return;
		setBusy(true);
		setMessage('');

		try {
			const params = new URLSearchParams();
			params.append('grant_type', 'password');
			params.append('username', login.trim());
			params.append('password', '1111'); // фиксированный пароль
			params.append('scope', '');
			params.append('client_id', 'string');
			params.append('client_secret', 'string');

			console.log('Отправка запроса на логин:', login);

			const { data } = await api.post(loginUrl, params, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					accept: 'application/json'
				}
			});

			localStorage.setItem(JWT_STORAGE_KEY, data.access_token);

			await loadUser();

			setMessage(`Успех! Добро пожаловать.`);
			navigate('/lk');
		} catch (e) {
			const errMsg = e.response?.data?.detail || e.response?.data?.message || 'Ошибка авторизации';
			setMessage(`Ошибка авторизации: ${errMsg}`);
			console.error('Ошибка авторизации:', e.response?.data || e.message);
		} finally {
			setBusy(false);
		}
	};

	const handleTabLogin = () => {
		if (!tabNumber) return;
		const login = `1@${tabNumber.trim()}.ru`;
		console.log('Войти по табельному номеру:', login);
		doLogin(login);
	};

	const handleQRScan = (data) => {
		const raw = typeof data === 'string' ? data : data?.text;
		if (raw && raw.trim() !== '') {
			const login = raw.trim();
			console.log('Войти по QR:', login);
			doLogin(login);
			setActiveMode(null);
		} else {
			console.warn('Пустой результат сканирования или ошибка');
		}
	};

	return (
		<div className="terminal-container">
			<h2 style={{ font: 'var(--font_default)', color: 'var(--color_text_default)' }}>
				Выберите способ идентификации
			</h2>

			<div className="button-group">
				<Button
					className={activeMode === 'tabNumber' ? 'active' : ''}
					onClick={() => setActiveMode('tabNumber')}
				>
					по табельному номеру
				</Button>

				<Button
					className={activeMode === 'qr' ? 'active' : ''}
					onClick={() => setActiveMode('qr')}
				>
					по QR коду
				</Button>
			</div>

			{activeMode === 'tabNumber' && (
				<div className="form-block">
					<h3>Введите Ваш табельный номер:</h3>
					<InputForm
						type="text"
						placeholder="Табельный номер"
						value={tabNumber}
						onChange={(e) => setTabNumber(e.target.value)}
					/>
					<Keyboard
						layout={{ default: ["1 2 3", "4 5 6", "7 8 9", "0 {bksp}"] }}
						display={{ "{bksp}": "⌫" }} // здесь заменяем текст на значок
						onChange={setTabNumber}
						onKeyPress={(button) => {
							if (button === "{bksp}") {
								setTabNumber(prev => prev.slice(0, -1));
							}
						}}
					/>
					<Button onClick={handleTabLogin} disabled={busy}>
						{busy ? 'Входим…' : 'Войти'}
					</Button>
				</div>
			)}

			{activeMode === 'qr' && (
				<div className="form-block">
					<h3>Отсканируйте QR-код:</h3>
					<QRScanner onScan={handleQRScan} />
				</div>
			)}

			{message && <div className="server-response">{message}</div>}
		</div>
	);
};

export default Terminal;
