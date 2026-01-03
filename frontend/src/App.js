import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Trophy, RotateCcw, List, BarChart3, Users } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function QuizApp() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (quizStarted && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered) {
      handleTimeout();
    }
  }, [timeLeft, quizStarted, answered]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes`);
      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchQuizQuestions = async (quizId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`);
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const fetchStats = async (quizId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/${quizId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async (quizId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/${quizId}`);
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const startQuiz = async (quiz) => {
    setLoading(true);
    setSelectedQuiz(quiz);
    await fetchQuizQuestions(quiz.id);
    setLoading(false);
    setQuizStarted(true);
    setTimeLeft(15);
    setStartTime(Date.now());
    setCurrentView('quiz');
  };

  const handleTimeout = () => {
    setAnswered(true);
    setUserAnswers([...userAnswers, { questionId: questions[currentQuestion].id, answer: null, correct: false }]);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
        setAnswered(false);
      } else {
        submitQuiz();
      }
    }, 1500);
  };

  const handleAnswerSelect = (index) => {
    if (!answered) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setAnswered(true);
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    
    if (correct) {
      setScore(score + 1);
    }

    setUserAnswers([...userAnswers, { 
      questionId: questions[currentQuestion].id, 
      answer: selectedAnswer, 
      correct 
    }]);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
        setAnswered(false);
      } else {
        submitQuiz();
      }
    }, 1500);
  };

  const submitQuiz = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/${selectedQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers,
          timeSpent
        }),
      });
      
      const result = await response.json();
      setScore(result.score);
      setShowResult(true);
      setCurrentView('result');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setShowResult(true);
      setCurrentView('result');
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
    setQuizStarted(false);
    setAnswered(false);
    setUserAnswers([]);
    setSelectedQuiz(null);
    setQuestions([]);
    setCurrentView('home');
  };

  const viewStats = (quizId) => {
    fetchStats(quizId);
    fetchLeaderboard(quizId);
    setCurrentView('stats');
  };

  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Challenge</h1>
            <p className="text-gray-600">Choose a quiz category to test your knowledge!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-purple-800 mb-2">{quiz.title}</h3>
                <p className="text-gray-700 mb-4">{quiz.questionCount} questions</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => startQuiz(quiz)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 disabled:opacity-50"
                  >
                    Start Quiz
                  </button>
                  <button
                    onClick={() => viewStats(quiz.id)}
                    className="flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Rules:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 15 seconds per question</li>
              <li>• No going back once answered</li>
              <li>• 1 point per correct answer</li>
              <li>• Track your progress on the leaderboard</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'stats') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Quiz Statistics</h2>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
            >
              Back
            </button>
          </div>

          {stats && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-purple-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.totalAttempts}</div>
                <div className="text-gray-700">Total Attempts</div>
              </div>
              <div className="bg-pink-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-pink-600">{stats.averageScore}</div>
                <div className="text-gray-700">Average Score</div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.highestScore}</div>
                <div className="text-gray-700">Highest Score</div>
              </div>
            </div>
          )}

          {leaderboard && leaderboard.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Leaderboard (Top 10)
              </h3>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">Score: {entry.score}/{entry.totalQuestions}</div>
                        <div className="text-sm text-gray-600">{entry.percentage}% • {entry.timeSpent}s</div>
                      </div>
                    </div>
                    <Trophy className={`w-5 h-5 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-300'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'result') {
    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 mb-6">Here's how you performed:</p>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-xl text-gray-700">
              {percentage.toFixed(1)}% Correct
            </div>
          </div>

          <div className="text-left mb-6 space-y-2 max-h-40 overflow-y-auto">
            {questions.map((q, idx) => {
              const userAns = userAnswers[idx];
              return (
                <div key={q.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">Question {idx + 1}</span>
                  {userAns?.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={restartQuiz}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft <= 5 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQ.question}</h2>

          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correctAnswer;
              const showCorrect = answered && isCorrect;
              const showIncorrect = answered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : showIncorrect
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : isSelected
                      ? 'bg-purple-100 border-purple-500 text-purple-800'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showCorrect && <CheckCircle className="w-5 h-5" />}
                    {showIncorrect && <XCircle className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {!answered && (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Submit Answer
            </button>
          )}

          <div className="mt-4 text-center text-sm text-gray-600">
            Score: {score}/{currentQuestion + (answered ? 1 : 0)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
