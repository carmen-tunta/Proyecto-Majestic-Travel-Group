import React from 'react';
import '../styles/PlanYourTrip.css';

export default function ThankYou() {
  return (
    <div className="pyt-page">
      <header className="pyt-header">
        <div className="pyt-brand">
          <img src="/logo_mtg.png" alt="Majestic Travel Group" className="pyt-logo" />
          <div className="pyt-title">
            <h1>Plan your trip</h1>
            <a href="/" className="pyt-home-link">Return to home</a>
          </div>
        </div>
      </header>

      <main className="pyt-thanks-container">
        <div className="pyt-thanks-box">
          <h2>Thank you,</h2>
          <p>An advisor will contact you shortly.</p>
        </div>
      </main>
    </div>
  );
}


