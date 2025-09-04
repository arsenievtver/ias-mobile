import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../context/useUser';
import './lk.css';
import PdfModal from "../components/Pdfviewer/PdfModal.jsx";
import Button from "../components/button/Button.jsx";

const LK = () => {
	const navigate = useNavigate();
	const { user, isLoading, authError } = useUser();
	const [selectedInstruction, setSelectedInstruction] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openInstruction = (instruction) => {
		setSelectedInstruction(instruction);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedInstruction(null);
	};

	if (isLoading) return <div>Загрузка данных...</div>;
	if (authError) return <div>Ошибка загрузки пользователя. Попробуйте войти снова.</div>;
	if (!user) return <div>Нет данных пользователя.</div>;

	return (
		<div className="lk-container">
			<h1>Личный кабинет</h1>

			<div className="user-info">
				<p><strong>Имя:</strong> {user.last_name} {user.name} {user.father_name}</p>
				<p><strong>Должность:</strong> {user.profession?.title}</p>
				<p><strong>Отдел:</strong> {user.division?.title}</p>
				<p><strong>Табельный номер:</strong> {user.number}</p>
			</div>

			<h2>ЛНА</h2>
			<div className="instructions-grid">
				{user.instructions && user.instructions.length > 0 ? (
					user.instructions.map((ins) => (
						<div key={ins.id} className="instruction-wrapper" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '8px', marginBottom: '12px' }}>

							{/* Кликаябельная карточка инструкции */}
							<div
								className="instruction-card"
								onClick={() => openInstruction(ins)}
								title={ins.title}
								style={{ cursor: 'pointer', padding: '4px 0' }}
							>
								<h3>{ins.title}</h3>
								<p>{ins.number}</p>
								{ins.journal?.last_date_read && (
									<p className="last-read">
										Последнее прочтение: {new Date(ins.journal.last_date_read).toLocaleDateString()}
									</p>
								)}
								{ins.journal?.valid ? (
									<span className="status valid">✅ Действует</span>
								) : (
									<span className="status invalid">⚠️ Просрочен</span>
								)}
							</div>

							{/* Блок кнопок */}
							<div className="instruction-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
								{ins.is_tests_bind && (
									<Button onClick={() => navigate(`/test`)}>
										Пройти тест
									</Button>
								)}
								{ins.is_modules_bind && (
									<Button onClick={() => navigate(`/education`)}>
										Пройти обучение
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
			/>



		</div>
	);
};

export default LK;
