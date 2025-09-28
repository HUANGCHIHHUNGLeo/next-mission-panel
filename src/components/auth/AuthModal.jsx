'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Eye, EyeOff, Mail, Lock, User, Calendar, Users } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, mode = 'signin' }) {
  const [currentMode, setCurrentMode] = useState(mode)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    grade: '',
    gender: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = '請輸入電子郵件'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件格式'
    }

    if (!formData.password) {
      newErrors.password = '請輸入密碼'
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字元'
    }

    if (currentMode === 'signup') {
      if (!formData.fullName) {
        newErrors.fullName = '請輸入姓名'
      }

      if (!formData.grade) {
        newErrors.grade = '請選擇年級'
      }

      if (!formData.gender) {
        newErrors.gender = '請選擇性別'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '密碼確認不符'
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = '請同意服務條款和隱私權政策'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      if (currentMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error
        onClose()
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              grade: formData.grade,
              gender: formData.gender,
            }
          }
        })

        if (error) throw error
        
        alert('註冊成功！請檢查您的電子郵件以驗證帳戶。')
        onClose()
      }
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto fade-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentMode === 'signin' ? '登入' : '註冊'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="請輸入您的電子郵件"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Full Name (註冊時顯示) */}
            {currentMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                    placeholder="請輸入您的姓名"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
            )}

            {/* Grade (註冊時顯示) */}
            {currentMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年級
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.grade ? 'border-red-500' : ''}`}
                  >
                    <option value="">請選擇年級</option>
                    <option value="小學一年級">小學一年級</option>
                    <option value="小學二年級">小學二年級</option>
                    <option value="小學三年級">小學三年級</option>
                    <option value="小學四年級">小學四年級</option>
                    <option value="小學五年級">小學五年級</option>
                    <option value="小學六年級">小學六年級</option>
                    <option value="國中一年級">國中一年級</option>
                    <option value="國中二年級">國中二年級</option>
                    <option value="國中三年級">國中三年級</option>
                    <option value="高中一年級">高中一年級</option>
                    <option value="高中二年級">高中二年級</option>
                    <option value="高中三年級">高中三年級</option>
                  </select>
                </div>
                {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
              </div>
            )}

            {/* Gender (註冊時顯示) */}
            {currentMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.gender ? 'border-red-500' : ''}`}
                  >
                    <option value="">請選擇性別</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="請輸入密碼"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password (註冊時顯示) */}
            {currentMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  確認密碼
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="請再次輸入密碼"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Terms Agreement (註冊時顯示) */}
            {currentMode === 'signup' && (
              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    我同意
                    <a href="/terms" className="text-blue-600 hover:underline">服務條款</a>
                    和
                    <a href="/privacy" className="text-blue-600 hover:underline">隱私權政策</a>
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : (currentMode === 'signin' ? '登入' : '註冊')}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {currentMode === 'signin' ? '還沒有帳戶？' : '已經有帳戶了？'}
              <button
                onClick={() => setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin')}
                className="text-blue-600 hover:underline ml-1"
              >
                {currentMode === 'signin' ? '立即註冊' : '立即登入'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
