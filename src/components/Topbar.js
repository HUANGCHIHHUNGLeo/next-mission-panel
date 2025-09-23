'use client';

import { useState } from 'react';

export default function Topbar({ 
  currentView, 
  onViewChange, 
  userLevel, 
  userExp, 
  coins, 
  refreshCards,
  notifications,
  onLanguageToggle,
  language 
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const views = [
    { id: 'dashboard', label: '任務面板' },
    { id: 'character', label: '角色介面' },
    { id: 'settings', label: '個人資料' }
  ];

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="navBtns">
          {views.map(view => (
            <button
              key={view.id}
              className={`navBtn ${currentView === view.id ? 'active' : ''}`}
              onClick={() => onViewChange(view.id)}
            >
              {view.label}
            </button>
          ))}
        </div>
        <div className="topStats">
          <span className="chip">Lv.{userLevel} / {userExp}%</span>
          <span className="chip">金幣 {coins}</span>
          <span className="chip">刷新卡 x{refreshCards}</span>
        </div>
      </div>

      {/* Mini notification */}
      <div className="notifyMini">
        <span className="badge">!</span>
        <div className="ttl">通知</div>
        <ul>
          {notifications.slice(0, 3).map((notif, index) => (
            <li key={index}>{notif}</li>
          ))}
        </ul>
        <button 
          className="langBtn" 
          onClick={onLanguageToggle}
        >
          {language === 'zh' ? '中 / EN' : 'EN / 中'}
        </button>
      </div>
    </>
  );
}
