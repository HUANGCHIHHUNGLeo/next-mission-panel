'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // 安全的認證檢查
  useEffect(() => {
    let mounted = true;
    let timeoutId = null;

    const checkAuth = async () => {
      try {
        console.log('檢查認證狀態...');
        
        // 設定超時
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('認證檢查超時，顯示登入頁面');
            setInitialLoading(false);
          }
        }, 3000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (!mounted) return;
        
        if (error) {
          console.warn('Session 檢查警告:', error.message);
        }
        
        if (session?.user) {
          console.log('發現已登入用戶，跳轉到儀表板');
          router.push('/dashboard');
        } else {
          console.log('未登入，顯示登入頁面');
          setInitialLoading(false);
        }
        
      } catch (error) {
        console.error('認證檢查失敗:', error);
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };

    checkAuth();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('認證狀態變化:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setInitialLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // 登入
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        setMessage('登入成功！');
      } else {
        // 註冊前驗證
        if (!displayName.trim()) {
          throw new Error('請輸入姓名');
        }
        if (!phone.trim()) {
          throw new Error('請輸入電話號碼');
        }
        if (!age || parseInt(age) < 6 || parseInt(age) > 18) {
          throw new Error('年齡必須在 6-18 歲之間');
        }
        if (!privacyConsent) {
          throw new Error('請同意隱私政策');
        }

        // 註冊
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim(),
              phone: phone.trim(),
              age: parseInt(age),
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setMessage('此 Email 已經註冊過了，請直接登入');
            setIsLogin(true);
          } else {
            throw error;
          }
        } else {
          setMessage('註冊成功！');
        }
      }
    } catch (error) {
      console.error('認證錯誤:', error);
      setMessage(error.message || '操作失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 載入畫面
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">AVATAR Math</h1>
          <p className="text-gray-400">數學學習平台</p>
        </div>

        {/* 切換登入/註冊 */}
        <div className="flex mb-6 border border-gray-600 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setMessage('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              isLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setMessage('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              !isLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="請輸入您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  電話號碼
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="09xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  年齡
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="6"
                  max="18"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="請輸入年齡 (6-18歲)"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="請輸入您的 Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="請輸入密碼"
            />
          </div>

          {!isLogin && (
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="privacy"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy" className="text-sm text-gray-300">
                我已閱讀並同意隱私政策和服務條款
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? (isLogin ? '登入中...' : '註冊中...') : (isLogin ? '登入' : '註冊')}
          </button>

          {message && (
            <div className={`text-center text-sm ${
              message.includes('成功') ? 'text-green-400' : 'text-red-400'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <a
            href="/admin/login"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            管理員登入
          </a>
        </div>
      </div>
    </div>
  );
}
