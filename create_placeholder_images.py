#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
創建佔位圖片腳本 - 用於快速測試遊戲
如果你還沒準備好真實圖片，可以執行此腳本創建測試用的佔位圖片
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 圖片列表（與 app.py 中相同）
IMAGES = [
    "apple", "banana", "cat", "dog", 
    "elephant", "fish", "guitar", "house",
    "ice", "juice", "kite", "lion",
    "moon", "nest", "orange", "piano",
    "queen", "rabbit", "sun", "tree",
    "umbrella", "violin", "water", "xylophone"
]

# 配色方案（每張圖片不同顏色）
COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
    "#F8B739", "#52B788", "#E63946", "#457B9D",
    "#F1FAEE", "#A8DADC", "#FCA311", "#6A4C93",
    "#FF6F91", "#FFC93C", "#06BA63", "#7209B7",
    "#F72585", "#4361EE", "#3A0CA3", "#B5179E"
]

def create_placeholder_images():
    """創建佔位圖片"""
    
    # 確保圖片資料夾存在
    images_dir = "static/images"
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
        print(f"✅ 創建資料夾: {images_dir}")
    
    print("🎨 開始創建佔位圖片...")
    print("=" * 50)
    
    for i, word in enumerate(IMAGES):
        # 創建 400x400 的圖片
        img = Image.new('RGB', (400, 400), color=COLORS[i])
        draw = ImageDraw.Draw(img)
        
        # 嘗試使用系統字型，如果失敗則使用預設字型
        try:
            # Mac/Linux
            font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
        except:
            try:
                # Windows
                font_large = ImageFont.truetype("arial.ttf", 60)
                font_small = ImageFont.truetype("arial.ttf", 30)
            except:
                # 使用預設字型
                font_large = ImageFont.load_default()
                font_small = ImageFont.load_default()
        
        # 繪製單字（中央）
        text = word.upper()
        
        # 計算文字位置（置中）
        try:
            bbox = draw.textbbox((0, 0), text, font=font_large)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except:
            # 舊版 Pillow
            text_width, text_height = draw.textsize(text, font=font_large)
        
        position_large = ((400 - text_width) // 2, (400 - text_height) // 2 - 20)
        
        # 繪製主要文字
        draw.text(position_large, text, fill='white', font=font_large)
        
        # 繪製編號（下方）
        number_text = f"#{i+1}"
        try:
            bbox = draw.textbbox((0, 0), number_text, font=font_small)
            number_width = bbox[2] - bbox[0]
        except:
            number_width, _ = draw.textsize(number_text, font=font_small)
        
        position_small = ((400 - number_width) // 2, 320)
        draw.text(position_small, number_text, fill='white', font=font_small)
        
        # 儲存圖片
        filename = f"{images_dir}/{word}.jpg"
        img.save(filename, quality=85)
        print(f"✅ 創建: {filename}")
    
    print("=" * 50)
    print(f"🎉 完成！已創建 {len(IMAGES)} 張佔位圖片")
    print(f"📁 圖片位置: {images_dir}/")
    print("\n💡 提示: 這些是測試用圖片，正式使用請替換為真實圖片")

if __name__ == "__main__":
    try:
        create_placeholder_images()
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        print("\n⚠️  請確保已安裝 Pillow 套件:")
        print("   pip install Pillow")
