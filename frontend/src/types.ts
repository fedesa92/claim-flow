export type Person = { firstName: string; lastName: string; phone: string; email: string }
export type Vehicle = { plate: string; brand: string; model: string; insurer: string; policyNumber: string }
export type Party = { driver: Person; vehicle: Vehicle }
export type Accident = {
  occurredAt: string; location: string; description: string; circumstances: string[]; injuries: boolean; vehiclesInvolved: number
}
export type ClaimPayload = {
  accident: Accident; partyA: Party; partyB: Party; photoNames: string[]; signatureConfirmed: boolean
}
export type Appointment = { adjusterId: string; adjusterName: string; startsAt: string; mode: string; address: string }
export type Claim = ClaimPayload & {
  id: string; reference: string; status: 'DRAFT' | 'READY' | 'SUBMITTED' | 'APPOINTMENT_BOOKED'; priority: string; appointment?: Appointment
}
export type Slot = {
  adjusterId: string; adjusterName: string; specialty: string; rating: number; startsAt: string; address: string
}

export const emptyParty = (): Party => ({
  driver: { firstName: '', lastName: '', phone: '', email: '' },
  vehicle: { plate: '', brand: '', model: '', insurer: '', policyNumber: '' }
})

export const initialClaim = (): ClaimPayload => ({
  accident: { occurredAt: '', location: '', description: '', circumstances: [], injuries: false, vehiclesInvolved: 2 },
  partyA: emptyParty(), partyB: emptyParty(), photoNames: [], signatureConfirmed: false
})
