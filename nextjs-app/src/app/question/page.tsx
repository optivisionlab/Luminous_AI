'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

const QuestionPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter(); // Initialize useRouter
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Lấy username từ localStorage khi component mount
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Redirect to login if no username is found
      // router.push('/login'); // Uncomment if you want to enforce login
      setMessage('Vui lòng đăng nhập để chơi game.');
    }
  }, []);

  const startGame = async () => {
    if (!username) {
      setMessage('Vui lòng đăng nhập để chơi game.');
      return;
    }
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setCountdown(5);
    setMessage('');
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          fetchFirstQuestion(); // Call to get the first question
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchFirstQuestion = async () => {
    setIsLoading(true);
    setMessage('Đang tải câu hỏi...');
    setSelectedAnswer(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentQuestion(data.question);
        setMessage(''); // Clear loading message
      } else {
        setMessage(data.detail || 'Không thể khởi tạo phiên chơi game.');
        setGameOver(true); // End game if session cannot be initiated
      }
    } catch (error) {
      console.error('Lỗi khởi tạo phiên chơi game:', error);
      setMessage('Đã xảy ra lỗi khi khởi tạo phiên chơi game. Vui lòng thử lại.');
      setGameOver(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnswer || !currentQuestion || gameOver || !username) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          answer: selectedAnswer,
          current_score: score,
          username: username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setScore(data.new_score);
        setMessage(data.message);
        setGameOver(data.game_over);
        if (!data.game_over && data.next_question) {
          setCurrentQuestion(data.next_question);
          setSelectedAnswer(null); // Clear selected answer for next question
        } else if (data.game_over) {
          setCurrentQuestion(null); // Clear question when game is over
        }
      } else {
        setMessage(data.detail || 'Gửi câu trả lời không thành công.');
      }
    } catch (error) {
      console.error('Lỗi gửi câu trả lời:', error);
      setMessage('Đã xảy ra lỗi khi gửi câu trả lời. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndGame = async () => {
    if (!username) {
      setMessage('Vui lòng đăng nhập để lưu điểm.');
      return;
    }

    setIsLoading(true);
    setMessage('Đang kết thúc lượt chơi và lưu điểm...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, score, date: new Date().toISOString() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Lượt chơi đã kết thúc. Điểm của bạn đã được lưu.');
        setGameOver(true);
      } else {
        setMessage(data.detail || 'Lưu điểm không thành công.');
      }
    } catch (error) {
      console.error('Lỗi kết thúc lượt chơi:', error);
      setMessage('Đã xảy ra lỗi khi kết thúc lượt chơi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username'); // Clear username from local storage
    router.push('/login'); // Redirect to login page
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="absolute left-4 top-4 flex space-x-4">
        {username && (
          <div className="rounded-lg bg-emerald-100 p-3 shadow-lg">
            <p className="text-xl font-semibold text-emerald-800">Người chơi: {username}</p>
          </div>
        )}
        <div className="rounded-lg bg-orange-100 p-3 shadow-lg">
          <p className="text-xl font-semibold text-orange-800">Điểm: {score}</p>
        </div>
      </div>
      <div className="absolute right-4 top-4">
        {username && (
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-100 p-3 shadow-lg text-red-800 hover:bg-red-200"
          >
            Đăng xuất
          </button>
        )}
      </div>
      <div className="w-full max-w-4xl rounded-lg bg-white p-10 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">Hỏi đáp</h1>
        
        {message && <div className={`mb-4 p-4 rounded-md ${gameOver ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{message}</div>}

        {!gameStarted && !isLoading && !gameOver && (
          <div className="text-center mt-10">
            <button
              onClick={startGame}
              className="rounded-md bg-green-600 px-10 py-5 text-2xl font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Bắt đầu trò chơi
            </button>
          </div>
        )}

        {gameStarted && countdown > 0 && (
          <div className="text-center mt-10">
            <p className="text-5xl font-bold text-indigo-700">Bắt đầu sau: {countdown}</p>
          </div>
        )}

        {gameStarted && countdown === 0 && isLoading && (
          <p className="text-center text-xl text-gray-600">Đang tải câu hỏi...</p>
        )}

        {gameStarted && countdown === 0 && !isLoading && !gameOver && currentQuestion && (
          <form onSubmit={handleSubmitAnswer} className="mb-6">
            <div className="mb-4">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">Câu hỏi: {currentQuestion.question}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  { key: 'A', value: currentQuestion.option_a },
                  { key: 'B', value: currentQuestion.option_b },
                  { key: 'C', value: currentQuestion.option_c },
                  { key: 'D', value: currentQuestion.option_d },
                ].map((option, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg border p-5 transition-all duration-200
                      ${selectedAnswer === option.key
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md'
                        : 'border-gray-300 bg-white hover:border-indigo-400 hover:shadow-sm'}
                    `}
                    onClick={() => setSelectedAnswer(option.key as 'A' | 'B' | 'C' | 'D')}
                  >
                    <input
                      type="radio"
                      id={`option-${option.key}`}
                      name="answer"
                      value={option.key}
                      checked={selectedAnswer === option.key}
                      onChange={() => {}}
                      className="sr-only" // Ẩn radio button gốc
                    />
                    <label htmlFor={`option-${option.key}`} className="block text-xl font-medium">
                      <span className="font-bold mr-3">{option.key}:</span> {option.value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between space-x-4">
              <button
                type="submit"
                className="flex-1 rounded-md bg-blue-500 px-6 py-3 text-lg text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                disabled={!selectedAnswer || isLoading}
              >
                Gửi câu trả lời
              </button>
              <button
                type="button"
                onClick={handleEndGame}
                className="flex-1 rounded-md bg-rose-500 px-6 py-3 text-lg text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:bg-rose-300"
                disabled={isLoading || gameOver}
              >
                Kết thúc lượt chơi
              </button>
            </div>
          </form>
        )}

        {!isLoading && gameOver && (
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-red-600">Hết ván!</h2>
            <p className="mb-4 text-xl text-gray-700">Điểm cuối cùng của bạn: {score}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setScore(0);
                  setGameOver(false);
                  setGameStarted(false); // Reset gameStarted for next game
                  setMessage(''); // Clear the message
                  setCurrentQuestion(null); // Clear current question
                  setCountdown(5); // Reset countdown
                  // fetchFirstQuestion(); // This will be triggered by the Start Game button
                }}
                className="rounded-md bg-green-600 px-8 py-4 text-lg text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Chơi lại
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="rounded-md bg-blue-500 px-8 py-4 text-lg text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Xem Bảng xếp hạng
              </button>
            </div>
          </div>
        )}

        {gameStarted && countdown === 0 && !isLoading && !currentQuestion && !message && (
            <p className="text-center text-xl text-gray-600">Không có câu hỏi nào. Vui lòng kiểm tra lại backend.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;
