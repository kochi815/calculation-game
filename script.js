// --- 要素の取得 ---
const modeSelectionScreen = document.getElementById('mode-selection');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const levelDisplay = document.getElementById('level');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const timeGauge = document.getElementById('time-gauge'); // 時間ゲージ

const questionDisplay = document.getElementById('question');
const optionsArea = document.getElementById('options-area');
// 選択肢ボタンは都度取得する方が確実

const resultMessageDisplay = document.getElementById('result-message');
const finalScoreDisplay = document.getElementById('final-score');
const finalTimeDisplay = document.getElementById('final-time');
const nextLevelButton = document.getElementById('next-level-button');
const retryButton = document.getElementById('retry-button');

// --- ゲームの状態を管理する変数 ---
let currentMode = ''; // 'easy' または 'hard'
let currentLevel = 1;
let score = 0;
let totalQuestions = 0; // モードによって変わる問題数
let timeLeft = 0; // 制限時間
let initialTime = 0; // 各レベル開始時の制限時間（ゲージ計算用）
let timerInterval = null; // タイマーを管理するための変数
let currentQuestion = {}; // 現在の問題と答え { question: '1 + 2 = ?', answer: 3 }
let questionsAsked = 0; // 現在何問目か

// --- 画面切り替え関数 ---
function showModeSelection() {
    currentLevel = 1; // モード選択に戻ったらレベルを1にリセット
    modeSelectionScreen.classList.add('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
}

function showGameScreen() {
    modeSelectionScreen.classList.remove('active');
    gameScreen.classList.add('active');
    resultScreen.classList.remove('active');
}

function showResultScreen() {
    modeSelectionScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');
}

// --- レベルに応じた制限時間を計算 ---
function calculateTimeLimit(mode, level) {
    let baseTime, targetTime;
    const maxLevel = 30;

    if (mode === 'easy') {
        baseTime = 80; // レベル1の時間
        targetTime = 48; // レベル30の時間
    } else { // hard
        baseTime = 70; // レベル1の時間
        targetTime = 36; // レベル30の時間
    }

    // レベルの進捗度 (0から1)
    const progress = Math.min(1, (level - 1) / (maxLevel - 1)); // levelが1未満にならないように
    // 指数関数的に時間を減らす (1.5乗で調整)
    const currentTime = baseTime - (baseTime - targetTime) * Math.pow(progress, 1.5);
    return Math.max(targetTime, Math.round(currentTime)); // 目標時間以下にはならないように
}

// --- ゲーム開始処理 ---
function startGame(mode) {
    console.log(`ゲーム開始！ モード: ${mode}, レベル: ${currentLevel}`);
    currentMode = mode;
    // currentLevel は showModeSelection でリセットされているはず
    score = 0;
    questionsAsked = 0;

    if (currentMode === 'easy') {
        totalQuestions = 12;
    } else {
        totalQuestions = 30;
    }

    timeLeft = calculateTimeLimit(currentMode, currentLevel);
    initialTime = timeLeft; // ゲージ計算用に初期時間を保存

    // 表示を更新 (アイコン反映)
    levelDisplay.innerHTML = `<span>⭐</span> レベル: ${currentLevel}`;
    timerDisplay.innerHTML = `<span>⏰</span> 時間: ${timeLeft}`;
    scoreDisplay.innerHTML = `<span>🎯</span> スコア: ${score}/${totalQuestions}`;

    // ゲージをリセット
    timeGauge.style.width = '100%';
    timeGauge.style.backgroundColor = '#4caf50'; // 緑色に戻す

    showGameScreen();
    generateAndDisplayQuestion();
    startTimer();
}

// --- 次のレベルへ進む関数 ---
function continueToNextLevel() {
    // currentLevel は gameClear でインクリメントされている想定
    console.log(`次のレベル (${currentLevel}) へ`);
    score = 0;
    questionsAsked = 0;
    timeLeft = calculateTimeLimit(currentMode, currentLevel);
    initialTime = timeLeft;

    // 表示を更新
    levelDisplay.innerHTML = `<span>⭐</span> レベル: ${currentLevel}`;
    timerDisplay.innerHTML = `<span>⏰</span> 時間: ${timeLeft}`;
    scoreDisplay.innerHTML = `<span>🎯</span> スコア: ${score}/${totalQuestions}`;

    // ゲージをリセット
    timeGauge.style.width = '100%';
    timeGauge.style.backgroundColor = '#4caf50';

    showGameScreen();
    generateAndDisplayQuestion();
    startTimer();
}


// --- 問題生成と表示 (引き算・割り算追加) ---
function generateAndDisplayQuestion() {
    console.log("問題生成中...");
    let num1, num2, questionText, answer;

    if (currentMode === 'easy') {
        // Easyモード: 足し算か引き算をランダムで選択
        if (Math.random() < 0.5) { // 足し算
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            questionText = `${num1} + ${num2} = ?`;
            answer = num1 + num2;
        } else { // 引き算
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            if (num1 >= num2) {
                questionText = `${num1} - ${num2} = ?`;
                answer = num1 - num2;
            } else {
                questionText = `${num2} - ${num1} = ?`;
                answer = num2 - num1;
            }
        }
    } else { // Hardモード
        // Hardモード: 掛け算か割り算をランダムで選択
        if (Math.random() < 0.5) { // 掛け算
            num1 = Math.floor(Math.random() * 9) + 1;
            num2 = Math.floor(Math.random() * 9) + 1;
            questionText = `${num1} × ${num2} = ?`;
            answer = num1 * num2;
        } else { // 割り算 (九九の逆算)
            num1 = Math.floor(Math.random() * 9) + 1;
            num2 = Math.floor(Math.random() * 9) + 1;
            let product = num1 * num2;
            if (Math.random() < 0.5 && num1 !== 1) { // product ÷ num1 = ?
                questionText = `${product} ÷ ${num1} = ?`;
                answer = num2;
            } else { // product ÷ num2 = ?
                 // num2が1の場合や、上記の条件に当てはまらなかった場合
                questionText = `${product} ÷ ${num2} = ?`;
                answer = num1;
                 // 同じ数同士(例: 3x3=9)だと割る数が同じになるので、表示が偏る可能性はある
            }
        }
    }

    // 生成した問題と答えを保存
    currentQuestion = {
        question: questionText,
        answer: answer
    };

    // 問題文を表示
    questionDisplay.textContent = currentQuestion.question;

    // 新しい選択肢を生成して表示
    generateOptions();

    // 問題数をカウントアップし、スコア表示を更新
    questionsAsked++;
    scoreDisplay.innerHTML = `<span>🎯</span> スコア: ${score}/${totalQuestions}`; // アイコン付きで更新
}

// --- 選択肢生成 (修正版) ---
function generateOptions() {
    console.log("選択肢生成中...");
    const correctAnswer = currentQuestion.answer;
    const options = new Set([correctAnswer]); // Setで重複回避

    while (options.size < 6) {
        let wrongAnswer;
        if (currentMode === 'easy') {
            // 正解の±10の範囲で、0以上の値を候補とする
            const offset = Math.floor(Math.random() * 21) - 10; // -10 から +10
            wrongAnswer = Math.max(0, correctAnswer + offset);
        } else { // hard
            // 九九の結果(1～81)の範囲で候補を生成
             let num1 = Math.floor(Math.random() * 9) + 1;
             let num2 = Math.floor(Math.random() * 9) + 1;
             wrongAnswer = num1 * num2;
        }
        // 正解と同じでなく、かつマイナスでない場合のみ追加
        if (wrongAnswer !== correctAnswer && wrongAnswer >= 0) {
             options.add(wrongAnswer);
        }
    }

    // Setを配列に変換してシャッフル
    const optionsArray = Array.from(options);
    for (let i = optionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    // ボタンに選択肢を表示し、クリックイベントを設定
    const currentOptionButtons = optionsArea.querySelectorAll('.option');
    currentOptionButtons.forEach((button, index) => {
        // 新しいボタンを作成して置き換える (古いイベントリスナー削除のため)
        const newButton = button.cloneNode(true);
        newButton.textContent = optionsArray[index];
        newButton.disabled = false; // ボタンを有効化
        newButton.style.backgroundColor = ''; // 背景色リセット
        optionsArea.replaceChild(newButton, button);

        // 新しいボタンにクリックイベントを設定
        newButton.addEventListener('click', checkAnswer);
    });
}


// --- タイマー開始 ---
function startTimer() {
    console.log("タイマースタート！");
    clearInterval(timerInterval); // 前のタイマーをクリア

    // タイマー表示とゲージを即時更新
    timerDisplay.innerHTML = `<span>⏰</span> 時間: ${timeLeft}`;
    updateGauge();

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerHTML = `<span>⏰</span> 時間: ${timeLeft}`; // 時間表示更新

        updateGauge(); // ゲージ更新

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver("時間切れ！");
        }
    }, 1000); // 1秒ごとに実行
}

