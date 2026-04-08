import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiDiaLiTuNhien.css";

function ConfettiOnMount() {
  useEffect(() => {
    const randomType = Math.floor(Math.random() * 3) + 1;
    fireConfetti(randomType);
  }, []);
  return null;
}

const AUDIO_MAP = {
  start: "/audio/startDiaLi.mp3",
  correct: "/audio/correct.mp3",
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

function buildColorSequence(total) {
  const base = BAG_COLORS.map((c) => c.id);
  const colors = [...base, ...base];
  while (colors.length < total) {
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

function initBags(questionOrder, total) {
  const colors = buildColorSequence(total);
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
  const { t } = useTranslation();

  const QUESTIONS = useMemo(() => {
    const questions = t("minigames.tu_nhien.questions", { returnObjects: true });
    const correctIndices = [0, 1, 2, 0, 1, 3, 2, 2, 1, 1]; // From original QUESTIONS
    return questions.map((q, i) => ({
      ...q,
      correctIndex: correctIndices[i] || 0
    }));
  }, [t]);

  const TOTAL = QUESTIONS.length;

  const saved = useMemo(() => loadState(), []);
  const [questionOrder] = useState(() => saved?.questionOrder || shuffle(QUESTIONS.map((_, i) => i)));
  const [bags, setBags] = useState(() => saved?.bags || initBags(questionOrder, TOTAL));
  const [stage, setStage] = useState(() => saved?.stage || "bags");
  const [activeBagId, setActiveBagId] = useState(() => saved?.activeBagId ?? null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(() => saved?.results || Array(TOTAL).fill(null));
  const [dialog, setDialog] = useState({ open: false, type: "alert", message: "" });
  const audioCtxRef = useRef(null);
  const finishedRef = useRef(
    saved?.results ? saved.results.filter((r) => r !== null).length === TOTAL : false
  );
  const [justFinished, setJustFinished] = useState(false);

  const bgmRef = useRef(null);

  const playBGM = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(AUDIO_MAP.start);
      bgmRef.current.loop = true;
    }
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(e => console.log("BGM auto-play blocked."));
    }
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  }, []);

  // Tự động phát nhạc nếu đang trong game
  useEffect(() => {
    if (stage !== "done") {
      playBGM();
    } else {
      stopBGM();
    }
  }, [stage, playBGM, stopBGM]);

  useEffect(() => {
    return () => stopBGM();
  }, [stopBGM]);

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
  }, [bags, stage, activeBagId, results, questionOrder]);

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
      if (isCorrect) playAudio("correct");
      else playAudio("wrong");
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
      stopBGM();
      playAudio("finish");
      setStage("done");
      setJustFinished(true);
      return;
    }
    setStage("bags");
    setActiveBagId(null);
  }, [allDone, stopBGM]);

  const handleRestart = useCallback(() => {
    const attempts = getAttempts();
    if (attempts >= MAX_ATTEMPTS) {
      setDialog({ open: true, type: "alert", message: t("minigames.tu_nhien.dialog_out_of_attempts") });
      return;
    }
    const remaining = MAX_ATTEMPTS - attempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      message: t("minigames.tu_nhien.dialog_restart_confirm", { count: remaining }),
    });
  }, [t]);

  const closeDialog = useCallback(() => setDialog({ open: false, type: "alert", message: "" }), []);

  const confirmDialog = useCallback(() => {
    if (!finishedRef.current) {
      incrementAttempts();
    }
    const newOrder = shuffle(QUESTIONS.map((_, i) => i));
    setBags(initBags(newOrder, TOTAL));
    setResults(Array(TOTAL).fill(null));
    setStage("bags");
    setActiveBagId(null);
    finishedRef.current = false;
    setJustFinished(false);
    sessionStorage.removeItem(STATE_KEY);
    closeDialog();
    playBGM();
  }, [closeDialog, playBGM, TOTAL, QUESTIONS]);

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
              <h1 className="dlt-title-text">
                <i className="fa-solid fa-leaf" style={{ color: '#22c55e', textShadow: 'none', WebkitTextFillColor: 'initial' }} />
                <span>{t("minigames.tu_nhien.title")}</span>
              </h1>
              <p>{t("minigames.tu_nhien.subtitle")}</p>
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
          </div>
        </div>
      )}

      {stage === "bags" && (
        <section className="dlt-bags">
          <div className="dlt-bags-head">
            <h2>{t("minigames.tu_nhien.bags_head")}</h2>
            <span className="dlt-bags-sub">{t("minigames.tu_nhien.bags_sub", { count: TOTAL - answeredCount })}</span>
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
                  <div className="dlt-bag-label">{t("minigames.tu_nhien.bag_label", { count: idx + 1 })}</div>
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
              {t("minigames.tu_nhien.q_label", { current: (activeBag?.questionIndex || 0) + 1, total: TOTAL })}
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
                    className={`dlt-option${showResult && isCorrect ? " correct" : ""
                      }${showResult && isChosen && !isCorrect ? " wrong" : ""}${showResult ? " disabled" : ""
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
                  {selectedAnswer === currentQuestion.correctIndex ? t("minigames.tu_nhien.feedback_correct") : t("minigames.tu_nhien.feedback_wrong")}
                </div>
                <button className="dlt-btn" onClick={handleBackToBags}>
                  {allDone ? t("minigames.tu_nhien.btn_view_summary") : t("minigames.tu_nhien.btn_back_bags")}
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
            <h2 dangerouslySetInnerHTML={{ __html: t("minigames.tu_nhien.end_title") }} />
            <p dangerouslySetInnerHTML={{ __html: t("minigames.tu_nhien.end_stat_correct", { correct: correctCount, total: TOTAL }) }} />

            <div className="dlt-done-stats">
              <div className="dlt-done-stat">
                <div className="dlt-done-stat-num">{correctCount * 10}</div>
                <div className="dlt-done-stat-label">{t("minigames.tu_nhien.end_stat_score_label")}</div>
              </div>
              <div className="dlt-done-stat">
                <div className="dlt-done-stat-num">{correctCount}/{TOTAL}</div>
                <div className="dlt-done-stat-label">{t("minigames.tu_nhien.end_stat_correct_label")}</div>
              </div>
              <div className="dlt-done-stat">
                <div className="dlt-done-stat-num">{correctCount >= 8 ? "⭐⭐⭐" : correctCount >= 5 ? "⭐⭐" : correctCount >= 3 ? "⭐" : "—"}</div>
                <div className="dlt-done-stat-label">{t("minigames.tu_nhien.end_stat_rating_label")}</div>
              </div>
            </div>

            <div className="dlt-done-actions">
              {attemptsLeft > 0 ? (
                <button className="dlt-btn primary" onClick={handleRestart}>
                  <i className="fa-solid fa-rotate-right" />
                  {t("minigames.tu_nhien.btn_play_again", { count: attemptsLeft })}
                </button>
              ) : (
                <span className="dlt-btn disabled">
                  <i className="fa-solid fa-lock" />
                  {t("minigames.tu_nhien.btn_out_of_attempts")}
                </span>
              )}
              <Link to="/bai-tap" className="dlt-btn ghost">
                <i className="fa-solid fa-arrow-left" />
                {t("minigames.tu_nhien.btn_back_learning")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {dialog.open && (
        <div className="dlt-dialog-overlay" onClick={closeDialog}>
          <div className="dlt-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{t("minigames.tu_nhien.dialog_restart_title")}</h3>
            <p>{dialog.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              {dialog.type === "confirm" && (
                <button className="dlt-btn ghost" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={closeDialog}>
                  {t("minigames.tu_nhien.dialog_btn_cancel")}
                </button>
              )}
              <button className="dlt-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? t("minigames.tu_nhien.dialog_btn_confirm") : t("minigames.tu_nhien.dialog_btn_ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
