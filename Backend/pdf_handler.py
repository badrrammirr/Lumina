# pdf_handler.py
import os
import json
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_chroma import Chroma
from config import PDF_FOLDER, CHROMA_DIR, CHUNK_SIZE, CHUNK_OVERLAP

# File to keep track of processed PDFs
PROCESSED_LIST_FILE = os.path.join(os.path.dirname(__file__), "processed_pdfs.json")

# Initialize embedding model once
embedding_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

def load_processed_pdfs():
    """Load the set of already processed PDF filenames."""
    if os.path.exists(PROCESSED_LIST_FILE):
        with open(PROCESSED_LIST_FILE, 'r') as f:
            return set(json.load(f))
    return set()

def save_processed_pdfs(processed_set):
    """Save the set of processed PDF filenames."""
    with open(PROCESSED_LIST_FILE, 'w') as f:
        json.dump(list(processed_set), f)

def build_vector_database():
    """Add new PDFs to the existing vector DB, or create if not exists."""
    # Get all PDF files in the folder
    all_pdfs = [f for f in os.listdir(PDF_FOLDER) if f.lower().endswith(".pdf")]
    if not all_pdfs:
        print("No PDF files found in", PDF_FOLDER)
        return None

    # Load already processed PDFs
    processed = load_processed_pdfs()
    new_pdfs = [f for f in all_pdfs if f not in processed]

    if not new_pdfs:
        print("No new PDFs to process.")
        # Still return the existing DB if it exists
        if os.path.exists(CHROMA_DIR):
            return Chroma(persist_directory=CHROMA_DIR, embedding_function=embedding_model)
        return None

    # Process only new PDFs
    new_chunks = []
    for filename in new_pdfs:
        filepath = os.path.join(PDF_FOLDER, filename)
        loader = PyPDFLoader(filepath)
        documents = loader.load()
        splitter = CharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
        chunks = splitter.split_documents(documents)
        for i, chunk in enumerate(chunks):
            chunk.metadata["source_file"] = filename
            chunk.metadata["chunk_index"] = i
        new_chunks.extend(chunks)

    # Add to existing DB or create new one
    if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
        # Load existing DB
        vectordb = Chroma(persist_directory=CHROMA_DIR, embedding_function=embedding_model)
        vectordb.add_documents(new_chunks)
        print(f"Added {len(new_chunks)} chunks from {len(new_pdfs)} new PDFs to existing database.")
    else:
        # Create new DB
        os.makedirs(CHROMA_DIR, exist_ok=True)
        vectordb = Chroma.from_documents(
            documents=new_chunks,
            embedding=embedding_model,
            persist_directory=CHROMA_DIR
        )
        print(f"Database created with {len(new_chunks)} chunks from {len(new_pdfs)} PDFs.")

    # Update processed list
    processed.update(new_pdfs)
    save_processed_pdfs(processed)

    return vectordb

def get_vector_db():
    """Load the vector DB from disk. Raise error if not built yet."""
    if not os.path.exists(CHROMA_DIR):
        raise RuntimeError("Vector DB not built yet. Upload PDFs first.")
    return Chroma(persist_directory=CHROMA_DIR, embedding_function=embedding_model)