'use client';

export default function SkillPanel({ 
  userInfo, 
  userExp, 
  skills, 
  onSkillUpdate 
}) {
  const calculateExpPercentage = (exp, level) => {
    const needed = 100 + (Math.max(1, level) - 1) * 20;
    return Math.min(100, (exp / needed) * 100);
  };

  const renderSkillBar = (skill) => {
    const percentage = calculateExpPercentage(skill.xp, skill.lvl);
    const needed = 100 + (Math.max(1, skill.lvl) - 1) * 20;
    const tooltipText = `${skill.xp}/${needed}`;
    
    return (
      <div key={skill.name.zh} className="stat">
        <div className="skillName">
          {skill.name.zh}
          <span className="lv">Lv.{skill.lvl}</span>
        </div>
        <div className="bar" data-tooltip={tooltipText}>
          <i style={{ width: `${percentage}%` }}></i>
        </div>
        <div className="val">{skill.xp}</div>
        <div className="xpGold">+{Math.floor(skill.xp / 10)}</div>
      </div>
    );
  };

  return (
    <div className="panel">
      <h2>角色概況</h2>
      
      {/* 固定顯示的四個欄位 */}
      <div className="meta">
        <div><span>姓名</span><strong>{userInfo.name || '-'}</strong></div>
        <div><span>身分</span><strong>{userInfo.title || '-'}</strong></div>
        <div><span>年級</span><strong>{userInfo.cls || '-'}</strong></div>
        <div><span>Lv.</span><strong>{userInfo.level}</strong></div>
      </div>

      <div className="xp">
        <div>角色經驗</div>
        <div className="bar" data-tooltip={`${userInfo.exp}/${100 + (Math.max(1, userInfo.level) - 1) * 20}`}>
          <i style={{ width: `${userExp}%` }}></i>
        </div>
        <div>{userExp}%</div>
      </div>

      <h2>技能與經驗</h2>
      <div id="skills">
        {Object.values(skills).map(skill => renderSkillBar(skill))}
      </div>
    </div>
  );
}
