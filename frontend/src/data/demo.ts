import type { ClaimPayload } from '../types'

export const circumstances = [
  'Procedeva nello stesso senso', 'Cambiava corsia', 'Svoltava a destra', 'Svoltava a sinistra',
  'Usciva da un parcheggio', 'Entrava in una rotatoria', 'Era fermo', 'Tamponava il veicolo davanti'
]

export const demoClaim = (locale: 'it' | 'en' = 'it'): ClaimPayload => ({
  accident: {
    occurredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16),
    location: 'Corso Castelfidardo 22, Torino',
    description: locale === 'en'
      ? 'Vehicle B changed lanes and hit the left rear side of vehicle A. Both vehicles stopped safely.'
      : 'Il veicolo B cambiava corsia e urtava la fiancata posteriore sinistra del veicolo A. Entrambi i veicoli si arrestavano in sicurezza.',
    circumstances: ['Procedeva nello stesso senso', 'Cambiava corsia'], injuries: false, vehiclesInvolved: 2
  },
  partyA: {
    driver: { firstName: 'Luca', lastName: 'Bianchi', phone: '+39 333 123 4567', email: 'luca.bianchi@example.it' },
    vehicle: { plate: 'GF 482 NX', brand: 'Fiat', model: '500e', insurer: 'Aurora Assicurazioni', policyNumber: 'AUTO-294018' }
  },
  partyB: {
    driver: { firstName: 'Giulia', lastName: 'Romano', phone: '+39 334 987 6543', email: 'giulia.romano@example.it' },
    vehicle: { plate: 'FT 731 LM', brand: 'Toyota', model: 'Yaris', insurer: 'Nova Protezione', policyNumber: 'NP-882913' }
  },
  photoNames: ['fiancata-a.jpg', 'anteriore-b.jpg', 'panoramica.jpg'], signatureConfirmed: true
})
