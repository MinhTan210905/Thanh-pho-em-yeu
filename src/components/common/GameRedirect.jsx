import React from 'react';
import { Link } from 'react-router-dom';
import './GameRedirect.css';

/**
 * GameRedirect component to link from content pages to their respective games.
 * @param {Object} props
 * @param {string} props.to - The route to the game (e.g., "/tro-choi-vi-tri")
 * @param {string} props.gameName - The display name of the game
 */
const GameRedirect = ({ to, gameName }) => {
  return (
    <div className="gr-container">
      <div className="gr-wrapper">
        <div className="gr-content">
          <div className="gr-icon">
            <i className="fas fa-gamepad"></i>
          </div>
          <div className="gr-text">
            <span>Thử thách ngay</span>
            <h4>{gameName}</h4>
          </div>
        </div>
        <Link to={to} className="gr-button">
          <span>Khám phá</span>
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default GameRedirect;
