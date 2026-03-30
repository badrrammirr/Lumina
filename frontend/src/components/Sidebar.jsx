import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  HiOutlineHome, HiOutlineChatBubbleLeftRight, HiOutlineCloudArrowUp,
  HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineBolt,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineDocumentText,
  HiOutlineRectangleStack, HiOutlineSparkles
} from 'react-icons/hi2'

const navSections = [
  {
    title: "Core",
    links: [
      { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
      { to: '/ask', icon: HiOutlineChatBubbleLeftRight, label: 'Ask AI' },
    ]
  },
  {
    title: "Content",
    links: [
      { to: '/upload', icon: HiOutlineCloudArrowUp, label: 'Upload PDFs' },
      { to: '/viewer', icon: HiOutlineDocumentText, label: 'PDF Viewer' },
      { to: '/summary', icon: HiOutlineSparkles, label: 'Summary' },
    ]
  },
  {
    title: "Study Tools",
    links: [
      { to: '/quiz', icon: HiOutlineAcademicCap, label: 'Quiz' },
      { to: '/adaptive-quiz', icon: HiOutlineBolt, label: 'Adaptive Quiz' },
      { to: '/flashcards', icon: HiOutlineRectangleStack, label: 'Flashcards' },
      { to: '/performance', icon: HiOutlineChartBar, label: 'Performance' },
    ]
  }
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp()

  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        sidebarOpen ? 'w-72' : 'w-[78px]'
      }`}
      style={{
        boxShadow: '4px 0 30px rgba(0,0,0,0.3)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(24px) saturate(150%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Logo Section with Background Glow */}
      <div className="relative flex items-center gap-3 px-5 py-6 border-b border-white/[0.06] overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_24px_rgba(34,211,238,0.4)] flex-shrink-0">
          L
        </div>

        <div className="flex flex-col overflow-hidden transition-opacity duration-300">
          <span className="text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
            Lumina
          </span>
          <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase whitespace-nowrap">
            AI Study Hub
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-5 px-3 space-y-6 overflow-y-auto min-h-0 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section Title */}
            {sidebarOpen && (
              <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] px-3 mb-2">
                {section.title}
              </h4>
            )}

            <div className="space-y-1">
              {section.links.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-white border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)]'
                        : 'text-gray-500 border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] hover:text-gray-200 hover:scale-[1.02]'
                    }`
                  }
                >
                  {/* Active Indicator Line */}
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full transition-all duration-300 ${
                      // We use a dummy className check trick since we don't have access to isActive here directly without restructuring,
                      // but NavLink's className function handles the parent styling. We'll use a simple left border instead.
                      'hidden'
                    }`}
                  />

                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                    // Note: In Tailwind, we rely on the parent's text-color for the icon,
                    // but we can add specific hover effects
                    'group-hover:drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]'
                  }`} />

                  {sidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                      {label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-200 group"
        >
          <div className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}>
            <HiOutlineChevronLeft className="w-5 h-5 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
          </div>
        </button>
      </div>
    </aside>
  )
}