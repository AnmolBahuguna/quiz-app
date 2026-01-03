# Quiz Application

A fully functional quiz application with React frontend and Node.js/Express backend.

## Features

- **Multiple Quiz Categories**: General Knowledge and Science quizzes
- **Real-time Timer**: 15 seconds per question
- **Score Tracking**: Automatic score calculation and percentage display
- **Leaderboard**: Top 10 scores for each quiz
- **Statistics**: View quiz performance statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern gradient design with Tailwind CSS

## Project Structure

```
project2/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   
   The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## API Endpoints

### Backend API (Port 3001)

- `GET /api/quizzes` - Get all available quizzes
- `GET /api/quiz/:id` - Get quiz questions (without answers)
- `POST /api/quiz/:id/submit` - Submit answers and get score
- `GET /api/stats/:id` - Get quiz statistics
- `GET /api/leaderboard/:id` - Get top 10 scores
- `GET /health` - Health check endpoint

## How to Use

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Select a quiz category from the home screen
4. Answer questions within the time limit
5. View your results and compare with the leaderboard
6. Check statistics for each quiz category

## Game Rules

- 15 seconds per question
- No going back once answered
- 1 point per correct answer
- Results are automatically saved to the leaderboard

## Technologies Used

### Frontend
- React 18
- Lucide React (icons)
- CSS with Tailwind-inspired classes

### Backend
- Node.js
- Express.js
- CORS middleware

## Development

### Running in Development Mode

For development with hot reload:

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
npm start
```

### Adding New Quizzes

To add a new quiz category, add it to the `quizzes` object in `backend/server.js`:

```javascript
const quizzes = {
  // existing quizzes...
  newCategory: {
    id: 'newCategory',
    title: 'New Quiz Category',
    questions: [
      {
        id: 1,
        question: "Your question here?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: 2 // 0-based index
      }
      // add more questions...
    ]
  }
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
