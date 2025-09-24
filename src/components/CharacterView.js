'use client';

import { useState, useRef } from 'react';

export default function CharacterView({ 
  userInfo, 
  onAvatarUpdate,
  onGenderUpdate
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

  const handleGenderSelect = (gender) => {
    onGenderUpdate(gender);
    // 當選擇性別時，如果沒有自訂頭像，清除當前頭像以顯示預設圖片
    if (!userInfo.avatarImg) {
      setAvatarImg(null);
    }
  };

  const renderAvatar = () => {
    // 優先顯示自訂頭像
    if (avatarImg) {
      return <img className="avatar" src={avatarImg} alt="角色圖片" />;
    }
    
    // 如果有用戶上傳的頭像，顯示用戶頭像
    if (userInfo.avatarImg) {
      return <img className="avatar" src={userInfo.avatarImg} alt="角色圖片" />;
    }
    
    // 根據性別顯示預設角色圖片
    if (userInfo.gender === 'female') {
      return <img className="avatar" src="/images/female_character.png" alt="預設女性角色" />;
    }
    return <img className="avatar" src="/images/male_character.png" alt="預設男性角色" />;
  };

  return (
    <div id="viewCharacter">
      <div className="charStage">
        <div className="charRing"></div>
        <div className="charWrap">
          {renderAvatar()}
        </div>
      </div>

      {/* 性別選擇 */}
      <div className="panel genderPanel" style={{ marginTop: '16px' }}>
        <h2>性別選擇</h2>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${userInfo.gender === 'male' ? 'active' : ''}`}
            onClick={() => handleGenderSelect('male')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: userInfo.gender === 'male' ? 'bold' : 'normal',
              backgroundColor: userInfo.gender === 'male' ? '#4f46e5' : '#e5e7eb',
              color: userInfo.gender === 'male' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '80px'
            }}
          >
            男性
          </button>
          <button 
            className={`btn ${userInfo.gender === 'female' ? 'active' : ''}`}
            onClick={() => handleGenderSelect('female')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: userInfo.gender === 'female' ? 'bold' : 'normal',
              backgroundColor: userInfo.gender === 'female' ? '#ec4899' : '#e5e7eb',
              color: userInfo.gender === 'female' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '80px'
            }}
          >
            女性
          </button>
        </div>
        <div className="sm" style={{ opacity: 0.7, marginTop: '8px', textAlign: 'center' }}>
          選擇性別將顯示對應的預設角色圖片
        </div>
      </div>

      {/* 上傳功能 */}
      <div className="panel uploadPanel" style={{ marginTop: '16px' }}>
        <h2>自訂角色圖片</h2>
        <div className="field">
          <label>選擇圖片</label>
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button 
            className="btn" 
            onClick={handleApplyAvatar}
            style={{
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            套用自訂圖片
          </button>
          <button 
            className="btn" 
            onClick={handleClearAvatar}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            恢復預設圖片
          </button>
        </div>
        <div className="sm" style={{ opacity: 0.7, marginTop: '8px', fontSize: '12px' }}>
          自訂圖片將覆蓋預設角色圖片，儲存於本機瀏覽器中，不會上傳到網路。
        </div>
      </div>
    </div>
  );
}
