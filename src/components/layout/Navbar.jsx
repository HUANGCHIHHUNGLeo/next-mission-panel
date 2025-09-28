'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, BookOpen, User, LogOut } from 'lucide-react'

export default function Navbar({ onAuthClick }) {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MathLearn</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  歡迎，{user.user_metadata?.full_name || user.email}
                </span>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <User className="h-5 w-5" />
                    <span>帳戶</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        儀表板
                      </a>
                      <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        個人資料
                      </a>
                      <hr className="my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>登出</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onAuthClick('signin')}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  登入
                </button>
                <button
                  onClick={() => onAuthClick('signup')}
                  className="btn-primary"
                >
                  註冊
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 slide-up">
            {user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 text-gray-700">
                  歡迎，{user.user_metadata?.full_name || user.email}
                </div>
                <a
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  儀表板
                </a>
                <a
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  個人資料
                </a>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>登出</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onAuthClick('signin')
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  登入
                </button>
                <button
                  onClick={() => {
                    onAuthClick('signup')
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  註冊
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
