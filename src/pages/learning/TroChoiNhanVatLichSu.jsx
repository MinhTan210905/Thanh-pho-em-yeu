import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiNhanVatLichSu.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(1);
  }, []);
  return null;
}

/* ═══════════ DATA ═══════════ */
const QUESTIONS = [
  {
    clue: "Tuổi chưa tròn mười bảy\nTóc chưa chấm ngang vai\nMột thiếu nữ mảnh mai\nNhưng hiên ngang, bất khuất\nCả nước đều quen biết\nTên chị nữ anh hùng.\nĐó là ai?",
    answer: "VÕ THỊ SÁU",
  },
  {
    clue: "Nhân vật nào được gọi là “Ông tổ” đặc công?",
    answer: "TRẦN CÔNG AN",
  },
  {
    clue: "Trong lễ kỷ niệm Cách mạng tháng mười Nga, Ông phát biểu kêu gọi nhân dân ủng hộ Liên bang Xô viết, kêu gọi tinh thần Cách mạng tháng Mười Nga và tinh thần yêu nước, chống Pháp. Sau đó, Ông bị bắt và phải lãnh án 5 năm tù giam, 10 năm đày biệt xứ.\nĐó là ai?",
    answer: "NGUYỄN VĂN TIẾT",
  },
  {
    clue: "Nhân vật nào từng giữ những chức vụ quan trọng của Đảng và Nhà nước như:\n- Bí thư Xứ uỷ Nam Bộ (1945)\n- Chủ tịch Uỷ ban Toàn quốc Mặt trận Liên Việt (1951 – 1955)\n- Trưởng ban Thường trực Quốc hội (1955 – 1960)\n- Chủ tịch nước (1969 – 1980)\nĐó là ai?",
    answer: "TÔN ĐỨC THẮNG",
  },
  {
    clue: "“Thà hy sinh chứ không để thương binh bị thương lần thứ hai”\nNgười đã nói câu nói này là ai?",
    answer: "ĐOÀN THỊ LIÊN",
  },
  {
    clue: "Năm 1943, ông là Bí thư Tỉnh uỷ (lâm thời) Thủ Dầu Một, đã lãnh đạo nhân dân trong tỉnh nổi dậy giành chính quyền thành công trong cách mạng tháng Tám năm 1945.\nĐó là ai?",
    answer: "VĂN CÔNG KHAI",
  },
  {
    clue: "Ngày 5/6/1911, từ bến cảng Nhà Rồng, có một người thanh niên yêu nước đã quyết định lên con tàu Amiral Latouche Tréville và ra đi tìm đường cứu nước. Đó là ai?",
    answer: "HỒ CHÍ MINH",
  },
  {
    clue: "Nhân vật nào được Nhà nước truy tặng danh hiệu Anh hùng Lực lượng vũ trang nhân dân vào năm 2001?",
    answer: "TRẦN VĂN THƯỢNG",
  },
  {
    clue: "Ngày 10 – 4 – 2001, được truy tặng danh hiệu Anh hùng lực lượng vũ trang nhân dân. Tên của bà đã được dùng để đặt tên cho công viên, trường học,… tại Thành phố Hồ Chí Minh. Đó là ai?",
    answer: "LÊ THỊ RIÊNG",
  },
  {
    clue: "Nhân vật nào vào năm 1929 được kết nạp vào Đảng và trở thành Tổng Bí thư của Đảng từ tháng 3 – 1938. Đó là ai?",
    answer: "NGUYỄN VĂN CỪ",
  },
  {
    clue: "Năm 1955 – 1956, khi phong trào cách mạng của miền Nam bắt đầu phát triển trở lại, cả gia đình Cô tiếp tục tham gia vận động móc nối xây dựng cơ sở cách mạng, cũng như trực tiếp che giấu cán bộ. Dù tuổi nhỏ nhưng Cô không ngại hiểm nguy để canh gác, dò la tình hình quân địch, rải truyền đơn.\nĐó là ai?",
    answer: "HUỲNH THỊ CHẤU",
  },
  {
    clue: "Nhân vật nào là tác giả của bộ Gia Định thành thông chí - bộ sách lịch sử, địa lý, văn hóa ra đời sớm và giá trị nhất về miền Nam Bộ thời bấy giờ?",
    answer: "TRỊNH HOÀI ĐỨC",
  },
  {
    clue: "Ông được UNESCO chính thức vinh danh là nhà thơ, nhà văn hóa lớn của nhân loại vào cuối tháng 11/2021",
    answer: "NGUYỄN ĐÌNH CHIỂU",
  },
  {
    clue: "Ngày 20 – 12 – 1994, được Nhà nước truy tặng danh hiệu Anh hùng Lực lượng vũ trang nhân dân. Đó là ai?",
    answer: "CHÂU VĂN BIẾC",
  },
];

