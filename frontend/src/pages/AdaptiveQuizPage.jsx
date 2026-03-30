import React, { useState, useEffect } from 'react'
import { generateAdaptiveQuiz } from '../api/api'
import { useApp } from '../context/AppContext'
import QuizCard from '../components/QuizCard'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { HiOutlineBolt, HiOutlineArrowLeft } from 'react-icons/hi2'
import { Link } from 'react-router-dom'

export default function AdaptiveQuizPage() {
  const { weakChunks } = useApp()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    const autoGenerate = async () => {
      if (!weakChunks?.length) {
        setError("No weak nodes identified. Please complete a standard quiz first to map your knowledge gaps.")
        setLoading(false)
        return
      }
      try {
        const res = await generateAdaptiveQuiz(weakChunks)
        let cleanText = res.questions.replace(/```json/g, '').replace(/```/g, '').trim()
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed)
            setScore(prev => ({ ...prev, total: parsed.length }))
          }
          else setError("AI returned empty query set.")
        } else setError("AI returned invalid structural format.")
      } catch (e) {
        setError("Failed to establish adaptive link.")
      }
      finally { setLoading(false) }
    }
    autoGenerate()
  }, [weakChunks])

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast.success('Target acquired.')
    } else {
      toast.error('Missed target.')
    }
  }

  const progressPercentage = score.total > 0 ? (score.correct / score.total) * 100 : 0

  // PREMIUM LOADING STATE
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto mt-32 flex flex-col items-center"
      >
        <div className="relative w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/5 animate-ping" style={{ animationDuration: '2s' }}></div>
          <HiOutlineBolt className="w-10 h-10 text-amber-400 animate-pulse relative z-10" />
        </div>
        <p className="text-gray-300 font-medium mb-1">Calibrating Focus Lens</p>
        <p className="text-gray-600 text-sm">Analyzing weak nodes and generating targeted queries...</p>
      </motion.div>
    )
  }

  // PREMIUM ERROR STATE
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] backdrop-blur-sm p-10 text-center"
        >
          <h2 className="text-xl font-bold text-red-400 mb-2">System Idle</h2>
          <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto leading-relaxed">{error}</p>
          <Link
            to="/performance"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> Return to Analytics
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header & Target Nodes */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <HiOutlineBolt className="w-6 h-6 text-amber-400" />
          </div>
          Focus Lens
        </h1>
        <p className="text-sm text-gray-500 mt-2 ml-11">Laser-guided queries targeting your specific knowledge gaps.</p>

        {/* Weak Nodes Readout */}
        <div className="mt-4 ml-11 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Targeting Weak Nodes:</p>
          <div className="flex gap-2 flex-wrap">
            {weakChunks.map((c, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20">
                {c}
              </span>
            ))}
          </div>
        </div>
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
              Targets Hit: <span className="text-white">{score.correct} / {score.total}</span>
            </span>
            <span className="text-amber-400 font-bold">
              {Math.round(progressPercentage)}% Accuracy
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ boxShadow: '0 0 12px rgba(245,158,11,0.4)' }}
            />
          </div>
        </motion.div>
      )}

      {/* Questions List */}
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
    </div>
  )
}