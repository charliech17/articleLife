<div align="center">
  <h1>🎨 ArticleLife - 前端專案 (Frontend)</h1>
  <p><b>基於 Angular 22 與 Server-Side Rendering (SSR) 打造的現代化文章平台</b></p>
  <p>🔗 <b>線上預覽：</b> <a href="https://josh-lifesharing.com/articleLife/home">https://josh-lifesharing.com/articleLife/home</a></p>
</div>

---

> 💡 **溫馨提示**：這是 ArticleLife 專案的 **前端 (Frontend)** 部分。如需完整的系統架構、資料庫設計與後端設定教學，請參閱根目錄的 [主專案 README](../README.md)。

## ✨ 前端亮點功能 (Frontend Features)

- ⚡️ **高效能與 SEO 友善**：採用 Angular 22 的最新特性與 SSR (Server-Side Rendering) 伺服器端渲染，大幅提升首屏載入速度與搜尋引擎排名。
- 📝 **頂級寫作體驗**：高度客製化的 CKEditor5，支援即時 Markdown 渲染與 Highlight.js 程式碼高亮。
- 🌐 **多國語系支援**：整合 Ngx-Translate 達成無縫的多語言切換體驗。
- 🎨 **現代化 UI 設計**：結合 Angular Material 的互動元件、Bootstrap 5 的響應式網格系統，以及精美的 FontAwesome 圖示。
- ♾️ **流暢閱讀**：整合 Ngx-Infinite-Scroll 實現文章列表的無限滾動加載。

---

## 🛠️ 技術堆疊 (Tech Stack)

| 類別 | 技術與套件 |
| :--- | :--- |
| **核心框架** | Angular 22, Angular SSR (Server-Side Rendering) |
| **UI 元件庫** | Angular Material, Bootstrap 5, Bootstrap Icons, FontAwesome |
| **編輯器與排版** | CKEditor5, Marked (Markdown 解析), Highlight.js |
| **狀態與非同步處理** | RxJS, Zone.js |
| **國際化 (i18n)** | Ngx-Translate |
| **其他實用工具** | Day.js (時間處理), Ngx-Cookie-Service, Ngx-Infinite-Scroll |

---

## 🚀 開發指令指南 (Development Commands)

請確保您已經安裝好 `Node.js` (建議使用 Node.js 24+ 或更高版本)，並在當前目錄 (`articleLife/articleLife/`) 下執行以下指令。

### 1. 安裝相依套件
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm start
# 或是 ng serve
```
> 開啟瀏覽器並造訪 `http://localhost:4200/`。當您修改原始碼並存檔時，頁面將會自動重新載入。

### 3. 測試 SSR (Server-Side Rendering) 伺服器
如果您想要在本地端測試包含 SSR 渲染的環境：
```bash
npm run build
npm run serve:ssr:articleLife
```

### 4. 建置正式環境版本 (Production Build)
```bash
npm run build:prod
# 或 npm run build
```
> 編譯完成的檔案將會輸出至 `dist/` 資料夾，可用於部署至正式環境 (如 Nginx, Vercel 等)。

### 5. 程式碼測試 (Testing)
- **單元測試 (Unit Test)**：執行 `npm test` (或 `ng test`) 透過 Karma 執行測試。
- **Lint 檢查**：使用 ESLint 進行程式碼品質檢查與風格統一。

---

## 📂 核心目錄結構 (Directory Structure)

```text
src/
├── app/               # 應用程式核心邏輯與元件 (Components, Services, Routing)
├── assets/            # 靜態資源 (圖片、多國語系 i18n JSON 檔等)
├── environments/      # 環境變數設定檔 (Dev, Prod)
├── index.html         # 網頁進入點
├── main.ts            # Client-side 啟動點
└── server.ts          # Server-side (SSR) 啟動點
```

---

<div align="center">
  <sub>Built with ❤️ using Angular</sub>
</div>
