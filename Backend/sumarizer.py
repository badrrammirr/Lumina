def summarize_text(text, llm):

    prompt = f"""
    Summarize the following educational text in clear bullet points.

    Text:
    {text}
    """

    response = llm.invoke(prompt)

    return response