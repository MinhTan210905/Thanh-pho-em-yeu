import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiAmThuc.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(1);
  }, []);
  return null;
}

/* ═══════════ DATA ═══════════ */
const QUESTIONS = [
  { image: "/images/tro_choi/am_thuc/p01_a7m2q.jpg", answer: "CƠM TẤM" },
  { image: "/images/tro_choi/am_thuc/p02_k9t4n.jpg", answer: "CHÈ THÁI" },
  { image: "/images/tro_choi/am_thuc/p03_r2v8x.jpg", answer: "LẨU CÁ ĐUỐI" },
  { image: "/images/tro_choi/am_thuc/p04_j6w1c.jpg", answer: "CHÈ HỘT GÀ" },
  { image: "/images/tro_choi/am_thuc/p05_m3p7d.jpg", answer: "KEM CHIÊN" },
  { image: "/images/tro_choi/am_thuc/p06_h8s2l.jpg", answer: "BÁNH BÔNG LAN TRỨNG MUỐI" },
  { image: "/images/tro_choi/am_thuc/p07_t5n9b.jpg", answer: "CHÈ CHUỐI" },
  { image: "/images/tro_choi/am_thuc/p08_q4y6f.jpg", answer: "GỎI GÀ MĂNG CUỐN" },
  { image: "/images/tro_choi/am_thuc/p09_u1k3e.jpg", answer: "BÁNH KHỌT" },
  { image: "/images/tro_choi/am_thuc/p10_z7c5r.jpg", answer: "PHỞ" },
];

const EXTRA_LETTERS = "ÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸĐBCDGHKLMNPQRSTVX"
  .toUpperCase()
  .split("")
  .filter((ch) => /\p{L}/u.test(ch));

const STORAGE_KEY = "tc_amthuc_state";
const BT_PROGRESS_KEY = "bt_game_progress";
const MAX_ATTEMPTS = 3;

function getAttempts() {
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data["tro-choi-am-thuc"]?.attempts || 0;
  } catch { return 0; }
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
  return answer
    .normalize("NFC")
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTiles(cleanAnswer) {
  const chars = cleanAnswer.replace(/\s/g, "").split("");
  const extraCount = Math.max(6, 16 - chars.length);
  const extras = [];
  for (let i = 0; i < extraCount; i++) {
    extras.push(EXTRA_LETTERS[Math.floor(Math.random() * EXTRA_LETTERS.length)]);
  }
  return shuffle([...chars, ...extras]);
}

/* ── Session persistence helpers ── */
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

