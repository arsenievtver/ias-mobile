import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useApi from "../hooks/useApi.hook";
import { TestGetUrl } from "../helpers/constants";
import Button from "../components/button/Button.jsx";
import './test.css'

const Test = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const api = useApi();

	const testId = location.state?.testId; // <-- достаем из state

	const [loading, setLoading] = useState(true);
	const [test, setTest] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState(null);
	const [answersStatus, setAnswersStatus] = useState({});

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
		setAnswersStatus(prev => ({
			...prev,
			[currentQuestion.id]: Number(key) === currentQuestion.correct_answer
		}));
	};

	const handleNext = () => {
		if (currentIndex < questions.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setSelectedAnswer(null);
		} else {
			alert("Тест завершен!");
			navigate("/lk");
		}
	};

	return (
		<div className="test-container">
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
					disabled={!selectedAnswer}  // блокируем кнопку, если нет ответа
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


