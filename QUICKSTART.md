# ⚡ 快速啟動指南

## 🚀 三步驟啟動遊戲

### 步驟 1: 安裝依賴套件

```bash
pip install -r requirements.txt
```

這會安裝：
- Flask（網頁伺服器）
- Werkzeug（Flask 依賴）
- Pillow（圖片處理，用於創建測試圖片）

---

### 步驟 2: 準備素材

#### 選項 A: 使用腳本快速創建測試圖片（推薦新手）

```bash
python create_placeholder_images.py
```

這會在 `static/images/` 自動創建 24 張彩色佔位圖片。

#### 選項 B: 手動準備圖片

將 24 張圖片放入 `static/images/` 資料夾，檔名如下：

```
apple.jpg, banana.jpg, cat.jpg, dog.jpg, 
elephant.jpg, fish.jpg, guitar.jpg, house.jpg,
ice.jpg, juice.jpg, kite.jpg, lion.jpg,
moon.jpg, nest.jpg, orange.jpg, piano.jpg,
queen.jpg, rabbit.jpg, sun.jpg, tree.jpg,
umbrella.jpg, violin.jpg, water.jpg, xylophone.jpg
```

#### 音樂檔案（選用）

將 `beat.mp3` 放入 `static/audio/` 資料夾。

- 沒有音樂檔案也能玩，只是沒有背景音樂
- 音樂建議：60 BPM、時長至少 24 秒

---

### 步驟 3: 啟動遊戲

```bash
python app.py
```

看到以下訊息表示成功：

```
==================================================
🎮 Say the Word on Beat 遊戲伺服器
==================================================
請在瀏覽器開啟: http://127.0.0.1:5000
==================================================
```

---

## 🎮 開始遊玩

1. 打開瀏覽器
2. 前往 `http://127.0.0.1:5000`
3. 點擊「開始遊戲」
4. 跟著節拍說出單字！

---

## 🎯 遊戲規則

- 遊戲共 3 局
- 每局 8 張圖片
- 每秒顯示 1 張圖片
- 跟著節拍說出圖片的單字
- 點擊「🎤 說出單字」模擬語音輸入
- 點擊「🔊 音樂」切換靜音

---

## 🐛 常見問題

### Q: 圖片無法顯示？

**A**: 請確認：
1. 已執行 `python create_placeholder_images.py`
2. 或已手動放入 24 張圖片到 `static/images/`
3. 檔名與 `app.py` 中的列表一致

### Q: 音樂無法播放？

**A**: 
1. 確認 `static/audio/beat.mp3` 存在
2. 某些瀏覽器會阻擋自動播放，請點擊「音樂」按鈕手動開啟
3. 沒有音樂檔案也能玩遊戲

### Q: 如何修改節拍速度？

**A**: 編輯 `app.py`，找到：

```python
"beatInterval": 1000  # 1000 毫秒 = 1 秒
```

改成：
- `500` = 0.5 秒（更快）
- `1500` = 1.5 秒（更慢）

### Q: 如何停止伺服器？

**A**: 在終端機按 `Ctrl + C`

---

## 📁 檔案檢查清單

執行前請確認以下檔案存在：

```
✅ app.py
✅ requirements.txt
✅ templates/index.html
✅ static/style.css
✅ static/game.js
✅ static/images/ (資料夾)
✅ static/audio/ (資料夾)
```

如果使用測試圖片：
```
✅ create_placeholder_images.py
```

---

## 🎓 更多資訊

- 詳細說明：查看 `README.md`
- 開發指南：查看 `GAME_GUIDE.md`
- 圖片說明：查看 `static/images/README.txt`
- 音樂說明：查看 `static/audio/README.txt`

---

## 💡 提示

### 第一次使用建議流程：

```bash
# 1. 安裝套件
pip install -r requirements.txt

# 2. 創建測試圖片
python create_placeholder_images.py

# 3. 啟動遊戲
python app.py

# 4. 開啟瀏覽器
# http://127.0.0.1:5000
```

### 瀏覽器建議：
- ✅ Chrome（推薦）
- ✅ Firefox
- ✅ Edge
- ✅ Safari

---

**🎉 祝你玩得開心！**

如有問題，請查看 Console 訊息（按 F12 開啟開發者工具）。
