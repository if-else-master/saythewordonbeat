#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Say the Word on Beat - Flask 後端
提供圖片清單與 API 端點
"""

from flask import Flask, render_template, jsonify
import os
import random

app = Flask(__name__)

# 自動掃描圖片資料夾
def get_all_images():
    """
    掃描 static/images/ 資料夾中的所有圖片檔案
    支援格式：jpg, jpeg, png, gif, JPG, JPEG, PNG, GIF
    """
    images_folder = os.path.join(app.static_folder, 'images')
    image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.JPG', '.JPEG', '.PNG', '.GIF')
    
    images = []
    
    if os.path.exists(images_folder):
        for filename in os.listdir(images_folder):
            if filename.endswith(image_extensions):
                # 移除副檔名作為單字名稱（或保持原檔名）
                word = os.path.splitext(filename)[0]
                images.append({
                    "filename": filename,
                    "word": word
                })
    
    return images

# 全域變數：儲存打亂後的圖片清單
SHUFFLED_IMAGES = []


@app.route('/')
def index():
    """渲染遊戲首頁"""
    return render_template('index.html')


@app.route('/api/game-data')
def get_game_data():
    """
    提供遊戲資料 API
    - 總共 5 局
    - 每局 8 張圖片
    - 隨機排列，盡量讓每張圖片都被使用
    """
    global SHUFFLED_IMAGES
    
    # 獲取所有圖片
    all_images = get_all_images()
    total_images = len(all_images)
    
    print(f"\n📸 找到 {total_images} 張圖片")
    
    # 計算需要的圖片數量
    total_rounds = 5
    images_per_round = 8
    needed_images = total_rounds * images_per_round  # 5 × 8 = 40 張
    
    # 打亂圖片順序並準備足夠的圖片
    if total_images == 0:
        print("❌ 錯誤：static/images/ 資料夾中沒有圖片！")
        SHUFFLED_IMAGES = []
    elif total_images >= needed_images:
        # 圖片足夠，隨機選擇 40 張（不重複）
        SHUFFLED_IMAGES = random.sample(all_images, needed_images)
        print(f"✅ 隨機選擇 {needed_images} 張圖片（不重複）")
    else:
        # 圖片不足，重複使用直到湊足 40 張
        SHUFFLED_IMAGES = []
        times_to_repeat = (needed_images // total_images) + 1
        
        for _ in range(times_to_repeat):
            shuffled = all_images.copy()
            random.shuffle(shuffled)
            SHUFFLED_IMAGES.extend(shuffled)
        
        # 取前 40 張
        SHUFFLED_IMAGES = SHUFFLED_IMAGES[:needed_images]
        print(f"⚠️  圖片不足 {total_images} 張，重複使用部分圖片湊足 {needed_images} 張")
    
    # 分成 5 局，每局 8 張
    rounds = [
        SHUFFLED_IMAGES[0:8],    # Round 1: 圖片 0-7
        SHUFFLED_IMAGES[8:16],   # Round 2: 圖片 8-15
        SHUFFLED_IMAGES[16:24],  # Round 3: 圖片 16-23
        SHUFFLED_IMAGES[24:32],  # Round 4: 圖片 24-31
        SHUFFLED_IMAGES[32:40]   # Round 5: 圖片 32-39
    ]
    
    # 印出每局的圖片資訊
    for i, round_images in enumerate(rounds, 1):
        image_names = [img['filename'] for img in round_images]
        print(f"Round {i}: {', '.join(image_names)}")
    
    return jsonify({
        "totalRounds": 5,
        "imagesPerRound": 8,
        "rounds": rounds,
        "phase1Interval": 285,  # 第一階段：300ms/張
        "phase2Interval": 285,  # 第二階段：300ms/張
        "autoNextRound": True,  # 自動進入下一局
        "autoNextDelay": 10,  # 自動進入下一局的延遲（毫秒）- 0.5 秒快速接續
        "music": {
            "filename": "beat.mp3",
            "duration": 5.4,  # 音樂總長
            "startDelay": 0.65,  # 音樂開始前延遲 0.65 秒
            "phase1Duration": 2.39,  # 第一階段：8 × 300ms = 2400ms
            "phase2Duration": 2.39,  # 第二階段：8 × 300ms = 2400ms
            "loop": False
        }
    })


if __name__ == '__main__':
    # 檢查 static/images 資料夾是否存在
    images_path = os.path.join(app.static_folder, 'images')
    if not os.path.exists(images_path):
        os.makedirs(images_path)
        print(f"已創建圖片資料夾: {images_path}")
        print("請將圖片放入 static/images/ 資料夾")
    
    # 檢查 static/audio 資料夾是否存在
    audio_path = os.path.join(app.static_folder, 'audio')
    if not os.path.exists(audio_path):
        os.makedirs(audio_path)
        print(f"已創建音樂資料夾: {audio_path}")
        print("請將音樂檔案 beat.mp3 放入 static/audio/ 資料夾")
    
    print("\n" + "="*50)
    print("🎮 Say the Word on Beat 遊戲伺服器")
    print("="*50)
    print("請在瀏覽器開啟: http://127.0.0.1:5001")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
