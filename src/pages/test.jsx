import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useApi from "../hooks/useApi.hook";
import { TestGetUrl, TestPassPostUrl } from "../helpers/constants";
import Button from "../components/button/Button.jsx";
import './test.css'
import {FaHome} from "react-icons/fa";

const Test = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const api = useApi();

	const testId = location.state?.testId;

	const [loading, setLoading] = useState(true);
	const [test, setTest] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState(null);
	const [answersStatus, setAnswersStatus] = useState({});
	const [userAnswers, setUserAnswers] = useState([]); // сохраняем все ответы

	// Загрузка теста
	const fetchTest = async () => {
		if (!testId) return;
		setLoading(true);
		try {
			const res = await api.get(TestGetUrl(testId));
			setTest(res.data);
		} catch (err) {
			console.error("Ошибка загрузки теста:", err);
			setTest(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTest();
	}, [testId]);

	if (!testId) return <p>Не передан ID теста.</p>;
	if (loading) return <p>Загрузка теста...</p>;
	if (!test) return <p>Тест не найден.</p>;

	const questions = test.questions || [];
	const currentQuestion = questions[currentIndex];

	const handleAnswerSelect = (key) => {
		if (selectedAnswer !== null) return;
		setSelectedAnswer(key);

		// записываем в массив ответов
		setUserAnswers(prev => [
			...prev,
			{ question_id: currentQuestion.id, answer: Number(key) }
		]);

		// отмечаем правильность
		setAnswersStatus(prev => ({
			...prev,
			[currentQuestion.id]: Number(key) === currentQuestion.correct_answer
		}));
	};

	const handleNext = async () => {
		if (!selectedAnswer) {
			alert("Выберите один вариант ответа!");
			return;
		}

		if (currentIndex < questions.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setSelectedAnswer(null);
		} else {
			// Отправка результатов
			try {
				const res = await api.post(TestPassPostUrl(testId), {
					user_answers: userAnswers
				});

				const result = res.data;
				const { test_title, rate, passed } = result.additional_data;

				if (passed) {
					alert(
						`Тест "${test_title}" успешно пройден! Количество правильных ответов: ${rate}%. Обратитесь в службу охраны труда для подписи протокола.`
					);
				} else {
					alert(
						`Тест "${test_title}" не пройден! Количество правильных ответов: ${rate}%. Вы можете повторно пройти данный тест.`
					);
				}
			} catch (err) {
				console.error("Ошибка отправки результатов:", err);
				alert("Ошибка при отправке результатов. Попробуйте позже.");
			} finally {
				navigate("/lk");
			}
		}
	};

	return (
		<div className="test-container">
			<FaHome className="home-icon" onClick={() => navigate("/lk")} />
			<h3>Тест: {test.title}</h3>
			{test.description && test.description !== "null" && (
				<p className="test-description">{test.description}</p>
			)}
			<p>Вопрос {currentIndex + 1} из {questions.length}</p>

			<div className="question-card">
				<p className="question-text">{currentQuestion.question}</p>
				<div className="answers-list">
					{currentQuestion.answers.map(a => {
						const key = Object.keys(a)[0];
						const text = a[key];
						const isDisabled = selectedAnswer !== null;
						const isSelected = selectedAnswer === key;

						return (
							<div key={key} className={`answer-item ${isSelected ? "selected" : ""}`}>
								<label>
									<input
										type="radio"
										name={`question_${currentQuestion.id}`}
										value={key}
										checked={isSelected}
										onChange={() => handleAnswerSelect(key)}
										disabled={isDisabled}
									/>
									{text}
								</label>
							</div>
						);
					})}
				</div>

				{selectedAnswer !== null && (
					<p className={`answer-feedback ${answersStatus[currentQuestion.id] ? "correct" : "incorrect"}`}>
						{answersStatus[currentQuestion.id] ? "Ответ правильный" : "Ответ не верный"}
					</p>
				)}

				<Button
					className='button-test-next'
					onClick={handleNext}
				>
					{currentIndex < questions.length - 1
						? "Следующий вопрос"
						: "Отправить результаты"}
				</Button>
			</div>
		</div>
	);
};

export default Test;
