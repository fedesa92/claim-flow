package it.claimflow.service

import io.smallrye.reactive.messaging.MutinyEmitter
import it.claimflow.domain.*
import jakarta.enterprise.context.ApplicationScoped
import jakarta.ws.rs.BadRequestException
import jakarta.ws.rs.NotFoundException
import org.eclipse.microprofile.reactive.messaging.Channel
import org.bson.types.ObjectId
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneOffset
import java.util.UUID

@ApplicationScoped
class ClaimService(
    private val repository: ClaimRepository,
    @param:Channel("claim-events") private val events: MutinyEmitter<ClaimEvent>
) {
    fun list(): List<ClaimEntity> = repository.listAll().sortedByDescending { it.updatedAt }

    fun get(id: String): ClaimEntity = repository.findById(validId(id)) ?: throw NotFoundException("Pratica non trovata")

    fun create(payload: ClaimPayload): ClaimEntity {
        val claim = ClaimEntity().apply {
            reference = "CF-${LocalDate.now().year}-${UUID.randomUUID().toString().take(6).uppercase()}"
            applyPayload(payload)
        }
        repository.persist(claim)
        return claim
    }

    fun update(id: String, payload: ClaimPayload): ClaimEntity {
        val claim = get(id)
        if (claim.status != ClaimStatus.DRAFT && claim.status != ClaimStatus.READY) {
            throw BadRequestException("Una pratica inviata non può essere modificata")
        }
        claim.applyPayload(payload)
        claim.updatedAt = Instant.now()
        repository.update(claim)
        return claim
    }

    fun submit(id: String): ClaimEntity {
        val claim = get(id)
        val missing = validate(claim)
        if (missing.isNotEmpty()) throw BadRequestException("Campi mancanti: ${missing.joinToString()}")
        claim.priority = if (claim.accident.injuries || claim.accident.vehiclesInvolved > 2) "URGENT" else "STANDARD"
        claim.status = ClaimStatus.SUBMITTED
        claim.updatedAt = Instant.now()
        repository.update(claim)
        publish("ClaimSubmitted", claim, mapOf("priority" to claim.priority))
        return claim
    }

    fun slots(date: LocalDate): List<AdjusterSlot> {
        val adjusters = listOf(
            Triple("adj-rossi", "Elena Rossi", "Carrozzeria e danni materiali"),
            Triple("adj-conti", "Marco Conti", "Ricostruzione dinamica"),
            Triple("adj-gallo", "Sara Gallo", "Valutazione da remoto")
        )
        return adjusters.flatMapIndexed { index, adjuster ->
            listOf(9, 11, 14, 16).drop(index % 2).take(3).map { hour ->
                AdjusterSlot(
                    adjusterId = adjuster.first,
                    adjusterName = adjuster.second,
                    specialty = adjuster.third,
                    rating = 4.9 - index * 0.1,
                    startsAt = LocalDateTime.of(date, LocalTime.of(hour, 0)).toInstant(ZoneOffset.UTC).toString(),
                    address = if (index == 2) "Video perizia" else "Via Savona 19/A, Milano"
                )
            }
        }
    }

    fun book(id: String, request: AppointmentRequest): ClaimEntity {
        val claim = get(id)
        if (claim.status != ClaimStatus.SUBMITTED) throw BadRequestException("Invia prima la denuncia")
        val adjuster = slots(Instant.parse(request.startsAt).atZone(ZoneOffset.UTC).toLocalDate())
            .firstOrNull { it.adjusterId == request.adjusterId && it.startsAt == request.startsAt }
            ?: throw BadRequestException("Slot non disponibile")
        claim.appointment = Appointment(adjuster.adjusterId, adjuster.adjusterName, adjuster.startsAt, request.mode, adjuster.address)
        claim.status = ClaimStatus.APPOINTMENT_BOOKED
        claim.updatedAt = Instant.now()
        repository.update(claim)
        publish("AppointmentBooked", claim, mapOf("adjusterId" to adjuster.adjusterId, "startsAt" to adjuster.startsAt))
        return claim
    }

    private fun ClaimEntity.applyPayload(payload: ClaimPayload) {
        accident = payload.accident
        partyA = payload.partyA
        partyB = payload.partyB
        photoNames = payload.photoNames
        signatureConfirmed = payload.signatureConfirmed
        status = if (validate(this).isEmpty()) ClaimStatus.READY else ClaimStatus.DRAFT
    }

    private fun validate(claim: ClaimEntity): List<String> = buildList {
        if (claim.accident.occurredAt.isBlank()) add("data e ora")
        if (claim.accident.location.isBlank()) add("luogo")
        if (claim.accident.description.isBlank()) add("dinamica")
        if (claim.partyA.driver.firstName.isBlank()) add("conducente A")
        if (claim.partyA.vehicle.plate.isBlank()) add("targa A")
        if (claim.partyB.driver.firstName.isBlank()) add("conducente B")
        if (claim.partyB.vehicle.plate.isBlank()) add("targa B")
        if (!claim.signatureConfirmed) add("conferma firma")
    }

    private fun publish(type: String, claim: ClaimEntity, data: Map<String, String>) {
        events.sendAndForget(ClaimEvent(UUID.randomUUID().toString(), type, claim.id.toString(), claim.reference, Instant.now(), data))
    }

    private fun validId(id: String) = try { ObjectId(id) } catch (_: IllegalArgumentException) { throw NotFoundException("Identificativo non valido") }
}
