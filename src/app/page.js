'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // 檢查是否已登入
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (error) {
          console.error('認證檢查錯誤:', error);
          setInitialLoading(false);
          return;
        }
        
        if (user) {
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

    checkUser();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setInitialLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setMessage('登入成功！正在跳轉...');
          // 跳轉會由 onAuthStateChange 處理
        }
      } else {
        // 註冊
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // 建立用戶資料
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                display_name: displayName,
                role: 'student'
              }
            ]);

          if (profileError) {
            console.error('建立用戶資料失敗:', profileError);
          }

          // 建立學生檔案
          const { error: studentError } = await supabase
            .from('student_profiles')
            .insert([
              {
                user_id: data.user.id,
                character_gender: 'male',
                total_exp: 0,
                level: 1,
                coins: 200
              }
            ]);

          if (studentError) {
            console.error('建立學生檔案失敗:', studentError);
          }

          // 初始化技能進度
          const skills = ['number_sense', 'calculation', 'geometry', 'reasoning', 'chart_reading', 'application'];
          const skillPromises = skills.map(skill => 
            supabase
              .from('skill_progress')
              .insert([
                {
                  user_id: data.user.id,
                  skill_name: skill,
                  current_exp: 0,
                  level: 1
                }
              ])
          );

          await Promise.all(skillPromises);

          setMessage('註冊成功！正在跳轉...');
          // 跳轉會由 onAuthStateChange 處理
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎯 智慧數學學習平台</h1>
          <p>讓學習數學變得有趣又有效！</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setMessage('');
            }}
          >
            登入
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setMessage('');
            }}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>顯示名稱</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
                placeholder="請輸入您的名稱"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="請輸入 Email"
            />
          </div>

          <div className="form-group">
            <label>密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="請輸入密碼"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? '處理中...' : (isLogin ? '登入' : '註冊')}
          </button>

          {message && (
            <div className={`auth-message ${message.includes('成功') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="features">
          <h3>✨ 平台特色</h3>
          <ul>
            <li>🎮 遊戲化學習體驗</li>
            <li>📊 6大核心數學技能</li>
            <li>🏆 個人進度追蹤</li>
            <li>🎯 每日任務挑戰</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: radial-gradient(1100px 760px at 70% 18%, #0c151c 0%, #0a0f14 60%, #070a0d 100%) fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: "Orbitron", "Share Tech Mono", monospace;
        }

        .login-card {
          background: linear-gradient(160deg, var(--deep), var(--deep2));
          border: 2px solid var(--grid);
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 
            0 0 30px rgba(98, 200, 255, .35),
            0 0 0 1px #62c8ff33 inset;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          color: var(--white);
          font-size: 28px;
          margin: 0 0 10px 0;
          text-shadow: 0 0 10px #62c8ff55;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 16px;
          margin: 0;
        }

        .auth-tabs {
          display: flex;
          margin-bottom: 30px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--grid);
        }

        .tab-btn {
          flex: 1;
          padding: 12px;
          background: #0d2232;
          color: var(--white);
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
          color: white;
        }

        .tab-btn:hover:not(.active) {
          background: #1a2f42;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--white);
          font-size: 14px;
          font-weight: 600;
        }

        .form-group input {
          background: #0d2232;
          border: 1px solid #62c8ff66;
          border-radius: 10px;
          padding: 14px;
          color: var(--white);
          font-size: 16px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--neon);
          box-shadow: 0 0 10px #62c8ff66;
        }

        .auth-submit-btn {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
          border: 2px solid #60a5fa;
          border-radius: 10px;
          padding: 16px 24px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
          font-family: inherit;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-message {
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          margin-top: 10px;
        }

        .auth-message.success {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          color: #6ee7b7;
        }

        .auth-message.error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          color: #fca5a5;
        }

        .features {
          border-top: 1px solid var(--grid);
          padding-top: 20px;
        }

        .features h3 {
          color: var(--white);
          font-size: 18px;
          margin: 0 0 15px 0;
          text-align: center;
        }

        .features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features li {
          color: #94a3b8;
          font-size: 14px;
          padding: 5px 0;
          display: flex;
          align-items: center;
        }

        .loading-spinner {
          text-align: center;
          color: var(--white);
          font-size: 18px;
          padding: 40px;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
          }
          
          .login-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
