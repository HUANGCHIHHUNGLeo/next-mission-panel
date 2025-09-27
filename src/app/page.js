'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('認證錯誤:', error);
          setError('認證檢查失敗');
          setLoading(false);
          return;
        }

        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (userError) {
            console.error('用戶資料查詢錯誤:', userError);
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                auth_user_id: session.user.id,
                email: session.user.email,
                display_name: session.user.email,
                role: session.user.email === 'cortexos.main@gmail.com' ? 'admin' : 'student'
              });

            if (!insertError) {
              const { data: newUserData } = await supabase
                .from('users')
                .select('*')
                .eq('auth_user_id', session.user.id)
                .single();
              setUser(newUserData);
            }
          } else {
            setUser(userData);
          }

          if (userData?.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }
      } catch (error) {
        console.error('認證檢查異常:', error);
        setError('系統錯誤，請重新整理頁面');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('載入超時，請檢查網路連接');
      }
    }, 5000);

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <AuthModal />
    </div>
  );
}
