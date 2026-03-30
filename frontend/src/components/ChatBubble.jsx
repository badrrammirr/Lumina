import React from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'

export default function ChatBubble({ message, isUser, sources }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={
          isUser
            ? 'bg-primary-600/20 border border-primary-500/25 rounded-2xl rounded-br-md px-5 py-4'
            : 'bg-white/4 border border-white/8 backdrop-blur-xl rounded-2xl rounded-bl-md px-5 py-4'
        }
        style={
          isUser
            ? { boxShadow: '0 4px 20px rgba(99,102,241,0.1)' }
            : { boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }
        }
      >
        {isUser ? (
          <p className="text-gray-100">{message}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/6">
            <p className="text-xs text-gray-500 mb-1.5">Sources:</p>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s, i) => (
                <span
                  key={i}
                  className="text-xs bg-primary-600/15 text-primary-300 px-2.5 py-1 rounded-lg border border-primary-500/10"
                >
                  📄 {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}