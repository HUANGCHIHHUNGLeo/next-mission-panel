'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // 檢查管理員權限
  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/admin/login');
        return;
      }

      if (user.email !== 'cortexos.main@gmail.com') {
        router.push('/admin/login');
        return;
      }

      await loadStudents();
    };

    checkAdminAuth();
  }, [router]);

  // 載入學生資料
  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log('載入學生資料...');

      // 載入所有學生的基本資料
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          created_at,
          student_profiles (
            display_name,
            age,
            grade,
            level,
            total_exp,
            coins,
            character_gender,
            created_at
          )
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (studentsError) {
        console.error('載入學生資料失敗:', studentsError);
        return;
      }

      // 為每個學生載入技能進度
      const studentsWithSkills = await Promise.all(
        (studentsData || []).map(async (student) => {
          const { data: skills } = await supabase
            .from('skill_progress')
            .select('*')
            .eq('user_id', student.id);

          // 載入學習記錄統計
          const { data: learningStats } = await supabase
            .from('learning_records')
            .select('is_correct')
            .eq('user_id', student.id);

          const totalProblems = learningStats?.length || 0;
          const correctProblems = learningStats?.filter(record => record.is_correct).length || 0;

          return {
            ...student,
            skills: skills || [],
            totalProblems,
            correctProblems,
            accuracy: totalProblems > 0 ? ((correctProblems / totalProblems) * 100).toFixed(1) : '0'
          };
        })
      );

      setStudents(studentsWithSkills);
      console.log('學生資料載入完成:', studentsWithSkills.length, '位學生');
    } catch (error) {
      console.error('載入學生資料時發生錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  // 手動刷新資料
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  // 查看學生詳情
  const viewStudentDetails = async (student) => {
    try {
      // 載入更詳細的學生資料
      const { data: detailedSkills } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', student.id)
        .order('skill_name');

      const { data: recentRecords } = await supabase
        .from('learning_records')
        .select('*')
        .eq('user_id', student.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSelectedStudent({
        ...student,
        detailedSkills: detailedSkills || [],
        recentRecords: recentRecords || []
      });
      setShowModal(true);
    } catch (error) {
      console.error('載入學生詳情失敗:', error);
    }
  };

  // 計算學生統計
  const calculateStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => 
      s.student_profiles?.[0]?.level > 1 || s.totalProblems > 0
    ).length;
    const avgLevel = totalStudents > 0 
      ? (students.reduce((sum, s) => sum + (s.student_profiles?.[0]?.level || 1), 0) / totalStudents).toFixed(1)
      : '0';
    const todayRegistrations = students.filter(s => {
      const today = new Date().toDateString();
      const createdDate = new Date(s.created_at).toDateString();
      return today === createdDate;
    }).length;

    return { totalStudents, activeStudents, avgLevel, todayRegistrations };
  };

  // 登出功能
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">載入管理員介面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 頂部導航 */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400">AVATAR Math - 管理員介面</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {refreshing ? '刷新中...' : '刷新資料'}
            </button>
            <span className="text-gray-300">歡迎，管理員</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">總學生數</h3>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-green-400 mb-2">活躍學生</h3>
            <p className="text-3xl font-bold">{stats.activeStudents}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">平均等級</h3>
            <p className="text-3xl font-bold">{stats.avgLevel}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">今日註冊</h3>
            <p className="text-3xl font-bold">{stats.todayRegistrations}</p>
          </div>
        </div>

        {/* 學生列表 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-blue-400">學生管理</h2>
            <p className="text-gray-400 mt-1">即時顯示學生學習進度和統計資料</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 font-semibold">學生姓名</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">年齡</th>
                  <th className="text-left p-4 font-semibold">等級</th>
                  <th className="text-left p-4 font-semibold">總經驗值</th>
                  <th className="text-left p-4 font-semibold">解題數</th>
                  <th className="text-left p-4 font-semibold">正確率</th>
                  <th className="text-left p-4 font-semibold">註冊時間</th>
                  <th className="text-left p-4 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const profile = student.student_profiles?.[0];
                  return (
                    <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="font-medium">
                          {profile?.display_name || student.display_name || '未設定'}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{student.email}</td>
                      <td className="p-4">{profile?.age || '未設定'}</td>
                      <td className="p-4">
                        <span className="bg-blue-600 px-2 py-1 rounded text-sm">
                          Lv.{profile?.level || 1}
                        </span>
                      </td>
                      <td className="p-4 text-yellow-400 font-medium">
                        {profile?.total_exp || 0} XP
                      </td>
                      <td className="p-4">{student.totalProblems}</td>
                      <td className="p-4">
                        <span className={`font-medium ${
                          parseFloat(student.accuracy) >= 80 ? 'text-green-400' :
                          parseFloat(student.accuracy) >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {student.accuracy}%
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(student.created_at).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => viewStudentDetails(student)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          查看詳情
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                目前沒有學生資料
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 學生詳情彈窗 */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-400">
                  {selectedStudent.student_profiles?.[0]?.display_name || selectedStudent.display_name} - 詳細資料
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本資料 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">基本資料</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">姓名：</span>{selectedStudent.student_profiles?.[0]?.display_name || '未設定'}</p>
                    <p><span className="text-gray-400">Email：</span>{selectedStudent.email}</p>
                    <p><span className="text-gray-400">年齡：</span>{selectedStudent.student_profiles?.[0]?.age || '未設定'}</p>
                    <p><span className="text-gray-400">年級：</span>{selectedStudent.student_profiles?.[0]?.grade || '未設定'}</p>
                    <p><span className="text-gray-400">註冊時間：</span>{new Date(selectedStudent.created_at).toLocaleString('zh-TW')}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">遊戲資料</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">等級：</span>Lv.{selectedStudent.student_profiles?.[0]?.level || 1}</p>
                    <p><span className="text-gray-400">總經驗值：</span>{selectedStudent.student_profiles?.[0]?.total_exp || 0} XP</p>
                    <p><span className="text-gray-400">金幣：</span>{selectedStudent.student_profiles?.[0]?.coins || 0}</p>
                    <p><span className="text-gray-400">性別：</span>{selectedStudent.student_profiles?.[0]?.character_gender || 'male'}</p>
                    <p><span className="text-gray-400">解題總數：</span>{selectedStudent.totalProblems}</p>
                    <p><span className="text-gray-400">正確率：</span>{selectedStudent.accuracy}%</p>
                  </div>
                </div>
              </div>

              {/* 技能進度 */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-4">技能進度</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStudent.detailedSkills?.map((skill) => (
                    <div key={skill.skill_name} className="bg-gray-600 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.skill_name}</span>
                        <span className="text-sm bg-blue-600 px-2 py-1 rounded">Lv.{skill.level}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>當前經驗：{skill.current_exp}</p>
                        <p>總經驗：{skill.total_exp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最近學習記錄 */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-400 mb-4">最近學習記錄</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedStudent.recentRecords?.map((record, index) => (
                    <div key={index} className="bg-gray-600 p-3 rounded flex justify-between items-center">
                      <div>
                        <span className="font-medium">{record.skill_name}</span>
                        <span className="text-sm text-gray-300 ml-2">
                          {new Date(record.created_at).toLocaleString('zh-TW')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          record.is_correct ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {record.is_correct ? '正確' : '錯誤'}
                        </span>
                        <span className="text-yellow-400">+{record.exp_gained} XP</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedStudent.recentRecords || selectedStudent.recentRecords.length === 0) && (
                    <p className="text-gray-400 text-center py-4">暫無學習記錄</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
