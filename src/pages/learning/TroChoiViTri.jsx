import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

// Hàm phát âm thanh
const playAudio = (type) => {
  const audioMap = {
    start: "/audio/start.mp3",
    correct: "/audio/correct.mp3",
    wrong: "/audio/wrong.mp3",
    finish: "/audio/finish.mp3",
  };
  const path = audioMap[type];
  if (path) {
    const audio = new Audio(path);
    audio.play().catch(e => console.log("Audio play failed:", e));
  }
};

const ASSETS = {
  nen1: "/images/tro_choi/vi_tri/nen.png",
  nen3: "/images/tro_choi/vi_tri/nen.png",
  taoIdle: "/images/tro_choi/vi_tri/tao_do.png",
  taoRun: "/images/tro_choi/vi_tri/tao_do_di_chuyen.gif",
  taoWait: "/images/tro_choi/vi_tri/tao_do_di_chuyen_xong.gif",
  taoAtk: "/images/tro_choi/vi_tri/tao_do_tan_cong.gif",
  obstacles: [
    "/images/tro_choi/vi_tri/chuong_ngai_1.png",
    "/images/tro_choi/vi_tri/chuong_ngai_2.png",
    "/images/tro_choi/vi_tri/chuong_ngai_3.png",
    "/images/tro_choi/vi_tri/chuong_ngai_4.png",
    "/images/tro_choi/vi_tri/chuong_ngai_5.png",
  ]
};

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