// --- ゲージ更新関数 ---
function updateGauge() {
    // initialTimeが0の場合のエラーを防ぐ
    if (initialTime <= 0) {
        timeGauge.style.width = '0%';
        return;
    }
    const percentage = Math.max(0, (timeLeft / initialTime) * 100); // 0%未満にならないように
    timeGauge.style.width = `${percentage}%`;

    // 残り時間に応じてゲージの色を変更
    if (percentage <= 25) {
        timeGauge.style.backgroundColor = '#f44336'; // 赤
    } else if (percentage <= 50) {
        timeGauge.style.backgroundColor = '#ffeb3b'; // 黄
    } else {
        timeGauge.style.backgroundColor = '#4caf50'; // 緑
    }
}

// --- 回答チェック (色リセット追加) ---
function checkAnswer(event) {
    const selectedButton = event.target;
    const selectedAnswer = parseInt(selectedButton.textContent);
    console.log(`選択された答え: ${selectedAnswer}, 正解: ${currentQuestion.answer}`);

    // 他のボタンを一時的に無効化
    const allButtons = optionsArea.querySelectorAll('.option');
    allButtons.forEach(btn => btn.disabled = true);

    let isCorrect = false;

    if (selectedAnswer === currentQuestion.answer) { // 正解
        score++;
        console.log("正解！");
        selectedButton.style.backgroundColor = 'lightgreen';
        isCorrect = true;
        // 正解音など
    } else { // 不正解
        console.log("不正解...");
        selectedButton.style.backgroundColor = 'lightcoral';
        // 不正解音など

        // 正解のボタンを一時的に示す (任意)
         allButtons.forEach(btn => {
            if (parseInt(btn.textContent) === currentQuestion.answer) {
                btn.style.backgroundColor = 'palegreen'; // 正解を少し示す色
            }
         });
    }

    // スコア表示を即時更新
     scoreDisplay.innerHTML = `<span>🎯</span> スコア: ${score}/${totalQuestions}`;

    // 少し待ってから次の処理へ
    setTimeout(() => {
        // ボタンの状態をリセット (色と有効状態)
        allButtons.forEach(btn => {
             // 色のリセットは generateOptions で行われるのでここでは不要かも？
             // generateOptions でリセットされることを期待してコメントアウト
            // btn.style.backgroundColor = '';
            // btn.disabled = false; // disable も generateOptions で解除される
        });

        // 次の問題へ進むか、結果表示へ
        if (questionsAsked < totalQuestions) {
             generateAndDisplayQuestion(); // 次の問題 (generateOptionsでボタン有効化)
        } else { // 全問終了
            clearInterval(timerInterval);
            gameClear(); // 時間内に全問解いたら常にクリア
        }
    }, 1000); // 待ち時間 (ミリ秒)
}


