// --- 要素の取得 ---
// querySelectorを使って、HTML要素をJavaScriptで扱えるようにします。
const modeSelectionScreen = document.getElementById('mode-selection');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const levelDisplay = document.getElementById('level');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const questionDisplay = document.getElementById('question');
const optionsArea = document.getElementById('options-area');
const optionButtons = optionsArea.querySelectorAll('.option'); // 選択肢ボタン全て

const resultMessageDisplay = document.getElementById('result-message');
const finalScoreDisplay = document.getElementById('final-score');
const finalTimeDisplay = document.getElementById('final-time');

// --- ゲームの状態を管理する変数 ---
let currentMode = ''; // 'easy' または 'hard'
let currentLevel = 1;
let score = 0;
let totalQuestions = 0; // モードによって変わる問題数
let timeLeft = 0; // 制限時間
let timerInterval = null; // タイマーを管理するための変数
let currentQuestion = {}; // 現在の問題と答え { question: '1 + 2', answer: 3 }
let questionsAsked = 0; // 現在何問目か

// --- 画面切り替え関数 ---

// モード選択画面を表示
function showModeSelection() {
    modeSelectionScreen.classList.add('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
}

// ゲーム画面を表示
function showGameScreen() {
    modeSelectionScreen.classList.remove('active');
    gameScreen.classList.add('active');
    resultScreen.classList.remove('active');
}

// 結果画面を表示
function showResultScreen() {
    modeSelectionScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');
}

// --- 初期状態 ---
// 最初にモード選択画面を表示しておく
showModeSelection();

// --- ここまでが基本設定と画面切り替え ---

// --- ゲーム開始処理 (次のステップで実装) ---
function startGame(mode) {
    console.log(`ゲーム開始！ モード: ${mode}`); // コンソールにログ表示（動作確認用）
    currentMode = mode;
    currentLevel = 1; // 最初はレベル1
    score = 0;
    questionsAsked = 0;

    // モードに応じた設定
    if (currentMode === 'easy') {
        totalQuestions = 12;
        // 仮の制限時間 (後でレベルに応じて変更)
        timeLeft = calculateTimeLimit(currentMode, currentLevel);
    } else { // hard モード
        totalQuestions = 30;
        // 仮の制限時間 (後でレベルに応じて変更)
        timeLeft = calculateTimeLimit(currentMode, currentLevel);
    }

    // 表示を更新
    levelDisplay.textContent = `レベル: ${currentLevel}`;
    timerDisplay.textContent = `時間: ${timeLeft}`;
    scoreDisplay.textContent = `スコア: ${score}/${totalQuestions}`;

    // ゲーム画面を表示
    showGameScreen();

    // 最初の問題を表示
    generateAndDisplayQuestion();

    // タイマーを開始
    startTimer();
}

// --- レベルに応じた制限時間を計算 (次のステップで詳細化) ---
function calculateTimeLimit(mode, level) {
    // 簡単な例：レベルが上がるごとに少しずつ短くする
    // 最終レベル(30)で目標時間に近づくように調整が必要
    let baseTime;
    let timeReductionPerLevel;

    if (mode === 'easy') {
        baseTime = 70; // レベル1の基本時間（仮）
        // レベル30で48秒になるように逆算 (例)
        // (70 - 48) / (30 - 1) = 22 / 29 ≒ 0.76秒ずつ減らす
        timeReductionPerLevel = (70 - 48) / 29;
        return Math.max(48, Math.round(baseTime - timeReductionPerLevel * (level - 1)));
    } else { // hard
        baseTime = 60; // レベル1の基本時間（仮）
        // レベル30で36秒になるように逆算 (例)
        // (60 - 36) / (30 - 1) = 24 / 29 ≒ 0.83秒ずつ減らす
        timeReductionPerLevel = (60 - 36) / 29;
        return Math.max(36, Math.round(baseTime - timeReductionPerLevel * (level - 1)));
    }
}


// --- 問題生成と表示 (次のステップで実装) ---
function generateAndDisplayQuestion() {
    console.log("問題生成中...");
    // ここで問題と選択肢を作成し、表示する処理を書く
    // 仮の問題表示
    if (currentMode === 'easy') {
        // 1桁の足し算を仮で生成
        let num1 = Math.floor(Math.random() * 10); // 0-9のランダムな数
        let num2 = Math.floor(Math.random() * 10);
        currentQuestion = {
            question: `${num1} + ${num2} = ?`,
            answer: num1 + num2
        };
    } else {
         // 九九の掛け算を仮で生成
        let num1 = Math.floor(Math.random() * 9) + 1; // 1-9
        let num2 = Math.floor(Math.random() * 9) + 1; // 1-9
         currentQuestion = {
            question: `${num1} × ${num2} = ?`,
            answer: num1 * num2
         };
    }

    questionDisplay.textContent = currentQuestion.question;

    // --- 選択肢の生成と表示 (次のステップで詳細化) ---
    generateOptions();
    questionsAsked++; // 問題数をカウント
    scoreDisplay.textContent = `スコア: ${score}/${totalQuestions}`; // スコア表示更新
}

// --- 選択肢生成 (次のステップで実装) ---
function generateOptions() {
    console.log("選択肢生成中...");
    const correctAnswer = currentQuestion.answer;
    const options = [correctAnswer]; // 正解をまず配列に入れる

    // 不正解の選択肢を生成 (正解と被らず、適切な範囲で)
    while (options.length < 6) {
        let wrongAnswer;
        if (currentMode === 'easy') {
            // 足し算/引き算の場合、正解の近くの数字などを生成
            wrongAnswer = Math.max(0, correctAnswer + Math.floor(Math.random() * 11) - 5); // 正解±5の範囲(0以上)
        } else { // hard (掛け算/割り算)
             // 九九の範囲で、正解と異なる答えを生成
            wrongAnswer = (Math.floor(Math.random() * 9) + 1) * (Math.floor(Math.random() * 9) + 1);
        }

        // まだ選択肢になく、かつ正解と違う場合のみ追加
        if (!options.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
            options.push(wrongAnswer);
        }
    }

    // 選択肢をシャッフル (Fisher-Yatesアルゴリズム)
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]]; // 要素を入れ替え
    }

    // ボタンに選択肢を表示し、クリックイベントを設定
    optionButtons.forEach((button, index) => {
        button.textContent = options[index];
        // 古いイベントリスナーを削除してから新しいイベントリスナーを追加
        // これをしないと、前の問題のイベントが残ってしまうことがある
        button.replaceWith(button.cloneNode(true));
    });

    // 新しいボタン要素を取得し直してイベントリスナーを設定
    const newOptionButtons = optionsArea.querySelectorAll('.option');
    newOptionButtons.forEach(button => {
        button.addEventListener('click', checkAnswer);
    });

}


