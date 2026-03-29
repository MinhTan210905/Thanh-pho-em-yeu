import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

/* ═══════════ DATA ═══════════ */
const FESTIVALS = [
  {
    id: 1,
    name: "Lễ hội Yang Va",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội Yang Va.jpg",
    options: [
      { text: "Người Chơ Ro", isCorrect: true },
      { text: "Người Tày", isCorrect: false },
      { text: "Người Ê đê", isCorrect: false },
      { text: "Tháng 3 đến tháng 4 âm lịch", isCorrect: true },
      { text: "Tháng 5 đến tháng 6 âm lịch", isCorrect: false },
      { text: "Thờ thần Lúa", isCorrect: true },
      { text: "Thờ thần Rừng", isCorrect: false },
      { text: "Thờ Thần Lửa", isCorrect: false },
    ],
  },
  {
    id: 2,
    name: "Lễ hội Nghinh Cô",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội Nghinh Cô.jpg",
    options: [
      { text: "Ngày 10 đến ngày 12 tháng 2 âm lịch", isCorrect: true },
      { text: "Ngày 10 đến ngày 12 tháng 4 âm lịch", isCorrect: false },
      { text: "Ước nguyện bội thu tôm cá", isCorrect: true },
      { text: "Ước nguyện lúa nảy hạt, ra bông", isCorrect: false },
      { text: "Lăng Cá Ông", isCorrect: false },
    ],
  },
  {
    id: 3,
    name: "Lễ hội Đình Thắng Tam",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội Đình Thắng Tam.jpg",
    options: [
      { text: "Lăng Ông Nam Hải", isCorrect: true },
      { text: "Đình thần Thắng Tam", isCorrect: true },
      { text: "Miếu Bà Ngũ Hành", isCorrect: true },
      { text: "Chùa bà Thiên Hậu", isCorrect: false },
      { text: "Lăng Cá Ông", isCorrect: false },
      { text: "Miếu Nổi Phù Châu", isCorrect: false },
      { text: "Ngày 17 đến ngày 19 tháng 2 âm lịch", isCorrect: true },
      { text: "Ngày 20 đến ngày 22 tháng 2 âm lịch", isCorrect: false },
    ],
  },
  {
    id: 4,
    name: "Lễ hội chùa Ông",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội chùa Ông.webp",
    options: [
      {
        text: "Lễ thỉnh và cung nghinh các vị thần, thánh như Nguyễn Hữu Cảnh, Thiên Hậu Thánh Mẫu,…",
        isCorrect: true,
      },
      { text: "Thờ thần Rừng, thần Lửa, thần Lúa", isCorrect: false },
      { text: "Ngày 24 tháng 6 âm lịch hằng năm", isCorrect: true },
      { text: "Ngày 20 đến ngày 22 tháng 2 âm lịch", isCorrect: false },
    ],
  },
  {
    id: 5,
    name: "Lễ hội đường hoa Nguyễn Huệ",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội đường hoa Nguyễn Huệ.jpg",
    options: [
      { text: "Dịp Tết Nguyên đán hằng năm", isCorrect: true },
      { text: "Ngày 24 tháng 6 âm lịch hằng năm", isCorrect: false },
      {
        text: "Tạo không gian giải trí, hoạt động văn hóa vui xuân dịp tết đến, xuân về.",
        isCorrect: true,
      },
      { text: "Ước nguyện lúa nảy hạt, ra bông", isCorrect: false },
    ],
  },
  {
    id: 6,
    name: "Lễ Kỳ Yên",
    imageUrl: "/images/tro_choi/le_hoi/Lễ Kỳ Yên.jpg",
    options: [
      {
        text: "Lễ thỉnh và cung nghinh các vị thần, thánh như Nguyễn Hữu Cảnh, Thiên Hậu Thánh Mẫu,…",
        isCorrect: false,
      },
      { text: "Lễ cầu an và lễ tế Thành hoàng", isCorrect: true },
      {
        text: "Ngày 16 đến ngày 18 tháng Giêng âm lịch hằng năm",
        isCorrect: true,
      },
      { text: "Ngày 24 tháng 6 âm lịch hằng năm", isCorrect: false },
    ],
  },
  {
    id: 7,
    name: "Lễ hội Chùa Bà Thiên Hậu",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội Chùa Bà Thiên Hậu.jpg",
    options: [
      { text: "Ngày rằm tháng Giêng âm lịch hằng năm", isCorrect: true },
      {
        text: "Ngày 16 đến ngày 18 tháng Giêng âm lịch hằng năm",
        isCorrect: false,
      },
    ],
  },
  {
    id: 8,
    name: "Lễ hội Lái Thiêu mùa trái chín",
    imageUrl: "/images/tro_choi/le_hoi/Lễ hội Lái Thiêu mùa trái chín.jpg",
    options: [
      {
        text: "Dịp tết Đoan ngọ - mồng 5 tháng 5 âm lịch hằng năm.",
        isCorrect: true,
      },
      { text: "Dịp Tết Nguyên đán hằng năm", isCorrect: false },
    ],
  },
].map((f) => ({
  ...f,
  name: f.name.normalize("NFC"),
  options: f.options.map((o) => ({ ...o, text: o.text.normalize("NFC") })),
}));

