# 🎵 Say the Word on Beat

一個基於節奏的網頁小遊戲，玩家需要跟著節拍說出圖片代表的單字。

## 📋 遊戲規則

- 遊戲共有 **3 局 (Rounds)**
- 每局有 **8 個格子**（上排 4 個、下排 4 個）
- **第一輪：記住圖片**
  - 8 張圖片依序在格子中出現（每秒一張）
  - 記住每個格子的圖片
- **第二輪：跟著說出單字**
  - 前 4 個格子（上排）依序高亮
  - 玩家需跟著節拍說出對應單字
- **背景音樂會自動播放**，與節拍同步

## 🛠️ 技術棧

- **後端**: Python Flask
- **前端**: HTML + CSS + JavaScript (Vanilla JS)
- **無資料庫**: 所有資料存於記憶體中

## 📁 專案結構

```
saythewordonbeat/
├── app.py                      # Flask 後端主程式
├── requirements.txt            # Python 依賴套件
├── templates/
│   └── index.html             # 遊戲頁面
├── static/
│   ├── style.css              # 樣式表
│   ├── game.js                # 遊戲邏輯
│   ├── audio/                 # 音樂資料夾
│   │   └── beat.mp3          # 背景音樂
│   └── images/                # 圖片資料夾
│       ├── apple.jpg
│       ├── banana.jpg
│       ├── cat.jpg
│       └── ... (共 24 張)
└── README.md                   # 專案說明
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
pip install -r requirements.txt
```

### 2. 準備圖片

在 `static/images/` 資料夾中放入以下 24 張圖片：

```
apple.jpg, banana.jpg, cat.jpg, dog.jpg, 
elephant.jpg, fish.jpg, guitar.jpg, house.jpg,
ice.jpg, juice.jpg, kite.jpg, lion.jpg,
moon.jpg, nest.jpg, orange.jpg, piano.jpg,
queen.jpg, rabbit.jpg, sun.jpg, tree.jpg,
umbrella.jpg, violin.jpg, water.jpg, xylophone.jpg
```

> 💡 **提示**: 如果沒有真實圖片，可以暫時使用任意圖片檔案並重新命名，或從網路下載免費圖庫。

### 3. 準備音樂

在 `static/audio/` 資料夾中放入音樂檔案：

```
beat.mp3
```

**音樂建議：**
- 檔案格式：MP3 (推薦) 或 WAV
- 時長：建議至少 24 秒（每張圖片 1 秒 × 24 張）
- BPM：60 BPM (每分鐘 60 拍 = 每秒 1 拍)
- 風格：節奏明確的背景音樂

**免費音樂來源：**
- [freesound.org](https://freesound.org/) - 免費音效與音樂
- [incompetech.com](https://incompetech.com/) - Kevin MacLeod 免費音樂
- [bensound.com](https://www.bensound.com/) - 免費背景音樂

> 💡 **快速測試**: 如果暫時沒有音樂，可以先跳過此步驟，遊戲仍可正常運作（只是沒有音樂）。

### 4. 啟動伺服器

```bash
python app.py
```

### 5. 開始遊戲

在瀏覽器打開: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🎮 遊戲流程

1. **開始畫面** → 點擊「開始遊戲」
2. **Round 1 - 第一輪**
   - 8 張圖片依序在格子中出現
   - 玩家記住每個格子的圖片
3. **Round 1 - 第二輪**
   - 前 4 個格子依序高亮（上排：左→右）
   - 玩家跟著節拍說出單字
4. **Round 完成** → 提示訊息 → 點擊「下一局」
5. **Round 2** → 重複第一輪與第二輪（新的 8 張圖片）
6. **Round 3** → 重複第一輪與第二輪（最後 8 張圖片）
7. **遊戲結束** → 顯示統計資料 → 可重新開始

## 💡 核心功能

### 後端 (app.py)

- 提供遊戲資料 API (`/api/game-data`)
- 將 24 張圖片分成 3 組，每組 8 張
- 設定節拍間隔時間

### 前端 (game.js)

- **兩階段遊戲邏輯**:
  - 第一階段：8 張圖片依序顯示在格子中
  - 第二階段：前 4 個格子依序高亮
- **格子佈局**: 2x4 網格（8 個格子）
- **音樂播放**: 使用 HTML5 Audio API 控制背景音樂
  - 自動播放（點擊 Start Game 後）
  - 音樂與節拍同步
  - 避免重複播放（狀態檢查）
  - 支援靜音切換
- **節拍控制**: 使用 `setTimeout` 控制圖片切換與高亮
- **進度條動畫**: 使用 `requestAnimationFrame` 實現平滑進度條
- **狀態管理**: 管理 Round、圖片索引、播放狀態、音樂狀態、遊戲階段
- **畫面切換**: 控制開始、遊戲、完成、結束畫面

## 🎨 自訂設定

### 修改節拍速度

在 `app.py` 中修改 `beatInterval` (毫秒)：

```python
return jsonify({
    "beatInterval": 1000  # 改成 1500 會變慢，500 會變快
})
```

### 修改圖片數量

修改 `IMAGES` 列表，並相應調整 Round 分組邏輯。

## 🔮 未來擴充功能

- [x] 加入背景音樂與節拍同步
- [ ] 整合 Web Speech API 進行真實語音辨識
- [ ] 增加計分系統
- [ ] 記錄玩家最佳成績
- [ ] 增加難度選擇（調整節拍速度）
- [ ] 支援自訂圖片上傳
- [ ] 支援自訂音樂上傳
- [ ] 加入音效回饋（說對/說錯）

## 📝 授權

本專案為教學示範用途，可自由使用與修改。

## 🙋 問題排解

### 圖片無法顯示

- 確認圖片檔案已放入 `static/images/` 資料夾
- 確認檔名與 `app.py` 中的 `IMAGES` 列表一致
- 檢查瀏覽器 Console 是否有 404 錯誤

### 音樂無法播放

- **確認音樂檔案存在**: 檢查 `static/audio/beat.mp3` 是否存在
- **瀏覽器自動播放政策**: 現代瀏覽器可能會阻擋自動播放音樂
  - 解決方案：點擊「音樂」按鈕手動開啟
  - Chrome/Edge: 需要使用者互動後才能播放
- **檔案格式**: 確認使用 MP3 格式，大部分瀏覽器都支援
- **檢查 Console**: 開啟瀏覽器開發者工具查看錯誤訊息

### 音樂與圖片不同步

- 確保音樂的 BPM 與 `beatInterval` 設定一致
- 建議使用 60 BPM 的音樂（每秒 1 拍）
- 可在 `app.py` 調整 `beatInterval` 來配合音樂節奏

### 節拍不準確

- 確保瀏覽器分頁在前景執行
- 避免同時執行過多程式導致系統卡頓
- 某些瀏覽器在背景分頁會降低計時器精度

---

**Made with ❤️ for rhythm game lovers!**
