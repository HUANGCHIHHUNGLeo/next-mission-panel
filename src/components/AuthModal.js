'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
              phone: phone,
              age: parseInt(age),
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
          try {
            // 等待一小段時間確保用戶在資料庫中已建立
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 建立用戶資料 - 使用 upsert 避免重複插入
            const { error: profileError } = await supabase
              .from('users')
              .upsert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  display_name: displayName,
                  phone: phone,
                  age: parseInt(age),
                  role: 'student',
                  privacy_consent: true,
                  privacy_consent_date: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ], {
                onConflict: 'id'
              });

            if (profileError) {
              console.error('建立用戶資料失敗:', profileError);
              throw new Error('建立用戶資料失敗，請稍後再試');
            }

            // 建立學生檔案 - 提供完整預設值
            const { error: studentError } = await supabase
              .from('student_profiles')
              .upsert([
                {
                  user_id: data.user.id,
                  character_gender: 'male',
                  total_exp: 0,
                  level: 1,
                  coins: 200,
                  display_name: displayName,
                  grade: Math.max(1, Math.min(12, parseInt(age) - 5)), // 根據年齡推算年級
                  age: parseInt(age),
                  gender: 'male', // 預設值，之後可以讓用戶修改
                  character_image: '/images/male_character.png',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ], {
                onConflict: 'user_id'
              });

            if (studentError) {
              console.error('建立學生檔案失敗:', studentError);
              throw new Error('建立學生檔案失敗，請稍後再試');
            }

            // 初始化技能進度
            const skills = ['number_sense', 'calculation', 'geometry', 'reasoning', 'chart_reading', 'application'];
            const skillData = skills.map(skill => ({
              user_id: data.user.id,
              skill_name: skill,
              current_exp: 0,
              level: 1,
              total_problems_solved: 0,
              correct_answers: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));

            const { error: skillError } = await supabase
              .from('skill_progress')
              .upsert(skillData, {
                onConflict: 'user_id,skill_name'
              });

            if (skillError) {
              console.error('建立技能進度失敗:', skillError);
              throw new Error('建立技能進度失敗，請稍後再試');
            }

            // 建立任務進度
            const { error: taskError } = await supabase
              .from('task_progress')
              .upsert([
                {
                  user_id: data.user.id,
                  task_type: 'core',
                  completed_today: 0,
                  special_training_uses: 0,
                  refresh_cards: 2,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                {
                  user_id: data.user.id,
                  task_type: 'daily',
                  completed_today: 0,
                  special_training_uses: 0,
                  refresh_cards: 2,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ], {
                onConflict: 'user_id,task_type'
              });

            if (taskError) {
              console.error('建立任務進度失敗:', taskError);
              throw new Error('建立任務進度失敗，請稍後再試');
            }
          } catch (dbError) {
            console.error('資料庫操作失敗:', dbError);
            setMessage('註冊成功，但初始化資料時發生問題。請重新登入。');
            return;
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

  // 重置表單
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setPhone('');
    setAge('');
    setPrivacyConsent(false);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{isLogin ? '登入' : '註冊'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleAuth} className="auth-form" autoComplete="off">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  placeholder="請輸入您的姓名"
                  autoComplete="off"
                  name="display-name"
                />
              </div>

              <div className="form-group">
                <label>電話號碼 *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={!isLogin}
                  placeholder="例如：0912345678 或 02-12345678"
                  autoComplete="off"
                  name="phone-number"
                  className={!isLogin && phone ? (phoneValid ? 'valid' : 'invalid') : ''}
                />
                {!isLogin && phone && !phoneValid && (
                  <div className="field-feedback invalid">
                    請輸入有效的台灣電話號碼
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>年齡 *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required={!isLogin}
                  placeholder="請輸入年齡（6-18歲）"
                  min="6"
                  max="18"
                  autoComplete="off"
                  name="user-age"
                  className={!isLogin && age ? (ageValid ? 'valid' : 'invalid') : ''}
                />
                {!isLogin && age && !ageValid && (
                  <div className="field-feedback invalid">
                    年齡必須在 6-18 歲之間
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="請輸入 Email"
              autoComplete="off"
              name="email-address"
            />
          </div>

          <div className="form-group">
            <label>
              密碼 *
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
              autoComplete="off"
              name="user-password"
              className={!isLogin && password ? (passwordCheck.valid ? 'valid' : 'invalid') : ''}
            />
            {!isLogin && password && (
              <div className={`field-feedback ${passwordCheck.valid ? 'valid' : 'invalid'}`}>
                {passwordCheck.message}
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="form-group privacy-group">
              <label className="privacy-label">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  required={!isLogin}
                  className="privacy-checkbox"
                />
                <span className="privacy-text">
                  我已閱讀並同意 
                  <button 
                    type="button" 
                    className="privacy-link"
                    onClick={() => window.open('/privacy-policy', '_blank')}
                  >
                    隱私政策
                  </button> 
                  和 
                  <button 
                    type="button" 
                    className="privacy-link"
                    onClick={() => window.open('/terms-of-service', '_blank')}
                  >
                    服務條款
                  </button>
                </span>
              </label>
              <div className="privacy-note">
                依據個人資料保護法，我們將妥善保護您的個人資料
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || (!isLogin && (
              !passwordCheck.valid || 
              !phoneValid || 
              !ageValid || 
              !privacyConsent
            ))} 
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
              resetForm();
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
          overflow-y: auto;
          padding: 20px;
        }

        .auth-modal {
          background: linear-gradient(160deg, var(--deep), var(--deep2));
          border: 2px solid var(--grid);
          border-radius: 15px;
          padding: 24px;
          width: 100%;
          max-width: 450px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 0 30px rgba(98, 200, 255, .35);
          margin: auto;
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

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="tel"],
        .form-group input[type="number"] {
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

        .field-feedback {
          font-size: 12px;
          margin-top: 4px;
        }

        .field-feedback.valid {
          color: #4CAF50;
        }

        .field-feedback.invalid {
          color: #ff5d7a;
        }

        .privacy-group {
          background: rgba(98, 200, 255, 0.05);
          border: 1px solid rgba(98, 200, 255, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin: 8px 0;
        }

        .privacy-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-weight: normal;
        }

        .privacy-checkbox {
          margin: 0;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .privacy-text {
          color: var(--white);
          font-size: 14px;
          line-height: 1.5;
        }

        .privacy-link {
          background: none;
          border: none;
          color: var(--neon);
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          padding: 0;
        }

        .privacy-link:hover {
          color: var(--white);
        }

        .privacy-note {
          color: #999;
          font-size: 12px;
          margin-top: 8px;
          line-height: 1.4;
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

        @media (max-width: 480px) {
          .auth-modal {
            padding: 20px;
            margin: 10px;
          }
          
          .auth-modal-header h2 {
            font-size: 20px;
          }
          
          .privacy-label {
            gap: 8px;
          }
          
          .privacy-text {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
