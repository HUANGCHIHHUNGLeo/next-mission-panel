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

      // 檢查管理員權限
      const { data: userData } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', data.user.id)
        .single();

      if (userData?.role !== 'admin' && userData?.email !== 'cortexos.main@gmail.com') {
        await supabase.auth.signOut();
        setMessage('您沒有管理員權限');
        setLoading(false);
        return;
      }

      // 登入成功，跳轉到管理介面
      router.push('/admin');
    } catch (error) {
      console.error('登入錯誤:', error);
      setMessage('登入過程發生錯誤');
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
      </div>
    </div>
  );
}
