Lumina | AI Study Hub
Illuminate your study materials using AI.

🛠️ Tech Stack
Frontend: React, Vite, Tailwind CSS, Framer Motion
Backend: Python, FastAPI, LangChain, ChromaDB
AI Model: Groq (Llama 3)
🚀 Local Setup
1. Clone the repo
git clone https://github.com/badrrammirr/Lumina.gitcd Lumina
2. Backend Setup
Open a terminal in the Backend folder:

bash

cd Backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install required packages
pip install fastapi uvicorn langchain langchain-chroma groq python-dotenv pdfplumber sentence-transformers
Add your API Key:
Create a file named .env inside the Backend folder and add your Groq API key to it:

env

GROQ_API_KEY=your_groq_api_key_here
Start the server:

bash

uvicorn main:app --reload
3. Frontend Setup
Open a NEW terminal tab in the frontend folder:

bash

cd frontend
npm install
npm run dev
Open the link it prints in the terminal (usually http://localhost:5173)

text


**4. Save the file.**

**5. Go back to your terminal** (make sure you are in the root folder, not inside frontend or Backend. If you are inside one, type `cd ..` to go back).

**6. Push the manual to GitHub** by pasting these lines one by one and hitting Enter:
```bash
git add README.md
git commit -m "Add setup instructions"
git push
