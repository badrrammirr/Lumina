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
  const [userId, setUserId] = useState(null)

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
      setUserId(userData.id)
      // Fetch PDFs only after confirming user is authorized
      await refreshPDFs()
      await refreshStatus()
    } catch (error) {
      setIsAuthorized(false)
      setUserId(null)
      // Clear user-specific data on auth failure
      clearUserData()
    }
  }

  const clearUserData = () => {
    setPdfs([])
    setDbReady(false)
    setQuizResults([])
    setWeakChunks([])
    setUser(null)
    setUserId(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsAuthorized(false)
      clearUserData()
      return
    }

    verifyUser()
  }, [])

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' && !e.newValue) {
        clearUserData()
        setIsAuthorized(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <AppContext.Provider value={{
      pdfs, setPdfs, refreshPDFs, dbReady, setDbReady, quizResults, setQuizResults,
      weakChunks, setWeakChunks, sidebarOpen, setSidebarOpen,
      refreshStatus, user, setUser, isAuthorized, setIsAuthorized,
      clearUserData, userId
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)