import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchStatus, fetchPDFs } from '../api/api'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [pdfs, setPdfs] = useState([])
  const [dbReady, setDbReady] = useState(false)
  const [quizResults, setQuizResults] = useState([])
  const [weakChunks, setWeakChunks] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const refreshStatus = async () => {
    try {
      const res = await fetchStatus()
      setDbReady(res.status.includes('ready'))
    } catch { setDbReady(false) }
  }

  const refreshPDFs = async () => {
    try {
      const res = await fetchPDFs()
      setPdfs(res.pdfs || [])
    } catch { setPdfs([]) }
  }

  useEffect(() => {
    refreshStatus()
    refreshPDFs()
  }, [])

  return (
    <AppContext.Provider value={{
      pdfs, setPdfs, fetchPDFs, dbReady, setDbReady, quizResults, setQuizResults,
      weakChunks, setWeakChunks, sidebarOpen, setSidebarOpen,
      refreshStatus, refreshPDFs
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)