import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiViTri.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(3);
  }, []);
  return null;
}

const GAME_ID = "tro-choi-vi-tri";
const STATE_KEY = "tc_vi_tri_state";
const BT_KEY = "bt_game_progress";
const MAX_ATTEMPTS = 3;

const QUESTIONS = [
  {
    id: 1,
    question: "Sau sáp nhập, Thành phố Hồ Chí Minh giáp với các tỉnh/vùng nào sau đây?",
    options: [
      "Đồng Nai, Tây Ninh, Bình Dương, Bà Rịa - Vũng Tàu.",
      "Đồng Nai, Tây Ninh, Tiền Giang, Long An và Biển Đông",
      "Đồng Nai, Đồng Tháp, Tây Ninh, Tiền Giang và Biển Đông.",
      "Đồng Nai, Đồng Tháp, Lâm Đồng, Tây Ninh và Biển Đông."
    ],
    correct: 3 // D
  },
  {
    id: 2,
    question: "Sau sáp nhập, thành phố Hồ Chí Minh có bao nhiêu đơn vị hành chính cấp xã?",
    options: [
      "165 đơn vị hành chính cấp xã",
      "175 đơn vị hành chính cấp xã",
      "168 đơn vị hành chính cấp xã",
      "178 đơn vị hành chính cấp xã"
    ],
    correct: 2 // C
  },
  {
    id: 3,
    question: "Sau sáp nhập Thành phố Hồ Chí Minh có diện tích là bao nhiêu km²?",
    options: [
      "6.772,59 km²",
      "7.772,59 km²",
      "8.772,59 km²",
      "9.772,59 km²"
    ],
    correct: 0 // A
  },
  {
    id: 4,
    question: "Sau sáp nhập, Thành phố Hồ Chí Minh được sáp nhập với các tỉnh thành nào?",
    options: [
      "Bình Dương, Long An",
      "Bình Dương, Bà Rịa - Vũng Tàu",
      "Bà Rịa - Vũng Tàu, Đồng Nai",
      "Bà Rịa - Vũng Tàu, Long An"
    ],
    correct: 1 // B
  },
  {
    id: 5,
    question: "Quy mô dân số của Thành phố Hồ Chí Minh sau sáp nhập khoảng bao nhiêu người?",
    options: [
      "Hơn 14 triệu người",
      "Hơn 12 triệu người",
      "Hơn 15 triệu người",
      "Hơn 13 triệu người"
    ],
    correct: 0 // A
  }
];

const TOTAL = QUESTIONS.length;

function getAttempts() {
  try {
    return (JSON.parse(sessionStorage.getItem(BT_KEY)) || {})[GAME_ID]?.attempts || 0;
  } catch {
    return 0;
  }
}

