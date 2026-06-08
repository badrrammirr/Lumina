import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlinePlus, HiOutlineArrowRight, HiOutlinePencilSquare } from 'react-icons/hi2'
import { getChats, deleteChat, createChat, renameChat } from '../api/api'
import { useApp } from '../context/AppContext'

export default function ChatHistoryPage() {
  const { isAuthorized, user } = useApp()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newChatTitle, setNewChatTitle] = useState('')
  const [renamingChatId, setRenamingChatId] = useState(null)
  const [renameTitle, setRenameTitle] = useState('')

  useEffect(() => {
    if (isAuthorized && user) {
      fetchChats()
    } else {
      setChats([])
      setSelectedChat(null)
    }
  }, [isAuthorized, user])

  const fetchChats = async () => {
    setLoading(true)
    try {
      const response = await getChats()
      setChats(response.chats || [])
    } catch (error) {
      toast.error('Failed to fetch chat history')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChat = async (e) => {
    e.preventDefault()
    if (!newChatTitle.trim()) {
      toast.error('Chat title is required')
      return
    }

    try {
      const response = await createChat(newChatTitle)
      toast.success('Chat created successfully')

      // Immediately add the new chat to state instead of refetching all chats
      const newChat = {
        id: response.id,
        title: response.title || newChatTitle,
        created_at: response.created_at || new Date().toISOString(),
        updated_at: response.updated_at || new Date().toISOString()
      }
      setChats(prev => [newChat, ...prev])
      setSelectedChat(newChat)

      setNewChatTitle('')
      setShowNewChatDialog(false)
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create chat'
      toast.error(message)
    }
  }

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return

    try {
      await deleteChat(chatId)
      toast.success('Chat deleted successfully')
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
      }
      fetchChats()
    } catch (error) {
      toast.error('Failed to delete chat')
    }
  }

  const handleRenameChat = async (chatId, newName) => {
    if (!newName.trim()) {
      toast.error('Chat title cannot be empty')
      return
    }

    try {
      await renameChat(chatId, newName)
      toast.success('Chat renamed successfully')
      setRenamingChatId(null)
      setRenameTitle('')
      // Update local state to reflect rename immediately
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newName, updated_at: new Date().toISOString() } : c))
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => ({ ...prev, title: newName }))
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to rename chat'
      toast.error(message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Chat History</h1>
            <p className="text-gray-400 mt-1">View and manage your conversation history</p>
          </div>
          <motion.button
            onClick={() => setShowNewChatDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiOutlinePlus className="w-5 h-5" />
            New Chat
          </motion.button>
        </div>
      </motion.div>

      {/* New Chat Dialog */}
      {showNewChatDialog && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6"
        >
          <form onSubmit={handleCreateChat} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chat Title</label>
              <input
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="e.g., Biology Study Session"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                Create Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewChatDialog(false)
                  setNewChatTitle('')
                }}
                className="px-4 py-2 rounded-lg border border-white/[0.1] text-gray-300 hover:bg-white/[0.05]"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading chats...</p>
        </div>
      ) : chats.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-12 text-center"
        >
          <p className="text-gray-400 mb-4">No chats yet. Create one to get started!</p>
          <button
            onClick={() => setShowNewChatDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create Your First Chat
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold text-gray-300 px-2">Conversations</h2>
            <div className="space-y-2">
              {chats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedChat?.id === chat.id
                        ? 'bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30'
                        : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{chat.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(chat.updated_at)}</p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Detail */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden h-full"
              >
                {/* Chat Header */}
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    {renamingChatId === selectedChat.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleRenameChat(selectedChat.id, renameTitle)
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          className="px-3 py-1 rounded-lg bg-white/[0.1] border border-white/[0.2] text-white text-sm focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg bg-cyan-500 text-white text-sm"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedChat.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {formatDate(selectedChat.created_at)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRenamingChatId(selectedChat.id)
                        setRenameTitle(selectedChat.title)
                      }}
                      className="p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors"
                      title="Rename chat"
                    >
                      <HiOutlinePencilSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChat(selectedChat.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete chat"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 h-[calc(100vh-16rem)] overflow-y-auto">
                  <p className="text-center text-gray-500 py-12">
                    Chat details coming soon. This would display messages from this conversation.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-12 text-center h-full flex items-center justify-center"
              >
                <div>
                  <p className="text-gray-400 mb-4">Select a chat to view details</p>
                  <HiOutlineArrowRight className="w-8 h-8 text-gray-600 mx-auto" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
