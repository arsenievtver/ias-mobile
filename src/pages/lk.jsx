import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../context/useUser';
import {InstructionValidPatchUrl, TestListGetUrl} from "../helpers/constants";
import useApi from '../hooks/useApi.hook'; // добавлено: минимально используем имеющийся API-клиент
import './lk.css';
import PdfModal from "../components/Pdfviewer/PdfModal.jsx";
import Button from "../components/button/Button.jsx";
import { FaRunning } from "react-icons/fa";


const LK = () => {
	const navigate = useNavigate();
	const { user, isLoading, authError, loadUser } = useUser(); // добавил loadUser
	const api = useApi(); // добавлен api клиент

	const [selectedInstruction, setSelectedInstruction] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAcknowledging, setIsAcknowledging] = useState(false); // состояние для кнопки "Ознакомиться"

	// 🚪 Выход
	const handleLogout = () => {
		localStorage.removeItem("jwt_token");
		navigate("/");
	};

	const openInstruction = (instruction) => {
		setSelectedInstruction(instruction);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedInstruction(null);
	};

	// обработчик «Ознакомиться» — делает PATCH, потом alert, закрывает модалку и обновляет user
	const handleAcknowledge = async () => {
		if (!selectedInstruction) return;
		setIsAcknowledging(true);
		try {
			// ВНИМАНИЕ: путь взят точно как ты указал в константе: /journals/update_journal/:id
			await api.patch(InstructionValidPatchUrl(selectedInstruction.id));
			alert("Обязательно подойдите в службу охраны труда для подписания бумажного документа!");
			closeModal();
			// обновляем данные пользователя через loadUser, если он доступен
			if (typeof loadUser === 'function') {
				await loadUser();
			}
		} catch (err) {
			console.error("Ошибка при подтверждении ознакомления:", err);
			alert("Не удалось отправить подтверждение. Попробуйте снова.");
		} finally {
			setIsAcknowledging(false);
		}
	};

	const handleTestClick = async (instruction) => {
		if (!instruction?.id) return;
		try {
			const res = await api.get(TestListGetUrl(instruction.id));
			const tests = res.data.data || []; // берем строго data
			if (tests.length === 1) {
				// если тест один, сразу на страницу Test и передаем id_test через state
				navigate("/test", { state: { testId: tests[0].id, instructionTitle: instruction.title } });
			} else if (tests.length > 1) {
				// если несколько — на список тестов, передаем instructionId для запроса
				navigate("/test_list", { state: { instructionId: instruction.id, title: instruction.title } });
			} else {
				alert("Тестов для данной инструкции нет.");
			}
		} catch (err) {
			console.error("Ошибка получения списка тестов:", err);
			alert("Не удалось загрузить тесты. Попробуйте позже.");
		}
	};


	// 📝 Фамилия + инициалы
	const formatFullName = (u) => {
		if (!u) return "";
		const initials = [
			u.name ? u.name[0].toUpperCase() + "." : "",
			u.father_name ? u.father_name[0].toUpperCase() + "." : "",
		].join(" ");
		return `${u.last_name} ${initials}`.trim();
	};

	if (isLoading) return <div>Загрузка данных...</div>;
	if (authError) return <div>Ошибка загрузки пользователя. Попробуйте войти снова.</div>;
	if (!user) return <div>Нет данных пользователя.</div>;

	// 📌 Сортировка инструкций: invalid → valid
	const sortedInstructions = [...(user.instructions || [])].sort((a, b) => {
		const aValid = a.journal?.valid ? 1 : 0;
		const bValid = b.journal?.valid ? 1 : 0;
		return aValid - bValid; // 0 (invalid) пойдет раньше 1 (valid)
	});

	return (
		<div className="lk-container" style={{ position: "relative" }}>
			<div className="head-lk">
				<FaRunning className="logout-icon" onClick={handleLogout} />
				<h2>Личный кабинет</h2>
			</div>

			<div className="user-info">
				<p><strong>ФИО:</strong> {formatFullName(user)}</p>
				<p><strong></strong> {user.profession?.title}</p>
				<p><strong></strong> {user.division?.title}</p>
				<p><strong>Табельный номер:</strong> {user.number}</p>
			</div>

			<h3>Локальные нормативные акты:</h3>
			<div className="instructions-grid">
				{sortedInstructions.length > 0 ? (
					sortedInstructions.map((ins) => (
						<div key={ins.id} className="instruction-wrapper" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '8px' }}>

							{/* Кликаябельная карточка инструкции */}
							<div
								className="instruction-card"
								onClick={() => openInstruction(ins)}
								title={ins.title}
								style={{ cursor: 'pointer', padding: '4px 0' }}
							>
								{ins.journal?.valid ? (
									<span className="status valid"> ✅ </span>
								) : (
									<span className="status invalid"> ⚠️ Ознакомиться </span>
								)}
								<h3>{ins.title}</h3>
								<p>{ins.number}</p>
								{ins.journal?.last_date_read && (
									<p className="last-read">
										Последнее прочтение: {new Date(ins.journal.last_date_read).toLocaleDateString()}
									</p>
								)}

							</div>

							{/* Блок кнопок */}
							<div className="instruction-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
								{ins.is_modules_bind && (
									<Button
										onClick={() => navigate("/education", {
											state: {
												instructionId: ins.id,
												title: ins.title,
												is_tests_bind: ins.is_tests_bind   // <-- добавляем сюда
											}
										})}
									>
										Обучение
									</Button>
								)}


								{ins.is_tests_bind && (
									<Button onClick={() => handleTestClick(ins)}>
										Тестирование
									</Button>
								)}
							</div>

						</div>
					))
				) : (
					<p>ЛНА для ознакомлений пока нет.</p>
				)}
			</div>

			<PdfModal
				isOpen={isModalOpen}
				onClose={closeModal}
				url={selectedInstruction?.link}
				actionButton={
					!selectedInstruction?.journal?.valid && (   // ✅ Только если invalid
						<Button
							className="actionBtn"
							onClick={handleAcknowledge}
							disabled={isAcknowledging}
						>
							{isAcknowledging ? "Отправка..." : "Ознакомиться"}
						</Button>
					)
				}
			/>

		</div>
	);
};

export default LK;
