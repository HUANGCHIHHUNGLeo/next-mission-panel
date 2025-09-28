'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/layout/Navbar'
import AuthModal from '@/components/auth/AuthModal'
import { BookOpen, Target, Users, Award, ArrowRight, Calculator, PieChart, TrendingUp } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' })

  const handleAuthClick = (mode) => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin' })
  }

  const features = [
    {
      icon: Calculator,
      title: '互動式練習',
      description: '透過豐富的互動式數學練習題，讓學習變得更有趣且有效果。'
    },
    {
      icon: PieChart,
      title: '學習分析',
      description: '詳細的學習進度分析，幫助您了解自己的強項和需要改進的地方。'
    },
    {
      icon: TrendingUp,
      title: '個人化學習',
      description: '根據您的學習表現，系統會推薦最適合的學習內容和難度。'
    },
    {
      icon: Award,
      title: '成就系統',
      description: '完成學習目標獲得徽章和積分，讓學習過程充滿成就感。'
    }
  ]

  const stats = [
    { number: '10,000+', label: '註冊學生' },
    { number: '50,000+', label: '完成練習' },
    { number: '95%', label: '學習滿意度' },
    { number: '24/7', label: '學習支援' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onAuthClick={handleAuthClick} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 slide-up">
              讓數學學習變得
              <span className="text-yellow-300">簡單有趣</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto slide-up">
              專為台灣學生設計的數學學習平台，提供個人化學習體驗，讓每個學生都能在數學領域發光發熱。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up">
              {user ? (
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-200"
                >
                  前往學習
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-200"
                  >
                    免費開始學習
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition-colors duration-200"
                  >
                    已有帳戶？登入
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              為什麼選擇 MathLearn？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我們結合了最新的教育科技和台灣本土的教學經驗，為學生提供最優質的數學學習體驗。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            準備好開始您的數學學習之旅了嗎？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            加入我們的學習社群，與全台灣的學生一起進步，讓數學不再是困難的科目。
          </p>
          {!user && (
            <button
              onClick={() => handleAuthClick('signup')}
              className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-200"
            >
              立即免費註冊
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">MathLearn</span>
              </div>
              <p className="text-gray-400 mb-4">
                專為台灣學生設計的數學學習平台，讓每個學生都能愛上數學。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">學習資源</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">練習題庫</a></li>
                <li><a href="#" className="hover:text-white transition-colors">學習指南</a></li>
                <li><a href="#" className="hover:text-white transition-colors">常見問題</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">關於我們</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">服務條款</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隱私權政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">聯絡我們</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MathLearn. 版權所有。</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
      />
    </div>
  )
}
