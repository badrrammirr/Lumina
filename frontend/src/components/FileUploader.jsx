import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadPDF } from '../api/api'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { HiOutlineCloudArrowUp, HiOutlineDocument, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2'

export default function FileUploader() {
  const { refreshPDFs, refreshStatus, userId } = useApp()
  const [files, setFiles] = useState([])

  // Reset files state when user changes (account switching)
  useEffect(() => {
    setFiles([])
  }, [userId])

  const onDrop = useCallback(async (accepted) => {
    const newFiles = accepted.map(f => ({ file: f, status: 'pending', progress: 0 }))
    setFiles(prev => [...prev, ...newFiles])

    // Process each file sequentially with proper async/await error handling
    for (const item of newFiles) {
      setFiles(prev => prev.map(f => f.file === item.file ? { ...f, status: 'uploading', progress: 50 } : f))
      try {
        await uploadPDF(item.file)
        setFiles(prev => prev.map(f => f.file === item.file ? { ...f, status: 'done', progress: 100 } : f))
        toast.success(`${item.file.name} uploaded!`)
      } catch (e) {
        // BUG FIX: Handle errors properly - access response data correctly for axios errors
        const errorMsg = e.response?.data?.detail || e.message || 'Upload failed'
        setFiles(prev => prev.map(f => f.file === item.file ? { ...f, status: 'error' } : f))
        toast.error(`Failed: ${item.file.name} - ${errorMsg}`)
      }
    }
    // Refresh PDFs and status only once after all uploads complete
    refreshPDFs()
    refreshStatus()
  }, [refreshPDFs, refreshStatus])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  })

  return (
    <div className="space-y-4">
      <div {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 overflow-hidden
          ${isDragActive
            ? 'border-primary-400 bg-primary-500/10'
            : 'border-white/[0.08] hover:border-primary-500/30 hover:bg-white/[0.03]'}`}
        style={isDragActive ? { boxShadow: '0 0 40px rgba(99,102,241,0.15), inset 0 0 40px rgba(99,102,241,0.05)' } : {}}>

        {/* Animated border gradient on drag */}
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent, rgba(6,182,212,0.1))' }} />
        )}

        <input {...getInputProps()} />
        <HiOutlineCloudArrowUp className={`w-16 h-16 mx-auto mb-4 transition-all duration-500
          ${isDragActive ? 'text-primary-400 scale-110 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'text-gray-600'}`} />
        <p className="text-lg font-medium text-gray-300 relative z-10">
          {isDragActive ? 'Drop your PDFs here…' : 'Drag & drop PDF files here'}
        </p>
        <p className="text-sm text-gray-500 mt-2 relative z-10">or click to browse</p>
      </div>

      <AnimatePresence>
        {files.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-glow flex items-center gap-4 p-4"
            style={item.status === 'done' ? { boxShadow: '0 0 20px rgba(16,185,129,0.1)' } : {}}>
            <HiOutlineDocument className={`w-8 h-8 flex-shrink-0 transition-all duration-300
              ${item.status === 'done' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-primary-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{item.file.name}</p>
              <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${item.status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-cyan-400'}`}
                  style={!isDragActive && item.status !== 'error' ? { boxShadow: '0 0 8px rgba(99,102,241,0.3)' } : {}}
                />
              </div>
            </div>
            {item.status === 'done' && <HiOutlineCheck className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
            {item.status === 'error' && <HiOutlineXMark className="w-6 h-6 text-red-400" />}
            {item.status === 'uploading' && (
              <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"
                style={{ boxShadow: '0 0 10px rgba(99,102,241,0.3)' }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}