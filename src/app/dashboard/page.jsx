'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { userService, progressService, sessionService } from '@/lib/database'
import Navbar from '@/components/layout/Navbar'
import AuthModal from '@/components/auth/AuthModal'
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  BarChart3,
  User,
  Settings
} from 'lucide-react'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState(null)
  const [progress, setProgress] = useState([])
  const [todayStats, setTodayStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // 載入用戶資料
      const userInfo = await userService.getUser(user.id)
      setUserData(userInfo)

      // 載入學習進度
      const userProgress = await progressService.getUserProgress(user.id)
      setProgress(userProgress)

      // 載入今日統計
      const stats = await sessionService.getTodayStats(user.id)
      setTodayStats(stats)

      // 載入最近學習記錄
      const sessions = await sessionService.getUserSessions(user.id, 5)
      setRecentSessions(sessions)
    } catch (error) {
      console.error('載入用戶資料失敗:', error)
    }
  }

  const handleAuthClick = (mode) => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onAuthClick={handleAuthClick} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              請先登入以查看您的學習儀表板
            </h1>
            <p className="text-gray-600 mb-8">
              登入後您可以追蹤學習進度、查看統計資料，並繼續您的數學學習之旅。
            </p>
            <button
              onClick={() => handleAuthClick('signin')}
              className="btn-primary"
            >
              立即登入
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={closeAuthModal}
          mode={authModal.mode}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onAuthClick={handleAuthClick} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 歡迎區塊 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            歡迎回來，{userData?.full_name || user.email}！
          </h1>
          <p className="text-gray-600">
            繼續您的數學學習之旅，今天也要加油！
          </p>
        </div>

        {/* 今日統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">今日學習時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayStats?.totalMinutes || 0} 分鐘
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">完成題目</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayStats?.totalProblems || 0} 題
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">正確率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayStats?.totalProblems > 0 
                    ? Math.round((todayStats.correctProblems / todayStats.totalProblems) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">學習階段</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.length > 0 ? `第 ${Math.max(...progress.map(p => p.level))} 級` : '新手'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 學習進度 */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">學習進度</h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              
              {progress.length > 0 ? (
                <div className="space-y-4">
                  {progress.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{item.subject}</h3>
                        <span className="text-sm text-gray-600">
                          第 {item.level} 級 • {item.experience_points} XP
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((item.experience_points % 100) / 100) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>已解決 {item.total_problems_solved} 題</span>
                        <span>正確率 {item.total_problems_solved > 0 ? Math.round((item.correct_answers / item.total_problems_solved) * 100) : 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">還沒有學習記錄</p>
                  <button className="btn-primary">
                    開始第一次學習
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 個人資料卡片 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">個人資料</h3>
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">姓名</p>
                  <p className="font-medium">{userData?.full_name || '未設定'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">年級</p>
                  <p className="font-medium">{userData?.grade || '未設定'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">性別</p>
                  <p className="font-medium">{userData?.gender || '未設定'}</p>
                </div>
                <button className="w-full btn-secondary text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  編輯資料
                </button>
              </div>
            </div>

            {/* 最近學習記錄 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">最近學習</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{session.subject}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.duration_minutes}分鐘</p>
                        <p className="text-xs text-gray-600">{session.problems_attempted}題</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">還沒有學習記錄</p>
              )}
            </div>

            {/* 快速操作 */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">快速開始</h3>
              <div className="space-y-2">
                <button className="w-full btn-primary text-sm">
                  開始練習
                </button>
                <button className="w-full btn-secondary text-sm">
                  查看題庫
                </button>
                <button className="w-full btn-secondary text-sm">
                  學習統計
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
      />
    </div>
  )
}
