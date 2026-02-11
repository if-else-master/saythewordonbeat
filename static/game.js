/**
 * Say the Word on Beat - 遊戲邏輯
 * 負責節拍控制、圖片切換、Round 管理
 */

// ===== 遊戲狀態管理 =====
const GameState = {
    gameData: null,           // 從後端獲取的遊戲資料
    currentRound: 0,          // 當前回合 (0-2)
    currentImageIndex: 0,     // 當前圖片索引 (0-7)
    phase1Interval: 375,      // 第一階段節拍間隔 (毫秒) - 8張圖/3秒
    phase2Interval: 375,      // 第二階段節拍間隔 (毫秒) - 4張圖/3秒
    beatTimer: null,          // 節拍計時器
    beatStartTime: 0,         // 節拍開始時間
    isPlaying: false,         // 是否正在播放
    music: null,              // 音樂播放器物件
    isMusicPlaying: false,    // 音樂是否正在播放
    isMuted: false,           // 是否靜音
    phase: 1,                 // 遊戲階段 (1=展示圖片, 2=高亮提示)
    gridCells: [],            // 格子DOM元素陣列
    selectedSpeed: 0.5        // 選擇的速度（預設 0.5 倍）
};

// ===== DOM 元素 =====
const Elements = {
    // 畫面
    startScreen: document.getElementById('start-screen'),
    introScreen: document.getElementById('intro-screen'),
    roundTransitionScreen: document.getElementById('round-transition-screen'),
    gameScreen: document.getElementById('game-screen'),
    roundCompleteScreen: document.getElementById('round-complete-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    
    // 按鈕
    startBtn: document.getElementById('start-btn'),
    nextRoundBtn: document.getElementById('next-round-btn'),
    restartBtn: document.getElementById('restart-btn'),
    speedNormalBtn: document.getElementById('speed-normal'),
    speedSlowBtn: document.getElementById('speed-slow'),
    
    // 遊戲資訊
    currentRound: document.getElementById('current-round'),
    totalRounds: document.getElementById('total-rounds'),
    currentImage: document.getElementById('current-image'),
    totalImages: document.getElementById('total-images'),
    
    // 階段提示（已移除）
    // phaseText: document.getElementById('phase-text'),
    
    // 節拍指示器
    beatBar: document.getElementById('beat-bar'),
    
    // Round 完成提示
    completedRound: document.getElementById('completed-round'),
    
    // 開場動畫
    introImages: document.querySelectorAll('.intro-image'),
    startText: document.querySelector('.start-text'),
    roundTransitionText: document.getElementById('round-transition-text'),
    
    // 音樂播放器
    backgroundMusic: document.getElementById('background-music')
};

// ===== 初始化 =====
async function init() {
    console.log('🎮 初始化遊戲...');
    
    // 從後端獲取遊戲資料（使用預設速度）
    await loadGameData(GameState.selectedSpeed);
    
    console.log('✅ 遊戲初始化完成');
}

// ===== 載入遊戲資料 =====
async function loadGameData(speed) {
    try {
        const response = await fetch(`/api/game-data?speed=${speed}`);
        GameState.gameData = await response.json();
        GameState.phase1Interval = GameState.gameData.phase1Interval;
        GameState.phase2Interval = GameState.gameData.phase2Interval;
        
        console.log(`✅ 遊戲資料載入成功（速度: ${speed}x）:`, GameState.gameData);
        console.log(`⏱️  第一階段: ${GameState.phase1Interval}ms/張, 第二階段: ${GameState.phase2Interval}ms/張`);
        
        // 設定總回合數
        Elements.totalRounds.textContent = GameState.gameData.totalRounds;
        Elements.totalImages.textContent = GameState.gameData.imagesPerRound;
        
    } catch (error) {
        console.error('❌ 無法載入遊戲資料:', error);
        alert('遊戲資料載入失敗，請重新整理頁面');
        return;
    }
    
    // 初始化音樂播放器
    initMusic();
    
    // 初始化格子
    initGridCells();
    
    // 綁定事件
    Elements.startBtn.addEventListener('click', startGame);
    Elements.nextRoundBtn.addEventListener('click', nextRound);
    Elements.restartBtn.addEventListener('click', restartGame);
    Elements.speedNormalBtn.addEventListener('click', () => selectSpeed(1.0));
    Elements.speedSlowBtn.addEventListener('click', () => selectSpeed(0.5));
}

// ===== 初始化格子 =====
function initGridCells() {
    GameState.gridCells = document.querySelectorAll('.grid-cell');
    console.log(`✅ 初始化 ${GameState.gridCells.length} 個格子`);
}

// ===== 初始化音樂播放器 =====
function initMusic() {
    console.log('🎵 初始化音樂播放器...');
    
    // 取得音樂元素
    GameState.music = Elements.backgroundMusic;
    
    if (!GameState.music) {
        console.error('❌ 找不到音樂元素');
        return;
    }
    
    // 設定音樂屬性
    GameState.music.volume = 0.5;  // 音量 50%
    GameState.music.loop = false;   // 不循環播放
    
    // 設定播放速度（如果有設定的話）
    if (GameState.gameData?.music?.playbackRate) {
        GameState.music.playbackRate = GameState.gameData.music.playbackRate;
        console.log(`🎵 音樂播放速度: ${GameState.music.playbackRate}x (${GameState.music.playbackRate === 0.5 ? '放慢 0.5 倍' : '正常'})`);
    }
    
    // 監聽音樂事件
    GameState.music.addEventListener('ended', () => {
        console.log('🎵 音樂播放結束');
        GameState.isMusicPlaying = false;
    });
    
    GameState.music.addEventListener('error', (e) => {
        console.error('❌ 音樂載入失敗:', e);
    });
    
    GameState.music.addEventListener('loadedmetadata', () => {
        const actualDuration = GameState.music.duration;
        console.log(`✅ 音樂載入完成`);
        console.log(`⏱️  實際音檔時長: ${actualDuration.toFixed(2)} 秒`);
        console.log(`⏱️  設定的時長: ${GameState.gameData?.music?.duration || '未設定'} 秒`);
        
        // 檢查時長差異
        if (GameState.gameData && GameState.gameData.music) {
            const expectedDuration = GameState.gameData.music.duration;
            const diff = Math.abs(actualDuration - expectedDuration);
            if (diff > 0.1) {
                console.warn(`⚠️  時長不符！差異: ${diff.toFixed(2)} 秒`);
                console.warn(`建議將 app.py 中的 duration 改為 ${actualDuration.toFixed(2)}`);
            }
        }
    });
    
    console.log('✅ 音樂播放器初始化完成');
}

// ===== 播放音樂 =====
function playMusic(onMusicStart) {
    if (!GameState.music) {
        console.warn('⚠️  音樂播放器未初始化');
        // 如果沒有音樂，直接啟動遊戲
        if (onMusicStart) onMusicStart();
        return;
    }
    
    if (GameState.isMuted) {
        console.log('🔇 音樂已靜音，不播放');
        // 靜音時也啟動遊戲
        if (onMusicStart) onMusicStart();
        return;
    }
    
    console.log('▶️  開始播放音樂');
    
    // 重設播放位置到開頭（每局都重新播放）
    GameState.music.currentTime = 0;
    
    // 播放音樂
    const playPromise = GameState.music.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            GameState.isMusicPlaying = true;
            console.log('✅ 音樂開始播放');
            // 音樂開始播放後，啟動遊戲
            if (onMusicStart) onMusicStart();
        }).catch(error => {
            console.error('❌ 音樂播放失敗:', error);
            // 如果自動播放被阻擋，提示使用者
            alert('瀏覽器阻擋了音樂自動播放，請點擊「音樂」按鈕手動開啟');
            // 即使音樂失敗，也啟動遊戲
            if (onMusicStart) onMusicStart();
        });
    } else {
        // 如果沒有 Promise，直接啟動遊戲
        if (onMusicStart) onMusicStart();
    }
}