const STORAGE_KEY = "tc_nhanvatlichsu_state";
const BT_PROGRESS_KEY = "bt_game_progress";
const MAX_ATTEMPTS = 3;

function getAttempts() {
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data["tro-choi-nhan-vat-lich-su"]?.attempts || 0;
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
  return answer
    .normalize("NFC")
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTiles(cleanAnswer) {
  // Chỉ dùng các chữ cái trong đáp án, không thêm EXTRA_LETTERS
  const chars = cleanAnswer.replace(/\s/g, "").split("");
  return shuffle(chars);
}

/* ── Session persistence helpers ── */
function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function saveState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncBaiTapProgress(results) {
  const answered = results.filter((r) => r !== null).length;
  const correctCount = results.filter((r) => r === true).length;
  // Hệ thống thang điểm 100 cho toàn bộ đúng 14 câu
  const score = Math.round((correctCount / QUESTIONS.length) * 100);
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const prev = data["tro-choi-nhan-vat-lich-su"] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    const bestAnswered = Math.max(prev.answered || 0, answered);
    const bestCorrect = Math.max(prev.correctCount || 0, correctCount);
    const bestScore = Math.max(prev.score || 0, score);
    data["tro-choi-nhan-vat-lich-su"] = {
      answered: bestAnswered,
      correctCount: bestCorrect,
      score: bestScore,
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_PROGRESS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function incrementAttempts() {
  try {
    const raw = sessionStorage.getItem(BT_PROGRESS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const prev = data["tro-choi-nhan-vat-lich-su"] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    prev.attempts += 1;
    data["tro-choi-nhan-vat-lich-su"] = prev;
    sessionStorage.setItem(BT_PROGRESS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/* ═══════════ COMPONENT ═══════════ */
export default function TroChoiNhanVatLichSu() {
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
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);
  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

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
        setDragging((prev) => (prev && !prev.snapBack ? { ...prev, x: e.clientX, y: e.clientY } : prev));
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
  }, [currentQ, nonSpaceCount, results]);

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
  }, [placed, answerChars, tiles, cleanAnswer, currentQ]);

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
        title: "Hết lượt chơi",
        message: "Bạn đã hết lượt chơi cho trò chơi này!",
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
      setOrder(shuffle(QUESTIONS.map((_, i) => i)));
      sessionStorage.removeItem(STORAGE_KEY);
    }
    closeDialog();
  }, [dialog, closeDialog, nonSpaceCount, finished]);

  /* ── Render END screen ── */
  if (finished) {
    const score = Math.round((correctCount / QUESTIONS.length) * 100);
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
          <h2>
            Hoàn thành <span>Giải Mã Nhân Vật!</span>
          </h2>
          <p>
            Bạn đã trả lời đúng <strong>{correctCount}/{QUESTIONS.length}</strong> câu hỏi về các nhân vật lịch sử.
          </p>

          <div className="tcnv-end-stats">
            <div className="tcnv-end-stat">
              <div className="tcnv-end-stat-num">{score}</div>
              <div className="tcnv-end-stat-label">Điểm</div>
            </div>
            <div className="tcnv-end-stat">
              <div className="tcnv-end-stat-num">
                {correctCount}/{QUESTIONS.length}
              </div>
              <div className="tcnv-end-stat-label">Câu đúng</div>
            </div>
            <div className="tcnv-end-stat">
              <div className="tcnv-end-stat-num">{"⭐".repeat(stars) || "—"}</div>
              <div className="tcnv-end-stat-label">Đánh giá</div>
            </div>
          </div>

          <div className="tcnv-end-actions">
            {attemptsLeft > 0 ? (
              <button className="tcnv-end-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" />
                Chơi lại ({attemptsLeft} lượt còn lại)
              </button>
            ) : (
              <span className="tcnv-end-btn disabled">
                <i className="fa-solid fa-lock" />
                Hết lượt chơi
              </span>
            )}
            <Link to="/bai-tap" className="tcnv-end-btn secondary">
              <i className="fa-solid fa-arrow-left" />
              Quay về Bài tập
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
                    Hủy
                  </button>
                )}
                <button
                  className="tcnv-dialog-btn primary"
                  onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}
                >
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
      {/* ── TOP BAR ── */}
      <div className="tcnv-topbar">
        <div className="tcnv-topbar-left">
          <Link to="/bai-tap" className="tcnv-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-font" />
              Đảo Chữ Thông Thái
            </h1>
            <p>Sắp xếp chữ cái để tìm tên nhân vật lịch sử</p>
          </div>
        </div>
        <div className="tcnv-score-bar">
          <div className="tcnv-score-item">
            <i className="fa-solid fa-circle-question tcnv-qnum" />
            {currentQ + 1}/{QUESTIONS.length}
          </div>
          <div className="tcnv-score-item">
            <i className="fa-solid fa-circle-check tcnv-correct" />
            {correctCount}
          </div>
          <div className="tcnv-score-item">
            <i className="fa-solid fa-circle-xmark tcnv-wrong" />
            {wrongCount}
          </div>
          <button className="tcnv-dev-btn" onClick={handleQuickComplete}>
            <i className="fa-solid fa-bolt" />
            Xong nhanh
          </button>
        </div>
      </div>

      {/* ── GAME AREA ── */}
      <div className={`tcnv-game${dragging ? " dragging" : ""}`}>
        {/* Left: Hint Card (no image) */}
        <div className="tcnv-left">
          <div className="tcnv-clue-wrap">
            <div className="tcnv-clue-header">
              <i className="fa-solid fa-quote-left" />
              <span>Gợi ý nhân vật #{currentQ + 1}</span>
              <button
                className="tcnv-hint-btn"
                onClick={handleHint}
                disabled={!!feedback || hintsUsed[currentQ]}
              >
                <i className="fa-solid fa-lightbulb" />
                Gợi ý
              </button>
            </div>
            <div className="tcnv-clue-content">
              {question.clue.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <i className="fa-solid fa-quote-right tcnv-quote-right" />
          </div>
        </div>

        {/* Right: tiles + answer + actions */}
        <div className="tcnv-right">
          <div className="tcnv-tiles-label">
            <i className="fa-solid fa-puzzle-piece" /> Kéo thả chữ cái
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
            <div className="tcnv-answer-label">Đáp án</div>
            <div className="tcnv-answer-row">{answerWordGroups}</div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`tcnv-feedback ${feedback === "correct" ? "success" : "fail"}`}>
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
          <div className="tcnv-actions">
            {!feedback ? (
              <>
                <button className="tcnv-btn tcnv-btn-check" onClick={handleCheck} disabled={placed.some((v) => v === null)}>
                  <i className="fa-solid fa-paper-plane" />
                  Kiểm tra
                </button>
                <button className="tcnv-btn tcnv-btn-clear" onClick={handleClear}>
                  <i className="fa-solid fa-eraser" />
                  Xoá hết
                </button>
              </>
            ) : (
              <>
                <button className="tcnv-btn tcnv-btn-next" onClick={handleNext}>
                  <i className="fa-solid fa-arrow-right" />
                  {results.some((r) => r === null) ? "Câu tiếp theo" : "Xem kết quả"}
                </button>
                <button className="tcnv-btn tcnv-btn-clear" onClick={handleRestart}>
                  <i className="fa-solid fa-rotate-right" />
                  Chơi lại từ đầu
                </button>
              </>
            )}
          </div>

          {/* Question dots */}
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

      {/* Drag ghost */}
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
                  Hủy
                </button>
              )}
              <button
                className="tcnv-dialog-btn primary"
                onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}
              >
                {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
