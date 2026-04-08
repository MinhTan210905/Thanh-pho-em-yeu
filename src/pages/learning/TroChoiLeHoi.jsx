import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiLeHoi.css";

function ConfettiOnMount({ amount = 3 }) {
  useEffect(() => {
    fireConfetti(amount);
  }, [amount]);
  return null;
}

const AUDIO_MAP = {
  start: "/audio/startLeHoi.mp3",
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

const FESTIVALS_IMAGES = [
  { id: 1, imageUrl: "/images/tro_choi/le_hoi/Lễ hội Yang Va.jpg" },
  { id: 2, imageUrl: "/images/tro_choi/le_hoi/Lễ hội Nghinh Cô.jpg" },
  { id: 3, imageUrl: "/images/tro_choi/le_hoi/Lễ hội Đình Thắng Tam.jpg" },
  { id: 4, imageUrl: "/images/tro_choi/le_hoi/Lễ hội chùa Ông.webp" },
  { id: 5, imageUrl: "/images/tro_choi/le_hoi/Lễ hội đường hoa Nguyễn Huệ.jpg" },
  { id: 6, imageUrl: "/images/tro_choi/le_hoi/Lễ Kỳ Yên.jpg" },
  { id: 7, imageUrl: "/images/tro_choi/le_hoi/Lễ hội Chùa Bà Thiên Hậu.jpg" },
  { id: 8, imageUrl: "/images/tro_choi/le_hoi/Lễ hội Lái Thiêu mùa trái chín.jpg" },
];

const TOTAL_COUNT = 8;
const STATE_KEY = "tc_le_hoi_state_v2";
const BT_KEY = "bt_game_progress";
const GAME_ID = "tro-choi-le-hoi";
const MAX_ATTEMPTS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  } catch { /* ignore */ }
}

