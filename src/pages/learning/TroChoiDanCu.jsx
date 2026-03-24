import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiDanCu.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(2);
  }, []);
  return null;
}

const DISH_NAMES = ["Mì ý", "Pizza", "Gà quay", "Canh bò", "Bò bít tết"];

const ASSETS = {
  bg: "/images/tro_choi/dan_cu/nen.jpg",
  bg2: "/images/tro_choi/dan_cu/nen_2.jpg",
  sign: "/images/tro_choi/dan_cu/ban_hieu.png",
  chef1: "/images/tro_choi/dan_cu/dau_bep_1.png",
  chef2: "/images/tro_choi/dan_cu/dau_bep_2.png",
  chef3: "/images/tro_choi/dan_cu/dau_bep_3.png",
  chef4: "/images/tro_choi/dan_cu/dau_bep_4.png",
  tray: "/images/tro_choi/dan_cu/khay_dung.png",
  dishes: [
    "/images/tro_choi/dan_cu/mon_1.png",
    "/images/tro_choi/dan_cu/mon_2.png",
    "/images/tro_choi/dan_cu/mon_3.png",
    "/images/tro_choi/dan_cu/mon_4.png",
    "/images/tro_choi/dan_cu/mon_5.png",
  ],
};

const QUESTIONS = [
  {
    title: "DÂN CƯ",
    prompt:
      "Sau sáp nhập, Thành phố Hồ Chí Minh có dân số khoảng bao nhiêu người?",
    answers: [
      "Trên 12 triệu người.",
      "Trên 13 triệu người.",
      "Trên 14 triệu người.",
      "Trên 15 triệu người.",
    ],
    correctIndex: 2, // C
  },
  {
    title: "DÂN CƯ",
    prompt:
      "Hiện nay, Thành phố Hồ Chí Minh có bao nhiêu dân tộc thiểu số sinh sống?",
    answers: ["52", "53", "54", "55"],
    correctIndex: 1, // B
  },
  {
    title: "DÂN CƯ",
    prompt: "Dân cư ở Thành phố Hồ Chí Minh phân bố như thế nào?",
    answers: [
      "Chỉ tập trung ở trung tâm thành phố",
      "Chỉ tập trung ở vùng ven",
      "Đồng đều giữa các khu vực",
      "Không đồng đều giữa các khu vực",
    ],
    correctIndex: 3, // D
  },
  {
    title: "DÂN CƯ",
    prompt:
      "Người dân Thành phố Hồ Chí Minh được miêu tả với đặc điểm nào sau đây?",
    answers: [
      "Khép kín, ít giao tiếp",
      "Phóng khoáng, tự tin và năng động",
      "Bảo thủ, ít thay đổi",
      "Chậm chạp, thụ động",
    ],
    correctIndex: 1, // B
  },
  {
    title: "DÂN CƯ",
    prompt:
      "Những dân tộc thiểu số nào chiếm phần lớn trong cộng đồng dân tộc thiểu số ở Thành phố Hồ Chí Minh?",
    answers: [
      "Hoa, Khmer, Chăm, Tày",
      "Mường, Nùng, Dao, Thái",
      "Ê-đê, Gia-rai, Ba-na",
      "H’Mông, Xơ-đăng, Cơ-tu",
    ],
    correctIndex: 0, // A
  },
].map((q) => ({
  ...q,
  prompt: q.prompt.normalize("NFC"),
  answers: q.answers.map((a) => a.normalize("NFC")),
}));

const TOTAL = QUESTIONS.length;
const GAME_ID = "tro-choi-dan-cu";
const STATE_KEY = "tc_dan_cu_state";
const BT_KEY = "bt_game_progress";
const MAX_ATTEMPTS = 3;

function loadState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
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
  } catch {
    /* ignore */
  }
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
  } catch {
    /* ignore */
  }
}

