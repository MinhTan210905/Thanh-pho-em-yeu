import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiDiaLiTuNhien.css";

function ConfettiOnMount() {
  useEffect(() => { 
    const randomType = Math.floor(Math.random() * 3) + 1;
    fireConfetti(randomType); 
  }, []);
  return null;
}

const QUESTIONS = [
  {
    question: "Các dạng địa hình chính của Thành phố Hồ Chí Minh?",
    options: [
      "Đồng bằng thấp, trũng, đầm lầy; Gò cao lượn sóng; Đồng bằng phẳng, thấp; Đồi núi thấp; Địa hình ven biển.",
      "Đồng bằng thấp, trũng, đầm lầy; Gò cao lượn sóng; Đồng bằng phẳng, thấp; Đồi núi cao; Địa hình ven biển.",
      "Đồng bằng thấp; Gò cao lượn sóng; Đồng bằng phẳng, thấp; Đồi núi thấp; Địa hình ven biển.",
      "Đồng bằng thấp, trũng, đầm lầy; Cao nguyên; Đồng bằng phẳng, thấp; Đồi núi thấp; Địa hình ven biển.",
    ],
    correctIndex: 0,
  },
  {
    question: "Thành phố Hồ Chí Minh có bao nhiêu mùa trong năm?",
    options: ["1", "2", "3", "4"],
    correctIndex: 1,
  },
  {
    question: "Những dòng sông nào chảy qua Thành phố Hồ Chí Minh?",
    options: [
      "Sông Sài Gòn, Sông Hồng",
      "Sông Đồng Nai, Sông Hồng",
      "Sông Sài Gòn, Sông Đồng Nai",
      "Sông Hồng, Sông Hương",
    ],
    correctIndex: 2,
  },
  {
    question: "Bãi Trước còn có tên gọi khác là gì?",
    options: ["Tầm Dương", "Thuỳ Vân", "Mũi Né", "Tuần Châu"],
    correctIndex: 0,
  },
  {
    question: "Bãi Sau còn có tên gọi khác là gì?",
    options: ["Tầm Dương", "Thuỳ Vân", "Mũi Né", "Tuần Châu"],
    correctIndex: 1,
  },
  {
    question: "Nơi nào ở Thành phố Hồ Chí Minh được UNESCO công nhận là Khu dự trữ sinh quyển thế giới?",
    options: [
      "Vườn chim Thủ Đức",
      "Rừng nguyên sinh Núi Cậu",
      "Rừng nguyên sinh Kiến An",
      "Rừng ngập mặn Cần Giờ",
    ],
    correctIndex: 3,
  },
  {
    question: "Nền địa chất của Thành phố Hồ Chí Minh có đặc điểm gì?",
    options: [
      "Không ổn định",
      "Dễ sạt lở",
      "Ổn định và có độ chịu lực cao",
      "Chủ yếu là đầm lầy",
    ],
    correctIndex: 2,
  },
  {
    question: "Khoáng sản có vai trò như thế nào đối với Thành phố?",
    options: [
      "Không quan trọng",
      "Chỉ dùng để trang trí",
      "Là nguồn tài nguyên quan trọng thúc đẩy kinh tế",
      "Chỉ phục vụ sinh hoạt gia đình",
    ],
    correctIndex: 2,
  },
  {
    question: "Đất phù sa có đặc điểm gì nổi bật?",
    options: [
      "Khô cằn, ít chất dinh dưỡng",
      "Độ phì nhiêu cao",
      "Nhiều sỏi đá",
      "Khó trồng cây",
    ],
    correctIndex: 1,
  },
  {
    question: "Vì sao đất phèn khó trồng cây khi chưa cải tạo?",
    options: [
      "Vì đất quá khô",
      "Vì đất rất chua và nghèo dinh dưỡng",
      "Vì đất quá nhiều nước",
      "Vì đất có nhiều đá",
    ],
    correctIndex: 1,
  },
];

