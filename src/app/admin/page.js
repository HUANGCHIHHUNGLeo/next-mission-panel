'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // 檢查管理員權限
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/');
          return;
        }

        // 檢查是否為管理員（可以根據 email 或 role 欄位判斷）
        const { data: userData } = await supabase
          .from('users')
          .select('role, email')
          .eq('id', user.id)
          .single();

        if (userData?.role !== 'admin' && userData?.email !== 'cortexos.main@gmail.com') {
          alert('您沒有管理員權限');
          router.push('/');
          return;
        }

        setUser(user);
        await loadStudentsData();
        setLoading(false);
      } catch (error) {
        console.error('權限檢查失敗:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [router]);

  // 載入所有學生資料
  const loadStudentsData = async () => {
    try {
      // 載入學生基本資料
      const { data: studentsData } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          phone,
          age,
          created_at,
          student_profiles (
            grade,
            level,
            total_exp,
            coins,
            character_gender,
            character_image
          )
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (studentsData) {
        // 為每個學生載入技能進度
        const studentsWithSkills = await Promise.all(
          studentsData.map(async (student) => {
            const { data: skills } = await supabase
              .from('skill_progress')
              .select('skill_name, level, current_exp, total_problems_solved')
              .eq('user_id', student.id);

            const { data: taskProgress } = await supabase
              .from('task_progress')
              .select('task_type, completed_today, special_training_uses')
              .eq('user_id', student.id);

            return {
              ...student,
              skills: skills || [],
              taskProgress: taskProgress || []
            };
          })
        );

        setStudents(studentsWithSkills);
      }
    } catch (error) {
      console.error('載入學生資料失敗:', error);
    }
  };

  // 計算學生總體表現
  const calculateStudentStats = (student) => {
    const skills = student.skills || [];
    const totalLevel = skills.reduce((sum, skill) => sum + (skill.level || 1), 0);
    const avgLevel = skills.length > 0 ? (totalLevel / skills.length).toFixed(1) : '1.0';
    const totalProblems = skills.reduce((sum, skill) => sum + (skill.total_problems_solved || 0), 0);
    
    return {
      avgLevel,
      totalProblems,
      totalSkills: skills.length
    };
  };

  // 登出功能
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 頂部導航 */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400">AVATAR Math - 老師管理介面</h1>
          <div className="flex items-center gap-4">
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
            <p className="text-3xl font-bold">{students.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-green-400 mb-2">活躍學生</h3>
            <p className="text-3xl font-bold">
              {students.filter(s => s.student_profiles?.[0]?.level > 1).length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">平均等級</h3>
            <p className="text-3xl font-bold">
              {students.length > 0 
                ? (students.reduce((sum, s) => sum + (s.student_profiles?.[0]?.level || 1), 0) / students.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">今日註冊</h3>
            <p className="text-3xl font-bold">
              {students.filter(s => {
                const today = new Date().toDateString();
                const createdDate = new Date(s.created_at).toDateString();
                return today === createdDate;
              }).length}
            </p>
          </div>
        </div>

        {/* 學生列表 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-blue-400">學生管理</h2>
            <p className="text-gray-400 mt-1">點擊學生查看詳細資料</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 font-semibold">學生姓名</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">年齡</th>
                  <th className="text-left p-4 font-semibold">等級</th>
                  <th className="text-left p-4 font-semibold">平均技能等級</th>
                  <th className="text-left p-4 font-semibold">解題數</th>
                  <th className="text-left p-4 font-semibold">註冊時間</th>
                  <th className="text-left p-4 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const stats = calculateStudentStats(student);
                  const profile = student.student_profiles?.[0];
                  
                  return (
                    <tr 
                      key={student.id} 
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {student.display_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium">{student.display_name || '未設定'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{student.email}</td>
                      <td className="p-4">{student.age || '-'}</td>
                      <td className="p-4">
                        <span className="bg-blue-600 px-2 py-1 rounded text-sm">
                          Lv.{profile?.level || 1}
                        </span>
                      </td>
                      <td className="p-4">{stats.avgLevel}</td>
                      <td className="p-4">{stats.totalProblems}</td>
                      <td className="p-4 text-gray-300">
                        {new Date(student.created_at).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedStudent(student)}
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
          </div>

          {students.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p>目前沒有學生資料</p>
            </div>
          )}
        </div>
      </div>

      {/* 學生詳情彈窗 */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-400">
                {selectedStudent.display_name} 的學習資料
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* 基本資料 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-3">基本資料</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">姓名:</span> {selectedStudent.display_name}</p>
                    <p><span className="text-gray-400">Email:</span> {selectedStudent.email}</p>
                    <p><span className="text-gray-400">年齡:</span> {selectedStudent.age}</p>
                    <p><span className="text-gray-400">電話:</span> {selectedStudent.phone}</p>
                    <p><span className="text-gray-400">註冊時間:</span> {new Date(selectedStudent.created_at).toLocaleString('zh-TW')}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-3">遊戲資料</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">等級:</span> Lv.{selectedStudent.student_profiles?.[0]?.level || 1}</p>
                    <p><span className="text-gray-400">經驗值:</span> {selectedStudent.student_profiles?.[0]?.total_exp || 0}</p>
                    <p><span className="text-gray-400">金幣:</span> {selectedStudent.student_profiles?.[0]?.coins || 200}</p>
                    <p><span className="text-gray-400">年級:</span> {selectedStudent.student_profiles?.[0]?.grade || 7}</p>
                    <p><span className="text-gray-400">角色性別:</span> {selectedStudent.student_profiles?.[0]?.character_gender === 'male' ? '男' : '女'}</p>
                  </div>
                </div>
              </div>

              {/* 技能進度 */}
              <div className="mb-8">
                <h4 className="font-semibold text-yellow-400 mb-4">技能進度</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStudent.skills.map((skill) => (
                    <div key={skill.skill_name} className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-300 mb-2">
                        {getSkillDisplayName(skill.skill_name)}
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-400">等級:</span> Lv.{skill.level}</p>
                        <p><span className="text-gray-400">經驗值:</span> {skill.current_exp}</p>
                        <p><span className="text-gray-400">解題數:</span> {skill.total_problems_solved}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 任務進度 */}
              <div>
                <h4 className="font-semibold text-purple-400 mb-4">任務進度</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudent.taskProgress.map((task, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-medium text-green-300 mb-2">
                        {task.task_type === 'daily' ? '每日任務' : '核心任務'}
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-400">今日完成:</span> {task.completed_today}</p>
                        <p><span className="text-gray-400">特訓使用:</span> {task.special_training_uses}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 技能名稱對照
function getSkillDisplayName(skillKey) {
  const skillNames = {
    number_sense: '數感力',
    calculation: '運算力',
    geometry: '幾何力',
    reasoning: '推理力',
    chart_reading: '圖解力',
    application: '應用力'
  };
  return skillNames[skillKey] || skillKey;
}
