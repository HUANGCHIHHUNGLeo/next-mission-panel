'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProblemBox({
  problem,
  onClose,
  onSkillUpdate
}) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 更新資料庫中的經驗值和等級
  const updateSkillProgress = async (skillName, xpGain, isCorrect) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`更新技能進度: ${skillName}, 經驗值: ${xpGain}`);

      // 獲取當前技能進度
      const { data: currentSkill, error: fetchError } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('skill_name', skillName)
        .single();

      if (fetchError) {
        console.error('獲取技能進度失敗:', fetchError);
        return;
      }

      // 計算新的經驗值和等級
      const newCurrentExp = (currentSkill.current_exp || 0) + xpGain;
      const newTotalExp = (currentSkill.total_exp || 0) + xpGain;
      const newLevel = Math.floor(newTotalExp / 100) + 1; // 每100經驗值升一級

      // 更新技能進度
      const { error: updateError } = await supabase
        .from('skill_progress')
        .update({
          current_exp: newCurrentExp,
          total_exp: newTotalExp,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('skill_name', skillName);

      if (updateError) {
        console.error('更新技能進度失敗:', updateError);
        return;
      }

      // 更新學生檔案的總經驗值和等級
      const { data: allSkills } = await supabase
        .from('skill_progress')
        .select('total_exp, level')
        .eq('user_id', user.id);

      if (allSkills && allSkills.length > 0) {
        const totalExp = allSkills.reduce((sum, skill) => sum + (skill.total_exp || 0), 0);
        const avgLevel = Math.round(allSkills.reduce((sum, skill) => sum + (skill.level || 1), 0) / allSkills.length);

        // 更新學生檔案
        const { error: profileError } = await supabase
          .from('student_profiles')
          .update({
            total_exp: totalExp,
            level: avgLevel,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('更新學生檔案失敗:', profileError);
        }
      }

      // 記錄學習記錄
      const { error: recordError } = await supabase
        .from('learning_records')
        .insert({
          user_id: user.id,
          skill_name: skillName,
          problem_type: problem.type || 'unknown',
          is_correct: isCorrect,
          exp_gained: xpGain,
          created_at: new Date().toISOString()
        });

      if (recordError) {
        console.error('記錄學習記錄失敗:', recordError);
      }

      console.log(`技能 ${skillName} 更新成功: +${xpGain} 經驗值, 新等級: ${newLevel}`);

      // 通知父組件更新本地狀態
      if (onSkillUpdate) {
        onSkillUpdate(skillName, xpGain);
      }

    } catch (error) {
      console.error('更新技能進度時發生錯誤:', error);
    }
  };

  const handleSubmit = async () => {
    if (!problem || isCompleted || isSubmitting) return;

    if (!selectedAnswer) {
      setMessage('請選擇一個答案');
      setMessageType('err');
      return;
    }

    setIsSubmitting(true);

    try {
      const isCorrect = selectedAnswer === problem.answer;
      const skillName = problem.skill || 'number_sense'; // 預設技能
      let xpGain = 0;

      if (isCorrect) {
        setMessage('答對了！獲得經驗值 +' + (problem.xp || 10));
        setMessageType('ok');
        setShowExplanation(true);
        setIsCompleted(true);
        xpGain = problem.xp || 10; // 答對給全額經驗
      } else {
        const newWrongAttempts = wrongAttempts + 1;
        setWrongAttempts(newWrongAttempts);

        if (newWrongAttempts >= 2) {
          const halfXp = Math.floor((problem.xp || 10) / 2);
          setMessage(`答錯了，正確答案是 ${problem.answer}。獲得經驗值 +${halfXp}`);
          setMessageType('err');
          setShowExplanation(true);
          setIsCompleted(true);
          xpGain = halfXp; // 答錯兩次給一半經驗
        } else {
          setMessage(`答錯了，還有 ${2 - newWrongAttempts} 次機會`);
          setMessageType('err');
          setIsSubmitting(false);
          return;
        }
      }

      // 更新資料庫中的經驗值
      await updateSkillProgress(skillName, xpGain, isCorrect);

    } catch (error) {
      console.error('提交答案時發生錯誤:', error);
      setMessage('提交失敗，請稍後再試');
      setMessageType('err');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // 當切換到新題目時自動重置狀態
  useEffect(() => {
    if (problem) {
      setSelectedAnswer('');
      setMessage('');
      setMessageType('');
      setWrongAttempts(0);
      setShowExplanation(false);
      setIsCompleted(false);
      setIsSubmitting(false);
    }
  }, [problem]);

  if (!problem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full mx-4">
          <h2 className="text-xl font-bold text-white mb-4">作題區</h2>
          <p className="text-gray-400">請選擇一個任務開始作答</p>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            關閉
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">作題區</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-400">{problem.title}</h3>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-white whitespace-pre-wrap">{problem.question}</p>
          </div>

          {problem.options && (
            <div className="space-y-2">
              <p className="text-gray-300 font-medium">選擇答案：</p>
              {problem.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={isCompleted}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg ${
              messageType === 'ok' 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          {showExplanation && problem.explanation && (
            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
              <h4 className="text-blue-300 font-semibold mb-2">解題說明：</h4>
              <p className="text-blue-100 whitespace-pre-wrap">{problem.explanation}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-400">
              技能：{problem.skill || 'number_sense'} | 經驗值：{problem.xp || 10}
            </div>
            <div className="space-x-2">
              {!isCompleted && (
                <>
                  <button
                    onClick={() => setSelectedAnswer('')}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    清除
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedAnswer}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? '提交中...' : '提交'}
                  </button>
                </>
              )}
              {isCompleted && (
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  完成
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
