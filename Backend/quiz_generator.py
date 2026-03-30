# quiz_generator.py
from config import NUM_QUIZ_QUESTIONS


def generate_quiz(summary, llm):
    prompt = f"""
    Create {NUM_QUIZ_QUESTIONS} multiple choice questions from this text.

    IMPORTANT: For each question, clearly state the topic or context.

    Format each question exactly like this:

    Question: [The question text]
    A) [Option A]
    B) [Option B]
    C) [Option C]
    D) [Option D]
    Correct Answer: [Letter]

    Text:
    {summary}
    """

    response = llm.invoke(prompt)
    return response