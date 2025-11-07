import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/PlanYourTrip.css';
import ServiceRepository from '../../../modules/Service/repository/ServiceRepository';
import GetPublicServices from '../../../modules/Service/application/GetPublicServices';
import SearchPublicService from '../../../modules/Service/application/SearchPublicService';
import { Skeleton } from 'primereact/skeleton';
import { Calendar } from 'primereact/calendar';
import { Galleria } from 'primereact/galleria';
import { addLocale } from 'primereact/api';
import QuoteRequestRepository from '../../../modules/QuoteRequest/repository/QuoteRequestRepository';
import CreateQuoteRequest from '../../../modules/QuoteRequest/application/CreateQuoteRequest';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function PlanYourTrip() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.error('Error al cargar servicios:', e?.message);
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
        const search = new SearchPublicService(repo);
        const result = await search.execute(trimmed);
        setServices(Array.isArray(result) ? result.slice(0, 6) : []);
      } catch (e) {
        console.error('Error en la búsqueda:', e?.message);
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
    { label: 'Peru (+51)', value: '+51', country: 'Perú' },
    { label: 'México (+52)', value: '+52', country: 'México' },
    { label: 'Colombia (+57)', value: '+57', country: 'Colombia' },
    { label: 'Chile (+56)', value: '+56', country: 'Chile' },
    { label: 'Argentina (+54)', value: '+54', country: 'Argentina' },
    { label: 'España (+34)', value: '+34', country: 'España' },
    { label: 'Estados Unidos (+1)', value: '+1', country: 'Estados Unidos' },
    { label: 'Bolivia (+591)', value: '+591', country: 'Bolivia' },
    { label: 'Ecuador (+593)', value: '+593', country: 'Ecuador' },
    { label: 'Brasil (+55)', value: '+55', country: 'Brasil' },
  ]), []);

  function resolveCountryName(code) {
    const found = countryOptions.find(c => c.value === code);
    return found ? found.country : undefined;
  }

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
        {submitting && (
          <div className="pyt-overlay">
            <ProgressSpinner />
          </div>
        )}
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
                    countryName: resolveCountryName(phoneCountry),
                    serviceIds: trips.map(t=>t.id)
                  };
                  await useCase.execute(payload);
                  window.location.assign('/plan-your-trip/thank-you');
                  // limpiar
                  setName(''); setEmail(''); setPhoneCountry('+51'); setPhoneNumber(''); setTravelDate(null); setOtherServices(''); setTrips([]);
                } catch (e) {
                  alert(e?.message || 'Error al enviar solicitud');
                } finally {
                  setSubmitting(false);
                }
              }}>{submitting ? 'Sending...' : 'Request a quote'}</button>
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
              
              // Preparar imágenes para Galleria
              const images = svc?.images?.map(img => ({
                itemImageSrc: img.imagePath ? `${process.env.REACT_APP_API_URL}/${img.imagePath}` : null
              })).filter(img => img.itemImageSrc) || [];
              
              const title = svc?.name || '';
              const isSelected = trips.some(t => t.id === svc?.id);
              
              const responsiveOptions = [
                {
                  breakpoint: '991px',
                  numVisible: 1
                },
                {
                  breakpoint: '767px',
                  numVisible: 1
                },
                {
                  breakpoint: '575px',
                  numVisible: 1
                }
              ];

              const itemTemplate = (item) => {
                return (
                  <img 
                    src={item.itemImageSrc} 
                    alt={title || 'Service image'} 
                    className="pyt-trip-image"
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                  />
                );
              };

              const thumbnailTemplate = (item) => {
                return (
                  <img 
                    src={item.itemImageSrc} 
                    alt={title || 'Service image'} 
                    style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                  />
                );
              };

              return (
                <article
                  key={svc?.id ?? idx}
                  className={`pyt-trip-card${isSelected ? ' pyt-selected' : ''}`}
                  onClick={() => handleAddTrip(svc)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                >
                  {images.length > 0 ? (
                    <Galleria
                      value={images}
                      responsiveOptions={responsiveOptions}
                      numVisible={3}
                      circular
                      item={itemTemplate}
                      thumbnail={thumbnailTemplate}
                      style={{ width: '100%' }}
                      showItemNavigators={false}
                      showThumbnails={false}
                      autoPlay={images.length > 1}
                      showIndicators={images.length > 1}
                      transitionOptions={{
                        classNames: 'p-galleria-slide-left'
                      }}
                      transitionInterval={5000}
                    />
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