// ===== 停止音樂 =====
function stopMusic() {
    if (!GameState.music) return;
    
    console.log('⏹️  停止音樂');
    GameState.music.pause();
    GameState.music.currentTime = 0;
    GameState.isMusicPlaying = false;
}

// ===== 播放開場動畫 =====
async function playIntroAnimation() {
    console.log('🎬 播放開場動畫');
    
    // 顯示開場動畫畫面
    showScreen(Elements.introScreen);
    
    // 獲取當前遊戲的前8張圖片
    const firstRoundImages = GameState.gameData.rounds[0];
    
    // 為每個intro-image設置背景圖片
    Elements.introImages.forEach((img, index) => {
        if (firstRoundImages[index]) {
            img.style.backgroundImage = `url('/static/images/${firstRoundImages[index].filename}')`;
        }
    });
    
    // 根據速度計算動畫時長
    const speedMultiplier = 1.0 / GameState.selectedSpeed;
    
    // 等待後開始滑入動畫
    await sleep(100 * speedMultiplier);
    
    // 隨機順序播放滑入動畫
    const indices = [0, 1, 2, 3, 4, 5, 6, 7];
    shuffleArray(indices);
    
    for (let i = 0; i < indices.length; i++) {
        Elements.introImages[indices[i]].classList.add('slide-in');
        await sleep(100 * speedMultiplier); // 每張圖片間隔（根據速度調整）
    }
    
    // 停留時間（根據速度調整）
    await sleep(2000 * speedMultiplier);
    
    // 所有圖片縮小消失
    Elements.introImages.forEach(img => {
        img.classList.add('shrink-out');
    });
    
    // 等待縮小動畫完成（根據速度調整）
    await sleep(600 * speedMultiplier);
    
    // 顯示"開始"字樣
    Elements.startText.classList.add('show');
    
    // 停留時間（根據速度調整）
    await sleep(800 * speedMultiplier);
    
    // 清理動畫類
    Elements.introImages.forEach(img => {
        img.classList.remove('slide-in', 'shrink-out');
    });
    Elements.startText.classList.remove('show');
    
    console.log('✅ 開場動畫完成');
}

