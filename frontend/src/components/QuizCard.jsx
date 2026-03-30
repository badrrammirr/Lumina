import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function QuizCard({ question, options, correctAnswer, index, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (opt) => {
    if (revealed) return
    setSelected(opt)
    setRevealed(true)
    if (onAnswer) onAnswer(opt === correctAnswer)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 hover:bg-white/[0.06] transition-all duration-500"
    >
      <p className="text-xs text-primary-400 font-semibold mb-2 tracking-wide">
        Question {index + 1}
      </p>
      <p className="text-gray-100 font-medium mb-5">{question}</p>
      <div className="space-y-2.5">
        {options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          const isCorrect = opt === correctAnswer
          const isSelected = opt === selected
          let cls = "w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-300 "

          if (!revealed) {
            cls += "border-white/10 hover:border-primary-500/40 hover:bg-primary-500/5 text-gray-300 cursor-pointer"
          } else if (isCorrect) {
            cls += "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default"
          } else if (isSelected) {
            cls += "border-red-500/40 bg-red-500/10 text-red-300 cursor-default"
          } else {
            cls += "border-white/5 text-gray-600 cursor-default"
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={cls}
            >
              <span className="font-medium mr-2 text-gray-400">{letter}.</span>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}