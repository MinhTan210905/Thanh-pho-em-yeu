import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiNhanVatLichSu.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(1);
  }, []);
  return null;
}

const AUDIO_MAP = {
  start: "/audio/startLichSu.mp3",
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

const STORAGE_KEY = "tc_nhanvatlichsu_state_v2";
const BT_PROGRESS_KEY = "bt_game_progress";
const GAME_ID = "tro-choi-nhan-vat-lich-su";
const MAX_ATTEMPTS = 3;

function getAttempts() {
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[GAME_ID]?.attempts || 0;
  } catch {
    return 0;
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sanitizeAnswer(answer) {
  if (!answer) return "";
  return answer
    .normalize("NFC")
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTiles(cleanAnswer) {
  const chars = cleanAnswer.replace(/\s/g, "").split("");
  return shuffle(chars);
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncBaiTapProgress(results, totalCount) {
  const answered = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    data[GAME_ID] = {
      answered: Math.max(prev.answered || 0, answered),
      correctCount: Math.max(prev.correctCount || 0, correctCount),
      score: Math.max(prev.score || 0, score),
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function incrementAttempts() {
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    prev.attempts += 1;
    data[GAME_ID] = prev;
    sessionStorage.setItem(BT_PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export default function TroChoiNhanVatLichSu() {
  const { t } = useTranslation();

  const QUESTIONS = useMemo(() => t("minigames.lich_su.questions", { returnObjects: true }), [t]);
  const TOTAL = QUESTIONS.length;

  const [dialog, setDialog] = useState({
    open: false,
    type: "alert",
    title: "",
    message: "",
    action: "none",
  });

  useEffect(() => {
    document.body.classList.add("page-tro-choi-active");
    return () => document.body.classList.remove("page-tro-choi-active");
  }, []);

  const saved = useMemo(() => loadState(), []);

  const [order, setOrder] = useState(() => {
    if (saved?.order && saved.order.length === TOTAL) return saved.order;
    return shuffle(QUESTIONS.map((_, i) => i));
  });

  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState(saved?.results ?? Array(TOTAL).fill(null));
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? Array(TOTAL).fill(false));
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

  const question = QUESTIONS[order[currentQ]] || QUESTIONS[0];
  const cleanAnswer = useMemo(() => sanitizeAnswer(question?.answer), [question]);
  const answerChars = useMemo(() => cleanAnswer.split(""), [cleanAnswer]);
  const answerLetters = useMemo(() => answerChars.filter((c) => c !== " "), [answerChars]);
  const nonSpaceCount = answerLetters.length;

  const [placed, setPlaced] = useState(() => Array(nonSpaceCount).fill(null));
  const [dragging, setDragging] = useState(null);
  const draggingRef = useRef(null);
  const dragStartRef = useRef(null);
  const feedbackRef = useRef(null);

  const tiles = useMemo(() => buildTiles(cleanAnswer), [cleanAnswer]);

  const correctCount = results.filter((r) => r === true).length;
  const wrongCount = results.filter((r) => r === false).length;

  useEffect(() => {
    saveState({ currentQ, results, hintsUsed, finished, order });
    syncBaiTapProgress(results, TOTAL);
  }, [currentQ, results, hintsUsed, finished, order, TOTAL]);

  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);
  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      const ds = dragStartRef.current;
      if (!ds) return;
      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      if (!ds.started && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        ds.started = true;
        setDragging({
          tileIdx: ds.tileIdx,
          x: e.clientX,
          y: e.clientY,
          originX: ds.startX,
          originY: ds.startY,
          snapBack: false,
        });
      } else if (ds.started) {
        e.preventDefault();
        setDragging((prev) => (prev && !prev.snapBack ? { ...prev, x: e.clientX, y: e.clientY } : prev));
      }
    };
    const handlePointerUp = (e) => {
      const ds = dragStartRef.current;
      if (!ds) return;
      dragStartRef.current = null;
      if (!ds.started) {
        if (!feedbackRef.current) {
          setPlaced((prev) => {
            if (prev.includes(ds.tileIdx)) return prev;
            const idx = prev.findIndex((v) => v === null);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = ds.tileIdx;
            return next;
          });
        }
        return;
      }
      const d = draggingRef.current;
      if (!d) {
        setDragging(null);
        return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const boxEl = el?.closest("[data-box-idx]");
      if (boxEl && !feedbackRef.current) {
        const boxIdx = parseInt(boxEl.dataset.boxIdx, 10);
        setPlaced((prev) => {
          if (prev.includes(d.tileIdx)) return prev;
          const next = [...prev];
          if (next[boxIdx] !== null) return prev;
          next[boxIdx] = d.tileIdx;
          return next;
        });
        setDragging(null);
      } else {
        setDragging((prev) => (prev ? { ...prev, x: prev.originX, y: prev.originY, snapBack: true } : null));
        setTimeout(() => setDragging(null), 250);
      }
    };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (results[currentQ] !== null) {
      setFeedback(results[currentQ] ? "correct" : "wrong");
    } else {
      setFeedback(null);
    }
    setPlaced(Array(nonSpaceCount).fill(null));
    setDragging(null);
    dragStartRef.current = null;
  }, [currentQ, nonSpaceCount, results]);

  const handleBoxClick = useCallback((boxIdx) => {
    if (feedback) return;
    setPlaced((prev) => {
      if (prev[boxIdx] === null) return prev;
      const next = [...prev];
      next[boxIdx] = null;
      return next;
    });
  }, [feedback]);

  const handleCheck = useCallback(() => {
    if (placed.some((v) => v === null)) return;
    let placeIdx = 0;
    const playerAnswer = answerChars
      .map((ch) => {
        if (ch === " ") return " ";
        const tileIdx = placed[placeIdx++];
        return tileIdx !== undefined && tileIdx !== null ? tiles[tileIdx] : "";
      })
      .join("");

    const isCorrect = playerAnswer === cleanAnswer;
    if (isCorrect) playAudio("correct");
    else playAudio("wrong");
    setFeedback(isCorrect ? "correct" : "wrong");
    setResults((prev) => {
      const next = [...prev];
      if (next[currentQ] === null) next[currentQ] = isCorrect;
      return next;
    });
  }, [placed, answerChars, tiles, cleanAnswer, currentQ]);

  const handleClear = useCallback(() => {
    if (feedback) return;
    setPlaced(Array(nonSpaceCount).fill(null));
  }, [feedback, nonSpaceCount]);

  const handleNext = useCallback(() => {
    const nextUnanswered = results.findIndex((r, i) => r === null && i > currentQ);
    if (nextUnanswered !== -1) {
      setCurrentQ(nextUnanswered);
      setPlaced(Array(nonSpaceCount).fill(null));
      setFeedback(null);
    } else {
      const beforeUnanswered = results.findIndex((r) => r === null);
      if (beforeUnanswered !== -1) {
        setCurrentQ(beforeUnanswered);
        setPlaced(Array(nonSpaceCount).fill(null));
        setFeedback(null);
      } else {
        incrementAttempts();
        stopBGM();
        playAudio("finish");
        setJustFinished(true);
        setFinished(true);
      }
    }
  }, [currentQ, results, nonSpaceCount, stopBGM]);

  const handleGoTo = useCallback((idx) => {
    setCurrentQ(idx);
    setPlaced(Array(nonSpaceCount).fill(null));
    if (results[idx] !== null) {
      setFeedback(results[idx] ? "correct" : "wrong");
    } else {
      setFeedback(null);
    }
  }, [results, nonSpaceCount]);

  const handleHint = useCallback(() => {
    if (feedback || hintsUsed[currentQ]) return;
    const unfilledPositions = [];
    for (let i = 0; i < answerLetters.length; i++) {
      if (placed[i] === null) unfilledPositions.push(i);
    }
    if (unfilledPositions.length === 0) return;

    const randPos = unfilledPositions[Math.floor(Math.random() * unfilledPositions.length)];
    const targetChar = answerLetters[randPos];
    const tileIdx = tiles.findIndex((t, i) => t === targetChar && !placed.includes(i));
    if (tileIdx !== -1) {
      setPlaced((prev) => {
        const next = [...prev];
        next[randPos] = tileIdx;
        return next;
      });
    }
    setHintsUsed((prev) => {
      const next = [...prev];
      next[currentQ] = true;
      return next;
    });
  }, [feedback, hintsUsed, currentQ, answerLetters, placed, tiles]);

  const handleRestart = useCallback(() => {
    const currentAttempts = getAttempts();
    if (currentAttempts >= MAX_ATTEMPTS) {
      setDialog({
        open: true,
        type: "alert",
        title: t("minigames.lich_su.dialog_out_of_attempts_title"),
        message: t("minigames.lich_su.dialog_out_of_attempts_msg"),
        action: "none",
      });
      return;
    }
    const remaining = MAX_ATTEMPTS - currentAttempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      title: t("minigames.lich_su.dialog_restart_title"),
      message: t("minigames.lich_su.dialog_restart_msg", { count: remaining }),
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
      setPlaced(Array(nonSpaceCount).fill(null));
      setFeedback(null);
      setResults(Array(TOTAL).fill(null));
      setHintsUsed(Array(TOTAL).fill(false));
      setFinished(false);
      setOrder(shuffle(QUESTIONS.map((_, i) => i)));
      sessionStorage.removeItem(STORAGE_KEY);
      playBGM();
    }
    closeDialog();
  }, [dialog, closeDialog, nonSpaceCount, finished, playBGM, TOTAL, QUESTIONS]);

  if (finished) {
    const score = Math.round((correctCount / TOTAL) * 100);
    const stars = correctCount >= 12 ? 3 : correctCount >= 8 ? 2 : correctCount >= 4 ? 1 : 0;
    const endIcon = stars === 3 ? "fa-trophy" : stars === 2 ? "fa-medal" : "fa-star";
    const attemptsLeft = MAX_ATTEMPTS - getAttempts();
    return (
      <div className="tcnv-page">
        {justFinished && <ConfettiOnMount />}
        <div className="tcnv-end">
          <div className="tcnv-end-icon">
            <i className={`fa-solid ${endIcon}`} />
          </div>
          <h2 dangerouslySetInnerHTML={{ __html: t("minigames.lich_su.end_title") }} />
          <p dangerouslySetInnerHTML={{ __html: t("minigames.lich_su.end_stat_msg", { correct: correctCount, total: TOTAL }) }} />

          <div className="tcnv-end-stats">
            <div className="tcnv-end-stat">
              <div className="tcnv-end-stat-num">{score}</div>
              <div className="tcnv-end-stat-label">{t("minigames.lich_su.end_stat_score_label")}</div>
            </div>
            <div className="tcnv-end-stat">
              <div className="tcnv-end-stat-num">{correctCount}/{TOTAL}</div>
              <div className="tcnv-end-stat-label">{t("minigames.lich_su.end_stat_correct_label")}</div>
            </div>
            <div className="tcnv-end-stat">
              <div className="tcnv-end-stat-num">{"⭐".repeat(stars) || "—"}</div>
              <div className="tcnv-end-stat-label">{t("minigames.lich_su.end_stat_rating_label")}</div>
            </div>
          </div>

          <div className="tcnv-end-actions">
            {attemptsLeft > 0 ? (
              <button className="tcnv-end-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" />
                {t("minigames.lich_su.btn_play_again", { count: attemptsLeft })}
              </button>
            ) : (
              <span className="tcnv-end-btn disabled">
                <i className="fa-solid fa-lock" />
                {t("minigames.lich_su.btn_out_of_attempts")}
              </span>
            )}
            <Link to="/bai-tap" className="tcnv-end-btn secondary">
              <i className="fa-solid fa-arrow-left" />
              {t("minigames.lich_su.btn_back_learning")}
            </Link>
          </div>
        </div>

        {dialog.open && (
          <div className="tcnv-dialog-overlay" onClick={closeDialog}>
            <div className="tcnv-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>{dialog.title}</h3>
              <p>{dialog.message}</p>
              <div className="tcnv-dialog-actions">
                {dialog.type === "confirm" && (
                  <button className="tcnv-dialog-btn ghost" onClick={closeDialog}>
                    {t("minigames.lich_su.dialog_btn_cancel")}
                  </button>
                )}
                <button
                  className="tcnv-dialog-btn primary"
                  onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}
                >
                  {dialog.type === "confirm" ? t("minigames.lich_su.dialog_btn_confirm") : t("minigames.lich_su.dialog_btn_ok")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const wordsList = cleanAnswer.split(" ");
  let globalBoxIdx = 0;
  const answerWordGroups = wordsList.map((word, wi) => {
    const boxes = word.split("").map((ch, ci) => {
      const bi = globalBoxIdx;
      globalBoxIdx++;
      const tileIdx = placed[bi];
      const letter = tileIdx !== null && tileIdx !== undefined ? tiles[tileIdx] : "";
      const boxClass = [
        "tcnv-answer-box",
        letter ? "filled" : "",
        feedback === "correct" ? "correct" : "",
        feedback === "wrong" ? "wrong" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div key={`box-${wi}-${ci}`} className={boxClass} data-box-idx={bi} onClick={() => handleBoxClick(bi)}>
          {letter}
        </div>
      );
    });
    return (
      <div key={`word-${wi}`} className="tcnv-answer-word">
        {boxes}
      </div>
    );
  });

  return (
    <div className="tcnv-page">
      <div className="tcnv-topbar">
        <div className="tcnv-topbar-left">
          <Link to="/bai-tap" className="tcnv-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-font" />
              {t("minigames.lich_su.title")}
            </h1>
            <p>{t("minigames.lich_su.subtitle")}</p>
          </div>
        </div>
        <div className="tcnv-score-bar">
          <div className="tcnv-score-item">
            <i className="fa-solid fa-circle-question tcnv-qnum" />
            {currentQ + 1}/{TOTAL}
          </div>
          <div className="tcnv-score-item">
            <i className="fa-solid fa-circle-check tcnv-correct" />
            {correctCount}
          </div>
          <div className="tcnv-score-item">
            <i className="fa-solid fa-circle-xmark tcnv-wrong" />
            {wrongCount}
          </div>
        </div>
      </div>

      <div className={`tcnv-game${dragging ? " dragging" : ""}`}>
        <div className="tcnv-left">
          <div className="tcnv-clue-wrap">
            <div className="tcnv-clue-header">
              <i className="fa-solid fa-quote-left" />
              <span>{t("minigames.lich_su.clue_header", { count: currentQ + 1 })}</span>
              <button
                className="tcnv-hint-btn"
                onClick={handleHint}
                disabled={!!feedback || hintsUsed[currentQ]}
              >
                <i className="fa-solid fa-lightbulb" />
                {t("minigames.lich_su.btn_hint")}
              </button>
            </div>
            <div className="tcnv-clue-content">
              {question?.clue.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <i className="fa-solid fa-quote-right tcnv-quote-right" />
          </div>
        </div>

        <div className="tcnv-right">
          <div className="tcnv-tiles-label">
            <i className="fa-solid fa-puzzle-piece" /> {t("minigames.lich_su.tiles_label")}
          </div>
          <div className="tcnv-tiles-grid">
            {tiles.map((letter, idx) => {
              const isUsed = placed.includes(idx) || (dragging && dragging.tileIdx === idx);
              return (
                <div
                  key={idx}
                  className={`tcnv-tile${isUsed ? " used" : ""}`}
                  onPointerDown={(e) => {
                    if (feedback || placed.includes(idx)) return;
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    dragStartRef.current = {
                      tileIdx: idx,
                      startX: rect.left + rect.width / 2,
                      startY: rect.top + rect.height / 2,
                      started: false,
                    };
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>

          <div className="tcnv-answer-section">
            <div className="tcnv-answer-label">{t("minigames.lich_su.answer_label")}</div>
            <div className="tcnv-answer-row">{answerWordGroups}</div>
          </div>

          {feedback && (
            <div className={`tcnv-feedback ${feedback === "correct" ? "success" : "fail"}`}>
              {feedback === "correct" ? (
                <>
                  <i className="fa-solid fa-check-circle" /> {t("minigames.lich_su.feedback_correct")}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-times-circle" /> {t("minigames.lich_su.feedback_wrong", { answer: cleanAnswer })}
                </>
              )}
            </div>
          )}

          <div className="tcnv-actions">
            {!feedback ? (
              <>
                <button className="tcnv-btn tcnv-btn-check" onClick={handleCheck} disabled={placed.some((v) => v === null)}>
                  <i className="fa-solid fa-paper-plane" />
                  {t("minigames.lich_su.btn_check")}
                </button>
                <button className="tcnv-btn tcnv-btn-clear" onClick={handleClear}>
                  <i className="fa-solid fa-eraser" />
                  {t("minigames.lich_su.btn_clear")}
                </button>
              </>
            ) : (
              <>
                <button className="tcnv-btn tcnv-btn-next" onClick={handleNext}>
                  <i className="fa-solid fa-arrow-right" />
                  {results.some((r) => r === null) ? t("minigames.lich_su.btn_next") : t("minigames.lich_su.btn_summary")}
                </button>
                <button className="tcnv-btn tcnv-btn-clear" onClick={handleRestart}>
                  <i className="fa-solid fa-rotate-right" />
                  {t("minigames.lich_su.btn_restart_game")}
                </button>
              </>
            )}
          </div>

          <div className="tcnv-dots">
            {QUESTIONS.map((_, idx) => {
              let cls = "tcnv-dot";
              if (idx === currentQ) cls += " active";
              if (results[idx] === true) cls += " done-correct";
              if (results[idx] === false) cls += " done-wrong";
              return <button key={idx} className={cls} onClick={() => handleGoTo(idx)} />;
            })}
          </div>
        </div>
      </div>

      {dragging && (
        <div
          className={`tcnv-drag-ghost${dragging.snapBack ? " snap-back" : ""}`}
          style={{ left: dragging.x, top: dragging.y }}
        >
          {tiles[dragging.tileIdx]}
        </div>
      )}

      {dialog.open && (
        <div className="tcnv-dialog-overlay" onClick={closeDialog}>
          <div className="tcnv-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div className="tcnv-dialog-actions">
              {dialog.type === "confirm" && (
                <button className="tcnv-dialog-btn ghost" onClick={closeDialog}>
                  {t("minigames.lich_su.dialog_btn_cancel")}
                </button>
              )}
              <button
                className="tcnv-dialog-btn primary"
                onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}
              >
                {dialog.type === "confirm" ? t("minigames.lich_su.dialog_btn_confirm") : t("minigames.lich_su.dialog_btn_ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
