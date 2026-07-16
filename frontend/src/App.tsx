import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, CalendarDays, Camera, CarFront, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock3, FileText, Home, Info, MapPin, Menu, PenLine, Plus, ShieldCheck,
  Sparkles, Star, UserRound, UsersRound, Wifi, X
} from 'lucide-react'
import { bookAppointment, getSlots, saveClaim, submitClaim } from './lib/api'
import { circumstances, demoClaim } from './data/demo'
import { initialClaim, type Claim, type ClaimPayload, type Party, type Slot } from './types'
import { useI18n } from './i18n'

type Screen = 'home' | 'wizard' | 'review' | 'submitted' | 'booking' | 'success'
const steps = ['Incidente', 'Veicoli', 'Dinamica', 'Allegati', 'Conferma']

function Logo() {
  return <div className="brand"><span className="brand-mark"><ClipboardCheck size={20} /></span><span>claim<span>flow</span></span></div>
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function Header({ onHome, back }: { onHome: () => void; back?: () => void }) {
  const { locale, setLocale, t } = useI18n()
  return <header className="topbar">
    <button className="icon-button mobile-only" aria-label={back ? t('Indietro') : t('Menu')} onClick={back ?? onHome}>{back ? <ArrowLeft /> : <Menu />}</button>
    <button className="logo-button" onClick={onHome}><Logo /></button>
    <div className="secure"><Wifi size={15} /><span>{t('Salvataggio automatico')}</span></div>
    <div className="language-switch" aria-label="Language"><button className={locale === 'it' ? 'active' : ''} onClick={() => setLocale('it')}>IT</button><button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button></div>
    <button className="avatar" aria-label={t('Profilo')}>LB</button>
  </header>
}

function Sidebar({ active, onHome }: { active: string; onHome: () => void }) {
  const { t } = useI18n()
  return <aside className="sidebar">
    <Logo />
    <nav>
      <button className={active === 'home' ? 'active' : ''} onClick={onHome}><Home />{t('Panoramica')}</button>
      <button className={active === 'claims' ? 'active' : ''}><FileText />{t('Le mie pratiche')}<span className="nav-count">1</span></button>
      <button><CalendarDays />{t('Appuntamenti')}</button>
    </nav>
    <div className="sidebar-card"><ShieldCheck /><strong>{t('I tuoi dati sono protetti')}</strong><p>{t('Crittografia end-to-end e gestione conforme al GDPR.')}</p></div>
    <div className="profile"><div className="avatar">LB</div><span><strong>Luca Bianchi</strong><small>{t('Polizza Auto · Attiva')}</small></span></div>
  </aside>
}

function HomeScreen({ start }: { start: () => void }) {
  const { t, formatDate } = useI18n()
  const today = new Date()
  return <main className="home-content">
    <section className="welcome">
      <div><span className="eyebrow">{t('BUONGIORNO, LUCA')}</span><h1>{t('Come possiamo aiutarti?')}</h1><p>{t('Gestisci un sinistro in pochi minuti, senza carta e senza attese.')}</p></div>
      <div className="weather-pill"><span>{today.getDate()}</span><small>{formatDate(today, { month: 'short' }).toUpperCase()}<br />{today.getFullYear()}</small></div>
    </section>
    <section className="action-grid">
      <button className="new-claim" onClick={start}>
        <span className="big-icon"><Plus /></span><span><strong>{t('Denuncia un sinistro')}</strong><small>{t('Compila il modulo digitale guidato')}</small></span><ArrowRight className="push" />
      </button>
      <button className="secondary-action"><span className="soft-icon"><FileText /></span><span><strong>{t('Consulta una pratica')}</strong><small>{t('Segui stato e aggiornamenti')}</small></span><ChevronRight className="push" /></button>
      <button className="secondary-action"><span className="soft-icon"><CalendarDays /></span><span><strong>{t('I tuoi appuntamenti')}</strong><small>{t('Visualizza o modifica una prenotazione')}</small></span><ChevronRight className="push" /></button>
    </section>
    <section className="section-block">
      <div className="section-title"><div><span className="eyebrow">{t('IN EVIDENZA')}</span><h2>{t('La tua protezione, sempre con te')}</h2></div><button>{t('Scopri di più')} <ArrowRight size={16} /></button></div>
      <div className="insight-card"><div className="insight-art"><ShieldCheck /></div><div><span className="tag">{t('GUIDA RAPIDA')}</span><h3>{t('Cosa fare subito dopo un incidente?')}</h3><p>{t('Metti tutti in sicurezza, documenta la scena e raccogli i dati. Con ClaimFlow puoi fare tutto dal telefono.')}</p><button className="text-link">{t('Leggi la guida')} <ArrowRight size={16} /></button></div></div>
    </section>
  </main>
}

function WizardHeader({ step, back }: { step: number; back: () => void }) {
  const { t } = useI18n()
  return <div className="wizard-head"><button className="back-link" onClick={back}><ArrowLeft />{t('Indietro')}</button><div className="step-copy"><span>{t('PASSAGGIO {current} DI {total}', { current: step + 1, total: steps.length })}</span><strong>{t(steps[step])}</strong></div><div className="progress-track"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
}

function AccidentStep({ value, change }: { value: ClaimPayload; change: (v: ClaimPayload) => void }) {
  const { t } = useI18n()
  const accident = value.accident
  const set = (patch: Partial<typeof accident>) => change({ ...value, accident: { ...accident, ...patch } })
  return <div className="form-stack">
    <div className="form-intro"><span className="form-icon"><MapPin /></span><div><h1>{t('Partiamo dall’incidente')}</h1><p>{t('Inserisci quando e dove è successo. Potrai modificare tutto prima dell’invio.')}</p></div></div>
    <div className="form-card two-col">
      <Field label={t('Data e ora')}><input type="datetime-local" value={accident.occurredAt} onChange={e => set({ occurredAt: e.target.value })} /></Field>
      <Field label={t('Veicoli coinvolti')}><select value={accident.vehiclesInvolved} onChange={e => set({ vehiclesInvolved: Number(e.target.value) })}><option value={2}>{t('2 veicoli')}</option><option value={3}>{t('3 veicoli')}</option><option value={4}>{t('4 o più')}</option></select></Field>
      <Field label={t('Luogo dell’incidente')}><div className="input-with-icon"><MapPin /><input placeholder={t('Via, numero civico, città')} value={accident.location} onChange={e => set({ location: e.target.value })} /></div></Field>
      <div className="field"><span>{t('Ci sono feriti?')}</span><div className="segmented"><button className={!accident.injuries ? 'selected' : ''} onClick={() => set({ injuries: false })}>{t('No')}</button><button className={accident.injuries ? 'selected warning' : ''} onClick={() => set({ injuries: true })}>{t('Sì')}</button></div></div>
    </div>
    <div className="notice"><Info /><p><strong>{t('Prima la sicurezza.')}</strong> {t('Se ci sono feriti chiama subito il 112. Questa demo non sostituisce i servizi di emergenza.')}</p></div>
  </div>
}

function PartyCard({ title, badge, party, onChange }: { title: string; badge: string; party: Party; onChange: (p: Party) => void }) {
  const { t } = useI18n()
  const driver = (patch: Partial<Party['driver']>) => onChange({ ...party, driver: { ...party.driver, ...patch } })
  const vehicle = (patch: Partial<Party['vehicle']>) => onChange({ ...party, vehicle: { ...party.vehicle, ...patch } })
  return <div className="form-card party-card">
    <div className="card-heading"><span className={`vehicle-badge ${badge.toLowerCase()}`}><CarFront />{badge}</span><div><h3>{t(title)}</h3><p>{t('Dati del conducente e del veicolo')}</p></div></div>
    <h4><UserRound /> {t('Conducente')}</h4>
    <div className="two-col compact">
      <Field label={t('Nome')}><input value={party.driver.firstName} onChange={e => driver({ firstName: e.target.value })} /></Field>
      <Field label={t('Cognome')}><input value={party.driver.lastName} onChange={e => driver({ lastName: e.target.value })} /></Field>
      <Field label={t('Telefono')}><input type="tel" value={party.driver.phone} onChange={e => driver({ phone: e.target.value })} /></Field>
      <Field label={t('Email')}><input type="email" value={party.driver.email} onChange={e => driver({ email: e.target.value })} /></Field>
    </div>
    <h4><CarFront /> {t('Veicolo e polizza')}</h4>
    <div className="two-col compact">
      <Field label={t('Targa')}><input className="plate-input" value={party.vehicle.plate} onChange={e => vehicle({ plate: e.target.value.toUpperCase() })} /></Field>
      <Field label={t('Marca e modello')}><div className="split-input"><input placeholder={t('Marca')} value={party.vehicle.brand} onChange={e => vehicle({ brand: e.target.value })} /><input placeholder={t('Modello')} value={party.vehicle.model} onChange={e => vehicle({ model: e.target.value })} /></div></Field>
      <Field label={t('Compagnia')}><input value={party.vehicle.insurer} onChange={e => vehicle({ insurer: e.target.value })} /></Field>
      <Field label={t('Numero polizza')}><input value={party.vehicle.policyNumber} onChange={e => vehicle({ policyNumber: e.target.value })} /></Field>
    </div>
  </div>
}

function PartiesStep({ value, change }: { value: ClaimPayload; change: (v: ClaimPayload) => void }) {
  const { t } = useI18n()
  return <div className="form-stack"><div className="form-intro"><span className="form-icon"><UsersRound /></span><div><h1>{t('Chi era coinvolto?')}</h1><p>{t('Aggiungi i dati dei due veicoli. Abbiamo separato le parti per ridurre gli errori.')}</p></div></div><PartyCard title="Il tuo veicolo" badge="A" party={value.partyA} onChange={partyA => change({ ...value, partyA })} /><PartyCard title="L’altro veicolo" badge="B" party={value.partyB} onChange={partyB => change({ ...value, partyB })} /></div>
}

function DynamicsStep({ value, change }: { value: ClaimPayload; change: (v: ClaimPayload) => void }) {
  const { t } = useI18n()
  const accident = value.accident
  const toggle = (item: string) => change({ ...value, accident: { ...accident, circumstances: accident.circumstances.includes(item) ? accident.circumstances.filter(x => x !== item) : [...accident.circumstances, item] } })
  return <div className="form-stack"><div className="form-intro"><span className="form-icon"><PenLine /></span><div><h1>{t('Raccontaci la dinamica')}</h1><p>{t('Seleziona le circostanze applicabili e descrivi l’accaduto con parole semplici.')}</p></div></div><div className="form-card"><h3 className="question">{t('Quali situazioni descrivono l’incidente?')}</h3><div className="choice-grid">{circumstances.map(item => <button key={item} onClick={() => toggle(item)} className={accident.circumstances.includes(item) ? 'chosen' : ''}><span>{accident.circumstances.includes(item) && <Check />}</span>{t(item)}</button>)}</div><Field label={t('Descrizione dell’accaduto')} hint={t('{count}/500 caratteri', { count: accident.description.length })}><textarea maxLength={500} rows={5} placeholder={t('Descrivi direzione, manovra e punto d’urto…')} value={accident.description} onChange={e => change({ ...value, accident: { ...accident, description: e.target.value } })} /></Field></div><div className="rule-hint"><Sparkles /><div><strong>{t('Validazione intelligente')}</strong><p>{t('Le regole di triage useranno dinamica, numero di veicoli e presenza di feriti per assegnare la priorità.')}</p></div><span>RULE ENGINE</span></div></div>
}

function PhotosStep({ value, change }: { value: ClaimPayload; change: (v: ClaimPayload) => void }) {
  const { t } = useI18n()
  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? []).map(file => file.name)
    change({ ...value, photoNames: [...value.photoNames, ...names].slice(0, 6) })
  }
  return <div className="form-stack"><div className="form-intro"><span className="form-icon"><Camera /></span><div><h1>{t('Aggiungi le prove')}</h1><p>{t('Fotografa danni, targhe e una panoramica della scena. Nella demo salviamo solo i nomi dei file.')}</p></div></div><div className="form-card"><label className="upload-zone"><input type="file" accept="image/*" multiple onChange={addFiles} /><span className="upload-icon"><Camera /></span><strong>{t('Scatta o carica una foto')}</strong><small>{t('JPG o PNG · massimo 6 immagini')}</small><span className="fake-button">{t('Scegli immagini')}</span></label>{value.photoNames.length > 0 && <div className="photo-grid">{value.photoNames.map((name, i) => <div className={`photo-placeholder photo-${i % 3}`} key={`${name}-${i}`}><Camera /><button aria-label={t('Rimuovi foto')} onClick={() => change({ ...value, photoNames: value.photoNames.filter((_, n) => n !== i) })}><X /></button><span>{name}</span></div>)}</div>}</div><div className="photo-tips"><h3>{t('Foto consigliate')}</h3><div><span><CarFront />{t('Danni ai veicoli')}</span><span><MapPin />{t('Scena completa')}</span><span><FileText />{t('Targhe e documenti')}</span></div></div></div>
}

