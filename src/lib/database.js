import { supabase } from './supabase'

// 用戶資料操作
export const userService = {
  // 建立用戶資料
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        grade: userData.grade,
        gender: userData.gender
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 獲取用戶資料
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // 更新用戶資料
  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// 學習進度操作
export const progressService = {
  // 獲取用戶學習進度
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  },

  // 更新學習進度
  async updateProgress(userId, subject, progressData) {
    const { data, error } = await supabase
      .from('learning_progress')
      .upsert({
        user_id: userId,
        subject: subject,
        ...progressData
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 增加經驗值
  async addExperience(userId, subject, points) {
    // 先獲取當前進度
    const { data: currentProgress } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject)
      .single()

    const newExperience = (currentProgress?.experience_points || 0) + points
    const newLevel = Math.floor(newExperience / 100) + 1

    return this.updateProgress(userId, subject, {
      experience_points: newExperience,
      level: newLevel
    })
  }
}

// 學習記錄操作
export const sessionService = {
  // 建立學習記錄
  async createSession(sessionData) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 獲取用戶學習記錄
  async getUserSessions(userId, limit = 10) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  // 獲取今日學習統計
  async getTodayStats(userId) {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', today)

    if (error) throw error

    const sessions = data || []
    return {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0),
      totalProblems: sessions.reduce((sum, session) => sum + (session.problems_attempted || 0), 0),
      correctProblems: sessions.reduce((sum, session) => sum + (session.problems_correct || 0), 0)
    }
  }
}
