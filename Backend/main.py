import os
import shutil
import json
from pathlib import Path
from contextlib import asynccontextmanager
import re

from fastapi.responses import FileResponse
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Internal imports
from ai_module import ask_question, QuestionResponse, client
from pdf_handler import build_vector_database, get_vector_db
from config import PDF_FOLDER, CHROMA_DIR
from preformance_analyzer import analyze_results
from adapt_quiz import generate_adaptive_quiz


# --- 1. STARTUP LOGIC (Reset Data on Start) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting server... Resetting data folders...")
    if PDF_FOLDER.exists():
        shutil.rmtree(PDF_FOLDER)
    PDF_FOLDER.mkdir(parents=True, exist_ok=True)

    if CHROMA_DIR.exists():
        shutil.rmtree(CHROMA_DIR)

    processed_log = Path(__file__).parent / "processed_pdfs.json"
    if processed_log.exists():
        processed_log.unlink()

    print("Startup complete. Ready for new uploads.")
    yield
    print("Server shutting down.")


# --- 2. APP INITIALIZATION ---
app = FastAPI(title="Lumina Api", lifespan=lifespan , description="Illuminate your Documents with AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 3. DEFINE REQUEST MODELS ---
class QuizRequest(BaseModel):
    topic: Optional[str] = ""
    source: Optional[str] = None
    num_questions: int = 20


# ---> ADDED THESE TWO MODELS <---
class SummaryRequest(BaseModel):
    source: Optional[str] = None
    length: int = 3


class FlashcardRequest(BaseModel):
    source: Optional[str] = None
    num_cards: int = 10


# --- 4. ENDPOINTS ---

@app.post("/generate_quiz")
def create_quiz(req: QuizRequest):
    try:
        if not CHROMA_DIR.exists() or not any(CHROMA_DIR.iterdir()):
            raise HTTPException(status_code=400, detail="Database is empty. Please upload a PDF first.")

        vectordb = get_vector_db()
        docs = []

        if req.topic:
            print(f"Searching for topic: {req.topic}")
            search_kwargs = {"k": 15}
            if req.source:
                search_kwargs["filter"] = {"source_file": req.source}
            docs = vectordb.similarity_search(req.topic, **search_kwargs)
        else:
            print("No topic provided. Generating 20 Random Questions.")
            search_kwargs = {"k": 50}
            if req.source:
                search_kwargs["filter"] = {"source_file": req.source}
            docs = vectordb.similarity_search("", **search_kwargs)

        if not docs:
            raise HTTPException(status_code=404, detail="No content found in the selected document.")

        context = "\n".join([d.page_content for d in docs])
        topic_name = req.topic if req.topic else "General Document Knowledge"

        from ai_module import generate_quiz_from_topic
        quiz_text = generate_quiz_from_topic(context, topic_name, req.num_questions)

        return {"quiz": quiz_text, "source_file": req.source}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask", response_model=QuestionResponse)
def ask_endpoint(question: str, k: int = 3, source: str = None):
    try:
        vectordb = get_vector_db()
        return ask_question(question, vectordb, k, source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    # --- ADD THIS CLEANUP LOGIC ---
    # Automatically fix "file.pdf.pdf.pdf" to "file.pdf"
    clean_filename = re.sub(r'(\.pdf)+$', '.pdf', file.filename, flags=re.IGNORECASE)
    # --------------------------------

    file_path = os.path.join(PDF_FOLDER, clean_filename)

    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        print(f"{clean_filename} uploaded.")  # Notice we log the clean name now
        build_vector_database()
        return {"message": f"{clean_filename} uploaded and database updated."}
    except Exception as e:
        print("Error in upload_pdf:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/pdf/{filename}")
async def delete_pdf(filename: str):
    file_path = os.path.join(PDF_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk.")
    try:
        os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Error deleting file from disk.")
    try:
        vectordb = get_vector_db()
        vectordb._collection.delete(where={"source_file": filename})
        print(f"Deleted vectors for {filename}")
    except Exception as e:
        print(f"Warning: Could not delete vectors: {e}")
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
def list_pdfs():
    files = [f for f in os.listdir(PDF_FOLDER) if f.endswith(".pdf")]
    return {"pdfs": files}


@app.get("/")
def root():
    return {"message": "AI Tutor Backend Running"}


@app.get("/status")
def status():
    db_ready = CHROMA_DIR.exists() and any(CHROMA_DIR.iterdir())
    return {"status": "Database ready." if db_ready else "Database not found."}


# ==========================================
# PDF VIEWER ENDPOINT (No changes needed here)
# Your frontend just needs to call: http://127.0.0.1:8000/pdf-file/YOUR_FILE.pdf
# ==========================================
@app.get("/pdf-file/{filename}")
def serve_pdf(filename: str):
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