import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { userService } from '@/lib/database'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 獲取初始會話
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        // 如果是新用戶註冊，建立用戶資料
        if (event === 'SIGNED_UP' && session?.user) {
          try {
            await userService.createUser({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              grade: session.user.user_metadata?.grade || '',
              gender: session.user.user_metadata?.gender || ''
            })
          } catch (error) {
            console.error('建立用戶資料失敗:', error)
          }
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signOut
  }
}
