import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import useApi from "../hooks/useApi.hook";
import { TestListGetUrl } from "../helpers/constants";
import "./test_list.css";

const TestList = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { instructionId, title } = location.state || {};

	const api = useApi();
	const [tests, setTests] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchTests = async () => {
		if (!instructionId) return;
		setLoading(true);
		try {
			const res = await api.get(TestListGetUrl(instructionId));
			const data = res.data?.data || [];
			setTests(data);
		} catch (err) {
			console.error("Ошибка загрузки тестов:", err);
			setTests([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTests();
	}, [instructionId]);

	const handleTestClick = (test) => {
		if (!test?.id) return;
		navigate("/test", { state: { testId: test.id, instructionTitle: title } });
	};

	return (
		<div className="testlist-container">
			<FaHome className="home-icon" onClick={() => navigate("/lk")} />
			<div className="testlist-header">
				<h2>Выберите необходимый тест по инструкции</h2>
				<p className="instruction-title">📄 {title}</p>
			</div>

			{loading ? (
				<p className="testlist-loading">Загружаем тесты...</p>
			) : tests.length > 0 ? (
				<div className="tests-grid">
					{tests.map((test) => {
						// выбираем последнюю историю
						const lastHistory = test.histories?.length
							? [...test.histories].sort(
								(a, b) => new Date(b.date) - new Date(a.date)
							)[0]
							: null;

						return (
							<div
								key={test.id}
								className="test-card"
								onClick={() => handleTestClick(test)}
							>
								<h3>{test.title}</h3>

								{lastHistory ? (
									<div className="test-history">
										<p>
											Последнее прохождение:{" "}
											{new Date(lastHistory.date).toLocaleDateString()}
										</p>
										<p>
											Результат:{" "}
											{lastHistory.additional_data?.passed
												? "✅ Пройден"
												: "❌ Не пройден"}
										</p>
										<p>
											Процент правильных ответов:{" "}
											{lastHistory.additional_data?.success_rate ?? "—"}%
										</p>
									</div>
								) : (
									<p className="no-history">Тест ещё не проходился</p>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<p>Тестов нет.</p>
			)}
		</div>
	);
};

export default TestList;
