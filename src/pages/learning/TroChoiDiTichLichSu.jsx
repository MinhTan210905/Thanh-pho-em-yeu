import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fireConfetti } from "./confettiEffect";
import "./TroChoiDiTichLichSu.css";

function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti(2);
  }, []);
  return null;
}

/* ═══════════ DATA ═══════════ */
const ERAS = [
  { id: "oc-eo", name: "Thời kỳ Óc Eo", period: "Thế kỷ I – VII", icon: "fa-gopuram", color: "#d4a24e" },
  { id: "khai-pha", name: "Khai phá phương Nam", period: "Thế kỷ XVII – XIX", icon: "fa-compass", color: "#22c55e" },
  { id: "chong-phap-my", name: "Chống Pháp & Mỹ", period: "1858 – 1975", icon: "fa-fist-raised", color: "#ef4444" },
];

const SITES = [
  { id: "chua-hoi-son", name: "Chùa Hội Sơn", era: "oc-eo", image: "/images/tro_choi/di_tich_lich_su/Di tích khảo cổ học chùa Hội Sơn.png" },
  { id: "giong-ca-vo", name: "Giồng Cá Vồ", era: "oc-eo", image: "/images/tro_choi/di_tich_lich_su/Di tích khảo cổ học Giồng Cá Vồ.png" },
  { id: "bung-bac", name: "Bưng Bạc", era: "oc-eo", image: "/images/tro_choi/di_tich_lich_su/Di tích khảo cổ học Bưng Bạc.png" },
  { id: "dinh-thang-tam", name: "Đình Thần Thắng Tam", era: "khai-pha", image: "/images/tro_choi/di_tich_lich_su/ĐÌNH THẦN THẮNG TAM.jpg" },
  { id: "chua-long-ban", name: "Chùa Long Bàn", era: "khai-pha", image: "/images/tro_choi/di_tich_lich_su/CHÙA LONG BÀN.png" },
  { id: "nha-luu-niem", name: "Nhà Lưu Niệm Chủ Tịch Hồ Chí Minh", era: "chong-phap-my", image: "/images/tro_choi/di_tich_lich_su/NHÀ LƯU NIỆM CHỦ TỊCH HỒ CHÍ MINH.png" },
  { id: "chien-khu", name: "Chiến Khu Thuận An Hòa", era: "chong-phap-my", image: "/images/tro_choi/di_tich_lich_su/DI TÍCH LỊCH SỬ CHIẾN KHU THUẬN AN HÒA.png" },
  { id: "dia-dao", name: "Địa Đạo Kim Long", era: "chong-phap-my", image: "/images/tro_choi/di_tich_lich_su/ĐỊA ĐẠO KIM LONG.png" },
  { id: "can-cu", name: "Căn Cứ Minh Đạm", era: "chong-phap-my", image: "/images/tro_choi/di_tich_lich_su/CĂN CỨ MINH ĐẠM.png" },
];

const TOTAL = SITES.length;
const BT_KEY = "bt_game_progress";
const STATE_KEY = "tc_ditichlichsu_state";
const GAME_ID = "tro-choi-di-tich-lich-su";
const MAX_ATTEMPTS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAttempts() {
  try { return (JSON.parse(sessionStorage.getItem(BT_KEY)) || {})[GAME_ID]?.attempts || 0; }
  catch { return 0; }
}

