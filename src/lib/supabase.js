import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmhgeclykizwxcleghsw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGdlY2x5a2l6d3hjbGVnaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDU0MTksImV4cCI6MjA3NDMyMTQxOX0.pkbcDTLo7455p0whvioChYUMqSJS0J_tOODJEuOGalE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
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

console.log('Supabase 客戶端已初始化:', supabaseUrl)