function ConfirmStep({ value, change }: { value: ClaimPayload; change: (v: ClaimPayload) => void }) {
  const { t } = useI18n()
  return <div className="form-stack"><div className="form-intro"><span className="form-icon"><ClipboardCheck /></span><div><h1>{t('Ultima conferma')}</h1><p>{t('Leggi con attenzione. Prima dell’invio vedrai ancora un riepilogo completo.')}</p></div></div><div className="form-card consent-card"><div className="signature-demo"><span>{t('Firma dimostrativa')}</span><strong>Luca Bianchi</strong><PenLine /></div><label className="check-row"><input type="checkbox" checked={value.signatureConfirmed} onChange={e => change({ ...value, signatureConfirmed: e.target.checked })} /><span><i><Check /></i><strong>{t('Confermo la correttezza dei dati')}</strong><small>{t('Dichiaro che le informazioni inserite corrispondono a quanto avvenuto.')}</small></span></label><div className="legal-note"><ShieldCheck /><p>{t('Questa è una demo tecnica e non costituisce un modulo CAI/CID con validità legale. Non inserire dati personali reali.')}</p></div></div></div>
}

function Wizard({ value, change, step, setStep, onReview, onHome }: { value: ClaimPayload; change: (v: ClaimPayload) => void; step: number; setStep: (n: number) => void; onReview: () => void; onHome: () => void }) {
  const { t } = useI18n()
  const content = [<AccidentStep value={value} change={change} />, <PartiesStep value={value} change={change} />, <DynamicsStep value={value} change={change} />, <PhotosStep value={value} change={change} />, <ConfirmStep value={value} change={change} />][step]
  return <><WizardHeader step={step} back={() => step > 0 ? setStep(step - 1) : onHome()} /><div className="wizard-body">{content}</div><footer className="wizard-footer"><button className="button ghost" onClick={() => step > 0 ? setStep(step - 1) : onHome()}>{t('Indietro')}</button><button className="button primary" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onReview()}>{t(step === steps.length - 1 ? 'Vai al riepilogo' : 'Continua')}<ArrowRight /></button></footer></>
}

