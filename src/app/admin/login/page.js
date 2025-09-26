'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400 mb-2">AVATAR Math</h1>
          <p className="text-gray-400">管理員登入</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? '登入中...' : '登入'}
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
          <h4 className="text-xs font-medium text-blue-300 mb-1">除錯資訊</h4>
          <p className="text-xs text-blue-200">
            如果登入失敗，請檢查：<br/>
            1. Email 是否正確<br/>
            2. 是否已在網站完成註冊<br/>
            3. 資料庫中的 role 欄位
          </p>
        </div>
      </div>
    </div>
  );
}