function syncProgress(correct) {
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    const score = Math.round((correct / TOTAL) * 100);
    data[GAME_ID] = {
      answered: Math.max(prev.answered || 0, TOTAL),
      correctCount: Math.max(prev.correctCount || 0, correct),
      score: Math.max(prev.score || 0, score),
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function syncPartialProgress(placedCount) {
  try {
    const data = JSON.parse(sessionStorage.getItem(BT_KEY)) || {};
    const prev = data[GAME_ID] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    data[GAME_ID] = {
      answered: Math.max(prev.answered || 0, placedCount),
      correctCount: prev.correctCount || 0,
      score: prev.score || 0,
      attempts: prev.attempts || 0,
    };
    sessionStorage.setItem(BT_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
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

function loadState() {
  try { const r = sessionStorage.getItem(STATE_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function saveState(s) { sessionStorage.setItem(STATE_KEY, JSON.stringify(s)); }

function fmtTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

/* ═══════════ COMPONENT ═══════════ */
export default function TroChoiLichSu() {
  /* Header override */
  useEffect(() => {
    document.body.classList.add("page-tro-choi-ls-active");
    return () => document.body.classList.remove("page-tro-choi-ls-active");
  }, []);

  const saved = useRef(loadState()).current;

  const [order, setOrder] = useState(() => saved?.order || shuffle(SITES.map((_, i) => i)));
  const [placements, setPlacements] = useState(() => saved?.placements || {});
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState(() => saved?.phase || "playing");
  const [resultMap, setResultMap] = useState(() => saved?.resultMap || null);
  const [timer, setTimer] = useState(() => saved?.timer || 0);
  const [finalTime, setFinalTime] = useState(() => saved?.finalTime || null);
  const timerRef = useRef(null);

  const [dialog, setDialog] = useState({ open: false, type: "", title: "", message: "", action: "" });
  const [justFinished, setJustFinished] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragGhost, setDragGhost] = useState(null);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef(null);
  const placementsRef = useRef(placements);

  /* Derived */
  const placedCount = Object.keys(placements).length;
  const allPlaced = placedCount === TOTAL;
  const poolSites = order.map((i) => SITES[i]).filter((s) => !(s.id in placements));
  const correctCount = resultMap ? Object.values(resultMap).filter(Boolean).length : 0;

  /* Timer */
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  /* Save state */
  useEffect(() => {
    saveState({ order, placements, phase, resultMap, timer, finalTime });
  }, [order, placements, phase, resultMap, timer, finalTime]);

  useEffect(() => {
    placementsRef.current = placements;
  }, [placements]);

  /* ── Handlers ── */
  const handleSelectCard = useCallback(
    (siteId) => {
      if (phase !== "playing") return;
      setSelected((prev) => (prev === siteId ? null : siteId));
    },
    [phase]
  );

  const handlePlaceInEra = useCallback(
    (eraId) => {
      if (phase !== "playing" || !selected) return;
      setPlacements((prev) => {
        const next = { ...prev, [selected]: eraId };
        syncPartialProgress(Object.keys(next).length);
        return next;
      });
      setSelected(null);
    },
    [phase, selected]
  );

  const handleRemoveFromEra = useCallback(
    (siteId) => {
      if (phase !== "playing") return;
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[siteId];
        return next;
      });
    },
    [phase]
  );

  const handlePointerDown = useCallback(
    (e, siteId) => {
      if (phase !== "playing") return;
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest(".tls-remove-btn")) return;
      suppressClickRef.current = false;
      dragStateRef.current = {
        siteId,
        startX: e.clientX,
        startY: e.clientY,
        started: false,
        originEra: placementsRef.current[siteId] || null,
      };
    },
    [phase]
  );

  useEffect(() => {
    const handlePointerMove = (e) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      if (!ds.started) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        ds.started = true;
        suppressClickRef.current = true;
        setDragging(ds.siteId);
        setDragGhost({ id: ds.siteId, x: e.clientX, y: e.clientY });
        setSelected(null);
      }
      if (e.cancelable) e.preventDefault();
      setDragGhost((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
    };

    const handlePointerUp = (e) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      dragStateRef.current = null;
      if (!ds.started) return;
      const pointEl = document.elementFromPoint(e.clientX, e.clientY);
      const eraEl = pointEl?.closest?.("[data-era-id]");
      const eraId = eraEl?.dataset?.eraId || null;
      if (phase === "playing" && eraId) {
        setPlacements((prev) => {
          const next = { ...prev, [ds.siteId]: eraId };
          syncPartialProgress(Object.keys(next).length);
          return next;
        });
      }
      setDragging(null);
      setDragGhost(null);
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [phase]);


  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    const map = {};
    SITES.forEach((site) => {
      map[site.id] = placements[site.id] === site.era;
    });
    setResultMap(map);
    setFinalTime(timer);
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = Object.values(map).filter(Boolean).length;
    incrementAttempts();
    syncProgress(correct);
    setPhase("results");
  }, [allPlaced, placements, timer]);

  const handleFinish = useCallback(() => {
    setPhase("done");
    setJustFinished(true);
  }, []);

  const handleQuickComplete = useCallback(() => {
    incrementAttempts();
    const allPlacements = {};
    SITES.forEach((site) => {
      allPlacements[site.id] = site.era;
    });
    const map = {};
    SITES.forEach((site) => { map[site.id] = true; });
    setPlacements(allPlacements);
    setSelected(null);
    setResultMap(map);
    setFinalTime(timer);
    syncProgress(TOTAL);
    setPhase("done");
    setJustFinished(true);
  }, [timer]);

  const doRestart = useCallback(() => {
    setPlacements({});
    setSelected(null);
    setPhase("playing");
    setResultMap(null);
    setTimer(0);
    setFinalTime(null);
    setOrder(shuffle(SITES.map((_, i) => i)));
    sessionStorage.removeItem(STATE_KEY);
  }, []);

  const handleRestart = useCallback(() => {
    const attempts = getAttempts();
    if (attempts >= MAX_ATTEMPTS) {
      setDialog({ open: true, type: "alert", title: "Hết lượt chơi", message: "Bạn đã hết lượt chơi cho Đoán tên di tích!", action: "" });
      return;
    }
    setDialog({
      open: true,
      type: "confirm",
      title: "Bắt đầu lượt mới?",
      message: `Sau lượt này bạn còn ${MAX_ATTEMPTS - attempts - 1} lượt nữa.`,
      action: "restart",
    });
  }, []);

  const closeDialog = useCallback(() => setDialog((d) => ({ ...d, open: false })), []);

  const confirmDialog = useCallback(() => {
    if (dialog.action === "restart") doRestart();
    closeDialog();
  }, [dialog, doRestart, closeDialog]);

  /* ── Dialog renderer ── */
  const renderDialog = () =>
    dialog.open ? (
      <div className="tls-dialog-overlay" onClick={closeDialog}>
        <div className="tls-dialog" onClick={(e) => e.stopPropagation()}>
          <h3>{dialog.title}</h3>
          <p>{dialog.message}</p>
          <div className="tls-dialog-actions">
            {dialog.type === "confirm" && (
              <button className="tls-dlg-btn ghost" onClick={closeDialog}>Hủy</button>
            )}
            <button
              className="tls-dlg-btn primary"
              onClick={dialog.type === "confirm" ? confirmDialog : closeDialog}
            >
              {dialog.type === "confirm" ? "Bắt đầu lượt mới" : "Đã hiểu"}
            </button>
          </div>
        </div>
      </div>
    ) : null;

  /* ══════ DONE SCREEN ══════ */
  if (phase === "done") {
    const score = Math.round((correctCount / TOTAL) * 100);
    const stars = correctCount >= 8 ? 3 : correctCount >= 5 ? 2 : correctCount >= 3 ? 1 : 0;
    const doneIcon =
      stars === 3 ? "fa-trophy" : stars === 2 ? "fa-medal" : stars === 1 ? "fa-star" : "fa-flag-checkered";
    const attemptsLeft = MAX_ATTEMPTS - getAttempts();

    return (
      <div className={`tls-page${dragging ? " dragging" : ""}`}>
        {justFinished && <ConfettiOnMount />}
        <div className="tls-done">
          <div className="tls-done-emoji">
            <i className={`fa-solid ${doneIcon}`} />
          </div>
          <h2>
            Hoàn Thành <span>Phân Loại Di Tích!</span>
          </h2>
          <p>
            Bạn phân loại đúng <strong>{correctCount}/{TOTAL}</strong> di tích vào đúng thời kỳ lịch sử.
          </p>

          <div className="tls-done-stats">
            <div className="tls-done-stat">
              <div className="tls-done-num">{score}</div>
              <div className="tls-done-label">Điểm</div>
            </div>
            <div className="tls-done-stat">
              <div className="tls-done-num">{fmtTime(finalTime || 0)}</div>
              <div className="tls-done-label">Thời gian</div>
            </div>
            <div className="tls-done-stat">
              <div className="tls-done-num">{"⭐".repeat(stars) || "—"}</div>
              <div className="tls-done-label">Đánh giá</div>
            </div>
          </div>

          <div className="tls-done-actions">
            {attemptsLeft > 0 ? (
              <button className="tls-btn primary" onClick={handleRestart}>
                <i className="fa-solid fa-rotate-right" /> Chơi lại ({attemptsLeft} lượt)
              </button>
            ) : (
              <span className="tls-btn disabled">
                <i className="fa-solid fa-lock" /> Hết lượt
              </span>
            )}
            <Link to="/bai-tap" className="tls-btn secondary">
              <i className="fa-solid fa-arrow-left" /> Quay về Bài tập
            </Link>
          </div>
        </div>
        {renderDialog()}
      </div>
    );
  }

  /* ══════ PLAYING / RESULTS SCREEN ══════ */
  return (
    <div className={`tls-page${dragging ? " dragging" : ""}`}>
      {/* ── Top Bar ── */}
      <div className="tls-topbar">
        <div className="tls-topbar-left">
          <Link to="/bai-tap" className="tls-back">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1>
              <i className="fa-solid fa-layer-group" /> Phân Loại Di Tích
            </h1>
            <p>Chọn di tích và xếp vào thời kỳ phù hợp</p>
          </div>
        </div>
        <div className="tls-topbar-right">
          <div className="tls-chip">
            <i className="fa-regular fa-clock" />
            {fmtTime(phase === "results" ? finalTime || 0 : timer)}
          </div>
          <div className="tls-chip">
            <i className="fa-solid fa-layer-group" />
            {placedCount}/{TOTAL}
          </div>
          {phase === "results" && (
            <div className="tls-chip tls-chip-score">
              <i className="fa-solid fa-star" />
              {correctCount}/{TOTAL}
            </div>
          )}
          <button className="tls-dev-btn" onClick={handleQuickComplete}>
            <i className="fa-solid fa-bolt" />
            Xong nhanh
          </button>
        </div>
      </div>

      {/* ── Instruction ── */}
      {phase === "playing" && (
        <div className="tls-instruction">
          <i className={`fa-solid ${selected || dragging ? "fa-arrow-up" : "fa-hand-pointer"}`} />
          {selected || dragging
            ? "Bấm vào thời kỳ ở trên hoặc kéo thả để xếp di tích"
            : "Chọn hoặc kéo thả di tích vào ô thời kỳ phù hợp"}
        </div>
      )}

      {/* ── Era Columns (on top) ── */}
      <section className="tls-eras">
        {ERAS.map((era) => {
          const eraSites = SITES.filter((s) => placements[s.id] === era.id);
          const isTarget = (!!selected || !!dragging) && phase === "playing";

          return (
            <div
              key={era.id}
              className={`tls-era${isTarget ? " drop-target" : ""}`}
              data-era-id={era.id}
              style={{ "--era-color": era.color }}
              onClick={() => handlePlaceInEra(era.id)}
            >
              <div className="tls-era-header">
                <div className="tls-era-icon">
                  <i className={`fas ${era.icon}`} />
                </div>
                <div>
                  <h3>{era.name}</h3>
                  <span className="tls-era-period">{era.period}</span>
                </div>
              </div>

              <div className="tls-era-body">
                {eraSites.length === 0 && phase === "playing" && (
                  <div className="tls-era-empty">
                    <i className="fa-solid fa-plus-circle" />
                    <span>Kéo thả hoặc bấm để xếp di tích vào đây</span>
                  </div>
                )}
                {eraSites.map((site) => {
                  const res = resultMap?.[site.id];
                  const correctEra = res === false ? ERAS.find((e) => e.id === site.era) : null;
                  return (
                    <div
                      key={site.id}
                      className={`tls-placed${dragging === site.id ? " dragging" : ""}${res === true ? " correct" : ""}${res === false ? " wrong" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (phase === "playing" && !suppressClickRef.current) {
                          handleRemoveFromEra(site.id);
                        }
                      }}
                      onPointerDown={(e) => handlePointerDown(e, site.id)}
                    >
                      <img src={site.image} alt={site.name} draggable="false" />
                      <div className="tls-placed-info">
                        <span className="tls-placed-name">{site.name}</span>
                        {res === true && <i className="fa-solid fa-circle-check tls-res-icon ok" />}
                        {res === false && (
                          <>
                            <i className="fa-solid fa-circle-xmark tls-res-icon fail" />
                            <span className="tls-correct-label">→ {correctEra?.name}</span>
                          </>
                        )}
                      </div>
                      {phase === "playing" && (
                        <button
                          className="tls-remove-btn"
                          aria-label="Gỡ bỏ"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromEra(site.id);
                          }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Card Pool (below) ── */}
      {poolSites.length > 0 && (
        <section className="tls-pool">
          <div className="tls-pool-label">
            <i className="fa-solid fa-images" /> Di tích chưa phân loại ({poolSites.length})
          </div>
          <div className="tls-pool-grid">
            {poolSites.map((site, i) => (
              <div
                key={site.id}
                className={`tls-card${selected === site.id ? " selected" : ""}${dragging === site.id ? " dragging" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  handleSelectCard(site.id);
                }}
                onPointerDown={(e) => handlePointerDown(e, site.id)}
              >
                <div className="tls-card-img">
                  <img src={site.image} alt={site.name} loading="lazy" draggable="false" />
                </div>
                <div className="tls-card-name">{site.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Bottom Bar ── */}
      {(phase === "playing" && allPlaced) || phase === "results" ? (
        <div className="tls-bottom">
          {phase === "playing" && allPlaced && (
            <button className="tls-btn primary glow" onClick={handleCheck}>
              <i className="fa-solid fa-magnifying-glass-chart" /> Kiểm tra kết quả
            </button>
          )}
          {phase === "results" && (
            <div className="tls-results-bar">
              <div className="tls-results-score">
                <span className="tls-results-num">{correctCount}/{TOTAL}</span>
                <span className="tls-results-label">câu đúng</span>
              </div>
              <button className="tls-btn primary" onClick={handleFinish}>
                <i className="fa-solid fa-trophy" /> Xem tổng kết
              </button>
            </div>
          )}
        </div>
      ) : null}

      {dragGhost && (
        <div
          className="tls-drag-ghost"
          style={{ left: dragGhost.x, top: dragGhost.y }}
          aria-hidden="true"
        >
          {(() => {
            const site = SITES.find((s) => s.id === dragGhost.id);
            if (!site) return null;
            return (
              <>
                <div className="tls-drag-ghost-img">
                  <img src={site.image} alt="" draggable="false" />
                </div>
                <div className="tls-drag-ghost-name">{site.name}</div>
              </>
            );
          })()}
        </div>
      )}

      {renderDialog()}
    </div>
  );
}
