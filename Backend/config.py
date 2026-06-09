# backend/config.py
from dotenv import load_dotenv
from pathlib import Path
import os

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")
PDF_FOLDER = BASE_DIR / "pdfs"
CHROMA_DIR = BASE_DIR / "chroma_db"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
NUM_QUIZ_QUESTIONS = 20

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "missing_key")
SECRET_KEY = os.environ.get("SECRET_KEY") or GROQ_API_KEY