// ===== 顯示 Round 過渡畫面 =====
async function showRoundTransition(roundNumber) {
    console.log(`🔄 顯示 Round ${roundNumber} 過渡`);
    
    // 更新文字
    Elements.roundTransitionText.textContent = `Round ${roundNumber}`;
    
    // 顯示過渡畫面
    showScreen(Elements.roundTransitionScreen);
    
    // 停留時間（根據速度調整）
    const speedMultiplier = 1.0 / GameState.selectedSpeed;
    await sleep(1000 * speedMultiplier);
    
    console.log('✅ Round 過渡完成');
}

// ===== 工具函數：延遲 =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== 工具函數：打亂陣列 =====
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ===== 切換靜音 =====
function toggleMute() {
    GameState.isMuted = !GameState.isMuted;
    
    if (GameState.music) {
        GameState.music.muted = GameState.isMuted;
    }
    
    // 更新按鈕樣式
    if (GameState.isMuted) {
        Elements.muteBtn.textContent = '🔇 音樂';
        Elements.muteBtn.classList.add('muted');
        console.log('🔇 音樂已靜音');
    } else {
        Elements.muteBtn.textContent = '🔊 音樂';
        Elements.muteBtn.classList.remove('muted');
        console.log('🔊 音樂已開啟');
        
        // 如果遊戲正在進行中，恢復音樂（不需要回調）
        if (GameState.isPlaying && !GameState.isMusicPlaying) {
            playMusic(null);
        }
    }
}

// ===== 切換畫面 =====
function showScreen(screenElement) {
    // 隱藏所有畫面
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 顯示指定畫面
    screenElement.classList.add('active');
}

// ===== 開始遊戲 =====
async function startGame() {
    console.log('🎯 開始遊戲');
    
    // 重置遊戲狀態
    GameState.currentRound = 0;
    GameState.currentImageIndex = 0;
    
    // 播放開場動畫
    await playIntroAnimation();
    
    // 切換到遊戲畫面
    showScreen(Elements.gameScreen);
    
    // 開始第一回合（會在 startRound 中播放音樂）
    startRound();
}

// ===== 開始 Round =====
function startRound() {
    const roundNum = GameState.currentRound + 1;
    console.log(`🎵 開始 Round ${roundNum}`);
    
    // 更新 UI
    Elements.currentRound.textContent = roundNum;
    
    // 重置狀態
    GameState.currentImageIndex = 0;
    GameState.phase = 1;
    
    // 清空所有格子
    clearAllCells();
    
    // 每局重新播放音樂，並在音樂開始後延遲再啟動遊戲
    playMusic(() => {
        const startDelay = GameState.gameData.music.startDelay * 1000;  // 秒轉毫秒
        console.log(`⏳ 等待 ${startDelay}ms 後開始...`);
        
        // 延遲後才啟動遊戲（配合音樂）
        setTimeout(() => {
            GameState.isPlaying = true;
            console.log(`🎮 遊戲開始（延遲 ${startDelay}ms 後）`);
            showNextImage();
        }, startDelay);
    });
}

// ===== 清空所有格子 =====
function clearAllCells() {
    GameState.gridCells.forEach(cell => {
        cell.classList.remove('loaded', 'highlight');
        const img = cell.querySelector('.cell-image');
        const filename = cell.querySelector('.cell-filename');
        img.src = '';
        if (filename) {
            filename.textContent = '';
        }
    });
}

