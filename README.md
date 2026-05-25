# 52!：此刻唯一｜Vercel Ready MVP

這是一個 Vite + React + Tailwind 的可部署版本。

## 本機測試

```bash
npm install
npm run dev
```

## 建置測試

```bash
npm run build
npm run preview
```

## Vercel 部署

1. 建立 GitHub repository
2. 將本專案所有檔案推上 GitHub
3. 到 Vercel 選 Add New → Project
4. Import 這個 GitHub repo
5. Framework Preset 選 Vite
6. Build Command: npm run build
7. Output Directory: dist
8. Deploy

## 注意

- 目前「時空書籤」是 MVP 模擬解鎖，不會真正收款。
- 未來 iOS / Android App 版應使用 Apple In-App Purchase / Google Play Billing。
- 手機 LINE 內建瀏覽器可能攔截下載，因此程式會優先使用 navigator.share。
