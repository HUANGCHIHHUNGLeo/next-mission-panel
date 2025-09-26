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

  // 密碼強度檢查
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return { valid: false, message: '密碼至少需要 6 個字元' };
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) return { valid: false, message: '密碼需包含英文字母和數字' };
    return { valid: true, message: '密碼強度良好' };
  };

  // 電話號碼驗證
  const validatePhone = (phone) => {
    const phoneRegex = /^09\d{8}$|^0[2-8]\d{7,8}$/;
    return phoneRegex.test(phone);
  };

  // 年齡驗證
  const validateAge = (age) => {
    const ageNum = parseInt(age);
    return ageNum >= 6 && ageNum <= 18;
  };

  const passwordCheck = password ? checkPasswordStrength(password) : { valid: false, message: '' };
  const phoneValid = phone ? validatePhone(phone) : false;
  const ageValid = age ? validateAge(age) : false;

  // 簡化的認證檢查
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        console.log('開始檢查用戶認證狀態...');
        
        // 直接檢查 session，不查詢資料庫
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('認證檢查錯誤:', error);
          setInitialLoading(false);
          return;
        }
        
        console.log('Session 狀態:', session ? '已登入' : '未登入');
        
        if (session?.user) {
          console.log('用戶已登入，跳轉到儀表板');
          router.push('/dashboard');
        } else {
          setInitialLoading(false);
        }
      } catch (error) {
        console.error('認證狀態檢查失敗:', error);
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };

    // 延遲 2 秒後開始檢查
    const timeoutId = setTimeout(checkUser, 2000);

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('認證狀態變化:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          console.log('用戶已登出');
          setInitialLoading(false);
          // 清除所有狀態
          setEmail('');
          setPassword('');
          setDisplayName('');
          setPhone('');
          setAge('');
          setPrivacyConsent(false);
          setMessage('');
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 註冊時的額外驗證
    if (!isLogin) {
      if (!passwordCheck.valid) {
        setMessage(passwordCheck.message);
        setLoading(false);
        return;
      }

      if (!phoneValid) {
        setMessage('請輸入有效的台灣電話號碼（手機：09xxxxxxxx，市話：0x-xxxxxxxx）');
        setLoading(false);
        return;
      }

      if (!ageValid) {
        setMessage('年齡必須在 6-18 歲之間');
        setLoading(false);
        return;
      }

      if (!privacyConsent) {
        setMessage('請同意隱私政策才能註冊');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // 登入
        console.log('嘗試登入:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('登入錯誤:', error);
          setMessage('登入失敗：' + error.message);
          setLoading(false);
          return;
        }

        console.log('登入成功:', data.user?.email);
        setMessage('登入成功！正在跳轉...');
      } else {
        // 註冊
        console.log('嘗試註冊:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              phone: phone,
              age: age,
            }
          }
        });

        if (error) {
          console.error('註冊錯誤:', error);
          if (error.message.includes('User already registered')) {
            setMessage('此 Email 已經註冊過了，請直接登入');
          } else {
            setMessage('註冊失敗：' + error.message);
          }
          setLoading(false);
          return;
        }

        console.log('註冊成功:', data.user?.email);
        if (data.user) {
          setMessage('註冊成功！正在跳轉...');
        }
      }
    } catch (error) {
      console.error('認證錯誤:', error);
      setMessage('操作失敗：' + error.message);
      setLoading(false);
    }
  };

  // 如果正在載入，顯示載入畫面
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">載入中...</p>
          <p className="text-gray-500 text-sm mt-2">正在檢查登入狀態</p>
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

        {/* 切換登入/註冊模式 */}
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
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                電話號碼
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                  phone && phoneValid 
                    ? 'border-green-500 focus:border-green-500' 
                    : phone && !phoneValid 
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="09xxxxxxxx 或 0x-xxxxxxxx"
              />
              {phone && !phoneValid && (
                <p className="text-red-400 text-xs mt-1">請輸入有效的台灣電話號碼</p>
              )}
            </div>
          )}

          {!isLogin && (
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
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                  age && ageValid 
                    ? 'border-green-500 focus:border-green-500' 
                    : age && !ageValid 
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-600 focus:border-blue-500'
                }`}
                placeholder="請輸入年齡 (6-18歲)"
              />
              {age && !ageValid && (
                <p className="text-red-400 text-xs mt-1">年齡必須在 6-18 歲之間</p>
              )}
            </div>
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
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                !isLogin && password && passwordCheck.valid 
                  ? 'border-green-500 focus:border-green-500' 
                  : !isLogin && password && !passwordCheck.valid 
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-600 focus:border-blue-500'
              }`}
              placeholder={isLogin ? "請輸入密碼" : "至少6個字元，包含英文和數字"}
            />
            {!isLogin && password && (
              <p className={`text-xs mt-1 ${passwordCheck.valid ? 'text-green-400' : 'text-red-400'}`}>
                {passwordCheck.message}
              </p>
            )}
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
                我已閱讀並同意{' '}
                <a 
                  href="/privacy-policy.html" 
                  target="_blank" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  隱私政策
                </a>
                {' '}和{' '}
                <a 
                  href="/terms-of-service.html" 
                  target="_blank" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  服務條款
                </a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && !privacyConsent)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? (isLogin ? '登入中...' : '註冊中...') : (isLogin ? '登入' : '註冊')}
          </button>

          {message && (
            <div className={`text-center text-sm ${message.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
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

        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">平台特色</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• 遊戲化學習體驗</li>
            <li>• 6大數學技能培養</li>
            <li>• 個人化學習進度</li>
            <li>• 豐富的題目庫</li>
          </ul>
        </div>

        {/* 調試資訊 */}
        <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-500">
          <p>Supabase URL: https://vmhgeclykizwxcleghsw.supabase.co</p>
          <p>Site URL: https://next-mission-panel-rfj8.vercel.app</p>
          <p>載入狀態: {initialLoading ? '載入中' : '已載入'}</p>
        </div>
      </div>
    </div>
  );
}
