
'use client';

import React, { useState, useEffect } from 'react';

export default function ProblemBox({
  currentProblem,
  onSubmitAnswer,
  onClearAnswer
}) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = () => {
    if (!currentProblem || isCompleted) return;

    if (!selectedAnswer) {
      setMessage('請選擇一個答案');
      setMessageType('err');
      return;
    }

    const isCorrect = selectedAnswer === currentProblem.answer;

    if (isCorrect) {
      setMessage('答對了！');
      setMessageType('ok');
      setShowExplanation(true);
      setIsCompleted(true);
      // 傳遞技能和經驗值信息
      onSubmitAnswer(selectedAnswer, true, currentProblem.xp || 10, currentProblem.skill); // 答對給全額經驗
    } else {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);

      if (newWrongAttempts >= 2) {
        setMessage(`答錯了，正確答案是 ${currentProblem.answer}`);
        setMessageType('err');
        setShowExplanation(true);
        setIsCompleted(true);
        onSubmitAnswer(selectedAnswer, false, Math.floor((currentProblem.xp || 10) / 2), currentProblem.skill); // 答錯兩次給一半經驗
      } else {
        setMessage(`答錯了，還有 ${2 - newWrongAttempts} 次機會`);
        setMessageType('err');
      }
    }
  };

  const handleClear = () => {
    // 如果任務已完成，不允許清除重新答題
    if (isCompleted) {
      return;
    }

    setSelectedAnswer('');
    setMessage('');
    setMessageType('');
    setWrongAttempts(0);
    setShowExplanation(false);
    onClearAnswer();
  };

  // 當切換到新題目時自動重置狀態
  useEffect(() => {
    if (currentProblem) {
      setSelectedAnswer('');
      setMessage('');
      setMessageType('');
      setWrongAttempts(0);
      setShowExplanation(false);
      setIsCompleted(false);
    }
  }, [currentProblem]);

  if (!currentProblem) {
    return (
      <div className="panel" id="problemArea">
        <h2>作題區</h2>
        <div className="problemBox">
          <h3>請從右側任務選擇一題開始作答</h3>
          <div className="problemBody"></div>
          <div className="problemActions">
            <button className="btn small" disabled>清除</button>
            <button className="btn small" disabled>提交</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel" id="problemArea">
      <h2>作題區</h2>
      <div className="problemBox">
        <h3>{currentProblem.title}</h3>
        <div className="problemBody">
          <p>{currentProblem.question}</p>
          {currentProblem.options && currentProblem.options.map((option, index) => (
            <div key={index} className="opt">
              <input
                type="radio"
                id={`opt${index}`}
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={isCompleted}
              />
              <label htmlFor={`opt${index}`}>{option}</label>
            </div>
          ))}
        </div>

        {/* 只在特定條件下顯示詳解 */}
        {showExplanation && currentProblem.explain && (
          <div className="problemExplain">
            <strong>解釋：</strong>{currentProblem.explain}
          </div>
        )}

        {message && (
          <div className={`msg ${messageType}`}>
            {message}
          </div>
        )}

        <div className="problemActions">
          <button
            className="btn small"
            onClick={handleClear}
            disabled={isCompleted || (!selectedAnswer && !message)}
          >
            {isCompleted ? '已鎖定' : '清除'}
          </button>
          <button
            className="btn small"
            onClick={handleSubmit}
            disabled={isCompleted}
          >
            {isCompleted ? '已完成' : '提交'}
          </button>
        </div>
      </div>
    </div>
  );
}

