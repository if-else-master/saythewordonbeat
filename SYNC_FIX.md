# 🔧 音樂同步問題修復說明

## 問題描述

原本的實作中，音樂播放和遊戲啟動是不同步的：
- `playMusic()` 呼叫是**非同步**的（需要時間載入和開始）
- `showNextImage()` 是**立即執行**的

結果：遊戲已經開始顯示圖片了，但音樂還在載入中。

---

## 解決方案

### 修改 `playMusic()` 函數

加入**回調函數（callback）**機制：

```javascript
function playMusic(onMusicStart) {
    // ...
    
    const playPromise = GameState.music.play();
    
    playPromise.then(() => {
        GameState.isMusicPlaying = true;
        console.log('✅ 音樂開始播放');
        
        // ✨ 音樂真正開始後，才執行回調
        if (onMusicStart) onMusicStart();
    });
}
```

### 修改 `startRound()` 函數

在音樂開始後才啟動遊戲：

```javascript
function startRound() {
    // ... 準備工作
    
    // 播放音樂，並傳入回調函數
    playMusic(() => {
        // ✨ 音樂開始播放後才啟動遊戲
        GameState.isPlaying = true;
        console.log('🎮 遊戲與音樂同步啟動');
        showNextImage();
    });
}
```

---

## 時間軸對比

### ❌ 修改前（不同步）

```
0.000s - playMusic() 呼叫
0.000s - showNextImage() 立即執行 ⚠️ 遊戲開始
0.050s - 音樂載入中...
0.100s - 音樂開始播放 ⚠️ 已經晚了 100ms
```

### ✅ 修改後（完美同步）

```
0.000s - playMusic() 呼叫
0.050s - 音樂載入中...
0.100s - 音樂開始播放
0.100s - onMusicStart() 回調執行
0.100s - showNextImage() 開始 ✅ 同步！
```

---

## 音檔時長自動檢測

新增了音檔實際時長檢測功能：

```javascript
GameState.music.addEventListener('loadedmetadata', () => {
    const actualDuration = GameState.music.duration;
    console.log(`⏱️  實際音檔時長: ${actualDuration.toFixed(2)} 秒`);
    
    // 檢查與設定值的差異
    const diff = Math.abs(actualDuration - expectedDuration);
    if (diff > 0.1) {
        console.warn('⚠️  時長不符！');
    }
});
```

---

## 如何測試

### 1. 開啟瀏覽器開發者工具

按 `F12` 打開 Console

### 2. 觀察 Console 訊息

```
✅ 音樂載入完成
⏱️  實際音檔時長: 5.09 秒
⏱️  設定的時長: 5.09 秒
▶️  開始播放音樂
✅ 音樂開始播放
🎮 遊戲與音樂同步啟動
📸 [階段1] 圖片 1: 圖片1 (318ms)
```

### 3. 確認同步

- 音樂開始時，第一張圖片才出現
- 沒有「遊戲已經跑了，音樂還沒開始」的情況

---

## 如果時長不符

如果 Console 顯示：

```
⚠️  時長不符！差異: 0.91 秒
建議將 app.py 中的 duration 改為 6.00
```

請修改 `app.py`：

```python
"music": {
    "duration": 6.00,  # 改為實際時長
    "phase1Duration": 3.00,  # 一半
    "phase2Duration": 3.00   # 一半
}
```

並重新計算間隔：

```python
"phase1Interval": 375,  # 3000ms ÷ 8 = 375ms
"phase2Interval": 375,
```

---

## 特殊情況處理

### 1. 沒有音樂檔案

```javascript
if (!GameState.music) {
    // 直接啟動遊戲
    if (onMusicStart) onMusicStart();
    return;
}
```

### 2. 音樂被靜音

```javascript
if (GameState.isMuted) {
    // 不播放音樂，但啟動遊戲
    if (onMusicStart) onMusicStart();
    return;
}
```

### 3. 瀏覽器阻擋自動播放

```javascript
.catch(error => {
    alert('瀏覽器阻擋了音樂自動播放');
    // 即使失敗，也啟動遊戲
    if (onMusicStart) onMusicStart();
});
```

---

## 優點

✅ **完美同步**：音樂和遊戲同時開始  
✅ **自動檢測**：自動偵測音檔實際時長  
✅ **容錯處理**：即使音樂失敗，遊戲仍可進行  
✅ **除錯友善**：Console 訊息清楚顯示同步狀態  

---

現在音樂和遊戲完美同步了！🎵🎮✨
