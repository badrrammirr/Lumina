import os
import database
import json
from pathlib import Path
from contextlib import asynccontextmanager
import re

from fastapi.responses import FileResponse
from fastapi import FastAPI, HTTPException, UploadFile, File, Body, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Internal imports
from ai_module import ask_question, QuestionResponse, client
from pdf_handler import build_vector_database, get_vector_db
from config import PDF_FOLDER, CHROMA_DIR
from preformance_analyzer import analyze_results
from adapt_quiz import generate_adaptive_quiz
from database import init_db, get_user_by_username, get_user_by_id, create_user, update_last_login, get_user_chats, get_chat_messages, create_chat, add_message, delete_chat, rename_chat, track_user_pdf, get_user_pdfs, delete_user_pdf
from auth import hash_password, verify_password, create_access_token, verify_token
from validation import validate_username, validate_email, validate_password, validate_title, validate_content, validate_question, validate_page_params, validate_quiz_params


# --- 1. STARTUP LOGIC ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting server... Initializing application.")
    PDF_FOLDER.mkdir(parents=True, exist_ok=True)
    init_db()
    print("Server started. Ready to process requests.")
    yield
    print("Server shutting down.")


# --- 2. APP INITIALIZATION ---
app = FastAPI(title="Lumina Api", lifespan=lifespan , description="Illuminate your Documents with AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


# --- 3. DEFINE REQUEST MODELS ---
class QuizRequest(BaseModel):
    topic: Optional[str] = ""
    source: Optional[str] = None
    num_questions: int = 20


class SummaryRequest(BaseModel):
    source: Optional[str] = None
    length: int = 3


class FlashcardRequest(BaseModel):
    source: Optional[str] = None
    num_cards: int = 10


# Authentication Models
class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    role: str
    created_at: str


# Chat Models
class MessageRequest(BaseModel):
    content: str
    role: str


class CreateChatRequest(BaseModel):
    title: str


# Authentication helper
def get_current_user(authorization: Optional[str] = Header(None)):
    """Extract and verify JWT token from Authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    user_data = verify_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = get_user_by_id(user_data["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# --- 4. ENDPOINTS ---

@app.post("/generate_quiz")
def create_quiz(req: QuizRequest):
    try:
        num_questions = validate_quiz_params(req.num_questions)

        if not CHROMA_DIR.exists() or not any(CHROMA_DIR.iterdir()):
            raise HTTPException(status_code=400, detail="Database is empty. Please upload a PDF first.")

        vectordb = get_vector_db()
        docs = []

        if req.topic:
            topic = validate_question(req.topic)
            print(f"Searching for topic: {topic}")
            search_kwargs = {"k": 15}
            if req.source:
                search_kwargs["filter"] = {"source_file": req.source}
            docs = vectordb.similarity_search(topic, **search_kwargs)
        else:
            print("No topic provided. Generating random questions.")
            search_kwargs = {"k": 50}
            if req.source:
                search_kwargs["filter"] = {"source_file": req.source}
            docs = vectordb.similarity_search("", **search_kwargs)

        if not docs:
            raise HTTPException(status_code=404, detail="No content found in the selected document.")

        context = "\n".join([d.page_content for d in docs])
        topic_name = req.topic if req.topic else "General Document Knowledge"

        from ai_module import generate_quiz_from_topic
        quiz_text = generate_quiz_from_topic(context, topic_name, num_questions)

        return {"quiz": quiz_text, "source_file": req.source}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask", response_model=QuestionResponse)
def ask_endpoint(question: str, k: int = 3, source: str = None):
    try:
        question = validate_question(question)
        k = validate_page_params(k)
        return ask_question(question, get_vector_db(), k, source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Automatically fix "file.pdf.pdf.pdf" to "file.pdf"
    clean_filename = re.sub(r'(\.pdf)+$', '.pdf', file.filename, flags=re.IGNORECASE)

    file_path = os.path.join(PDF_FOLDER, clean_filename)

    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        print(f"{clean_filename} uploaded by user {current_user['username']}")

        # Track this PDF for the current user
        track_user_pdf(current_user["id"], clean_filename)

        build_vector_database()
        return {"message": f"{clean_filename} uploaded and database updated."}
    except Exception as e:
        print("Error in upload_pdf:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/pdf/{filename}")
async def delete_pdf(filename: str, current_user: dict = Depends(get_current_user)):
    # Verify user owns this PDF
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user_pdfs WHERE user_id = ? AND filename = ?', (current_user["id"], filename))
    pdf_record = cursor.fetchone()
    conn.close()
    
    if not pdf_record:
        raise HTTPException(status_code=404, detail="PDF not found or access denied.")
    
    file_path = os.path.join(PDF_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk.")
    
    # Remove from disk
    try:
        os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Error deleting file from disk.")
    
    # Remove vectors from database
    try:
        vectordb = get_vector_db()
        vectordb._collection.delete(where={"source_file": filename})
        print(f"Deleted vectors for {filename}")
    except Exception as e:
        print(f"Warning: Could not delete vectors: {e}")
    
    # Update processed list
    try:
        proc_file = Path(__file__).parent / "processed_pdfs.json"
        if proc_file.exists():
            with open(proc_file, 'r') as f:
                processed = set(json.load(f))
            if filename in processed:
                processed.remove(filename)
                with open(proc_file, 'w') as f:
                    json.dump(list(processed), f)
    except Exception as e:
        print(f"Error updating processed list: {e}")
    
    return {"message": f"{filename} deleted successfully."}


@app.post("/analyze_results")
def analyze_student(results: list = Body(...)):
    try:
        weak_chunks = analyze_results(results)
        return {"weak_chunks": weak_chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_adaptive_quiz")
def generate_adaptive_quiz_endpoint(weak_chunks: list = Body(...)):
    if not weak_chunks:
        raise HTTPException(status_code=400, detail="No weak chunks provided.")
    try:
        vectordb = get_vector_db()
        questions = generate_adaptive_quiz(weak_chunks, vectordb)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/pdfs")
def list_pdfs(current_user: dict = Depends(get_current_user)):
    """Get PDFs uploaded by the current user."""
    pdfs = get_user_pdfs(current_user["id"])
    return {"pdfs": pdfs}


@app.get("/")
def root():
    return {"message": "AI Tutor Backend Running"}


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================
@app.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    try:
        username = validate_username(req.username)
        password = validate_password(req.password)
        email = validate_email(req.email) if req.email else None

        password_hash = hash_password(password)
        user_id = create_user(username, password_hash, email)
        token = create_access_token({"sub": user_id})

        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user_id=user_id,
            username=username
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@app.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = get_user_by_username(req.username)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    update_last_login(user["id"])
    token = create_access_token({"sub": user["id"]})

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        username=user["username"]
    )


@app.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )


@app.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


# ==========================================
# CHAT HISTORY ENDPOINTS
# ==========================================
@app.get("/chats")
def get_chats(current_user: dict = Depends(get_current_user)):
    chats = get_user_chats(current_user["id"])
    return {"chats": chats}


@app.post("/chats", response_model=dict)
def create_new_chat(req: CreateChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        title = validate_title(req.title)
        chat_id = create_chat(current_user["id"], title)
        return {"id": chat_id, "title": title, "message": "Chat created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chats/{chat_id}")
def get_chat(chat_id: int, current_user: dict = Depends(get_current_user)):
    # Verify chat belongs to current user
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT user_id FROM chats WHERE id = ?', (chat_id,))
    chat = cursor.fetchone()
    conn.close()
    
    if not chat or chat["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Chat not found or access denied.")
    
    try:
        messages = get_chat_messages(chat_id)
        return {"chat_id": chat_id, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chats/{chat_id}/messages")
def add_chat_message(chat_id: int, req: MessageRequest, current_user: dict = Depends(get_current_user)):
    # Verify chat belongs to current user
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT user_id FROM chats WHERE id = ?', (chat_id,))
    chat = cursor.fetchone()
    conn.close()
    
    if not chat or chat["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Chat not found or access denied.")
    
    try:
        message_id = add_message(chat_id, req.role, req.content)
        return {"message_id": message_id, "status": "Message added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/chats/{chat_id}")
def delete_user_chat(chat_id: int, current_user: dict = Depends(get_current_user)):
    # Verify chat belongs to current user
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT user_id FROM chats WHERE id = ?', (chat_id,))
    chat = cursor.fetchone()
    conn.close()
    
    if not chat or chat["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Chat not found or access denied.")
    
    try:
        delete_chat(chat_id)
        return {"message": "Chat deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/chats/{chat_id}")
def rename_user_chat(chat_id: int, req: CreateChatRequest, current_user: dict = Depends(get_current_user)):
    # Verify chat belongs to current user
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT user_id FROM chats WHERE id = ?', (chat_id,))
    chat = cursor.fetchone()
    conn.close()
    
    if not chat or chat["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Chat not found or access denied.")
    
    try:
        title = validate_title(req.title)
        rename_chat(chat_id, title)
        return {"message": "Chat renamed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
def status():
    db_ready = CHROMA_DIR.exists() and any(CHROMA_DIR.iterdir())
    return {"status": "Database ready." if db_ready else "Database not found."}


# ==========================================
# PDF VIEWER ENDPOINT (No changes needed here)
# Your frontend just needs to call: http://127.0.0.1:8000/pdf-file/YOUR_FILE.pdf
# ==========================================
@app.get("/pdf-file/{filename}")
def serve_pdf(filename: str, current_user: dict = Depends(get_current_user)):
    # Verify user owns this PDF
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user_pdfs WHERE user_id = ? AND filename = ?', (current_user["id"], filename))
    pdf_record = cursor.fetchone()
    conn.close()
    
    if not pdf_record:
        raise HTTPException(status_code=404, detail="File not found or access denied.")
    
    file_path = os.path.join(PDF_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(file_path, media_type="application/pdf")


# ==========================================
# UPDATED SUMMARY ENDPOINT
# ==========================================
@app.post("/generate_summary")
def generate_summary_endpoint(req: SummaryRequest):
    try:
        # 1. Check if database even exists first
        if not CHROMA_DIR.exists() or not any(CHROMA_DIR.iterdir()):
            raise HTTPException(status_code=400, detail="Database is empty. Please upload a PDF first.")

        vectordb = get_vector_db()
        search_kwargs = {"k": 30}

        # 2. Debugging: Print what the frontend sent
        print(f"--- SUMMARY REQUEST ---")
        print(f"Received source: {req.source}")

        if req.source:
            search_kwargs["filter"] = {"source_file": req.source}

        # 3. Search the database
        docs = vectordb.similarity_search("", **search_kwargs)
        print(f"Found {len(docs)} document chunks.")

        if not docs:
            # This is likely the error you are seeing!
            raise HTTPException(status_code=404, detail="No documents found. Make sure the PDF was fully processed.")

        context = "\n\n".join([d.page_content for d in docs])

        # 4. Debugging: Check if the text is actually there
        print(f"Context length: {len(context)} characters")

        from ai_module import summarize_document
        summary = summarize_document(context)

        return {"summary": summary}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# UPDATED FLASHCARDS ENDPOINT
# ==========================================
@app.post("/generate_flashcards")
def generate_flashcards_route(req: FlashcardRequest):
    try:
        vectordb = get_vector_db()
        search_kwargs = {"k": 20}
        if req.source:
            search_kwargs["filter"] = {"source_file": req.source}

        docs = vectordb.similarity_search("", **search_kwargs)
        if not docs:
            raise HTTPException(status_code=404, detail="No documents found.")

        context = "\n\n".join([d.page_content for d in docs])

        from ai_module import generate_flashcards
        cards = generate_flashcards(context, req.num_cards)

        return {"cards": cards}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))