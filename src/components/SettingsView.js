'use client';

import { useState } from 'react';
import RadarChart from './RadarChart';

export default function SettingsView({ 
  userInfo, 
  skills, 
  onUpdateProfile, 
  onResetData 
}) {
  const [name, setName] = useState(userInfo.name || '');
  const [grade, setGrade] = useState(userInfo.cls || '五年級');

  const handleApply = () => {
    onUpdateProfile({ name, cls: grade });
  };

  const handleReset = () => {
    if (confirm('確定重置所有資料？')) {
      onResetData();
    }
  };

  const renderSkillsList = () => {
    return Object.entries(skills).map(([key, skill]) => (
      <div key={key} className="stat">
        <div className="skillName">
          {skill.name?.zh || key}
          <span className="lv">Lv.{skill.lvl}</span>
        </div>
        <div className="bar">
          <i style={{ width: `${Math.min(100, (skill.xp / (100 + (skill.lvl - 1) * 20)) * 100)}%` }}></i>
        </div>
        <div className="val">{skill.xp}</div>
        <div className="xpGold">+{Math.floor(skill.xp / 10)}</div>
      </div>
    ));
  };

  return (
    <div className="panel">
      <h2>個人資料</h2>
      <div className="meta">
        <div><span>姓名</span><strong>{userInfo.name || '-'}</strong></div>
        <div><span>身分</span><strong>{userInfo.title || '-'}</strong></div>
        <div><span>年級</span><strong>{userInfo.cls || '-'}</strong></div>
        <div><span>Lv.</span><strong>{userInfo.level}</strong></div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '8px', 
        marginTop: '8px' 
      }}>
        <div className="field">
          <label>姓名</label>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入姓名" 
          />
        </div>
        <div className="field">
          <label>年級</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option>五年級</option>
            <option>六年級</option>
            <option>國一生</option>
            <option>國二生</option>
            <option>國三生</option>
          </select>
        </div>
      </div>

      {/* 技能面板 + 雷達圖 */}
      <div id="profileWrap">
        <RadarChart skills={skills} />
        <div id="profileSkills">
          <h3>技能一覽</h3>
          <div>
            {renderSkillsList()}
          </div>
        </div>
      </div>

      {/* 套用 / 重置 */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button className="btn" onClick={handleApply}>
          套用
        </button>
        <button className="btn" onClick={handleReset}>
          重置所有資料
        </button>
      </div>
    </div>
  );
}
