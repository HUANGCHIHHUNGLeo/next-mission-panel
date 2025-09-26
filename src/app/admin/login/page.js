'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 登入
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage('登入失敗：' + error.message);
        setLoading(false);
        return;
      }

      console.log('登入成功，用戶 ID:', data.user.id);

      // 檢查管理員權限 - 修復版本
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, email, display_name')
        .eq('id', data.user.id)
        .single();

      console.log('用戶資料查詢結果:', userData, userError);

      if (userError) {
        console.error('查詢用戶資料錯誤:', userError);
        setMessage('無法查詢用戶資料：' + userError.message);
        setLoading(false);
        return;
      }

      if (!userData) {
        setMessage('找不到用戶資料，請先完成註冊');
        setLoading(false);
        return;
      }

      // 檢查管理員權限 - 更寬鬆的條件
      if (userData.role !== 'admin' && userData.email !== 'cortexos.main@gmail.com') {
        await supabase.auth.signOut();
        setMessage(`您沒有管理員權限。當前角色：${userData.role || '未設定'}，Email：${userData.email}`);
        setLoading(false);
        return;
      }

      // 登入成功，跳轉到管理介面
      setMessage('登入成功！正在跳轉...');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
      
    } catch (error) {
      console.error('登入錯誤:', error);
      setMessage('登入過程發生錯誤：' + error.message);
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 檢查是否為指定的管理員 Email
    if (email !== 'cortexos.main@gmail.com') {
      setMessage('只有 cortexos.main@gmail.com 可以註冊為管理員');
      setLoading(false);
      return;
    }

    try {
      // 註冊管理員帳號
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || 'AVATAR Math 管理員',
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setMessage('此 Email 已經註冊過了，請直接登入');
        } else {
          setMessage('註冊失敗：' + error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          // 等待一小段時間確保用戶在資料庫中已建立
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 建立管理員用戶資料 - 使用 upsert 避免重複插入
          const { error: profileError } = await supabase
            .from('users')
            .upsert([
              {
                id: data.user.id,
                email: data.user.email,
                display_name: displayName || 'AVATAR Math 管理員',
                role: 'admin', // 直接設定為管理員
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ], {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('建立管理員資料失敗:', profileError);
            setMessage('建立管理員資料失敗，但帳號已註冊。請嘗試登入。');
          } else {
            setMessage('管理員帳號註冊成功！請登入。');
            setIsRegisterMode(false);
          }
        } catch (dbError) {
          console.error('資料庫操作失敗:', dbError);
          setMessage('註冊成功，但初始化資料時發生問題。請嘗試登入。');
        }
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      setMessage('註冊過程發生錯誤：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400 mb-2">AVATAR Math</h1>
          <p className="text-gray-400">
            {isRegisterMode ? '管理員註冊' : '管理員登入'}
          </p>
        </div>

        {/* 切換登入/註冊模式 */}
        <div className="flex mb-6 border border-gray-600 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              resetForm();
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              !isRegisterMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              resetForm();
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              isRegisterMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-6">
          {isRegisterMode && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                管理員姓名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="請輸入管理員姓名"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              管理員 Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="請輸入管理員 Email"
            />
            {isRegisterMode && (
              <p className="text-xs text-yellow-400 mt-1">
                只有 cortexos.main@gmail.com 可以註冊為管理員
              </p>
            )}
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="請輸入密碼"
            />
            {isRegisterMode && (
              <p className="text-xs text-gray-400 mt-1">
                密碼至少需要 6 個字元
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? (isRegisterMode ? '註冊中...' : '登入中...') : (isRegisterMode ? '註冊' : '登入')}
          </button>

          {message && (
            <div className={`text-center text-sm ${message.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            返回學生登入頁面
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">管理員功能</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• 查看所有學生資料</li>
            <li>• 監控學習進度</li>
            <li>• 分析技能發展</li>
            <li>• 管理任務完成情況</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-900 rounded-lg">
          <h4 className="text-xs font-medium text-blue-300 mb-1">使用說明</h4>
          <p className="text-xs text-blue-200">
            {isRegisterMode ? (
              <>首次使用請先註冊管理員帳號<br/>只有指定的 Email 可以註冊為管理員</>
            ) : (
              <>如果是首次使用，請先點擊「註冊」<br/>建立管理員帳號後再登入</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
