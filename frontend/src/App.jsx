import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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
import ChatHistoryPage from './pages/ChatHistoryPage'
import { useApp } from './context/AppContext'
import ViewerPage from "./pages/ViewerPage"
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? <Navigate to="/" replace /> : children
}

export default function App() {
  const { sidebarOpen, pdfs } = useApp()

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
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
                    <Route path="/chat-history" element={<ChatHistoryPage />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}