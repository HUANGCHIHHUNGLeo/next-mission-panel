'use client';

import { useState, useEffect } from 'react';

export default function TaskList({ 
  coreTasks, 
  dailyTasks, 
  refreshCards, 
  coins,
  specialTraining,
  onTaskSelect, 
  onRefreshTasks, 
  onRerollSide,
  onBuyCards 
}) {
  const [countdown, setCountdown] = useState('');

  // 計算到23:00的倒數時間
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0);
      
      // 如果現在已經過了今天的23:00，則計算到明天23:00的時間
      if (now > today) {
        today.setDate(today.getDate() + 1);
      }
      
      const diff = today - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const renderTask = (task, index, isCore = false) => (
    <div key={index} className="taskItem">
      <div className="taskname">{task.title}</div>
      <div className="xpGold">+{task.xp || 10} XP</div>
      <button 
        className={`btn ${task.done ? 'done' : ''}`}
        onClick={() => onTaskSelect(task, index, isCore)}
        disabled={task.done}
      >
        {task.done ? '完成' : '開始'}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* 核心任務 */}
      <div className="panel">
        <h2>
          每日任務 <span className="sm">（{countdown} 後刷新）</span>
          <span>
            <button 
              className="btn" 
              onClick={onRefreshTasks}
              disabled={refreshCards <= 0}
            >
              刷新任務（卡 x<span>{refreshCards}</span>）
            </button>
          </span>
        </h2>
        <div>
          {coreTasks.map((task, index) => renderTask(task, index, true))}
        </div>
      </div>

      {/* 日常任務 */}
      <div className="panel">
        <h2>
          特別訓練 <span className="sm">（今日剩餘 {Math.max(0, 5 - (specialTraining?.dailyUpdates || 0))} 次更新）</span>
          <span>
            <button 
              className="btn" 
              onClick={onRerollSide}
              disabled={(specialTraining?.dailyUpdates || 0) >= 5}
            >
              更新
            </button>
          </span>
        </h2>
        <div>
          {dailyTasks.map((task, index) => renderTask(task, index, false))}
        </div>
      </div>

      {/* 卡片商城 */}
      <div className="panel">
        <h2>卡片 / 商城</h2>
        <div className="sm">
          刷新卡可用於重新抽核心任務。升級與連續登入可獲得卡片。
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={() => onBuyCards(1)}
            disabled={coins < 100}
          >
            買刷新卡 x1（100 金幣）
          </button>
          <button 
            className="btn" 
            onClick={() => onBuyCards(5)}
            disabled={coins < 450}
          >
            買刷新卡 x5（450 金幣）
          </button>
        </div>
      </div>
    </div>
  );
}
