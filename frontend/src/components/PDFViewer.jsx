import React, { useState, useEffect } from "react"
import { Document, Page } from "react-pdf"
import {
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from "react-icons/hi2"

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { pdfjs } from 'react-pdf'
import { getPdfBlob } from '../api/api'

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default function PDFViewer({ fileUrl, filename }) {
  const [numPages, setNumPages] = useState(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [loadingBlob, setLoadingBlob] = useState(false)
  const [blobError, setBlobError] = useState(false)

  useEffect(() => {
    if (!fileUrl || !filename) {
      setPdfBlob(null)
      setNumPages(null)
      setPage(1)
      return
    }

    setLoadingBlob(true)
    setBlobError(false)
    getPdfBlob(filename)
      .then(blob => {
        setPdfBlob(new Blob([blob], { type: 'application/pdf' }))
      })
      .catch(() => {
        setBlobError(true)
        setPdfBlob(null)
      })
      .finally(() => {
        setLoadingBlob(false)
      })
  }, [fileUrl, filename])

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setPage(1)
  }

  if (!fileUrl) {
    return (
      <div className="glass flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/15 flex items-center justify-center mb-4 animate-float">
          <HiOutlineDocumentText className="w-8 h-8 text-primary-400" />
        </div>
        <h3 className="text-gray-300 font-medium mb-1">No PDF selected</h3>
        <p className="text-sm text-gray-500">Choose a document from the dropdown above</p>
      </div>
    )
  }

  if (loadingBlob) {
    return (
      <div className="glass flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500">Fetching authenticated document...</p>
      </div>
    )
  }

  if (blobError) {
    return (
      <div className="glass flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-400 text-sm mb-2">Failed to load PDF</p>
        <p className="text-xs text-gray-500 mb-4 max-w-xs">Make sure the backend is running and you have access to this file.</p>
        <button onClick={() => window.location.reload()} className="text-xs text-primary-400 underline hover:text-primary-300">Retry</button>
      </div>
    )
  }

  const blobUrl = pdfBlob ? URL.createObjectURL(pdfBlob) : ""

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between glass px-4 py-3">
        <span className="text-sm text-gray-400 truncate max-w-[200px]">{filename || "PDF Viewer"}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">Page {page} / {numPages}</span>

          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <HiOutlineChevronLeft className="w-4 h-4" />
          </button>

          <button onClick={() => setPage(p => Math.min(numPages || 1, p + 1))} disabled={page >= (numPages || 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <HiOutlineChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1"></div>

          <button onClick={() => setScale(s => Math.min(2, s + 0.2))} disabled={scale >= 2} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <HiOutlineMagnifyingGlassPlus className="w-4 h-4" />
          </button>

          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} disabled={scale <= 0.5} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <HiOutlineMagnifyingGlassMinus className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1"></div>

          {blobUrl && (
            <a href={blobUrl} download={filename || "document.pdf"} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Download PDF">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            </a>
          )}
        </div>
      </div>

      <div className="glass overflow-auto max-h-[calc(100vh-14rem)] rounded-2xl p-4 flex justify-center">
        <Document
          file={blobUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-red-400 text-sm mb-2">Failed to load PDF</p>
              <p className="text-xs text-gray-500 mb-4 max-w-xs">Make sure the backend is running and the file URL is correct.</p>
              <button onClick={() => window.location.reload()} className="text-xs text-primary-400 underline hover:text-primary-300">Retry</button>
            </div>
          }
        >
          <Page
            pageNumber={page}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  )
}