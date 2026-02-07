# 🎮 Say the Word on Beat - 遊戲開發指南

## 📁 完整檔案結構

```
saythewordonbeat/
│
├── app.py                          # Flask 後端主程式
├── requirements.txt                # Python 依賴套件
├── README.md                       # 專案說明文件
├── GAME_GUIDE.md                   # 本檔案（開發指南）
│
├── templates/
│   └── index.html                 # 遊戲主頁面
│
└── static/
    ├── style.css                  # 遊戲樣式表
    ├── game.js                    # 遊戲邏輯 (JavaScript)
    │
    ├── audio/
    │   ├── beat.mp3              # 背景音樂（需自行準備）
    │   └── README.txt            # 音樂說明文件
    │
    └── images/
        ├── apple.jpg             # 圖片 1-24（需自行準備）
        ├── banana.jpg
        ├── ...
        └── README.txt            # 圖片說明文件
```

---

## 🎯 遊戲流程圖

```
開始畫面
   │
   ├─ 顯示遊戲規則
   └─ 點擊「Start Game」
        │
        ├─ 🎵 播放背景音樂
        └─ 進入 Round 1
             │
             ├─ 顯示 8 張圖片（每秒 1 張）
             ├─ 節拍進度條動畫
             └─ 玩家可點擊「說出單字」按鈕
                  │
                  └─ Round 1 完成
                       │
                       ├─ 顯示「Round Completed」
                       └─ 點擊「下一局」
                            │
                            └─ Round 2 (音樂繼續)
                                 │
                                 └─ Round 3
                                      │
                                      └─ 遊戲結束
                                           │
                                           ├─ 🎵 停止音樂
                                           ├─ 顯示統計資料
                                           └─ 可點擊「重新開始」
```

---

## 🔧 技術架構

### 後端 (Flask - Python)

**檔案**: `app.py`

**功能**:
- 提供網頁伺服器 (Port 5000)
- 定義 24 張圖片清單與對應單字
- 將圖片分組為 3 個 Round（每組 8 張）
- 提供 API: `/api/game-data` 回傳 JSON 資料
- 設定節拍間隔（beatInterval）與音樂資訊

**關鍵程式碼**:
```python
IMAGES = [
    {"filename": "apple.jpg", "word": "Apple"},
    # ... 共 24 張
]

@app.route('/api/game-data')
def get_game_data():
    rounds = [
        IMAGES[0:8],   # Round 1
        IMAGES[8:16],  # Round 2
        IMAGES[16:24]  # Round 3
    ]
    return jsonify({
        "rounds": rounds,
        "beatInterval": 1000,  # 1 秒 = 1 拍
        "music": {
            "filename": "beat.mp3",
            "bpm": 60
        }
    })
```

---

### 前端 (HTML + CSS + JavaScript)

#### 1️⃣ HTML (`templates/index.html`)

**結構**:
- `<audio>` 元素：背景音樂
- 4 個畫面區塊：
  - 開始畫面 (`#start-screen`)
  - 遊戲畫面 (`#game-screen`)
  - Round 完成畫面 (`#round-complete-screen`)
  - 遊戲結束畫面 (`#game-over-screen`)

**關鍵元素**:
```html
<!-- 背景音樂 -->
<audio id="background-music" preload="auto">
    <source src="/static/audio/beat.mp3" type="audio/mpeg">
</audio>

<!-- 遊戲畫面 -->
<div id="game-screen">
    <img id="game-image" src="" alt="">
    <div id="word-display"></div>
    <div id="beat-bar"></div>
    <button id="speak-btn">🎤 說出單字</button>
    <button id="mute-btn">🔊 音樂</button>
</div>
```

---

#### 2️⃣ CSS (`static/style.css`)

**設計重點**:
- 漸層背景 (紫色系)
- 卡片式遊戲容器
- 按鈕 hover 效果與陰影
- 圖片淡入動畫 (`@keyframes fadeIn`)
- 節拍進度條動畫
- 響應式設計 (手機適配)

**關鍵樣式**:
```css
/* 圖片淡入效果 */
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

/* 節拍進度條 */
.beat-bar {
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.1s linear;
}
```

---

#### 3️⃣ JavaScript (`static/game.js`)

**核心模組**:

##### A. 狀態管理 (`GameState`)
```javascript
const GameState = {
    gameData: null,
    currentRound: 0,        // 0-2
    currentImageIndex: 0,   // 0-7
    beatInterval: 1000,
    music: null,            // Audio 物件
    isMusicPlaying: false,
    isMuted: false
};
```

##### B. 音樂控制
```javascript
// 初始化音樂
function initMusic() {
    GameState.music = document.getElementById('background-music');
    GameState.music.volume = 0.5;
    GameState.music.loop = false;
}

// 播放音樂
function playMusic() {
    if (GameState.isMusicPlaying) return;  // 防止重複播放
    GameState.music.currentTime = 0;
    GameState.music.play();
}

// 停止音樂
function stopMusic() {
    GameState.music.pause();
    GameState.music.currentTime = 0;
}
```

##### C. 節拍控制
```javascript
function showNextImage() {
    // 更新圖片
    const imageData = GameState.gameData.rounds[currentRound][currentImageIndex];
    Elements.gameImage.src = `/static/images/${imageData.filename}`;
    Elements.wordDisplay.textContent = imageData.word;
    
    // 啟動進度條動畫
    startBeatAnimation();
    
    // 設定計時器顯示下一張
    GameState.beatTimer = setTimeout(() => {
        GameState.currentImageIndex++;
        if (GameState.currentImageIndex >= 8) {
            completeRound();  // Round 完成
        } else {
            showNextImage();  // 繼續下一張
        }
    }, GameState.beatInterval);
}
```

##### D. 進度條動畫
```javascript
function startBeatAnimation() {
    Elements.beatBar.style.width = '0%';
    const startTime = Date.now();
    
    function updateBeatBar() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / beatInterval) * 100, 100);
        Elements.beatBar.style.width = progress + '%';
        
        if (progress < 100) {
            requestAnimationFrame(updateBeatBar);
        }
    }
    
    requestAnimationFrame(updateBeatBar);
}
```

---

## 🎵 音樂同步機制

### 工作原理

1. **初始化**: 頁面載入時預載音樂 (`preload="auto"`)
2. **播放觸發**: 使用者點擊 "Start Game" → 呼叫 `playMusic()`
3. **同步機制**: 
   - 音樂與 `beatInterval` (1000ms) 同步
   - 使用 60 BPM 的音樂 (每秒 1 拍)
   - 圖片切換與音樂節奏一致
4. **Round 切換**: 音樂持續播放，不中斷
5. **遊戲結束**: 呼叫 `stopMusic()` 停止音樂

### 防止重複播放

```javascript
function playMusic() {
    // 檢查 1: 是否已在播放
    if (GameState.isMusicPlaying) {
        console.log('⚠️  音樂已在播放中');
        return;
    }
    
    // 檢查 2: 是否靜音
    if (GameState.isMuted) return;
    
    // 播放音樂
    GameState.music.play().then(() => {
        GameState.isMusicPlaying = true;  // 標記為播放中
    });
}
```

---

## 🎮 遊戲控制按鈕

### 1. Start Game 按鈕
- **觸發**: 開始遊戲
- **動作**: 
  - 播放音樂
  - 切換到遊戲畫面
  - 開始 Round 1

### 2. 🎤 說出單字 按鈕
- **觸發**: 模擬玩家說出單字
- **動作**: 
  - 按鈕縮放動畫（視覺回饋）
  - 未來可整合語音辨識

### 3. 🔊 音樂 按鈕
- **觸發**: 切換靜音
- **動作**: 
  - 靜音: 🔇 + 灰色樣式
  - 取消靜音: 🔊 + 藍色樣式

### 4. 下一局 按鈕
- **觸發**: 進入下一個 Round
- **動作**: 
  - 增加 `currentRound`
  - 重置 `currentImageIndex`
  - 繼續播放（音樂不停）

### 5. 重新開始 按鈕
- **觸發**: 回到開始畫面
- **動作**: 
  - 停止音樂
  - 重置所有狀態
  - 顯示開始畫面

---

## 🔄 資料流程

