import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiDanCu.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(2);
  }, []);
  return null;
}

const AUDIO_MAP = {
  start: "/audio/startQuanAnHanhPhuc.mp3",
  correct: "/audio/correctQuanAnHanhPhuc.mp3",
  wrong: "/audio/wrong.wav",
  finish: "/audio/finish.mp3",
};

const playAudio = (type) => {
  const path = AUDIO_MAP[type];
  if (path) {
    const audio = new Audio(path);
    audio.play().catch(e => console.log("Audio play failed:", e));
  }
};

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

function syncProgress(results, total) {
  const answered = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const score = Math.round((correctCount / total) * 100);
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
  const { t } = useTranslation();

  const DISH_NAMES = useMemo(() => t("minigames.dan_cu.dishes", { returnObjects: true }), [t]);

  const QUESTIONS = useMemo(() => {
    const questions = t("minigames.dan_cu.questions", { returnObjects: true });
    return questions.map((q, i) => ({
      ...q,
      title: "DÂN CƯ",
      correctIndex: [2, 1, 3, 1, 0][i],
      prompt: q.prompt.normalize("NFC"),
      answers: q.answers.map((a) => a.normalize("NFC")),
    }));
  }, [t]);

  const TOTAL = QUESTIONS.length;

  const saved = useMemo(() => loadState(), []);

  const [screen, setScreen] = useState(saved?.screen ?? "intro1");
  const [selectedDish, setSelectedDish] = useState(saved?.selectedDish ?? null);
  const [results, setResults] = useState(() => saved?.results ?? Array(TOTAL).fill(null));
  const [justFinished, setJustFinished] = useState(false);

  // question-screen state
  const [picked, setPicked] = useState(saved?.picked ?? null); // index 0..3
  const [reveal, setReveal] = useState(saved?.reveal ?? false);
  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });

  const finishedRef = useRef(saved?.finishedOnce ?? false);
  const bgmRef = useRef(null);

  const playBGM = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(AUDIO_MAP.start);
      bgmRef.current.loop = true;
    }
    // Only play if not already playing
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(e => console.log("BGM auto-play blocked by browser, waiting for interaction."));
    }
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  }, []);

  // Tự động phát lại nhạc nền nếu đang trong game (trường hợp load lại trang)
  useEffect(() => {
    const activeScreens = ["intro2", "menu", "question"];
    if (activeScreens.includes(screen)) {
      playBGM();
    }
  }, [screen, playBGM]);

  const correctCount = results.filter((r) => r === true).length;
  const allDone = results.every((r) => r !== null);
  const allCorrect = results.every((r) => r === true);
  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  useEffect(() => {
    document.body.classList.add("page-tro-choi-dan-cu-active");
    return () => {
      document.body.classList.remove("page-tro-choi-dan-cu-active");
      stopBGM(); // Dừng nhạc khi thoát khỏi trang
    };
  }, [stopBGM]);

  useEffect(() => {
    saveState({ screen, selectedDish, results, picked, reveal, finishedOnce: finishedRef.current });
    syncProgress(results, TOTAL);
  }, [screen, selectedDish, results, picked, reveal, TOTAL]);

  // Không tự chuyển sang finish nữa, chờ người dùng nhấn nút "Xem tổng kết"
  const handleViewSummary = useCallback(() => {
    if (!finishedRef.current) {
      incrementAttempts();
      finishedRef.current = true;
    }
    stopBGM(); // Dừng nhạc nền
    playAudio("finish"); // Added audio for finish
    setJustFinished(true);
    setScreen("finish");
  }, [stopBGM]);

  const goIntro2 = useCallback(() => setScreen("intro2"), []);
  const goMenu = useCallback(() => setScreen("menu"), []);

  const handleStart = useCallback(() => {
    if (attemptsLeft <= 0) {
      // vẫn cho xem, nhưng không reset được
      setScreen("menu");
      return;
    }
    playBGM(); // Phát nhạc nền (thay cho playAudio("start"))
    setScreen("menu");
  }, [attemptsLeft, playBGM]);

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
    if (isCorrect) {
      playAudio("correct"); // Added audio for correct answer
    } else {
      playAudio("wrong"); // Added audio for wrong answer
    }
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
    setDialog({
      open: true,
      type: "confirm",
      title: t("minigames.dan_cu.dialog_restart_title"),
      message: t("minigames.dan_cu.dialog_restart_desc"),
      action: "restart",
    });
  }, [t]);

  const closeDialog = useCallback(() => setDialog({ open: false, type: "", title: "", message: "", action: "" }), []);

  const confirmDialog = useCallback(() => {
    if (dialog.action === "restart") {
      stopBGM();
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
  }, [dialog, closeDialog, stopBGM, TOTAL]);

  const question = selectedDish !== null ? QUESTIONS[selectedDish] : null;

  if (screen === "finish") {
    const score = Math.round((correctCount / TOTAL) * 100);
    return (
      <div className="dc-page finish-page" style={{ backgroundImage: `url(${ASSETS.bg})`, backgroundColor: 'transparent' }}>
        {justFinished && <ConfettiOnMount />}
        <div className="dc-finish">
          <div className="dc-finish-badge">
            <i className="fa-solid fa-utensils" />
            {t("minigames.dan_cu.end_badge")}
          </div>
          <h2 dangerouslySetInnerHTML={{ __html: t("minigames.dan_cu.end_title") }} />
          <div className="dc-summary-stats-box">
            <p>
              {t("minigames.dan_cu.end_stat_correct")}: <strong>{correctCount}/{TOTAL}</strong> — {t("minigames.dan_cu.end_stat_score")}:{" "}
              <strong>{score}</strong>
            </p>
          </div>
          <div className="dc-finish-actions">
            <button className="dc-btn primary" onClick={handleRestart}>
              <i className="fa-solid fa-rotate-right" /> {t("minigames.dan_cu.btn_play_again")}
            </button>
            <Link to="/bai-tap" className="dc-btn ghost">
              <i className="fa-solid fa-arrow-left" /> {t("minigames.dan_cu.btn_back_learning")}
            </Link>
          </div>
        </div>

        {dialog.open && (
          <div className="tk-dialog-overlay" onClick={closeDialog}>
            <div className="tk-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>{dialog.title}</h3>
              <p>{dialog.message}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button className="dc-btn ghost" onClick={closeDialog} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
                  {t("minigames.dan_cu.dialog_btn_cancel")}
                </button>
                <button className="dc-btn primary" onClick={confirmDialog} style={{ padding: '12px 24px', fontSize: '1.2rem' }}>
                  {t("minigames.dan_cu.dialog_btn_confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dc-page" style={{
      backgroundImage: screen === "question" ? `url(${ASSETS.bg2})` : (screen === "menu" ? 'none' : `url(${ASSETS.bg})`),
      backgroundColor: screen === "menu" ? '#ffe4e1' : 'transparent'
    }}>
      <div className="dc-topbar">
        <div className="dc-topbar-left">
          <Link to="/bai-tap" className="dc-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div className="dc-topbar-title">
            <h1>
              <i className="fa-solid fa-bowl-food" /> {t("minigames.dan_cu.title")}
            </h1>
            <p>{t("minigames.dan_cu.subtitle")}</p>
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
              <div className="dc-sign-line1" data-text={t("minigames.dan_cu.sign_line1")}>{t("minigames.dan_cu.sign_line1")}</div>
              <div className="dc-sign-line2" data-text={t("minigames.dan_cu.sign_line2")}>{t("minigames.dan_cu.sign_line2")}</div>
            </div>
            <button className="dc-btn primary dc-start-btn" onClick={() => setScreen("intro2")}>
              <i className="fa-solid fa-play" /> {t("minigames.dan_cu.btn_enter")}
            </button>
          </div>
          <img className="dc-chef dc-chef-1" src={ASSETS.chef1} alt="Đầu bếp" />
        </section>
      )}

      {screen === "intro2" && (
        <section className="dc-stage dc-intro dc-intro2">
          <img className="dc-chef dc-chef-2" src={ASSETS.chef2} alt="Đầu bếp" />
          <div className="dc-welcome">
            <div className="dc-welcome-top">{t("minigames.dan_cu.welcome_greeting")}</div>
            <div className="dc-welcome-title">{t("minigames.dan_cu.title").toUpperCase()}</div>
            <div className="dc-welcome-desc">
              {t("minigames.dan_cu.welcome_desc")}
            </div>
            <div className="dc-welcome-actions">
              <button className="dc-btn primary dc-big-btn" onClick={handleStart}>
                <i className="fa-solid fa-utensils" /> {t("minigames.dan_cu.btn_start")}
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "menu" && (
        <section className="dc-stage dc-menu dc-menu-layout">
          <div className="dc-menu-left">
            <div className="dc-bubble">
              {t("minigames.dan_cu.menu_bubble")}
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
                          {status === true ? DISH_NAMES[i] : t("minigames.dan_cu.dish_default_label", { count: i + 1 })}
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
                  <i className="fa-solid fa-star" /> {t("minigames.dan_cu.btn_summary")}
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
              <span>{t("minigames.dan_cu.q_label")}</span>
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
                  {reveal && isCorrect ? (
                    <img src={ASSETS.dishes[selectedDish]} className="dc-answer-cloche dc-answer-dish" alt="" />
                  ) : (
                    <img src={ASSETS.tray} className="dc-answer-cloche" alt="" />
                  )}
                  <span className="dc-answer-letter">{letter}</span>
                  <span className="dc-answer-text">{txt}</span>
                </button>
              );
            })}
          </div>

          <div className="dc-feedback-area">
            <div className="dc-feedback-msg-box">
              {reveal && (
                <div className={`dc-feedback ${picked === question.correctIndex ? 'ok' : 'no'}`}>
                  {picked === question.correctIndex ? (
                    <><i className="fa-solid fa-circle-check" /> {t("minigames.dan_cu.feedback_correct")}</>
                  ) : (
                    <><i className="fa-solid fa-circle-xmark" /> {t("minigames.dan_cu.feedback_wrong")}</>
                  )}
                </div>
              )}
            </div>

            <div className="dc-after-actions">
              <button className={`dc-btn ${reveal ? 'primary' : 'ghost'}`} onClick={backToMenu}>
                <i className="fa-solid fa-arrow-left" /> {t("minigames.dan_cu.btn_back_menu")}
              </button>
            </div>
          </div>
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
                  {t("minigames.dan_cu.dialog_btn_cancel")}
                </button>
              )}
              <button className="tk-dlg-btn blue" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? t("minigames.dan_cu.dialog_btn_start_new") : t("minigames.dan_cu.dialog_btn_ok")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

