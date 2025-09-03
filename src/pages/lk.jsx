import React, { useState } from 'react';
import useUser from '../context/useUser';
import './lk.css'; // стили страницы
import {Modal} from '../components/Modal/Modal';
import PdfViewer from '../components/Pdfviewer/PdfViewer';

const LK = () => {
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
						<div
							key={ins.id}
							className="instruction-card"
							onClick={() => openInstruction(ins)}
							title={ins.title}
						>
							<h3>{ins.title}</h3>
							<p>{ins.number}</p>
							{ins.journal?.last_date_read && (
								<p className="last-read">
									Последнее прочтение: {new Date(ins.journal.last_date_read).toLocaleDateString()}
								</p>
							)}
							{ins.journal?.valid ? (
								<span className="status valid">✅ Действующий</span>
							) : (
								<span className="status invalid">⚠️ Просроченный</span>
							)}
						</div>
					))
				) : (
					<p>ЛНА для ознакомлений пока нет.</p>
				)}
			</div>

			{/* Модалка с PDF */}
			<Modal isOpen={isModalOpen} onClose={closeModal}>
				{selectedInstruction && (
					<>
						<PdfViewer url={selectedInstruction.link} />
						<button style={{ marginTop: '10px' }}>Ознакомиться</button>
					</>
				)}
			</Modal>
		</div>
	);
};

export default LK;
