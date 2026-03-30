import React, { useState } from 'react'
import { generateQuiz } from '../api/api'
import { useApp } from '../context/AppContext'
import QuizCard from '../components/QuizCard'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineAcademicCap } from 'react-icons/hi2'

export default function QuizPage() {
  const { pdfs, setQuizResults } = useApp()
  const [topic, setTopic] = useState('')
  const [source, setSource] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const handleGenerateQuiz = async () => {
    setLoading(true)
    setQuestions([])
    setScore({ correct: 0, total: 0 })
    setQuizResults([])
    try {
      const res = await generateQuiz(topic, source || null, 20)
      if (res.error) throw new Error(res.error)
      let text = res.quiz
      if (!text) throw new Error("No quiz text received")
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setQuestions(parsed)
        setScore(prev => ({ ...prev, total: parsed.length }))
        toast.success(`Matrix initialized: ${parsed.length} queries loaded.`)
      } else {
        throw new Error('Could not parse quiz structure.')
      }
    } catch (e) {
      toast.error(e.message || 'Failed to generate matrix')
    }
    setLoading(false)
  }

  const handleAnswer = (isCorrect) => {
    setQuizResults(prev => [...prev, {
      chunk_id: source || "general_matrix",
      is_correct: isCorrect,
      time_taken: 10,
      quiz_duration: 15,
      topic: topic || "Random"
    }])

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast.success('Target hit.')
    } else {
      toast.error('Missed target.')
    }
  }

  const progressPercentage = score.total > 0 ? (score.correct / score.total) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <HiOutlineAcademicCap className="w-6 h-6 text-violet-400" />
          </div>
          Knowledge Matrix
        </h1>
        <p className="text-sm text-gray-500 mt-2 ml-12">Evaluate retention through structured, AI-generated testing.</p>
      </div>

      {/* Configuration Panel */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
        <div>
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Topic Query (Optional)</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Neural Networks, Quantum Mechanics..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Source Context (Optional)</label>
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            className="input-field cursor-pointer bg-white/[0.03] border-white/[0.08]"
          >
            <option value="">All Documents</option>
            {pdfs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiOutlineSparkles className="w-5 h-5" />}
          {loading ? 'Generating Matrix...' : 'Initialize 20 Queries'}
        </button>
      </div>

      {/* Premium Score Tracker */}
      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-medium">
              Progress: <span className="text-white">{score.correct} / {score.total}</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {Math.round(progressPercentage)}% Accuracy
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ boxShadow: '0 0 12px rgba(52,211,153,0.4)' }}
            />
          </div>
        </motion.div>
      )}

      {/* Questions List */}
      <AnimatePresence mode="wait">
        <div className="space-y-6">
          {questions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuizCard
                index={i}
                question={q.question}
                options={q.options}
                correctAnswer={q.correct}
                onAnswer={handleAnswer}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}