// ===== 顯示下一張圖片 =====
function showNextImage() {
    if (!GameState.isPlaying) return;
    
    // 獲取當前 round 的圖片資料
    const currentRoundData = GameState.gameData.rounds[GameState.currentRound];
    const imageData = currentRoundData[GameState.currentImageIndex];
    
    // 根據階段使用不同的間隔時間
    const currentInterval = GameState.phase === 1 ? GameState.phase1Interval : GameState.phase2Interval;
    
    // 根據階段執行不同邏輯
    if (GameState.phase === 1) {
        // 第一階段：在格子中顯示圖片
        displayImageInCell(GameState.currentImageIndex, imageData);
    } else {
        // 第二階段：高亮格子（全部 8 個）
        highlightCell(GameState.currentImageIndex);
    }
    
    // 更新圖片計數
    Elements.currentImage.textContent = GameState.currentImageIndex + 1;
    
    console.log(`📸 [階段${GameState.phase}] 圖片 ${GameState.currentImageIndex + 1}: ${imageData.word} (${currentInterval}ms)`);
    
    // 啟動節拍進度條
    startBeatAnimation(currentInterval);
    
    // 設定計時器顯示下一張圖片
    GameState.beatTimer = setTimeout(() => {
        GameState.currentImageIndex++;
        
        // 檢查階段完成條件
        if (GameState.phase === 1) {
            // 第一階段：顯示完 8 張圖片
            if (GameState.currentImageIndex >= GameState.gameData.imagesPerRound) {
                startPhaseTwo();
            } else {
                showNextImage();
            }
        } else {
            // 第二階段：高亮完全部 8 個格子
            if (GameState.currentImageIndex >= GameState.gameData.imagesPerRound) {
                completeRound();
            } else {
                showNextImage();
            }
        }
    }, currentInterval);
}

// ===== 在格子中顯示圖片 =====
function displayImageInCell(index, imageData) {
    const cell = GameState.gridCells[index];
    const img = cell.querySelector('.cell-image');
    const filename = cell.querySelector('.cell-filename');
    
    // 設定圖片
    img.src = `/static/images/${imageData.filename}`;
    img.alt = imageData.word;
    
    // 設定檔案名稱（去除副檔名）
    if (filename) {
        // 從 filename 中提取檔名並去除副檔名
        const nameWithoutExt = imageData.filename.replace(/\.[^/.]+$/, '');
        filename.textContent = nameWithoutExt;
    }
    
    // 加入載入完成的樣式
    cell.classList.add('loaded');
}

// ===== 高亮格子 =====
function highlightCell(index) {
    // 移除所有格子的高亮
    GameState.gridCells.forEach(cell => {
        cell.classList.remove('highlight');
    });
    
    // 高亮當前格子
    const cell = GameState.gridCells[index];
    cell.classList.add('highlight');
}

// ===== 開始第二階段 =====
function startPhaseTwo() {
    console.log('🎯 進入第二階段：高亮全部 8 個格子');
    
    // 切換階段
    GameState.phase = 2;
    GameState.currentImageIndex = 0;
    
    // 立即開始第二階段（不延遲，音樂已經進入後半段）
    showNextImage();
}

// ===== 節拍動畫 =====
function startBeatAnimation(interval) {
    // 重置進度條
    Elements.beatBar.style.width = '0%';
    
    // 記錄開始時間
    GameState.beatStartTime = Date.now();
    
    // 使用 requestAnimationFrame 來平滑更新進度條
    function updateBeatBar() {
        if (!GameState.isPlaying) return;
        
        const elapsed = Date.now() - GameState.beatStartTime;
        const progress = Math.min((elapsed / interval) * 100, 100);
        
        Elements.beatBar.style.width = progress + '%';
        
        if (progress < 100) {
            requestAnimationFrame(updateBeatBar);
        }
    }
    
    requestAnimationFrame(updateBeatBar);
}

// ===== 處理「說出單字」按鈕 =====
function handleSpeak() {
    // 只在第二階段（高亮階段）有效
    if (GameState.phase !== 2) {
        console.log('⚠️  第一階段請先記住圖片');
        return;
    }
    
    // 取得當前高亮格子的單字
    const currentRoundData = GameState.gameData.rounds[GameState.currentRound];
    const imageData = currentRoundData[GameState.currentImageIndex];
    
    console.log(`🎤 玩家說出: ${imageData.word}`);
    
    // 視覺回饋 - 按鈕閃爍
    Elements.speakBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        Elements.speakBtn.style.transform = 'scale(1)';
    }, 100);
    
    // TODO: 這裡可以加入語音辨識功能
    // 目前只做視覺回饋
}

