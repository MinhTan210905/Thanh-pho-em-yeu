import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiLangNghe.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(4);
  }, []);
  return null;
}

const PAIRS = [
  {
    id: "lang_nghe_01",
    name: "Làng nghề se nhang",
    image: "/images/tro_choi/lang_nghe/lang_nghe_01.jpg",
  },
  {
    id: "lang_nghe_02",
    name: "Làng nghề đan lát",
    image: "/images/tro_choi/lang_nghe/lang_nghe_02.jpg",
  },
  {
    id: "lang_nghe_03",
    name: "Làng nghề đúc lư đồng",
    image: "/images/tro_choi/lang_nghe/lang_nghe_03.jpg",
  },
  {
    id: "lang_nghe_04",
    name: "Nghề làm heo đất",
    image: "/images/tro_choi/lang_nghe/lang_nghe_04.jpg",
  },
  {
    id: "lang_nghe_05",
    name: "Đan lát lục bình",
    image: "/images/tro_choi/lang_nghe/lang_nghe_05.jpg",
  },
];

const TOTAL = PAIRS.length;
const STATE_KEY = "tc_lang_nghe_state_v3";
const BT_KEY = "bt_game_progress";
const GAME_ID = "tro-choi-lang-nghe";
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
      (JSON.parse(sessionStorage.getItem(BT_KEY)) || {})[GAME_ID]?.attempts || 0
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

