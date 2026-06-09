import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { deletePDF } from '../api/api'
import toast from 'react-hot-toast'
import {
  HiOutlineChatBubbleLeftRight, HiOutlineCloudArrowUp,
  HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineBolt,
  HiOutlineDocumentText, HiOutlineTrash, HiOutlineSparkles,
  HiOutlineRectangleStack, HiOutlineSignal, HiOutlineCpuChip
} from 'react-icons/hi2'

// Premium Feature Config
const features = [
  { to: '/ask', icon: HiOutlineChatBubbleLeftRight, title: 'Neural Chat', desc: 'Interrogate your documents with contextual AI.', badge: 'Core', color: 'from-cyan-400 to-blue-500' },
  { to: '/upload', icon: HiOutlineCloudArrowUp, title: 'Data Ingestion', desc: 'Inject raw PDFs into the Lumina vector matrix.', badge: null, color: 'from-sky-400 to-indigo-500' },
  { to: '/summary', icon: HiOutlineSparkles, title: 'Distillation', desc: 'Condense complex data into pure insights.', badge: 'New', color: 'from-violet-400 to-purple-600' },
  { to: '/quiz', icon: HiOutlineAcademicCap, title: 'Knowledge Matrix', desc: 'Evaluate retention through adaptive testing.', badge: null, color: 'from-emerald-400 to-teal-500' },
  { to: '/adaptive-quiz', icon: HiOutlineBolt, title: 'Focus Lens', desc: 'Target weak points with laser-guided quizzes.', badge: null, color: 'from-amber-400 to-orange-500' },
  { to: '/flashcards', icon: HiOutlineRectangleStack, title: 'Memory Sparks', desc: 'Forge instant recall with illuminated cards.', badge: 'New', color: 'from-pink-400 to-rose-500' },
]

export default function Dashboard() {
  const { pdfs, dbReady, fetchPDFs } = useApp()
  const [greeting, setGreeting] = useState("Welcome")
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Dynamic Time Greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  const handleDelete = async (filename) => {
    if (!window.confirm(`Permanently delete ${filename}?`)) return
    try {
      await deletePDF(filename)
      toast.success(`${filename} purged from system`)
      refreshPDFs()
    } catch (e) {
      toast.error('Deletion failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* HERO SECTION WITH CURSOR SPOTLIGHT */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        }}
        className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] p-10 md:p-16 min-h-[380px] flex flex-col justify-center"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,211,238,0.06), transparent 40%), linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.8) 100%)`
        }}
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 border border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute top-16 right-16 w-48 h-48 border border-purple-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em]">Lumina System Online</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            {greeting}.<br/>
            <span className="bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Illuminate your data.
            </span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl">
            Upload your documents and let Lumina's neural networks extract, map, and clarify every concept for you.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/upload"
              className="group relative px-8 py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
            >
              <span className="relative z-10 flex items-center gap-2"><HiOutlineCloudArrowUp className="w-5 h-5" /> Initialize Upload</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* STATS SECTION WITH SVG RINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: HiOutlineDocumentText,
            value: pdfs.length,
            label: 'Active Documents',
            color: '#06b6d4', // cyan-500
            percentage: Math.min(100, pdfs.length * 10)
          },
          {
            icon: HiOutlineSignal,
            value: dbReady ? 'Optimal' : 'Null',
            label: 'Vector Index',
            color: dbReady ? '#10b981' : '#ef4444', // emerald/red
            percentage: dbReady ? 100 : 0
          },
          {
            icon: HiOutlineCpuChip,
            value: 'Llama 3',
            label: 'Processing Core',
            color: '#8b5cf6', // violet-500
            percentage: 100
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 group hover:border-white/[0.12] transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-100 tracking-tight">{s.value}</p>
              </div>

              {/* Animated SVG Ring */}
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${s.percentage}, 100` }}
                    transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 4px ${s.color})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <s.icon className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TOOLKIT SECTION */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 tracking-tight">Lumina Toolkit</h2>
            <p className="text-sm text-gray-500 mt-1">Select a neural pathway to begin.</p>
          </div>
          <Link to="/performance" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
            View Analytics <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.to}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <Link to={f.to} className="group relative h-full block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">

                {/* Hover Glow Background */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${f.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`}></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    {f.badge && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        f.badge === 'New' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-gray-500 border border-white/10'
                      }`}>
                        {f.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>

                  <div className="mt-6 flex items-center text-xs font-medium text-gray-600 group-hover:text-cyan-400 transition-colors">
                    Enter module <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PREMIUM DOCUMENT VAULT */}
      {pdfs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-100">Data Vault</h2>
              <p className="text-xs text-gray-500 mt-1">{pdfs.length} files indexed and ready for queries.</p>
            </div>
          </div>

<div className="divide-y divide-white/[0.04]">
            {pdfs.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.05 }}
                className="flex items-center justify-between px-6 py-4 group hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlineDocumentText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 truncate max-w-md">{p}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Vectorized • Ready</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/viewer`}
                    className="text-xs text-gray-500 hover:text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(p)}
                    className="text-gray-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}