import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiViTri.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(2);
  }, []);
  return null;
}

const GAME_ID = "tro-choi-vi-tri";
const STATE_KEY = "tc_vi_tri_state";
const BT_KEY = "bt_game_progress";

const QUESTIONS = [
  {
    question: "1. Sau sáp nhập, Thành phố Hồ Chí Minh giáp với các tỉnh/vùng nào sau đây?",
    options: [
      "Đồng Nai, Tây Ninh, Bình Dương, Bà Rịa - Vũng Tàu.",
      "Đồng Nai, Tây Ninh, Tiền Giang, Long An và Biển Đông",
      "Đồng Nai, Đồng Tháp, Tây Ninh, Tiền Giang và Biển Đông.",
      "Đồng Nai, Đồng Tháp, Lâm Đồng, Tây Ninh và Biển Đông."
    ],
    correct: 3 // D
  },
  {
    question: "2. Sau sáp nhập, thành phố Hồ Chí Minh có bao nhiêu đơn vị hành chính cấp xã?",
    options: [
      "165 đơn vị hành chính cấp xã",
      "175 đơn vị hành chính cấp xã",
      "168 đơn vị hành chính cấp xã",
      "178 đơn vị hành chính cấp xã"
    ],
    correct: 2 // C
  },
  {
    question: "3. Sau sáp nhập Thành phố Hồ Chí Minh có diện tích là bao nhiêu km²?",
    options: [
      "6.772,59 km²",
      "7.772,59 km²",
      "8.772,59 km²",
      "9.772,59 km²"
    ],
    correct: 0 // A
  },
  {
    question: "4. Sau sáp nhập, Thành phố Hồ Chí Minh được sáp nhập với các tỉnh thành nào?",
    options: [
      "Bình Dương, Long An",
      "Bình Dương, Bà Rịa - Vũng Tàu",
      "Bà Rịa - Vũng Tàu, Đồng Nai",
      "Bà Rịa - Vũng Tàu, Long An"
    ],
    correct: 1 // B
  },
  {
    question: "5. Quy mô dân số của Thành phố Hồ Chí Minh sau sáp nhập khoảng bao nhiêu người?",
    options: [
      "Hơn 14 triệu người",
      "Hơn 12 triệu người",
      "Hơn 15 triệu người",
      "Hơn 13 triệu người"
    ],
    correct: 0 // A
  }
];

