import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi.hook"; // твой хук
import { ModulesGetUrl, ModulesUpdatePostUrl } from "../helpers/constants";
import PdfModal from "../components/Pdfviewer/PdfModal";
import { FaHome } from "react-icons/fa";
import './education.css'

const Education = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true); // новый state
	const { instructionId, title } = location.state || {};
	const api = useApi();

	const [modules, setModules] = useState([]);
	const [isOpenList, setIsOpenList] = useState(true);
	const [modalUrl, setModalUrl] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedModuleId, setSelectedModuleId] = useState(null);

	// Выносим fetchModules для повторного вызова
	const fetchModules = async () => {
		if (!instructionId) return;
		setLoading(true); // начало загрузки
		try {
			const res = await api.get(ModulesGetUrl(instructionId));
			let data = res.data;
			if (!Array.isArray(data)) data = data ? [data] : [];
			setModules(data);
			console.log("📦 modules:", data);
		} catch (err) {
			console.error("Ошибка загрузки модулей:", err);
			setModules([]); // на случай ошибки
		} finally {
			setLoading(false); // закончена загрузка
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

	return (
		<div className="education-container">
			<FaHome className="home-icon" onClick={() => navigate("/lk")} />
			<div className="edu-header">
				<h2>{title || "Обучение"}</h2>
			</div>

			<div className="modules-block">
				<div className="modules-header" onClick={() => setIsOpenList(!isOpenList)}>
					Модули для обучения {isOpenList ? "▲" : "▼"}
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

			{/* Модалка с кнопкой */}
			<PdfModal
				isOpen={modalOpen}
				onClose={closeModal}
				url={modalUrl}
				actionButton={
					!modules.find(m => m.module_id === selectedModuleId)?.is_completed && (
						<button className="actionBtn" onClick={markModuleCompleted}>
							Ознакомлен
						</button>
					)
				}
			/>
		</div>
	);
};

export default Education;
