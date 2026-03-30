from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_chroma import Chroma
from groq import Groq
from config import CHROMA_DIR, GROQ_API_KEY
from pydantic import BaseModel
from typing import List, Optional

client = Groq(api_key=GROQ_API_KEY)
embedding_model = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

MODEL = "llama-3.3-70b-versatile"


class QuestionResponse(BaseModel):
    answer: str
    sources: List[str]


def ask_question(question: str, vectordb: Chroma, k: int = 3, source: Optional[str] = None) -> QuestionResponse:
    is_summary_request = any(word in question.lower() for word in ["summarize", "summary", "explain", "overview"])
    if is_summary_request:
        k = 15

    search_kwargs = {"k": k}
    if source:
        search_kwargs["filter"] = {"source_file": source}

    try:
        results = vectordb.similarity_search(question, **search_kwargs)
    except Exception as e:
        return QuestionResponse(answer=f"Error searching database: {str(e)}", sources=[])

    if not results:
        return QuestionResponse(answer="No relevant information found in the uploaded PDFs.", sources=[])

    context = "\n\n".join([doc.page_content for doc in results])

    if is_summary_request:
        system_msg = """You are an AI study tutor. Provide a comprehensive explanation or summary
based ONLY on the provided context. If the context is unrelated to the question, state that clearly."""
    else:
        system_msg = """You are an AI study tutor. Answer the question using ONLY the provided context.
Be concise and accurate. If the answer is not in the context, say:
"The document does not mention this specific detail." Do not make up information."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
            ],
            temperature=0.1,
            max_tokens=1024,
        )
        answer_text = response.choices[0].message.content
    except Exception as e:
        answer_text = f"Error generating answer from AI: {str(e)}"

    sources = list(set(doc.metadata.get("source_file", "unknown") for doc in results))
    return QuestionResponse(answer=answer_text, sources=sources)


def generate_quiz_from_topic(context: str, topic: str, num_questions: int) -> str:
    if not context or len(context) < 50:
        return "Error: Not enough content to generate a quiz."

    prompt = f"""Generate EXACTLY {num_questions} multiple-choice quiz questions about "{topic}" based ONLY on the provided study material.

Return ONLY a valid JSON array with EXACTLY {num_questions} objects.
Each object must have:
- "question": string
- "options": array of exactly 4 strings
- "correct": string that matches one option exactly

IMPORTANT: Randomize the position of the correct answer. Do NOT always place it first.

Study Material:
{context}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a quiz generator. Return ONLY valid JSON arrays. No markdown, no explanation, no text outside the JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content

        # Groq with json_object returns an object, wrap in array if needed
        import json
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            if "questions" in parsed:
                return json.dumps(parsed["questions"])
            if "quiz" in parsed:
                return json.dumps(parsed["quiz"])
            # If it's a single question object, wrap it
            if "question" in parsed:
                return json.dumps([parsed])
        return raw

    except Exception as e:
        return f"Error generating quiz: {str(e)}"


def summarize_document(context: str) -> str:
    prompt = f"""Summarize the following document in clear, organized bullet points.
 Cover the main topics, key concepts, and important details.

 Document:
 {context}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a study assistant. Create clear, organized summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2048,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"


def generate_flashcards(context: str, num_cards: int = 10) -> str:
    prompt = f"""Create exactly {num_cards} flashcards for studying.

 Return ONLY a valid JSON object with a "flashcards" key containing an array. Each card must have:
 - "front": string (short question, one sentence max)
 - "back": string (detailed answer, 2-3 sentences)
 - "topic": string (category)

 Make them varied in difficulty. No markdown outside JSON.

 Material:
 {context}"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a flashcard generator. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4096,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        import json
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            if "flashcards" in parsed:
                return json.dumps(parsed["flashcards"])
            if "cards" in parsed:
                return json.dumps(parsed["cards"])
        if isinstance(parsed, list):
            return json.dumps(parsed)
        return raw
    except Exception as e:
        return f"Error: {str(e)}"