// ===== 完成 Round =====
function completeRound() {
    const roundNum = GameState.currentRound + 1;
    console.log(`✅ Round ${roundNum} 完成`);
    
    // 停止播放
    GameState.isPlaying = false;
    clearTimeout(GameState.beatTimer);
    
    // 重置進度條
    Elements.beatBar.style.width = '0%';
    
    // 根據速度決定是否等待音樂播完
    if (GameState.selectedSpeed === 0.3) {
        // 放慢 0.5 倍版本：等待音樂播完
        const musicRemainingTime = GameState.music ? 
            (GameState.gameData.music.duration * 1000 - GameState.music.currentTime * 1000) : 0;
        
        console.log(`🎵 音樂剩餘時間: ${musicRemainingTime.toFixed(0)}ms（等待播完）`);
        
        const waitTime = Math.max(0, musicRemainingTime);
        
        setTimeout(() => {
            // 停止音樂
            stopMusic();
            
            // 檢查是否完成所有 round
            if (GameState.currentRound >= GameState.gameData.totalRounds - 1) {
                gameOver();
            } else if (GameState.gameData.autoNextRound) {
                console.log(`⏭️  音樂播完，進入下一局（過渡時間 500ms）`);
                nextRound();
            } else {
                Elements.completedRound.textContent = roundNum;
                showScreen(Elements.roundCompleteScreen);
            }
        }, waitTime);
    } else {
        // 正常速度：立即停止音樂並進入下一局
        stopMusic();
        
        // 檢查是否完成所有 round
        if (GameState.currentRound >= GameState.gameData.totalRounds - 1) {
            gameOver();
        } else if (GameState.gameData.autoNextRound) {
            console.log(`⏭️  立即進入下一局（過渡時間 500ms）`);
            nextRound();
        } else {
            Elements.completedRound.textContent = roundNum;
            showScreen(Elements.roundCompleteScreen);
        }
    }
}

// ===== 下一 Round =====
async function nextRound() {
    console.log('⏭️  進入下一 Round');
    
    // 增加回合數
    GameState.currentRound++;
    
    // 顯示 Round 過渡畫面
    await showRoundTransition(GameState.currentRound + 1);
    
    // 切換回遊戲畫面
    showScreen(Elements.gameScreen);
    
    // 開始新回合
    startRound();
}

// ===== 遊戲結束 =====
function gameOver() {
    console.log('🏆 遊戲結束');
    
    // 停止音樂
    stopMusic();
    
    // 顯示遊戲結束畫面
    showScreen(Elements.gameOverScreen);
}

// ===== 選擇速度 =====
async function selectSpeed(speed) {
    console.log(`⚙️  選擇速度: ${speed}x`);
    
    // 更新選中狀態
    GameState.selectedSpeed = speed;
    
    // 更新 CSS 變數（animation-speed = 1 / speed）
    const animationSpeed = 1.0 / speed;
    document.documentElement.style.setProperty('--animation-speed', animationSpeed);
    console.log(`🎨 CSS動畫速度設為: ${animationSpeed}x`);
    
    // 更新按鈕樣式
    if (speed === 1.0) {
        Elements.speedNormalBtn.classList.add('active');
        Elements.speedSlowBtn.classList.remove('active');
    } else {
        Elements.speedNormalBtn.classList.remove('active');
        Elements.speedSlowBtn.classList.add('active');
    }
    
    // 重新載入遊戲資料
    await loadGameData(speed);
    
    console.log(`✅ 已切換至 ${speed}x 速度`);
}

// ===== 重新開始 =====
function restartGame() {
    console.log('🔄 重新開始遊戲');
    
    // 停止音樂
    stopMusic();
    
    // 重置狀態
    GameState.currentRound = 0;
    GameState.currentImageIndex = 0;
    GameState.isPlaying = false;
    clearTimeout(GameState.beatTimer);
    
    // 回到開始畫面
    showScreen(Elements.startScreen);
}

// ===== 頁面載入完成後初始化 =====
document.addEventListener('DOMContentLoaded', init);

// ===== 視窗關閉前清理 =====
window.addEventListener('beforeunload', () => {
    if (GameState.beatTimer) {
        clearTimeout(GameState.beatTimer);
    }
});
