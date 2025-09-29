import React from 'react';
import '../styles/PlanYourTrip.css';

export default function PlanYourTrip() {
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

      <main className="pyt-main">
        <aside className="pyt-sidebar">
          <section className="pyt-card">
            <h2 className="pyt-section-title">Experiences for:</h2>
            <form className="pyt-form" onSubmit={(e) => e.preventDefault()}>
              <label className="pyt-field">
                <span>Passenger name*</span>
                <input type="text" placeholder="" />
              </label>
              <label className="pyt-field">
                <span>E-mail*</span>
                <input type="email" placeholder="" />
              </label>
              <label className="pyt-field">
                <span>Whatsapp*</span>
                <input type="tel" placeholder="+51 Whatsapp*" />
              </label>
              <label className="pyt-field">
                <span>Probable travel date</span>
                <input type="date" />
              </label>
              <label className="pyt-field">
                <span>You can inquire about other services here...</span>
                <input type="text" placeholder="" />
              </label>
              <div className="pyt-subsection">
                <h3>Trips</h3>
                <ul className="pyt-trips">
                  <li>Excursión de día completo a la montaña Arcoíris (excursión en grupo)</li>
                  <li>Reserva Nacional de Salinas y Aguada Blanca</li>
                </ul>
              </div>
              <button className="pyt-submit" type="button">Request a quote</button>
            </form>
          </section>
        </aside>

        <section className="pyt-content">
          <div className="pyt-search">
            <input className="pyt-search-input" placeholder="Choose or search for the trip you want, for example, Cusco." />
          </div>
          <div className="pyt-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <article key={idx} className="pyt-trip-card">
                <div className="pyt-trip-image" />
                <div className="pyt-trip-info">
                  <h4 className="pyt-trip-title">Título de experiencia de ejemplo</h4>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


