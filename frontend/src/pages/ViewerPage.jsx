import React, { useState } from "react"
import { useApp } from "../context/AppContext"
import PDFViewer from "../components/PDFViewer"
import { HiOutlineDocumentText, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2"

export default function ViewerPage() {
  const { pdfs } = useApp()
  const [selectedPdf, setSelectedPdf] = useState("")

  const fileUrl = selectedPdf ? `http://127.0.0.1:8000/pdf-file/${encodeURIComponent(selectedPdf)}` : ""

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <HiOutlineDocumentText className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">Document Console</h1>
          <p className="text-sm text-gray-500 mt-0.5">Render and inspect raw document data.</p>
        </div>
      </div>

      {/* Unified Toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <select
          value={selectedPdf}
          onChange={(e) => setSelectedPdf(e.target.value)}
          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-sky-500/50 transition-colors cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 12 12'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m3 4.5 3 3 3-3'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
        >
          <option value="">Select a document to render...</option>
          {pdfs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Open in New Tab Button */}
        {selectedPdf && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-sky-400 bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/20 hover:bg-sky-500/5 transition-all"
          >
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Open Raw</span>
          </a>
        )}
      </div>

      {/* Document Viewport Frame */}
      <div className="rounded-2xl border border-white/[0.06] bg-black/30 backdrop-blur-sm overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <PDFViewer
          fileUrl={fileUrl}
          filename={selectedPdf}
        />
      </div>
    </div>
  )
}