package it.claimflow.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import io.quarkus.mongodb.panache.common.MongoEntity
import org.bson.types.ObjectId
import java.time.Instant

enum class ClaimStatus { DRAFT, READY, SUBMITTED, APPOINTMENT_BOOKED }

data class Person(
    var firstName: String = "",
    var lastName: String = "",
    var phone: String = "",
    var email: String = ""
)

data class Vehicle(
    var plate: String = "",
    var brand: String = "",
    var model: String = "",
    var insurer: String = "",
    var policyNumber: String = ""
)

data class Party(
    var driver: Person = Person(),
    var vehicle: Vehicle = Vehicle()
)

data class AccidentDetails(
    var occurredAt: String = "",
    var location: String = "",
    var description: String = "",
    var circumstances: List<String> = emptyList(),
    var injuries: Boolean = false,
    var vehiclesInvolved: Int = 2
)

data class Appointment(
    var adjusterId: String = "",
    var adjusterName: String = "",
    var startsAt: String = "",
    var mode: String = "ONSITE",
    var address: String = ""
)

@MongoEntity(collection = "claims")
class ClaimEntity {
    var id: ObjectId? = null
    var reference: String = ""
    var status: ClaimStatus = ClaimStatus.DRAFT
    var accident: AccidentDetails = AccidentDetails()
    var partyA: Party = Party()
    var partyB: Party = Party()
    var photoNames: List<String> = emptyList()
    var signatureConfirmed: Boolean = false
    var priority: String = "STANDARD"
    var appointment: Appointment? = null
    var createdAt: Instant = Instant.now()
    var updatedAt: Instant = Instant.now()

    @get:JsonIgnore
    val objectId: ObjectId? get() = id
}

data class ClaimPayload(
    val accident: AccidentDetails = AccidentDetails(),
    val partyA: Party = Party(),
    val partyB: Party = Party(),
    val photoNames: List<String> = emptyList(),
    val signatureConfirmed: Boolean = false
)

data class AppointmentRequest(
    val adjusterId: String = "",
    val startsAt: String = "",
    val mode: String = "ONSITE"
)

data class AdjusterSlot(
    val adjusterId: String,
    val adjusterName: String,
    val specialty: String,
    val rating: Double,
    val startsAt: String,
    val address: String
)

data class ClaimEvent(
    val eventId: String,
    val type: String,
    val claimId: String,
    val reference: String,
    val occurredAt: Instant,
    val data: Map<String, String> = emptyMap()
)
