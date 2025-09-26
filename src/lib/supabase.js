import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmhgeclykizwxcleghsw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGdlY2x5a2l6d3hjbGVnaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDU0MTksImV4cCI6MjA3NDMyMTQxOX0.pkbcDTLo7455p0whvioChYUMqSJS0J_tOODJEuOGalE'

// 驗證配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'avatar-math-web',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=minimal'
    }
  },
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

// 安全的連接測試
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
