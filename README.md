# Lumina | AI Study Hub

Illuminate your study materials using AI.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Python, FastAPI, LangChain, ChromaDB
- **Database:** SQLite (user data), ChromaDB (vector embeddings)
- **AI Model:** Groq (Llama 3)
- **Authentication:** JWT with bcrypt password hashing

## ✨ Features

- 🔐 **Secure Authentication** - Register, login, and manage sessions
- 📚 **PDF Management** - Upload and manage study documents
- 🤖 **AI Chat** - Ask questions about your documents
- 📝 **Quiz Generation** - Auto-generate quizzes from content
- 📊 **Performance Analytics** - Track your learning progress
- 💾 **Chat History** - Save and revisit past conversations
- ✨ **Smart Summaries** - Auto-summarize documents
- 📇 **Flashcards** - Create study flashcards with AI
- 🎯 **Adaptive Learning** - Get quizzes tailored to weak areas

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Free Groq API key (get one at https://console.groq.com)

### Backend Setup

1. **Navigate to the Backend folder:**

```bash
cd Backend
```

2. **Create and activate virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Create `.env` file:**

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

5. **Add your Groq API Key to `.env`:**

```env
GROQ_API_KEY=your_groq_api_key_here
```

6. **Start the backend server:**

```bash
uvicorn main:app --reload
```

The backend will start at `http://127.0.0.1:8000`

### Frontend Setup

1. **Open a NEW terminal and navigate to frontend folder:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

The frontend will start at `http://localhost:5173` (or `http://127.0.0.1:5173`)

4. **Open in your browser:**

Open http://localhost:5173 in your web browser

## 📝 First Time Setup

1. **Create an account** by clicking "Create Account" on the login page
   - Username (required): Choose your username
   - Email (optional): Your email address
   - Password (required): At least 6 characters

2. **Log in** with your credentials

3. **Upload your first PDF** by going to "Upload PDFs" in the sidebar

4. **Start learning** with AI by using any of the study tools

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for secure authentication:

- Passwords are hashed using bcrypt (never stored in plaintext)
- Tokens expire after 7 days
- Tokens are stored securely in localStorage on the client
- All protected endpoints require a valid token

## 📚 API Documentation

### Authentication Endpoints

- `POST /register` - Create a new account
- `POST /login` - Log in to your account
- `POST /logout` - Log out
- `GET /me` - Get current user info

### Chat History Endpoints

- `GET /chats` - Get all user chats
- `POST /chats` - Create a new chat
- `GET /chats/{chat_id}` - Get chat details
- `POST /chats/{chat_id}/messages` - Add message to chat
- `PATCH /chats/{chat_id}` - Rename chat
- `DELETE /chats/{chat_id}` - Delete chat

### PDF Management

- `POST /upload_pdf` - Upload a PDF
- `GET /pdfs` - List uploaded PDFs
- `DELETE /pdf/{filename}` - Delete a PDF
- `GET /pdf-file/{filename}` - Download/view PDF

### AI Features

- `POST /ask` - Ask a question about PDFs
- `POST /generate_quiz` - Generate quiz questions
- `POST /generate_summary` - Summarize documents
- `POST /generate_flashcards` - Create flashcards
- `POST /analyze_results` - Analyze quiz performance
- `POST /generate_adaptive_quiz` - Generate targeted quiz

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation on all endpoints
- ✅ Protected routes requiring authentication
- ✅ CORS configuration for trusted origins
- ✅ Secure session management
- ✅ No plaintext secrets in code

## 📦 Project Structure

```
Lumina/
├── Backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database operations
│   ├── auth.py              # Authentication functions
│   ├── validation.py        # Input validation
│   ├── ai_module.py         # AI functions
│   ├── pdf_handler.py       # PDF processing
│   ├── config.py            # Configuration
│   ├── adapt_quiz.py        # Adaptive quiz
│   ├── preformance_analyzer.py # Performance analysis
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment template
│   └── lumina.db            # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (state)
│   │   ├── api/             # API client
│   │   └── App.jsx          # Main app
│   ├── package.json
│   └── [config files]
│
└── README.md
```

## 🧪 Testing

### Testing Authentication

1. **Register a new user:**
   - Go to http://localhost:5173/register
   - Fill in username, password, and optionally email
   - Click "Create Account"

2. **Log in:**
   - Go to http://localhost:5173/login
   - Enter username and password
   - Click "Sign In"

3. **Check user info:**
   - Click the profile avatar in the top-right corner
   - See your username and email
   - Click "Logout" to sign out

### Testing PDF Features

1. **Upload a PDF:**
   - Go to "Upload PDFs"
   - Drag and drop or click to upload a PDF
   - Wait for processing

2. **Ask questions:**
   - Go to "Ask AI"
   - Type a question about the PDF
   - View AI-generated answer

3. **Generate quizzes:**
   - Go to "Quiz"
   - Enter topic or leave blank for random
   - Adjust number of questions
   - Generate and take quiz

## ⚙️ Environment Variables

### Required

- `GROQ_API_KEY` - Your Groq API key for LLM

### Optional

- `SECRET_KEY` - JWT secret (defaults to GROQ_API_KEY)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `ENVIRONMENT` - Set to "production" for production deployment

## 🚨 Troubleshooting

### "Database is empty" error

**Solution:** Upload a PDF file first through the Upload PDFs page

### "Invalid token" error

**Solution:** Log out and log back in. Tokens may expire after 7 days.

### CORS errors in browser console

**Solution:** Check that frontend is running on `http://localhost:5173` and backend on `http://127.0.0.1:8000`

### PDFs not processing

**Solution:** Ensure the PDF file is valid and not corrupted. Try with a smaller PDF first.

### Module import errors in backend

**Solution:** Make sure you're in the virtual environment:
```bash
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements.

## 📞 Support

For issues or questions, please create an issue on GitHub or reach out to the maintainers.

---

**Happy Learning with Lumina! 🌟**
