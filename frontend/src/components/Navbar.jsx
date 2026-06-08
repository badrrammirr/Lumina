import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { HiOutlineCommandLine, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { logout, getMe } from '../api/api'

export default function Navbar() {
  const { dbReady, pdfs } = useApp()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : 'L'
  }

  return (
    <header
      className="h-16 border-b border-white/[0.06] backdrop-blur-xl
        flex items-center justify-between px-6 sticky top-0 z-30"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
      }}
    >
      {/* Left Side: Branding & Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Lumina
          </h2>
        </div>

        {/* Subtle Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Page Context Indicator (Example) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
          <HiOutlineCommandLine className="w-3.5 h-3.5" />
          <span className="font-mono">v1.0</span>
        </div>
      </div>

      {/* Right Side: Status & Profile */}
      <div className="flex items-center gap-5">
        <StatusBadge ready={dbReady} />

        {/* Subtle Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Document Counter Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Docs</span>
          <span className="text-xs font-bold text-gray-300">{pdfs.length}</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative group cursor-pointer focus:outline-none"
          >
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500
                flex items-center justify-center text-sm font-bold text-white
                transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:scale-105"
            >
              {loading ? 'L' : getInitials(user?.username)}
            </div>
            {/* Online Status Dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface-900"></div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-48 rounded-xl bg-surface-800 border border-white/[0.1] shadow-lg overflow-hidden"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white">
                    {loading ? 'Loading...' : user?.username || 'User'}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    handleLogout()
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}