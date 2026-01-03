const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Quiz data store
const quizzes = {
  general: {
    id: 'general',
    title: 'General Knowledge Quiz',
    questions: [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1
      },
      {
        id: 4,
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
        correctAnswer: 2
      },
      {
        id: 5,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctAnswer: 3
      },
      {
        id: 6,
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswer: 2
      },
      {
        id: 7,
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctAnswer: 2
      },
      {
        id: 8,
        question: "Which country is home to the kangaroo?",
        options: ["New Zealand", "Australia", "South Africa", "Brazil"],
        correctAnswer: 1
      },
      {
        id: 9,
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2
      },
      {
        id: 10,
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2
      }
    ]
  },
  science: {
    id: 'science',
    title: 'Science Quiz',
    questions: [
      {
        id: 1,
        question: "What is H2O commonly known as?",
        options: ["Oxygen", "Hydrogen", "Water", "Carbon"],
        correctAnswer: 2
      },
      {
        id: 2,
        question: "How many bones are in the human body?",
        options: ["186", "206", "226", "246"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "What is the speed of light?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        correctAnswer: 0
      },
      {
        id: 4,
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
        correctAnswer: 2
      },
      {
        id: 5,
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correctAnswer: 2
      }
    ]
  }
};

// Store for quiz results
const results = [];

// Routes

// Get all available quizzes
app.get('/api/quizzes', (req, res) => {
  const quizList = Object.values(quizzes).map(q => ({
    id: q.id,
    title: q.title,
    questionCount: q.questions.length
  }));
  res.json({ quizzes: quizList });
});

// Get a specific quiz
app.get('/api/quiz/:id', (req, res) => {
  const quiz = quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Remove correct answers from response
  const sanitizedQuiz = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }))
  };
  
  res.json(sanitizedQuiz);
});

// Submit quiz answers and get results
app.post('/api/quiz/:id/submit', (req, res) => {
  const quiz = quizzes[req.params.id];
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const { answers, timeSpent } = req.body; // answers: [{ questionId, answer }]
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid answers format' });
  }

  let score = 0;
  const detailedResults = answers.map(userAnswer => {
    const question = quiz.questions.find(q => q.id === userAnswer.questionId);
    if (!question) return null;
    
    const correct = userAnswer.answer === question.correctAnswer;
    if (correct) score++;
    
    return {
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswer.answer,
      correctAnswer: question.correctAnswer,
      correct,
      options: question.options
    };
  }).filter(r => r !== null);

  const result = {
    quizId: quiz.id,
    score,
    totalQuestions: quiz.questions.length,
    percentage: (score / quiz.questions.length * 100).toFixed(2),
    timeSpent,
    detailedResults,
    timestamp: new Date().toISOString()
  };

  results.push(result);

  res.json(result);
});

// Get quiz statistics
app.get('/api/stats/:id', (req, res) => {
  const quizResults = results.filter(r => r.quizId === req.params.id);
  
  if (quizResults.length === 0) {
    return res.json({
      quizId: req.params.id,
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0
    });
  }

  const totalAttempts = quizResults.length;
  const averageScore = quizResults.reduce((sum, r) => sum + r.score, 0) / totalAttempts;
  const highestScore = Math.max(...quizResults.map(r => r.score));

  res.json({
    quizId: req.params.id,
    totalAttempts,
    averageScore: averageScore.toFixed(2),
    highestScore
  });
});

// Get leaderboard
app.get('/api/leaderboard/:id', (req, res) => {
  const quizResults = results
    .filter(r => r.quizId === req.params.id)
    .sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent)
    .slice(0, 10);

  res.json({ leaderboard: quizResults });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Quiz API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/quizzes - Get all quizzes`);
  console.log(`  GET  /api/quiz/:id - Get specific quiz`);
  console.log(`  POST /api/quiz/:id/submit - Submit answers`);
  console.log(`  GET  /api/stats/:id - Get quiz statistics`);
  console.log(`  GET  /api/leaderboard/:id - Get leaderboard`);
});

module.exports = app;
