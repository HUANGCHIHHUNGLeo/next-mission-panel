'use client';

import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import SkillPanel from '../components/SkillPanel';
import ProblemBox from '../components/ProblemBox';
import TaskList from '../components/TaskList';
import CharacterView from '../components/CharacterView';
import SettingsView from '../components/SettingsView';

const STORAGE_KEY = 'one_prof_mvp_step2';

const DEFAULT_DB = {
  lang: 'zh',
  me: {
    name: '',
    title: '學生',
    cls: '五年級',
    level: 1,
    exp: 0,
    coins: 200,
    avatarImg: null,
  },
  cards: { refresh: 2 },
  login: { streak: 0, last: 0 },
  notifs: ['歡迎來到學習任務面板！'],
  skills: {
    calc: { name: { zh: '運算能力' }, xp: 0, lvl: 1, unlocked: true },
    geom: { name: { zh: '幾何圖形與理解' }, xp: 0, lvl: 1, unlocked: true },
    algebra: { name: { zh: '代數運用' }, xp: 0, lvl: 1, unlocked: true },
    apply: { name: { zh: '解題與應用能力' }, xp: 0, lvl: 1, unlocked: true },
  },
  tasks: [],
  side: [],
  history: [],
  ui: { skillPct: {} },
  currentQ: null,
};

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [db, setDb] = useState(DEFAULT_DB);
  const [coreTasks, setCoreTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);

  // 載入資料
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setDb({ ...DEFAULT_DB, ...parsed });
      } catch (e) {
        console.error('載入資料失敗', e);
      }
    }
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
      const [coreRes, dailyRes] = await Promise.all([
        loadCore ? fetch(\'/tasks/core.json\') : Promise.resolve({ json: () => Promise.resolve([]) }),
        loadDaily ? fetch(\'/tasks/daily.json\') : Promise.resolve({ json: () => Promise.resolve([]) })
      ]);
      const core = await coreRes.json();
      const daily = await dailyRes.json();
      if (loadCore) {
        setCoreTasks(core.map(task => ({ ...task, done: false })));
      }
      if (loadDaily) {
        setDailyTasks(daily.map(task => ({ ...task, done: false })));
      }
    } catch (e) {
      console.error(\'載入任務失敗\', e);
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
  const handleSubmitAnswer = (answer, isCorrect) => {
    if (currentProblem) {
      const newDb = { ...db };
      
      // 計算獲得的經驗值和金幣
      const xpGained = currentProblem.xp || 10;
      const coinsGained = Math.floor(xpGained / 2);
      
      // 增加經驗值
      newDb.me.exp += xpGained;
      
      // 增加技能經驗
      let skillLevelUp = false;
      let skillName = '';
      if (currentProblem.skill && newDb.skills[currentProblem.skill]) {
        newDb.skills[currentProblem.skill].xp += xpGained;
        
        // 檢查技能升級
        const skill = newDb.skills[currentProblem.skill];
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
      
      // 保持最多 10 條通知
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
    
    // 重新載入核心任務
    loadTasks(true, false);
  };

  // 更新日常任務
  const handleRerollSide = () => {
    // 重新載入日常任務
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

  // 切換語言
  const handleLanguageToggle = () => {
    const newDb = { ...db };
    newDb.lang = newDb.lang === 'zh' ? 'en' : 'zh';
    saveData(newDb);
  };

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
