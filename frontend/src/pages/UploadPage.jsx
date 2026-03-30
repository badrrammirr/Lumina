import React from 'react'
import FileUploader from '../components/FileUploader'
import { useApp } from '../context/AppContext'
import { HiOutlineDocumentText, HiOutlineCheck } from 'react-icons/hi2'
import { motion } from 'framer-motion'

export default function UploadPage() {
  const { pdfs } = useApp()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 tracking-tight">Data Ingestion</h1>
        <p className="text-sm text-gray-500 mt-1">Upload documents to initialize the Lumina vector matrix.</p>
      </div>

      {/* Uploader Component */}
      <FileUploader />

      {/* System Registry / Uploaded Files */}
      {pdfs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
        >
          {/* List Header */}
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4 text-cyan-400" />
              System Registry
            </h2>
            <span className="text-xs text-gray-500 font-mono bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
              {pdfs.length} files active
            </span>
          </div>

          {/* File List */}
          <div className="divide-y divide-white/[0.04]">
            {pdfs.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-4 px-6 py-4 group hover:bg-white/[0.02] transition-colors duration-300"
              >
                {/* Icon Container */}
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 border border-cyan-500/10 group-hover:border-cyan-500/30 transition-colors duration-300">
                  <HiOutlineDocumentText className="w-5 h-5 text-cyan-400" />
                </div>

                {/* File Info */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{p}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Embedded & Chunked</p>
                </div>

                {/* Premium Status Pill */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0"
                  style={{ boxShadow: '0 0 15px rgba(16,185,129,0.08)' }}
                >
                  <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Vectorized
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}