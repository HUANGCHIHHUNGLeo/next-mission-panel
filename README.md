# 數學學習平台 v2 (MathLearn)

專為台灣學生設計的現代化數學學習平台，使用 Next.js 和 Supabase 技術架構。

## 🚀 功能特色

- **現代化介面設計**: 簡潔美觀的使用者介面，提供優質的學習體驗
- **完整認證系統**: 支援電子郵件註冊/登入，包含完整的個人資料設定
- **學習進度追蹤**: 即時追蹤學習進度、經驗值和成就
- **個人化儀表板**: 顯示學習統計、進度分析和最近活動
- **響應式設計**: 支援桌面和行動裝置的完美瀏覽體驗

## 🛠 技術架構

- **前端**: Next.js 15 + React 19
- **樣式**: Tailwind CSS 4
- **後端**: Supabase (認證 + 資料庫)
- **圖示**: Lucide React
- **部署**: Vercel

## 📋 環境需求

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本
- Supabase 專案帳戶

## 🔧 安裝與設定

### 1. 複製專案

```bash
git clone <repository-url>
cd math-learning-platform-v2
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境變數設定

複製 `.env.example` 檔案並重新命名為 `.env.local`：

```bash
cp .env.example .env.local
```

在 `.env.local` 中填入您的 Supabase 設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 資料庫設定

在 Supabase 專案中執行以下 SQL 檔案：

1. 先執行 `database/schema.sql` 建立資料表
2. 再執行 `database/rls-policies.sql` 設定安全政策

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器並前往 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # 儀表板頁面
│   ├── globals.css         # 全域樣式
│   ├── layout.tsx          # 根佈局
│   └── page.jsx            # 首頁
├── components/             # React 元件
│   ├── auth/               # 認證相關元件
│   ├── common/             # 通用元件
│   └── layout/             # 版面元件
├── hooks/                  # 自定義 Hooks
├── lib/                    # 工具函式庫
│   ├── database.js         # 資料庫操作
│   └── supabase.js         # Supabase 客戶端
└── utils/                  # 輔助工具
```

## 🚀 部署指南

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署完成

### 環境變數設定

在 Vercel 專案設定中加入以下環境變數：

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 📊 資料庫結構

### 主要資料表

- **users**: 用戶基本資料
- **learning_progress**: 學習進度記錄
- **learning_sessions**: 學習會話記錄

詳細的資料庫結構請參考 `database/schema.sql` 檔案。

## 🔒 安全性

- 啟用 Row Level Security (RLS)
- 用戶只能存取自己的資料
- 完整的認證流程和會話管理

## 🤝 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡資訊

如有任何問題或建議，歡迎聯絡我們：

- 專案網址: [GitHub Repository]
- 問題回報: [GitHub Issues]

---

**MathLearn Team** - 讓數學學習變得簡單有趣 🎓