const TOTAL = FESTIVALS.length;
const STATE_KEY = "tc_le_hoi_state";
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
    return (
      (JSON.parse(sessionStorage.getItem(BT_KEY)) || {})[GAME_ID]?.attempts ||
      0
    );
  } catch {
    return 0;
  }
}

function incrementAttempts() {
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || {
      answered: 0,
      correctCount: 0,
      score: 0,
      attempts: 0,
    };
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
    const prev = data[GAME_ID] || {
      answered: 0,
      correctCount: 0,
      score: 0,
      attempts: 0,
    };
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

/* ═══════════ COMPONENT ═══════════ */
export default function TroChoiLeHoi() {
  const saved = useMemo(() => loadState(), []);

  const [order, setOrder] = useState(() => {
    if (saved?.order) return saved.order;
    return shuffle(FESTIVALS.map((_, i) => i));
  });

  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [results, setResults] = useState(
    () => saved?.results ?? Array(TOTAL).fill(null)
  );
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

  // Tự động phát nhạc nếu đang trong game
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

  /* Per-question state: which tags are selected and checked */
  const [selected, setSelected] = useState(() => saved?.selected ?? {});
  const [checked, setChecked] = useState(saved?.checked ?? false);

  const [dialog, setDialog] = useState({
    open: false,
    type: "alert",
    title: "",
    message: "",
    action: "none",
  });

  const festival = FESTIVALS[order[currentQ]];
  const shuffledOptions = useMemo(() => {
    /* build a deterministic-per-festival shuffle using order */
    return shuffle(festival.options.map((o, i) => ({ ...o, idx: i })));
  }, [festival]);

  const correctCount = results.filter((r) => r === true).length;
  const wrongCount = results.filter((r) => r === false).length;

  /* White header override */
  useEffect(() => {
    document.body.classList.add("page-tro-choi-le-hoi-active");
    return () =>
      document.body.classList.remove("page-tro-choi-le-hoi-active");
  }, []);

  /* Save state */
  useEffect(() => {
    saveState({ currentQ, results, finished, order, selected, checked });
    syncProgress(results);
  }, [currentQ, results, finished, order, selected, checked]);

  /* Reset selection when switching questions */
  useEffect(() => {
    if (results[currentQ] !== null) {
      setChecked(true);
    } else {
      setChecked(false);
      setSelected({});
    }
  }, [currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Toggle tag selection ── */
  const handleTagClick = useCallback(
    (optIdx) => {
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
    },
    [checked]
  );

  /* ── Check answer ── */
  const handleCheck = useCallback(() => {
    if (checked) return;
    const selectedIdxs = Object.keys(selected).map(Number);
    if (selectedIdxs.length === 0) return;

    /* A festival is "correct" if ALL correct tags are selected AND no wrong tags are selected */
    const correctTags = festival.options
      .map((o, i) => (o.isCorrect ? i : -1))
      .filter((i) => i >= 0);
    const selectedSet = new Set(selectedIdxs);
    const allCorrectSelected = correctTags.every((i) => selectedSet.has(i));
    const noWrongSelected = selectedIdxs.every(
      (i) => festival.options[i].isCorrect
    );
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

  /* ── Next question ── */
  const handleNext = useCallback(() => {
    const nextUnanswered = results.findIndex(
      (r, i) => r === null && i > currentQ
    );
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

  /* ── Go to specific question ── */
  const handleGoTo = useCallback(
    (idx) => {
      setCurrentQ(idx);
    },
    []
  );

  /* ── Restart ── */
  const handleRestart = useCallback(() => {
    const currentAttempts = getAttempts();
    if (currentAttempts >= MAX_ATTEMPTS) {
      setDialog({
        open: true,
        type: "alert",
        title: "Hết lượt chơi",
        message: "Bạn đã hết lượt chơi cho Dấu ấn lễ hội địa phương em!",
        action: "none",
      });
      return;
    }
    const remaining = MAX_ATTEMPTS - currentAttempts - 1;
    setDialog({
      open: true,
      type: "confirm",
      title: "Bắt đầu lượt mới?",
      message: `Đây sẽ là lượt chơi mới. Sau lượt này, bạn còn ${remaining} lượt nữa.`,
      action: "restart",
    });
  }, []);

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
  }, [dialog, closeDialog, finished, playBGM]);

  /* ═══════ FINISHED SCREEN ═══════ */
  if (finished) {
    const score = Math.round((correctCount / TOTAL) * 100);
    const stars =
      correctCount >= 7 ? 3 : correctCount >= 4 ? 2 : correctCount >= 2 ? 1 : 0;
    const endIcon =
      stars === 3 ? "fa-trophy" : stars === 2 ? "fa-medal" : "fa-star";
    const attemptsLeft = MAX_ATTEMPTS - getAttempts();

    return (
      <div className="lh-page">
        {justFinished && <ConfettiOnMount />}
        <div className="lh-end">
          <div className="lh-end-icon">
            <i className={`fa-solid ${endIcon}`} />
          </div>
          <h2>
            Hoàn thành <span>Dấu Ấn Lễ Hội Địa Phương Em!</span>
          </h2>
          <p>
            Bạn đã trả lời đúng{" "}
            <strong>
              {correctCount}/{TOTAL}
            </strong>{" "}
            lễ hội truyền thống.
          </p>

          <div className="lh-end-stats">
            <div className="lh-end-stat">
              <div className="lh-end-stat-num">{score}</div>
              <div className="lh-end-stat-label">Điểm</div>
            </div>
            <div className="lh-end-stat">
              <div className="lh-end-stat-num">
                {correctCount}/{TOTAL}
              </div>
              <div className="lh-end-stat-label">Câu đúng</div>
            </div>
            <div className="lh-end-stat">
              <div className="lh-end-stat-num">
                {"⭐".repeat(stars) || "—"}
              </div>
              <div className="lh-end-stat-label">Đánh giá</div>
            </div>
          </div>

          <div className="lh-end-actions">
            {attemptsLeft > 0 ? (
              <button className="lh-end-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" />
                Chơi lại ({attemptsLeft} lượt còn lại)
              </button>
            ) : (
              <span className="lh-end-btn disabled">
                <i className="fa-solid fa-lock" />
                Hết lượt chơi
              </span>
            )}
            <Link to="/bai-tap" className="lh-end-btn secondary">
              <i className="fa-solid fa-arrow-left" />
              Quay về Bài tập
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
                  <button
                    className="lh-dialog-btn ghost"
                    onClick={closeDialog}
                  >
                    Hủy
                  </button>
                )}
                <button
                  className="lh-dialog-btn primary"
                  onClick={
                    dialog.type === "confirm" ? confirmDialog : closeDialog
                  }
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

  /* ═══════ GAME SCREEN ═══════ */
  const isCorrectRound = checked && results[currentQ] === true;
  const isWrongRound = checked && results[currentQ] === false;

  return (
    <div className="lh-page">
      {/* ── TOP BAR ── */}
      <div className="lh-topbar">
        <div className="lh-topbar-left">
          <Link to="/bai-tap" className="lh-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-masks-theater" />
              Dấu Ấn Lễ Hội Địa Phương Em
            </h1>
            <p>Chọn đúng các từ khóa xoay quanh lễ hội</p>
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

      {/* ── STANDARD GAME AREA ── */}
      <div className={`lh-game-container ${isWrongRound ? "error-active" : ""}`}>

        <div className="lh-main-content">
          {/* LEFT: Full Image */}
          <div className="lh-image-section">
            <div className="lh-image-wrap">
              <img src={festival.imageUrl} alt={festival.name} />
              <div className="lh-image-number">{currentQ + 1}</div>
            </div>
            <div className="lh-festival-name">
              <i className="fa-solid fa-landmark" />
              {festival.name}
            </div>
          </div>

          {/* RIGHT: Tags & Controls */}
          <div className="lh-interact-section">
            <div className="lh-tags-label">
              Chọn các từ khóa đúng cho lễ hội này
            </div>
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
                  <button
                    key={opt.idx}
                    className={tagClass}
                    onClick={() => handleTagClick(opt.idx)}
                    disabled={checked}
                  >
                    {isSelected && !showResult && <i className="fa-solid fa-check lh-tag-check" />}
                    {showResult && isSelected && opt.isCorrect && <i className="fa-solid fa-check lh-tag-check" />}
                    {showResult && isSelected && !opt.isCorrect && <i className="fa-solid fa-xmark lh-tag-x" />}
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Dots */}
            {checked && (
              <div className={`lh-feedback ${isCorrectRound ? "success" : "fail"}`}>
                {isCorrectRound ? (
                  <>
                    <i className="fa-solid fa-check-circle" /> Chính xác! 🎉
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-times-circle" /> Sai rồi! Các từ khóa đúng có giáp viền xanh lá.
                  </>
                )}
              </div>
            )}

            <div className="lh-actions">
              {!checked ? (
                <>
                  <button
                    className="lh-btn lh-btn-check"
                    onClick={handleCheck}
                    disabled={Object.keys(selected).length === 0}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles" />
                    Kiểm tra Giải mã
                  </button>
                  <button
                    className="lh-btn lh-btn-clear"
                    onClick={() => setSelected({})}
                  >
                    <i className="fa-solid fa-eraser" />
                    Xoá chọn
                  </button>
                </>
              ) : (
                <>
                  <button className="lh-btn lh-btn-next" onClick={handleNext}>
                    <i className="fa-solid fa-arrow-right" />
                    {results.some((r) => r === null) ? "Câu tiếp theo" : "Xem tổng kết"}
                  </button>
                  <button
                    className="lh-btn lh-btn-clear"
                    onClick={handleRestart}
                  >
                    <i className="fa-solid fa-rotate-right" />
                    Chơi lại từ đầu
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
                  <button
                    key={idx}
                    className={cls}
                    onClick={() => handleGoTo(idx)}
                  />
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
                <button
                  className="lh-dialog-btn ghost"
                  onClick={closeDialog}
                >
                  Hủy
                </button>
              )}
              <button
                className="lh-dialog-btn primary"
                onClick={
                  dialog.type === "confirm" ? confirmDialog : closeDialog
                }
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
