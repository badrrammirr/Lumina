import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AskPage from './pages/AskPage'
import UploadPage from './pages/UploadPage'
import QuizPage from './pages/QuizPage'
import PerformancePage from './pages/PerformancePage'
import AdaptiveQuizPage from './pages/AdaptiveQuizPage'
import SummaryPage from './pages/SummaryPage'
import FlashcardPage from './pages/FlashcardPage'
import PDFViewer from './components/PDFViewer'
import { useApp } from './context/AppContext'
import ViewerPage from "./pages/ViewerPage"

export default function App() {
  const { sidebarOpen, pdfs } = useApp()
  const [viewerFile, setViewerFile] = React.useState(null)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900 relative">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-out relative z-10 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/viewer" element={<ViewerPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/adaptive-quiz" element={<AdaptiveQuizPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/flashcards" element={<FlashcardPage />} />
            <Route path="/viewer" element={
              <div className="max-w-5xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-100">PDF Viewer</h1>
                    <p className="text-sm text-gray-500">Read your documents right here in the app</p>
                  </div>
                  <select
                    value={viewerFile || ""}
                    onChange={(e) => setViewerFile(e.target.value)}
                    className="input-field w-auto text-sm"
                  >
                    <option value="">Select a document...</option>
                    {pdfs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {viewerFile && (
                  <div className="flex-1 min-h-0">
                    <PDFViewer
                      fileUrl={`http://127.0.0.1:8000/pdf-file/${viewerFile}`}
                      filename={viewerFile}
                    />
                  </div>
                )}
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}