function SummaryRow({ icon, title, children, edit }: { icon: ReactNode; title: string; children: ReactNode; edit: () => void }) {
  const { t } = useI18n()
  return <div className="summary-row"><span className="summary-icon">{icon}</span><div><span>{t(title)}</span>{children}</div><button onClick={edit}>{t('Modifica')}</button></div>
}

function Review({ value, edit, submit, loading, error }: { value: ClaimPayload; edit: (n: number) => void; submit: () => void; loading: boolean; error: string }) {
  const { t, formatDate, locale } = useI18n()
  return <div className="review-page"><div className="review-hero"><span className="form-icon"><ClipboardCheck /></span><span className="eyebrow">{t('RIEPILOGO DENUNCIA')}</span><h1>{t('Controlla prima di inviare')}</h1><p>{t('Verifica i dati: dopo l’invio potrai prenotare subito il perito.')}</p></div><div className="summary-card"><SummaryRow icon={<MapPin />} title="Incidente" edit={() => edit(0)}><strong>{value.accident.location || t('Luogo non indicato')}</strong><small>{value.accident.occurredAt ? formatDate(value.accident.occurredAt, { dateStyle: 'short', timeStyle: 'short' }) : t('Data non indicata')} · {t('{count} veicoli', { count: value.accident.vehiclesInvolved })}</small></SummaryRow><SummaryRow icon={<CarFront />} title="Veicoli coinvolti" edit={() => edit(1)}><strong>{value.partyA.vehicle.plate || t('Targa A')} · {value.partyB.vehicle.plate || t('Targa B')}</strong><small>{value.partyA.driver.firstName} {value.partyA.driver.lastName} {locale === 'en' ? 'and' : 'e'} {value.partyB.driver.firstName} {value.partyB.driver.lastName}</small></SummaryRow><SummaryRow icon={<PenLine />} title="Dinamica" edit={() => edit(2)}><strong>{t('{count} circostanze selezionate', { count: value.accident.circumstances.length })}</strong><small>{value.accident.description || t('Descrizione non inserita')}</small></SummaryRow><SummaryRow icon={<Camera />} title="Allegati" edit={() => edit(3)}><strong>{t('{count} fotografie', { count: value.photoNames.length })}</strong><small>{value.photoNames.join(', ') || t('Nessun allegato')}</small></SummaryRow></div>{error && <div className="error-banner">{error}</div>}<div className="submit-panel"><div><ShieldCheck /><span><strong>{t('Pronto per l’invio sicuro')}</strong><small>{t('La pratica verrà protocollata e non sarà più modificabile.')}</small></span></div><button className="button primary large" disabled={loading} onClick={submit}>{loading ? <span className="spinner" /> : <Check />} {t(loading ? 'Invio in corso…' : 'Invia la denuncia')}</button></div></div>
}

