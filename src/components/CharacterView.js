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
      return <img className="avatar floating-animation" src={avatarImg} alt="角色圖片" />;
    }
    
    // 如果有用戶上傳的頭像，顯示用戶頭像
    if (userInfo.avatarImg) {
      return <img className="avatar floating-animation" src={userInfo.avatarImg} alt="角色圖片" />;
    }
    
    // 根據性別顯示預設角色圖片
    if (userInfo.gender === 'female') {
      return <img className="avatar floating-animation" src="/images/female_character_nobg.png" alt="預設女性角色" />;
    }
    return <img className="avatar floating-animation" src="/images/male_character.png" alt="預設男性角色" />;
  };

  return (
    <div id="viewCharacter">
      <style jsx>{`
        @keyframes floating {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .floating-animation {
          animation: floating 3s ease-in-out infinite;
        }

        .game-button {
          position: relative;
          padding: 8px 20px;
          font-size: 14px;
          font-weight: bold;
          color: #ffffff;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
          border: 2px solid #60a5fa;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          min-width: 80px;
          text-align: center;
        }

        .game-button:hover {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #2563eb 100%);
          border-color: #93c5fd;
          box-shadow: 
            0 6px 12px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .game-button:active {
          transform: translateY(0px);
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .game-button.active {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%);
          border-color: #34d399;
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 20px rgba(16, 185, 129, 0.4);
        }

        .game-button.female {
          background: linear-gradient(135deg, #be185d 0%, #ec4899 50%, #be185d 100%);
          border-color: #f472b6;
        }

        .game-button.female:hover {
          background: linear-gradient(135deg, #be185d 0%, #ec4899 50%, #db2777 100%);
          border-color: #f9a8d4;
        }

        .game-button.female.active {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%);
          border-color: #34d399;
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 20px rgba(16, 185, 129, 0.4);
        }

        .action-button {
          position: relative;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          border: 2px solid;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          min-width: 100px;
          text-align: center;
        }

        .action-button.apply {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%);
          border-color: #34d399;
        }

        .action-button.apply:hover {
          background: linear-gradient(135deg, #047857 0%, #10b981 50%, #059669 100%);
          border-color: #6ee7b7;
          transform: translateY(-2px);
          box-shadow: 
            0 5px 10px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .action-button.reset {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #b91c1c 100%);
          border-color: #f87171;
        }

        .action-button.reset:hover {
          background: linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #dc2626 100%);
          border-color: #fca5a5;
          transform: translateY(-2px);
          box-shadow: 
            0 5px 10px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .action-button:active {
          transform: translateY(0px);
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .file-input-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          margin-bottom: 12px;
        }

        .file-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #4a5568;
          border-radius: 8px;
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          color: #e2e8f0;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .file-input:hover {
          border-color: #60a5fa;
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            0 0 10px rgba(96, 165, 250, 0.3);
        }

        .file-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            0 0 15px rgba(59, 130, 246, 0.5);
        }

        .description-text {
          color: #94a3b8;
          font-size: 12px;
          text-align: center;
          margin-top: 8px;
          line-height: 1.4;
        }

        .panel-title {
          color: #e2e8f0;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .action-button-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
      `}</style>

      <div className="charStage">
        <div className="charRing"></div>
        <div className="charWrap">
          {renderAvatar()}
        </div>
      </div>

      {/* 性別選擇 */}
      <div className="panel genderPanel" style={{ marginTop: '8px' }}>
        <h2 className="panel-title">性別選擇</h2>
        <div className="button-group">
          <button 
            className={`game-button ${userInfo.gender === 'male' ? 'active' : ''}`}
            onClick={() => handleGenderSelect('male')}
          >
            男性
          </button>
          <button 
            className={`game-button female ${userInfo.gender === 'female' ? 'active' : ''}`}
            onClick={() => handleGenderSelect('female')}
          >
            女性
          </button>
        </div>
        <div className="description-text">
          選擇性別將顯示對應的預設角色圖片
        </div>
      </div>

      {/* 上傳功能 */}
      <div className="panel uploadPanel" style={{ marginTop: '8px' }}>
        <h2 className="panel-title">自訂角色圖片</h2>
        <div className="field">
          <label style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
            選擇圖片
          </label>
          <div className="file-input-wrapper">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
        </div>
        <div className="action-button-group">
          <button 
            className="action-button apply" 
            onClick={handleApplyAvatar}
          >
            套用自訂圖片
          </button>
          <button 
            className="action-button reset" 
            onClick={handleClearAvatar}
          >
            恢復預設圖片
          </button>
        </div>
        <div className="description-text">
          自訂圖片將覆蓋預設角色圖片，儲存於本機瀏覽器中，不會上傳到網路。
        </div>
      </div>
    </div>
  );
}
