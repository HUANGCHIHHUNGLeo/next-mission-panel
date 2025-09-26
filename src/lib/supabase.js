import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmhgeclykizwxcleghsw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGdlY2x5a2l6d3hjbGVnaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDU0MTksImV4cCI6MjA3NDMyMTQxOX0.pkbcDTLo7455p0whvioChYUMqSJS0J_tOODJEuOGalE'

// 驗證配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失')
}

// 只修復導致 406 錯誤的配置，保留其他功能
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // 移除可能導致 406 錯誤的 global headers
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

console.log('Supabase 客戶端已初始化')

// 保留連接測試功能
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.warn('Session 檢查警告:', error.message)
    }
    return { success: true }
  } catch (error) {
    console.error('連接測試失敗:', error)
    return { success: false, error: error.message }
  }
}