function Submitted({ claim, book }: { claim: Claim; book: () => void }) {
  const { t } = useI18n()
  return <div className="center-page"><div className="success-ring"><Check /></div><span className="eyebrow">{t('DENUNCIA INVIATA')}</span><h1>{t('Ci pensiamo noi.')}</h1><p>{t('La pratica è stata acquisita correttamente. Ora scegli quando far valutare il veicolo.')}</p><div className="reference-card"><span>{t('NUMERO PRATICA')}</span><strong>{claim.reference}</strong><div><span><CheckCircle2 /> {t('Denuncia acquisita')}</span><span><Clock3 /> {t(claim.priority === 'URGENT' ? 'Triage: urgente' : 'Triage: standard')}</span></div></div><button className="button primary large full" onClick={book}><CalendarDays />{t('Prenota il perito')}<ArrowRight /></button><button className="text-link">{t('Lo farò più tardi')}</button></div>
}

function Booking({ slots, day, setDay, selected, setSelected, confirm, loading }: { slots: Slot[]; day: string; setDay: (v: string) => void; selected?: Slot; setSelected: (s: Slot) => void; confirm: () => void; loading: boolean }) {
  const { t, formatDate } = useI18n()
  const days = Array.from({ length: 4 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toISOString().slice(0, 10) })
  return <div className="booking-page"><div className="booking-title"><span className="form-icon"><CalendarDays /></span><div><span className="eyebrow">{t('PRENOTAZIONE')}</span><h1>{t('Scegli il momento migliore')}</h1><p>{t('Tutti i periti mostrati sono disponibili per la tua zona.')}</p></div></div><div className="date-strip">{days.map(d => { const date = new Date(`${d}T12:00`); return <button className={day === d ? 'active' : ''} key={d} onClick={() => setDay(d)}><span>{formatDate(date, { weekday: 'short' })}</span><strong>{date.getDate()}</strong><small>{formatDate(date, { month: 'short' })}</small></button> })}</div><div className="slot-list">{slots.map(slot => <button key={`${slot.adjusterId}-${slot.startsAt}`} className={selected?.startsAt === slot.startsAt ? 'selected' : ''} onClick={() => setSelected(slot)}><div className="adjuster-avatar">{slot.adjusterName.split(' ').map(x => x[0]).join('')}</div><div><strong>{slot.adjusterName}</strong><span>{t(slot.specialty)}</span><small><Star /> {slot.rating} · {t(slot.address)}</small></div><time>{formatDate(slot.startsAt, { hour: '2-digit', minute: '2-digit' })}</time><i>{selected?.startsAt === slot.startsAt && <Check />}</i></button>)}</div><div className="booking-footer"><div>{selected ? <><Clock3 /><span><small>{t('APPUNTAMENTO SCELTO')}</small><strong>{formatDate(selected.startsAt, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</strong></span></> : <span>{t('Seleziona uno slot disponibile')}</span>}</div><button className="button primary" disabled={!selected || loading} onClick={confirm}>{t(loading ? 'Conferma…' : 'Conferma appuntamento')}<ArrowRight /></button></div></div>
}

function Success({ claim, home }: { claim: Claim; home: () => void }) {
  const { t, formatDate } = useI18n()
  const a = claim.appointment!
  return <div className="center-page final"><div className="success-ring calendar"><CalendarDays /></div><span className="eyebrow">{t('TUTTO FATTO')}</span><h1>{t('Appuntamento confermato')}</h1><p>{t('Riceverai un promemoria prima dell’incontro con il perito.')}</p><div className="appointment-ticket"><div><span>{formatDate(a.startsAt, { weekday: 'long' })}</span><strong>{new Date(a.startsAt).getDate()}</strong><small>{formatDate(a.startsAt, { month: 'long' })}</small></div><div><span>{t('PERITO')}</span><strong>{a.adjusterName}</strong><small><Clock3 /> {formatDate(a.startsAt, { hour: '2-digit', minute: '2-digit' })}</small><small><MapPin /> {t(a.address)}</small></div></div><button className="button primary large full" onClick={home}>{t('Torna alla panoramica')}</button><span className="event-note"><Sparkles /> {t('Evento')} <code>AppointmentBooked</code> {t('pubblicato su Kafka')}</span></div>
}

export default function App() {
  const { t, locale, formatDate } = useI18n()
  const [screen, setScreen] = useState<Screen>('home')
  const [step, setStep] = useState(0)
  const [payload, setPayload] = useState<ClaimPayload>(initialClaim)
  const [claim, setClaim] = useState<Claim>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [day, setDay] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) })
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState<Slot>()
  const active = screen === 'home' ? 'home' : 'claims'
  const showShell = screen === 'home'
  const dateLabel = useMemo(() => formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' }), [formatDate, locale])

  useEffect(() => { if (screen === 'booking') getSlots(day).then(setSlots) }, [screen, day])

  const home = () => { setScreen('home'); setError('') }
  const start = () => { setPayload(initialClaim()); setStep(0); setScreen('wizard') }
  const demo = () => { setPayload(demoClaim(locale)); setStep(0); setScreen('wizard') }
  const review = async () => { setLoading(true); setError(''); const saved = await saveClaim(payload, claim?.id); setClaim(saved); setLoading(false); setScreen('review') }
  const send = async () => { if (!claim) return; setLoading(true); setError(''); try { const sent = await submitClaim(claim.id); setClaim(sent); setScreen('submitted') } catch (e) { setError(e instanceof Error ? e.message : 'Controlla i dati inseriti') } finally { setLoading(false) } }
  const confirm = async () => { if (!claim || !selected) return; setLoading(true); const booked = await bookAppointment(claim, selected); setClaim(booked); setLoading(false); setScreen('success') }

  return <div className={`app ${showShell ? 'shell' : 'flow'}`}>
    {showShell && <Sidebar active={active} onHome={home} />}
    <div className="main-area">
      {showShell ? <Header onHome={home} /> : <Header onHome={home} back={screen === 'wizard' ? undefined : () => screen === 'review' ? setScreen('wizard') : home()} />}
      {screen === 'home' && <><div className="mobile-date">{dateLabel}</div><HomeScreen start={start} /><button className="demo-fab" onClick={demo}><Sparkles /> {t('Precompila demo')}</button></>}
      {screen === 'wizard' && <Wizard value={payload} change={setPayload} step={step} setStep={setStep} onReview={review} onHome={home} />}
      {screen === 'review' && <Review value={payload} loading={loading} error={error} edit={n => { setStep(n); setScreen('wizard') }} submit={send} />}
      {screen === 'submitted' && claim && <Submitted claim={claim} book={() => setScreen('booking')} />}
      {screen === 'booking' && <Booking slots={slots} day={day} setDay={setDay} selected={selected} setSelected={setSelected} confirm={confirm} loading={loading} />}
      {screen === 'success' && claim?.appointment && <Success claim={claim} home={home} />}
    </div>
  </div>
}
