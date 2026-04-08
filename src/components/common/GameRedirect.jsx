import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './GameRedirect.css';

/**
 * GameRedirect component to link from content pages to their respective games.
 * @param {Object} props
 * @param {string} props.to - The route to the game (e.g., "/tro-choi-vi-tri")
 * @param {string} props.gameName - The display name of the game
 */
const GameRedirect = ({ to, gameName }) => {
  const { t } = useTranslation();

  return (
    <div className="gr-container">
      <div className="gr-wrapper">
        <div className="gr-content">
          <div className="gr-icon">
            <i className="fas fa-gamepad"></i>
          </div>
          <div className="gr-text">
            <span>{t("common.game_redirect.challenge_now")}</span>
            <h4>{gameName}</h4>
          </div>
        </div>
        <Link to={to} className="gr-button">
          <span>{t("common.game_redirect.explore")}</span>
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default GameRedirect;
