def analyze_results(results):
    if not results:
        return []

    chunk_analysis = {}
    for r in results:
        # Robust key handling
        cid = r.get("chunk_id") or r.get("chunkId")
        time_taken = r.get("time_taken") or r.get("timeTaken")
        quiz_duration = r.get("quiz_duration") or r.get("quizDuration")
        is_correct = r.get("is_correct") or r.get("isCorrect")

        if cid is None: continue

        if cid not in chunk_analysis:
            chunk_analysis[cid] = {"total": 0, "correct": 0, "time": 0, "quiz_time": 0}

        chunk_analysis[cid]["total"] += 1
        chunk_analysis[cid]["time"] += time_taken or 0
        chunk_analysis[cid]["quiz_time"] += quiz_duration or 0
        if is_correct: chunk_analysis[cid]["correct"] += 1

    weak_chunks = []
    for cid, data in chunk_analysis.items():
        if data["total"] == 0: continue
        accuracy = data["correct"] / data["total"] * 100
        avg_student_time = data["time"] / data["total"]
        avg_quiz_time = data["quiz_time"] / data["total"]

        speed_score = 0
        if avg_student_time > 0:
            speed_score = min((avg_quiz_time / avg_student_time) * 100, 100)

        performance = (accuracy * 0.7) + (speed_score * 0.3)
        if performance < 60:
            weak_chunks.append(cid)

    return weak_chunks