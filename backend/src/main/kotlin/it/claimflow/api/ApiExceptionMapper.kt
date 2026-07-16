package it.claimflow.api

import jakarta.ws.rs.WebApplicationException
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.ext.ExceptionMapper
import jakarta.ws.rs.ext.Provider
import java.time.Instant

@Provider
class ApiExceptionMapper : ExceptionMapper<WebApplicationException> {
    override fun toResponse(exception: WebApplicationException): Response = Response
        .status(exception.response.status)
        .entity(mapOf("message" to (exception.message ?: "Richiesta non valida"), "timestamp" to Instant.now().toString()))
        .build()
}
