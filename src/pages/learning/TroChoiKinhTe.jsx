import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiKinhTe.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(3);
  }, []);
  return null;
}

const AUDIO_MAP = {
  start: "/audio/startKinhTe.mp3",
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

function generateWordSearch(wordsObjArray, alphabet, size = 15) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const alphabetArray = alphabet.split("");
  
  // Dành cho tiểu học: chỉ cho phép các hướng cơ bản (trái->phải, trên->dưới, chéo xuống)
  const dirs = [
    [0, 1], [1, 0], [1, 1]
  ];

  for (const wordObj of wordsObjArray) {
    const word = wordObj.text;
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      
      const rStart = Math.floor(Math.random() * size);
      const cStart = Math.floor(Math.random() * size);
      
      const rEnd = rStart + dr * (word.length - 1);
      const cEnd = cStart + dc * (word.length - 1);
      
      if (rEnd >= 0 && rEnd < size && cEnd >= 0 && cEnd < size) {
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const r = rStart + dr * i;
          const c = cStart + dc * i;
          if (grid[r][c] !== null && grid[r][c] !== word[i]) {
            fits = false;
            break;
          }
        }
        if (fits) {
          for (let i = 0; i < word.length; i++) {
            grid[rStart + dr * i][cStart + dc * i] = word[i];
          }
          placed = true;
        }
      }
    }
    if (!placed) {
      console.warn("Could not place", word);
    }
  }
  
  // Fill remaining nulls
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = alphabetArray[Math.floor(Math.random() * alphabetArray.length)];
      }
    }
  }
  return grid;
}

const GAME_ID = "tro-choi-kinh-te";
const STATE_KEY = "tc_kinh_te_state_v3"; // Incremented version to force clear old state
const BT_KEY = "bt_game_progress";
const MAX_ATTEMPTS = 3;

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
  const correctCount = results.filter((r) => r === true).length;
  const score = Math.round((correctCount / total) * 100);
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

function getLineCells(r1, c1, r2, c2) {
  let dr = r2 - r1;
  let dc = c2 - c1;
  let steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [{ r: r1, c: c1 }];

  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) {
    if (Math.abs(dr) > Math.abs(dc)) {
      dc = 0;
    } else {
      dr = 0;
    }
    steps = Math.max(Math.abs(dr), Math.abs(dc));
  }

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  const cells = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ r: r1 + i * stepR, c: c1 + i * stepC });
  }
  return cells;
}

