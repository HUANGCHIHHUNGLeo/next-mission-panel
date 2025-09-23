'use client';

import { useState, useRef } from 'react';

export default function CharacterView({ 
  userInfo, 
  onAvatarUpdate 
}) {
  const [avatarImg, setAvatarImg] = useState(userInfo.avatarImg);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setAvatarImg(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAvatar = () => {
    onAvatarUpdate(avatarImg);
  };

  const handleClearAvatar = () => {
    setAvatarImg(null);
    onAvatarUpdate(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id="viewCharacter">
      <div className="charStage">
        <div className="charRing"></div>
        <div className="charWrap">
          {avatarImg ? (
            <img 
              className="avatar" 
              src={avatarImg} 
              alt="角色圖片" 
            />
          ) : (
            <svg 
              className="avatar" 
              viewBox="0 0 256 256" 
              xmlns="http://www.w3.org/2000/svg" 
              aria-label="預設角色"
            >
              <defs>
                <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8b4a4a" />
                  <stop offset="1" stopColor="#b46868" />
                </linearGradient>
                <radialGradient id="eye" cx="0.5" cy="0.5" r="0.6">
                  <stop offset="0" stopColor="#fff176" />
                  <stop offset="0.5" stopColor="#ff7043" />
                  <stop offset="1" stopColor="#d32f2f" />
                </radialGradient>
              </defs>
              <ellipse cx="128" cy="96" rx="96" ry="76" fill="url(#hair)" />
              <circle cx="128" cy="112" r="52" fill="#ffe5d9" stroke="#d9a39a" strokeWidth="2" />
              <ellipse cx="104" cy="116" rx="18" ry="20" fill="url(#eye)" />
              <ellipse cx="152" cy="116" rx="18" ry="20" fill="url(#eye)" />
              <path d="M112 136c6 8 26 8 32 0" stroke="#d84315" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M86 168h84c10 0 18 8 18 18v14c0 6-4 10-10 12-30 10-60 10-100 0-6-2-10-6-10-12v-14c0-10 8-18 18-18z" fill="#e8f0ff" stroke="#9ecbff" strokeWidth="2" />
            </svg>
          )}
        </div>
      </div>

      {/* 上傳功能 */}
      <div className="panel uploadPanel" style={{ marginTop: '16px' }}>
        <h2>角色圖片管理</h2>
        <div className="field">
          <label>選擇圖片</label>
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            onChange={handleFileChange}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button className="btn" onClick={handleApplyAvatar}>
            套用至角色介面
          </button>
          <button className="btn" onClick={handleClearAvatar}>
            移除自訂圖片
          </button>
        </div>
        <div className="sm" style={{ opacity: 0.8, marginTop: '6px' }}>
          圖片將以 base64 儲存於本機（localStorage），不會上傳到網路。
        </div>
      </div>
    </div>
  );
}
