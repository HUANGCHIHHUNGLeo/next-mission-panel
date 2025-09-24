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

  // 密碼強度檢查
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return { valid: false, message: '密碼至少需要 6 個字元' };
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) return { valid: false, message: '密碼需包含英文字母和數字' };
    return { valid: true, message: '密碼強度良好' };
  };

  const passwordCheck = password ? checkPasswordStrength(password) : { valid: false, message: '' };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 註冊時檢查密碼強度
    if (!isLogin && !passwordCheck.valid) {
      setMessage(passwordCheck.message);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // 登入
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('帳號或密碼錯誤，請重新輸入');
          }
          throw error;
        }

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

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('此 Email 已經註冊過了，請直接登入');
          }
          if (error.message.includes('Password should be at least 6 characters')) {
            throw new Error('密碼至少需要 6 個字元');
          }
          throw error;
        }

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
          const skills = ['數感力', '運算力', '幾何力', '推理力', '圖解力', '應用力'];
          const skillData = skills.map(skill => ({
            user_id: data.user.id,
            skill_name: skill,
            current_exp: 0,
            level: 1,
            total_problems_solved: 0,
            correct_answers: 0
          }));

          const { error: skillError } = await supabase
            .from('skill_progress')
            .insert(skillData);

          if (skillError) {
            console.error('建立技能進度失敗:', skillError);
          }

          // 建立任務進度
          const { error: taskError } = await supabase
            .from('task_progress')
            .insert([
              {
                user_id: data.user.id,
                task_type: 'core',
                completed_today: 0,
                special_training_uses: 0,
                refresh_cards: 2
              },
              {
                user_id: data.user.id,
                task_type: 'daily',
                completed_today: 0,
                special_training_uses: 0,
                refresh_cards: 2
              }
            ]);

          if (taskError) {
            console.error('建立任務進度失敗:', taskError);
          }

          setMessage('註冊成功！正在為您登入...');
          
          // 註冊成功後自動登入
          setTimeout(() => {
            onAuthSuccess(data.user);
            onClose();
          }, 1000);
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
                autoComplete="name"
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
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>
              密碼
              {!isLogin && (
                <span className="password-hint">
                  (至少6字元，需包含英文和數字)
                </span>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isLogin ? "請輸入密碼" : "例如：abc123456"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={!isLogin && password ? (passwordCheck.valid ? 'valid' : 'invalid') : ''}
            />
            {!isLogin && password && (
              <div className={`password-feedback ${passwordCheck.valid ? 'valid' : 'invalid'}`}>
                {passwordCheck.message}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || (!isLogin && password && !passwordCheck.valid)} 
            className="auth-submit-btn"
          >
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
              setPassword('');
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
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .password-hint {
          color: #999;
          font-size: 12px;
          font-weight: normal;
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

        .form-group input.valid {
          border-color: #4CAF50;
        }

        .form-group input.invalid {
          border-color: #ff5d7a;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--neon);
          box-shadow: 0 0 6px #62c8ff66;
        }

        .password-feedback {
          font-size: 12px;
          margin-top: 4px;
        }

        .password-feedback.valid {
          color: #4CAF50;
        }

        .password-feedback.invalid {
          color: #ff5d7a;
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
          background: #666;
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
