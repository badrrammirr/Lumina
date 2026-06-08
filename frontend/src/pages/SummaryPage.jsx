import React, { useState, useEffect } from "react"
import { generateSummary } from "../api/api"
import { useApp } from "../context/AppContext"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { HiOutlineSparkles, HiOutlineClipboard } from "react-icons/hi2"

export default function SummaryPage() {
  const { pdfs, isAuthorized } = useApp()
  const [source, setSource] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthorized) {
      setSummary("")
      setSource("")
      setCopied(false)
    }
  }, [isAuthorized])

  const handleGenerate = async () => {
    setLoading(true)
    setSummary("")
    try {
      const res = await generateSummary(source || null)
      if (res.error) throw new Error(res.error)
      setSummary(res.summary)
      toast.success("Distillation complete.")
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Failed to distill document")
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <HiOutlineSparkles className="w-6 h-6 text-violet-400" />
          </div>
          Distillation
        </h1>
        <p className="text-sm text-gray-500 mt-2 ml-11">Condense dense texts into brilliant key insights.</p>
      </div>

      {/* Configuration Panel */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
        <div>
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">Source Context</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
          >
            <option value="">All Documents</option>
            {pdfs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !pdfs || pdfs.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiOutlineSparkles className="w-5 h-5" />}
          {loading ? "Distilling..." : "Distill Document"}
        </button>
      </div>

      {/* Premium Loading State */}
      {loading && !summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-12 flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Analyzing document content and generating insights...</p>
        </motion.div>
      )}

      {/* Empty State - No PDFs uploaded */}
      {!loading && (!pdfs || pdfs.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-12 text-center"
        >
          <HiOutlineSparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-2">No Documents Available</h3>
          <p className="text-sm text-gray-500 mb-4">Upload a PDF first to generate summaries.</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
          >
            Go to Upload
          </Link>
        </motion.div>
      )}

      {/* Extracted Insights Output */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 relative overflow-hidden"
        >
          {/* Background Glow Effect */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                <span className="text-xs text-violet-400 uppercase tracking-widest font-semibold">Extracted Insights</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              >
                <HiOutlineClipboard className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Markdown Content Area */}
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed prose-headings:text-white prose-headings:font-semibold prose-p:mb-4 prose-li:my-1.5 prose-ul:ml-0 list-disc:marker:text-violet-400">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}