function syncBaiTapProgress(results) {
  const answered = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  const score = correctCount * 10;
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const prev = data["tro-choi-am-thuc"] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    const bestAnswered = Math.max(prev.answered || 0, answered);
    const bestCorrect = Math.max(prev.correctCount || 0, correctCount);
    const bestScore = Math.max(prev.score || 0, score);
    data["tro-choi-am-thuc"] = {
      answered: bestAnswered,
      correctCount: bestCorrect,
      score: bestScore,
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function incrementAttempts() {
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const prev = data["tro-choi-am-thuc"] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    prev.attempts += 1;
    data["tro-choi-am-thuc"] = prev;
    sessionStorage.setItem(BT_PROGRESS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/* ═══════════ COMPONENT ═══════════ */
export default function TroChoiAmThuc() {
  const [dialog, setDialog] = useState({
    open: false,
    type: "alert",
    title: "",
    message: "",
    action: "none",
  });

  /* White header override */
  useEffect(() => {
    document.body.classList.add("page-tro-choi-active");
    return () => document.body.classList.remove("page-tro-choi-active");
  }, []);

  /* Restore or init state */
  const saved = useMemo(() => loadState(), []);

  /* Shuffled question order — persisted so "continue" keeps same order */
  const [order, setOrder] = useState(() => {
    if (saved?.order) return saved.order;
    return shuffle(QUESTIONS.map((_, i) => i));
  });

  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState(saved?.results ?? Array(QUESTIONS.length).fill(null));
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? Array(QUESTIONS.length).fill(false));
  const [finished, setFinished] = useState(saved?.finished ?? false);
  const [justFinished, setJustFinished] = useState(false);

  const question = QUESTIONS[order[currentQ]];
  const cleanAnswer = sanitizeAnswer(question.answer);
  const answerChars = cleanAnswer.split("");
  const answerLetters = answerChars.filter((c) => c !== " ");
  const nonSpaceCount = answerLetters.length;
  const [placed, setPlaced] = useState(() => Array(nonSpaceCount).fill(null));
  const [dragging, setDragging] = useState(null);
  const draggingRef = useRef(null);
  const dragStartRef = useRef(null);
  const feedbackRef = useRef(null);

  const tiles = useMemo(() => buildTiles(cleanAnswer), [cleanAnswer]);

  const correctCount = results.filter((r) => r === true).length;
  const wrongCount = results.filter((r) => r === false).length;

  /* Save state whenever it changes */
  useEffect(() => {
    saveState({ currentQ, results, hintsUsed, finished, order });
    syncBaiTapProgress(results);
  }, [currentQ, results, hintsUsed, finished, order]);

  /* Keep refs in sync */
  useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  useEffect(() => { feedbackRef.current = feedback; }, [feedback]);

  /* Global pointer handlers for custom drag */
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
        setDragging((prev) =>
          prev && !prev.snapBack ? { ...prev, x: e.clientX, y: e.clientY } : prev
        );
      }
    };
    const handlePointerUp = (e) => {
      const ds = dragStartRef.current;
      if (!ds) return;
      dragStartRef.current = null;
      if (!ds.started) {
        /* Tap — place in leftmost empty box */
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
      /* Was a drag */
      const d = draggingRef.current;
      if (!d) { setDragging(null); return; }
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
        setDragging((prev) =>
          prev ? { ...prev, x: prev.originX, y: prev.originY, snapBack: true } : null
        );
        setTimeout(() => setDragging(null), 250);
      }
    };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* If returning to an already-answered question, show feedback */
  useEffect(() => {
    if (results[currentQ] !== null) {
      setFeedback(results[currentQ] ? "correct" : "wrong");
    } else {
      setFeedback(null);
    }
    setPlaced(Array(nonSpaceCount).fill(null));
    setDragging(null);
    dragStartRef.current = null;
  }, [currentQ, nonSpaceCount]);

  /* ── Handlers ── */
  const handleBoxClick = useCallback(
    (boxIdx) => {
      if (feedback) return;
      setPlaced((prev) => {
        if (prev[boxIdx] === null) return prev;
        const next = [...prev];
        next[boxIdx] = null;
        return next;
      });
    },
    [feedback]
  );

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
    setFeedback(isCorrect ? "correct" : "wrong");
    setResults((prev) => {
      const next = [...prev];
      if (next[currentQ] === null) next[currentQ] = isCorrect;
      return next;
    });
  }, [placed, answerChars, tiles, question.answer, currentQ]);

  const handleClear = useCallback(() => {
    if (feedback) return;
    setPlaced(Array(nonSpaceCount).fill(null));
  }, [feedback, nonSpaceCount]);

  const handleNext = useCallback(() => {
    // Go to next unanswered question, or finish
    const nextUnanswered = results.findIndex((r, i) => r === null && i > currentQ);
    if (nextUnanswered !== -1) {
      setCurrentQ(nextUnanswered);
      setPlaced(Array(nonSpaceCount).fill(null));
      setFeedback(null);
    } else {
      // Check if there are unanswered questions before current
      const beforeUnanswered = results.findIndex((r) => r === null);
      if (beforeUnanswered !== -1) {
        setCurrentQ(beforeUnanswered);
        setPlaced(Array(nonSpaceCount).fill(null));
        setFeedback(null);
      } else {
        // All answered -> finish + count attempt
        incrementAttempts();
        setFinished(true);
      }
    }
  }, [currentQ, results, nonSpaceCount]);

  const handleGoTo = useCallback(
    (idx) => {
      setCurrentQ(idx);
      setPlaced(Array(nonSpaceCount).fill(null));
      if (results[idx] !== null) {
        setFeedback(results[idx] ? "correct" : "wrong");
      } else {
        setFeedback(null);
      }
    },
    [results, nonSpaceCount]
  );

  const handleHint = useCallback(() => {
    if (feedback || hintsUsed[currentQ]) return;
    const unfilledPositions = [];
    for (let i = 0; i < answerLetters.length; i++) {
      if (placed[i] === null) unfilledPositions.push(i);
    }
    if (unfilledPositions.length === 0) return;

    const randPos = unfilledPositions[Math.floor(Math.random() * unfilledPositions.length)];
    const targetChar = answerLetters[randPos];
    const tileIdx = tiles.findIndex(
      (t, i) => t === targetChar && !placed.includes(i)
    );
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
        title: "Hết lượt chơi",
        message: "Bạn đã hết lượt chơi cho Đuổi hình bắt chữ!",
        action: "none",
      });
      return;
    }
    const remaining = MAX_ATTEMPTS - currentAttempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      title: "Bắt đầu lượt mới?",
      message: `Đây sẽ là lượt chơi mới, không phải làm lại lượt cũ. Sau lượt này, bạn còn ${remaining} lượt nữa.`,
      action: "restart",
    });
  }, []);

  const handleQuickComplete = useCallback(() => {
    if (finished) return;
    incrementAttempts();
    setResults(Array(QUESTIONS.length).fill(true));
    setHintsUsed(Array(QUESTIONS.length).fill(false));
    setFeedback(null);
    setCurrentQ(0);
    setPlaced(Array(nonSpaceCount).fill(null));
    setFinished(true);
    setJustFinished(true);
  }, [nonSpaceCount, finished]);

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
      setResults(Array(QUESTIONS.length).fill(null));
      setHintsUsed(Array(QUESTIONS.length).fill(false));
      setFinished(false);
      setJustFinished(false);
      setOrder(shuffle(QUESTIONS.map((_, i) => i)));
      sessionStorage.removeItem(STORAGE_KEY);
    }
    closeDialog();
  }, [dialog, closeDialog, nonSpaceCount]);

  /* ── Render END screen ── */
  if (finished) {
    const score = correctCount * 10;
    const stars = correctCount >= 8 ? 3 : correctCount >= 5 ? 2 : correctCount >= 3 ? 1 : 0;
    const endIcon =
      stars === 3 ? "fa-trophy" : stars === 2 ? "fa-medal" : "fa-star";
    const attemptsLeft = MAX_ATTEMPTS - getAttempts();
    return (
      <div className="tc-page">
        {justFinished && <ConfettiOnMount />}
        <div className="tc-end">
          <div className="tc-end-icon">
            <i className={`fa-solid ${endIcon}`} />
          </div>
          <h2>
            Hoàn Thành <span>Đuổi Hình Bắt Chữ!</span>
          </h2>
          <p>
            Bạn đã trả lời đúng <strong>{correctCount}/{QUESTIONS.length}</strong> câu hỏi về các
            món ăn đặc trưng của Sài Gòn.
          </p>

          <div className="tc-end-stats">
            <div className="tc-end-stat">
              <div className="tc-end-stat-num">{score}</div>
              <div className="tc-end-stat-label">Điểm</div>
            </div>
            <div className="tc-end-stat">
              <div className="tc-end-stat-num">{correctCount}/{QUESTIONS.length}</div>
              <div className="tc-end-stat-label">Câu đúng</div>
            </div>
            <div className="tc-end-stat">
              <div className="tc-end-stat-num">{"⭐".repeat(stars) || "—"}</div>
              <div className="tc-end-stat-label">Đánh giá</div>
            </div>
          </div>

          <div className="tc-end-actions">
            {attemptsLeft > 0 ? (
              <button className="tc-end-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" />
                Chơi lại ({attemptsLeft} lượt còn lại)
              </button>
            ) : (
              <span className="tc-end-btn disabled">
                <i className="fa-solid fa-lock" />
                Hết lượt chơi
              </span>
            )}
            <Link to="/bai-tap" className="tc-end-btn secondary">
              <i className="fa-solid fa-arrow-left" />
              Quay về Bài tập
            </Link>
          </div>
        </div>

        {dialog.open && (
          <div className="tc-dialog-overlay" onClick={closeDialog}>
            <div className="tc-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>{dialog.title}</h3>
              <p>{dialog.message}</p>
              <div className="tc-dialog-actions">
                {dialog.type === "confirm" && (
                  <button className="tc-dialog-btn ghost" onClick={closeDialog}>
                    Hủy
                  </button>
                )}
                <button className="tc-dialog-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                  {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Build answer boxes grouped by word ── */
  const words = cleanAnswer.split(" ");
  let globalBoxIdx = 0;
  const answerWordGroups = words.map((word, wi) => {
    const boxes = word.split("").map((ch, ci) => {
      const bi = globalBoxIdx;
      globalBoxIdx++;
      const tileIdx = placed[bi];
      const letter = tileIdx !== null && tileIdx !== undefined ? tiles[tileIdx] : "";
      const boxClass = [
        "tc-answer-box",
        letter ? "filled" : "",
        feedback === "correct" ? "correct" : "",
        feedback === "wrong" ? "wrong" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div
          key={`box-${wi}-${ci}`}
          className={boxClass}
          data-box-idx={bi}
          onClick={() => handleBoxClick(bi)}
        >
          {letter}
        </div>
      );
    });
    return (
      <div key={`word-${wi}`} className="tc-answer-word">
        {boxes}
      </div>
    );
  });

  return (
    <div className="tc-page">
      {/* ── TOP BAR ── */}
      <div className="tc-topbar">
        <div className="tc-topbar-left">
          <Link to="/bai-tap" className="tc-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-images" />
              Đuổi Hình Bắt Chữ
            </h1>
            <p>Nhìn hình đoán tên món ăn Sài Gòn</p>
          </div>
        </div>
        <div className="tc-score-bar">
          <div className="tc-score-item">
            <i className="fa-solid fa-circle-question tc-qnum" />
            {currentQ + 1}/{QUESTIONS.length}
          </div>
          <div className="tc-score-item">
            <i className="fa-solid fa-circle-check tc-correct" />
            {correctCount}
          </div>
          <div className="tc-score-item">
            <i className="fa-solid fa-circle-xmark tc-wrong" />
            {wrongCount}
          </div>
          <button className="tc-dev-btn" onClick={handleQuickComplete}>
            <i className="fa-solid fa-bolt" />
            Xong nhanh
          </button>
        </div>
      </div>

      {/* ── GAME AREA ── */}
      <div className={`tc-game${dragging ? " dragging" : ""}`}>
        {/* Left: image only */}
        <div className="tc-left">
          <div className="tc-image-wrap">
            <img src={question.image} alt="Món ăn" />
            <div className="tc-image-number">{currentQ + 1}</div>
            <button
              className="tc-hint-btn"
              onClick={handleHint}
              disabled={!!feedback || hintsUsed[currentQ]}
            >
              <i className="fa-solid fa-lightbulb" />
              Gợi ý
            </button>
          </div>
        </div>

        {/* Right: tiles + answer + actions */}
        <div className="tc-right">
          <div className="tc-tiles-label">Chọn chữ cái</div>
          <div className="tc-tiles-grid">
            {tiles.map((letter, idx) => {
              const isUsed = placed.includes(idx) || (dragging && dragging.tileIdx === idx);
              return (
                <div
                  key={idx}
                  className={`tc-tile${isUsed ? " used" : ""}`}
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

          {/* Answer boxes - now on right below tiles */}
          <div className="tc-answer-section">
            <div className="tc-answer-label">Đáp án</div>
            <div className="tc-answer-row">{answerWordGroups}</div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`tc-feedback ${feedback === "correct" ? "success" : "fail"}`}>
              {feedback === "correct" ? (
                <>
                  <i className="fa-solid fa-check-circle" /> Chính xác! 🎉
                </>
              ) : (
                <>
                  <i className="fa-solid fa-times-circle" /> Sai rồi! Đáp án: {cleanAnswer}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="tc-actions">
            {!feedback ? (
              <>
                <button
                  className="tc-btn tc-btn-check"
                  onClick={handleCheck}
                  disabled={placed.some((v) => v === null)}
                >
                  <i className="fa-solid fa-paper-plane" />
                  Kiểm tra
                </button>
                <button className="tc-btn tc-btn-clear" onClick={handleClear}>
                  <i className="fa-solid fa-eraser" />
                  Xoá hết
                </button>
              </>
            ) : (
              <>
                <button className="tc-btn tc-btn-next" onClick={handleNext}>
                  <i className="fa-solid fa-arrow-right" />
                  {results.some((r) => r === null) ? "Câu tiếp theo" : "Xem kết quả"}
                </button>
                <button className="tc-btn tc-btn-clear" onClick={handleRestart}>
                  <i className="fa-solid fa-rotate-right" />
                  Chơi lại từ đầu
                </button>
              </>
            )}
          </div>

          {/* Question dots */}
          <div className="tc-dots">
            {QUESTIONS.map((_, idx) => {
              let cls = "tc-dot";
              if (idx === currentQ) cls += " active";
              if (results[idx] === true) cls += " done-correct";
              if (results[idx] === false) cls += " done-wrong";
              return <button key={idx} className={cls} onClick={() => handleGoTo(idx)} />;
            })}
          </div>
        </div>
      </div>

      {/* Drag ghost */}
      {dragging && (
        <div
          className={`tc-drag-ghost${dragging.snapBack ? " snap-back" : ""}`}
          style={{ left: dragging.x, top: dragging.y }}
        >
          {tiles[dragging.tileIdx]}
        </div>
      )}

      {dialog.open && (
        <div className="tc-dialog-overlay" onClick={closeDialog}>
          <div className="tc-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div className="tc-dialog-actions">
              {dialog.type === "confirm" && (
                <button className="tc-dialog-btn ghost" onClick={closeDialog}>
                  Hủy
                </button>
              )}
              <button className="tc-dialog-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
