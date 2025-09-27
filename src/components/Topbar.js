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
  language,
  user,
  onLogout
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
          <span className="chip user-info">
            👤 {user?.user_metadata?.display_name || user?.email || '用戶'}
          </span>
          <span className="chip">Lv.{userLevel} / {userExp}%</span>
          <span className="chip">金幣 {coins}</span>
          <span className="chip">刷新卡 x{refreshCards}</span>
          <button className="langBtn" onClick={onLanguageToggle}>
            {language === 'zh' ? '中' : 'EN'}
          </button>
          <button className="langBtn logout-btn" onClick={onLogout}>
            登出
          </button>
        </div>
      </div>

      {/* Mini notification */}
      <div className="notifyMini">
        <span className="badge">!</span>
        <div className="ttl">通知</div>
      <ul>
  {(notifications || []).slice(0, 3).map((notif, i) => (
    <li key={i}>{notif}</li>
  ))}
</ul>
        <button 
          className="langBtn"
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ marginLeft: 'auto' }}
        >
          {showNotifications ? '收起' : '展開'}
        </button>
      </div>

      {/* 展開的通知列表 */}
      {showNotifications && (
        <div className="expandedNotifications">
          <div className="panel">
            <h3>所有通知</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.map((notif, i) => (
                <li key={i} style={{ 
                  padding: '8px 0', 
                  borderBottom: i < notifications.length - 1 ? '1px solid #62c8ff33' : 'none',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {notif}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-info {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: #ef4444 !important;
          color: #fca5a5 !important;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.3) !important;
          color: #ffffff !important;
        }

        .expandedNotifications {
          margin-top: 8px;
        }

        .expandedNotifications .panel {
          max-height: 300px;
          overflow-y: auto;
        }

        .expandedNotifications h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #d9f6ff;
        }
      `}</style>
    </>
  );
}
