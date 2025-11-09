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
    { label: 'Afganistán (+93)', value: '+93', country: 'Afganistán' },
    { label: 'Albania (+355)', value: '+355', country: 'Albania' },
    { label: 'Alemania (+49)', value: '+49', country: 'Alemania' },
    { label: 'Andorra (+376)', value: '+376', country: 'Andorra' },
    { label: 'Angola (+244)', value: '+244', country: 'Angola' },
    { label: 'Anguila (+1)', value: '+1', country: 'Anguila' },
    { label: 'Antigua y Barbuda (+1)', value: '+1', country: 'Antigua y Barbuda' },
    { label: 'Arabia Saudita (+966)', value: '+966', country: 'Arabia Saudita' },
    { label: 'Argelia (+213)', value: '+213', country: 'Argelia' },
    { label: 'Argentina (+54)', value: '+54', country: 'Argentina' },
    { label: 'Armenia (+374)', value: '+374', country: 'Armenia' },
    { label: 'Aruba (+297)', value: '+297', country: 'Aruba' },
    { label: 'Australia (+61)', value: '+61', country: 'Australia' },
    { label: 'Austria (+43)', value: '+43', country: 'Austria' },
    { label: 'Azerbaiyán (+994)', value: '+994', country: 'Azerbaiyán' },
    { label: 'Bahamas (+1)', value: '+1', country: 'Bahamas' },
    { label: 'Bangladés (+880)', value: '+880', country: 'Bangladés' },
    { label: 'Barbados (+1)', value: '+1', country: 'Barbados' },
    { label: 'Baréin (+973)', value: '+973', country: 'Baréin' },
    { label: 'Belice (+501)', value: '+501', country: 'Belice' },
    { label: 'Bélgica (+32)', value: '+32', country: 'Bélgica' },
    { label: 'Benín (+229)', value: '+229', country: 'Benín' },
    { label: 'Bermudas (+1)', value: '+1', country: 'Bermudas' },
    { label: 'Bielorrusia (+375)', value: '+375', country: 'Bielorrusia' },
    { label: 'Birmania (+95)', value: '+95', country: 'Birmania' },
    { label: 'Bolivia (+591)', value: '+591', country: 'Bolivia' },
    { label: 'Bosnia y Herzegovina (+387)', value: '+387', country: 'Bosnia y Herzegovina' },
    { label: 'Botsuana (+267)', value: '+267', country: 'Botsuana' },
    { label: 'Brasil (+55)', value: '+55', country: 'Brasil' },
    { label: 'Brunéi (+673)', value: '+673', country: 'Brunéi' },
    { label: 'Bulgaria (+359)', value: '+359', country: 'Bulgaria' },
    { label: 'Burkina Faso (+226)', value: '+226', country: 'Burkina Faso' },
    { label: 'Burundi (+257)', value: '+257', country: 'Burundi' },
    { label: 'Bután (+975)', value: '+975', country: 'Bután' },
    { label: 'Cabo Verde (+238)', value: '+238', country: 'Cabo Verde' },
    { label: 'Camboya (+855)', value: '+855', country: 'Camboya' },
    { label: 'Camerún (+237)', value: '+237', country: 'Camerún' },
    { label: 'Canadá (+1)', value: '+1', country: 'Canadá' },
    { label: 'Catar (+974)', value: '+974', country: 'Catar' },
    { label: 'Chad (+235)', value: '+235', country: 'Chad' },
    { label: 'Chile (+56)', value: '+56', country: 'Chile' },
    { label: 'China (+86)', value: '+86', country: 'China' },
    { label: 'Chipre (+357)', value: '+357', country: 'Chipre' },
    { label: 'Colombia (+57)', value: '+57', country: 'Colombia' },
    { label: 'Comoras (+269)', value: '+269', country: 'Comoras' },
    { label: 'Corea del Norte (+850)', value: '+850', country: 'Corea del Norte' },
    { label: 'Corea del Sur (+82)', value: '+82', country: 'Corea del Sur' },
    { label: 'Costa de Marfil (+225)', value: '+225', country: 'Costa de Marfil' },
    { label: 'Costa Rica (+506)', value: '+506', country: 'Costa Rica' },
    { label: 'Croacia (+385)', value: '+385', country: 'Croacia' },
    { label: 'Cuba (+53)', value: '+53', country: 'Cuba' },
    { label: 'Curazao (+599)', value: '+599', country: 'Curazao' },
    { label: 'Dinamarca (+45)', value: '+45', country: 'Dinamarca' },
    { label: 'Dominica (+1)', value: '+1', country: 'Dominica' },
    { label: 'Ecuador (+593)', value: '+593', country: 'Ecuador' },
    { label: 'Egipto (+20)', value: '+20', country: 'Egipto' },
    { label: 'El Salvador (+503)', value: '+503', country: 'El Salvador' },
    { label: 'Emiratos Árabes Unidos (+971)', value: '+971', country: 'Emiratos Árabes Unidos' },
    { label: 'Eritrea (+291)', value: '+291', country: 'Eritrea' },
    { label: 'Eslovaquia (+421)', value: '+421', country: 'Eslovaquia' },
    { label: 'Eslovenia (+386)', value: '+386', country: 'Eslovenia' },
    { label: 'España (+34)', value: '+34', country: 'España' },
    { label: 'Estados Unidos (+1)', value: '+1', country: 'Estados Unidos' },
    { label: 'Estonia (+372)', value: '+372', country: 'Estonia' },
    { label: 'Etiopía (+251)', value: '+251', country: 'Etiopía' },
    { label: 'Filipinas (+63)', value: '+63', country: 'Filipinas' },
    { label: 'Finlandia (+358)', value: '+358', country: 'Finlandia' },
    { label: 'Fiyi (+679)', value: '+679', country: 'Fiyi' },
    { label: 'Francia (+33)', value: '+33', country: 'Francia' },
    { label: 'Gabón (+241)', value: '+241', country: 'Gabón' },
    { label: 'Gambia (+220)', value: '+220', country: 'Gambia' },
    { label: 'Georgia (+995)', value: '+995', country: 'Georgia' },
    { label: 'Ghana (+233)', value: '+233', country: 'Ghana' },
    { label: 'Gibraltar (+350)', value: '+350', country: 'Gibraltar' },
    { label: 'Granada (+1)', value: '+1', country: 'Granada' },
    { label: 'Grecia (+30)', value: '+30', country: 'Grecia' },
    { label: 'Groenlandia (+299)', value: '+299', country: 'Groenlandia' },
    { label: 'Guadalupe (+590)', value: '+590', country: 'Guadalupe' },
    { label: 'Guam (+1)', value: '+1', country: 'Guam' },
    { label: 'Guatemala (+502)', value: '+502', country: 'Guatemala' },
    { label: 'Guayana Francesa (+594)', value: '+594', country: 'Guayana Francesa' },
    { label: 'Guernsey (+44)', value: '+44', country: 'Guernsey' },
    { label: 'Guinea (+224)', value: '+224', country: 'Guinea' },
    { label: 'Guinea-Bisáu (+245)', value: '+245', country: 'Guinea-Bisáu' },
    { label: 'Guinea Ecuatorial (+240)', value: '+240', country: 'Guinea Ecuatorial' },
    { label: 'Guyana (+592)', value: '+592', country: 'Guyana' },
    { label: 'Haití (+509)', value: '+509', country: 'Haití' },
    { label: 'Honduras (+504)', value: '+504', country: 'Honduras' },
    { label: 'Hong Kong (+852)', value: '+852', country: 'Hong Kong' },
    { label: 'Hungría (+36)', value: '+36', country: 'Hungría' },
    { label: 'India (+91)', value: '+91', country: 'India' },
    { label: 'Indonesia (+62)', value: '+62', country: 'Indonesia' },
    { label: 'Irak (+964)', value: '+964', country: 'Irak' },
    { label: 'Irán (+98)', value: '+98', country: 'Irán' },
    { label: 'Irlanda (+353)', value: '+353', country: 'Irlanda' },
    { label: 'Isla de Man (+44)', value: '+44', country: 'Isla de Man' },
    { label: 'Islandia (+354)', value: '+354', country: 'Islandia' },
    { label: 'Islas Caimán (+1)', value: '+1', country: 'Islas Caimán' },
    { label: 'Islas Cook (+682)', value: '+682', country: 'Islas Cook' },
    { label: 'Islas Faroe (+298)', value: '+298', country: 'Islas Faroe' },
    { label: 'Islas Marshall (+692)', value: '+692', country: 'Islas Marshall' },
    { label: 'Islas Salomón (+677)', value: '+677', country: 'Islas Salomón' },
    { label: 'Islas Turcas y Caicos (+1)', value: '+1', country: 'Islas Turcas y Caicos' },
    { label: 'Islas Vírgenes Británicas (+1)', value: '+1', country: 'Islas Vírgenes Británicas' },
    { label: 'Islas Vírgenes de los Estados Unidos (+1)', value: '+1', country: 'Islas Vírgenes de los Estados Unidos' },
    { label: 'Israel (+972)', value: '+972', country: 'Israel' },
    { label: 'Italia (+39)', value: '+39', country: 'Italia' },
    { label: 'Jamaica (+1)', value: '+1', country: 'Jamaica' },
    { label: 'Japón (+81)', value: '+81', country: 'Japón' },
    { label: 'Jersey (+44)', value: '+44', country: 'Jersey' },
    { label: 'Jordania (+962)', value: '+962', country: 'Jordania' },
    { label: 'Kazajistán (+7)', value: '+7', country: 'Kazajistán' },
    { label: 'Kenia (+254)', value: '+254', country: 'Kenia' },
    { label: 'Kirguistán (+996)', value: '+996', country: 'Kirguistán' },
    { label: 'Kiribati (+686)', value: '+686', country: 'Kiribati' },
    { label: 'Kuwait (+965)', value: '+965', country: 'Kuwait' },
    { label: 'Laos (+856)', value: '+856', country: 'Laos' },
    { label: 'Lesoto (+266)', value: '+266', country: 'Lesoto' },
    { label: 'Letonia (+371)', value: '+371', country: 'Letonia' },
    { label: 'Líbano (+961)', value: '+961', country: 'Líbano' },
    { label: 'Liberia (+231)', value: '+231', country: 'Liberia' },
    { label: 'Libia (+218)', value: '+218', country: 'Libia' },
    { label: 'Liechtenstein (+423)', value: '+423', country: 'Liechtenstein' },
    { label: 'Lituania (+370)', value: '+370', country: 'Lituania' },
    { label: 'Luxemburgo (+352)', value: '+352', country: 'Luxemburgo' },
    { label: 'Macao (+853)', value: '+853', country: 'Macao' },
    { label: 'Macedonia del Norte (+389)', value: '+389', country: 'Macedonia del Norte' },
    { label: 'Madagascar (+261)', value: '+261', country: 'Madagascar' },
    { label: 'Malasia (+60)', value: '+60', country: 'Malasia' },
    { label: 'Malaui (+265)', value: '+265', country: 'Malaui' },
    { label: 'Maldivas (+960)', value: '+960', country: 'Maldivas' },
    { label: 'Malí (+223)', value: '+223', country: 'Malí' },
    { label: 'Malta (+356)', value: '+356', country: 'Malta' },
    { label: 'Marruecos (+212)', value: '+212', country: 'Marruecos' },
    { label: 'Martinica (+596)', value: '+596', country: 'Martinica' },
    { label: 'Mauricio (+230)', value: '+230', country: 'Mauricio' },
    { label: 'Mauritania (+222)', value: '+222', country: 'Mauritania' },
    { label: 'Mayotte (+262)', value: '+262', country: 'Mayotte' },
    { label: 'México (+52)', value: '+52', country: 'México' },
    { label: 'Micronesia (+691)', value: '+691', country: 'Micronesia' },
    { label: 'Moldavia (+373)', value: '+373', country: 'Moldavia' },
    { label: 'Mónaco (+377)', value: '+377', country: 'Mónaco' },
    { label: 'Mongolia (+976)', value: '+976', country: 'Mongolia' },
    { label: 'Montenegro (+382)', value: '+382', country: 'Montenegro' },
    { label: 'Montserrat (+1)', value: '+1', country: 'Montserrat' },
    { label: 'Mozambique (+258)', value: '+258', country: 'Mozambique' },
    { label: 'Myanmar (+95)', value: '+95', country: 'Myanmar' },
    { label: 'Namibia (+264)', value: '+264', country: 'Namibia' },
    { label: 'Nauru (+674)', value: '+674', country: 'Nauru' },
    { label: 'Nepal (+977)', value: '+977', country: 'Nepal' },
    { label: 'Nicaragua (+505)', value: '+505', country: 'Nicaragua' },
    { label: 'Níger (+227)', value: '+227', country: 'Níger' },
    { label: 'Nigeria (+234)', value: '+234', country: 'Nigeria' },
    { label: 'Niue (+683)', value: '+683', country: 'Niue' },
    { label: 'Noruega (+47)', value: '+47', country: 'Noruega' },
    { label: 'Nueva Caledonia (+687)', value: '+687', country: 'Nueva Caledonia' },
    { label: 'Nueva Zelanda (+64)', value: '+64', country: 'Nueva Zelanda' },
    { label: 'Omán (+968)', value: '+968', country: 'Omán' },
    { label: 'Países Bajos (+31)', value: '+31', country: 'Países Bajos' },
    { label: 'Pakistán (+92)', value: '+92', country: 'Pakistán' },
    { label: 'Palaos (+680)', value: '+680', country: 'Palaos' },
    { label: 'Palestina (+970)', value: '+970', country: 'Palestina' },
    { label: 'Panamá (+507)', value: '+507', country: 'Panamá' },
    { label: 'Papúa Nueva Guinea (+675)', value: '+675', country: 'Papúa Nueva Guinea' },
    { label: 'Paraguay (+595)', value: '+595', country: 'Paraguay' },
    { label: 'Perú (+51)', value: '+51', country: 'Perú' },
    { label: 'Polinesia Francesa (+689)', value: '+689', country: 'Polinesia Francesa' },
    { label: 'Polonia (+48)', value: '+48', country: 'Polonia' },
    { label: 'Portugal (+351)', value: '+351', country: 'Portugal' },
    { label: 'Puerto Rico (+1)', value: '+1', country: 'Puerto Rico' },
    { label: 'Reino Unido (+44)', value: '+44', country: 'Reino Unido' },
    { label: 'República Centroafricana (+236)', value: '+236', country: 'República Centroafricana' },
    { label: 'República Checa (+420)', value: '+420', country: 'República Checa' },
    { label: 'República del Congo (+242)', value: '+242', country: 'República del Congo' },
    { label: 'República Democrática del Congo (+243)', value: '+243', country: 'República Democrática del Congo' },
    { label: 'República Dominicana (+1)', value: '+1', country: 'República Dominicana' },
    { label: 'Reunión (+262)', value: '+262', country: 'Reunión' },
    { label: 'Ruanda (+250)', value: '+250', country: 'Ruanda' },
    { label: 'Rumanía (+40)', value: '+40', country: 'Rumanía' },
    { label: 'Rusia (+7)', value: '+7', country: 'Rusia' },
    { label: 'Sahara Occidental (+212)', value: '+212', country: 'Sahara Occidental' },
    { label: 'Saint-Barthélemy (+590)', value: '+590', country: 'Saint-Barthélemy' },
    { label: 'Saint-Pierre y Miquelon (+508)', value: '+508', country: 'Saint-Pierre y Miquelon' },
    { label: 'Samoa (+685)', value: '+685', country: 'Samoa' },
    { label: 'Samoa Americana (+1)', value: '+1', country: 'Samoa Americana' },
    { label: 'San Cristóbal y Nieves (+1)', value: '+1', country: 'San Cristóbal y Nieves' },
    { label: 'San Marino (+378)', value: '+378', country: 'San Marino' },
    { label: 'San Martín (+590)', value: '+590', country: 'San Martín' },
    { label: 'San Vicente y las Granadinas (+1)', value: '+1', country: 'San Vicente y las Granadinas' },
    { label: 'Santa Helena (+290)', value: '+290', country: 'Santa Helena' },
    { label: 'Santa Lucía (+1)', value: '+1', country: 'Santa Lucía' },
    { label: 'Santo Tomé y Príncipe (+239)', value: '+239', country: 'Santo Tomé y Príncipe' },
    { label: 'Senegal (+221)', value: '+221', country: 'Senegal' },
    { label: 'Serbia (+381)', value: '+381', country: 'Serbia' },
    { label: 'Seychelles (+248)', value: '+248', country: 'Seychelles' },
    { label: 'Sierra Leona (+232)', value: '+232', country: 'Sierra Leona' },
    { label: 'Singapur (+65)', value: '+65', country: 'Singapur' },
    { label: 'Sint Maarten (+1)', value: '+1', country: 'Sint Maarten' },
    { label: 'Siria (+963)', value: '+963', country: 'Siria' },
    { label: 'Somalia (+252)', value: '+252', country: 'Somalia' },
    { label: 'Sri Lanka (+94)', value: '+94', country: 'Sri Lanka' },
    { label: 'Sudáfrica (+27)', value: '+27', country: 'Sudáfrica' },
    { label: 'Sudán (+249)', value: '+249', country: 'Sudán' },
    { label: 'Sudán del Sur (+211)', value: '+211', country: 'Sudán del Sur' },
    { label: 'Suecia (+46)', value: '+46', country: 'Suecia' },
    { label: 'Suiza (+41)', value: '+41', country: 'Suiza' },
    { label: 'Surinam (+597)', value: '+597', country: 'Surinam' },
    { label: 'Tailandia (+66)', value: '+66', country: 'Tailandia' },
    { label: 'Taiwán (+886)', value: '+886', country: 'Taiwán' },
    { label: 'Tanzania (+255)', value: '+255', country: 'Tanzania' },
    { label: 'Tayikistán (+992)', value: '+992', country: 'Tayikistán' },
    { label: 'Timor Oriental (+670)', value: '+670', country: 'Timor Oriental' },
    { label: 'Togo (+228)', value: '+228', country: 'Togo' },
    { label: 'Tokelau (+690)', value: '+690', country: 'Tokelau' },
    { label: 'Tonga (+676)', value: '+676', country: 'Tonga' },
    { label: 'Trinidad y Tobago (+1)', value: '+1', country: 'Trinidad y Tobago' },
    { label: 'Túnez (+216)', value: '+216', country: 'Túnez' },
    { label: 'Turkmenistán (+993)', value: '+993', country: 'Turkmenistán' },
    { label: 'Turquía (+90)', value: '+90', country: 'Turquía' },
    { label: 'Tuvalu (+688)', value: '+688', country: 'Tuvalu' },
    { label: 'Ucrania (+380)', value: '+380', country: 'Ucrania' },
    { label: 'Uganda (+256)', value: '+256', country: 'Uganda' },
    { label: 'Uruguay (+598)', value: '+598', country: 'Uruguay' },
    { label: 'Uzbekistán (+998)', value: '+998', country: 'Uzbekistán' },
    { label: 'Vanuatu (+678)', value: '+678', country: 'Vanuatu' },
    { label: 'Vaticano (+39)', value: '+39', country: 'Vaticano' },
    { label: 'Venezuela (+58)', value: '+58', country: 'Venezuela' },
    { label: 'Vietnam (+84)', value: '+84', country: 'Vietnam' },
    { label: 'Wallis y Futuna (+681)', value: '+681', country: 'Wallis y Futuna' },
    { label: 'Yemen (+967)', value: '+967', country: 'Yemen' },
    { label: 'Yibuti (+253)', value: '+253', country: 'Yibuti' },
    { label: 'Zambia (+260)', value: '+260', country: 'Zambia' },
    { label: 'Zimbabue (+263)', value: '+263', country: 'Zimbabue' },
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
                <span>Tour date</span>
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


