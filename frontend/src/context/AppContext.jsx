import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchStatus, fetchPDFs, getMe } from '../api/api'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [pdfs, setPdfs] = useState([])
  const [dbReady, setDbReady] = useState(false)
  const [quizResults, setQuizResults] = useState([])
  const [weakChunks, setWeakChunks] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(true)

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

  const verifyUser = async () => {
    try {
      const userData = await getMe()
      setUser(userData)
      setIsAuthorized(true)
    } catch (error) {
      setIsAuthorized(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsAuthorized(false)
      return
    }

    verifyUser()
    refreshStatus()
    refreshPDFs()
  }, [])

  return (
    <AppContext.Provider value={{
      pdfs, setPdfs, fetchPDFs, dbReady, setDbReady, quizResults, setQuizResults,
      weakChunks, setWeakChunks, sidebarOpen, setSidebarOpen,
      refreshStatus, refreshPDFs, user, setUser, isAuthorized, setIsAuthorized
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)