```
1. 使用者開啟瀏覽器
   ↓
2. Flask 提供 index.html
   ↓
3. JavaScript 執行 init()
   ↓
4. 呼叫 /api/game-data
   ↓
5. 取得 24 張圖片清單與設定
   ↓
6. 使用者點擊 Start Game
   ↓
7. playMusic() + startRound()
   ↓
8. 每 1 秒執行 showNextImage()
   ↓
9. 8 張圖片後 → completeRound()
   ↓
10. 重複 Round 2, 3
   ↓
11. Round 3 完成 → gameOver()
   ↓
12. stopMusic() + 顯示結束畫面
```

---

## ⚙️ 可自訂參數

### 在 `app.py` 中調整

```python
# 修改節拍速度
"beatInterval": 1000  # 毫秒 (1000 = 1秒, 500 = 0.5秒)

# 修改 BPM
"bpm": 60  # 60 BPM = 每分鐘 60 拍

# 修改圖片數量（需同步調整 IMAGES 列表）
"imagesPerRound": 8
"totalRounds": 3
```

### 在 `game.js` 中調整

```javascript
// 修改音量
GameState.music.volume = 0.5;  // 0.0 - 1.0

// 修改音樂循環
GameState.music.loop = false;  // true = 循環播放
```

---

## 🚀 快速啟動步驟

### 1. 安裝依賴
```bash
pip install -r requirements.txt
```

### 2. 準備素材
- 放 24 張圖片到 `static/images/`
- 放 1 個 beat.mp3 到 `static/audio/`

### 3. 啟動伺服器
```bash
python app.py
```

### 4. 開始遊戲
```
開啟瀏覽器: http://127.0.0.1:5000
```

---

## 🐛 除錯技巧

### 開啟瀏覽器 Console

**Chrome / Edge**:
- Windows: `F12` 或 `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

**Firefox**:
- Windows: `F12` 或 `Ctrl + Shift + K`
- Mac: `Cmd + Option + K`

### 常見 Console 訊息

```javascript
✅ 正常訊息:
   - "✅ 遊戲資料載入成功"
   - "✅ 音樂播放器初始化完成"
   - "▶️  開始播放音樂"

⚠️  警告訊息:
   - "⚠️  音樂已在播放中"  → 正常，防止重複播放
   - "⚠️  音樂播放器未初始化" → 檢查 HTML <audio> 元素

❌ 錯誤訊息:
   - "❌ 音樂載入失敗" → 檢查 beat.mp3 是否存在
   - "404 Not Found" → 檢查圖片檔案路徑
```

---

## 📊 效能最佳化建議

1. **圖片優化**
   - 壓縮圖片至 < 500KB
   - 使用 WebP 格式（更小）
   - 解析度: 800×800 已足夠

2. **音樂優化**
   - 壓縮音樂至 < 5MB
   - 使用 128kbps MP3（品質與大小平衡）

3. **快取設定**
   - Flask 會自動快取 static 資源
   - 瀏覽器重新整理時按 `Ctrl + F5` (硬重新整理)

---

## 🎓 學習重點

### Python (Flask) 後端
- ✅ 路由設定 (`@app.route`)
- ✅ JSON API (`jsonify`)
- ✅ 靜態檔案處理 (`static_folder`)
- ✅ 模板渲染 (`render_template`)

### JavaScript 前端
- ✅ DOM 操作 (`getElementById`, `classList`)
- ✅ 計時器 (`setTimeout`, `requestAnimationFrame`)
- ✅ Audio API (`HTMLAudioElement`)
- ✅ Fetch API (取得後端資料)
- ✅ 狀態管理模式

### CSS 樣式
- ✅ Flexbox 排版
- ✅ 漸層背景
- ✅ 動畫 (`@keyframes`, `transition`)
- ✅ 響應式設計 (`@media`)

---

## 🔮 未來擴充方向

### 短期目標
- [ ] 加入語音辨識 (Web Speech API)
- [ ] 計分系統（說對 +1 分）
- [ ] 倒數計時提示

### 中期目標
- [ ] 多種難度選擇
- [ ] 自訂圖片上傳
- [ ] 自訂音樂上傳
- [ ] 排行榜系統

### 長期目標
- [ ] 多人連線對戰
- [ ] 成就系統
- [ ] 社群分享功能

---

**Made with ❤️ for rhythm game lovers!**

有任何問題請參考 `README.md` 或查看原始碼註解。
