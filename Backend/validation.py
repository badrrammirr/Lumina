from fastapi import HTTPException
import re

MAX_USERNAME_LENGTH = 50
MAX_PASSWORD_LENGTH = 128
MAX_TITLE_LENGTH = 200
MAX_CONTENT_LENGTH = 10000

def validate_username(username: str) -> str:
    """Validate username format and length."""
    username = username.strip() if username else ""

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    if len(username) > MAX_USERNAME_LENGTH:
        raise HTTPException(status_code=400, detail=f"Username cannot exceed {MAX_USERNAME_LENGTH} characters")

    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, underscores, and hyphens")

    return username

def validate_email(email: str) -> str:
    """Validate email format."""
    if not email:
        return None

    email = email.strip()
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(pattern, email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    return email

def validate_password(password: str) -> str:
    """Validate password strength."""
    if not password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if len(password) > MAX_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Password cannot exceed {MAX_PASSWORD_LENGTH} characters")

    return password

def validate_title(title: str) -> str:
    """Validate title/chat name."""
    title = title.strip() if title else ""

    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    if len(title) > MAX_TITLE_LENGTH:
        raise HTTPException(status_code=400, detail=f"Title cannot exceed {MAX_TITLE_LENGTH} characters")

    return title

def validate_content(content: str) -> str:
    """Validate content length."""
    content = content.strip() if content else ""

    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    if len(content) > MAX_CONTENT_LENGTH:
        raise HTTPException(status_code=400, detail=f"Content cannot exceed {MAX_CONTENT_LENGTH} characters")

    return content

def validate_question(question: str) -> str:
    """Validate question format."""
    question = question.strip() if question else ""

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if len(question) > MAX_CONTENT_LENGTH:
        raise HTTPException(status_code=400, detail="Question is too long")

    return question

def validate_page_params(k: int = 3) -> int:
    """Validate pagination parameters."""
    if k < 1:
        raise HTTPException(status_code=400, detail="k must be at least 1")

    if k > 50:
        raise HTTPException(status_code=400, detail="k cannot exceed 50")

    return k

def validate_quiz_params(num_questions: int = 20) -> int:
    """Validate quiz parameters."""
    if num_questions < 1:
        raise HTTPException(status_code=400, detail="Number of questions must be at least 1")

    if num_questions > 100:
        raise HTTPException(status_code=400, detail="Number of questions cannot exceed 100")

    return num_questions