// --- タイマー開始 (次のステップで実装) ---
function startTimer() {
    console.log("タイマースタート！");
    // 前回のタイマーが残っていればクリア
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `時間: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver("時間切れ！");
        }
    }, 1000); // 1000ミリ秒 = 1秒ごとに実行
}

// --- 回答チェック (次のステップで実装) ---
function checkAnswer(event) {
    const selectedAnswer = parseInt(event.target.textContent); // クリックされたボタンの数字を取得
    console.log(`選択された答え: ${selectedAnswer}, 正解: ${currentQuestion.answer}`);

    if (selectedAnswer === currentQuestion.answer) {
        // 正解の場合
        score++;
        console.log("正解！");
        // ここで正解音を鳴らしたり、キャラクターのアクションを入れる
        // 簡単なフィードバック
        event.target.style.backgroundColor = 'lightgreen';

    } else {
        // 不正解の場合
        console.log("不正解...");
        // ここで不正解音を鳴らしたり、ダメージアクションを入れる
        // 簡単なフィードバック
        event.target.style.backgroundColor = 'lightcoral';
    }

    // 次の問題へ進むか、結果表示へ
    // 少し待ってから色を戻し、次の問題へ
    setTimeout(() => {
         // ボタンの色を元に戻す処理が必要（後で実装）
        optionButtons.forEach(btn => btn.style.backgroundColor = ''); // 色をリセット (仮)

        if (questionsAsked < totalQuestions) {
             generateAndDisplayQuestion();
        } else {
            // 全問終了
            clearInterval(timerInterval); // タイマー停止
            gameClear();
        }
    }, 500); // 0.5秒待つ
}


// --- ゲームクリア処理 ---
function gameClear() {
    console.log("ゲームクリア！");
    resultMessageDisplay.textContent = "クリアおめでとう！🎉";
    finalScoreDisplay.textContent = `スコア: ${score} / ${totalQuestions}`;
    finalTimeDisplay.textContent = `残り時間: ${timeLeft} 秒`;
    showResultScreen();
    // ここでレベルアップ処理や次のレベルへの導線を追加する
}

// --- ゲームオーバー処理 ---
function gameOver(message) {
    console.log("ゲームオーバー...");
    resultMessageDisplay.textContent = message + " 😭";
    finalScoreDisplay.textContent = `スコア: ${score} / ${totalQuestions}`;
    finalTimeDisplay.textContent = `挑戦したレベル: ${currentLevel}`;
    showResultScreen();
}