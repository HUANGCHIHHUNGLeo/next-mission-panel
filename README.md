# 智慧數學學習平台

## 功能特色

✅ **完整用戶註冊系統**
- 姓名、電話、年齡、Email 完整資料收集
- 密碼強度驗證（英文+數字，8字元以上）
- 個人資料保護法合規同意書

✅ **安全認證系統**
- Supabase Auth 整合
- Row Level Security (RLS) 資料保護
- 用戶權限管理

✅ **學習進度追蹤**
- 六大核心數學技能
- 個人化學習記錄
- 經驗值和等級系統

✅ **任務系統**
- 每日任務挑戰
- 特別訓練模式
- 進度獎勵機制

## 部署說明

### 環境變數設定

在 Vercel 控制台設定以下環境變數：

```
NEXT_PUBLIC_SUPABASE_URL=https://vmhgeclykizwxcleghsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaGdlY2x5a2l6d3hjbGVnaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDU0MTksImV4cCI6MjA3NDMyMTQxOX0.pkbcDTLo7455p0whvioChYUMqSJS0J_tOODJEuOGalE
```

### 資料庫設定

1. 在 Supabase SQL Editor 執行 `supabase-complete-schema.sql`
2. 執行 `supabase-complete-rls.sql` 設定安全政策

### 部署步驟

1. 推送程式碼到 GitHub
2. 在 Vercel 匯入專案
3. 設定環境變數
4. 部署完成

## 技術架構

- **前端**: Next.js 15, React, Tailwind CSS
- **後端**: Supabase (PostgreSQL + Auth)
- **部署**: Vercel
- **安全**: Row Level Security (RLS)

## 聯絡資訊

如有問題請聯絡開發團隊。
