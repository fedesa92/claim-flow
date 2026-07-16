import type { Claim, ClaimPayload, Slot } from '../types'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const wait = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))

const demoSlot = (day: string, hour: number, adjusterId: string, adjusterName: string, specialty: string, rating: number, address: string): Slot => ({
  adjusterId, adjusterName, specialty, rating, address, startsAt: new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`).toISOString()
})

function localClaim(payload: ClaimPayload): Claim {
  const existing = localStorage.getItem('claimflow-claim')
  const base = existing ? JSON.parse(existing) as Claim : undefined
  const claim: Claim = { ...payload, id: base?.id ?? crypto.randomUUID().replaceAll('-', '').slice(0, 24), reference: base?.reference ?? `CF-${new Date().getFullYear()}-7K2M9Q`, status: 'READY', priority: 'STANDARD' }
  localStorage.setItem('claimflow-claim', JSON.stringify(claim))
  return claim
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Servizio non disponibile' }))
    throw new Error(error.message)
  }
  return response.json()
}

export async function saveClaim(payload: ClaimPayload, id?: string): Promise<Claim> {
  try { return await request<Claim>(id ? `/claims/${id}` : '/claims', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }) }
  catch { await wait(); return localClaim(payload) }
}

export async function submitClaim(id: string): Promise<Claim> {
  try { return await request<Claim>(`/claims/${id}/submit`, { method: 'POST' }) }
  catch {
    await wait(); const claim = JSON.parse(localStorage.getItem('claimflow-claim') ?? '{}') as Claim
    const submitted = { ...claim, status: 'SUBMITTED' as const }
    localStorage.setItem('claimflow-claim', JSON.stringify(submitted)); return submitted
  }
}

export async function getSlots(day: string): Promise<Slot[]> {
  try { return await request<Slot[]>(`/adjusters/slots?date=${day}`) }
  catch {
    await wait(200)
    return [
      demoSlot(day, 9, 'adj-rossi', 'Elena Rossi', 'Carrozzeria e danni materiali', 4.9, 'Via Savona 19/A, Milano'),
      demoSlot(day, 11, 'adj-conti', 'Marco Conti', 'Ricostruzione dinamica', 4.8, 'Via Savona 19/A, Milano'),
      demoSlot(day, 14, 'adj-gallo', 'Sara Gallo', 'Valutazione da remoto', 4.7, 'Video perizia'),
      demoSlot(day, 16, 'adj-rossi', 'Elena Rossi', 'Carrozzeria e danni materiali', 4.9, 'Via Savona 19/A, Milano')
    ]
  }
}

export async function bookAppointment(claim: Claim, slot: Slot): Promise<Claim> {
  try { return await request<Claim>(`/claims/${claim.id}/appointments`, { method: 'POST', body: JSON.stringify({ adjusterId: slot.adjusterId, startsAt: slot.startsAt, mode: slot.address === 'Video perizia' ? 'REMOTE' : 'ONSITE' }) }) }
  catch {
    await wait(); const booked: Claim = { ...claim, status: 'APPOINTMENT_BOOKED', appointment: { adjusterId: slot.adjusterId, adjusterName: slot.adjusterName, startsAt: slot.startsAt, mode: slot.address === 'Video perizia' ? 'REMOTE' : 'ONSITE', address: slot.address } }
    localStorage.setItem('claimflow-claim', JSON.stringify(booked)); return booked
  }
}
