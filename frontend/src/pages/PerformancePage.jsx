import React, { useState, useEffect } from 'react'
import { analyzeResults } from '../api/api'
import { useApp } from '../context/AppContext'
import PerformanceChart from '../components/PerformanceChart'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { HiOutlineChartBar, HiOutlineExclamationTriangle, HiOutlineBolt } from 'react-icons/hi2'
import { Link } from 'react-router-dom'

export default function PerformancePage() {
  const { setWeakChunks, quizResults, isAuthorized } = useApp()
  const [results, setResults] = useState(null)
  const [weakList, setWeakList] = useState([])
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState([])

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthorized) {
      setResults(null)
      setWeakList([])
      setChartData([])
    }
  }, [isAuthorized])

  const analyze = async () => {
    setLoading(true)
    try {
      if (!quizResults?.length) {
        toast.error("Insufficient data. Please complete a standard quiz first.");
        setLoading(false)
        return
      }
      const res = await analyzeResults(quizResults)
      const weakChunks = res.weak_chunks || []
      setWeakList(weakChunks)
      setWeakChunks(weakChunks)

      const chunks = {}
      quizResults.forEach(r => {
        const id = r.chunk_id
        if (!id) return
        if (!chunks[id]) chunks[id] = { total: 0, correct: 0 }
        chunks[id].total++
        if (r.is_correct) chunks[id].correct++
      })

      const data = Object.entries(chunks).map(([id, d]) => ({
        label: id,
        accuracy: Math.round((d.correct / d.total) * 100)
      }))

      setChartData(data)
      setResults(true)
      toast.success('Diagnostics complete.')
    } catch (e) {
      // BUG FIX: Better error message extraction from axios errors
      const errorMsg = e.response?.data?.detail || e.message || 'Unknown error occurred'
      toast.error(`Failed to analyze performance matrix: ${errorMsg}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <HiOutlineChartBar className="w-6 h-6 text-teal-400" />
          </div>
          Neural Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-2 ml-11">Map your cognitive strengths and identify knowledge gaps.</p>
      </div>

      {/* Diagnostic Trigger */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          <span>Requires completed quiz data to generate accuracy topology.</span>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiOutlineChartBar className="w-5 h-5" />}
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {/* Analytics Output */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.06]">
            <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
            <h2 className="text-base font-semibold text-gray-200">Accuracy by Context</h2>
          </div>

          {chartData.length > 0 ? (
            <PerformanceChart data={chartData} />
          ) : (
            <div className="text-center py-10 text-gray-600 text-sm">
              No parseable context data found in recent sessions.
            </div>
          )}
        </motion.div>
      )}

      {/* Knowledge Gaps / Weak Areas */}
      {weakList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-amber-500/10">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-amber-400">Knowledge Gaps Identified</h2>
          </div>

          <div className="space-y-2 mb-6">
            {weakList.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-amber-500/[0.04] rounded-xl p-4 border border-amber-500/10 group hover:bg-amber-500/[0.07] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">WEAK</span>
                  <span className="text-gray-200 font-medium text-sm">{c}</span>
                </div>
                <span className="text-xs text-gray-600">Low retention</span>
              </motion.div>
            ))}
          </div>

          {/* FIX: Replaced window.location.href with React Router Link */}
          <Link
            to="/adaptive-quiz"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-[1.01] active:scale-[0.99]"
          >
            <HiOutlineBolt className="w-5 h-5" /> Launch Focus Lens
          </Link>
        </motion.div>
      )}
    </div>
  )
}