export default function TroChoiKinhTe() {
  const { t, i18n } = useTranslation();

  const TARGET_WORDS = useMemo(() => t("minigames.kinh_te.words", { returnObjects: true }), [t]);
  const ALPHABET = useMemo(() => t("minigames.kinh_te.alphabet"), [t]);
  const TOTAL = TARGET_WORDS.length;

  const saved = useMemo(() => {
    const s = loadState();
    // If language changed, we shouldn't use the old grid
    if (s && s.lng !== i18n.language) return null;
    return s;
  }, [i18n.language]);

  const [grid, setGrid] = useState(saved?.grid || generateWordSearch(TARGET_WORDS, ALPHABET));
  const [screen, setScreen] = useState(saved?.screen ?? "play");
  const [results, setResults] = useState(saved?.results ?? Array(TOTAL).fill(null));
  const [foundPaths, setFoundPaths] = useState(saved?.foundPaths ?? []);
  
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTwoClickMode, setIsTwoClickMode] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });

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
    if (screen !== "finish") {
      playBGM();
    } else {
      stopBGM();
    }
  }, [screen, playBGM, stopBGM]);

  useEffect(() => {
    return () => stopBGM();
  }, [stopBGM]);

  const finishedRef = useRef(saved?.finishedOnce ?? false);

  const correctCount = results.filter((r) => r === true).length;
  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  useEffect(() => {
    document.body.classList.add("page-tro-choi-kinh-te-active");
    return () => document.body.classList.remove("page-tro-choi-kinh-te-active");
  }, []);

  useEffect(() => {
    saveState({ screen, results, foundPaths, grid, finishedOnce: finishedRef.current, lng: i18n.language });
    syncProgress(results, TOTAL);
  }, [screen, results, foundPaths, grid, i18n.language, TOTAL]);

  const handleViewSummary = useCallback(() => {
    if (!finishedRef.current) {
      incrementAttempts();
      finishedRef.current = true;
    }
    stopBGM();
    playAudio("finish");
    setJustFinished(true);
    setScreen("finish");
  }, [stopBGM]);

  const doRestart = useCallback(() => {
    sessionStorage.removeItem(STATE_KEY);
    finishedRef.current = false;
    setScreen("play");
    setResults(Array(TOTAL).fill(null));
    setFoundPaths([]);
    setGrid(generateWordSearch(TARGET_WORDS, ALPHABET));
    setIsTwoClickMode(false);
    setJustFinished(false);
    playBGM();
  }, [playBGM, TOTAL, TARGET_WORDS, ALPHABET]);

  const handleRestart = useCallback(() => {
    const attempts = getAttempts();
    if (attempts >= MAX_ATTEMPTS) {
      setDialog({ 
        open: true, 
        type: "alert", 
        title: t("minigames.kinh_te.dialog_out_of_attempts_title"), 
        message: t("minigames.kinh_te.dialog_out_of_attempts_msg") 
      });
      return;
    }
    const remaining = MAX_ATTEMPTS - attempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      title: t("minigames.kinh_te.dialog_restart_title"),
      message: t("minigames.kinh_te.dialog_restart_msg", { count: remaining }),
      action: "restart",
    });
  }, [t]);

  const closeDialog = useCallback(() => setDialog({ open: false, type: "", title: "", message: "", action: "" }), []);

  const confirmDialog = useCallback(() => {
    if (dialog.action === "restart") doRestart();
    closeDialog();
  }, [dialog, doRestart, closeDialog]);

  const handlePointerDown = (r, c) => {
    if (screen !== "play") return;

    if (isTwoClickMode && dragStart) {
      const finalEnd = { r, c };
      processWord(dragStart, finalEnd);
      return;
    }

    setIsDragging(true);
    setIsTwoClickMode(false);
    setDragStart({ r, c });
    setDragEnd({ r, c });
  };

  const handlePointerEnter = (r, c) => {
    if (screen !== "play") return;
    if (isDragging || isTwoClickMode) {
      setDragEnd({ r, c });
    }
  };

  const processWord = (start, end) => {
    const line = getLineCells(start.r, start.c, end.r, end.c);
    const wordFormed = line.map(cell => grid[cell.r][cell.c]).join('');
    const wordReversed = wordFormed.split('').reverse().join('');

    let matchIdx = -1;
    for (let i = 0; i < TARGET_WORDS.length; i++) {
        if (results[i] === true) continue;
        if (TARGET_WORDS[i].text === wordFormed || TARGET_WORDS[i].text === wordReversed) {
            matchIdx = i;
            break;
        }
    }

    if (matchIdx !== -1) {
        playAudio("correct");
        setResults(prev => {
            const next = [...prev];
            next[matchIdx] = true;
            return next;
        });
        setFoundPaths(prev => [...prev, line]);
    }

    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
    setIsTwoClickMode(false);
  };

  const handlePointerUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;

    const isSameCell = dragStart.r === dragEnd.r && dragStart.c === dragEnd.c;

    if (isSameCell) {
      setIsDragging(false);
      setIsTwoClickMode(true);
    } else {
      processWord(dragStart, dragEnd);
    }
  };

  useEffect(() => {
    const onGlobalMouseUp = () => {
        if (isDragging) handlePointerUp();
    };
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setDragStart(null);
            setDragEnd(null);
            setIsDragging(false);
            setIsTwoClickMode(false);
        }
    };
    window.addEventListener("pointerup", onGlobalMouseUp);
    window.addEventListener("pointercancel", onGlobalMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerup", onGlobalMouseUp);
      window.removeEventListener("pointercancel", onGlobalMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDragging, dragStart, dragEnd]);

  const currentSelectionLine = (dragStart && dragEnd) 
    ? getLineCells(dragStart.r, dragStart.c, dragEnd.r, dragEnd.c)
    : [];

  const isCellSelected = (r, c) => {
    return currentSelectionLine.some(cell => cell.r === r && cell.c === c);
  };

  const getFoundColorIndex = (r, c) => {
    for (let i = 0; i < foundPaths.length; i++) {
        if (foundPaths[i].some(cell => cell.r === r && cell.c === c)) {
            return i;
        }
    }
    return -1;
  };

  if (screen === "finish") {
    const score = Math.round((correctCount / TOTAL) * 100);
    const stars = correctCount >= 4 ? 3 : correctCount >= 3 ? 2 : correctCount >= 1 ? 1 : 0;
    
    return (
      <div className="tk-page">
        {justFinished && correctCount === TOTAL && <ConfettiOnMount />}
        <div className="tk-done">
          <div className="tk-done-icon">
            <i className="fa-solid fa-gamepad" />
          </div>
          <h2 dangerouslySetInnerHTML={{ __html: t("minigames.kinh_te.end_title") }} />
          <p dangerouslySetInnerHTML={{ __html: t("minigames.kinh_te.end_stat_words", { correct: correctCount, total: TOTAL }) }} />
          
          <div className="tk-done-stats">
              <div className="tk-done-stat">
                  <div className="tk-done-stat-num">{score}</div>
                  <div className="tk-done-stat-label">{t("minigames.kinh_te.end_stat_score_label")}</div>
              </div>
              <div className="tk-done-stat">
                  <div className="tk-done-stat-num">{correctCount}/{TOTAL}</div>
                  <div className="tk-done-stat-label">{t("minigames.kinh_te.end_stat_correct_label")}</div>
              </div>
              <div className="tk-done-stat">
                  <div className="tk-done-stat-num">
                      {stars === 3 ? "⭐⭐⭐" : stars === 2 ? "⭐⭐" : stars === 1 ? "⭐" : "—"}
                  </div>
                  <div className="tk-done-stat-label">{t("minigames.kinh_te.end_stat_rating_label")}</div>
              </div>
          </div>

          <div className="tk-done-actions">
            {attemptsLeft > 0 ? (
              <button className="tk-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" /> {t("minigames.kinh_te.btn_play_again", { count: attemptsLeft })}
              </button>
            ) : (
              <span className="tk-btn disabled">
                <i className="fa-solid fa-lock" /> {t("minigames.kinh_te.btn_out_of_attempts")}
              </span>
            )}
            <Link to="/bai-tap" className="tk-btn ghost">
              <i className="fa-solid fa-arrow-left" /> {t("minigames.kinh_te.btn_back_learning")}
            </Link>
          </div>
        </div>

        {dialog.open && (
            <div className="tk-dialog-overlay" onClick={closeDialog}>
                <div className="tk-dialog" onClick={(e) => e.stopPropagation()}>
                    <h3>{dialog.title}</h3>
                    <p>{dialog.message}</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                        {dialog.type === "confirm" && (
                            <button className="tk-dlg-btn ghost" onClick={closeDialog}>
                                {t("minigames.kinh_te.dialog_btn_cancel")}
                            </button>
                        )}
                        <button className="tk-dlg-btn blue" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                            {dialog.type === "confirm" ? t("minigames.kinh_te.dialog_btn_confirm") : t("minigames.kinh_te.dialog_btn_ok")}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="tk-page">
      <div className="tk-topbar">
        <div className="tk-topbar-left">
            <Link to="/bai-tap" className="tk-back">
                <i className="fa-solid fa-arrow-left" />
            </Link>
            <div>
                <h1>
                    <i className="fa-solid fa-search" /> {t("minigames.kinh_te.title")}
                </h1>
                <p>{t("minigames.kinh_te.subtitle", { count: TOTAL })}</p>
            </div>
        </div>
        <div className="tk-topbar-right">
            <div className="tk-chip tk-chip-score">
                <i className="fa-solid fa-circle-check" /> {correctCount}/{TOTAL}
            </div>
            <button className="tk-chip" onClick={handleRestart} style={{cursor: "pointer", border: "1px dashed var(--tk-primary)"}} title={t("minigames.kinh_te.chip_attempts")}>
                <i className="fa-solid fa-rotate" /> {getAttempts()}/{MAX_ATTEMPTS}
            </button>
        </div>
      </div>

      <section className="tk-stage tk-play">
          <div className="tk-game-layout">
              {/* Board */}
              <div className="tk-board-container" onPointerLeave={() => { setIsDragging(false); setDragStart(null); setDragEnd(null); }}>
                  <div className="tk-grid">
                      {grid.map((row, r) => 
                          row.map((letter, c) => {
                              const selected = isCellSelected(r, c);
                              const foundIdx = getFoundColorIndex(r, c);
                              const isStartPivot = isTwoClickMode && dragStart && dragStart.r === r && dragStart.c === c;

                              let cls = "tk-cell";
                              if (selected) cls += " selected";
                              if (isStartPivot) cls += " start-pivot";
                              if (!selected && foundIdx !== -1) cls += ` found found-color-${foundIdx % 5}`;

                              return (
                                  <div 
                                      key={`${r}-${c}`} 
                                      className={cls}
                                      onPointerDown={(e) => { e.preventDefault(); handlePointerDown(r, c); }}
                                      onPointerEnter={() => handlePointerEnter(r, c)}
                                  >   
                                      <span className="tk-letter">{letter}</span>
                                  </div>
                              );
                          })
                      )}
                  </div>
              </div>

              {/* Sidebar Words */}
              <div className="tk-sidebar">
                  <h3 className="tk-sidebar-title">{t("minigames.kinh_te.sidebar_title")}</h3>
                  <ul className="tk-word-list">
                      {TARGET_WORDS.map((w, i) => (
                          <li key={i} className={`tk-word-item ${results[i] ? "found" : ""}`}>
                              {results[i] ? <i className="fa-solid fa-check-circle tk-word-check"></i> : <i className="fa-regular fa-circle tk-word-uncheck"></i>}
                              <span>{w.display}</span>
                          </li>
                      ))}
                  </ul>

                  {correctCount === TOTAL && (
                      <div className="tk-play-actions">
                          <button className="tk-btn primary tk-summary-btn glow" onClick={handleViewSummary}>
                              <i className="fa-solid fa-star" /> {t("minigames.kinh_te.btn_view_result")}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </section>

      {dialog.open && (
        <div className="tk-dialog-overlay" onClick={closeDialog}>
            <div className="tk-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>{dialog.title}</h3>
                <p>{dialog.message}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                    {dialog.type === "confirm" && (
                        <button className="tk-dlg-btn ghost" onClick={closeDialog}>
                            {t("minigames.kinh_te.dialog_btn_cancel")}
                        </button>
                    )}
                    <button className="tk-dlg-btn blue" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                        {dialog.type === "confirm" ? t("minigames.kinh_te.dialog_btn_confirm") : t("minigames.kinh_te.dialog_btn_ok")}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
