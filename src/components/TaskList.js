'use client';

export default function TaskList({ 
  coreTasks, 
  dailyTasks, 
  refreshCards, 
  coins,
  onTaskSelect, 
  onRefreshTasks, 
  onRerollSide,
  onBuyCards 
}) {
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
          核心任務 <span className="sm">（每日 20:00 刷新）</span>
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
          日常任務
          <span>
            <button className="btn" onClick={onRerollSide}>
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
