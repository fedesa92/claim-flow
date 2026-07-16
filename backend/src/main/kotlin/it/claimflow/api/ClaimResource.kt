package it.claimflow.api

import it.claimflow.domain.*
import it.claimflow.service.ClaimService
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import java.net.URI
import java.time.LocalDate

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class ClaimResource(private val service: ClaimService) {
    @GET @Path("/health") fun health() = mapOf("status" to "UP", "service" to "claimflow-api")

    @GET @Path("/claims") fun list() = service.list()

    @GET @Path("/claims/{id}") fun get(@PathParam("id") id: String) = service.get(id)

    @POST @Path("/claims")
    fun create(@Valid payload: ClaimPayload): Response {
        val created = service.create(payload)
        return Response.created(URI.create("/api/claims/${created.id}")).entity(created).build()
    }

    @PUT @Path("/claims/{id}") fun update(@PathParam("id") id: String, @Valid payload: ClaimPayload) = service.update(id, payload)

    @POST @Path("/claims/{id}/submit") fun submit(@PathParam("id") id: String) = service.submit(id)

    @GET @Path("/adjusters/slots")
    fun slots(@QueryParam("date") date: String?): List<AdjusterSlot> = service.slots(date?.let(LocalDate::parse) ?: LocalDate.now().plusDays(1))

    @POST @Path("/claims/{id}/appointments")
    fun book(@PathParam("id") id: String, request: AppointmentRequest) = service.book(id, request)
}