// --- ゲームクリア処理 (レベルアップ対応) ---
function gameClear() {
    console.log("ゲームクリア！");
    // clearInterval(timerInterval); // checkAnswer内で停止済み

    finalScoreDisplay.textContent = `スコア: ${score} / ${totalQuestions}`;
    finalTimeDisplay.textContent = `残り時間: ${timeLeft} 秒`;

    // 古いイベントリスナーを削除するためにボタンを複製して置き換え
    const nextLevelButtonClone = nextLevelButton.cloneNode(true);
    nextLevelButton.parentNode.replaceChild(nextLevelButtonClone, nextLevelButton);
    const retryButtonClone = retryButton.cloneNode(true);
    retryButton.parentNode.replaceChild(retryButtonClone, retryButton);
    // 複製したボタン要素を再取得
    const newNextLevelButton = document.getElementById('next-level-button');
    const newRetryButton = document.getElementById('retry-button');


    if (currentLevel < 30) { // レベル30未満
        resultMessageDisplay.textContent = `レベル ${currentLevel} クリア！🎉`;
        newNextLevelButton.textContent = `レベル ${currentLevel + 1} へ！`;
        newNextLevelButton.style.display = 'inline-block';
        newRetryButton.style.display = 'none';

        // 次のレベルへボタンにイベント設定
        newNextLevelButton.addEventListener('click', continueToNextLevel);

    } else { // レベル30クリア (全クリ)
        resultMessageDisplay.textContent = "全レベルクリア！おめでとう！🏆✨";
        newRetryButton.textContent = "最初から挑戦！";
        newRetryButton.style.display = 'inline-block';
        newNextLevelButton.style.display = 'none';

        // 最初から挑戦ボタンにイベント設定
        newRetryButton.addEventListener('click', showModeSelection);
    }

    showResultScreen();
}

// --- ゲームオーバー処理 ---
function gameOver(message) {
    console.log("ゲームオーバー...");
    // clearInterval(timerInterval); // startTimer内で停止済み

    resultMessageDisplay.textContent = message + " 😭";
    finalScoreDisplay.textContent = `スコア: ${score} / ${totalQuestions}`;
    finalTimeDisplay.textContent = `挑戦したレベル: ${currentLevel}`;

    // 古いイベントリスナー削除のためにボタン置き換え
    const nextLevelButtonClone = nextLevelButton.cloneNode(true);
    nextLevelButton.parentNode.replaceChild(nextLevelButtonClone, nextLevelButton);
    const retryButtonClone = retryButton.cloneNode(true);
    retryButton.parentNode.replaceChild(retryButtonClone, retryButton);
    // 複製したボタン要素を再取得
    const newNextLevelButton = document.getElementById('next-level-button');
    const newRetryButton = document.getElementById('retry-button');


    newRetryButton.textContent = "もう一度挑戦する";
    newRetryButton.style.display = 'inline-block';
    newNextLevelButton.style.display = 'none';

    // もう一度挑戦ボタンにイベント設定
    newRetryButton.addEventListener('click', showModeSelection);

    showResultScreen();
}

// --- 初期化処理 ---
// 最初にモード選択画面を表示
showModeSelection();