function incrementAttempts() {
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    prev.attempts += 1;
    data[GAME_ID] = prev;
    sessionStorage.setItem(BT_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function syncProgress(results) {
  const correctCount = results.filter((r) => r === true).length;
  const score = Math.round((correctCount / TOTAL) * 100);
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    data[GAME_ID] = {
      answered: Math.max(prev.answered || 0, correctCount),
      correctCount: Math.max(prev.correctCount || 0, correctCount),
      score: Math.max(prev.score || 0, score),
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function TroChoiViTri() {
  const [screen, setScreen] = useState("intro"); // intro, play, finish
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState(Array(TOTAL).fill(null)); // true = correct, false = wrong, null = not answered
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [justFinished, setJustFinished] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });
  const finishedRef = useRef(false);

  const correctCount = results.filter((r) => r === true).length;
  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  useEffect(() => {
    document.title = "Cuộc phiêu lưu của táo đỏ - Khám phá TPHCM";
    const saved = sessionStorage.getItem(STATE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScreen(parsed.screen || "intro");
        setCurrentQuestion(parsed.currentQuestion || 0);
        setResults(parsed.results || Array(TOTAL).fill(null));
        finishedRef.current = parsed.finishedOnce || false;
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
        JSON.stringify({ screen, currentQuestion, results, finishedOnce: finishedRef.current })
      );
      syncProgress(results);
    }
  }, [screen, currentQuestion, results, selectedOption]);

  const handleStart = () => {
    if (attemptsLeft <= 0 && !finishedRef.current) {
      setDialog({ open: true, type: "alert", title: "Hết lượt chơi", message: "Bạn đã hết lượt chơi cho trò này!" });
      return;
    }
    setScreen("play");
  };

  const handleSelectOption = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);

    const isCorrect = index === QUESTIONS[currentQuestion].correct;
    setResults(prev => {
        const next = [...prev];
        next[currentQuestion] = isCorrect;
        return next;
    });

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        if (!finishedRef.current) {
          incrementAttempts();
          finishedRef.current = true;
        }
        setJustFinished(true);
        setScreen("finish");
      }
    }, 1500);
  };

  const doRestart = useCallback(() => {
    sessionStorage.removeItem(STATE_KEY);
    finishedRef.current = false;
    setScreen("play");
    setResults(Array(TOTAL).fill(null));
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setJustFinished(false);
  }, []);

  const handleRestart = useCallback(() => {
    const attempts = getAttempts();
    if (attempts >= MAX_ATTEMPTS) {
      setDialog({ open: true, type: "alert", title: "Hết lượt chơi", message: "Bạn đã hết lượt chơi cho trò này!" });
      return;
    }
    const remaining = MAX_ATTEMPTS - attempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      title: "Bắt đầu lượt mới?",
      message: `Đây sẽ là lượt chơi mới, không giữ lại kết quả cũ. Sau lượt này, bạn còn ${remaining} lượt nữa.`,
      action: "restart",
    });
  }, []);

  const closeDialog = useCallback(() => setDialog({ open: false, type: "", title: "", message: "", action: "" }), []);

  const confirmDialog = useCallback(() => {
    if (dialog.action === "restart") doRestart();
    closeDialog();
  }, [dialog, doRestart, closeDialog]);

  if (screen === "finish") {
    const score = Math.round((correctCount / TOTAL) * 100);
    const stars = correctCount >= 4 ? 3 : correctCount >= 3 ? 2 : correctCount >= 1 ? 1 : 0;
    
    return (
      <div className="vt-page">
        {justFinished && correctCount >= 3 && <ConfettiOnMount />}
        <div className="vt-done">
          <div className="vt-done-icon">
            <i className="fa-solid fa-map-location-dot" />
          </div>
          <h2>
            Hoàn thành <span>Cuộc Phiêu Lưu Của Táo Đỏ!</span>
          </h2>
          <p>
            Bạn đã trả lời đúng <strong>{correctCount}/{TOTAL} câu hỏi</strong> trắc nghiệm.
          </p>
          
          <div className="vt-done-stats">
              <div className="vt-done-stat">
                  <div className="vt-done-stat-num">{score}</div>
                  <div className="vt-done-stat-label">Điểm</div>
              </div>
              <div className="vt-done-stat">
                  <div className="vt-done-stat-num">{correctCount}/{TOTAL}</div>
                  <div className="vt-done-stat-label">Chính xác</div>
              </div>
              <div className="vt-done-stat">
                  <div className="vt-done-stat-num">
                      {stars === 3 ? "⭐⭐⭐" : stars === 2 ? "⭐⭐" : stars === 1 ? "⭐" : "—"}
                  </div>
                  <div className="vt-done-stat-label">Đánh giá</div>
              </div>
          </div>

          <div className="vt-done-actions">
            {attemptsLeft > 0 ? (
              <button className="vt-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" /> Chơi lại ({attemptsLeft} lượt)
              </button>
            ) : (
              <span className="vt-btn disabled">
                <i className="fa-solid fa-lock" /> Hết lượt
              </span>
            )}
            <Link to="/bai-tap" className="vt-btn ghost">
              <i className="fa-solid fa-arrow-left" /> Quay về Bài tập
            </Link>
          </div>
        </div>

        {dialog.open && (
            <div className="vt-dialog-overlay" onClick={closeDialog}>
                <div className="vt-dialog" onClick={(e) => e.stopPropagation()}>
                    <h3>{dialog.title}</h3>
                    <p>{dialog.message}</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                        {dialog.type === "confirm" && (
                            <button className="vt-dlg-btn ghost" onClick={closeDialog}>
                                Hủy
                            </button>
                        )}
                        <button className="vt-dlg-btn blue" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                            {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="vt-page">
      <div className="vt-topbar">
        <div className="vt-topbar-left">
            <Link to="/bai-tap" className="vt-back">
                <i className="fa-solid fa-arrow-left" />
            </Link>
            <div>
                <h1>
                    <i className="fa-solid fa-map-location-dot" /> Cuộc Phiêu Lưu Của Táo Đỏ
                </h1>
                <p>Khám phá vị trí địa lý của Thành phố Hồ Chí Minh</p>
            </div>
        </div>
        <div className="vt-topbar-right">
            <div className="vt-chip vt-chip-score">
                <i className="fa-solid fa-circle-check" /> Đúng: {correctCount}/{currentQuestion}
            </div>
            {screen === "play" && (
              <button className="vt-chip" onClick={handleRestart} style={{cursor: "pointer", border: "1px dashed #3b82f6"}} title="Chơi lại từ đầu">
                  <i className="fa-solid fa-rotate" /> {getAttempts()}/{MAX_ATTEMPTS}
              </button>
            )}
        </div>
      </div>

      {screen === "intro" && (
        <section className="vt-stage vt-intro-stage">
            <div className="vt-intro-card">
              <div className="vt-intro-icon-large">
                <i className="fa-solid fa-earth-asia" />
              </div>
              <h2>Chào mừng bạn đến với Bài tập Vị trí</h2>
              <p>Bạn sẽ trả lời {TOTAL} câu hỏi trắc nghiệm liên quan đến vị trí địa lý của TP.HCM sau sáp nhập. Hãy đọc kỹ các lựa chọn và bấm vào đáp án đúng nhất nhé!</p>
              <button className="vt-btn primary" onClick={handleStart}>
                <i className="fa-solid fa-play" /> Bắt đầu chơi ngay
              </button>
            </div>
        </section>
      )}

      {screen === "play" && (
        <section className="vt-stage vt-play">
            <div className="vt-game-layout">
                {/* Board: Question & Options */}
                <div className="vt-board-container">
                    <div className="vt-question-box">
                      <span className="vt-q-badge" style={{marginBottom: "10px", display: "inline-block"}}>Câu hỏi {currentQuestion + 1}/{TOTAL}</span>
                      <h3 className="vt-question-text">{QUESTIONS[currentQuestion].question}</h3>
                    </div>
                    
                    <div className="vt-options-grid">
                      {QUESTIONS[currentQuestion].options.map((opt, i) => {
                        const isSelected = selectedOption === i;
                        const isCorrectResp = showFeedback && i === QUESTIONS[currentQuestion].correct;
                        const isWrongResp = showFeedback && isSelected && !isCorrectResp;
                        let btnClass = "vt-option-item";
                        if (isSelected) btnClass += " selected";
                        if (isCorrectResp) btnClass += " correct";
                        if (isWrongResp) btnClass += " wrong";
                        if (showFeedback && !isSelected && !isCorrectResp) btnClass += " disabled";

                        return (
                          <button
                            key={i}
                            className={btnClass}
                            onClick={() => handleSelectOption(i)}
                            disabled={showFeedback}
                          >
                            <span className="vt-opt-letter">{["A", "B", "C", "D"][i]}</span>
                            <span className="vt-opt-text">{opt}</span>
                            {isCorrectResp && <i className="fa-solid fa-circle-check vt-opt-icon" />}
                            {isWrongResp && <i className="fa-solid fa-circle-xmark vt-opt-icon" />}
                          </button>
                        );
                      })}
                    </div>
                </div>

                {/* Sidebar: Progress */}
                <div className="vt-sidebar">
                    <h3 className="vt-sidebar-title">Tiến trình bài tập</h3>
                    <ul className="vt-q-list">
                        {QUESTIONS.map((q, i) => {
                            const isPast = i < currentQuestion;
                            const isCurrent = i === currentQuestion;
                            const statusObj = results[i]; // true, false, null

                            let liClass = "vt-q-item";
                            if (isCurrent) liClass += " active";
                            
                            let icon = <i className="fa-regular fa-circle vt-q-uncheck"></i>;
                            if (statusObj === true) {
                              liClass += " found";
                              icon = <i className="fa-solid fa-check-circle vt-q-check"></i>;
                            } else if (statusObj === false) {
                              liClass += " incorrect";
                              icon = <i className="fa-solid fa-times-circle vt-q-cross"></i>;
                            } else if (isCurrent) {
                              icon = <i className="fa-solid fa-dot-circle vt-q-current"></i>;
                            }

                            return (
                                <li key={q.id} className={liClass}>
                                    {icon}
                                    <span>Câu hỏi {i + 1}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
      )}

      {dialog.open && (
        <div className="vt-dialog-overlay" onClick={closeDialog}>
            <div className="vt-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>{dialog.title}</h3>
                <p>{dialog.message}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                    {dialog.type === "confirm" && (
                        <button className="vt-dlg-btn ghost" onClick={closeDialog}>
                            Hủy
                        </button>
                    )}
                    <button className="vt-dlg-btn blue" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                        {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
