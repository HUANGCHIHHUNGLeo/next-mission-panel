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
  const router = useRouter();

  // 檢查用戶認證狀態
  useEffect(() => {
    let mounted = true;
    
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (error) {
          console.error('認證檢查錯誤:', error);
          router.push('/');
          return;
        }
        
        if (!user) {
          router.push('/');
          return;
        }
        
        setUser(user);
        await loadUserData(user.id);
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('認證狀態檢查失敗:', error);
        if (mounted) {
          router.push('/');
        }
      }
    };

    getCurrentUser();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push('/');
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserData(session.user.id);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // 載入用戶資料
  const loadUserData = async (userId) => {
    try {
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
          const skillsMap = {};
          skills.forEach(skill => {
            const skillKey = skill.skill_name;
            skillsMap[skillKey] = {
              name: { zh: getSkillDisplayName(skillKey) },
              xp: skill.current_exp || 0,
              lvl: skill.level || 1,
              unlocked: true
            };
          });
          newDb.skills = { ...DEFAULT_DB.skills, ...skillsMap };
        }

        setDb(newDb);
        saveData(newDb);
      }
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    }
  };

  // 取得技能顯示名稱
  const getSkillDisplayName = (skillKey) => {
    const skillNames = {
      number_sense: '數感力',
      calculation: '運算力',
      geometry: '幾何力',
      reasoning: '推理力',
      chart_reading: '圖解力',
      application: '應用力'
    };
    return skillNames[skillKey] || skillKey;
  };

  // 載入題庫
  useEffect(() => {
    loadTasks();
  }, []);

  // 儲存資料
  const saveData = (newDb) => {
    setDb(newDb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
  };

  // 載入題庫
  const loadTasks = async (loadCore = true, loadDaily = true) => {
    try {
      const corePromise = loadCore ? fetch("/tasks/core.json") : Promise.resolve({ json: () => Promise.resolve([]) });
      const dailyPromise = loadDaily ? fetch("/tasks/daily.json") : Promise.resolve({ json: () => Promise.resolve([]) });
      
      const [coreRes, dailyRes] = await Promise.all([corePromise, dailyPromise]);
      
      const core = await coreRes.json();
      const daily = await dailyRes.json();
      if (loadCore) {
        const shuffledCore = core.sort(() => 0.5 - Math.random());
        setCoreTasks(shuffledCore.slice(0, 3).map(task => ({ ...task, done: false })));
      }
      if (loadDaily) {
        const shuffledDaily = daily.sort(() => 0.5 - Math.random());
        setDailyTasks(shuffledDaily.slice(0, 3).map(task => ({ ...task, done: false })));
      }
    } catch (e) {
      console.error('載入任務失敗', e);
    }
  };

  // 計算經驗值百分比
  const calculateExpPercentage = () => {
    const needed = 100 + (Math.max(1, db.me.level) - 1) * 20;
    return Math.min(100, (db.me.exp / needed) * 100);
  };

  // 選擇任務
  const handleTaskSelect = (task, index, isCore) => {
    if (task.done) return;
    setCurrentProblem({ ...task, taskIndex: index, isCore });
  };

  // 提交答案
  const handleSubmitAnswer = async (selectedAnswer, isCorrect, xpGained, skillKey) => {
    if (currentProblem) {
      const newDb = { ...db };
      
      // 增加經驗值
      newDb.me.exp += xpGained;
      
      // 計算獲得的金幣
      const coinsGained = Math.floor(xpGained / 2);
      
      // 增加技能經驗
      let skillLevelUp = false;
      let skillName = "";
      
      const targetSkill = skillKey || currentProblem.skill;
      
      if (targetSkill && newDb.skills[targetSkill]) {
        newDb.skills[targetSkill].xp += xpGained;
        
        const skill = newDb.skills[targetSkill];
        const needed = 100 + (skill.lvl - 1) * 20;
        if (skill.xp >= needed) {
          skill.lvl += 1;
          skill.xp -= needed;
          skillLevelUp = true;
          skillName = skill.name.zh || skill.name;
        }
      }
      
      // 增加金幣
      newDb.me.coins += coinsGained;
      
      // 檢查角色升級
      let charLevelUp = false;
      const charNeeded = 100 + (newDb.me.level - 1) * 20;
      if (newDb.me.exp >= charNeeded) {
        newDb.me.level += 1;
        newDb.me.exp -= charNeeded;
        charLevelUp = true;
      }
      
      // 加入通知訊息
      const notifications = [...newDb.notifs];
      
      if (isCorrect) {
        notifications.unshift(`✅ 完成任務：${currentProblem.title}`);
        notifications.unshift(`💰 獲得 ${coinsGained} 金幣`);
        notifications.unshift(`⭐ 獲得 ${xpGained} 經驗值`);
      } else {
        notifications.unshift(`❌ 任務失敗：${currentProblem.title}`);
      }
      
      if (skillLevelUp) {
        notifications.unshift(`🎉 ${skillName} 升級至 Lv.${newDb.skills[currentProblem.skill].lvl}！`);
      }
      
      if (charLevelUp) {
        notifications.unshift(`🌟 角色升級至 Lv.${newDb.me.level}！`);
      }
      
      newDb.notifs = notifications.slice(0, 10);
      
      // 標記任務完成
      if (currentProblem.isCore) {
        setCoreTasks(prev => prev.map((task, i) => 
          i === currentProblem.taskIndex ? { ...task, done: true } : task
        ));
      } else {
        setDailyTasks(prev => prev.map((task, i) => 
          i === currentProblem.taskIndex ? { ...task, done: true } : task
        ));
      }
      
      saveData(newDb);

      // 同步到資料庫
      if (user) {
        await syncToDatabase(newDb, {
          problemId: currentProblem.id || `${currentProblem.title}-${Date.now()}`,
          problemType: currentProblem.isCore ? 'core' : 'daily',
          question: currentProblem.title,
          userAnswer: selectedAnswer,
          correctAnswer: currentProblem.answer,
          isCorrect,
          expGained: xpGained,
          coinsGained,
          skillsAffected: { [targetSkill]: xpGained }
        });
      }
    }
  };

  // 同步資料到資料庫
  const syncToDatabase = async (dbData, learningRecord) => {
    try {
      // 更新學生檔案
      await supabase
        .from('student_profiles')
        .update({
          total_exp: dbData.me.exp,
          level: dbData.me.level,
          coins: dbData.me.coins,
          character_gender: dbData.me.gender,
          character_image: dbData.me.avatarImg,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // 更新技能進度
      for (const [skillKey, skillData] of Object.entries(dbData.skills)) {
        await supabase
          .from('skill_progress')
          .upsert({
            user_id: user.id,
            skill_name: skillKey,
            current_exp: skillData.xp,
            level: skillData.lvl,
            updated_at: new Date().toISOString()
          });
      }

      // 記錄學習記錄
      if (learningRecord) {
        await supabase
          .from('learning_records')
          .insert([{
            user_id: user.id,
            ...learningRecord
          }]);
      }
    } catch (error) {
      console.error('同步資料失敗:', error);
    }
  };

  // 清除答案
  const handleClearAnswer = () => {
    // 由 ProblemBox 組件處理
  };

  // 刷新核心任務
  const handleRefreshTasks = () => {
    if (db.cards.refresh <= 0) return;
    
    const newDb = { ...db };
    newDb.cards.refresh -= 1;
    saveData(newDb);
    
    loadTasks(true, false);
  };

  // 更新日常任務
  const handleRerollSide = () => {
    const today = new Date().toDateString();
    const newDb = { ...db };
    
    if (newDb.specialTraining.lastUpdateDate !== today) {
      newDb.specialTraining.dailyUpdates = 0;
      newDb.specialTraining.lastUpdateDate = today;
    }
    
    if (newDb.specialTraining.dailyUpdates >= 5) {
      alert('今日特別訓練更新次數已用完（每日限5次）');
      return;
    }
    
    newDb.specialTraining.dailyUpdates += 1;
    saveData(newDb);
    
    loadTasks(false, true);
  };

  // 購買卡片
  const handleBuyCards = (count) => {
    const cost = count === 1 ? 100 : 450;
    if (db.me.coins < cost) return;
    
    const newDb = { ...db };
    newDb.me.coins -= cost;
    newDb.cards.refresh += count;
    saveData(newDb);
  };

  // 更新個人資料
  const handleUpdateProfile = (updates) => {
    const newDb = { ...db };
    newDb.me = { ...newDb.me, ...updates };
    saveData(newDb);
  };

  // 重置資料
  const handleResetData = () => {
    setDb(DEFAULT_DB);
    localStorage.removeItem(STORAGE_KEY);
    setCoreTasks([]);
    setDailyTasks([]);
    setCurrentProblem(null);
    loadTasks();
  };

  // 更新頭像
  const handleAvatarUpdate = (avatarImg) => {
    const newDb = { ...db };
    newDb.me.avatarImg = avatarImg;
    saveData(newDb);
  };

  // 更新性別
  const handleGenderUpdate = (gender) => {
    const newDb = { ...db };
    newDb.me.gender = gender;
    saveData(newDb);
  };

  // 切換語言
  const handleLanguageToggle = () => {
    const newDb = { ...db };
    newDb.lang = newDb.lang === 'zh' ? 'en' : 'zh';
    saveData(newDb);
  };

  // 登出
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 跳轉會由 onAuthStateChange 處理
  };

  if (loading) {
    return (
      <div className="stage">
        <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--white)', fontSize: '18px' }}>載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="screen">
        <Topbar
          currentView={currentView}
          onViewChange={setCurrentView}
          userLevel={db.me.level}
          userExp={Math.round(calculateExpPercentage())}
          coins={db.me.coins}
          refreshCards={db.cards.refresh}
          notifications={db.notifs}
          onLanguageToggle={handleLanguageToggle}
          language={db.lang}
          user={user}
          onLogout={handleLogout}
        />

        {currentView === 'dashboard' && (
          <div id="viewDashboard">
            <div className="cols">
              <div>
                <SkillPanel
                  userInfo={db.me}
                  userExp={Math.round(calculateExpPercentage())}
                  skills={db.skills}
                />
                <ProblemBox
                  currentProblem={currentProblem}
                  onSubmitAnswer={handleSubmitAnswer}
                  onClearAnswer={handleClearAnswer}
                />
              </div>
              <TaskList
                coreTasks={coreTasks}
                dailyTasks={dailyTasks}
                refreshCards={db.cards.refresh}
                coins={db.me.coins}
                specialTraining={db.specialTraining}
                onTaskSelect={handleTaskSelect}
                onRefreshTasks={handleRefreshTasks}
                onRerollSide={handleRerollSide}
                onBuyCards={handleBuyCards}
              />
            </div>
          </div>
        )}

        {currentView === 'character' && (
          <CharacterView
            userInfo={db.me}
            onAvatarUpdate={handleAvatarUpdate}
            onGenderUpdate={handleGenderUpdate}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            userInfo={db.me}
            skills={db.skills}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
          />
        )}
      </div>
    </div>
  );
}