export default function TroChoiLeHoi() {
  const { t } = useTranslation();

  const FESTIVALS = useMemo(() => {
    const translated = t("minigames.le_hoi.festivals", { returnObjects: true });
    return translated.map(f => ({
      ...f,
      imageUrl: FESTIVALS_IMAGES.find(img => img.id === f.id)?.imageUrl || ""
    }));
  }, [t]);

  const TOTAL = FESTIVALS.length;

  const saved = useMemo(() => loadState(), []);

  const [order, setOrder] = useState(() => {
    if (saved?.order && saved.order.length === TOTAL) return saved.order;
    return shuffle(FESTIVALS.map((_, i) => i));
  });

  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [results, setResults] = useState(() => saved?.results ?? Array(TOTAL).fill(null));
  const [finished, setFinished] = useState(saved?.finished ?? false);
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

  useEffect(() => {
    if (!finished) {
      playBGM();
    } else {
      stopBGM();
    }
  }, [finished, playBGM, stopBGM]);

  useEffect(() => {
    return () => stopBGM();
  }, [stopBGM]);

  const [selected, setSelected] = useState(() => saved?.selected ?? {});
  const [checked, setChecked] = useState(saved?.checked ?? false);

  const [dialog, setDialog] = useState({
    open: false,
    type: "alert",
    title: "",
    message: "",
    action: "none",
  });

  const festival = FESTIVALS[order[currentQ]] || FESTIVALS[0];
  const shuffledOptions = useMemo(() => {
    if (!festival) return [];
    return shuffle(festival.options.map((o, i) => ({ ...o, idx: i })));
  }, [festival]);

  const correctCount = results.filter((r) => r === true).length;
  const wrongCount = results.filter((r) => r === false).length;

  useEffect(() => {
    document.body.classList.add("page-tro-choi-le-hoi-active");
    return () => document.body.classList.remove("page-tro-choi-le-hoi-active");
  }, []);

  useEffect(() => {
    saveState({ currentQ, results, finished, order, selected, checked });
    syncProgress(results, TOTAL);
  }, [currentQ, results, finished, order, selected, checked, TOTAL]);

  useEffect(() => {
    if (results[currentQ] !== null) {
      setChecked(true);
    } else {
      setChecked(false);
      setSelected({});
    }
  }, [currentQ]);

  const handleTagClick = useCallback((optIdx) => {
    if (checked) return;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[optIdx]) {
        delete next[optIdx];
      } else {
        next[optIdx] = true;
      }
      return next;
    });
  }, [checked]);

  const handleCheck = useCallback(() => {
    if (checked || !festival) return;
    const selectedIdxs = Object.keys(selected).map(Number);
    if (selectedIdxs.length === 0) return;

    const correctTags = festival.options
      .map((o, i) => (o.isCorrect ? i : -1))
      .filter((i) => i >= 0);
    const selectedSet = new Set(selectedIdxs);
    const allCorrectSelected = correctTags.every((i) => selectedSet.has(i));
    const noWrongSelected = selectedIdxs.every((i) => festival.options[i].isCorrect);
    const isCorrect = allCorrectSelected && noWrongSelected;

    if (isCorrect) playAudio("correct");
    else playAudio("wrong");

    setChecked(true);
    setResults((prev) => {
      const next = [...prev];
      if (next[currentQ] === null) next[currentQ] = isCorrect;
      return next;
    });
  }, [checked, selected, festival, currentQ]);

  const handleNext = useCallback(() => {
    const nextUnanswered = results.findIndex((r, i) => r === null && i > currentQ);
    if (nextUnanswered !== -1) {
      setCurrentQ(nextUnanswered);
    } else {
      const beforeUnanswered = results.findIndex((r) => r === null);
      if (beforeUnanswered !== -1) {
        setCurrentQ(beforeUnanswered);
      } else {
        incrementAttempts();
        stopBGM();
        playAudio("finish");
        setFinished(true);
        setJustFinished(true);
      }
    }
  }, [currentQ, results, stopBGM]);

  const handleGoTo = useCallback((idx) => {
    setCurrentQ(idx);
  }, []);

  const handleRestart = useCallback(() => {
    const currentAttempts = getAttempts();
    if (currentAttempts >= MAX_ATTEMPTS) {
      setDialog({
        open: true,
        type: "alert",
        title: t("minigames.le_hoi.dialog_out_of_attempts_title"),
        message: t("minigames.le_hoi.dialog_out_of_attempts_msg"),
        action: "none",
      });
      return;
    }
    const remaining = MAX_ATTEMPTS - currentAttempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      title: t("minigames.le_hoi.dialog_restart_title"),
      message: t("minigames.le_hoi.dialog_restart_msg", { count: remaining }),
      action: "restart",
    });
  }, [t]);

  const closeDialog = useCallback(() => {
    setDialog((d) => ({ ...d, open: false }));
  }, []);

  const confirmDialog = useCallback(() => {
    if (dialog.action === "restart") {
      if (!finished) {
        incrementAttempts();
      }
      setCurrentQ(0);
      setSelected({});
      setChecked(false);
      setResults(Array(TOTAL).fill(null));
      setFinished(false);
      setJustFinished(false);
      setOrder(shuffle(FESTIVALS.map((_, i) => i)));
      sessionStorage.removeItem(STATE_KEY);
      playBGM();
    }
    closeDialog();
  }, [dialog, closeDialog, finished, playBGM, TOTAL, FESTIVALS]);

  if (finished) {
    const score = Math.round((correctCount / TOTAL) * 100);
    const stars = correctCount >= 7 ? 3 : correctCount >= 4 ? 2 : correctCount >= 2 ? 1 : 0;
    const endIcon = stars === 3 ? "fa-trophy" : stars === 2 ? "fa-medal" : "fa-star";
    const attemptsLeft = MAX_ATTEMPTS - getAttempts();

    return (
      <div className="lh-page">
        {justFinished && <ConfettiOnMount />}
        <div className="lh-end">
          <div className="lh-end-icon">
            <i className={`fa-solid ${endIcon}`} />
          </div>
          <h2 dangerouslySetInnerHTML={{ __html: t("minigames.le_hoi.end_title") }} />
          <p dangerouslySetInnerHTML={{ __html: t("minigames.le_hoi.end_stat_msg", { correct: correctCount, total: TOTAL }) }} />

          <div className="lh-end-stats">
            <div className="lh-end-stat">
              <div className="lh-end-stat-num">{score}</div>
              <div className="lh-end-stat-label">{t("minigames.le_hoi.end_stat_score_label")}</div>
            </div>
            <div className="lh-end-stat">
              <div className="lh-end-stat-num">{correctCount}/{TOTAL}</div>
              <div className="lh-end-stat-label">{t("minigames.le_hoi.end_stat_correct_label")}</div>
            </div>
            <div className="lh-end-stat">
              <div className="lh-end-stat-num">{"⭐".repeat(stars) || "—"}</div>
              <div className="lh-end-stat-label">{t("minigames.le_hoi.end_stat_rating_label")}</div>
            </div>
          </div>

          <div className="lh-end-actions">
            {attemptsLeft > 0 ? (
              <button className="lh-end-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" />
                {t("minigames.le_hoi.btn_play_again", { count: attemptsLeft })}
              </button>
            ) : (
              <span className="lh-end-btn disabled">
                <i className="fa-solid fa-lock" />
                {t("minigames.le_hoi.btn_out_of_attempts")}
              </span>
            )}
            <Link to="/bai-tap" className="lh-end-btn secondary">
              <i className="fa-solid fa-arrow-left" />
              {t("minigames.le_hoi.btn_back_learning")}
            </Link>
          </div>
        </div>

        {dialog.open && (
          <div className="lh-dialog-overlay" onClick={closeDialog}>
            <div className="lh-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>{dialog.title}</h3>
              <p>{dialog.message}</p>
              <div className="lh-dialog-actions">
                {dialog.type === "confirm" && (
                  <button className="lh-dialog-btn ghost" onClick={closeDialog}>
                    {t("minigames.le_hoi.dialog_btn_cancel")}
                  </button>
                )}
                <button className="lh-dialog-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                  {dialog.type === "confirm" ? t("minigames.le_hoi.dialog_btn_confirm") : t("minigames.le_hoi.dialog_btn_ok")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isCorrectRound = checked && results[currentQ] === true;
  const isWrongRound = checked && results[currentQ] === false;

  return (
    <div className="lh-page">
      <div className="lh-topbar">
        <div className="lh-topbar-left">
          <Link to="/bai-tap" className="lh-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-masks-theater" />
              {t("minigames.le_hoi.title")}
            </h1>
            <p>{t("minigames.le_hoi.subtitle")}</p>
          </div>
        </div>
        <div className="lh-score-bar">
          <div className="lh-score-item">
            <i className="fa-solid fa-circle-question lh-qnum" />
            {currentQ + 1}/{TOTAL}
          </div>
          <div className="lh-score-item">
            <i className="fa-solid fa-circle-check lh-correct" />
            {correctCount}
          </div>
          <div className="lh-score-item">
            <i className="fa-solid fa-circle-xmark lh-wrong" />
            {wrongCount}
          </div>
        </div>
      </div>

      <div className={`lh-game-container ${isWrongRound ? "error-active" : ""}`}>
        <div className="lh-main-content">
          <div className="lh-image-section">
            <div className="lh-image-wrap">
              <img src={festival?.imageUrl} alt={festival?.name} />
              <div className="lh-image-number">{currentQ + 1}</div>
            </div>
            <div className="lh-festival-name">
              <i className="fa-solid fa-landmark" />
              {festival?.name}
            </div>
          </div>

          <div className="lh-interact-section">
            <div className="lh-tags-label">{t("minigames.le_hoi.tags_label")}</div>
            <div className="lh-tags-grid">
              {shuffledOptions.map((opt) => {
                const isSelected = !!selected[opt.idx];
                const showResult = checked;
                let tagClass = "lh-tag";

                if (isSelected && !showResult) tagClass += " selected";
                if (showResult && isSelected && opt.isCorrect) tagClass += " correct";
                if (showResult && isSelected && !opt.isCorrect) tagClass += " wrong";
                if (showResult && !isSelected && opt.isCorrect) tagClass += " missed";

                return (
                  <button key={opt.idx} className={tagClass} onClick={() => handleTagClick(opt.idx)} disabled={checked}>
                    {isSelected && !showResult && <i className="fa-solid fa-check lh-tag-check" />}
                    {showResult && isSelected && opt.isCorrect && <i className="fa-solid fa-check lh-tag-check" />}
                    {showResult && isSelected && !opt.isCorrect && <i className="fa-solid fa-xmark lh-tag-x" />}
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {checked && (
              <div className={`lh-feedback ${isCorrectRound ? "success" : "fail"}`}>
                {isCorrectRound ? (
                  <>
                    <i className="fa-solid fa-check-circle" /> {t("minigames.le_hoi.feedback_correct")}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-times-circle" /> {t("minigames.le_hoi.feedback_wrong")}
                  </>
                )}
              </div>
            )}

            <div className="lh-actions">
              {!checked ? (
                <>
                  <button className="lh-btn lh-btn-check" onClick={handleCheck} disabled={Object.keys(selected).length === 0}>
                    <i className="fa-solid fa-wand-magic-sparkles" />
                    {t("minigames.le_hoi.btn_check")}
                  </button>
                  <button className="lh-btn lh-btn-clear" onClick={() => setSelected({})}>
                    <i className="fa-solid fa-eraser" />
                    {t("minigames.le_hoi.btn_clear")}
                  </button>
                </>
              ) : (
                <>
                  <button className="lh-btn lh-btn-next" onClick={handleNext}>
                    <i className="fa-solid fa-arrow-right" />
                    {results.some((r) => r === null) ? t("minigames.le_hoi.btn_next") : t("minigames.le_hoi.btn_summary")}
                  </button>
                  <button className="lh-btn lh-btn-clear" onClick={handleRestart}>
                    <i className="fa-solid fa-rotate-right" />
                    {t("minigames.le_hoi.btn_restart_game")}
                  </button>
                </>
              )}
            </div>

            <div className="lh-dots">
              {FESTIVALS.map((_, idx) => {
                let cls = "lh-dot";
                if (idx === currentQ) cls += " active";
                if (results[idx] === true) cls += " done-correct";
                if (results[idx] === false) cls += " done-wrong";
                return (
                  <button key={idx} className={cls} onClick={() => handleGoTo(idx)} />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {dialog.open && (
        <div className="lh-dialog-overlay" onClick={closeDialog}>
          <div className="lh-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div className="lh-dialog-actions">
              {dialog.type === "confirm" && (
                <button className="lh-dialog-btn ghost" onClick={closeDialog}>
                  {t("minigames.le_hoi.dialog_btn_cancel")}
                </button>
              )}
              <button className="lh-dialog-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? t("minigames.le_hoi.dialog_btn_confirm") : t("minigames.le_hoi.dialog_btn_ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
