'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Topbar from '../../components/Topbar';
import SkillPanel from '../../components/SkillPanel';
import ProblemBox from '../../components/ProblemBox';
import TaskList from '../../components/TaskList';
import CharacterView from '../../components/CharacterView';
import SettingsView from '../../components/SettingsView';

const STORAGE_KEY = 'one_prof_mvp_step2';

const DEFAULT_DB = {
  lang: 'zh',
  me: {
    name: '',
    gender: 'male',
    title: '學生',
    cls: '五年級',
    level: 1,
    exp: 0,
    coins: 200,
    avatarImg: null,
  },
  cards: { refresh: 2 },
  login: { streak: 0, last: 0 },
  specialTraining: { dailyUpdates: 0, lastUpdateDate: null },
  notifs: ['歡迎來到學習任務面板！'],
  skills: {
    number_sense: { name: { zh: '數感力' }, xp: 0, lvl: 1, unlocked: true },
    calculation: { name: { zh: '運算力' }, xp: 0, lvl: 1, unlocked: true },
    geometry: { name: { zh: '幾何力' }, xp: 0, lvl: 1, unlocked: true },
    reasoning: { name: { zh: '推理力' }, xp: 0, lvl: 1, unlocked: true },
    chart_reading: { name: { zh: '圖解力' }, xp: 0, lvl: 1, unlocked: true },
    application: { name: { zh: '應用力' }, xp: 0, lvl: 1, unlocked: true },
  },
  tasks: [],
  side: [],
  history: [],
  ui: { skillPct: {} },
  currentQ: null,
};

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [db, setDb] = useState(DEFAULT_DB);
  const [coreTasks, setCoreTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  
  // 認證相關狀態
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // 穩定的認證檢查
  useEffect(() => {
    let mounted = true;
    let authSubscription = null;
    
    const initAuth = async () => {
      try {
        console.log('儀表板：檢查認證狀態...');
        
        // 檢查當前 session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('儀表板：認證檢查錯誤:', error);
          router.push('/');
          return;
        }
        
        if (!session?.user) {
          console.log('儀表板：未登入，跳轉到登入頁面');
          router.push('/');
          return;
        }
        
        console.log('儀表板：用戶已登入:', session.user.email);
        setUser(session.user);
        setAuthChecked(true);
        
        // 載入用戶資料
        await loadUserData(session.user.id);
        
        if (mounted) {
          setLoading(false);
        }
        
        // 設定認證狀態監聽
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('儀表板：認證狀態變化:', event);
            
            if (event === 'SIGNED_OUT' || !session?.user) {
              console.log('儀表板：用戶登出，跳轉到登入頁面');
              router.push('/');
            } else if (event === 'SIGNED_IN' && session?.user) {
              setUser(session.user);
              await loadUserData(session.user.id);
              setLoading(false);
            }
          }
        );
        
        authSubscription = subscription;
        
      } catch (error) {
        console.error('儀表板：認證初始化失敗:', error);
        if (mounted) {
          router.push('/');
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [router]);

  // 載入用戶資料
  const loadUserData = async (userId) => {
    try {
      console.log('載入用戶資料:', userId);
      
      // 載入用戶基本資料
      const { data: userData } = await supabase
        .from('users')
        .select('display_name, email')
        .eq('id', userId)
        .single();

      // 載入學生檔案
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // 載入技能進度
      const { data: skills } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId);

      if (profile) {
        const newDb = {
          ...DEFAULT_DB,
          me: {
            ...DEFAULT_DB.me,
            name: profile.display_name || userData?.display_name || '',
            gender: profile.character_gender || 'male',
            level: profile.level || 1,
            exp: profile.total_exp || 0,
            coins: profile.coins || 200,
            avatarImg: profile.character_image,
          }
        };

        // 更新技能資料
        if (skills && skills.length > 0) {
          skills.forEach(skill => {
            const skillKey = skill.skill_name;
            if (newDb.skills[skillKey]) {
              newDb.skills[skillKey].xp = skill.current_exp || 0;
              newDb.skills[skillKey].lvl = skill.level || 1;
            }
          });
        }

        setDb(newDb);
        console.log('用戶資料載入完成');
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  // 載入任務資料
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // 載入核心任務
        const coreResponse = await fetch('/tasks/core.json');
        const coreData = await coreResponse.json();
        setCoreTasks(coreData.tasks || []);

        // 載入每日任務
        const dailyResponse = await fetch('/tasks/daily.json');
        const dailyData = await dailyResponse.json();
        setDailyTasks(dailyData.tasks || []);
      } catch (error) {
        console.error('載入任務失敗:', error);
      }
    };

    if (authChecked && user) {
      loadTasks();
    }
  }, [authChecked, user]);

  // 登出功能
  const handleLogout = async () => {
    try {
      console.log('執行登出...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('登出錯誤:', error);
      } else {
        console.log('登出成功');
        // 清除本地狀態
        setUser(null);
        setDb(DEFAULT_DB);
        setCurrentView('dashboard');
        // 跳轉會由 onAuthStateChange 處理
      }
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  // 如果還在載入認證狀態
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">載入中...</p>
          <p className="text-gray-500 text-sm mt-2">正在載入儀表板</p>
        </div>
      </div>
    );
  }

  // 如果沒有用戶，不應該到這裡，但以防萬一
  if (!user) {
    return null;
  }

  const handleTaskStart = (task) => {
    setCurrentProblem(task);
    setCurrentView('problem');
  };

  const handleProblemClose = () => {
    setCurrentProblem(null);
    setCurrentView('dashboard');
  };

  const handleSkillUpdate = (skillName, xpGain) => {
    setDb(prev => {
      const newDb = { ...prev };
      if (newDb.skills[skillName]) {
        newDb.skills[skillName].xp += xpGain;
        // 簡單的升級邏輯
        const newLevel = Math.floor(newDb.skills[skillName].xp / 100) + 1;
        newDb.skills[skillName].lvl = newLevel;
      }
      return newDb;
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'character':
        return <CharacterView db={db} setDb={setDb} />;
      case 'settings':
        return <SettingsView db={db} setDb={setDb} onLogout={handleLogout} />;
      case 'problem':
        return currentProblem ? (
          <ProblemBox 
            problem={currentProblem} 
            onClose={handleProblemClose}
            onSkillUpdate={handleSkillUpdate}
          />
        ) : null;
      default:
        return (
          <div className="flex-1 flex">
            {/* 左側面板 */}
            <div className="w-1/3 p-4 space-y-4">
              <SkillPanel skills={db.skills} />
            </div>
            
            {/* 右側面板 */}
            <div className="w-2/3 p-4 space-y-4">
              <TaskList 
                title="每日任務"
                tasks={dailyTasks}
                onTaskStart={handleTaskStart}
                timeLeft="11:37:36 後刷新"
              />
              <TaskList 
                title="特別訓練"
                tasks={coreTasks}
                onTaskStart={handleTaskStart}
                timeLeft="今日剩餘 5 次更新"
                showRefresh={true}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Topbar 
        user={db.me} 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />
      {renderCurrentView()}
    </div>
  );
}
