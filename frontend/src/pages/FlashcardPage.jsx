import React, { useState } from "react"
import { generateFlashcards } from "../api/api"
import { useApp } from "../context/AppContext"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  HiOutlineSparkles, HiOutlineArrowPath, HiOutlineCheck,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineClipboardDocumentCheck
} from "react-icons/hi2"

function Flashcard({ card, index, onMark }) {
  const [flipped, setFlipped] = useState(false)
  const [marked, setMarked] = useState(null)

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* PERSPECTIVE CONTAINER */}
      <div
        className="relative w-full h-[28rem] cursor-pointer"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* 3D FLIP CONTAINER */}
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* FRONT FACE */}
          <div
            className="absolute inset-0 flex flex-col p-8 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            {card.topic && (
              <span className="self-start text-[10px] text-pink-400/80 uppercase tracking-widest font-bold bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 mb-4">
                {card.topic}
              </span>
            )}
            <div className="my-auto w-full flex flex-col items-center overflow-y-auto pr-2" style={{ maxHeight: "100%" }}>
              <p className="text-gray-200 font-medium text-center text-base leading-relaxed">
                {card.front}
              </p>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 flex flex-col p-8 bg-gray-800/90 backdrop-blur-xl border border-pink-500/15 rounded-2xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="my-auto w-full flex flex-col items-center overflow-y-auto pr-2" style={{ maxHeight: "100%" }}>
              <p className="text-gray-200 font-light text-center text-base leading-relaxed">
                {card.back}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ACTION BUTTONS */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5 flex items-center gap-2 bg-gray-800/60 backdrop-blur-xl p-1.5 rounded-xl border border-white/10"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setMarked("know"); onMark("know"); toast.success("Memory ignited."); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                marked === "know" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-gray-400 hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <HiOutlineCheck className="w-4 h-4" /> Mastered
            </button>

            <div className="w-px h-5 bg-white/10"></div>

            <button
              onClick={(e) => { e.stopPropagation(); setMarked("practice"); onMark("practice"); toast("Marked for review."); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                marked === "practice" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-gray-400 hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <HiOutlineArrowPath className="w-4 h-4" /> Needs Review
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FlashcardPage() {
  const { pdfs } = useApp()
  const [source, setSource] = useState("")
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [numCards, setNumCards] = useState(10)
  const [showReview, setShowReview] = useState(false)

  const [reviewList, setReviewList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("flashcard_review") || "[]") }
    catch { return [] }
  })

  const knowCount = reviewList.filter(r => r.mark === "know").length
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await generateFlashcards(source || null, numCards)
      const text = res.cards
      const cleanText = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCards(parsed)
          setCurrentIndex(0)
          setShowReview(false)
          toast.success(`${parsed.length} sparks generated.`)
        } else {
          throw new Error("Could not parse flashcards.")
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to generate sparks")
    }
    setLoading(false)
  }

  const handleMark = (index, mark) => {
    let updated = [...reviewList]
    const existingIndex = updated.findIndex(r => r.index === index)
    if (existingIndex > -1) updated.splice(existingIndex, 1)
    updated.push({ index, mark })
    setReviewList(updated)
    localStorage.setItem("flashcard_review", JSON.stringify(updated))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <HiOutlineSparkles className="w-7 h-7 text-pink-400 animate-pulse" />
          </div>
          Memory Sparks
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">Forge instant recall with illuminated flip cards.</p>
      </div>

      {/* Controls Panel */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Source Context</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field cursor-pointer bg-white/[0.03] border-white/[0.08]">
              <option value="">All Documents</option>
              {pdfs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Spark Count</label>
            <input
              type="number" value={numCards} onChange={(e) => setNumCards(Math.max(1, parseInt(e.target.value) || 1))}
              min={1} max={30} className="input-field bg-white/[0.03] border-white/[0.08]"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !source}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiOutlineSparkles className="w-5 h-5" />}
          {loading ? "Igniting..." : "Generate Sparks"}
        </button>
      </div>

      {/* Active Flashcard Area */}
      {cards.length > 0 && (
        <div className="space-y-6">

          {/* Top Stats & Progress Bar */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-medium">Processing Spark <span className="text-white">{currentIndex + 1}</span> of {cards.length}</span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-emerald-400 flex items-center gap-1"><HiOutlineCheck className="w-3.5 h-3.5"/> {knowCount} Mastered</span>
                <span className="text-gray-500">{reviewList.length - knowCount} Pending</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ boxShadow: '0 0 12px rgba(236,72,153,0.4)' }}
              />
            </div>
          </div>

          {/* The Flashcard Itself */}
          <div className="flex justify-center min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Flashcard card={cards[currentIndex]} index={currentIndex} onMark={(mark) => handleMark(currentIndex, mark)} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sleek Bottom Navigation */}
          <div className="flex items-center justify-between rounded-2xl p-2 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex <= 0} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <HiOutlineChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button onClick={() => setShowReview(!showReview)} className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl transition-all ${showReview ? "bg-pink-500/15 text-pink-400 border border-pink-500/20" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
              <HiOutlineClipboardDocumentCheck className="w-4 h-4" />
              Session Log ({reviewList.length})
            </button>

            <button onClick={() => setCurrentIndex(p => Math.min(cards.length - 1, p + 1))} disabled={currentIndex >= cards.length - 1} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Next <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Review List Drawer */}
      <AnimatePresence>
        {showReview && reviewList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 32 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">Session Log</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {reviewList.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${
                      r.mark === "know"
                        ? "bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10"
                        : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-xs text-gray-600 font-mono w-6 text-right">{r.index + 1}</span>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.mark === "know" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"}`}></div>
                    <p className="text-sm text-gray-300 flex-1 truncate group-hover:text-white transition-colors">{cards[r.index] ? cards[r.index].front : "Card " + r.index}</p>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide ${
                      r.mark === "know" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                    }`}>
                      {r.mark === "know" ? "MASTERED" : "PRACTICE"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}