function syncProgress(matchedCount, score) {
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || {
      answered: 0,
      correctCount: 0,
      score: 0,
      attempts: 0,
    };
    data[GAME_ID] = {
      answered: Math.max(prev.answered || 0, matchedCount),
      correctCount: Math.max(prev.correctCount || 0, matchedCount),
      score: Math.max(prev.score || 0, score),
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export default function TroChoiLangNghe() {
  const saved = useMemo(() => loadState(), []);
  const [leftOrder, setLeftOrder] = useState(
    () => saved?.leftOrder || shuffle(PAIRS.map((p) => p.id))
  );
  const [rightOrder, setRightOrder] = useState(
    () => saved?.rightOrder || shuffle(PAIRS.map((p) => p.id))
  );
  const [links, setLinks] = useState(() => saved?.links || {});
  const [selectedLeft, setSelectedLeft] = useState(saved?.selectedLeft ?? null);
  const [selectedRight, setSelectedRight] = useState(saved?.selectedRight ?? null);

  const [isChecked, setIsChecked] = useState(saved?.isChecked ?? false);
  const [results, setResults] = useState(saved?.results ?? {}); // { leftId: boolean }

  const [dialog, setDialog] = useState({ open: false, message: "" });
  const [allDone, setAllDone] = useState(saved?.allDone ?? false);
  const [justFinished, setJustFinished] = useState(false);

  const pairsById = useMemo(() => {
    const map = {};
    PAIRS.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, []);

  const linkCount = Object.keys(links).length;
  const isCompleteForm = linkCount === TOTAL;

  const correctCount = Object.values(results).filter((r) => r === true).length;
  const score = correctCount * 20;

  useEffect(() => {
    document.body.classList.add("page-tro-choi-lang-nghe-active");
    return () =>
      document.body.classList.remove("page-tro-choi-lang-nghe-active");
  }, []);

  useEffect(() => {
    saveState({
      leftOrder,
      rightOrder,
      links,
      selectedLeft,
      selectedRight,
      isChecked,
      results,
      allDone,
    });
  }, [leftOrder, rightOrder, links, selectedLeft, selectedRight, isChecked, results, allDone]);

  const handleSelectLeft = useCallback(
    (id) => {
      if (isChecked || allDone) return;
      if (selectedLeft === id) {
        setSelectedLeft(null);
        return;
      }
      
      // If the left item already has a link, remove it so it can be re-linked
      if (links[id]) {
        const newLinks = { ...links };
        delete newLinks[id];
        setLinks(newLinks);
      }

      if (selectedRight) {
        setLinks((prev) => ({ ...prev, [id]: selectedRight }));
        setSelectedRight(null);
        setSelectedLeft(null);
      } else {
        setSelectedLeft(id);
      }
    },
    [isChecked, allDone, selectedLeft, selectedRight, links]
  );

  const handleSelectRight = useCallback(
    (id) => {
      if (isChecked || allDone) return;
      if (selectedRight === id) {
        setSelectedRight(null);
        return;
      }

      // Find if this right item is already linked, break its old link
      const existingLeft = Object.keys(links).find(
        (leftId) => links[leftId] === id
      );
      if (existingLeft) {
        const newLinks = { ...links };
        delete newLinks[existingLeft];
        setLinks(newLinks);
      }

      if (selectedLeft) {
        setLinks((prev) => ({ ...prev, [selectedLeft]: id }));
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setSelectedRight(id);
      }
    },
    [isChecked, allDone, selectedRight, selectedLeft, links]
  );

  const handleCheck = useCallback(() => {
    if (!isCompleteForm || isChecked) return;
    
    let newCorrect = 0;
    const newResults = {};
    Object.keys(links).forEach((leftId) => {
      const rightId = links[leftId];
      const isCorrect = leftId === rightId;
      newResults[leftId] = isCorrect;
      if (isCorrect) newCorrect++;
    });

    setResults(newResults);
    setIsChecked(true);

    // Always finish the round on check
    syncProgress(TOTAL, newCorrect * 20);
    incrementAttempts();

    // Small delay to let the user see the results before transitioning
    setTimeout(() => {
      setAllDone(true);
      if (newCorrect > 0) setJustFinished(true);
    }, 2000);
  }, [links, isCompleteForm, isChecked]);

  const handleRestartFull = useCallback(() => {
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
    if (!allDone) {
      incrementAttempts();
    }
    setLeftOrder(shuffle(PAIRS.map((p) => p.id)));
    setRightOrder(shuffle(PAIRS.map((p) => p.id)));
    setLinks({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setIsChecked(false);
    setResults({});
    setAllDone(false);
    setJustFinished(false);
    sessionStorage.removeItem(STATE_KEY);
    closeDialog();
  }, [allDone, closeDialog]);

  const handleQuickComplete = useCallback(() => {
    const newLinks = {};
    PAIRS.forEach((p) => {
      newLinks[p.id] = p.id;
    });
    setLinks(newLinks);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, []);

  const attemptsLeft = MAX_ATTEMPTS - getAttempts();

  // Helper arrays for matching colors
  const C_PALETTE = ["c-1", "c-2", "c-3", "c-4", "c-5"];
  const leftColorClasses = useMemo(() => {
    const dict = {};
    leftOrder.forEach((id, idx) => {
      dict[id] = C_PALETTE[idx % C_PALETTE.length];
    });
    return dict;
  }, [leftOrder]);

  // If all done and confirmed, show final screen
  if (allDone) {
    const stars = correctCount >= 5 ? "⭐⭐⭐" : correctCount >= 3 ? "⭐⭐" : "⭐";
    return (
      <div className="lng-page">
        {justFinished && <ConfettiOnMount />}
        <div className="lng-done">
          <div className="lng-done-icon">
            <i className={`fa-solid ${correctCount === TOTAL ? 'fa-trophy' : 'fa-star'}`} />
          </div>
          <h2>
            Hoàn thành <span>Nối Làng Nghề!</span>
          </h2>
          <p>
            Bạn đã ghép đúng <strong>{correctCount}/{TOTAL}</strong> cặp nghề truyền thống.
          </p>

          <div className="lng-done-stats">
            <div className="lng-done-stat">
              <div className="lng-done-stat-num">{score}</div>
              <div className="lng-done-stat-label">Điểm</div>
            </div>
            <div className="lng-done-stat">
              <div className="lng-done-stat-num">
                {correctCount}/{TOTAL}
              </div>
              <div className="lng-done-stat-label">Cặp đúng</div>
            </div>
            <div className="lng-done-stat">
              <div className="lng-done-stat-num">{stars}</div>
              <div className="lng-done-stat-label">Đánh giá</div>
            </div>
          </div>

          <div className="lng-done-actions">
            {attemptsLeft > 0 ? (
              <button className="lng-done-btn primary" onClick={handleRestartFull}>
                <i className="fa-solid fa-rotate-right" />
                Chơi lại ({attemptsLeft} lượt)
              </button>
            ) : (
              <span className="lng-done-btn disabled">
                <i className="fa-solid fa-lock" />
                Hết lượt
              </span>
            )}
            <Link to="/bai-tap" className="lng-done-btn secondary">
              <i className="fa-solid fa-arrow-left" />
              Quay về Bài tập
            </Link>
          </div>
        </div>

        {dialog.open && (
          <div className="lng-dialog-overlay" onClick={closeDialog}>
            <div className="lng-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Thông báo</h3>
              <p>{dialog.message}</p>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px'}}>
                {dialog.type === "confirm" && (
                  <button className="lng-btn ghost" style={{background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '12px 24px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease'}} onClick={closeDialog}>
                    Hủy
                  </button>
                )}
                <button className="lng-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                  {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="lng-page">
      <div className="lng-topbar">
        <div className="lng-topbar-left">
          <Link to="/bai-tap" className="lng-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-link" /> Nối Làng Nghề
            </h1>
            <p>Chọn một ảnh sau đó chọn tên nghề để ghép thành cặp</p>
          </div>
        </div>
        <div className="lng-topbar-right">
          <button className="lng-dev-btn" onClick={handleQuickComplete}>
            <i className="fa-solid fa-bolt" />
            Nối Tự Động
          </button>
        </div>
      </div>

      <div className="lng-layout-container">
        <section className="lng-board">
          {/* LEFT: IMAGES */}
          <div className="lng-column images">
            <div className="lng-list">
              {leftOrder.map((id) => {
                const item = pairsById[id];
                if (!item) return null;
                const isSelected = selectedLeft === id;
                const rightLinked = links[id];
                const cClass = leftColorClasses[id];

                let cx = "lng-card image " + cClass;
                if (isSelected) cx += " selected";
                if (rightLinked) cx += " linked";
                if (isChecked) {
                  const res = results[id];
                  if (res === true) cx += " checked-correct";
                  if (res === false) cx += " checked-wrong";
                }

                return (
                  <button
                    key={id}
                    className={cx}
                    onClick={() => handleSelectLeft(id)}
                    disabled={isChecked}
                  >
                    <div className="lng-card-media">
                      <img src={item.image} alt={item.name} loading="lazy" />
                    </div>
                    {rightLinked && !isChecked && (
                      <div className="lng-card-badge">Đã nối</div>
                    )}
                    {isChecked && results[id] === true && (
                      <div className="lng-card-result-badge r-correct">
                        <i className="fa-solid fa-check" />
                      </div>
                    )}
                    {isChecked && results[id] === false && (
                      <div className="lng-card-result-badge r-wrong">
                        <i className="fa-solid fa-xmark" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: LABELS */}
          <div className="lng-column labels">
            <div className="lng-list">
              {rightOrder.map((id) => {
                const item = pairsById[id];
                if (!item) return null;
                const isSelected = selectedRight === id;
                const leftLinked = Object.keys(links).find(
                  (l) => links[l] === id
                );
                
                let cx = "lng-card label";
                if (isSelected) cx += " selected";
                
                // If linked, inherit the color of the left item
                if (leftLinked) {
                  cx += " linked " + leftColorClasses[leftLinked];
                }
                
                if (isChecked && leftLinked) {
                  const res = results[leftLinked];
                  if (res === true) cx += " checked-correct";
                  if (res === false) cx += " checked-wrong";
                }

                return (
                  <button
                    key={id}
                    className={cx}
                    onClick={() => handleSelectRight(id)}
                    disabled={isChecked}
                  >
                    <span className="lng-label-text">{item.name}</span>
                    {leftLinked && <div className="lng-link-dot" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM ACTION BAR */}
        <div className="lng-action-bar">
          {!isChecked ? (
            <div className="lng-checking-zone">
              {isCompleteForm ? (
                <button
                  className="lng-btn submit primary scale-up"
                  onClick={handleCheck}
                >
                  <i className="fa-solid fa-magnifying-glass" />
                  Kiểm tra kết quả
                </button>
              ) : (
                <div className="lng-remaining">
                  Hãy ghép đủ {TOTAL - linkCount} cặp nữa để có thể Kiểm tra
                </div>
              )}
            </div>
          ) : (
            <div className="lng-feedback-zone">
              {correctCount === TOTAL ? (
                <div className="lng-feedback-success">
                  <i className="fa-solid fa-check-circle" /> Xuất sắc! Bạn đã nối đúng toàn bộ! 🎉
                </div>
              ) : (
                <div className="lng-feedback-error">
                  <i className="fa-solid fa-circle-info" /> Bạn nối đúng {correctCount}/{TOTAL} cặp. Đang chuyển sang kết quả...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {dialog.open && (
        <div className="lng-dialog-overlay" onClick={closeDialog}>
          <div className="lng-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Thông báo</h3>
            <p>{dialog.message}</p>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px'}}>
              {dialog.type === "confirm" && (
                <button className="lng-btn ghost" style={{background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '12px 24px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease'}} onClick={closeDialog}>
                  Hủy
                </button>
              )}
              <button className="lng-btn primary" onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}>
                {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
