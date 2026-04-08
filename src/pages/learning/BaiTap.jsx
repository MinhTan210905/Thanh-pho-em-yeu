import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GAME_DEFS } from "./gameDefs";
import "./BaiTap.css";

/* -- Game definitions -- */
const MAX_ATTEMPTS = 3;

const STORAGE_KEY = "bt_game_progress";

function loadProgress() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const data = {};
  GAME_DEFS.forEach((g) => {
    data[g.id] = { answered: 0, correctCount: 0, score: 0, attempts: 0 };
  });
  return data;
}

function saveProgress(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSessionProgress(def) {
  if (!def.storageKey) return { answered: 0, hasSession: false, sessionScore: 0 };
  try {
    const raw = sessionStorage.getItem(def.storageKey);
    if (!raw) return { answered: 0, hasSession: false, sessionScore: 0 };
    const state = JSON.parse(raw);

    /* Games using results array (Lễ hội, Ẩm thực, Địa lí, Nhân vật, v.v.) */
    if (state.results && Array.isArray(state.results)) {
      const answered = state.results.filter((r) => r !== null).length;
      const correct = state.results.filter((r) => r === true).length;
      return { answered, hasSession: true, sessionScore: Math.round((correct / def.totalQuestions) * 100) };
    }
    
    /* Di tích lịch sử: placements object */
    if (state.placements && typeof state.placements === "object") {
      const answered = Object.keys(state.placements).length;
      return { answered, hasSession: true, sessionScore: null };
    }
    
    /* Làng nghề: v2 links */
    if (state.links && typeof state.links === "object" && def.id === "tro-choi-lang-nghe") {
      const answered = state.allDone ? def.totalQuestions : Object.keys(state.links).length;
      const correct = state.results ? Object.values(state.results).filter((x) => x).length : 0;
      return { answered, hasSession: true, sessionScore: Math.round((correct / def.totalQuestions) * 100) };
    }
    
    return { answered: 0, hasSession: true, sessionScore: 0 };
  } catch {
    /* ignore */
  }
  return { answered: 0, hasSession: false, sessionScore: 0 };
}

function buildGames(progress, t) {
  return GAME_DEFS.map((def) => {
    // Map def.id to i18n key used in translation.json
    const rawGameKey = def.id.replace("tro-choi-", "").replace(/-/g, "_");
    const gameKey = {
      dia_li_tu_nhien: "tu_nhien",
      di_tich_lich_su: "di_tich",
      nhan_vat_lich_su: "nhan_vat",
    }[rawGameKey] || rawGameKey;
    
    // Set category based on parent folder or map it
    let cat = def.category;
    if (def.route.includes('/dia-ly') || def.id.includes('dia-li') || def.id.includes('vi-tri') || def.id.includes('kinh-te') || def.id.includes('dan-cu')) {
      cat = t("header.geography");
    } else if (def.route.includes('/lich-su') || def.id.includes('lich-su')) {
      cat = t("header.history");
    } else if (def.route.includes('/van-hoa') || def.id.includes('am-thuc') || def.id.includes('lang-nghe') || def.id.includes('le-hoi')) {
      cat = t("header.culture");
    }

    const p = progress[def.id] || { answered: 0, correctCount: 0, score: 0, attempts: 0 };
    const session = getSessionProgress(def);
    const answered = Math.max(p.answered || 0, session.answered || 0);
    const displayAnswered = session.hasSession ? session.answered : answered;
    const sessionScore = session.sessionScore !== null && session.sessionScore !== undefined
      ? session.sessionScore
      : (p.score || 0);
      
    return {
      ...def,
      title: t(`learning_page.quiz.games.${gameKey}.title`, { defaultValue: def.title }),
      description: t(`learning_page.quiz.games.${gameKey}.desc`, { defaultValue: def.description }),
      category: cat,
      ...p,
      answered,
      displayAnswered,
      sessionAnswered: session.answered,
      hasSession: session.hasSession,
      sessionScore,
      bestScore: p.score || 0,
    };
  });
}

/* Determine game status */
function getGameStatus(game) {
  if (game.hasSession) {
    if (game.sessionAnswered >= game.totalQuestions) return "completed";
    return "in-progress";
  }
  if (game.answered >= game.totalQuestions) return "completed";
  if (game.answered > 0) return "in-progress";
  return "not-started";
}

export default function BaiTap() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(loadProgress);
  const [filter, setFilter] = useState("all");
  const [animKey, setAnimKey] = useState(0);
  const games = useMemo(() => buildGames(progress, t), [progress, t]);

  /* White header override + hide chatbot */
  useEffect(() => {
    document.body.classList.add("page-bai-tap-active");
    return () => document.body.classList.remove("page-bai-tap-active");
  }, []);

  /* Sync from sessionStorage when tab regains focus */
  useEffect(() => {
    const onFocus = () => setProgress(loadProgress());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  /* Also sync on route navigation back */
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  /* Trigger re-mount animation when filter changes */
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setAnimKey((k) => k + 1);
  }, []);



  /* aggregate stats */
  const stats = useMemo(() => {
    const totalGames = games.length;
    const played = games.filter((g) => g.answered > 0).length;
    const totalCorrect = games.reduce((s, g) => s + g.correctCount, 0);
    const totalQuestions = games.reduce((s, g) => s + g.totalQuestions, 0);
    const avgScore =
      played > 0
        ? Math.round(games.filter((g) => g.answered > 0).reduce((s, g) => s + g.score, 0) / played)
        : 0;
    return { totalGames, played, totalCorrect, totalQuestions, avgScore };
  }, [games]);

  /* Status counts */
  const statusCounts = useMemo(() => {
    let inProgress = 0,
      notStarted = 0,
      completed = 0;
    games.forEach((g) => {
      const s = getGameStatus(g);
      if (s === "in-progress") inProgress++;
      else if (s === "completed") completed++;
      else notStarted++;
    });
    return { inProgress, notStarted, completed };
  }, [games]);

  const filteredGames = games.filter((g) => filter === "all" || getGameStatus(g) === filter);

  return (
    <div className="bt-page">
      {/* -- HERO -- */}
      <section className="bt-hero">
        <div className="bt-hero-badge">
          <i className="fa-solid fa-gamepad" />
          {t("learning_page.quiz.hero_badge")}
        </div>
        <h1>
          {t("learning_page.quiz.hero_title")} <span>{t("learning_page.quiz.hero_highlight")}</span>
        </h1>
        <p>
          {t("learning_page.quiz.hero_desc")}
        </p>



        <div className="bt-stats">
          <div className="bt-stat-card">
            <div className="bt-stat-number">
              {stats.played}/{stats.totalGames}
            </div>
            <div className="bt-stat-label">{t("learning_page.quiz.stat_played")}</div>
          </div>
          <div className="bt-stat-card">
            <div className="bt-stat-number">
              {stats.totalCorrect}/{stats.totalQuestions}
            </div>
            <div className="bt-stat-label">{t("learning_page.quiz.stat_correct")}</div>
          </div>
          <div className="bt-stat-card">
            <div className="bt-stat-number">{stats.avgScore}</div>
            <div className="bt-stat-label">{t("learning_page.quiz.stat_avg")}</div>
          </div>
        </div>
      </section>

      {/* -- GAME LIST -- */}
      <section className="bt-games">
        <div className="bt-games-header">
          <h2>
            <i className="fa-solid fa-list-check" />
            {t("learning_page.quiz.list_title")}
          </h2>
          <div className="bt-filter-pills">
            <button
              className={`bt-pill ${filter === "all" ? "active" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              {t("learning_page.quiz.filter_all")} ({games.length})
            </button>
            <button
              className={`bt-pill ${filter === "not-started" ? "active" : ""}`}
              onClick={() => handleFilterChange("not-started")}
            >
              {t("learning_page.quiz.filter_new")} ({statusCounts.notStarted})
            </button>
            <button
              className={`bt-pill ${filter === "in-progress" ? "active" : ""}`}
              onClick={() => handleFilterChange("in-progress")}
            >
              {t("learning_page.quiz.filter_progress")} ({statusCounts.inProgress})
            </button>
            <button
              className={`bt-pill ${filter === "completed" ? "active" : ""}`}
              onClick={() => handleFilterChange("completed")}
            >
              {t("learning_page.quiz.filter_done")} ({statusCounts.completed})
            </button>
          </div>
        </div>

        <div className="bt-grid bt-grid-animate" key={animKey}>
          {filteredGames.map((game) => {
            const status = getGameStatus(game);
            const outOfAttempts = game.attempts >= MAX_ATTEMPTS;
            const displayAnswered = game.displayAnswered ?? game.answered;

            return (
              <div key={game.id} className="bt-game-card" data-game-id={game.id}>
                {/* Banner */}
                <div className="bt-card-banner">
                  <img src={game.image} alt={game.title} />
                  <span
                    className={`bt-card-badge ${status === "completed" ? "completed" : status === "in-progress" ? "progress" : "new"
                      }`}
                  >
                    {status === "completed" ? t("learning_page.quiz.status_done") : status === "in-progress" ? t("learning_page.quiz.status_progress") : t("learning_page.quiz.status_new")}
                  </span>
                </div>

                {/* Body */}
                <div className="bt-card-body">
                  <div className="bt-card-category">{game.category}</div>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>

                  <div className="bt-card-bottom">
                    {/* Best score - above progress */}
                    {game.bestScore > 0 && (
                      <div className="bt-best-score">
                        <i className="fa-solid fa-trophy" />
                        <span>{t("learning_page.quiz.best_score", { score: game.bestScore })}</span>
                      </div>
                    )}

                    {/* Progress */}
                    <div className="bt-progress-wrap">
                      <div className="bt-progress-info">
                        <span>
                          {t("learning_page.quiz.progress_label", { current: displayAnswered, total: game.totalQuestions })}
                        </span>
                        <span className="bt-score">{t("learning_page.quiz.score_label", { score: game.sessionScore })}</span>
                      </div>
                      <div className="bt-progress-bar">
                        <div
                          className="bt-progress-fill"
                          style={{ width: `${(displayAnswered / game.totalQuestions) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bt-card-footer">
                      <span className="bt-attempts">
                        <i className="fa-solid fa-rotate" />
                        {t("learning_page.quiz.attempts_label", { current: game.attempts, total: MAX_ATTEMPTS })}
                      </span>
                      <div className="bt-card-actions">
                        {status === "completed" ? (
                          <Link to={game.route} className="bt-play-btn result">
                            <i className="fa-solid fa-chart-column" />
                            {t("learning_page.quiz.btn_result")}
                          </Link>
                        ) : outOfAttempts ? (
                          <Link to={game.route} className="bt-play-btn result">
                            <i className="fa-solid fa-chart-column" />
                            {t("learning_page.quiz.btn_result")}
                          </Link>
                        ) : (
                          <Link to={game.route} className="bt-play-btn">
                            <i className="fa-solid fa-play" />
                            {status === "in-progress" ? t("learning_page.quiz.btn_continue") : t("learning_page.quiz.btn_start")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredGames.length === 0 && (
            <div className="bt-empty">
              <i className="fa-solid fa-filter-circle-xmark" />
              <p>{t("learning_page.quiz.empty_msg")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
