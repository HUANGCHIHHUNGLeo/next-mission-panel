import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmhgeclykizwxcleghsw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGdlY2x5a2l6d3hjbGVnaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDU0MTksImV4cCI6MjA3NDMyMTQxOX0.pkbcDTLo7455p0whvioChYUMqSJS0J_tOODJEuOGalE'

// 驗證配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失')
}

// 優化的 Supabase 客戶端配置
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // 優化認證流程
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // 添加全域配置優化
  global: {
    headers: {
      'X-Client-Info': 'avatar-math-app'
    }
  }
})

console.log('Supabase 客戶端已初始化')

// 優化的連接測試功能
export const testConnection = async () => {
  try {
    // 使用更輕量的健康檢查
    const startTime = Date.now()
    const { data, error } = await supabase.auth.getSession()
    const responseTime = Date.now() - startTime
    
    if (error) {
      console.warn('Session 檢查警告:', error.message)
    }
    
    console.log(`Supabase 連接測試完成，響應時間: ${responseTime}ms`)
    return { success: true, responseTime }
  } catch (error) {
    console.error('連接測試失敗:', error)
    return { success: false, error: error.message }
  }
}

// 新增：快速認證狀態檢查
export const quickAuthCheck = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('快速認證檢查失敗:', error)
    return null
  }
}

// 新增：帶超時的安全查詢函數
export const safeQuery = async (queryFn, timeout = 5000) => {
  return Promise.race([
    queryFn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('查詢超時')), timeout)
    )
  ])
}