const BAG_COLORS = [
  {
    id: "cam",
    label: "Cam",
    accent: "#f59e0b",
    full: "/images/tro_choi/dia_li_tu_nhien/tui_mu_cam.png",
    left: "/images/tro_choi/dia_li_tu_nhien/tui_mu_cam_trai.png",
    right: "/images/tro_choi/dia_li_tu_nhien/tui_mu_cam_phai.png",
  },
  {
    id: "hong",
    label: "Hồng",
    accent: "#fb7185",
    full: "/images/tro_choi/dia_li_tu_nhien/tui_mu_hong.png",
    left: "/images/tro_choi/dia_li_tu_nhien/tui_mu_hong_trai.png",
    right: "/images/tro_choi/dia_li_tu_nhien/tui_mu_hong_phai.png",
  },
  {
    id: "tim",
    label: "Tím",
    accent: "#a855f7",
    full: "/images/tro_choi/dia_li_tu_nhien/tui_mu_tim.png",
    left: "/images/tro_choi/dia_li_tu_nhien/tui_mu_tim_trai.png",
    right: "/images/tro_choi/dia_li_tu_nhien/tui_mu_tim_phai.png",
  },
  {
    id: "xanh",
    label: "Xanh",
    accent: "#22c55e",
    full: "/images/tro_choi/dia_li_tu_nhien/tui_mu_xanh.png",
    left: "/images/tro_choi/dia_li_tu_nhien/tui_mu_xanh_trai.png",
    right: "/images/tro_choi/dia_li_tu_nhien/tui_mu_xanh_phai.png",
  },
];

const TOTAL = QUESTIONS.length;
const STATE_KEY = "tc_dia_li_tu_nhien_state_v2";
const BT_KEY = "bt_game_progress";
const GAME_ID = "tro-choi-dia-li-tu-nhien";
const MAX_ATTEMPTS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildColorSequence() {
  const base = BAG_COLORS.map((c) => c.id);
  const colors = [...base, ...base];
  while (colors.length < TOTAL) {
    colors.push(base[Math.floor(Math.random() * base.length)]);
  }
  let candidate = colors;
  for (let i = 0; i < 40; i++) {
    candidate = shuffle(candidate);
    let ok = true;
    for (let j = 1; j < candidate.length; j++) {
      if (candidate[j] === candidate[j - 1]) {
        ok = false;
        break;
      }
    }
    if (ok) return candidate;
  }
  return shuffle(candidate);
}

function initBags(questionOrder) {
  const colors = buildColorSequence();
  return colors.map((colorId, idx) => ({
    id: `bag-${idx}`,
    questionIndex: questionOrder[idx],
    colorId,
    status: "closed",
  }));
}

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
  const score = correctCount * 10;
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

function playRipSound(audioCtxRef) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
  const ctx = audioCtxRef.current;
  if (ctx.state === "suspended") ctx.resume();

  const duration = 0.18;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 700;

  source.buffer = buffer;
  gain.gain.value = 0.45;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
  source.stop(ctx.currentTime + duration);
}

