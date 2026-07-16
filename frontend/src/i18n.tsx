import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'it' | 'en'

const en: Record<string, string> = {
  'Salvataggio automatico': 'Autosave enabled',
  'Indietro': 'Back', 'Menu': 'Menu', 'Profilo': 'Profile',
  'Panoramica': 'Overview', 'Le mie pratiche': 'My claims', 'Appuntamenti': 'Appointments',
  'I tuoi dati sono protetti': 'Your data is protected',
  'Crittografia end-to-end e gestione conforme al GDPR.': 'End-to-end encryption and GDPR-compliant data management.',
  'Polizza Auto · Attiva': 'Motor policy · Active',
  'BUONGIORNO, LUCA': 'GOOD MORNING, LUCA', 'Come possiamo aiutarti?': 'How can we help?',
  'Gestisci un sinistro in pochi minuti, senza carta e senza attese.': 'Handle a claim in minutes, without paperwork or waiting.',
  'Denuncia un sinistro': 'Report an accident', 'Compila il modulo digitale guidato': 'Complete the guided digital form',
  'Consulta una pratica': 'View a claim', 'Segui stato e aggiornamenti': 'Track status and updates',
  'I tuoi appuntamenti': 'Your appointments', 'Visualizza o modifica una prenotazione': 'View or change a booking',
  'IN EVIDENZA': 'FEATURED', 'La tua protezione, sempre con te': 'Your protection, always with you', 'Scopri di più': 'Learn more',
  'GUIDA RAPIDA': 'QUICK GUIDE', 'Cosa fare subito dopo un incidente?': 'What should you do right after an accident?',
  'Metti tutti in sicurezza, documenta la scena e raccogli i dati. Con ClaimFlow puoi fare tutto dal telefono.': 'Keep everyone safe, document the scene, and collect the details. ClaimFlow lets you do it all from your phone.',
  'Leggi la guida': 'Read the guide', 'Precompila demo': 'Prefill demo',
  'Incidente': 'Accident', 'Veicoli': 'Vehicles', 'Dinamica': 'Dynamics', 'Allegati': 'Evidence', 'Conferma': 'Confirm',
  'PASSAGGIO {current} DI {total}': 'STEP {current} OF {total}',
  'Partiamo dall’incidente': 'Let’s start with the accident',
  'Inserisci quando e dove è successo. Potrai modificare tutto prima dell’invio.': 'Tell us when and where it happened. You can edit everything before submitting.',
  'Data e ora': 'Date and time', 'Veicoli coinvolti': 'Vehicles involved', '2 veicoli': '2 vehicles', '3 veicoli': '3 vehicles', '4 o più': '4 or more',
  'Luogo dell’incidente': 'Accident location', 'Via, numero civico, città': 'Street, number, city', 'Ci sono feriti?': 'Was anyone injured?',
  'No': 'No', 'Sì': 'Yes', 'Prima la sicurezza.': 'Safety first.',
  'Se ci sono feriti chiama subito il 112. Questa demo non sostituisce i servizi di emergenza.': 'If anyone is injured, call 112 immediately. This demo does not replace emergency services.',
  'Chi era coinvolto?': 'Who was involved?', 'Aggiungi i dati dei due veicoli. Abbiamo separato le parti per ridurre gli errori.': 'Add both vehicles. The parties are separated to reduce errors.',
  'Il tuo veicolo': 'Your vehicle', 'L’altro veicolo': 'The other vehicle', 'Dati del conducente e del veicolo': 'Driver and vehicle details',
  'Conducente': 'Driver', 'Nome': 'First name', 'Cognome': 'Last name', 'Telefono': 'Phone', 'Email': 'Email',
  'Veicolo e polizza': 'Vehicle and policy', 'Targa': 'License plate', 'Marca e modello': 'Make and model', 'Marca': 'Make', 'Modello': 'Model',
  'Compagnia': 'Insurance company', 'Numero polizza': 'Policy number',
  'Raccontaci la dinamica': 'Tell us what happened', 'Seleziona le circostanze applicabili e descrivi l’accaduto con parole semplici.': 'Select the relevant circumstances and describe the accident in plain language.',
  'Quali situazioni descrivono l’incidente?': 'Which situations describe the accident?',
  'Procedeva nello stesso senso': 'Travelling in the same direction', 'Cambiava corsia': 'Changing lanes', 'Svoltava a destra': 'Turning right', 'Svoltava a sinistra': 'Turning left',
  'Usciva da un parcheggio': 'Leaving a parking space', 'Entrava in una rotatoria': 'Entering a roundabout', 'Era fermo': 'Stationary', 'Tamponava il veicolo davanti': 'Rear-ended the vehicle ahead',
  'Descrizione dell’accaduto': 'Accident description', '{count}/500 caratteri': '{count}/500 characters',
  'Descrivi direzione, manovra e punto d’urto…': 'Describe direction, manoeuvre, and point of impact…',
  'Validazione intelligente': 'Smart validation', 'Le regole di triage useranno dinamica, numero di veicoli e presenza di feriti per assegnare la priorità.': 'Triage rules use accident dynamics, vehicle count, and injuries to determine priority.',
  'Aggiungi le prove': 'Add evidence', 'Fotografa danni, targhe e una panoramica della scena. Nella demo salviamo solo i nomi dei file.': 'Photograph damage, plates, and the overall scene. The demo stores file names only.',
  'Scatta o carica una foto': 'Take or upload a photo', 'JPG o PNG · massimo 6 immagini': 'JPG or PNG · up to 6 images', 'Scegli immagini': 'Choose images', 'Rimuovi foto': 'Remove photo',
  'Foto consigliate': 'Recommended photos', 'Danni ai veicoli': 'Vehicle damage', 'Scena completa': 'Full scene', 'Targhe e documenti': 'Plates and documents',
  'Ultima conferma': 'Final confirmation', 'Leggi con attenzione. Prima dell’invio vedrai ancora un riepilogo completo.': 'Please review carefully. You will see a full summary before submitting.',
  'Firma dimostrativa': 'Demo signature', 'Confermo la correttezza dei dati': 'I confirm that the details are correct',
  'Dichiaro che le informazioni inserite corrispondono a quanto avvenuto.': 'I declare that the information provided accurately describes what happened.',
  'Questa è una demo tecnica e non costituisce un modulo CAI/CID con validità legale. Non inserire dati personali reali.': 'This is a technical demo and not a legally valid CAI/CID form. Do not enter real personal data.',
  'Continua': 'Continue', 'Vai al riepilogo': 'Review claim',
  'RIEPILOGO DENUNCIA': 'CLAIM SUMMARY', 'Controlla prima di inviare': 'Review before submitting',
  'Verifica i dati: dopo l’invio potrai prenotare subito il perito.': 'Check the details. After submitting, you can immediately book a loss adjuster.',
  'Luogo non indicato': 'Location not provided', 'Data non indicata': 'Date not provided', '{count} veicoli': '{count} vehicles',
  'Targa A': 'Plate A', 'Targa B': 'Plate B',
  '{count} circostanze selezionate': '{count} circumstances selected', 'Descrizione non inserita': 'No description provided',
  '{count} fotografie': '{count} photos', 'Nessun allegato': 'No attachments', 'Modifica': 'Edit',
  'Pronto per l’invio sicuro': 'Ready for secure submission', 'La pratica verrà protocollata e non sarà più modificabile.': 'The claim will be registered and can no longer be edited.',
  'Invio in corso…': 'Submitting…', 'Invia la denuncia': 'Submit claim',
  'DENUNCIA INVIATA': 'CLAIM SUBMITTED', 'Ci pensiamo noi.': 'We’ll take it from here.',
  'La pratica è stata acquisita correttamente. Ora scegli quando far valutare il veicolo.': 'Your claim has been received. Now choose when to have the vehicle assessed.',
  'NUMERO PRATICA': 'CLAIM REFERENCE', 'Denuncia acquisita': 'Claim received', 'Triage: urgente': 'Triage: urgent', 'Triage: standard': 'Triage: standard',
  'Prenota il perito': 'Book a loss adjuster', 'Lo farò più tardi': 'I’ll do it later',
  'PRENOTAZIONE': 'BOOKING', 'Scegli il momento migliore': 'Choose the best time', 'Tutti i periti mostrati sono disponibili per la tua zona.': 'All listed loss adjusters are available in your area.',
  'Seleziona uno slot disponibile': 'Select an available time', 'APPUNTAMENTO SCELTO': 'SELECTED APPOINTMENT', 'Conferma…': 'Confirming…', 'Conferma appuntamento': 'Confirm appointment',
  'TUTTO FATTO': 'ALL DONE', 'Appuntamento confermato': 'Appointment confirmed', 'Riceverai un promemoria prima dell’incontro con il perito.': 'You will receive a reminder before meeting the loss adjuster.',
  'PERITO': 'LOSS ADJUSTER', 'Torna alla panoramica': 'Back to overview', 'Evento': 'Event', 'pubblicato su Kafka': 'published to Kafka',
  'Carrozzeria e danni materiali': 'Bodywork and material damage', 'Ricostruzione dinamica': 'Accident reconstruction', 'Valutazione da remoto': 'Remote assessment',
  'Via Savona 19/A, Milano': '19/A Via Savona, Milan', 'Video perizia': 'Video assessment'
}

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('claimflow-locale') === 'en' ? 'en' : 'it')
  useEffect(() => {
    localStorage.setItem('claimflow-locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    t: (key, vars = {}) => {
      let value = locale === 'en' ? (en[key] ?? key) : key
      Object.entries(vars).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, String(replacement)) })
      return value
    },
    formatDate: (value, options) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'it-IT', options).format(new Date(value))
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
