'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
          setMessage('登入成功！');
          onAuthSuccess(data.user);
          onClose();
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

          setMessage('註冊成功！請登入。');
          setIsLogin(true);
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{isLogin ? '登入' : '註冊'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
            }}
            className="switch-btn"
          >
            {isLogin ? '還沒有帳號？註冊' : '已有帳號？登入'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .auth-modal {
          background: linear-gradient(160deg, var(--deep), var(--deep2));
          border: 2px solid var(--grid);
          border-radius: 15px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 0 30px rgba(98, 200, 255, .35);
        }

        .auth-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .auth-modal-header h2 {
          color: var(--white);
          margin: 0;
          font-size: 24px;
          text-shadow: 0 0 6px #62c8ff55;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--white);
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: var(--neon);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          color: var(--white);
          font-size: 14px;
          font-weight: 600;
        }

        .form-group input {
          background: #0d2232;
          border: 1px solid #62c8ff66;
          border-radius: 8px;
          padding: 12px;
          color: var(--white);
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--neon);
          box-shadow: 0 0 6px #62c8ff66;
        }

        .auth-submit-btn {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
          border: 2px solid #60a5fa;
          border-radius: 8px;
          padding: 12px 24px;
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-message {
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
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

        .auth-switch {
          margin-top: 20px;
          text-align: center;
        }

        .switch-btn {
          background: none;
          border: none;
          color: var(--neon);
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .switch-btn:hover {
          color: var(--white);
        }
      `}</style>
    </div>
  );
}