export default function TroChoiDanCu() {
  const saved = useMemo(() => loadState(), []);

  const [screen, setScreen] = useState(saved?.screen ?? "intro1"); // intro1 -> intro2 -> menu -> question -> finish
  const [selectedDish, setSelectedDish] = useState(saved?.selectedDish ?? null);
  const [results, setResults] = useState(() => saved?.results ?? Array(TOTAL).fill(null));
  const [justFinished, setJustFinished] = useState(false);

  // question-screen state
  const [picked, setPicked] = useState(saved?.picked ?? null); // index 0..3
  const [reveal, setReveal] = useState(saved?.reveal ?? false);
  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });

  const finishedRef = useRef(saved?.finishedOnce ?? false);

  const correctCount = results.filter((r) => r === true).length;
  const allDone = results.every((r) => r !== null);
  const allCorrect = results.every((r) => r === true);
  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  useEffect(() => {
    document.body.classList.add("page-tro-choi-dan-cu-active");
    return () => document.body.classList.remove("page-tro-choi-dan-cu-active");
  }, []);

  useEffect(() => {
    saveState({ screen, selectedDish, results, picked, reveal, finishedOnce: finishedRef.current });
    syncProgress(results);
  }, [screen, selectedDish, results, picked, reveal]);

  // Không tự chuyển sang finish nữa, chờ người dùng nhấn nút "Xem tổng kết"
  const handleViewSummary = useCallback(() => {
    if (!finishedRef.current) {
      incrementAttempts();
      finishedRef.current = true;
    }
    setJustFinished(true);
    setScreen("finish");
  }, []);

  const goIntro2 = useCallback(() => setScreen("intro2"), []);
  const goMenu = useCallback(() => setScreen("menu"), []);

  const handleStart = useCallback(() => {
    if (attemptsLeft <= 0) {
      // vẫn cho xem, nhưng không reset được
      setScreen("menu");
      return;
    }
    setScreen("menu");
  }, [attemptsLeft]);

  const handlePickDish = useCallback((idx) => {
    setSelectedDish(idx);
    setPicked(null);
    setReveal(false);
    setScreen("question");
  }, []);

  const handleChoose = useCallback((ansIdx) => {
    if (reveal) return;
    setPicked(ansIdx);
    setReveal(true);
    const qIdx = selectedDish;
    const q = QUESTIONS[qIdx];
    const isCorrect = ansIdx === q.correctIndex;
    setResults((prev) => {
      const next = [...prev];
      next[qIdx] = isCorrect;
      return next;
    });
  }, [reveal, selectedDish]);

  const backToMenu = useCallback(() => {
    setScreen("menu");
    setPicked(null);
    setReveal(false);
  }, []);

  const handleRestart = useCallback(() => {
    sessionStorage.removeItem(STATE_KEY);
    finishedRef.current = false;
    setScreen("intro1");
    setSelectedDish(null);
    setResults(Array(TOTAL).fill(null));
    setPicked(null);
    setReveal(false);
    setJustFinished(false);
  }, []);

  const closeDialog = useCallback(() => setDialog({ open: false, type: "", title: "", message: "", action: "" }), []);

  const confirmDialog = useCallback(() => {
    if (dialog.action === "restart") {
      sessionStorage.removeItem(STATE_KEY);
      finishedRef.current = false;
      setScreen("intro1");
      setSelectedDish(null);
      setResults(Array(TOTAL).fill(null));
      setPicked(null);
      setReveal(false);
      setJustFinished(false);
    }
    closeDialog();
  }, [dialog, closeDialog]);

  const question = selectedDish !== null ? QUESTIONS[selectedDish] : null;

  if (screen === "finish") {
    const score = Math.round((correctCount / TOTAL) * 100);
    return (
      <div className="dc-page" style={{ "--dc-bg": `url(${ASSETS.bg})` }}>
        {justFinished && <ConfettiOnMount />}
        <div className="dc-finish">
          <div className="dc-finish-badge">
            <i className="fa-solid fa-utensils" />
            Hoàn thành thực đơn
          </div>
          <h2 className="dc-finish-congrats">
            🎉 Chúc mừng bạn!
          </h2>
          <h2>
            Bạn đã hoàn thành <span>Quán Ăn Hạnh Phúc</span>
          </h2>
          <div className="dc-summary-stats-box">
            <p>
              Số câu đúng: <strong>{correctCount}/{TOTAL}</strong> — Điểm:{" "}
              <strong>{score}</strong>
            </p>
          </div>
          <div className="dc-finish-actions">
            <button className="dc-btn primary" onClick={handleRestart}>
              <i className="fa-solid fa-rotate-right" /> Chơi lại
            </button>
            <Link to="/bai-tap" className="dc-btn ghost">
              <i className="fa-solid fa-arrow-left" /> Quay về Bài tập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dc-page" style={{ "--dc-bg": `url(${screen === "question" ? ASSETS.bg2 : ASSETS.bg})` }}>
      <div className="dc-topbar">
        <div className="dc-topbar-left">
          <Link to="/bai-tap" className="dc-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div className="dc-topbar-title">
            <h1>
              <i className="fa-solid fa-bowl-food" /> Quán Ăn Hạnh Phúc
            </h1>
            <p>Chọn món, trả lời câu hỏi để hoàn thiện thực đơn</p>
          </div>
        </div>
        <div className="dc-topbar-stats">
          <div className="dc-chip">
            <i className="fa-solid fa-circle-check" /> {correctCount}/{TOTAL}
          </div>
          <div className="dc-chip">
            <i className="fa-solid fa-rotate" /> {getAttempts()}/{MAX_ATTEMPTS}
          </div>
        </div>
      </div>

      {screen === "intro1" && (
        <section className="dc-stage dc-intro dc-intro1">
          <div className="dc-sign-wrapper">
            <img className="dc-sign" src={ASSETS.sign} alt="Bảng hiệu" />
            <div className="dc-sign-text">
              <div className="dc-sign-line1" data-text="QUÁN ĂN">QUÁN ĂN</div>
              <div className="dc-sign-line2" data-text="HẠNH PHÚC">HẠNH PHÚC</div>
            </div>
            <button className="dc-btn primary dc-start-btn" onClick={() => setScreen("intro2")}>
              <i className="fa-solid fa-play" /> Vào quán
            </button>
          </div>
          <img className="dc-chef dc-chef-1" src={ASSETS.chef1} alt="Đầu bếp" />
        </section>
      )}

      {screen === "intro2" && (
        <section className="dc-stage dc-intro dc-intro2">
          <img className="dc-chef dc-chef-2" src={ASSETS.chef2} alt="Đầu bếp" />
          <div className="dc-welcome">
            <div className="dc-welcome-top">Chào mừng bạn đến với:</div>
            <div className="dc-welcome-title">QUÁN ĂN HẠNH PHÚC</div>
            <div className="dc-welcome-desc">
              Hãy giải đáp các câu hỏi để chuẩn bị thực đơn phục vụ khách hàng nhé!
            </div>
            <div className="dc-welcome-actions">
              <button className="dc-btn primary dc-big-btn" onClick={handleStart}>
                <i className="fa-solid fa-utensils" /> Cùng chọn món ăn
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "menu" && (
        <section className="dc-stage dc-menu">
          <div className="dc-menu-left">
            <div className="dc-bubble">
              Hãy chọn một món ăn để chế biến thực đơn nhé!
            </div>
            <img className="dc-chef dc-chef-3" src={ASSETS.chef3} alt="Đầu bếp" />
          </div>

          <div className="dc-menu-right">
            <div className="dc-trays">
              {Array.from({ length: TOTAL }).map((_, i) => {
                const status = results[i]; // null/true/false
                const isJustBroken = status === false && selectedDish === i;
                return (
                  <button
                    key={i}
                    className={`dc-tray${status === true ? " done" : ""}${status === false ? " broken" : ""}${isJustBroken ? " just-broke" : ""}`}
                    onClick={() => handlePickDish(i)}
                    disabled={status === true}
                  >
                    <div className="dc-tray-inner">
                      <img className="dc-tray-img" src={ASSETS.tray} alt="Khay" />

                      {status === true && (
                        <img className="dc-dish" src={ASSETS.dishes[i]} alt={DISH_NAMES[i]} />
                      )}

                      {status === false && (
                        <div className="dc-broken-effect">
                          <img className="dc-tray-broken-p1" src={ASSETS.tray} alt="" />
                          <img className="dc-tray-broken-p2" src={ASSETS.tray} alt="" />
                        </div>
                      )}

                      <div className={`dc-tray-label-wrap ${status === false ? 'broken' : status === true ? 'done' : ''}`}>
                        <div className="dc-tray-label-left"></div>
                        <div className="dc-tray-label-body">
                          {status === true ? DISH_NAMES[i] : `Món ăn ${i + 1}`}
                        </div>
                        <div className="dc-tray-label-right"></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {allDone && (
              <div className="dc-menu-actions">
                <button className="dc-btn dc-summary-btn" onClick={handleViewSummary}>
                  <i className="fa-solid fa-star" /> Xem tổng kết
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {screen === "question" && question && (
        <section className="dc-stage dc-question">
          <div className="dc-qcard">
            <img className="dc-chef dc-chef-4" src={ASSETS.chef4} alt="Đầu bếp" />
            <div className="dc-qtitle">
              <span>Câu hỏi</span>
            </div>
            <div className="dc-qprompt">{question.prompt}</div>
          </div>

          <div className="dc-answers">
            {question.answers.map((txt, idx) => {
              const letter = ["A", "B", "C", "D"][idx];
              const isCorrect = idx === question.correctIndex;
              const isPicked = picked === idx;

              let cls = "dc-answer";
              if (!reveal && isPicked) cls += " selected";
              if (reveal && isPicked && isCorrect) cls += " correct";
              if (reveal && isPicked && !isCorrect) cls += " wrong";
              if (reveal && !isPicked && isCorrect) cls += " missed";

              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => handleChoose(idx)}
                  disabled={reveal}
                >
                  <img src={ASSETS.tray} className="dc-answer-cloche" alt="" />
                  <span className="dc-answer-letter">{letter}</span>
                  <span className="dc-answer-text">{txt}</span>
                </button>
              );
            })}
          </div>

          {reveal && (
            <div className="dc-after">
              {picked === question.correctIndex ? (
                <div className="dc-feedback ok">
                  <i className="fa-solid fa-circle-check" /> Chính xác! Món ăn đã hoàn thiện.
                </div>
              ) : (
                <div className="dc-feedback no">
                  <i className="fa-solid fa-circle-xmark" /> Chưa đúng rồi! Khay bị vỡ mất…
                </div>
              )}

              <div className="dc-after-actions">
                <button className="dc-btn primary" onClick={backToMenu}>
                  <i className="fa-solid fa-arrow-left" /> Quay lại chọn món
                </button>
              </div>
            </div>
          )}

          {!reveal && (
            <div className="dc-after-actions not-revealed">
              <button className="dc-btn ghost" onClick={backToMenu}>
                <i className="fa-solid fa-arrow-left" /> Quay lại chọn món
              </button>
            </div>
          )}
        </section>
      )}

      {dialog.open && (
        <div className="tk-dialog-overlay" onClick={closeDialog}>
          <div className="tk-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              {dialog.type === "confirm" && (
                <button className="tk-dlg-btn ghost" onClick={closeDialog}>
                  Hủy
                </button>
              )}
              <button className="tk-dlg-btn blue" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

