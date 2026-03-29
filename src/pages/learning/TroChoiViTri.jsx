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
const AUDIO_MAP = {
  start: "/audio/start.mp3",
  correct: "/audio/correct.mp3",
  wrong: "/audio/wrong.wav",
  finish: "/audio/finish.mp3",
  attack: "/audio/attack.wav",
};

const playAudio = (type) => {
  const path = AUDIO_MAP[type];
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
    question: "Quy mô dân số của TP. Hồ Chí Minh sau sáp nhập khoảng bao nhiêu người?",
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
  const [showObstacle, setShowObstacle] = useState(true); // New state to hide old obstacle during transition
  const [justFinished, setJustFinished] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });

  const finishedRef = useRef(saved?.finishedOnce ?? false);
  const bgmRef = useRef(null);

  const playBGM = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(AUDIO_MAP.start);
      bgmRef.current.loop = true;
    }
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(e => console.log("BGM auto-play blocked by browser."));
    }
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  }, []);

  const correctCount = results.filter((r) => r === true).length;
  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  useEffect(() => {
    document.body.classList.add("page-tro-choi-vi-tri-active");
    return () => {
      document.body.classList.remove("page-tro-choi-vi-tri-active");
      stopBGM(); // Dừng nhạc khi thoát khỏi trang
    };
  }, [stopBGM]);

  // Tự động phát lại nhạc nền nếu đang trong game
  useEffect(() => {
    if (screen === "story" || screen === "play") {
      playBGM();
    }
  }, [screen, playBGM]);

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
    playBGM(); // Phát nhạc nền thay cho playAudio("start")
    setScreen("story");
  };

  const handleContinueToPlay = () => {
    setScreen("play");
    setAnimState("moving");
  };

  const advanceQuestion = () => {
    if (!showNextObj) return; // Chặn nhấn liên tục
    setShowNextObj(false); // Ẩn nút ngay để không bị nhấn lần 2
    setShowObstacle(false); // Ẩn vật cũ
    const isCorrect = results[currentQ] === true;

    if (isCorrect) {
      // Nếu đúng thì chạy qua phải rồi mới sang câu mới
      setAnimState("leaving");
      setTimeout(() => {
        if (currentQ < TOTAL - 1) {
          setCurrentQ(q => q + 1);
          setPicked(null);
          setReveal(false);
          setAnimState("moving");
          // Hiện lại vật mới sau khi bắt đầu chạy một chút
          setTimeout(() => setShowObstacle(true), 100);
        } else {
          finishGame();
        }
      }, 800);
    } else {
      // Nếu sai thì đứng yên rồi chuyển câu mới
      if (currentQ < TOTAL - 1) {
        setCurrentQ(q => q + 1);
        setPicked(null);
        setReveal(false);
        setAnimState("moving");
        setTimeout(() => setShowObstacle(true), 100);
      } else {
        finishGame();
      }
    }
  };

  const finishGame = () => {
    if (!finishedRef.current) {
      incrementAttempts();
      finishedRef.current = true;
    }
    stopBGM(); // Dừng nhạc nền
    playAudio("finish");
    setJustFinished(true);
    setScreen("finish");
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
      setTimeout(() => playAudio("attack"), 100); // Phát tiếng tấn công sau tiếng correct một chút
      setAnimState("attacking");
      // Tăng thời gian tấn công lên một chút hoặc căn chỉnh để bớt "ảo"
      setTimeout(() => {
        setAnimState("broken"); // Chuyển sang trạng thái đã phá vỡ
        setShowNextObj(true);
      }, 400); // Rút ngắn lại để khớp với Dash của CSS (0.4s)
    } else {
      playAudio("wrong");
      // Bấm sai -> táo đỏ k làm gì, chỉ báo sai
      setAnimState("idle");
      setShowNextObj(true);
    }
  }, [reveal, animState, currentQ]);

  const doRestart = useCallback(() => {
    stopBGM();
    sessionStorage.removeItem(STATE_KEY);
    finishedRef.current = false;
    setScreen("story");
    setResults(Array(TOTAL).fill(null));
    setCurrentQ(0);
    setPicked(null);
    setReveal(false);
    setShowNextObj(false);
    setShowObstacle(true);
    setAnimState("moving");
    setJustFinished(false);
    playBGM(); // Phát lại từ đầu nếu chơi lại
  }, [playBGM, stopBGM]);

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
    const stars = correctCount === TOTAL ? 3 : (correctCount >= 3 ? 2 : (correctCount >= 1 ? 1 : 0));

    let greeting = "Cố gắng lên!";
    let message = "Táo Đỏ vẫn cần bạn giúp sức thêm để vượt qua các chướng ngại vật đấy. Đừng bỏ cuộc nhé!";
    if (stars === 3) {
      greeting = "Xuất sắc!";
      message = "Bạn là một nhà thám hiểm tài ba! Táo Đỏ đã về đích an toàn nhờ sự thông minh của bạn.";
    } else if (stars === 2) {
      greeting = "Làm tốt lắm!";
      message = "Bạn đã giúp Táo Đỏ vượt qua hầu hết các thử thách. Một chút nữa thôi là hoàn hảo rồi!";
    }

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
                <i className="fa-solid fa-apple-whole" /> CUỘC PHIÊU LƯU CỦA TÁO ĐỎ
              </h1>
              <p>Chúc mừng bạn đã hoàn thành chuyến đi!</p>
            </div>
          </div>
          <div className="vt-topbar-right">
            <div className="vt-chip">
              <i className="fa-solid fa-circle-question" style={{ color: '#007bff' }} /> {TOTAL}/{TOTAL}
            </div>
            <div className="vt-chip">
              <i className="fa-solid fa-rotate" style={{ color: '#f59e0b' }} /> {getAttempts()}/{MAX_ATTEMPTS}
            </div>
          </div>
        </div>

        <section className="vt-stage vt-finish-new">
          <div className="vt-finish-center">
            <div className="vt-done">
              <div className="vt-stars">
                {[1, 2, 3].map((s) => (
                  <i
                    key={s}
                    className={`fa-solid fa-star vt-star-item ${s <= stars ? 'active' : ''}`}
                    style={{ animationDelay: `${s * 0.15}s` }}
                  />
                ))}
              </div>

              <div className="vt-finish-apple-mini">
                <img src={ASSETS.taoWait} alt="Táo Đỏ" />
              </div>

              <h2>{greeting}</h2>
              <p>{message}</p>

              <div className="vt-done-stats">
                <div className="vt-done-stat" style={{ animationDelay: '0.5s' }}>
                  <div className="vt-done-stat-label">Điểm số</div>
                  <div className="vt-done-stat-num">{score}</div>
                </div>
                <div className="vt-done-stat" style={{ animationDelay: '0.6s' }}>
                  <div className="vt-done-stat-label">Câu đúng</div>
                  <div className="vt-done-stat-num">{correctCount}/{TOTAL}</div>
                </div>
              </div>

              <div className="vt-done-actions">
                <button
                  className="vt-btn primary"
                  onClick={handleRestart}
                  style={{ background: 'linear-gradient(135deg, #ff4d4d, #dc3545)' }}
                >
                  <i className="fa-solid fa-rotate-right" /> Chơi lại lần nữa
                </button>
                <Link to="/bai-tap" className="vt-btn ghost">
                  <i className="fa-solid fa-house" /> Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </section>

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

  const q = QUESTIONS[currentQ];
  const progressValue = screen === "intro" || screen === "story"
    ? 0
    : currentQ + (screen === "play" && reveal ? 1 : 0);

  /* ── UI RENDER ── */
  return (
    <div className="vt-page" style={{ backgroundImage: `url(${ASSETS.nen3})` }}>
      {screen !== "finish" && (
        <div className="vt-topbar">
          <div className="vt-topbar-left">
            <Link to="/bai-tap" className="vt-back">
              <i className="fa-solid fa-arrow-left" />
            </Link>
            <div className="vt-topbar-title">
              <h1>
                <i className="fa-solid fa-apple-whole" /> CUỘC PHIÊU LƯU CỦA TÁO ĐỎ
              </h1>
              <p>Hãy giải đố để giúp Táo Đỏ vượt qua chướng ngại vật nhé!</p>
            </div>
          </div>
          <div className="vt-topbar-right">
            <div className="vt-chip">
              <i className="fa-solid fa-circle-question" style={{ color: '#007bff' }} /> {progressValue}/{TOTAL}
            </div>
            <div className="vt-chip">
              <i className="fa-solid fa-rotate" style={{ color: '#f59e0b' }} /> {getAttempts()}/{MAX_ATTEMPTS}
            </div>
          </div>
        </div>
      )}

      {screen === "intro" && (
        <section className="vt-stage vt-intro">
          <div className="vt-intro-main-row">
            <div className="vt-intro-sign-wrap">
              <div className="vt-intro-sign">
                <span>Cuộc Phiêu Lưu Của</span>
                <strong>Táo Đỏ</strong>
              </div>
              <div className="vt-intro-actions">
                <button className="vt-btn primary vt-big-btn" onClick={handleStart}>
                  <i className="fa-solid fa-play" /> Bắt đầu phiêu lưu
                </button>
              </div>
            </div>

            <div className="vt-intro-apple">
              <img src={ASSETS.taoIdle} alt="Táo Đỏ" />
            </div>
          </div>
        </section>
      )}

      {screen === "story" && (
        <section className="vt-stage vt-story-new">
          <div className="vt-story-layout">
            <div className="vt-story-apple">
              <img src={ASSETS.taoWait} alt="Táo Đỏ" />
            </div>
            <div className="vt-story-bubble-new">
              <p>
                Mình đang trên đường phiêu lưu đến vùng đất thần kì.
                Nhưng trên đường đi mình gặp rất nhiều chướng ngại vật.
                Các bạn hãy giải đáp những câu hỏi để loại bỏ các chướng ngại vật đó giúp mình nhé!
              </p>
              <button className="vt-btn primary" onClick={handleContinueToPlay}>
                <i className="fa-solid fa-arrow-right" /> Lên đường thôi!
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "play" && (
        <section className="vt-stage vt-play">
          <div className="vt-play-frame">
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
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="vt-next-btn-wrap">
                {showNextObj && (
                  <button className="vt-btn primary animate-pop" onClick={advanceQuestion}>
                    {currentQ < TOTAL - 1 ? "Đến chướng ngại vật tiếp theo" : "Xem kết quả cuối cùng"}
                    <i className="fa-solid fa-chevron-right" style={{ marginLeft: "8px" }} />
                  </button>
                )}
              </div>
            </div>

            <div className="vt-scene-area">
              <div className={`vt-apple ${animState}`}>
                {animState === "moving" && <img src={ASSETS.taoRun} alt="Chạy" />}
                {(animState === "idle" || animState === "broken") && <img src={ASSETS.taoWait} alt="Chờ" />}
                {animState === "attacking" && (
                  <>
                    <img src={ASSETS.taoAtk} alt="Đánh" className="vt-atk-blend" />
                    <div className="vt-attack-swipe" aria-hidden="true" />
                  </>
                )}
              </div>

              <div
                className={`vt-obstacle ${["broken", "leaving"].includes(animState) ? "broken-state" : (animState === "attacking" ? "breaking" : "")}`}
                style={{ display: showObstacle ? "block" : "none" }}
              >
                <img src={ASSETS.obstacles[currentQ % 5]} alt="Chướng ngại vật" />
              </div>
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
