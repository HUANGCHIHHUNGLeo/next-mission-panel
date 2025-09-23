# 任務面板 MVP - Next.js 版

這是一個學習任務管理面板，從原始的 HTML/CSS/JavaScript 專案重構為 Next.js 專案。

## 功能特色

- 🎯 **任務系統**：核心任務與日常任務
- 📊 **技能追蹤**：運算、幾何、代數、應用能力
- 🎮 **角色系統**：經驗值、等級、金幣
- 📈 **雷達圖**：技能能力視覺化
- 🖼️ **角色頭像**：自訂角色圖片
- 💾 **本地儲存**：資料保存在 localStorage

## 技術架構

- **框架**：Next.js 15 (App Router)
- **樣式**：原始 CSS + Tailwind CSS
- **圖表**：Chart.js + react-chartjs-2
- **部署**：Vercel 友好

## 組件結構

```
src/
├── app/
│   ├── globals.css      # 全域樣式
│   ├── layout.js        # 根佈局
│   └── page.js          # 主頁面
└── components/
    ├── Topbar.js        # 上方導航列
    ├── SkillPanel.js    # 技能與經驗面板
    ├── ProblemBox.js    # 題目作答區
    ├── TaskList.js      # 任務列表
    ├── CharacterView.js # 角色介面
    ├── RadarChart.js    # 能力雷達圖
    └── SettingsView.js  # 個人資料設定
```

## 開始使用

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

### 建置專案

```bash
npm run build
```

### 啟動生產伺服器

```bash
npm start
```

## 部署到 Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 自動部署完成

或使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 題庫管理

題庫檔案位於 `public/tasks/`：

- `core.json` - 核心任務
- `daily.json` - 日常任務

可以直接編輯這些 JSON 檔案來新增或修改題目。

## 資料結構

所有用戶資料都儲存在瀏覽器的 localStorage 中，包括：

- 個人資料（姓名、年級、等級）
- 技能經驗值
- 金幣與道具
- 任務完成狀態
- 自訂頭像

## 授權

MIT License
