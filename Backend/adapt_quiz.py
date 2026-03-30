# Backend/adapt_quiz.py
from ai_module import generate_quiz_from_topic


def generate_adaptive_quiz(weak_chunks, vectordb):
    context = []

    for cid in weak_chunks:
        # SMART RETRIEVAL LOGIC
        if ".pdf" in str(cid):
            try:
                # Retrieve more chunks to support a larger quiz (15 questions)
                docs = vectordb.similarity_search("", k=10, filter={"source_file": cid})
                for d in docs:
                    context.append(d.page_content)
            except Exception as e:
                print(f"Error fetching source {cid}: {e}")
        else:
            # Fallback: If it's a generic ID, do a standard similarity search
            docs = vectordb.similarity_search(str(cid), k=5)
            for d in docs:
                context.append(d.page_content)

    if not context:
        return "Error: Could not retrieve content for the identified weak areas."

    # Combine all found text
    full_context = "\n\n".join(context)

    # Generate the quiz (15 questions) using the AI module

    return generate_quiz_from_topic(full_context, "Weak Areas Review", 15)