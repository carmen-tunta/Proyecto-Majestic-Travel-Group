import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/PlanYourTrip.css';
import ServiceRepository from '../../../modules/Service/repository/ServiceRepository';
import GetPublicServices from '../../../modules/Service/application/GetPublicServices';
import SearchService from '../../../modules/Service/application/SearchService';
import { Skeleton } from 'primereact/skeleton';
import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';
import { addLocale } from 'primereact/api';
import QuoteRequestRepository from '../../../modules/QuoteRequest/repository/QuoteRequestRepository';
import CreateQuoteRequest from '../../../modules/QuoteRequest/application/CreateQuoteRequest';

export default function PlanYourTrip() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  const [trips, setTrips] = useState([]);
  const [travelDate, setTravelDate] = useState(null);
  const [phoneCountry, setPhoneCountry] = useState('+51');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otherServices, setOtherServices] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const repo = new ServiceRepository();
        const useCase = new GetPublicServices(repo);
        const result = await useCase.execute(6);
        if (!mounted) return;
        setServices(Array.isArray(result?.data) ? result.data.slice(0, 6) : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Error al cargar servicios');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Locale español (coherente con Clientes)
  useEffect(() => {
    addLocale('es', {
      firstDayOfWeek: 1,
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      today: 'Hoy',
      clear: 'Limpiar'
    });
  }, []);

  async function handleSearch(value) {
    setQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setLoading(true);
    setServices([]); // evita parpadeos con datos anteriores

    searchTimeoutRef.current = setTimeout(async () => {
      const trimmed = value.trim();
      if (!trimmed) {
        const repo = new ServiceRepository();
        const useCase = new GetPublicServices(repo);
        const result = await useCase.execute(6);
        setServices(Array.isArray(result?.data) ? result.data.slice(0, 6) : []);
        setLoading(false);
        return;
      }
      try {
        const repo = new ServiceRepository();
        const search = new SearchService(repo);
        const result = await search.execute(trimmed);
        setServices(Array.isArray(result) ? result.slice(0, 6) : []);
      } catch (e) {
        setError(e?.message || 'Error en la búsqueda');
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleAddTrip(service) {
    if (!service?.id) return;
    setTrips(prev => (prev.some(t => t.id === service.id) ? prev : [...prev, { id: service.id, name: service.name }]));
  }

  function handleRemoveTrip(id) {
    setTrips(prev => prev.filter(t => t.id !== id));
  }

  const cards = useMemo(() => {
    if (loading) return Array.from({ length: 6 }).map(() => ({ id: Math.random() }));
    return services;
  }, [loading, services]);

  const countryOptions = useMemo(() => ([
    { label: 'Peru (+51)', value: '+51' },
    { label: 'México (+52)', value: '+52' },
    { label: 'Colombia (+57)', value: '+57' },
    { label: 'Chile (+56)', value: '+56' },
    { label: 'Argentina (+54)', value: '+54' },
    { label: 'España (+34)', value: '+34' },
    { label: 'Estados Unidos (+1)', value: '+1' },
    { label: 'Bolivia (+591)', value: '+591' },
    { label: 'Ecuador (+593)', value: '+593' },
    { label: 'Brasil (+55)', value: '+55' },
  ]), []);

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
                <input type="text" placeholder="" value={name} onChange={(e)=>setName(e.target.value)} required />
              </label>
              <label className="pyt-field">
                <span>E-mail*</span>
                <input type="email" placeholder="" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </label>
              <label className="pyt-field">
                <span>Whatsapp*</span>
                <div className="pyt-phone">
                  <select
                    className="pyt-phone-select"
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                    aria-label="Country code"
                  >
                    {countryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    className="pyt-phone-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="WhatsApp number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    aria-label="Phone number"
                  />
                </div>
              </label>
              <label className="pyt-field">
                <span>Probable travel date</span>
                <Calendar
                  id="travelDate"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.value)}
                  dateFormat="D dd M y"
                  locale="es"
                />
              </label>
              <label className="pyt-field">
                <span>You can inquire about other services here...</span>
                <input type="text" placeholder="" value={otherServices} onChange={(e)=>setOtherServices(e.target.value)} />
              </label>
              <div className="pyt-subsection">
                <h3>Trips</h3>
                <ul className="pyt-trips">
                  {trips.length === 0 && (
                    <li style={{ opacity: 0.7 }}>Selecciona un tour para agregarlo aquí</li>
                  )}
                  {trips.map(t => (
                    <li key={t.id} className="pyt-trip-item">
                      <span className="pyt-trip-text">{t.name}</span>
                      <button type="button" className="pyt-trip-remove" aria-label="Quitar" onClick={() => handleRemoveTrip(t.id)}>×</button>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="pyt-submit" type="button" disabled={submitting} onClick={async()=>{
                if (!name || !email) return;
                if (trips.length === 0) { alert('Selecciona al menos un servicio'); return; }
                try {
                  setSubmitting(true);
                  const repo = new QuoteRequestRepository();
                  const useCase = new CreateQuoteRequest(repo);
                  const payload = {
                    passengerName: name,
                    email: email,
                    countryCode: phoneCountry,
                    whatsapp: (phoneNumber || '').replace(/\D/g,''),
                    travelDate: travelDate ? new Date(travelDate).toISOString().slice(0,10) : undefined,
                    message: otherServices || undefined,
                    countryName: undefined,
                    serviceIds: trips.map(t=>t.id)
                  };
                  await useCase.execute(payload);
                  alert('Solicitud enviada correctamente');
                  // limpiar
                  setName(''); setEmail(''); setPhoneCountry('+51'); setPhoneNumber(''); setTravelDate(null); setOtherServices(''); setTrips([]);
                } catch (e) {
                  alert(e?.message || 'Error al enviar solicitud');
                } finally {
                  setSubmitting(false);
                }
              }}>Request a quote</button>
            </form>
          </section>
        </aside>

        <section className="pyt-content">
          <div className="pyt-search">
            <input
              className="pyt-search-input"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Choose or search for the trip you want, for example, Cusco."
            />
          </div>
          <div className="pyt-grid">
            {cards.map((svc, idx) => {
              if (loading) {
                return (
                  <article key={idx} className="pyt-trip-card">
                    <Skeleton width="100%" height="220px" borderRadius="8px 8px 0 0" />
                    <div className="pyt-trip-info">
                      <Skeleton width="70%" height="14px" />
                    </div>
                  </article>
                );
              }
              const img = svc?.images?.[0]?.imagePath ? `${process.env.REACT_APP_API_URL}/${svc.images[0].imagePath}` : null;
              const title = svc?.name || '';
              const isSelected = trips.some(t => t.id === svc?.id);
              return (
                <article
                  key={svc?.id ?? idx}
                  className={`pyt-trip-card${isSelected ? ' pyt-selected' : ''}`}
                  onClick={() => handleAddTrip(svc)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                >
                  {img ? (
                    <img className="pyt-trip-image" src={img} alt={title || 'Service image'} />
                  ) : (
                    <div className="pyt-trip-image" />
                  )}
                  <div className="pyt-trip-info">
                    <h4 className="pyt-trip-title">{title}</h4>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}


