import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi.hook"; // твой хук
import { ModulesGetUrl, ModulesUpdatePostUrl, TestListGetUrl } from "../helpers/constants";
import PdfModal from "../components/Pdfviewer/PdfModal";
import { FaHome } from "react-icons/fa";
import Button from "../components/button/Button.jsx";
import './education.css'

const Education = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const { instructionId, title, is_tests_bind } = location.state || {};
	const api = useApi();

	const [modules, setModules] = useState([]);
	const [isOpenList, setIsOpenList] = useState(true);
	const [modalUrl, setModalUrl] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedModuleId, setSelectedModuleId] = useState(null);

	const fetchModules = async () => {
		if (!instructionId) return;
		setLoading(true);
		try {
			const res = await api.get(ModulesGetUrl(instructionId));
			let data = res.data;
			if (!Array.isArray(data)) data = data ? [data] : [];
			setModules(data);
			console.log("📦 modules:", data);
		} catch (err) {
			console.error("Ошибка загрузки модулей:", err);
			setModules([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchModules();
	}, [instructionId]);

	const openModule = (url, moduleId) => {
		setModalUrl(url);
		setSelectedModuleId(moduleId);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalUrl(null);
		setSelectedModuleId(null);
		setModalOpen(false);
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



	const markModuleCompleted = async () => {
		if (!selectedModuleId) return;
		try {
			await api.post(ModulesUpdatePostUrl(selectedModuleId), {});
			alert("✅ Успешно ознакомлен");
			closeModal();
			fetchModules();
		} catch (err) {
			console.error("Ошибка при установке статуса модуля:", err);
			alert("Ошибка! Попробуйте позже.");
		}
	};

	// Проверка прогресса
	const completedCount = modules.filter(m => m.is_completed).length;
	const allCompleted = modules.length > 0 && completedCount === modules.length;

	return (
		<div className="education-container">
			<FaHome className="home-icon" onClick={() => navigate("/lk")} />
			<div className="edu-header">
				<h2>{title || "Обучение"}</h2>
			</div>

			{/* Индикатор прогресса */}
			{modules.length > 0 && (
				<p className="modules-progress">
					Пройдено {completedCount} из {modules.length} модулей
				</p>
			)}

			<div className="modules-block">
				<div className="modules-header" onClick={() => setIsOpenList(!isOpenList)}>
					<span>Модули для обучения</span>
					<span>{isOpenList ? "▲" : "▼"}</span>
				</div>

				{isOpenList && (
					<ul className="modules-list">
						{loading ? (
							<p className="modules-loading">Загружаем модули обучения...</p>
						) : modules.length > 0 ? (
							modules.map((mod) => (
								<li
									key={mod.module_id}
									className="module-item"
									onClick={() => openModule(mod.module_link, mod.module_id)}
								>
									<span className="module-left">
										{mod.module_order_index ?? "?"}. {mod.module_title}
									</span>
									{mod.is_completed ? (
										<span className="module-check">✅</span>
									) : (
										<span className="module-failed">не пройден</span>
									)}
								</li>
							))
						) : (
							<p className="no-modules">Модули отсутствуют</p>
						)}
					</ul>
				)}
			</div>

			{/* Сообщение о завершении программы и тест */}
			{allCompleted && (
				<div className="modules-completed">
					<p>Программа обучения завершена.✅</p>
					{is_tests_bind && (
						<div className="test-block">
							<p>❗Для проверки знаний программы обучения и формирования протокола пройдите тест:</p>
							<Button className='button-test' onClick={() => handleTestClick({ id: instructionId, title })}>
								Пройти тест
							</Button>
						</div>
					)}
				</div>
			)}


			{/* Модалка с кнопкой */}
			<PdfModal
				isOpen={modalOpen}
				onClose={closeModal}
				url={modalUrl}
				actionButton={
					!modules.find(m => m.module_id === selectedModuleId)?.is_completed && (
						<Button className="actionBtn" onClick={markModuleCompleted}>
							Ознакомлен
						</Button>
					)
				}
			/>
		</div>
	);
};

export default Education;
