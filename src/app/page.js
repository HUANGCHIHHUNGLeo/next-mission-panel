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
    if (!password) return { valid: false, message: '' };
    if (password.length < 6) return { valid: false, message: '密碼至少需要 6 個字元' };
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) return { valid: false, message: '密碼需包含英文字母和數字' };
    return { valid: true, message: '密碼強度良好' };
  };

  // 電話號碼驗證
  const validatePhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^09\d{8}$|^0[2-8]\d{7,8}$/;
    return phoneRegex.test(phone);
  };

  // 年齡驗證
  const validateAge = (age) => {
    if (!age) return false;
    const ageNum = parseInt(age);
    return ageNum >= 6 && ageNum <= 18;
  };

  const passwordCheck = checkPasswordStrength(password);
  const phoneValid = validatePhone(phone);
  const ageValid = validateAge(age);

  // 安全的認證檢查
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        // 設定超時保護
        const timeoutId = setTimeout(() => {
          if (mounted) {
            setInitialLoading(false);
          }
        }, 5000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (mounted) {
          if (session?.user && !error) {
            router.push('/dashboard');
          } else {
            setInitialLoading(false);
          }
        }
      } catch (error) {
        console.error('認證檢查錯誤:', error);
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };

    checkAuth();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setInitialLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // 登入邏輯
        if (!email || !password) {
          throw new Error('請填寫所有必填欄位');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email 或密碼錯誤，請檢查後重試');
          }
          throw error;
        }

        if (data.user) {
          router.push('/dashboard');
        }
      } else {
        // 註冊邏輯
        if (!displayName.trim()) {
          throw new Error('請輸入姓名');
        }
        if (!phone.trim()) {
          throw new Error('請輸入電話號碼');
        }
        if (!phoneValid) {
          throw new Error('請輸入有效的台灣電話號碼');
        }
        if (!age || !ageValid) {
          throw new Error('年齡必須在 6-18 歲之間');
        }
        if (!email.trim()) {
          throw new Error('請輸入 Email');
        }
        if (!passwordCheck.valid) {
          throw new Error(passwordCheck.message);
        }
        if (!privacyConsent) {
          throw new Error('請同意隱私政策');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
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
            return;
          }
          throw error;
        }

        if (data.user) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('認證錯誤:', error);
      setMessage(error.message || '發生未知錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            AVATAR Math
          </h1>
          <p className="text-gray-400">數學學習平台</p>
        </div>

        <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              isLogin 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            登入
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              !isLogin 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="姓名 *"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="電話號碼 (例: 0912345678) *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none ${
                    phone && !phoneValid 
                      ? 'border-red-500 focus:border-red-500' 
                      : phone && phoneValid 
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {phone && !phoneValid && (
                  <p className="text-red-400 text-sm mt-1">請輸入有效的台灣電話號碼</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  placeholder="年齡 (6-18歲) *"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="6"
                  max="18"
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none ${
                    age && !ageValid 
                      ? 'border-red-500 focus:border-red-500' 
                      : age && ageValid 
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {age && !ageValid && (
                  <p className="text-red-400 text-sm mt-1">年齡必須在 6-18 歲之間</p>
                )}
              </div>
            </>
          )}

          <div>
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="密碼 *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border transition-colors focus:outline-none ${
                password && !passwordCheck.valid 
                  ? 'border-red-500 focus:border-red-500' 
                  : password && passwordCheck.valid 
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-gray-600 focus:border-blue-500'
              }`}
              required
            />
            {password && passwordCheck.message && (
              <p className={`text-sm mt-1 ${passwordCheck.valid ? 'text-green-400' : 'text-red-400'}`}>
                {passwordCheck.message}
              </p>
            )}
          </div>

          {!isLogin && (
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="privacy" className="text-sm text-gray-300">
                我已閱讀並同意{' '}
                <a href="/privacy-policy.html" target="_blank" className="text-blue-400 hover:text-blue-300">
                  隱私政策
                </a>{' '}
                和{' '}
                <a href="/terms-of-service.html" target="_blank" className="text-blue-400 hover:text-blue-300">
                  服務條款
                </a>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && (!passwordCheck.valid || !phoneValid || !ageValid || !privacyConsent))}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                處理中...
              </div>
            ) : (
              isLogin ? '登入' : '註冊'
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            message.includes('已經註冊') 
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <a 
            href="/admin/login" 
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            管理員登入
          </a>
        </div>
      </div>
    </div>
  );
}