export default function TroChoiDiaLiTuNhien() {
  const saved = useMemo(() => loadState(), []);
  const [questionOrder] = useState(() => saved?.questionOrder || shuffle(QUESTIONS.map((_, i) => i)));
  const [bags, setBags] = useState(() => saved?.bags || initBags(questionOrder));
  const [stage, setStage] = useState(() => saved?.stage || "bags");
  const [activeBagId, setActiveBagId] = useState(() => saved?.activeBagId ?? null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(() => saved?.results || Array(TOTAL).fill(null));
  const [dialog, setDialog] = useState({ open: false, message: "" });
  const audioCtxRef = useRef(null);
  const finishedRef = useRef(
    saved?.results ? saved.results.filter((r) => r !== null).length === TOTAL : false
  );
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    document.body.classList.add("page-tro-choi-dlt-active");
    return () => document.body.classList.remove("page-tro-choi-dlt-active");
  }, []);

  const answeredCount = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const allDone = answeredCount === TOTAL;

  const activeBag = bags.find((b) => b.id === activeBagId) || null;
  const currentQuestion = activeBag ? QUESTIONS[activeBag.questionIndex] : null;

  useEffect(() => {
    saveState({ bags, stage, activeBagId, results, questionOrder });
  }, [bags, stage, activeBagId, results]);

  useEffect(() => {
    syncProgress(results);
  }, [results]);

  useEffect(() => {
    if (allDone && !finishedRef.current) {
      incrementAttempts();
      finishedRef.current = true;
      setJustFinished(true);
    }
  }, [allDone]);

  useEffect(() => {
    if (stage === "question") {
      setSelectedAnswer(null);
    }
  }, [stage, activeBagId]);

  const getBagColor = useCallback((colorId) => BAG_COLORS.find((c) => c.id === colorId), []);

  const handleBagClick = useCallback(
    (bagId) => {
      if (stage !== "bags") return;
      const bag = bags.find((b) => b.id === bagId);
      if (!bag || bag.status !== "closed") return;
      playRipSound(audioCtxRef);
      setBags((prev) =>
        prev.map((b) => (b.id === bagId ? { ...b, status: "opening" } : b))
      );
      setActiveBagId(bagId);
      setTimeout(() => setStage("question"), 520);
    },
    [bags, stage]
  );

  const handleAnswer = useCallback(
    (idx) => {
      if (!currentQuestion || selectedAnswer !== null) return;
      const isCorrect = idx === currentQuestion.correctIndex;
      setSelectedAnswer(idx);
      setResults((prev) => {
        const next = [...prev];
        if (activeBag) next[activeBag.questionIndex] = isCorrect;
        return next;
      });
      if (activeBag) {
        setBags((prev) =>
          prev.map((b) => (b.id === activeBag.id ? { ...b, status: "done" } : b))
        );
      }
    },
    [currentQuestion, selectedAnswer, activeBag]
  );

  const handleBackToBags = useCallback(() => {
    if (allDone) {
      setStage("done");
      setJustFinished(true);
      return;
    }
    setStage("bags");
    setActiveBagId(null);
  }, [allDone]);

  const handleQuickComplete = useCallback(() => {
    incrementAttempts();
    setResults(Array(TOTAL).fill(true));
    setBags((prev) => prev.map((b) => ({ ...b, status: "done" })));
    setStage("done");
    setActiveBagId(null);
    setSelectedAnswer(null);
    finishedRef.current = true;
    setJustFinished(true);
  }, []);

  const handleRestart = useCallback(() => {
    const attempts = getAttempts();
    if (attempts >= MAX_ATTEMPTS) {
      setDialog({ open: true, type: "alert", message: "Bạn đã hết lượt chơi cho trò này!" });
      return;
    }
    const remaining = MAX_ATTEMPTS - attempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      message: `Đây sẽ là lượt chơi mới. Sau lượt này, bạn còn ${remaining} lượt nữa.`,
    });
  }, []);

  const closeDialog = useCallback(() => setDialog({ open: false, message: "" }), []);

  const confirmDialog = useCallback(() => {
    if (!finishedRef.current) {
      incrementAttempts();
    }
    const newOrder = shuffle(QUESTIONS.map((_, i) => i));
    setBags(initBags(newOrder));
    setResults(Array(TOTAL).fill(null));
    setStage("bags");
    setActiveBagId(null);
    finishedRef.current = false;
    setJustFinished(false);
    sessionStorage.removeItem(STATE_KEY);
    closeDialog();
  }, [closeDialog]);

  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  return (
    <div className="dlt-page">
      {stage !== "done" && (
        <div className="dlt-topbar">
          <div className="dlt-topbar-left">
            <Link to="/bai-tap" className="dlt-back">
              <i className="fa-solid fa-arrow-left" />
            </Link>
            <div>
              <img
                src="/images/tro_choi/dia_li_tu_nhien/ten_game.png"
                alt="Túi mù bí ẩn"
                className="dlt-title-img"
              />
              <p>Chọn túi mù, xé bí ẩn và trả lời câu hỏi địa lí</p>
            </div>
          </div>
          <div className="dlt-topbar-right">
            <div className="dlt-chip">
              <i className="fa-solid fa-layer-group" />
              {answeredCount}/{TOTAL}
            </div>
            <div className="dlt-chip">
              <i className="fa-solid fa-circle-check" />
              {correctCount}
            </div>
            <button className="dlt-dev-btn" onClick={handleQuickComplete}>
              <i className="fa-solid fa-bolt" />
              Xong nhanh
            </button>
          </div>
        </div>
      )}

      {stage === "bags" && (
        <section className="dlt-bags">
          <div className="dlt-bags-head">
            <h2>Chọn một túi mù để xé</h2>
            <span className="dlt-bags-sub">Còn lại {TOTAL - answeredCount} túi</span>
          </div>
          <div className="dlt-bag-grid">
            {bags.map((bag, idx) => {
              const color = getBagColor(bag.colorId);
              return (
                <button
                  key={bag.id}
                  className={`dlt-bag ${bag.status}`}
                  data-color={bag.colorId}
                  style={{ "--bag-accent": color?.accent }}
                  onClick={() => handleBagClick(bag.id)}
                  disabled={bag.status !== "closed"}
                >
                  <div className="dlt-bag-img">
                    <img className="bag-full" src={color?.full} alt="" />
                    <img className="bag-left" src={color?.left} alt="" />
                    <img className="bag-right" src={color?.right} alt="" />
                  </div>
                  <div className="dlt-bag-label">Túi {idx + 1}</div>
                  {bag.status === "done" && (
                    <div className="dlt-bag-done">
                      <i className="fa-solid fa-check" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {stage === "question" && currentQuestion && (
        <section className="dlt-question">
          <div className="dlt-question-card">
            <div className="dlt-question-label">
              Câu hỏi {activeBag?.questionIndex + 1}/{TOTAL}
            </div>
            <h3>{currentQuestion.question}</h3>
            <div className="dlt-options">
              {currentQuestion.options.map((opt, idx) => {
                const isChosen = selectedAnswer === idx;
                const isCorrect = currentQuestion.correctIndex === idx;
                const showResult = selectedAnswer !== null;
                return (
                  <button
                    key={idx}
                    className={`dlt-option${
                      showResult && isCorrect ? " correct" : ""
                    }${showResult && isChosen && !isCorrect ? " wrong" : ""}${
                      showResult ? " disabled" : ""
                    }`}
                    onClick={() => handleAnswer(idx)}
                  >
                    <span className="dlt-option-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="dlt-option-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="dlt-question-actions">
                <div className={`dlt-result ${selectedAnswer === currentQuestion.correctIndex ? "ok" : "fail"}`}>
                  {selectedAnswer === currentQuestion.correctIndex ? "Đúng rồi!" : "Sai rồi, thử túi khác nha!"}
                </div>
                <button className="dlt-btn" onClick={handleBackToBags}>
                  {allDone ? "Xem tổng kết" : "Quay lại túi mù"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {stage === "done" && (
        <section className="dlt-done">
          {justFinished && <ConfettiOnMount />}
          <div className="dlt-done-card">
            <div className="dlt-done-icon">
              <i className="fa-solid fa-trophy" />
            </div>
            <h2>Hoàn thành <span>Túi Mù Bí Ẩn!</span></h2>
            <p>
              Bạn trả lời đúng <strong>{correctCount}/{TOTAL}</strong> câu hỏi.
            </p>

            <div className="dlt-done-stats">
              <div className="dlt-done-stat">
                <div className="dlt-done-stat-num">{correctCount * 10}</div>
                <div className="dlt-done-stat-label">Điểm</div>
              </div>
              <div className="dlt-done-stat">
                <div className="dlt-done-stat-num">{correctCount}/{TOTAL}</div>
                <div className="dlt-done-stat-label">Câu đúng</div>
              </div>
              <div className="dlt-done-stat">
                <div className="dlt-done-stat-num">{correctCount >= 8 ? "⭐⭐⭐" : correctCount >= 5 ? "⭐⭐" : correctCount >= 3 ? "⭐" : "—"}</div>
                <div className="dlt-done-stat-label">Đánh giá</div>
              </div>
            </div>

            <div className="dlt-done-actions">
              {attemptsLeft > 0 ? (
                <button className="dlt-btn primary" onClick={handleRestart}>
                  <i className="fa-solid fa-rotate-right" />
                  Chơi lại ({attemptsLeft} lượt)
                </button>
              ) : (
                <span className="dlt-btn disabled">
                  <i className="fa-solid fa-lock" />
                  Hết lượt
                </span>
              )}
              <Link to="/bai-tap" className="dlt-btn ghost">
                <i className="fa-solid fa-arrow-left" />
                Quay về Bài tập
              </Link>
            </div>
          </div>
        </section>
      )}

      {dialog.open && (
        <div className="dlt-dialog-overlay" onClick={closeDialog}>
          <div className="dlt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Thông báo</h3>
            <p>{dialog.message}</p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px'}}>
              {dialog.type === "confirm" && (
                <button className="dlt-btn ghost" style={{background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1'}} onClick={closeDialog}>
                  Hủy
                </button>
              )}
              <button className="dlt-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