export default function TroChoiViTri() {
  const [screen, setScreen] = useState("intro"); // intro, playing, finish
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    document.title = "Cuộc phiêu lưu của táo đỏ - Khám phá TPHCM";
    const saved = sessionStorage.getItem(STATE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScreen(parsed.screen || "intro");
        setCurrentQuestion(parsed.currentQuestion || 0);
        setScore(parsed.score || 0);
      } catch (e) {
        console.error(e);
      }
    }
    document.body.classList.add("page-tro-choi-vi-tri-active");
    return () => {
      document.body.classList.remove("page-tro-choi-vi-tri-active");
    };
  }, []);

  useEffect(() => {
    if (selectedOption === null) {
      sessionStorage.setItem(
        STATE_KEY,
        JSON.stringify({ screen, currentQuestion, score })
      );
    }
  }, [screen, currentQuestion, score, selectedOption]);

  const updateGlobalProgress = (finalScore) => {
    try {
      const globalStr = localStorage.getItem(BT_KEY);
      const globalData = globalStr ? JSON.parse(globalStr) : {};
      const oldScore = globalData[GAME_ID] || 0;
      if (finalScore > oldScore) {
        globalData[GAME_ID] = finalScore;
        localStorage.setItem(BT_KEY, JSON.stringify(globalData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    setScreen("playing");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleSelectOption = (index) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);

    const isCorrect = index === QUESTIONS[currentQuestion].correct;
    let newScore = score;
    if (isCorrect) {
      newScore = score + 20;
      setScore(newScore);
    }

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setShowResult(false);
      } else {
        setScreen("finish");
        updateGlobalProgress(newScore);
      }
    }, 1500);
  };

  const handleRestart = () => {
    sessionStorage.removeItem(STATE_KEY);
    handleStart();
  };

  return (
    <div className="vt-page">
      <div className="vt-topbar">
        <Link to="/bai-tap" className="vt-back">
          <i className="fa-solid fa-arrow-left" /> Quay lại Bài tập
        </Link>
        <div className="vt-title-wrap">
          <h1 className="vt-title">Trải nghiệm Vị Trí</h1>
          <p className="vt-subtitle">Kiểm tra kiến thức về vị trí địa lý của TP.HCM sau sáp nhập</p>
        </div>
        <div className="vt-stats">
          <div className="vt-stat-item">
            <i className="fa-solid fa-star" /> Điểm: {score}/100
          </div>
          {screen === "playing" && (
            <div className="vt-stat-item">
              <i className="fa-regular fa-circle-question" /> Câu hỏi: {currentQuestion + 1}/{QUESTIONS.length}
            </div>
          )}
        </div>
      </div>

      <div className="vt-content">
        {screen === "intro" && (
          <div key="intro" className="vt-intro vt-screen-enter">
            <div className="vt-intro-card">
              <div className="vt-intro-icon">
                <i className="fa-solid fa-map-location-dot" />
              </div>
              <h2>Chào mừng bạn đến với Bài tập Vị trí</h2>
              <p>Bạn sẽ trả lời 5 câu hỏi trắc nghiệm liên quan đến vị trí địa lý của TP.HCM sau sáp nhập. Hãy đọc kỹ các lựa chọn và bấm vào đáp án đúng nhất nhé!</p>
              <button className="vt-btn-primary" onClick={handleStart}>
                Bắt đầu chơi
              </button>
            </div>
          </div>
        )}

        {screen === "playing" && (
          <div key={`quiz-${currentQuestion}`} className="vt-quiz vt-screen-enter">
            <div className="vt-question-card">
              <h3 className="vt-question-text">{QUESTIONS[currentQuestion].question}</h3>
              <div className="vt-options">
                {QUESTIONS[currentQuestion].options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrectResp = showResult && i === QUESTIONS[currentQuestion].correct;
                  const isWrongResp = showResult && isSelected && !isCorrectResp;
                  let btnClass = "vt-option-btn";
                  if (isSelected) btnClass += " selected";
                  if (isCorrectResp) btnClass += " correct";
                  if (isWrongResp) btnClass += " wrong";
                  if (showResult && !isSelected && !isCorrectResp) btnClass += " disabled";

                  return (
                    <button
                      key={i}
                      className={btnClass}
                      onClick={() => handleSelectOption(i)}
                      disabled={showResult}
                    >
                      <span className="vt-opt-letter">{["A", "B", "C", "D"][i]}</span>
                      <span className="vt-opt-text">{opt}</span>
                      {isCorrectResp && <i className="fa-solid fa-circle-check option-icon" />}
                      {isWrongResp && <i className="fa-solid fa-circle-xmark option-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {screen === "finish" && (
          <div key="finish" className="vt-finish vt-screen-enter">
            <ConfettiOnMount />
            <div className="vt-finish-card">
              <div className="vt-finish-icon">
                <i className="fa-solid fa-medal" />
              </div>
              <h2>🎉 Chúc mừng bạn!</h2>
              <p className="vt-finish-desc">Bạn đã hoàn thành bài tập Vị Trí Địa Lý TP.HCM.</p>
              <div className="vt-finish-score">
                <p>Số câu đúng: <strong>{score / 20}/{QUESTIONS.length}</strong></p>
                <p>Điểm số: <strong>{score}/100</strong></p>
              </div>
              <div className="vt-finish-actions">
                <button className="vt-btn-primary" onClick={handleRestart}>
                  <i className="fa-solid fa-rotate-right" /> Chơi lại
                </button>
                <Link to="/bai-tap" className="vt-btn-ghost">
                  <i className="fa-solid fa-house" /> Về Bài tập
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