function loadState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
}

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
  const answered = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const score = Math.round((correctCount / TOTAL) * 100);
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    data[GAME_ID] = {
      answered: Math.max(prev.answered || 0, answered),
      correctCount: Math.max(prev.correctCount || 0, correctCount),
      score: Math.max(prev.score || 0, score),
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function TroChoiViTri() {
  const saved = useMemo(() => loadState(), []);

  const [screen, setScreen] = useState(saved?.screen ?? "intro"); // intro, story, play, finish
  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [results, setResults] = useState(() => saved?.results ?? Array(TOTAL).fill(null));

  // Anim state specifically for 'play'
  const [animState, setAnimState] = useState(saved?.animState ?? "moving"); // moving, idle, attacking, broken
  const [picked, setPicked] = useState(saved?.picked ?? null);
  const [reveal, setReveal] = useState(saved?.reveal ?? false);
  const [showNextObj, setShowNextObj] = useState(saved?.showNextObj ?? false); // Currently wait for user to click next
  const [justFinished, setJustFinished] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });

  const finishedRef = useRef(saved?.finishedOnce ?? false);

  const correctCount = results.filter((r) => r === true).length;
  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  useEffect(() => {
    document.body.classList.add("page-tro-choi-vi-tri-active");
    return () => {
      document.body.classList.remove("page-tro-choi-vi-tri-active");
    };
  }, []);

  useEffect(() => {
    saveState({ screen, currentQ, results, animState, picked, reveal, showNextObj, finishedOnce: finishedRef.current });
    syncProgress(results);
  }, [screen, currentQ, results, animState, picked, reveal, showNextObj]);

  // Rút ngắn thời gian chạy của Táo xuống còn 1.2s vì chướng ngại vật gần hơn
  useEffect(() => {
    if (screen === 'play' && animState === 'moving') {
      const timer = setTimeout(() => {
        setAnimState("idle");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [screen, animState, currentQ]);

  const handleStart = () => {
    if (attemptsLeft <= 0 && !finishedRef.current) {
      setDialog({ open: true, type: "alert", title: "Hết lượt chơi", message: "Bạn đã hết lượt chơi cho trò này!" });
      return;
    }
    playAudio("start");
    setScreen("story");
  };

  const handleContinueToPlay = () => {
    setScreen("play");
    setAnimState("moving");
  };

  const advanceQuestion = () => {
    if (currentQ < TOTAL - 1) {
      setCurrentQ(q => q + 1);
      setPicked(null);
      setReveal(false);
      setShowNextObj(false);
      setAnimState("moving"); // Chạy qua chướng ngại tiếp theo
    } else {
      if (!finishedRef.current) {
        incrementAttempts();
        finishedRef.current = true;
      }
      playAudio("finish");
      setJustFinished(true);
      setScreen("finish");
    }
  };

  const handleChoose = useCallback((idx) => {
    if (reveal || animState !== "idle") return; // Ngăn bấm lúc đang chạy
    setPicked(idx);
    setReveal(true);

    const isCorrect = idx === QUESTIONS[currentQ].correct;
    setResults(prev => {
      const next = [...prev];
      next[currentQ] = isCorrect;
      return next;
    });

    if (isCorrect) {
      playAudio("correct");
      setAnimState("attacking");
      // Tấn công 1s, rồi bể chướng ngại -> thả ra nút chuyển câu
      setTimeout(() => {
        setAnimState("broken"); // táo red idle lại, chướng ngại bể
        setShowNextObj(true);
      }, 1000);
    } else {
      playAudio("wrong");
      // Bấm sai -> táo đỏ k làm gì, chỉ báo sai
      setAnimState("idle");
      setShowNextObj(true);
    }
  }, [reveal, animState, currentQ]);

  const doRestart = useCallback(() => {
    sessionStorage.removeItem(STATE_KEY);
    finishedRef.current = false;
    setScreen("story");
    setResults(Array(TOTAL).fill(null));
    setCurrentQ(0);
    setPicked(null);
    setReveal(false);
    setShowNextObj(false);
    setAnimState("moving");
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
      title: "Chơi lại từ đầu?",
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

    return (
      <div className="vt-page finish-page-new" style={{ backgroundImage: `url(${ASSETS.nen3})` }}>
        {justFinished && correctCount >= 3 && <ConfettiOnMount />}

        <div className="vt-topbar">
          <div className="vt-topbar-left">
            <Link to="/bai-tap" className="vt-back">
              <i className="fa-solid fa-arrow-left" />
            </Link>
            <div className="vt-topbar-title">
              <h1>
                <i className="fa-solid fa-apple-whole" /> Cuộc Phiêu Lưu Của Táo Đỏ
              </h1>
              <p>Khám phá Hành chính Thành phố Hồ Chí Minh</p>
            </div>
          </div>
          <div className="vt-topbar-right">
            <div className="vt-chip">
              <i className="fa-solid fa-circle-question" style={{ color: '#007bff' }} /> Tiến độ: {TOTAL}/{TOTAL}
            </div>
            <div className="vt-chip">
              <i className="fa-solid fa-rotate" style={{ color: '#f59e0b' }} /> Lượt chơi: {getAttempts()}/{MAX_ATTEMPTS}
            </div>
          </div>
        </div>

        <section className="vt-stage vt-finish-new">
          <div className="vt-scene-area" style={{ height: '350px' }}>
            <div className="vt-apple idle" style={{ left: '45%' }}>
              <img src={ASSETS.taoWait} alt="Táo Đỏ" />
            </div>
          </div>

          <div className="vt-done">
            <div className="vt-finish-badge">
              <i className="fa-solid fa-flag-checkered" /> Vế đích thành công!
            </div>
            <h2>Tuyệt vời!</h2>
            <p>
              Bạn đã đến nơi rồi, cảm ơn các bạn rất nhiều vì đã giúp mình vượt qua các chướng ngại vật nhé!
            </p>

            <div className="vt-done-stats">
              <div className="vt-done-stat">
                <div className="vt-done-stat-num">{score}</div>
                <div className="vt-done-stat-label">Điểm</div>
              </div>
              <div className="vt-done-stat">
                <div className="vt-done-stat-num">{correctCount}/{TOTAL}</div>
                <div className="vt-done-stat-label">Câu đúng</div>
              </div>
            </div>

            <div className="vt-done-actions">
              <button className="vt-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" /> Bắt đầu lượt chơi mới
              </button>
              <Link to="/bai-tap" className="vt-btn ghost">
                <i className="fa-solid fa-list" /> Danh sách bài tập
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  /* ── UI RENDER ── */
  return (
    <div className="vt-page" style={{ backgroundImage: `url(${ASSETS.nen3})` }}>
      {screen !== "intro" && (
        <div className="vt-topbar">
          <div className="vt-topbar-left">
            <Link to="/bai-tap" className="vt-back">
              <i className="fa-solid fa-arrow-left" />
            </Link>
            <div className="vt-topbar-title">
              <h1>
                <i className="fa-solid fa-apple-whole" /> Cuộc Phiêu Lưu Của Táo Đỏ
              </h1>
              <p>Khám phá Hành chính Thành phố Hồ Chí Minh</p>
            </div>
          </div>
          <div className="vt-topbar-right">
            <div className="vt-chip">
              <i className="fa-solid fa-circle-question" style={{ color: '#007bff' }} /> Tiến độ: {currentQ + (screen === 'play' && reveal ? 1 : 0)}/{TOTAL}
            </div>
            <div className="vt-chip">
              <i className="fa-solid fa-rotate" style={{ color: '#f59e0b' }} /> Lượt chơi: {getAttempts()}/{MAX_ATTEMPTS}
            </div>
          </div>
        </div>
      )}

      {screen === "intro" && (
        <div className="vt-page intro-page-wrap" style={{
          backgroundImage: `url(${ASSETS.nen1})`,
          position: 'absolute',
          inset: 0,
          paddingBottom: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <section className="vt-stage vt-intro">
            <div className="vt-intro-card">
              <div className="vt-intro-content">
                <h2 style={{ fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>Khởi hành!</h2>
                <p style={{ fontSize: '1.3rem' }}>Cùng tham gia vào <strong>Cuộc Phiêu Lưu Của Táo Đỏ</strong>. Vượt qua các câu hỏi hóc búa để phá tan chướng ngại vật nhé!</p>
                <button className="vt-btn primary vt-big-btn" onClick={handleStart} style={{ padding: '20px 50px', fontSize: '1.4rem' }}>
                  <i className="fa-solid fa-play" /> Bắt đầu phiêu lưu
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {screen === "story" && (
        <section className="vt-stage vt-story-new">
          <div className="vt-scene-area" style={{ height: '350px' }}>
            <div className="vt-apple idle" style={{ left: '15%' }}>
              <img src={ASSETS.taoWait} alt="Táo Đỏ" />
            </div>
          </div>
          <div className="vt-story-layout">
            <div className="vt-story-bubble-new">
              <p>Mình đang trên đường phiêu lưu đến vùng đất thần kì. Nhưng trên đường đi mình gặp rất nhiều chướng ngại vật.</p>
              <p>Các bạn hãy giải đáp những câu hỏi để loại bỏ các chướng ngại vật đó giúp mình nhé!</p>
              <button className="vt-btn primary" onClick={handleContinueToPlay} style={{ marginTop: '20px' }}>
                <i className="fa-solid fa-arrow-right" /> Lên đường thôi!
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "play" && (
        <section className="vt-stage vt-play">
          <div className="vt-board-area">
            <div className="vt-question-board">
              <div className="vt-qb-badge"><i className="fa-solid fa-star" /> Câu hỏi {currentQ + 1}</div>
              <h3>{q.question}</h3>
            </div>

            <div className="vt-options-grid">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrectOption = i === q.correct;

                let cls = "vt-option-board";
                if (reveal) {
                  if (isPicked && isCorrectOption) cls += " correct";
                  else if (isPicked && !isCorrectOption) cls += " wrong";
                  else if (isCorrectOption) cls += " missed";
                  else cls += " disabled";
                } else if (animState === "moving") {
                  cls += " locked";
                }

                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => handleChoose(i)}
                    disabled={reveal || animState !== "idle"}
                  >
                    <div className="vt-opt-icon-wrap">
                      {reveal && isPicked && isCorrectOption && <i className="fa-solid fa-check" />}
                      {reveal && isPicked && !isCorrectOption && <i className="fa-solid fa-xmark" />}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Nút tiếp tục xuất hiện khi user chọn xong thay vì tự động chạy */}
            {showNextObj && (
              <div className="vt-next-btn-wrap">
                <button className="vt-btn primary animate-pop" onClick={advanceQuestion}>
                  {currentQ < TOTAL - 1 ? "Đến chướng ngại vật tiếp theo" : "Xem kết quả cuối cùng"}
                  <i className="fa-solid fa-chevron-right" style={{ marginLeft: "8px" }} />
                </button>
              </div>
            )}
          </div>

          <div className="vt-scene-area">
            {/* Táo Đỏ */}
            <div className={`vt-apple ${animState}`}>
              {animState === "moving" && <img src={ASSETS.taoRun} alt="Chạy" />}
              {(animState === "idle" || animState === "broken") && <img src={ASSETS.taoWait} alt="Chờ" />}
              {animState === "attacking" && <img src={ASSETS.taoAtk} alt="Đánh" className="vt-atk-blend" />}
            </div>

            {/* Chướng ngại vật */}
            <div className={`vt-obstacle ${animState === "broken" ? "broken-state" : (animState === "attacking" ? "breaking" : "")}`}>
              <img src={ASSETS.obstacles[currentQ % 5]} alt="Chướng ngại vật" />
            </div>
          </div>
        </section>
      )}

      {dialog.open && (
        <div className="vt-dialog-overlay" onClick={closeDialog}>
          <div className="vt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div className="vt-dlg-actions">
              {dialog.type === "confirm" && (
                <button className="vt-dlg-btn ghost" onClick={closeDialog}>Hủy</button>
              )}
              <button className="vt-dlg-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
